import { test, expect } from '@playwright/test';

/**
 * COCOSiL 診断結果重複検出テスト
 * 診断結果が2回保存される問題を調査
 */

test.describe('診断結果重複検出', () => {
  test('診断完了時のAPI呼び出し回数を検証', async ({ page }) => {
    // API呼び出しを追跡
    const apiCalls: Array<{ url: string; method: string; payload: any; timestamp: number }> = [];

    // /api/admin/diagnosis-results へのPOSTリクエストを監視
    await page.route('**/api/admin/diagnosis-results', async (route, request) => {
      const method = request.method();
      const url = request.url();

      if (method === 'POST') {
        const payload = request.postDataJSON();
        apiCalls.push({
          url,
          method,
          payload,
          timestamp: Date.now()
        });

        console.log(`📡 API呼び出し検出 #${apiCalls.length}:`, {
          time: new Date().toISOString(),
          payload: JSON.stringify(payload, null, 2)
        });
      }

      // リクエストを実行
      await route.continue();
    });

    // コンソールログも監視
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('自動保存') || text.includes('診断結果')) {
        consoleLogs.push(`[${msg.type()}] ${text}`);
        console.log(`🖥️  Console: ${text}`);
      }
    });

    // Step 1: ランディングページから診断開始
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const startButton = page.getByRole('link', { name: /診断を開始/ }).first();
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Step 2: 基本情報入力
    await expect(page).toHaveURL('/diagnosis');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[name="name"], input[placeholder*="名前"]').first();
    await nameInput.fill('重複検出テスト');

    const birthDateInput = page.locator('input[name="birthDate"], input[type="date"]').first();
    await birthDateInput.fill('1990-05-15');

    // 性別選択
    const maleRadio = page.locator('input[type="radio"][value="male"]').first();
    if (await maleRadio.count() > 0) {
      await maleRadio.check();
    }

    // 次へボタンクリック
    const nextButton = page.getByRole('button', { name: /次へ|進む|続行/ });
    await nextButton.click();

    // Step 3: MBTI診断（スキップまたは簡易回答）
    await page.waitForTimeout(1500);

    if (await page.locator('h1, h2').filter({ hasText: /MBTI/ }).count() > 0) {
      console.log('📋 MBTI診断ステップを検出');

      // 既知のMBTIを選択するオプションがあるかチェック
      const knownMbtiButton = page.getByRole('button', { name: /既知|知っている/ });
      if (await knownMbtiButton.count() > 0) {
        await knownMbtiButton.click();
        await page.waitForTimeout(500);

        // MBTI選択肢
        const mbtiSelect = page.locator('select').first();
        if (await mbtiSelect.count() > 0) {
          await mbtiSelect.selectOption('ENFP');
        }

        const confirmButton = page.getByRole('button', { name: /確定|次へ/ });
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
        }
      } else {
        // 質問に回答
        const mbtiQuestions = page.locator('input[type="radio"]');
        const questionCount = await mbtiQuestions.count();

        for (let i = 0; i < Math.min(questionCount, 12); i += 4) {
          const option = mbtiQuestions.nth(i);
          if (await option.isVisible()) {
            await option.check();
          }
        }

        const mbtiNextButton = page.getByRole('button', { name: /次へ|進む/ });
        if (await mbtiNextButton.count() > 0) {
          await mbtiNextButton.click();
        }
      }
    }

    // Step 4: 体癖診断
    await page.waitForTimeout(1500);

    if (await page.locator('h1, h2').filter({ hasText: /体癖/ }).count() > 0) {
      console.log('📋 体癖診断ステップを検出');

      // 直接入力オプションがあるかチェック
      const directInputButton = page.getByRole('button', { name: /直接入力|回答を入力/ });
      if (await directInputButton.count() > 0) {
        await directInputButton.click();
        await page.waitForTimeout(500);

        // 回答を直接入力（1〜10の数値）
        for (let i = 1; i <= 10; i++) {
          const input = page.locator(`input[name="q${i}"], input[placeholder*="${i}"]`).first();
          if (await input.count() > 0) {
            await input.fill(String(Math.floor(Math.random() * 5) + 1));
          }
        }

        const submitButton = page.getByRole('button', { name: /診断|完了|結果/ });
        if (await submitButton.count() > 0) {
          await submitButton.click();
        }
      } else {
        // 質問に回答
        const taihekiQuestions = page.locator('input[type="radio"]');
        const taihekiCount = await taihekiQuestions.count();

        for (let i = 0; i < Math.min(taihekiCount, 20); i += 2) {
          const option = taihekiQuestions.nth(i);
          if (await option.isVisible()) {
            await option.check();
          }
        }

        const completeButton = page.getByRole('button', { name: /完了|診断結果|結果/ });
        if (await completeButton.count() > 0) {
          await completeButton.click();
        }
      }
    }

    // Step 5: 結果ページ到達
    console.log('⏳ 結果ページの読み込みを待機中...');
    await page.waitForTimeout(3000); // 結果生成とAPI呼び出しを待機

    // 結果ページの確認
    await expect(page).toHaveURL(/\/results|\/diagnosis\/results/);
    console.log('✅ 結果ページに到達');

    // さらに待機してAPI呼び出しをキャプチャ
    await page.waitForTimeout(2000);

    // 検証: API呼び出し回数
    console.log('\n=== API呼び出し分析 ===');
    console.log(`総呼び出し回数: ${apiCalls.length}`);

    if (apiCalls.length > 0) {
      apiCalls.forEach((call, index) => {
        console.log(`\n呼び出し #${index + 1}:`);
        console.log(`  時刻: ${new Date(call.timestamp).toISOString()}`);
        console.log(`  名前: ${call.payload?.name}`);
        console.log(`  MBTI: ${call.payload?.mbti}`);
        console.log(`  体癖: ${call.payload?.mainTaiheki}`);
      });

      // 時間差を計算
      if (apiCalls.length > 1) {
        for (let i = 1; i < apiCalls.length; i++) {
          const timeDiff = apiCalls[i].timestamp - apiCalls[i - 1].timestamp;
          console.log(`\n呼び出し #${i} と #${i + 1} の時間差: ${timeDiff}ms`);
        }
      }
    }

    console.log('\n=== コンソールログ ===');
    consoleLogs.forEach(log => console.log(log));

    // アサーション: 1回だけ呼ばれるべき
    expect(apiCalls.length).toBe(1);

    if (apiCalls.length !== 1) {
      console.error(`❌ 期待: 1回, 実際: ${apiCalls.length}回`);
      console.error('重複が発生しています！');
    } else {
      console.log('✅ API呼び出しは1回のみ（正常）');
    }
  });

  test('AIチャット後の診断結果更新を検証', async ({ page }) => {
    // このテストはAIチャット機能が実装されている場合に実行
    test.skip(!process.env.OPENAI_API_KEY, 'OpenAI API key not configured');

    const apiCalls: Array<{ url: string; method: string; payload: any; timestamp: number }> = [];

    await page.route('**/api/admin/diagnosis-results', async (route, request) => {
      if (request.method() === 'POST') {
        const payload = request.postDataJSON();
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          payload,
          timestamp: Date.now()
        });

        console.log(`📡 診断結果保存 #${apiCalls.length}`);
        console.log(`  counselingCompleted: ${payload?.counselingCompleted}`);
        console.log(`  counselingSummary: ${payload?.counselingSummary ? 'あり' : 'なし'}`);
      }

      await route.continue();
    });

    // 診断完了まで実行（前のテストと同じフロー）
    await page.goto('/');
    // ... (省略: 診断フロー実行)

    // 結果ページからAIチャットへ遷移
    const chatButton = page.getByRole('link', { name: /AIチャット|相談/ });
    if (await chatButton.count() > 0) {
      await chatButton.click();

      // チャット画面でメッセージ送信
      const chatInput = page.locator('textarea, input[type="text"]').first();
      if (await chatInput.count() > 0) {
        await chatInput.fill('私の性格について教えてください');

        const sendButton = page.getByRole('button', { name: /送信|Send/ });
        if (await sendButton.count() > 0) {
          await sendButton.click();

          // AI応答待機
          await page.waitForTimeout(5000);

          // 終了ボタン
          const endButton = page.getByRole('button', { name: /終了|完了/ });
          if (await endButton.count() > 0) {
            await endButton.click();
          }
        }
      }
    }

    await page.waitForTimeout(2000);

    // 検証: chatSummary が含まれているか
    const callsWithSummary = apiCalls.filter(call => call.payload?.counselingSummary);
    console.log(`\nAIチャットサマリー付き呼び出し: ${callsWithSummary.length}/${apiCalls.length}`);

    expect(callsWithSummary.length).toBeGreaterThan(0);
  });
});
