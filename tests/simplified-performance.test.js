/**
 * Simplified COCOSiL Performance Testing
 * Focus on key metrics with reliable selectors
 */

const { test, expect } = require('@playwright/test');

test.describe('COCOSiL Performance Analysis', () => {
  test('Performance Metrics Collection', async ({ page }) => {
    console.log('🚀 Starting COCOSiL Performance Analysis...');

    // Navigate to landing page and measure load performance
    const navigationStart = Date.now();

    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    const landingPageLoadTime = Date.now() - navigationStart;
    console.log(`📊 Landing Page Load Time: ${landingPageLoadTime}ms`);

    // Collect Core Web Vitals using Web Vitals API
    const webVitals = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const vitals = {};
        let completed = 0;
        const totalMetrics = 3;

        const checkComplete = () => {
          if (completed >= totalMetrics) {
            resolve(vitals);
          }
        };

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.LCP = entries[entries.length - 1]?.startTime || 0;
          completed++;
          checkComplete();
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Contentful Paint
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              vitals.FCP = entry.startTime;
              completed++;
              checkComplete();
              break;
            }
          }
        }).observe({ entryTypes: ['paint'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.CLS = clsValue;
          completed++;
          checkComplete();
        }).observe({ entryTypes: ['layout-shift'] });

        // Fallback timeout
        setTimeout(() => {
          vitals.timeout = true;
          resolve(vitals);
        }, 3000);
      });
    });

    console.log('📈 Core Web Vitals:');
    console.log(`  LCP: ${webVitals.LCP?.toFixed(2) || 'N/A'}ms`);
    console.log(`  FCP: ${webVitals.FCP?.toFixed(2) || 'N/A'}ms`);
    console.log(`  CLS: ${webVitals.CLS?.toFixed(4) || 'N/A'}`);

    // Resource Analysis
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const analysis = {
        totalResources: resources.length,
        totalTransferSize: 0,
        javascriptSize: 0,
        cssSize: 0,
        fontSize: 0,
        imageSize: 0,
        largestResource: { name: '', size: 0 }
      };

      resources.forEach(resource => {
        const size = resource.transferSize || 0;
        analysis.totalTransferSize += size;

        if (size > analysis.largestResource.size) {
          analysis.largestResource = {
            name: resource.name.split('/').pop() || resource.name,
            size
          };
        }

        // Categorize by file type
        if (resource.name.includes('.js')) {
          analysis.javascriptSize += size;
        } else if (resource.name.includes('.css')) {
          analysis.cssSize += size;
        } else if (resource.name.includes('.woff') || resource.name.includes('.ttf')) {
          analysis.fontSize += size;
        } else if (resource.name.includes('.png') || resource.name.includes('.jpg') || resource.name.includes('.webp')) {
          analysis.imageSize += size;
        }
      });

      return analysis;
    });

    console.log('📦 Resource Analysis:');
    console.log(`  Total Resources: ${resourceMetrics.totalResources}`);
    console.log(`  Total Transfer Size: ${(resourceMetrics.totalTransferSize / 1024).toFixed(2)} KB`);
    console.log(`  JavaScript Size: ${(resourceMetrics.javascriptSize / 1024).toFixed(2)} KB`);
    console.log(`  CSS Size: ${(resourceMetrics.cssSize / 1024).toFixed(2)} KB`);
    console.log(`  Font Size: ${(resourceMetrics.fontSize / 1024).toFixed(2)} KB`);
    console.log(`  Image Size: ${(resourceMetrics.imageSize / 1024).toFixed(2)} KB`);
    console.log(`  Largest Resource: ${resourceMetrics.largestResource.name} (${(resourceMetrics.largestResource.size / 1024).toFixed(2)} KB)`);

    // API Performance Test - Fortune Calculation
    console.log('⚡ Testing API Performance...');

    const apiTestStart = Date.now();
    const fortuneApiResponse = await page.request.post('http://localhost:3000/api/fortune-calc-v2', {
      data: {
        year: 1990,
        month: 5,
        day: 15
      }
    });

    const apiTestDuration = Date.now() - apiTestStart;
    const apiSuccess = fortuneApiResponse.ok();

    console.log(`🔗 Fortune API Performance:`);
    console.log(`  Response Time: ${apiTestDuration}ms`);
    console.log(`  Status: ${fortuneApiResponse.status()}`);
    console.log(`  Success: ${apiSuccess}`);

    if (apiSuccess) {
      try {
        const apiData = await fortuneApiResponse.json();
        console.log(`  Response Size: ${JSON.stringify(apiData).length} characters`);
      } catch (e) {
        console.log(`  Response parsing error: ${e.message}`);
      }
    }

    // Navigation Performance Test
    console.log('🧭 Testing Navigation Performance...');

    const diagnosisNavStart = Date.now();

    // Try multiple possible navigation patterns
    const diagnosisButton = page.locator('a:has-text("診断"), a:has-text("始める"), a:has-text("開始"), a[href*="/diagnosis"], button:has-text("診断")').first();

    if (await diagnosisButton.isVisible({ timeout: 5000 })) {
      await diagnosisButton.click();
      await page.waitForLoadState('networkidle');
      const diagnosisNavDuration = Date.now() - diagnosisNavStart;
      console.log(`  Navigation to Diagnosis: ${diagnosisNavDuration}ms`);

      // Check if basic form elements are present
      const formElements = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, select, textarea');
        const buttons = document.querySelectorAll('button');
        return {
          inputCount: inputs.length,
          buttonCount: buttons.length,
          hasNameField: !!document.querySelector('input[name*="name"], input[placeholder*="名前"]'),
          hasEmailField: !!document.querySelector('input[type="email"], input[name*="email"]'),
          hasGenderField: !!document.querySelector('select[name*="gender"], input[name*="gender"]'),
          hasBirthdateFields: !!document.querySelector('input[name*="year"], input[name*="birth"], select[name*="year"]')
        };
      });

      console.log(`🏗️ Diagnosis Form Analysis:`);
      console.log(`  Input Fields: ${formElements.inputCount}`);
      console.log(`  Buttons: ${formElements.buttonCount}`);
      console.log(`  Has Name Field: ${formElements.hasNameField}`);
      console.log(`  Has Email Field: ${formElements.hasEmailField}`);
      console.log(`  Has Gender Field: ${formElements.hasGenderField}`);
      console.log(`  Has Birthdate Fields: ${formElements.hasBirthdateFields}`);
    } else {
      console.log('  ⚠️ Diagnosis navigation element not found');
    }

    // Performance Assessment
    const performanceAssessment = {
      landingPageLoad: landingPageLoadTime < 3000 ? 'GOOD' : landingPageLoadTime < 5000 ? 'NEEDS_IMPROVEMENT' : 'POOR',
      coreWebVitals: {
        LCP: webVitals.LCP < 2500 ? 'GOOD' : webVitals.LCP < 4000 ? 'NEEDS_IMPROVEMENT' : 'POOR',
        FCP: webVitals.FCP < 1800 ? 'GOOD' : webVitals.FCP < 3000 ? 'NEEDS_IMPROVEMENT' : 'POOR',
        CLS: webVitals.CLS < 0.1 ? 'GOOD' : webVitals.CLS < 0.25 ? 'NEEDS_IMPROVEMENT' : 'POOR'
      },
      bundleSize: resourceMetrics.javascriptSize < 256000 ? 'GOOD' : resourceMetrics.javascriptSize < 512000 ? 'NEEDS_IMPROVEMENT' : 'POOR',
      apiPerformance: apiTestDuration < 1000 ? 'GOOD' : apiTestDuration < 2000 ? 'NEEDS_IMPROVEMENT' : 'POOR'
    };

    console.log('\n🎯 PERFORMANCE ASSESSMENT:');
    console.log('================================');
    console.log(`Landing Page Load: ${performanceAssessment.landingPageLoad}`);
    console.log(`LCP (Largest Contentful Paint): ${performanceAssessment.coreWebVitals.LCP}`);
    console.log(`FCP (First Contentful Paint): ${performanceAssessment.coreWebVitals.FCP}`);
    console.log(`CLS (Cumulative Layout Shift): ${performanceAssessment.coreWebVitals.CLS}`);
    console.log(`Bundle Size: ${performanceAssessment.bundleSize}`);
    console.log(`API Performance: ${performanceAssessment.apiPerformance}`);

    // Recommendations
    const recommendations = [];

    if (landingPageLoadTime > 3000) {
      recommendations.push('🚀 Optimize landing page load time: Consider lazy loading, code splitting, or image optimization');
    }

    if (webVitals.LCP > 2500) {
      recommendations.push('🖼️ Improve Largest Contentful Paint: Optimize main content loading, consider hero image optimization');
    }

    if (webVitals.FCP > 1800) {
      recommendations.push('⚡ Improve First Contentful Paint: Optimize critical rendering path, reduce blocking resources');
    }

    if (webVitals.CLS > 0.1) {
      recommendations.push('📐 Reduce Cumulative Layout Shift: Specify image dimensions, avoid inserting content above existing content');
    }

    if (resourceMetrics.javascriptSize > 256000) {
      recommendations.push('📦 Reduce JavaScript bundle size: Implement code splitting, tree shaking, or remove unused dependencies');
    }

    if (apiTestDuration > 1000) {
      recommendations.push('🔗 Optimize API performance: Consider caching, database query optimization, or response compression');
    }

    if (recommendations.length > 0) {
      console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
      console.log('=====================================');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    } else {
      console.log('\n✅ All performance metrics are within acceptable ranges!');
    }

    // Create comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {
        landingPageLoadTime,
        webVitals,
        resourceMetrics,
        apiPerformance: { duration: apiTestDuration, success: apiSuccess }
      },
      assessment: performanceAssessment,
      recommendations
    };

    // Save report
    await page.evaluate((reportData) => {
      // Store report in sessionStorage for later retrieval
      sessionStorage.setItem('performanceReport', JSON.stringify(reportData, null, 2));
    }, report);

    console.log('\n📊 Performance testing completed successfully!');

    // Basic assertions for CI/CD integration
    expect(landingPageLoadTime).toBeLessThan(10000); // Maximum acceptable load time
    expect(resourceMetrics.totalResources).toBeGreaterThan(0); // Ensure resources were loaded
    expect(apiSuccess).toBe(true); // API should respond successfully
  });
});