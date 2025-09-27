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

type ApiTiming = Awaited<ReturnType<import('@playwright/test').APIResponse['timing']>> | null;

type JourneyMetrics = {
  landing: NavigationMetrics;
  journeyTimings: Record<string, number>;
  apiMetrics: {
    fortuneCalcV2?: {
      status: number;
      duration: number;
      timing: ApiTiming;
    };
  };
  aiChat: Array<{
    latency: number | null;
    duration: number;
  }>;
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

    try {
      const lcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          metrics.lcp = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      console.warn('LCP observer failed', error);
    }

    try {
      const clsObserver = new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries() as Array<{ value: number; hadRecentInput: boolean }>) {
          if (!entry.hadRecentInput) {
            metrics.cls += entry.value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('CLS observer failed', error);
    }

    try {
      const fidObserver = new PerformanceObserver(entryList => {
        const firstInput = entryList.getEntries()[0] as { processingStart: number; startTime: number } | undefined;
        if (firstInput && metrics.fid === null) {
          metrics.fid = firstInput.processingStart - firstInput.startTime;
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.warn('FID observer failed', error);
    }

    try {
      const longTaskObserver = new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries()) {
          metrics.longTasks.push({
            startTime: entry.startTime,
            duration: entry.duration,
          });
        }
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch (error) {
      console.warn('Long task observer failed', error);
    }
  });
}

async function mockAiChat(page: Page) {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    const encoder = new TextEncoder();

    (window as unknown as Record<string, any>).__aiMock = {
      calls: [] as Array<{ latency: number | null; duration: number }>,
    };

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      if (url.includes('/api/ai/chat')) {
        const start = performance.now();
        let firstChunkTime: number | null = null;

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            setTimeout(() => {
              controller.enqueue(
                encoder.encode('data: {"choices":[{"delta":{"content":"こんにちは、COCOSiL AIカウンセラーです。"}}] }\n\n')
              );
              firstChunkTime = performance.now();
            }, 350);

            setTimeout(() => {
              controller.enqueue(
                encoder.encode('data: {"choices":[{"delta":{"content":" ご相談内容をお聞かせください。"}}] }\n\n')
              );
            }, 850);

            setTimeout(() => {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              const end = performance.now();
              (window as unknown as Record<string, any>).__aiMock.calls.push({
                latency: firstChunkTime ? firstChunkTime - start : null,
                duration: end - start,
              });
            }, 1200);
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        });
      }

      if (url.includes('/api/ai/intelligent-summary')) {
        return new Response(
          JSON.stringify({
            summary: {
              keyFindings: ['テストサマリ'],
              recommendedActions: ['フォローアップを検討してください'],
              toneAnalysis: 'balanced',
            },
            metadata: { mocked: true },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return originalFetch(input, init);
    };
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

async function waitForNavigation(page: Page, url: string | RegExp, action: () => Promise<void>) {
  const start = performance.now();
  await Promise.all([
    page.waitForURL(url),
    action(),
  ]);
  return performance.now() - start;
}

test.describe('User journey performance', () => {
  test('collects performance metrics across the full diagnosis flow', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Performance metrics rely on Chrome DevTools protocol');

    await mockAiChat(page);
    await setupPerformanceObservers(page);
    const client = await emulateFast3G(page);

    const journey: JourneyMetrics = {
      landing: {
        label: 'landing',
        ttfb: null,
        domContentLoaded: null,
        load: null,
        fcp: null,
        lcp: null,
        cls: null,
        fid: null,
        longTasks: [],
      },
      journeyTimings: {},
      apiMetrics: {},
      aiChat: [],
    };

    try {
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.waitForSelector('text=診断を開始する', { timeout: 10000 });

      journey.landing = await collectNavigationMetrics(page, 'Landing');

      const toBasic = await waitForNavigation(page, /\/diagnosis$/, () =>
        page.getByRole('button', { name: '診断を開始する' }).click()
      );
      journey.journeyTimings['landing_to_basic_info'] = toBasic;

      await expect(page.getByRole('heading', { name: '基本情報を入力してください' })).toBeVisible();

    await page.getByLabel('お名前（ニックネーム可）').fill('パフォーマンステストユーザー');
    await page.getByLabel('メールアドレス').fill('performance@example.com');

    await page.getByRole('button', { name: '性別を選択してください' }).click();
    await page.getByRole('option', { name: '男性' }).click();

    await page.getByRole('button', { name: '年' }).click();
    await page.getByRole('option', { name: '1995' }).click();

    await page.getByRole('button', { name: '月' }).click();
    await page.getByRole('option', { name: '5月' }).click();

    await page.getByRole('button', { name: '日' }).click();
    await page.getByRole('option', { name: '15' }).click();

    await page.getByLabel('プライバシーポリシーに同意する').check();

    const submitStart = performance.now();
    const [fortuneResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/fortune-calc-v2') && res.request().method() === 'POST'),
      page.getByRole('button', { name: '次へ進む' }).click(),
    ]);
    const submitDuration = performance.now() - submitStart;

    journey.apiMetrics.fortuneCalcV2 = {
      status: fortuneResponse.status(),
      duration: submitDuration,
      timing: await fortuneResponse.timing(),
    };

    await page.waitForURL(/\/diagnosis\/mbti$/);

    await expect(page.getByRole('heading', { name: 'MBTIタイプを教えてください' })).toBeVisible();

    await page.getByRole('button', { name: '選択してください' }).click();
    await page.getByRole('option', { name: 'ENFP（運動家）' }).click();

    const toTaiheki = await waitForNavigation(page, /\/diagnosis\/taiheki$/, () =>
      page.getByRole('button', { name: 'この結果で進む' }).click()
    );
    journey.journeyTimings['mbti_to_taiheki'] = toTaiheki;

    await expect(page.getByRole('heading', { name: '体癖診断方法の選択' })).toBeVisible();

    await page.getByRole('button', { name: 'この方法で進む' }).nth(1).click();

    await expect(page.getByRole('heading', { name: '体癖番号の直接入力' })).toBeVisible();

    await page.locator('button', { hasText: '3種' }).first().click();

    const toResults = await waitForNavigation(page, /\/diagnosis\/results$/, () =>
      page.getByRole('button', { name: '入力完了・次へ進む →' }).click()
    );
    journey.journeyTimings['taiheki_to_results'] = toResults;

    await page.waitForSelector('text=AIカウンセリングを開始', { timeout: 15000 });

    const toChat = await waitForNavigation(page, /\/diagnosis\/chat$/, () =>
      page.getByRole('button', { name: 'AIカウンセリングを開始' }).click()
    );
    journey.journeyTimings['results_to_chat'] = toChat;

    await expect(page.getByRole('heading', { name: '相談内容をお選びください' })).toBeVisible();

    await Promise.all([
      page.waitForFunction(() => (window as unknown as Record<string, any>).__aiMock.calls.length > 0),
      page.getByRole('button', { name: '人間関係の悩み' }).click(),
    ]);

    const firstCall = await page.evaluate(() => {
      const calls = (window as unknown as Record<string, any>).__aiMock.calls;
      return calls[calls.length - 1];
    });
    journey.aiChat.push(firstCall);

      await page.getByRole('textbox').fill('最近のチームコミュニケーションに課題があります。');

      await Promise.all([
        page.waitForFunction(() => (window as unknown as Record<string, any>).__aiMock.calls.length >= 2),
        page.getByRole('button', { name: '送信' }).click(),
      ]);

      const secondCall = await page.evaluate(() => {
        const calls = (window as unknown as Record<string, any>).__aiMock.calls;
        return calls[calls.length - 1];
      });
      journey.aiChat.push(secondCall);

      test.info().attach('journey-metrics.json', {
        body: JSON.stringify(journey, null, 2),
        contentType: 'application/json',
      });

      expect(journey.landing.ttfb ?? 0).toBeLessThan(1500);
      expect(journey.landing.lcp ?? 0).toBeLessThan(4000);
      expect(journey.apiMetrics.fortuneCalcV2?.status).toBe(200);
    } finally {
      try {
        await client.detach();
      } catch (error) {
        // ignore detach failures
      }
    }
  });
});
