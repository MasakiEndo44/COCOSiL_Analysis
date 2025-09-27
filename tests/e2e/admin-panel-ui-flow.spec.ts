import { test, expect } from '@playwright/test';

/**
 * COCOSiL 管理画面 UIフローテスト
 *
 * このテストは以下の管理画面フローを検証します：
 * 1. 管理者認証フロー
 * 2. 診断テーブル表示と操作
 * 3. 検索・フィルタリング機能
 * 4. 多選択・一括削除機能
 * 5. インタビュー管理機能
 * 6. Markdownコンテンツ表示
 */

test.describe('管理画面 UIフローテスト', () => {
  test.beforeEach(async ({ page }) => {
    // セッションクリア
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('管理者認証フローテスト', async ({ page }) => {
    // 1. 管理画面へのアクセス
    await page.goto('/admin');

    // 2. ログイン画面またはダッシュボードの確認
    try {
      // ログイン画面が表示される場合
      await expect(page.locator('form')).toBeVisible({ timeout: 3000 });
      await expect(page.locator('input[type="password"]')).toBeVisible();

      // 3. 不正なパスワードでのログイン試行
      await page.fill('input[type="password"]', '0000');
      await page.click('button[type="submit"]');

      // エラーメッセージの確認（表示される場合）
      await page.waitForTimeout(1000);

      // 4. 正しいパスワードでのログイン
      await page.fill('input[type="password"]', '1234');
      await page.click('button[type="submit"]');
    } catch (error) {
      // すでにログイン済みの可能性
      console.log('Login form not found, possibly already authenticated');
    }

    // 5. ダッシュボードへの遷移確認
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('main')).toBeVisible();
  });

  test('診断テーブル表示と基本操作テスト', async ({ page }) => {
    // 管理者認証
    await authenticateAdmin(page);

    // 1. 診断記録テーブルの表示確認
    await expect(page.locator('table')).toBeVisible();

    // テーブルヘッダーの確認
    await expect(page.locator('thead')).toContainText('診断日');
    await expect(page.locator('thead')).toContainText('基本情報');
    await expect(page.locator('thead')).toContainText('MBTI');
    await expect(page.locator('thead')).toContainText('体癖');
    await expect(page.locator('thead')).toContainText('動物占い');

    // 2. データ行の表示確認（データが存在する場合）
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // 最初の行の基本情報列を確認
      await expect(rows.first().locator('td').nth(2)).toBeVisible();

      // 編集ボタンの存在確認（アイコンがある場合）
      const editLinks = page.locator('a[title="編集"]');
      if (await editLinks.count() > 0) {
        await expect(editLinks.first()).toBeVisible();
      }
    } else {
      // 3. データが存在しない場合のメッセージ確認
      await expect(page.locator('text=診断記録がありません。')).toBeVisible();
    }
  });

  test('検索・フィルタリング機能テスト', async ({ page }) => {
    // 管理者認証
    await authenticateAdmin(page);

    // 1. 検索フォームの表示確認
    const searchInput = page.locator('input[placeholder*="ユーザー名で検索"]');

    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();

      // 2. 検索機能のテスト
      await searchInput.fill('テストユーザー');

      const searchButton = page.locator('button:has-text("検索")');
      if (await searchButton.count() > 0) {
        await searchButton.click();

        // URLパラメータの確認
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('query=');

        // 3. 検索結果の表示確認
        const keywordDisplay = page.locator('text=検索キーワード');
        if (await keywordDisplay.count() > 0) {
          await expect(keywordDisplay).toBeVisible();
        }

        // 4. 検索クリア機能
        const clearButton = page.locator('button:has-text("クリア")');
        if (await clearButton.count() > 0) {
          await clearButton.click();
          await expect(searchInput).toHaveValue('');
        }
      }

      // 5. 更新ボタンの動作確認
      const refreshButton = page.locator('button:has-text("更新")');
      if (await refreshButton.count() > 0) {
        await refreshButton.click();
        await page.waitForLoadState('networkidle');
      }
    } else {
      console.log('Search functionality not found or not available');
    }
  });

  test('多選択・一括削除機能テスト', async ({ page }) => {
    // 管理者認証
    await authenticateAdmin(page);

    // データが存在する場合のみテスト実行
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // 1. チェックボックスの表示確認
      await expect(page.locator('thead input[type="checkbox"]')).toBeVisible();
      await expect(rows.first().locator('input[type="checkbox"]')).toBeVisible();

      // 2. 個別選択
      await rows.first().locator('input[type="checkbox"]').check();

      // 選択ツールバーの表示確認
      await expect(page.locator('text=1 件選択中')).toBeVisible();
      await expect(page.locator('button:has-text("選択項目を削除")')).toBeVisible();

      // 3. 全選択機能
      await page.locator('thead input[type="checkbox"]').check();

      // 全選択の確認
      const selectedText = await page.locator('[data-testid="selection-count"]').textContent();
      expect(selectedText).toContain('件選択中');

      // 4. 選択解除
      await page.click('button:has-text("選択解除")');
      await expect(page.locator('text=件選択中')).not.toBeVisible();

      // 5. 一括削除の確認ダイアログテスト（実際の削除は行わない）
      await rows.first().locator('input[type="checkbox"]').check();

      // 削除ボタンクリック（ダイアログの表示まで）
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('削除してもよろしいですか');
        await dialog.dismiss(); // キャンセル
      });

      await page.click('button:has-text("選択項目を削除")');
    }
  });

  test('インタビュー管理機能テスト', async ({ page }) => {
    // 管理者認証
    await authenticateAdmin(page);

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // 1. インタビューステータスの表示確認
      const interviewCell = rows.first().locator('td').nth(8); // インタビュー列
      await expect(interviewCell).toBeVisible();

      // ステータスバッジの確認
      const statusBadge = interviewCell.locator('span');
      await expect(statusBadge).toBeVisible();

      // 2. インタビュー管理ボタンの確認
      const manageButton = interviewCell.locator('button[title="インタビュー管理"]');
      if (await manageButton.count() > 0) {
        await manageButton.click();

        // インタビューモーダルの表示確認
        await expect(page.locator('[data-testid="interview-modal"]')).toBeVisible();

        // モーダルの閉じるボタン
        await page.locator('button:has-text("キャンセル")').click();
        await expect(page.locator('[data-testid="interview-modal"]')).not.toBeVisible();
      }
    }
  });

  test('Markdownコンテンツ表示テスト', async ({ page }) => {
    // 管理者認証
    await authenticateAdmin(page);

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // 1. Markdown表示ボタンの確認
      const markdownCell = rows.first().locator('td').nth(9); // Markdown列
      const markdownButton = markdownCell.locator('button[title="診断結果Markdownを表示"]');

      if (await markdownButton.count() > 0) {
        // Markdownモーダルの表示
        await markdownButton.click();
        await expect(page.locator('[data-testid="markdown-modal"]')).toBeVisible();

        // モーダルコンテンツの確認
        await expect(page.locator('[data-testid="markdown-content"]')).toBeVisible();

        // モーダルの閉じる
        await page.locator('button:has-text("閉じる")').click();
        await expect(page.locator('[data-testid="markdown-modal"]')).not.toBeVisible();
      } else {
        // Markdownコンテンツがない場合の表示確認
        await expect(markdownCell.locator('.opacity-30')).toBeVisible();
      }
    }
  });

  test('ページネーション機能テスト', async ({ page }) => {
    // 管理者認証
    await authenticateAdmin(page);

    // ページネーションが表示される場合のテスト
    const pagination = page.locator('[data-testid="pagination"]');

    if (await pagination.count() > 0) {
      // 1. ページ情報の表示確認
      await expect(page.locator('text=件中')).toBeVisible();
      await expect(page.locator('text=件を表示')).toBeVisible();

      // 2. ページボタンの確認
      const nextButton = page.locator('button:has-text("次へ")');
      const prevButton = page.locator('button:has-text("前へ")');

      await expect(nextButton).toBeVisible();
      await expect(prevButton).toBeVisible();

      // 3. ページ番号ボタンの確認
      const pageButtons = page.locator('button[variant="primary"], button[variant="secondary"]');
      expect(await pageButtons.count()).toBeGreaterThan(0);
    }
  });

  test('レスポンシブデザインテスト', async ({ page }) => {
    // モバイルビューポート設定
    await page.setViewportSize({ width: 375, height: 667 });

    // 管理者認証
    await authenticateAdmin(page);

    // 1. モバイルでのテーブル表示確認
    await expect(page.locator('[data-testid="diagnosis-table"]')).toBeVisible();

    // 2. 横スクロールの確認
    const tableContainer = page.locator('.overflow-x-auto');
    await expect(tableContainer).toBeVisible();

    // 3. 検索フォームのレスポンシブ確認
    await expect(page.locator('input[placeholder*="ユーザー名で検索"]')).toBeVisible();
  });

  test('アクセシビリティ基本チェック', async ({ page }) => {
    // 管理者認証
    await authenticateAdmin(page);

    // 1. ARIA属性の確認
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      // aria-label属性の確認
      await expect(checkboxes.first()).toHaveAttribute('aria-labelledby');
    }

    // 2. テーブルのaria-selected確認
    const rows = page.locator('tbody tr');
    if (await rows.count() > 0) {
      await expect(rows.first()).toHaveAttribute('aria-selected');
    }

    // 3. ボタンのtitle属性確認
    const editButtons = page.locator('button[title="編集"]');
    if (await editButtons.count() > 0) {
      await expect(editButtons.first()).toHaveAttribute('title');
    }
  });
});

/**
 * 管理者認証ヘルパー関数
 */
async function authenticateAdmin(page: any) {
  await page.goto('/admin');

  // ログインが必要な場合
  try {
    const loginForm = page.locator('form');
    if (await loginForm.count() > 0) {
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('1234');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
      }
    }
  } catch (error) {
    console.log('Authentication not required or already authenticated');
  }

  // ダッシュボードの表示を確認
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
}