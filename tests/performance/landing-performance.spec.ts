import { test, expect, Page } from '@playwright/test';

type NavigationMetrics = {
  label: string;
  ttfb: number | null;
  domContentLoaded: number | null;
  load: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  fid: number | null;
  longTasks: Array<{ startTime: number; duration: number }>;
};

type ResourceEntry = {
  name: string;
  initiatorType: string;
  transferSize: number | null;
  decodedBodySize: number | null;
  duration: number;
};

async function setupPerformanceObservers(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as Record<string, any>).__perfMetrics = {
      lcp: null,
      cls: 0,
      fid: null,
      longTasks: [] as Array<{ startTime: number; duration: number }>,
    };

    const metrics = (window as unknown as Record<string, any>).__perfMetrics;

    const safeObserve = <K extends keyof PerformanceObserverInit>(
      options: PerformanceObserverInit & { type: K },
      callback: PerformanceObserverCallback
    ) => {
      try {
        const observer = new PerformanceObserver(callback);
        observer.observe(options);
        return observer;
      } catch (error) {
        console.warn(`${options.type} observer failed`, error);
        return null;
      }
    };

    safeObserve({ type: 'largest-contentful-paint', buffered: true }, entryList => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metrics.lcp = lastEntry.startTime;
      }
    });

    safeObserve({ type: 'layout-shift', buffered: true }, entryList => {
      for (const entry of entryList.getEntries() as Array<{ value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) {
          metrics.cls += entry.value;
        }
      }
    });

    safeObserve({ type: 'first-input', buffered: true }, entryList => {
      const firstInput = entryList.getEntries()[0] as { processingStart: number; startTime: number } | undefined;
      if (firstInput && metrics.fid === null) {
        metrics.fid = firstInput.processingStart - firstInput.startTime;
      }
    });

    safeObserve({ type: 'longtask', buffered: true }, entryList => {
      for (const entry of entryList.getEntries()) {
        metrics.longTasks.push({
          startTime: entry.startTime,
          duration: entry.duration,
        });
      }
    });
  });
}

async function emulateFast3G(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: Math.round((1.6 * 1024 * 1024) / 8),
    uploadThroughput: Math.round((750 * 1024) / 8),
  });
  return client;
}

async function collectNavigationMetrics(page: Page, label: string): Promise<NavigationMetrics> {
  const navigationTiming = await page.evaluate(() => {
    const navEntries = performance.getEntriesByType('navigation');
    const navigation = navEntries[navEntries.length - 1] as PerformanceNavigationTiming | undefined;

    if (!navigation) {
      return null;
    }

    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');

    return {
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      load: navigation.loadEventEnd - navigation.startTime,
      domInteractive: navigation.domInteractive - navigation.startTime,
      fcp: fcpEntry?.startTime ?? null,
    };
  });

  const vitals = await page.evaluate(() => {
    const metrics = (window as unknown as Record<string, any>).__perfMetrics;
    return metrics || {
      lcp: null,
      cls: null,
      fid: null,
      longTasks: [],
    };
  });

  return {
    label,
    ttfb: navigationTiming?.ttfb ?? null,
    domContentLoaded: navigationTiming?.domContentLoaded ?? null,
    load: navigationTiming?.load ?? null,
    fcp: navigationTiming?.fcp ?? null,
    lcp: vitals?.lcp ?? null,
    cls: vitals?.cls ?? null,
    fid: vitals?.fid ?? null,
    longTasks: vitals?.longTasks ?? [],
  };
}

function computeApproximateTTI(metrics: NavigationMetrics, domInteractive: number | null) {
  const lastLongTaskEnd = metrics.longTasks.reduce((max, task) => Math.max(max, task.startTime + task.duration), 0);
  const baseInteractive = domInteractive ?? metrics.load ?? 0;
  const tti = Math.max(baseInteractive, lastLongTaskEnd);
  return {
    tti,
    lastLongTaskEnd,
  };
}

test.describe('Landing page performance baseline', () => {
  test('collects Core Web Vitals and resource timings', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Metrics rely on Chrome DevTools protocol');

    await setupPerformanceObservers(page);
    const client = await emulateFast3G(page);

    try {
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

      // Trigger a real input event to capture FID
      await page.mouse.move(150, 150);
      await page.mouse.down();
      await page.mouse.up();

      await page.waitForSelector('text=診断を開始する', { timeout: 10000 });

      const navigationMetrics = await collectNavigationMetrics(page, 'landing');
      const domInteractive = await page.evaluate(() => {
        const navEntries = performance.getEntriesByType('navigation');
        const navigation = navEntries[navEntries.length - 1] as PerformanceNavigationTiming | undefined;
        if (!navigation) return null;
        return navigation.domInteractive - navigation.startTime;
      });

      const resourceEntries = await page.evaluate(() => {
        return performance
          .getEntriesByType('resource')
          .map(entry => ({
            name: entry.name,
            initiatorType: (entry as PerformanceResourceTiming).initiatorType,
            transferSize: 'transferSize' in entry ? (entry as PerformanceResourceTiming).transferSize : null,
            decodedBodySize: 'decodedBodySize' in entry ? (entry as PerformanceResourceTiming).decodedBodySize : null,
            duration: entry.duration,
          }));
      });

      const ttiInfo = computeApproximateTTI(navigationMetrics, domInteractive);

      const totalTransfer = resourceEntries.reduce((sum, entry) => sum + (entry.transferSize ?? 0), 0);

      const groupTotals = resourceEntries.reduce<Record<string, { count: number; transfer: number; duration: number }>>((acc, entry) => {
        const key = entry.initiatorType || 'other';
        if (!acc[key]) {
          acc[key] = { count: 0, transfer: 0, duration: 0 };
        }
        acc[key].count += 1;
        acc[key].transfer += entry.transferSize ?? 0;
        acc[key].duration += entry.duration;
        return acc;
      }, {});

      const topResources = [...resourceEntries]
        .sort((a, b) => (b.transferSize ?? 0) - (a.transferSize ?? 0))
        .slice(0, 5);

      const report = {
        navigationMetrics,
        domInteractive,
        tti: ttiInfo.tti,
        lastLongTaskEnd: ttiInfo.lastLongTaskEnd,
        totalTransfer,
        resourceSummary: groupTotals,
        topResources,
      };

      test.info().attach('landing-performance.json', {
        body: JSON.stringify(report, null, 2),
        contentType: 'application/json',
      });

      expect(navigationMetrics.lcp ?? Infinity).toBeLessThan(5000);
      expect((navigationMetrics.cls ?? 0)).toBeLessThan(0.25);
    } finally {
      try {
        await client.detach();
      } catch (error) {
        // ignore detach failures for teardown
      }
    }
  });
});
