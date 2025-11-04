import { test, expect } from '@playwright/test';

test.describe('診断ページのボタン表示問題を調査', () => {
  test('診断ページにアクセスしてボタンの表示状態を確認', async ({ page }) => {
    // コンソールログとエラーをキャプチャ
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    page.on('console', (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
    });

    // ページにアクセス
    console.log('診断ページにアクセス中...');
    await page.goto('http://localhost:3000/diagnosis', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // スクリーンショットを撮影
    await page.screenshot({
      path: 'tests/debug-screenshots/diagnosis-page-initial.png',
      fullPage: true
    });
    console.log('スクリーンショット保存: tests/debug-screenshots/diagnosis-page-initial.png');

    // ページタイトルを確認
    const title = await page.title();
    console.log(`ページタイトル: ${title}`);

    // ページのHTML構造を取得
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('ページHTML（最初の500文字）:');
    console.log(bodyHTML.substring(0, 500));

    // ボタンを探す
    const buttons = await page.locator('button').all();
    console.log(`\n検出されたボタンの数: ${buttons.length}`);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`ボタン${i + 1}: テキスト="${text}", 表示=${isVisible}`);
    }

    // 特定のボタンテキストを検索
    const buttonTexts = ['匿名で診断を始める', 'ログインして診断', 'アカウント登録'];
    for (const text of buttonTexts) {
      const button = page.getByRole('button', { name: text });
      const count = await button.count();
      console.log(`"${text}" ボタン: ${count}個見つかりました`);
    }

    // リンクを確認
    const links = await page.locator('a').all();
    console.log(`\n検出されたリンクの数: ${links.length}`);

    // メインコンテンツエリアを確認
    const mainContent = page.locator('main');
    const mainExists = await mainContent.count();
    console.log(`\nmainタグ: ${mainExists}個`);

    if (mainExists > 0) {
      const mainHTML = await mainContent.innerHTML();
      console.log('mainタグのHTML（最初の500文字）:');
      console.log(mainHTML.substring(0, 500));
    }

    // コンソールメッセージを出力
    console.log('\n=== コンソールメッセージ ===');
    consoleMessages.forEach((msg) => console.log(msg));

    // エラーを出力
    if (errors.length > 0) {
      console.log('\n=== ページエラー ===');
      errors.forEach((err) => console.log(err));
    }

    // 特定の要素を探す
    const authChoiceScreen = page.locator('[data-testid="auth-choice-screen"]');
    const authChoiceCount = await authChoiceScreen.count();
    console.log(`\n認証選択画面: ${authChoiceCount}個`);

    // DOMの状態を詳細にログ
    const bodyText = await page.locator('body').textContent();
    console.log('\n=== ページの表示テキスト（最初の1000文字） ===');
    console.log(bodyText?.substring(0, 1000));
  });
});
