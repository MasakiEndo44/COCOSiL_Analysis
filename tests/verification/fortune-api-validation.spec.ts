import { test, expect } from '@playwright/test';
import { FortuneDataCollector, FortuneTestData, ValidationResult } from './fortune-data-collector';

test.describe('算命学API検証テスト', () => {
  let collector: FortuneDataCollector;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    collector = new FortuneDataCollector(page, browser);
  });

  test('基本的な生年月日パターンの精度検証', async () => {
    const testCases = FortuneDataCollector.generateTestCases();
    const results = await collector.collectVerificationData(testCases);

    // 精度期待値
    const successfulResults = results.filter(r => r.apiResult !== null);
    expect(successfulResults.length).toBeGreaterThan(0);

    // 平均精度が80%以上であることを確認
    const averageAccuracy = successfulResults.reduce((sum, r) => sum + r.accuracy.overallScore, 0) / successfulResults.length;
    expect(averageAccuracy).toBeGreaterThan(0.8);

    // 干支計算は100%正確であるべき
    const zodiacAccuracy = successfulResults.filter(r => r.accuracy.zodiacMatch).length / successfulResults.length;
    expect(zodiacAccuracy).toBeGreaterThan(0.95);

    // 動物占い精度は90%以上を期待
    const animalAccuracy = successfulResults.filter(r => r.accuracy.animalMatch).length / successfulResults.length;
    expect(animalAccuracy).toBeGreaterThan(0.9);

    console.log(FortuneDataCollector.generateValidationReport(results));
  });

  test('境界値テスト: 1960年と2025年', async () => {
    const boundaryTestCases: FortuneTestData[] = [
      {
        birthdate: { year: 1960, month: 1, day: 1 },
        expected: { animal: '子', zodiac: '子', sixStar: '土星人+', characteristics: [] },
        source: 'manual_verification'
      },
      {
        birthdate: { year: 2025, month: 12, day: 31 },
        expected: { animal: '巳', zodiac: '巳', sixStar: '水星人-', characteristics: [] },
        source: 'manual_verification'
      }
    ];

    const results = await collector.collectVerificationData(boundaryTestCases);
    
    for (const result of results) {
      expect(result.apiResult).not.toBeNull();
      // 境界値でも基本的な計算は動作すること
      expect(result.accuracy.overallScore).toBeGreaterThan(0.6);
    }
  });

  test('うるう年対応テスト', async () => {
    const leapYearTestCases: FortuneTestData[] = [
      {
        birthdate: { year: 2000, month: 2, day: 29 }, // うるう年
        expected: { animal: 'たぬき', zodiac: '辰', sixStar: '木星人+', characteristics: [] },
        source: 'manual_verification'
      },
      {
        birthdate: { year: 1900, month: 2, day: 28 }, // 平年（1900年はうるう年ではない）
        expected: { animal: 'ひつじ', zodiac: '子', sixStar: '金星人-', characteristics: [] },
        source: 'manual_verification'
      }
    ];

    const results = await collector.collectVerificationData(leapYearTestCases);
    
    // うるう年の日付でもエラーが発生しないこと
    expect(results.every(r => r.apiResult !== null)).toBe(true);
  });

  test('エラーハンドリング: 無効な日付', async () => {
    const invalidDateCases = [
      { year: 2023, month: 2, day: 30 }, // 2月30日は存在しない
      { year: 2023, month: 4, day: 31 }, // 4月31日は存在しない
      { year: 2023, month: 13, day: 1 }, // 13月は存在しない
    ];

    for (const invalidDate of invalidDateCases) {
      const response = await fetch('http://localhost:3000/api/fortune-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidDate)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      
      const errorData = await response.json();
      expect(errorData.error).toBeDefined();
    }
  });

  test('パフォーマンステスト: レスポンス時間', async () => {
    const testDate = { year: 1990, month: 5, day: 15 };
    const performanceResults = [];

    // 10回連続実行してパフォーマンスを測定
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/fortune-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testDate)
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.ok).toBe(true);
      performanceResults.push(responseTime);
    }

    const averageResponseTime = performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
    const maxResponseTime = Math.max(...performanceResults);

    console.log(`平均レスポンス時間: ${averageResponseTime.toFixed(2)}ms`);
    console.log(`最大レスポンス時間: ${maxResponseTime}ms`);

    // レスポンス時間期待値: 平均500ms以下、最大2秒以下
    expect(averageResponseTime).toBeLessThan(500);
    expect(maxResponseTime).toBeLessThan(2000);
  });

  test('CSVデータ整合性確認', async () => {
    // 既知の正確なデータでCSVの正確性を確認
    const knownAccurateData = [
      {
        birthdate: { year: 1990, month: 5, day: 15 },
        expected: { animal: 'チーター', zodiac: '午' } // CSV参照による既知データ
      }
    ];

    for (const testCase of knownAccurateData) {
      const response = await fetch('http://localhost:3000/api/fortune-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.birthdate)
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      // CSVデータが正しく読み込まれていることを確認
      expect(result.animal).toBeDefined();
      expect(result.zodiac).toBe(testCase.expected.zodiac);
    }
  });

  test.afterAll(async () => {
    // リソースクリーンアップ
    console.log('算命学API検証テスト完了');
  });
});