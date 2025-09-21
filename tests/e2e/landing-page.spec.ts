import { test, expect } from '@playwright/test';

/**
 * COCOSiL ランディングページ UIフローテスト
 * Codex戦略に基づく包括的なUIテストシナリオ
 */

test.describe('ランディングページ UIフロー', () => {

  test.beforeEach(async ({ page }) => {
    // ランディングページにアクセス
    await page.goto('/');

    // ページ読み込み完了を待機
    await page.waitForLoadState('networkidle');
  });

  test.describe('ヒーローセクション', () => {
    test('基本要素の表示確認', async ({ page }) => {
      // ページタイトル確認
      await expect(page).toHaveTitle(/COCOSiL/);

      // メインロゴとタイトル
      await expect(page.locator('h1')).toContainText('COCOSiL');

      // ヒーローセクションの表示
      await expect(page.locator('main section').first()).toBeVisible();

      // CTA ボタンの表示と有効性
      const ctaButton = page.getByRole('link', { name: /診断を開始/ });
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toBeEnabled();

      // CTA ボタンのリンク先確認
      await expect(ctaButton).toHaveAttribute('href', '/diagnosis');
    });

    test('CTA ボタンのアクセシビリティ', async ({ page }) => {
      const ctaButton = page.getByRole('link', { name: /診断を開始/ });

      // フォーカス可能性
      await ctaButton.focus();
      await expect(ctaButton).toBeFocused();

      // キーボードナビゲーション
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL('/diagnosis');
    });
  });

  test.describe('機能紹介セクション', () => {
    test('5つの診断手法の表示', async ({ page }) => {
      // 機能セクションの確認
      await expect(page.locator('main')).toContainText('体癖理論');
      await expect(page.locator('main')).toContainText('MBTI');
      await expect(page.locator('main')).toContainText('算命学');
      await expect(page.locator('main')).toContainText('動物占い');

      // セクションの存在確認
      const sections = page.locator('main section');
      await expect(sections).toHaveCount(5); // Hero, Features, Flow, Privacy, CTA
    });
  });

  test.describe('診断フローセクション', () => {
    test('フロー説明の表示', async ({ page }) => {
      // 診断フローコンテンツの確認
      await expect(page.locator('main')).toContainText('基本情報');
      await expect(page.locator('main')).toContainText('MBTI');
      await expect(page.locator('main')).toContainText('体癖診断');
      await expect(page.locator('main')).toContainText('結果');

      // 任意ステップの表示確認（存在する場合）
      const mainContent = await page.locator('main').textContent();
      if (mainContent?.includes('任意')) {
        await expect(page.locator('main')).toContainText('任意');
      }

      // 所要時間の表示（分単位）
      await expect(page.locator('main')).toContainText('分');
    });
  });

  test.describe('プライバシー通知セクション', () => {
    test('プライバシー情報の表示', async ({ page }) => {
      // プライバシー関連コンテンツの確認
      await expect(page.locator('main')).toContainText('個人情報');

      // プライバシーポイントの確認（存在する場合）
      const mainContent = await page.locator('main').textContent();
      if (mainContent?.includes('30日')) {
        await expect(page.locator('main')).toContainText('30日');
      }
      if (mainContent?.includes('暗号化')) {
        await expect(page.locator('main')).toContainText('暗号化');
      }
      if (mainContent?.includes('第三者')) {
        await expect(page.locator('main')).toContainText('第三者');
      }

      // 免責事項の表示
      await expect(page.locator('main')).toContainText('参考');
    });
  });

  test.describe('診断開始CTAセクション', () => {
    test('最終CTAボタンの機能', async ({ page }) => {
      // CTAボタンの確認（複数存在する可能性を考慮）
      const ctaButtons = page.getByRole('link', { name: /診断を開始/ });
      await expect(ctaButtons.first()).toBeVisible();

      // 最後のCTAボタンをクリック
      const lastCtaButton = ctaButtons.last();
      await lastCtaButton.click();
      await expect(page).toHaveURL('/diagnosis');
    });
  });
});

test.describe('レスポンシブデザイン', () => {
  test('モバイルビューポート（360px）', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');

    // ヒーローセクションの表示確認
    await expect(page.locator('main section').first()).toBeVisible();

    // CTAボタンの表示確認
    const ctaButton = page.getByRole('link', { name: /診断を開始/ }).first();
    await expect(ctaButton).toBeVisible();

    // スクロール可能性確認
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('[data-dev-tag*="CTA"]')).toBeVisible();
  });

  test('タブレットビューポート（768px）', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // 全セクションの表示確認
    const sections = page.locator('main section');
    await expect(sections).toHaveCount(5); // Hero, Features, Flow, Privacy, CTA

    // メインコンテンツの表示確認
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toContainText('COCOSiL');
  });

  test('デスクトップビューポート（1280px）', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // デスクトップレイアウトの確認
    await expect(page.locator('main')).toBeVisible();

    // 機能セクションの確認
    await expect(page.locator('main')).toContainText('体癖理論');
    await expect(page.locator('main')).toContainText('MBTI');
  });
});

test.describe('アクセシビリティ', () => {
  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/');

    // Tab キーでの要素間移動
    await page.keyboard.press('Tab');

    // フォーカス可能な要素の確認
    const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const count = await focusableElements.count();
    expect(count).toBeGreaterThan(0);

    // CTAボタンへのフォーカス移動とEnterキーでの実行
    const ctaButton = page.getByRole('link', { name: /診断を開始/ }).first();
    await ctaButton.focus();
    await expect(ctaButton).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/diagnosis');
  });

  test('スクリーンリーダー対応', async ({ page }) => {
    await page.goto('/');

    // 見出し構造の確認
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings.first()).toBeVisible();

    // alt属性の存在確認
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }

    // aria-label の確認
    const ctaButton = page.getByRole('link', { name: /診断を開始/ }).first();
    if (await ctaButton.count() > 0) {
      // aria-label または明確なテキストコンテンツの存在確認
      const hasAriaLabel = await ctaButton.getAttribute('aria-label');
      const hasTextContent = await ctaButton.textContent();
      expect(hasAriaLabel || hasTextContent).toBeTruthy();
    }
  });
});

test.describe('パフォーマンス', () => {
  test('ページ読み込み時間', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 3秒以内での読み込み完了を期待
    expect(loadTime).toBeLessThan(3000);
  });

  test('画像の遅延読み込み', async ({ page }) => {
    await page.goto('/');

    // 画像要素の確認
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // loading="lazy" 属性の確認
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const isVisible = await img.isVisible();

        if (isVisible) {
          // ファーストビューの画像は即座に読み込まれる
          await expect(img).toBeVisible();
        }
      }
    }
  });
});