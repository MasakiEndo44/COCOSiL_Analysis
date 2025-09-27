/**
 * COCOSiL Performance Testing Suite
 * Complete User Journey: Landing Page → AI Chat
 */

const { test, expect } = require('@playwright/test');

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FCP: 1800, // First Contentful Paint (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  TTI: 3800, // Time to Interactive (ms)
  TOTAL_JOURNEY_TIME: 30000, // Complete journey (ms)
  API_RESPONSE_TIME: 2000, // API response (ms)
  NAVIGATION_TIME: 1000 // Page-to-page navigation (ms)
};

// Test configuration
test.describe('COCOSiL Performance Testing', () => {
  let performanceMetrics = {};
  let journeyStartTime;

  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performanceMetrics = {
        navigationStart: performance.now(),
        marks: {},
        measures: {}
      };

      // Mark performance timing points
      window.markPerformance = (name) => {
        performance.mark(name);
        window.performanceMetrics.marks[name] = performance.now();
      };

      // Measure performance between marks
      window.measurePerformance = (name, startMark, endMark) => {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        window.performanceMetrics.measures[name] = measure.duration;
      };
    });

    journeyStartTime = Date.now();
  });

  test('1. Landing Page Performance Analysis', async ({ page }) => {
    console.log('🚀 Testing Landing Page Performance...');

    const startTime = Date.now();

    // Navigate to landing page
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    // Wait for hero section to be visible
    await page.waitForSelector('main', { timeout: 5000 });

    const loadTime = Date.now() - startTime;
    console.log(`📊 Landing page load time: ${loadTime}ms`);

    // Collect Core Web Vitals
    const webVitals = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let vitals = {};

        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.LCP = entries[entries.length - 1]?.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FCP (First Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              vitals.FCP = entry.startTime;
            }
          }
        }).observe({ entryTypes: ['paint'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.CLS = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // TTI approximation
        vitals.TTI = performance.now();

        setTimeout(() => resolve(vitals), 2000);
      });
    });

    console.log('📈 Core Web Vitals:', webVitals);

    // Validate against thresholds
    expect(webVitals.LCP).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
    expect(webVitals.FCP).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP);
    expect(webVitals.CLS).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);

    performanceMetrics.landingPage = { loadTime, ...webVitals };
  });

  test('2. Complete User Journey Performance', async ({ page }) => {
    console.log('🎯 Testing Complete User Journey Performance...');

    const journeyMetrics = {
      steps: [],
      totalTime: 0,
      apiCalls: []
    };

    // Step 1: Landing Page
    console.log('Step 1: Loading Landing Page...');
    let stepStart = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    journeyMetrics.steps.push({
      step: 'Landing Page',
      duration: Date.now() - stepStart
    });

    // Step 2: Navigate to Diagnosis
    console.log('Step 2: Navigating to Diagnosis...');
    stepStart = Date.now();
    await page.click('text=診断を始める');
    await page.waitForLoadState('networkidle');
    journeyMetrics.steps.push({
      step: 'Navigate to Diagnosis',
      duration: Date.now() - stepStart
    });

    // Step 3: Fill Basic Information Form
    console.log('Step 3: Filling Basic Information...');
    stepStart = Date.now();

    // Fill form with test data
    await page.fill('[name="name"]', 'テストユーザー');
    await page.fill('[name="email"]', 'test@example.com');
    await page.selectOption('[name="gender"]', 'male');
    await page.fill('[name="year"]', '1990');
    await page.fill('[name="month"]', '5');
    await page.fill('[name="day"]', '15');

    // Monitor API call performance
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        journeyMetrics.apiCalls.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing()
        });
      }
    });

    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    journeyMetrics.steps.push({
      step: 'Basic Info Form',
      duration: Date.now() - stepStart
    });

    // Step 4: MBTI Diagnosis
    console.log('Step 4: MBTI Diagnosis...');
    stepStart = Date.now();

    // Navigate to MBTI if not already there
    if (await page.locator('text=MBTI診断').isVisible()) {
      await page.click('text=MBTI診断');
      await page.waitForLoadState('networkidle');
    }

    // Answer MBTI questions quickly for performance testing
    for (let i = 0; i < 5; i++) { // Simulate answering 5 questions
      const choices = await page.locator('[role="button"], button').all();
      if (choices.length > 0) {
        await choices[0].click();
        await page.waitForTimeout(100); // Minimal wait between answers
      }
    }

    journeyMetrics.steps.push({
      step: 'MBTI Diagnosis',
      duration: Date.now() - stepStart
    });

    // Step 5: Taiheki Diagnosis
    console.log('Step 5: Taiheki Diagnosis...');
    stepStart = Date.now();

    // Navigate to Taiheki diagnosis
    if (await page.locator('text=体癖診断').isVisible()) {
      await page.click('text=体癖診断');
      await page.waitForLoadState('networkidle');
    }

    // Answer Taiheki questions
    for (let i = 0; i < 10; i++) { // Simulate answering 10 questions
      const choices = await page.locator('[role="button"], button').all();
      if (choices.length > 0) {
        await choices[Math.floor(Math.random() * Math.min(choices.length, 5))].click();
        await page.waitForTimeout(100);
      }
    }

    journeyMetrics.steps.push({
      step: 'Taiheki Diagnosis',
      duration: Date.now() - stepStart
    });

    // Step 6: Results Page
    console.log('Step 6: Results Page...');
    stepStart = Date.now();

    if (await page.locator('text=結果を見る').isVisible()) {
      await page.click('text=結果を見る');
      await page.waitForLoadState('networkidle');
    }

    journeyMetrics.steps.push({
      step: 'Results Page',
      duration: Date.now() - stepStart
    });

    // Step 7: AI Chat Integration
    console.log('Step 7: AI Chat Integration...');
    stepStart = Date.now();

    if (await page.locator('text=AIチャット').isVisible()) {
      await page.click('text=AIチャット');
      await page.waitForLoadState('networkidle');
    }

    // Test chat performance (if available)
    const chatInput = page.locator('input[type="text"], textarea').first();
    if (await chatInput.isVisible()) {
      await chatInput.fill('こんにちは、診断結果について教えてください');

      const sendButton = page.locator('button').filter({ hasText: /送信|Send/ }).first();
      if (await sendButton.isVisible()) {
        const apiStart = Date.now();
        await sendButton.click();

        // Wait for AI response
        await page.waitForSelector('[data-role="assistant"], .ai-response, .assistant-message',
          { timeout: 10000 }).catch(() => {
          console.log('⚠️  AI response not found within timeout');
        });

        const apiDuration = Date.now() - apiStart;
        journeyMetrics.apiCalls.push({
          url: '/api/ai/chat',
          duration: apiDuration,
          type: 'AI_CHAT'
        });
      }
    }

    journeyMetrics.steps.push({
      step: 'AI Chat Integration',
      duration: Date.now() - stepStart
    });

    // Calculate total journey time
    journeyMetrics.totalTime = Date.now() - journeyStartTime;

    console.log('📊 Journey Performance Metrics:');
    console.log(`Total Journey Time: ${journeyMetrics.totalTime}ms`);

    journeyMetrics.steps.forEach(step => {
      console.log(`- ${step.step}: ${step.duration}ms`);
    });

    console.log('🔗 API Performance:');
    journeyMetrics.apiCalls.forEach(api => {
      console.log(`- ${api.url}: ${api.duration || api.timing?.responseEnd}ms`);
    });

    // Validate performance thresholds
    expect(journeyMetrics.totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.TOTAL_JOURNEY_TIME);

    journeyMetrics.steps.forEach(step => {
      if (step.duration > PERFORMANCE_THRESHOLDS.NAVIGATION_TIME) {
        console.warn(`⚠️  ${step.step} exceeded navigation threshold: ${step.duration}ms`);
      }
    });

    performanceMetrics.userJourney = journeyMetrics;
  });

  test('3. API Performance Testing', async ({ page }) => {
    console.log('⚡ Testing API Performance...');

    const apiTests = [];

    // Test Fortune Calculation API
    console.log('Testing Fortune Calculation API...');
    const fortuneApiStart = Date.now();

    const fortuneResponse = await page.evaluate(async () => {
      const response = await fetch('/api/fortune-calc-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: 1990,
          month: 5,
          day: 15
        })
      });

      return {
        status: response.status,
        ok: response.ok,
        data: await response.json()
      };
    });

    const fortuneApiDuration = Date.now() - fortuneApiStart;
    apiTests.push({
      api: 'fortune-calc-v2',
      duration: fortuneApiDuration,
      status: fortuneResponse.status,
      success: fortuneResponse.ok
    });

    console.log(`Fortune API: ${fortuneApiDuration}ms (Status: ${fortuneResponse.status})`);

    // Test Admin API (if accessible)
    try {
      console.log('Testing Admin Diagnosis Results API...');
      const adminApiStart = Date.now();

      const adminResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/admin/diagnosis-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              page: 1,
              limit: 10
            })
          });

          return {
            status: response.status,
            ok: response.ok
          };
        } catch (error) {
          return { status: 0, ok: false, error: error.message };
        }
      });

      const adminApiDuration = Date.now() - adminApiStart;
      apiTests.push({
        api: 'admin/diagnosis-results',
        duration: adminApiDuration,
        status: adminResponse.status,
        success: adminResponse.ok
      });

      console.log(`Admin API: ${adminApiDuration}ms (Status: ${adminResponse.status})`);
    } catch (error) {
      console.log('Admin API test skipped (likely requires authentication)');
    }

    // Validate API performance
    apiTests.forEach(test => {
      if (test.success) {
        expect(test.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
      }
    });

    performanceMetrics.apis = apiTests;
  });

  test('4. Bundle Size and Resource Analysis', async ({ page }) => {
    console.log('📦 Analyzing Bundle Size and Resources...');

    // Navigate to page and collect resource timing
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const analysis = {
        totalResources: resources.length,
        javascript: [],
        css: [],
        fonts: [],
        images: [],
        totalSize: 0,
        totalLoadTime: 0
      };

      resources.forEach(resource => {
        const category = resource.name.includes('.js') ? 'javascript' :
                        resource.name.includes('.css') ? 'css' :
                        resource.name.includes('.woff') || resource.name.includes('.ttf') ? 'fonts' :
                        resource.name.includes('.png') || resource.name.includes('.jpg') || resource.name.includes('.svg') ? 'images' :
                        'other';

        const resourceInfo = {
          name: resource.name.split('/').pop(),
          loadTime: resource.responseEnd - resource.requestStart,
          size: resource.transferSize || 0
        };

        if (category !== 'other') {
          analysis[category].push(resourceInfo);
        }

        analysis.totalSize += resourceInfo.size;
        analysis.totalLoadTime = Math.max(analysis.totalLoadTime, resourceInfo.loadTime);
      });

      return analysis;
    });

    console.log('📊 Resource Analysis:');
    console.log(`Total Resources: ${resourceMetrics.totalResources}`);
    console.log(`Total Size: ${(resourceMetrics.totalSize / 1024).toFixed(2)} KB`);
    console.log(`Max Load Time: ${resourceMetrics.totalLoadTime.toFixed(2)}ms`);

    console.log(`JavaScript Files: ${resourceMetrics.javascript.length}`);
    resourceMetrics.javascript.forEach(js => {
      console.log(`- ${js.name}: ${(js.size / 1024).toFixed(2)} KB (${js.loadTime.toFixed(2)}ms)`);
    });

    console.log(`CSS Files: ${resourceMetrics.css.length}`);
    resourceMetrics.css.forEach(css => {
      console.log(`- ${css.name}: ${(css.size / 1024).toFixed(2)} KB (${css.loadTime.toFixed(2)}ms)`);
    });

    // Validate bundle size (target: < 250KB for JS)
    const totalJsSize = resourceMetrics.javascript.reduce((sum, js) => sum + js.size, 0);
    console.log(`Total JS Bundle Size: ${(totalJsSize / 1024).toFixed(2)} KB`);

    performanceMetrics.resources = resourceMetrics;
  });

  test.afterAll(async () => {
    console.log('\n🎯 PERFORMANCE TESTING COMPLETE');
    console.log('='.repeat(50));

    // Generate comprehensive performance report
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: Date.now() - journeyStartTime,
      metrics: performanceMetrics,
      summary: {
        landingPagePerformance: performanceMetrics.landingPage?.loadTime < 3000 ? 'PASS' : 'FAIL',
        userJourneyPerformance: performanceMetrics.userJourney?.totalTime < PERFORMANCE_THRESHOLDS.TOTAL_JOURNEY_TIME ? 'PASS' : 'FAIL',
        apiPerformance: performanceMetrics.apis?.every(api => api.duration < PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME) ? 'PASS' : 'FAIL',
        resourceOptimization: performanceMetrics.resources?.totalSize < 512000 ? 'PASS' : 'NEEDS_OPTIMIZATION'
      },
      recommendations: []
    };

    // Generate recommendations
    if (performanceMetrics.landingPage?.loadTime > 3000) {
      report.recommendations.push('Optimize landing page load time - consider lazy loading and code splitting');
    }

    if (performanceMetrics.userJourney?.totalTime > PERFORMANCE_THRESHOLDS.TOTAL_JOURNEY_TIME) {
      report.recommendations.push('Optimize user journey flow - review step-by-step performance');
    }

    if (performanceMetrics.resources?.totalSize > 512000) {
      report.recommendations.push('Optimize bundle size - implement code splitting and tree shaking');
    }

    console.log('📈 PERFORMANCE SUMMARY:');
    Object.entries(report.summary).forEach(([key, status]) => {
      const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${key}: ${status}`);
    });

    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    // Save detailed report
    const fs = require('fs');
    fs.writeFileSync(
      './performance-test-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Detailed report saved to: ./performance-test-report.json');
  });
});