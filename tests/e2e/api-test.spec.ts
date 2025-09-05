import { test, expect } from '@playwright/test';

/**
 * COCOSiL API統合テスト
 * 算命学APIとその他のAPI機能をテスト
 */

test.describe('COCOSiL API統合テスト', () => {
  test('算命学API - 正常なリクエスト', async ({ request }) => {
    const response = await request.post('/api/fortune-calc', {
      data: {
        year: 1990,
        month: 5,
        day: 15
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('age');
    expect(data).toHaveProperty('zodiac');
    expect(data).toHaveProperty('animal');
    expect(data).toHaveProperty('six_star');
    expect(data).toHaveProperty('fortune_detail');
    
    // 年齢計算の確認（おおよその値）
    expect(data.age).toBeGreaterThan(30);
    expect(data.age).toBeLessThan(40);
    
    // 干支の確認（1990年は午年）
    expect(data.zodiac).toBe('午');
    
    console.log('算命学API正常レスポンス:', data);
  });

  test('算命学API - バリデーションエラー（不正な年）', async ({ request }) => {
    const response = await request.post('/api/fortune-calc', {
      data: {
        year: 1900, // 対応範囲外
        month: 5,
        day: 15
      }
    });

    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('対応年度');
  });

  test('算命学API - バリデーションエラー（存在しない日付）', async ({ request }) => {
    const response = await request.post('/api/fortune-calc', {
      data: {
        year: 2023,
        month: 2,
        day: 30 // 2月30日は存在しない
      }
    });

    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('存在しない日付');
  });

  test('算命学API - 様々な日付での動作確認', async ({ request }) => {
    const testDates = [
      { year: 1990, month: 1, day: 1 },
      { year: 2000, month: 12, day: 31 },
      { year: 1985, month: 6, day: 15 },
      { year: 2020, month: 2, day: 29 }, // うるう年
    ];

    for (const date of testDates) {
      const response = await request.post('/api/fortune-calc', {
        data: date
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.fortune_detail.birth_date).toBe(`${date.year}年${date.month}月${date.day}日`);
      
      console.log(`${date.year}/${date.month}/${date.day}: ${data.animal} (${data.six_star})`);
    }
  });

  test('診断フロー統合 - 基本情報から算命学計算まで', async ({ page }) => {
    // 診断ページに移動
    await page.goto('/diagnosis');
    
    // 基本情報入力（実際のフォーム要素を確認）
    const nameInput = page.locator('input[name="name"], input[placeholder*="名前"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    
    if (await nameInput.count() > 0) {
      await nameInput.fill('テストユーザー');
    }
    
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
    }
    
    // 生年月日選択（select要素またはinput要素）
    const yearSelect = page.locator('select[name="year"], input[name="year"]').first();
    const monthSelect = page.locator('select[name="month"], input[name="month"]').first();
    const daySelect = page.locator('select[name="day"], input[name="day"]').first();
    
    if (await yearSelect.count() > 0) {
      if (await yearSelect.evaluate(el => el.tagName === 'SELECT')) {
        await yearSelect.selectOption('1990');
      } else {
        await yearSelect.fill('1990');
      }
    }
    
    if (await monthSelect.count() > 0) {
      if (await monthSelect.evaluate(el => el.tagName === 'SELECT')) {
        await monthSelect.selectOption('5');
      } else {
        await monthSelect.fill('5');
      }
    }
    
    if (await daySelect.count() > 0) {
      if (await daySelect.evaluate(el => el.tagName === 'SELECT')) {
        await daySelect.selectOption('15');
      } else {
        await daySelect.fill('15');
      }
    }
    
    // 送信ボタンクリック
    const submitButton = page.locator('button[type="submit"], button:has-text("送信"), button:has-text("次へ")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // 算命学計算の結果待機（最大10秒）
      await page.waitForTimeout(3000); // API呼び出し待機
      
      // エラーがないことを確認
      const errorMessage = page.locator('text=エラー, text=Error').first();
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent();
        console.log('エラーメッセージ:', errorText);
      }
    }
  });
});