import { test, expect } from '@playwright/test';

test.describe('Simplified Overlay Performance Tests', () => {
  test('Export dialog performance measurement', async ({ page }) => {
    // Navigate to results page with existing data
    await page.goto('http://localhost:3000/diagnosis/results');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Measure export dialog open performance
    const dialogOpenStart = Date.now();

    await page.click('button:has-text("診断結果を出力")');

    // Wait for dialog to appear
    await page.waitForSelector('text=診断結果プレビュー', { timeout: 10000 });

    const dialogOpenTime = Date.now() - dialogOpenStart;

    // Verify dialog content loads
    await expect(page.locator('text=診断結果プレビュー')).toBeVisible();

    // Measure dialog close performance
    const closeStart = Date.now();
    await page.click('button:has-text("閉じる")');
    await page.waitForSelector('text=診断結果プレビュー', { state: 'hidden' });
    const closeTime = Date.now() - closeStart;

    // Performance assertions
    expect(dialogOpenTime).toBeLessThan(3000); // Should open within 3 seconds
    expect(closeTime).toBeLessThan(1000); // Should close within 1 second

    console.log(`Export Dialog Performance:
      - Open time: ${dialogOpenTime}ms
      - Close time: ${closeTime}ms`);
  });

  test('Results page load performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000/diagnosis/results');

    // Wait for key content to be visible
    await page.waitForSelector('text=診断完了！');
    await page.waitForSelector('text=ENFP');
    await page.waitForSelector('text=強い意志をもったこじか');

    const loadTime = Date.now() - startTime;

    // Verify all key sections are present
    await expect(page.locator('text=MBTI性格タイプ')).toBeVisible();
    await expect(page.locator('text=体癖タイプ')).toBeVisible();
    await expect(page.locator('text=算命学占い')).toBeVisible();
    await expect(page.locator('text=統合分析')).toBeVisible();

    expect(loadTime).toBeLessThan(5000); // Page should load within 5 seconds

    console.log(`Results Page Performance:
      - Total load time: ${loadTime}ms`);
  });

  test('Chat page navigation performance', async ({ page }) => {
    // Start from results page
    await page.goto('http://localhost:3000/diagnosis/results');
    await page.waitForLoadState('networkidle');

    const navigationStart = Date.now();

    // Navigate to chat page
    await page.goto('http://localhost:3000/diagnosis/chat');

    // Wait for chat interface to load
    await page.waitForSelector('text=AIカウンセリング');
    await page.waitForSelector('[role="textbox"]', { timeout: 10000 });

    const navigationTime = Date.now() - navigationStart;

    // Verify chat interface is functional
    await expect(page.locator('text=AIカウンセリング')).toBeVisible();

    expect(navigationTime).toBeLessThan(4000); // Navigation should complete within 4 seconds

    console.log(`Chat Navigation Performance:
      - Navigation time: ${navigationTime}ms`);
  });

  test('Memory usage during multiple page transitions', async ({ page }) => {
    const pages = [
      'http://localhost:3000/diagnosis/results',
      'http://localhost:3000/diagnosis/chat',
      'http://localhost:3000/diagnosis/results'
    ];

    const timings = [];

    for (let i = 0; i < 3; i++) {
      for (const url of pages) {
        const start = Date.now();
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        const time = Date.now() - start;
        timings.push(time);

        // Brief pause between navigations
        await page.waitForTimeout(100);
      }
    }

    const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
    const maxTime = Math.max(...timings);
    const minTime = Math.min(...timings);

    // Performance assertions
    expect(avgTime).toBeLessThan(3000); // Average under 3 seconds
    expect(maxTime).toBeLessThan(5000); // Max under 5 seconds

    console.log(`Memory Usage Test Results:
      - Average navigation time: ${avgTime.toFixed(0)}ms
      - Min time: ${minTime}ms
      - Max time: ${maxTime}ms
      - All timings: ${timings.map(t => t.toFixed(0)).join('ms, ')}ms`);
  });

  test('Responsive performance across viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const start = Date.now();
      await page.goto('http://localhost:3000/diagnosis/results');
      await page.waitForSelector('text=診断完了！');
      const loadTime = Date.now() - start;

      // Verify layout adapts to viewport
      const header = page.locator('text=COCOSiL');
      await expect(header).toBeVisible();

      expect(loadTime).toBeLessThan(4000);

      console.log(`${viewport.name} (${viewport.width}x${viewport.height}):
        - Load time: ${loadTime}ms`);
    }
  });
});