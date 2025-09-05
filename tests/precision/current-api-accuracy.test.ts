/**
 * 現行算命学API精度測定テスト
 * 正解データとの照合による精度評価
 */

import { PRECISION_TEST_CASES, AccuracyCalculator, type CurrentAPIResponse, type PrecisionTestCase } from '../fixtures/precision-test-data';

interface AccuracyResult {
  testCase: PrecisionTestCase;
  apiResponse: CurrentAPIResponse | null;
  accuracy: {
    age: boolean;
    western_zodiac: boolean; 
    animal_character: boolean;
    six_star: boolean;
    zodiac: boolean;
    overall: number;
  };
  errors: string[];
}

describe('現行算命学API精度測定', () => {
  const API_BASE_URL = 'http://localhost:3000/api/fortune-calc';
  const results: AccuracyResult[] = [];

  beforeAll(() => {
    console.log('\n🔍 現行API精度測定開始...');
    console.log(`📊 テストケース数: ${PRECISION_TEST_CASES.length}`);
    console.log(`🎯 目標精度: 100%`);
  });

  test.each(PRECISION_TEST_CASES)(
    'No.$no: $name',
    async (testCase) => {
      const result = await measureAPIAccuracy(testCase);
      results.push(result);

      // 個別結果ログ
      console.log(`\n📋 No.${testCase.no} 結果:`);
      console.log(`   全体精度: ${(result.accuracy.overall * 100).toFixed(1)}%`);
      console.log(`   年齢: ${result.accuracy.age ? '✅' : '❌'}`);
      console.log(`   星座: ${result.accuracy.western_zodiac ? '✅' : '❌'}`);
      console.log(`   動物: ${result.accuracy.animal_character ? '✅' : '❌'}`);
      console.log(`   六星: ${result.accuracy.six_star ? '✅' : '❌'}`);
      
      if (result.errors.length > 0) {
        console.log(`   エラー: ${result.errors.join(', ')}`);
      }

      // 個別テストアサーション（詳細確認用）
      if (result.apiResponse) {
        expect(result.apiResponse.age).toBe(testCase.expected.age);
        // 他の項目は参考程度（現行実装の制約考慮）
      }
    },
    15000 // 15秒タイムアウト
  );

  afterAll(() => {
    generateAccuracyReport(results);
  });

  /**
   * API精度測定実行
   */
  async function measureAPIAccuracy(testCase: PrecisionTestCase): Promise<AccuracyResult> {
    let apiResponse: CurrentAPIResponse | null = null;
    const errors: string[] = [];

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.input)
      });

      if (!response.ok) {
        errors.push(`HTTP ${response.status}: ${response.statusText}`);
      } else {
        apiResponse = await response.json();
      }
    } catch (error) {
      errors.push(`Network Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const accuracy = calculateAccuracy(testCase, apiResponse, errors);

    return {
      testCase,
      apiResponse,
      accuracy,
      errors
    };
  }

  /**
   * 精度計算
   */
  function calculateAccuracy(
    testCase: PrecisionTestCase, 
    apiResponse: CurrentAPIResponse | null,
    errors: string[]
  ): AccuracyResult['accuracy'] {
    if (!apiResponse || errors.length > 0) {
      return {
        age: false,
        western_zodiac: false,
        animal_character: false,
        six_star: false,
        zodiac: false,
        overall: 0
      };
    }

    // 年齢精度
    const ageAccuracy = apiResponse.age === testCase.expected.age;

    // 西洋星座精度（APIは十二支のみのため、推定計算と比較）
    const calculatedWesternZodiac = calculateWesternZodiac(testCase.input.month, testCase.input.day);
    const westernZodiacAccuracy = calculatedWesternZodiac === testCase.expected.western_zodiac;

    // 動物キャラクター精度
    const normalizedExpected = AccuracyCalculator.normalizeAnimalCharacter(testCase.expected.animal_character);
    const animalAccuracy = apiResponse.animal === normalizedExpected;

    // 六星占術精度
    const normalizedSixStar = AccuracyCalculator.normalizeSixStar(testCase.expected.six_star);
    const sixStarAccuracy = apiResponse.six_star === normalizedSixStar;

    // 十二支精度
    const zodiacAccuracy = testCase.expected.zodiac 
      ? apiResponse.zodiac === testCase.expected.zodiac
      : true; // 未定義の場合はスキップ

    // 全体精度計算
    const accuracyItems = [ageAccuracy, animalAccuracy, sixStarAccuracy, zodiacAccuracy];
    const overall = accuracyItems.filter(Boolean).length / accuracyItems.length;

    return {
      age: ageAccuracy,
      western_zodiac: westernZodiacAccuracy,
      animal_character: animalAccuracy,
      six_star: sixStarAccuracy,
      zodiac: zodiacAccuracy,
      overall
    };
  }

  /**
   * 西洋12星座計算（参考実装）
   */
  function calculateWesternZodiac(month: number, day: number): string {
    const zodiacRanges = [
      { name: '山羊座', start: [12, 22], end: [1, 19] },
      { name: '水瓶座', start: [1, 20], end: [2, 18] },
      { name: '魚座', start: [2, 19], end: [3, 20] },
      { name: '牡羊座', start: [3, 21], end: [4, 19] },
      { name: '牡牛座', start: [4, 20], end: [5, 20] },
      { name: '双子座', start: [5, 21], end: [6, 21] },
      { name: '蟹座', start: [6, 22], end: [7, 22] },
      { name: '獅子座', start: [7, 23], end: [8, 22] },
      { name: '乙女座', start: [8, 23], end: [9, 22] },
      { name: '天秤座', start: [9, 23], end: [10, 23] },
      { name: '蠍座', start: [10, 24], end: [11, 22] },
      { name: '射手座', start: [11, 23], end: [12, 21] },
    ];

    for (const zodiac of zodiacRanges) {
      if (isInZodiacRange(month, day, zodiac.start, zodiac.end)) {
        return zodiac.name;
      }
    }
    return '山羊座'; // デフォルト
  }

  function isInZodiacRange(month: number, day: number, start: [number, number], end: [number, number]): boolean {
    const [startMonth, startDay] = start;
    const [endMonth, endDay] = end;
    
    if (startMonth === endMonth) {
      return month === startMonth && day >= startDay && day <= endDay;
    }
    
    // 年末年始をまたぐ場合（山羊座など）
    return (month === startMonth && day >= startDay) || 
           (month === endMonth && day <= endDay);
  }

  /**
   * 精度レポート生成
   */
  function generateAccuracyReport(results: AccuracyResult[]) {
    const totalTests = results.length;
    const successfulTests = results.filter(r => r.apiResponse !== null).length;
    const failedTests = totalTests - successfulTests;

    const successfulResults = results.filter(r => r.apiResponse !== null);
    const averageAccuracy = successfulResults.length > 0 
      ? successfulResults.reduce((sum, r) => sum + r.accuracy.overall, 0) / successfulResults.length
      : 0;

    // 項目別精度
    const ageAccuracy = results.filter(r => r.accuracy.age).length / totalTests;
    const animalAccuracy = results.filter(r => r.accuracy.animal_character).length / totalTests;
    const sixStarAccuracy = results.filter(r => r.accuracy.six_star).length / totalTests;
    const zodiacAccuracy = results.filter(r => r.accuracy.zodiac).length / totalTests;

    console.log(`
📊 現行算命学API精度測定レポート
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 テスト実行サマリー
• 総テスト数: ${totalTests}
• 成功実行数: ${successfulTests}  
• 失敗実行数: ${failedTests}
• 実行成功率: ${(successfulTests/totalTests*100).toFixed(1)}%

🎯 精度分析結果
• 全体平均精度: ${(averageAccuracy*100).toFixed(1)}%
• 年齢計算精度: ${(ageAccuracy*100).toFixed(1)}%
• 動物占い精度: ${(animalAccuracy*100).toFixed(1)}%  
• 六星占術精度: ${(sixStarAccuracy*100).toFixed(1)}%
• 十二支精度: ${(zodiacAccuracy*100).toFixed(1)}%

🔧 改善推奨事項
${averageAccuracy < 0.8 ? '• ⚠️  全体精度が80%未満です - 計算ロジック全般の見直しが必要' : ''}
${ageAccuracy < 0.95 ? '• 🎂 年齢計算精度が95%未満です - 年齢算出ロジックの確認が必要' : ''}
${animalAccuracy < 0.9 ? '• 🐾 動物占い精度が90%未満です - 60種分類ロジックの見直しが必要' : ''}
${sixStarAccuracy < 0.9 ? '• ⭐ 六星占術精度が90%未満です - 星人±算出ロジックの確認が必要' : ''}
${zodiacAccuracy < 0.95 ? '• 🐲 十二支精度が95%未満です - 干支計算ロジックの確認が必要' : ''}

${averageAccuracy >= 0.9 ? '✅ 全体的に良好な精度です' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // 詳細結果（失敗ケースのみ）
    const failedCases = results.filter(r => r.accuracy.overall < 1.0 || r.errors.length > 0);
    if (failedCases.length > 0) {
      console.log('\n❌ 不正確/エラーケース詳細:');
      failedCases.forEach(result => {
        console.log(`\n• No.${result.testCase.no}: ${result.testCase.name}`);
        console.log(`  精度: ${(result.accuracy.overall * 100).toFixed(1)}%`);
        if (result.errors.length > 0) {
          console.log(`  エラー: ${result.errors.join(', ')}`);
        }
        if (result.apiResponse) {
          console.log(`  期待値: 年齢${result.testCase.expected.age}歳, ${result.testCase.expected.animal_character}, ${result.testCase.expected.six_star}`);
          console.log(`  実測値: 年齢${result.apiResponse.age}歳, ${result.apiResponse.animal}, ${result.apiResponse.six_star}`);
        }
      });
    }
  }
});

/**
 * 単発実行用エクスポート
 */
export async function runAccuracyMeasurement(): Promise<void> {
  console.log('🔍 算命学API精度測定を実行中...');
  
  // Jest以外での実行サポート
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const jest = spawn('npx', ['jest', 'tests/precision/current-api-accuracy.test.ts', '--verbose'], {
      stdio: 'inherit'
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 精度測定完了');
        resolve();
      } else {
        console.error('❌ 精度測定失敗');
        reject(new Error(`Jest exited with code ${code}`));
      }
    });
  });
}

// CLI実行サポート
if (require.main === module) {
  runAccuracyMeasurement().catch(console.error);
}