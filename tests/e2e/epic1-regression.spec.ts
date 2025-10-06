import { test, expect } from '@playwright/test';

/**
 * Epic 1 Regression Test Suite
 *
 * Tests the complete diagnosis → results → learn flow with personalization features:
 * - Story 1.1: Diagnosis result personalization foundation
 * - Story 1.2: Personalized content UI
 * - Story 1.3: Mobile bottom navigation
 * - Story 1.4: Type comparison mode
 */

test.describe('Epic 1: Taiheki Learning UX Improvements', () => {
  test.describe('Story 1.1: Diagnosis → Learning Personalization Flow', () => {
    test('should pass user context from diagnosis results to learning page via URL params', async ({ page }) => {
      // Navigate to direct taiheki input page (skip full diagnosis for speed)
      await page.goto('http://localhost:3000/diagnosis/taiheki/direct');

      // Fill in taiheki selection
      await page.click('button:has-text("1種")'); // Select primary type 1
      await page.click('button:has-text("3種")'); // Select secondary type 3

      // Submit and go to results
      await page.click('button:has-text("結果を見る")');
      await page.waitForURL('**/diagnosis/taiheki/results');

      // Verify learning CTA button exists
      const learningCTA = page.locator('button:has-text("体癖理論を学ぶ")');
      await expect(learningCTA).toBeVisible();

      // Click learning CTA
      await learningCTA.click();

      // Verify URL contains personalization parameters
      await page.waitForURL('**/learn/taiheki?my_type=1&secondary=3');
      const url = page.url();
      expect(url).toContain('my_type=1');
      expect(url).toContain('secondary=3');

      // Verify personalization badge is displayed
      const personalizationBadge = page.locator('text=あなた（1種）');
      await expect(personalizationBadge).toBeVisible();
    });
  });

  test.describe('Story 1.2: Personalized Content Display', () => {
    test('should display personalized highlight cards in chapter content', async ({ page }) => {
      // Navigate to learning page with personalization params
      await page.goto('http://localhost:3000/learn/taiheki?my_type=2&secondary=4');

      // Wait for page load
      await page.waitForLoadState('networkidle');

      // Navigate to chapter 1
      const chapter1Link = page.locator('a:has-text("Chapter 1")').first();
      await chapter1Link.click();
      await page.waitForURL('**/learn/taiheki/chapter-1');

      // Verify personalized highlight card exists
      const personalizedCard = page.locator('.bg-gradient-to-r.from-green-50.to-blue-50.border-2.border-green-500');
      await expect(personalizedCard).toBeVisible();

      // Verify card shows user's type
      const typeDisplay = personalizedCard.locator('text=/あなた（2種.*）の場合/');
      await expect(typeDisplay).toBeVisible();

      // Verify card contains personalized content
      const cardContent = personalizedCard.locator('.text-sm.text-green-800');
      await expect(cardContent).not.toBeEmpty();
    });
  });

  test.describe('Story 1.3: Mobile Bottom Navigation', () => {
    test('should display bottom stepper navigation on mobile viewport', async ({ page }) => {
      // Set mobile viewport (iPhone 12 size)
      await page.setViewportSize({ width: 390, height: 844 });

      // Navigate to chapter page
      await page.goto('http://localhost:3000/learn/taiheki/chapter-1');
      await page.waitForLoadState('networkidle');

      // Verify bottom navigation is visible
      const bottomNav = page.locator('.fixed.bottom-0.left-0.right-0.bg-white.border-t');
      await expect(bottomNav).toBeVisible();

      // Verify progress dots exist
      const progressDots = bottomNav.locator('.w-2.h-2.rounded-full');
      const dotCount = await progressDots.count();
      expect(dotCount).toBeGreaterThan(0);

      // Verify navigation buttons exist
      const prevButton = bottomNav.locator('button:has-text("前章")');
      const nextButton = bottomNav.locator('button:has-text("次章")');
      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();

      // Test navigation functionality
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForURL('**/learn/taiheki/chapter-2');
        expect(page.url()).toContain('chapter-2');
      }
    });

    test('should hide bottom navigation on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Navigate to chapter page
      await page.goto('http://localhost:3000/learn/taiheki/chapter-1');
      await page.waitForLoadState('networkidle');

      // Verify bottom navigation is NOT visible (or doesn't exist)
      const bottomNav = page.locator('.fixed.bottom-0.left-0.right-0.bg-white.border-t');
      await expect(bottomNav).not.toBeVisible();
    });
  });

  test.describe('Story 1.4: Type Comparison Mode', () => {
    test('should open type comparison modal and allow comparing types', async ({ page }) => {
      // Navigate to chapter 2 (where comparison button exists)
      await page.goto('http://localhost:3000/learn/taiheki/chapter-2');
      await page.waitForLoadState('networkidle');

      // Click comparison button
      const comparisonButton = page.locator('button:has-text("タイプを比較")');
      await expect(comparisonButton).toBeVisible();
      await comparisonButton.click();

      // Verify modal opened
      const modal = page.locator('[role="dialog"]:has-text("体癖タイプ比較")');
      await expect(modal).toBeVisible();

      // Select first type (1種)
      await page.click('button:has-text("1種")');

      // Select second type (2種)
      await page.click('button:has-text("2種")');

      // Verify comparison table appeared
      const comparisonTable = page.locator('table');
      await expect(comparisonTable).toBeVisible();

      // Verify comparison data is displayed
      const categoryRow = page.locator('td:has-text("カテゴリー")');
      await expect(categoryRow).toBeVisible();

      // Verify can select up to 3 types
      await page.click('button:has-text("3種")');

      // Try to select 4th type (should be disabled)
      const fourthTypeButton = page.locator('button:has-text("4種")');
      await expect(fourthTypeButton).toBeDisabled();

      // Close modal
      const closeButton = modal.locator('button').first();
      await closeButton.click();
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Integration: Complete User Journey', () => {
    test('should complete full diagnosis → results → personalized learning flow', async ({ page }) => {
      // Step 1: Complete taiheki diagnosis
      await page.goto('http://localhost:3000/diagnosis/taiheki/direct');
      await page.click('button:has-text("5種")'); // Primary type 5
      await page.click('button:has-text("7種")'); // Secondary type 7
      await page.click('button:has-text("結果を見る")');
      await page.waitForURL('**/diagnosis/taiheki/results');

      // Step 2: Navigate to learning via CTA
      const learningCTA = page.locator('button:has-text("体癖理論を学ぶ")');
      await learningCTA.click();
      await page.waitForURL('**/learn/taiheki?my_type=5&secondary=7');

      // Step 3: Verify personalization badge
      const badge = page.locator('text=あなた（5種）');
      await expect(badge).toBeVisible();

      // Step 4: Navigate to chapter with personalized content
      const chapterLink = page.locator('a:has-text("Chapter 1")').first();
      await chapterLink.click();
      await page.waitForURL('**/learn/taiheki/chapter-1');

      // Step 5: Verify personalized highlight card
      const personalizedCard = page.locator('text=/あなた（5種.*）の場合/');
      await expect(personalizedCard).toBeVisible();

      // Step 6: Open type comparison modal
      await page.goto('http://localhost:3000/learn/taiheki/chapter-2');
      const comparisonButton = page.locator('button:has-text("タイプを比較")');
      await comparisonButton.click();

      // Step 7: Verify modal shows user's type pre-selected
      const modal = page.locator('[role="dialog"]:has-text("体癖タイプ比較")');
      await expect(modal).toBeVisible();

      // User's type (5種) might be pre-selected if initialTypes prop is working
      // This depends on implementation - may need to verify selection state
    });
  });

  test.describe('Performance & Accessibility', () => {
    test('should load learning page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000/learn/taiheki?my_type=1&secondary=2');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have accessible navigation elements', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // Mobile
      await page.goto('http://localhost:3000/learn/taiheki/chapter-1');

      // Check button accessibility
      const prevButton = page.locator('button:has-text("前章")');
      const nextButton = page.locator('button:has-text("次章")');

      // Buttons should have proper roles and be keyboard accessible
      await expect(prevButton).toHaveAttribute('type', 'button');
      await expect(nextButton).toHaveAttribute('type', 'button');
    });
  });
});
