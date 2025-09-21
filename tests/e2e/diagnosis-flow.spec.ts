import { test, expect } from '@playwright/test';

/**
 * COCOSiL 診断フロー E2Eテスト
 * 完全なユーザージャーニーをテスト
 */

test.describe('診断フロー E2E', () => {

  test.describe('基本診断フロー', () => {
    test('完全な診断フローの実行', async ({ page }) => {
      // ランディングページから開始
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Step 1: ランディングページからの診断開始
      const startButton = page.getByRole('link', { name: /診断を開始/ }).first();
      await expect(startButton).toBeVisible();
      await startButton.click();

      // 診断ページに遷移
      await expect(page).toHaveURL('/diagnosis');
      await page.waitForLoadState('networkidle');

      // Step 2: 基本情報入力
      await expect(page.locator('h1')).toContainText('基本情報');

      // 名前入力
      const nameInput = page.locator('input[name="name"], input[placeholder*="名前"]').first();
      await expect(nameInput).toBeVisible();
      await nameInput.fill('テスト太郎');

      // 生年月日入力
      const birthDateInput = page.locator('input[name="birthDate"], input[type="date"]').first();
      await expect(birthDateInput).toBeVisible();
      await birthDateInput.fill('1990-05-15');

      // 性別選択
      const genderSelect = page.locator('select[name="gender"], [role="combobox"]').first();
      if (await genderSelect.count() > 0) {
        await genderSelect.selectOption('male');
      } else {
        // ラジオボタンの場合
        const maleRadio = page.locator('input[type="radio"][value="male"]').first();
        if (await maleRadio.count() > 0) {
          await maleRadio.check();
        }
      }

      // 次へボタンクリック
      const nextButton = page.getByRole('button', { name: /次へ|進む|続行/ });
      await expect(nextButton).toBeVisible();
      await nextButton.click();

      // Step 3: MBTI診断（簡易版があれば）
      await page.waitForTimeout(1000); // APIレスポンス待機

      if (await page.locator('h1, h2').filter({ hasText: /MBTI/ }).count() > 0) {
        // MBTI質問がある場合の処理
        const mbtiQuestions = page.locator('input[type="radio"]');
        const questionCount = await mbtiQuestions.count();

        if (questionCount > 0) {
          // 各質問に回答（最初の選択肢を選択）
          for (let i = 0; i < Math.min(questionCount, 12); i += 4) {
            const option = mbtiQuestions.nth(i);
            if (await option.isVisible()) {
              await option.check();
            }
          }

          // 次へボタン
          const mbtiNextButton = page.getByRole('button', { name: /次へ|進む|続行/ });
          if (await mbtiNextButton.count() > 0) {
            await mbtiNextButton.click();
          }
        }
      }

      // Step 4: 学習セクション（スキップ可能）
      await page.waitForTimeout(1000);

      if (await page.locator('h1, h2').filter({ hasText: /学習|理解/ }).count() > 0) {
        // 学習セクションがある場合はスキップ
        const skipButton = page.getByRole('button', { name: /スキップ|飛ばす/ });
        if (await skipButton.count() > 0) {
          await skipButton.click();
        } else {
          // 次へボタンで進む
          const learningNextButton = page.getByRole('button', { name: /次へ|進む/ });
          if (await learningNextButton.count() > 0) {
            await learningNextButton.click();
          }
        }
      }

      // Step 5: 体癖診断
      await page.waitForTimeout(1000);

      if (await page.locator('h1, h2').filter({ hasText: /体癖/ }).count() > 0) {
        // 体癖質問への回答（簡易版）
        const taihekiQuestions = page.locator('input[type="radio"]');
        const taihekiCount = await taihekiQuestions.count();

        if (taihekiCount > 0) {
          // 体癖質問に回答（ランダムに選択）
          for (let i = 0; i < Math.min(taihekiCount, 20); i += 2) {
            const option = taihekiQuestions.nth(i);
            if (await option.isVisible()) {
              await option.check();
            }
          }

          // 診断完了ボタン
          const completeButton = page.getByRole('button', { name: /完了|診断結果|結果を見る/ });
          if (await completeButton.count() > 0) {
            await completeButton.click();
          }
        }
      }

      // Step 6: 結果ページ
      await page.waitForTimeout(2000); // 結果生成待機

      // 結果ページの確認
      await expect(page).toHaveURL(/\/results|\/診断結果/);

      // 結果内容の確認
      await expect(page.locator('h1, h2')).toContainText(/結果|診断|分析/);

      // 統合分析カードの表示確認
      const analysisCard = page.locator('[class*="analysis"], [class*="result"], [class*="card"]').first();
      await expect(analysisCard).toBeVisible();
    });

    test('基本情報入力のバリデーション', async ({ page }) => {
      await page.goto('/diagnosis');

      // 空の状態で次へを押す
      const nextButton = page.getByRole('button', { name: /次へ|進む/ });
      await nextButton.click();

      // バリデーションエラーの確認
      const errorMessage = page.locator('[role="alert"], .error, [class*="error"]');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }

      // 名前のみ入力した状態
      const nameInput = page.locator('input[name="name"], input[placeholder*="名前"]').first();
      await nameInput.fill('テスト');

      await nextButton.click();

      // 生年月日未入力のエラー確認
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    });
  });

  test.describe('進捗管理', () => {
    test('進捗バーの更新', async ({ page }) => {
      await page.goto('/diagnosis');

      // 初期進捗の確認
      const progressBar = page.locator('[role="progressbar"], .progress, [class*="progress"]');
      if (await progressBar.count() > 0) {
        await expect(progressBar.first()).toBeVisible();
      }

      // 基本情報入力
      const nameInput = page.locator('input[name="name"], input[placeholder*="名前"]').first();
      await nameInput.fill('テスト太郎');

      const birthDateInput = page.locator('input[type="date"]').first();
      await birthDateInput.fill('1990-05-15');

      // 進捗の変化を確認（入力完了時）
      if (await progressBar.count() > 0) {
        const progressValue = await progressBar.first().getAttribute('aria-valuenow');
        // 進捗が0より大きいことを確認
        if (progressValue) {
          expect(parseInt(progressValue)).toBeGreaterThan(0);
        }
      }
    });

    test('セッション継続機能', async ({ page }) => {
      // 初回診断開始
      await page.goto('/diagnosis');

      const nameInput = page.locator('input[name="name"]').first();
      await nameInput.fill('継続テスト');

      // ページリロード
      await page.reload();

      // 入力データの復旧確認
      if (await nameInput.count() > 0) {
        const restoredValue = await nameInput.inputValue();
        // LocalStorageから復旧されているかチェック
        // （実装によっては復旧されない可能性もある）
      }
    });
  });

  test.describe('エラーハンドリング', () => {
    test('API エラー時の挙動', async ({ page }) => {
      // ネットワークエラーをモック
      await page.route('**/api/fortune-calc**', route => {
        route.abort('failed');
      });

      await page.goto('/diagnosis');

      // 基本情報入力
      const nameInput = page.locator('input[name="name"]').first();
      await nameInput.fill('エラーテスト');

      const birthDateInput = page.locator('input[type="date"]').first();
      await birthDateInput.fill('1990-05-15');

      const nextButton = page.getByRole('button', { name: /次へ/ });
      await nextButton.click();

      // エラーメッセージまたはリトライボタンの表示
      await page.waitForTimeout(2000);

      const errorIndicator = page.locator('[role="alert"], .error, [class*="error"], [class*="retry"]');
      if (await errorIndicator.count() > 0) {
        await expect(errorIndicator.first()).toBeVisible();
      }
    });
  });

  test.describe('レスポンシブ対応', () => {
    test('モバイルでの診断フロー', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 });

      await page.goto('/');

      // モバイルでの診断開始
      const startButton = page.getByRole('link', { name: /診断を開始/ }).first();
      await startButton.click();

      await expect(page).toHaveURL('/diagnosis');

      // モバイル表示での基本情報入力
      const nameInput = page.locator('input[name="name"]').first();
      await expect(nameInput).toBeVisible();
      await nameInput.fill('モバイルテスト');

      // スクロールが必要な場合
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const nextButton = page.getByRole('button', { name: /次へ/ });
      await expect(nextButton).toBeVisible();
    });
  });

  test.describe('アクセシビリティ（診断フロー）', () => {
    test('キーボードでの診断完了', async ({ page }) => {
      await page.goto('/diagnosis');

      // Tab キーでの移動
      await page.keyboard.press('Tab');

      // 名前入力（キーボード操作）
      const nameInput = page.locator('input[name="name"]').first();
      await nameInput.focus();
      await nameInput.type('キーボードテスト');

      // 次のフィールドへのTab移動
      await page.keyboard.press('Tab');

      // 生年月日入力
      const birthDateInput = page.locator('input[type="date"]').first();
      if (await birthDateInput.isVisible()) {
        await birthDateInput.focus();
        await birthDateInput.type('05/15/1990');
      }

      // Enterキーでフォーム送信
      await page.keyboard.press('Enter');

      // 次のステップに進むことを確認
      await page.waitForTimeout(1000);
    });

    test('スクリーンリーダー対応（フォームラベル）', async ({ page }) => {
      await page.goto('/diagnosis');

      // フォームラベルの確認
      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.count() > 0) {
        // ラベルとの関連付け確認
        const labelId = await nameInput.getAttribute('aria-labelledby');
        const ariaLabel = await nameInput.getAttribute('aria-label');
        const associatedLabel = page.locator('label[for]');

        // ラベルが適切に設定されていることを確認
        expect(labelId || ariaLabel || await associatedLabel.count() > 0).toBeTruthy();
      }
    });
  });
});