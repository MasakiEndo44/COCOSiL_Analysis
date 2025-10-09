import { test, expect } from '@playwright/test';

test('Debug chat page structure', async ({ page }) => {
  // Mock diagnosis data
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
        dimensions: { EI: 'I', SN: 'N', TF: 'F', JP: 'P' }
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

  await page.goto('/diagnosis/chat');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'test-results/chat-page-debug.png', fullPage: true });

  // Log HTML structure
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('Page HTML:', bodyHTML.substring(0, 2000));

  // Check for all headings
  const h1 = await page.locator('h1').allTextContents();
  const h2 = await page.locator('h2').allTextContents();
  const h3 = await page.locator('h3').allTextContents();

  console.log('H1:', h1);
  console.log('H2:', h2);
  console.log('H3:', h3);

  // Check for buttons
  const buttons = await page.locator('button').allTextContents();
  console.log('Buttons:', buttons);
});
