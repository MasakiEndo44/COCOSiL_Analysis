import { test, expect } from '@playwright/test';

/**
 * COCOSiL 全機能統合テスト
 * 
 * このテストは以下の統合フローを検証します：
 * 1. 基本情報入力（F001-1）
 * 2. MBTI診断
 * 3. 体癖診断（F002）
 * 4. 算命学API統合
 * 5. 統合結果表示
 * 6. 管理者データ送信
 */

test.describe('COCOSiL 全機能統合テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ローカルストレージをクリア
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('完全診断フロー - 基本情報からClaude AI用データ生成まで', async ({ page }) => {
    // 1. ホームページアクセス
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('COCOSiL');
    
    // 2. 診断開始ボタンクリック
    await page.click('[data-testid="start-diagnosis-button"]');
    await expect(page).toHaveURL('/diagnosis');

    // 3. 基本情報入力フォーム（F001-1）
    await page.fill('[data-testid="basic-info-name"]', '山田太郎');
    await page.fill('[data-testid="basic-info-email"]', 'test@example.com');
    
    // 生年月日入力
    await page.selectOption('[data-testid="basic-info-year"]', '1990');
    await page.selectOption('[data-testid="basic-info-month"]', '5');
    await page.selectOption('[data-testid="basic-info-day"]', '15');
    
    // 性別選択
    await page.check('[data-testid="basic-info-gender-male"]');
    
    // 基本情報送信
    await page.click('[data-testid="basic-info-submit"]');
    
    // 算命学API呼び出し待機
    await page.waitForSelector('[data-testid="fortune-result"]', { timeout: 10000 });
    
    // 4. MBTI情報収集
    await page.click('[data-testid="mbti-unknown-button"]'); // 「わからない」を選択
    
    // 12問MBTI診断
    const mbtiQuestions = [
      { selector: '[data-testid="mbti-q1-extrovert"]', answer: 'extrovert' },
      { selector: '[data-testid="mbti-q2-sensing"]', answer: 'sensing' },
      { selector: '[data-testid="mbti-q3-thinking"]', answer: 'thinking' },
      { selector: '[data-testid="mbti-q4-judging"]', answer: 'judging' }
    ];
    
    for (const question of mbtiQuestions) {
      await page.click(question.selector);
    }
    
    await page.click('[data-testid="mbti-submit"]');
    
    // 5. 体癖診断（F002）
    await expect(page).toHaveURL('/diagnosis/taiheki');
    
    // 20問体癖診断 - サンプル回答（1種傾向）
    for (let i = 1; i <= 20; i++) {
      await page.click(`[data-testid="taiheki-q${i}-option1"]`);
    }
    
    await page.click('[data-testid="taiheki-submit"]');
    
    // 6. 統合結果表示
    await expect(page).toHaveURL('/diagnosis/results');
    
    // 結果の要素確認
    await expect(page.locator('[data-testid="mbti-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="taiheki-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="fortune-result"]')).toBeVisible();
    
    // Claude AI用プロンプト生成確認
    await expect(page.locator('[data-testid="claude-prompt"]')).toBeVisible();
    
    // 7. 管理者データ送信
    await page.click('[data-testid="admin-submit-button"]');
    
    // 成功メッセージ確認
    await expect(page.locator('[data-testid="submit-success"]')).toBeVisible();
  });

  test('エラーハンドリング - 算命学API障害時の動作', async ({ page }) => {
    // APIエラーをシミュレーション
    await page.route('/api/fortune-calc', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto('/diagnosis');
    
    // 基本情報入力
    await page.fill('[data-testid="basic-info-name"]', '山田太郎');
    await page.fill('[data-testid="basic-info-email"]', 'test@example.com');
    await page.selectOption('[data-testid="basic-info-year"]', '1990');
    await page.selectOption('[data-testid="basic-info-month"]', '5');
    await page.selectOption('[data-testid="basic-info-day"]', '15');
    await page.check('[data-testid="basic-info-gender-male"]');
    
    await page.click('[data-testid="basic-info-submit"]');
    
    // エラーメッセージ表示確認
    await expect(page.locator('[data-testid="api-error-message"]')).toBeVisible();
    
    // リトライボタン確認
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('データ永続化 - ページリロード後の状態復元', async ({ page }) => {
    await page.goto('/diagnosis');
    
    // 基本情報入力
    await page.fill('[data-testid="basic-info-name"]', '佐藤花子');
    await page.fill('[data-testid="basic-info-email"]', 'hanako@example.com');
    
    // ページリロード
    await page.reload();
    
    // 状態が復元されることを確認
    await expect(page.locator('[data-testid="basic-info-name"]')).toHaveValue('佐藤花子');
    await expect(page.locator('[data-testid="basic-info-email"]')).toHaveValue('hanako@example.com');
  });

  test('管理者認証フロー', async ({ page }) => {
    await page.goto('/admin');
    
    // 認証画面表示確認
    await expect(page.locator('[data-testid="admin-login"]')).toBeVisible();
    
    // 正しいパスワード入力
    await page.fill('[data-testid="admin-password"]', '1234');
    await page.click('[data-testid="admin-login-button"]');
    
    // ダッシュボード表示確認
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test('レスポンシブデザイン - モバイル端末での動作', async ({ page }) => {
    // モバイル画面サイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // ヘッダーとナビゲーションの表示確認
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
    
    // 診断フローの実行確認（簡易版）
    await page.click('[data-testid="start-diagnosis-button"]');
    await expect(page).toHaveURL('/diagnosis');
    
    // フォームの表示確認
    await expect(page.locator('[data-testid="basic-info-form"]')).toBeVisible();
  });
});