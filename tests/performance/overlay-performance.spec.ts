import { test, expect } from '@playwright/test';

test.describe('User Guidance Overlay Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure fresh session for overlay testing
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Results page overlay rendering performance', async ({ page }) => {
    // Navigate to diagnosis flow to set up data
    await page.goto('/diagnosis');

    // Fill basic info quickly to get to results
    await page.fill('input[name="name"]', 'Performance Test User');
    await page.fill('input[name="email"]', 'perf@test.com');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('input[name="birthYear"]', '1990');
    await page.selectOption('select[name="birthMonth"]', '5');
    await page.selectOption('select[name="birthDay"]', '15');
    await page.click('button[type="submit"]');

    // Complete MBTI quickly
    await page.goto('/diagnosis/mbti');
    // Simulate quick MBTI completion
    await page.evaluate(() => {
      window.localStorage.setItem('cocosil-diagnosis-store', JSON.stringify({
        state: {
          mbti: { type: 'ENFP', source: 'known', confidence: 1 },
          currentStep: 'mbti'
        }
      }));
    });

    // Complete Taiheki
    await page.goto('/diagnosis/taiheki');
    await page.evaluate(() => {
      const store = JSON.parse(window.localStorage.getItem('cocosil-diagnosis-store') || '{}');
      store.state.taiheki = { primary: 4, secondary: 0, scores: {}, characteristics: ['主体癖4種'] };
      store.state.currentStep = 'integration';
      window.localStorage.setItem('cocosil-diagnosis-store', JSON.stringify(store));
    });

    // Measure performance of results page load with overlay
    const startTime = Date.now();

    await page.goto('/diagnosis/results');

    // Wait for overlay to appear
    await page.waitForSelector('[data-testid="guidance-overlay-title"]', { timeout: 5000 });

    const overlayLoadTime = Date.now() - startTime;

    // Verify overlay content loads correctly
    await expect(page.locator('[data-testid="guidance-overlay-title"]')).toContainText('診断お疲れ様');

    // Measure overlay close performance
    const closeStartTime = Date.now();
    await page.click('[data-testid="results-overlay-understand-action"]');
    await page.waitForSelector('[data-testid="guidance-overlay-title"]', { state: 'hidden' });
    const overlayCloseTime = Date.now() - closeStartTime;

    // Performance assertions
    expect(overlayLoadTime).toBeLessThan(2000); // Should load within 2 seconds
    expect(overlayCloseTime).toBeLessThan(500); // Should close within 500ms

    console.log(`Results Overlay Performance:
      - Load time: ${overlayLoadTime}ms
      - Close time: ${overlayCloseTime}ms`);
  });

  test('Chat page overlay rendering performance', async ({ page }) => {
    // Set up completed diagnosis data
    await page.evaluate(() => {
      window.localStorage.setItem('cocosil-diagnosis-store', JSON.stringify({
        state: {
          basicInfo: { name: 'Test User', email: 'test@test.com', gender: 'male', birthdate: { year: 1990, month: 5, day: 15 }, age: 35 },
          mbti: { type: 'ENFP', source: 'known', confidence: 1 },
          taiheki: { primary: 4, secondary: 0, scores: {}, characteristics: ['主体癖4種'] },
          fortune: { zodiac: '牡牛座', animal: '強い意志をもったこじか' },
          currentStep: 'integration',
          overlayHints: { resultsIntroSeen: false, chatIntroSeen: false, exportIntroSeen: false }
        }
      }));
    });

    // Measure chat page overlay performance
    const startTime = Date.now();

    await page.goto('/diagnosis/chat');

    // Wait for overlay to appear
    await page.waitForSelector('[data-testid="guidance-overlay-title"]', { timeout: 5000 });

    const overlayLoadTime = Date.now() - startTime;

    // Verify overlay content
    await expect(page.locator('[data-testid="guidance-overlay-title"]')).toContainText('AIチャットについて');

    // Measure close performance
    const closeStartTime = Date.now();
    await page.click('[data-testid="chat-overlay-understand-action"]');
    await page.waitForSelector('[data-testid="guidance-overlay-title"]', { state: 'hidden' });
    const overlayCloseTime = Date.now() - closeStartTime;

    // Performance assertions
    expect(overlayLoadTime).toBeLessThan(2000);
    expect(overlayCloseTime).toBeLessThan(500);

    console.log(`Chat Overlay Performance:
      - Load time: ${overlayLoadTime}ms
      - Close time: ${overlayCloseTime}ms`);
  });

  test('Export dialog overlay performance', async ({ page }) => {
    // Set up completed diagnosis data
    await page.evaluate(() => {
      window.localStorage.setItem('cocosil-diagnosis-store', JSON.stringify({
        state: {
          basicInfo: { name: 'Test User', email: 'test@test.com', gender: 'male', birthdate: { year: 1990, month: 5, day: 15 }, age: 35 },
          mbti: { type: 'ENFP', source: 'known', confidence: 1 },
          taiheki: { primary: 4, secondary: 0, scores: {}, characteristics: ['主体癖4種'] },
          fortune: { zodiac: '牡牛座', animal: '強い意志をもったこじか' },
          currentStep: 'integration',
          overlayHints: { resultsIntroSeen: true, chatIntroSeen: false, exportIntroSeen: false }
        }
      }));
    });

    await page.goto('/diagnosis/results');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Measure export dialog open performance
    const dialogOpenStart = Date.now();
    await page.click('text=診断結果を出力');
    await page.waitForSelector('text=診断結果プレビュー');
    const dialogOpenTime = Date.now() - dialogOpenStart;

    // Measure overlay appearance within dialog
    const overlayStartTime = Date.now();
    await page.waitForSelector('[data-testid="guidance-overlay-title"]', { timeout: 3000 });
    const overlayAppearTime = Date.now() - overlayStartTime;

    // Verify overlay content
    await expect(page.locator('[data-testid="guidance-overlay-title"]')).toContainText('結果出力について');

    // Measure overlay close performance
    const closeStartTime = Date.now();
    await page.click('[data-testid="export-overlay-understand-action"]');
    await page.waitForSelector('[data-testid="guidance-overlay-title"]', { state: 'hidden' });
    const overlayCloseTime = Date.now() - closeStartTime;

    // Performance assertions
    expect(dialogOpenTime).toBeLessThan(1500);
    expect(overlayAppearTime).toBeLessThan(500);
    expect(overlayCloseTime).toBeLessThan(500);

    console.log(`Export Dialog Overlay Performance:
      - Dialog open time: ${dialogOpenTime}ms
      - Overlay appear time: ${overlayAppearTime}ms
      - Close time: ${overlayCloseTime}ms`);
  });

  test('Memory usage and state management performance', async ({ page }) => {
    // Test multiple overlay interactions for memory leaks
    await page.goto('/diagnosis');

    // Set up data for testing
    await page.evaluate(() => {
      window.localStorage.setItem('cocosil-diagnosis-store', JSON.stringify({
        state: {
          basicInfo: { name: 'Memory Test', email: 'memory@test.com' },
          mbti: { type: 'ISFJ', source: 'known', confidence: 1 },
          taiheki: { primary: 2, secondary: 0, scores: {} },
          fortune: { zodiac: '水瓶座', animal: 'こじか' },
          currentStep: 'integration',
          overlayHints: { resultsIntroSeen: false, chatIntroSeen: false, exportIntroSeen: false }
        }
      }));
    });

    // Measure multiple overlay cycles
    const cycles = 3;
    const timings = [];

    for (let i = 0; i < cycles; i++) {
      // Clear overlay state to retrigger
      await page.evaluate(() => {
        const store = JSON.parse(window.localStorage.getItem('cocosil-diagnosis-store') || '{}');
        store.state.overlayHints = { resultsIntroSeen: false, chatIntroSeen: false, exportIntroSeen: false };
        window.localStorage.setItem('cocosil-diagnosis-store', JSON.stringify(store));
      });

      const cycleStart = Date.now();

      // Test results overlay
      await page.goto('/diagnosis/results');
      await page.waitForSelector('[data-testid="guidance-overlay-title"]');
      await page.click('[data-testid="results-overlay-understand-action"]');

      // Test chat overlay
      await page.goto('/diagnosis/chat');
      await page.waitForSelector('[data-testid="guidance-overlay-title"]');
      await page.click('[data-testid="chat-overlay-understand-action"]');

      const cycleTime = Date.now() - cycleStart;
      timings.push(cycleTime);
    }

    // Verify consistent performance across cycles (no memory leaks)
    const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
    const maxDeviation = Math.max(...timings) - Math.min(...timings);

    expect(maxDeviation).toBeLessThan(avgTime * 0.5); // Max 50% deviation
    expect(avgTime).toBeLessThan(4000); // Average cycle under 4 seconds

    console.log(`Memory Performance Test:
      - Average cycle time: ${avgTime.toFixed(0)}ms
      - Max deviation: ${maxDeviation.toFixed(0)}ms
      - All timings: ${timings.map(t => t.toFixed(0)).join('ms, ')}ms`);
  });

  test('Responsive design performance', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },    // iPhone SE
      { width: 768, height: 1024, name: 'Tablet' },   // iPad
      { width: 1920, height: 1080, name: 'Desktop' }  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Set up data
      await page.evaluate(() => {
        window.localStorage.setItem('cocosil-diagnosis-store', JSON.stringify({
          state: {
            basicInfo: { name: 'Responsive Test' },
            mbti: { type: 'ENTJ', source: 'known', confidence: 1 },
            currentStep: 'integration',
            overlayHints: { resultsIntroSeen: false, chatIntroSeen: false, exportIntroSeen: false }
          }
        }));
      });

      const startTime = Date.now();
      await page.goto('/diagnosis/results');
      await page.waitForSelector('[data-testid="guidance-overlay-title"]');
      const loadTime = Date.now() - startTime;

      // Verify overlay is properly sized for viewport
      const overlay = page.locator('[data-testid="guidance-overlay-title"]').first();
      const boundingBox = await overlay.boundingBox();

      expect(boundingBox).toBeTruthy();
      expect(boundingBox!.width).toBeLessThanOrEqual(viewport.width);
      expect(loadTime).toBeLessThan(3000);

      console.log(`${viewport.name} (${viewport.width}x${viewport.height}):
        - Load time: ${loadTime}ms
        - Overlay width: ${boundingBox!.width}px`);

      await page.click('[data-testid="results-overlay-understand-action"]');
    }
  });
});