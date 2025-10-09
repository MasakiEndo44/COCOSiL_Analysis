import { test, expect } from '@playwright/test';

/**
 * AIチャット終了判定機能 E2Eテスト
 * Phase 4: Playwright E2E Testing
 *
 * Tested scenarios:
 * 1. Completion message displays when resolved=true & confidence>=0.8
 * 2. Continue button hides the completion message
 * 3. No completion message when user asks new questions (resolved=false)
 */

test.describe('Chat Completion Detection E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user diagnosis data in localStorage
    await page.addInitScript(() => {
      const mockDiagnosisData = {
        sessionId: 'test-session-123',
        basicInfo: {
          name: 'テスト太郎',
          birthDate: '1990-05-15',
          gender: 'male',
          email: 'test@example.com'
        },
        mbti: {
          type: 'INFP',
          dimensions: {
            EI: 'I',
            SN: 'N',
            TF: 'F',
            JP: 'P'
          }
        },
        taiheki: {
          primary: 3,
          secondary: 4,
          scores: { 1: 2, 2: 3, 3: 8, 4: 7, 5: 4, 6: 5, 7: 3, 8: 2, 9: 4, 10: 3 }
        },
        fortune: {
          animal: '黒ひょう',
          sixStar: '禄存星',
          westernZodiac: '牡牛座'
        },
        currentStep: 'integration',
        progress: 100,
        completedSteps: ['basic', 'mbti', 'taiheki', 'fortune'],
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('diagnosis-store', JSON.stringify({
        state: mockDiagnosisData,
        version: 0
      }));
    });
  });

  /**
   * Scenario 1: Completion message displays when AI detects resolution
   * GPT-4 returns resolved=true & confidence>=0.8
   */
  test('should display completion message when conversation is resolved', async ({ page }) => {
    // Mock streaming API response with completion detection
    await page.route('**/api/ai/chat', async (route) => {
      const headers = {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache',
        'connection': 'keep-alive'
      };

      // Simulated SSE stream chunks
      const chunks = [
        'data: {"choices":[{"delta":{"role":"assistant","content":"なるほど"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"、ご自身の"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"感受性を"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"理解されたのですね。"}}]}\n\n',
        'data: {"type":"metadata","completionDetection":{"resolved":true,"confidence":0.85,"nextAction":"今後も必要に応じてお気軽にご相談ください。","shouldShowContinueButton":true}}\n\n',
        'data: [DONE]\n\n'
      ];

      const body = chunks.join('');
      await route.fulfill({
        status: 200,
        headers,
        body
      });
    });

    // Navigate to chat page
    await page.goto('/diagnosis/chat');
    await page.waitForLoadState('networkidle');

    // Wait for topic selection screen
    await page.waitForSelector('h2:has-text("相談内容をお選びください")', { timeout: 10000 });

    // Select a topic to start conversation
    const relationshipTopic = page.locator('button').filter({ hasText: '人間関係の悩み' });
    await expect(relationshipTopic).toBeVisible();
    await relationshipTopic.click();

    // Wait for chat interface to appear and AI initial message
    await page.waitForTimeout(2000);

    // Verify we're in consultation phase (textarea should be visible)
    const messageInput = page.locator('textarea[placeholder="メッセージを入力してください..."]');
    await expect(messageInput).toBeVisible({ timeout: 5000 });

    // Send a message that triggers completion detection
    await messageInput.fill('ありがとうございます。よく理解できました。');

    const sendButton = page.getByRole('button', { name: /送信/ });
    await sendButton.click();

    // Wait for AI response to complete
    await page.waitForTimeout(2000);

    // Assert: Completion message should be visible
    const completionMessage = page.locator('[data-testid="completion-message"]');
    await expect(completionMessage).toBeVisible({ timeout: 5000 });

    // Assert: Next action text should be displayed
    await expect(completionMessage).toContainText('今後も必要に応じて');

    // Assert: Continue button should be visible
    const continueButton = page.locator('[data-testid="continue-button"]');
    await expect(continueButton).toBeVisible();
  });

  /**
   * Scenario 2: Continue button hides completion message
   * User clicks "会話を続ける" button
   */
  test('should hide completion message when continue button is clicked', async ({ page }) => {
    // Mock streaming API response with completion detection
    await page.route('**/api/ai/chat', async (route) => {
      const headers = {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache'
      };

      const chunks = [
        'data: {"choices":[{"delta":{"role":"assistant","content":"お役に立ててよかったです。"}}]}\n\n',
        'data: {"type":"metadata","completionDetection":{"resolved":true,"confidence":0.9,"nextAction":"また何かあればお気軽にどうぞ。","shouldShowContinueButton":true}}\n\n',
        'data: [DONE]\n\n'
      ];

      await route.fulfill({
        status: 200,
        headers,
        body: chunks.join('')
      });
    });

    await page.goto('/diagnosis/chat');
    await page.waitForLoadState('networkidle');

    // Wait for topic selection screen
    await page.waitForSelector('h2:has-text("相談内容をお選びください")', { timeout: 10000 });

    // Select topic to start conversation
    const relationshipTopic = page.locator('button').filter({ hasText: '人間関係の悩み' });
    await expect(relationshipTopic).toBeVisible();
    await relationshipTopic.click();

    // Wait for chat interface and AI initial message
    await page.waitForTimeout(2000);

    // Send message to trigger completion
    const messageInput = page.locator('textarea[placeholder="メッセージを入力してください..."]');
    await expect(messageInput).toBeVisible({ timeout: 5000 });
    await messageInput.fill('本当にありがとうございました。');
    await page.getByRole('button', { name: /送信/ }).click();
    await page.waitForTimeout(2000);

    // Verify completion message is visible
    const completionMessage = page.locator('[data-testid="completion-message"]');
    await expect(completionMessage).toBeVisible({ timeout: 5000 });

    // Click continue button
    const continueButton = page.locator('[data-testid="continue-button"]');
    await continueButton.click();

    // Assert: Completion message should be hidden
    await expect(completionMessage).toBeHidden({ timeout: 2000 });
  });

  /**
   * Scenario 3: No completion message when conversation is not resolved
   * GPT-4 returns resolved=false or confidence<0.8
   */
  test('should not display completion message when user asks new questions', async ({ page }) => {
    // Mock streaming API response WITHOUT completion detection
    await page.route('**/api/ai/chat', async (route) => {
      const headers = {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache'
      };

      const chunks = [
        'data: {"choices":[{"delta":{"role":"assistant","content":"それについて"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"もう少し詳しく"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"教えていただけますか？"}}]}\n\n',
        // No completionDetection metadata - conversation continues
        'data: [DONE]\n\n'
      ];

      await route.fulfill({
        status: 200,
        headers,
        body: chunks.join('')
      });
    });

    await page.goto('/diagnosis/chat');
    await page.waitForLoadState('networkidle');

    // Wait for topic selection screen
    await page.waitForSelector('h2:has-text("相談内容をお選びください")', { timeout: 10000 });

    // Select topic
    const relationshipTopic = page.locator('button').filter({ hasText: '人間関係の悩み' });
    await expect(relationshipTopic).toBeVisible();
    await relationshipTopic.click();

    // Wait for chat interface
    await page.waitForTimeout(2000);

    // Send a message that triggers ongoing conversation
    const messageInput = page.locator('textarea[placeholder="メッセージを入力してください..."]');
    await expect(messageInput).toBeVisible({ timeout: 5000 });
    await messageInput.fill('もっと詳しく知りたいのですが...');
    await page.getByRole('button', { name: /送信/ }).click();
    await page.waitForTimeout(2000);

    // Assert: Completion message should NOT be visible
    const completionMessage = page.locator('[data-testid="completion-message"]');
    await expect(completionMessage).not.toBeVisible();
  });

  /**
   * Scenario 4: Borderline confidence threshold (0.79 vs 0.8)
   * Confidence 0.79 should NOT trigger completion message
   */
  test('should not display completion message when confidence is below threshold', async ({ page }) => {
    await page.route('**/api/ai/chat', async (route) => {
      const headers = {
        'content-type': 'text/event-stream; charset=utf-8'
      };

      const chunks = [
        'data: {"choices":[{"delta":{"role":"assistant","content":"わかりました。"}}]}\n\n',
        // Confidence 0.79 < threshold 0.8
        'data: {"type":"metadata","completionDetection":{"resolved":true,"confidence":0.79,"nextAction":"引き続きご相談ください。","shouldShowContinueButton":false}}\n\n',
        'data: [DONE]\n\n'
      ];

      await route.fulfill({
        status: 200,
        headers,
        body: chunks.join('')
      });
    });

    await page.goto('/diagnosis/chat');
    await page.waitForLoadState('networkidle');

    // Wait for topic selection
    await page.waitForSelector('h2:has-text("相談内容をお選びください")', { timeout: 10000 });

    const relationshipTopic = page.locator('button').filter({ hasText: '人間関係の悩み' });
    await expect(relationshipTopic).toBeVisible();
    await relationshipTopic.click();

    // Wait for chat interface
    await page.waitForTimeout(2000);

    const messageInput = page.locator('textarea[placeholder="メッセージを入力してください..."]');
    await expect(messageInput).toBeVisible({ timeout: 5000 });
    await messageInput.fill('ありがとうございます。');
    await page.getByRole('button', { name: /送信/ }).click();
    await page.waitForTimeout(2000);

    // Assert: shouldShowContinueButton=false prevents display
    const completionMessage = page.locator('[data-testid="completion-message"]');
    await expect(completionMessage).not.toBeVisible();
  });
});
