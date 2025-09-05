import { test, expect } from '@playwright/test';

/**
 * COCOSiL 基本動作確認テスト
 * 各ページが正常に表示されるかを確認
 */

test.describe('COCOSiL 基本動作確認', () => {
  test('ホームページが正常に表示される', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトル確認
    await expect(page).toHaveTitle(/COCOSiL/);
    
    // メインヘッダーが表示される
    await expect(page.locator('h1')).toBeVisible();
    
    // 診断開始ボタンが表示される
    await expect(page.getByText('診断を開始する')).toBeVisible();
  });

  test('診断ページにナビゲーションできる', async ({ page }) => {
    await page.goto('/');
    
    // 診断開始ボタンをクリック
    await page.click('text=診断を開始する');
    
    // 診断ページに遷移することを確認
    await expect(page).toHaveURL('/diagnosis');
    
    // 基本情報フォームが表示される
    await expect(page.locator('form')).toBeVisible();
  });

  test('管理者ページが表示される', async ({ page }) => {
    await page.goto('/admin');
    
    // 認証フォームが表示される
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('学習ページが表示される', async ({ page }) => {
    await page.goto('/learn/taiheki');
    
    // 学習コンテンツが表示される
    await expect(page.locator('nav')).toBeVisible(); // サイドバーナビゲーション
  });
});