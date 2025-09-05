import { Page, Browser } from '@playwright/test';

export interface FortuneTestData {
  birthdate: {
    year: number;
    month: number;
    day: number;
  };
  expected: {
    animal: string;
    zodiac: string;
    sixStar: string;
    characteristics: string[];
  };
  source: 'noa_group' | 'csv_reference' | 'manual_verification';
}

export interface ValidationResult {
  testData: FortuneTestData;
  apiResult: any;
  accuracy: {
    animalMatch: boolean;
    zodiacMatch: boolean;
    sixStarMatch: boolean;
    characteristicsMatch: number; // 0-1 similarity score
    overallScore: number;
  };
  timestamp: Date;
}

export class FortuneDataCollector {
  private page: Page;
  private browser: Browser;

  constructor(page: Page, browser: Browser) {
    this.page = page;
    this.browser = browser;
  }

  /**
   * NOA Groupサイトから動物占いデータを収集
   */
  async collectFromNoaGroup(birthdate: { year: number; month: number; day: number; sex: number }): Promise<any> {
    try {
      const url = `https://www.noa-group.co.jp/kosei/result?birthdayYear=${birthdate.year}&birthdayMonth=${birthdate.month.toString().padStart(2, '0')}&birthdayDay=${birthdate.day.toString().padStart(2, '0')}&sex=${birthdate.sex}`;
      
      await this.page.goto(url);
      await this.page.waitForSelector('img[alt*="ひょう"], img[alt*="ライオン"], img[alt*="チーター"]', { timeout: 10000 });

      // データ抽出
      const result = await this.page.evaluate(() => {
        // 動物名の取得（より正確なセレクター）
        const animalElement = document.querySelector('p:has(a[href*="MOON"], a[href*="EARTH"], a[href*="SUN"])');
        const animalText = animalElement?.textContent?.trim() || '';
        const animalName = animalText.replace(/MOON|EARTH|SUN/g, '').trim();

        // 特徴リストの取得（共通性格のみ）
        const commonTraits = [];
        const traitsList = document.querySelector('ul, ol');
        if (traitsList) {
          const items = traitsList.querySelectorAll('li');
          items.forEach(item => {
            const text = item.textContent?.trim();
            if (text && !text.includes('お知らせ') && !text.includes('TOP')) {
              commonTraits.push(text);
            }
          });
        }

        // 分類情報
        const moonEarthSun = document.querySelector('a[href*="MOON"] img, a[href*="EARTH"] img, a[href*="SUN"] img')?.alt || 
                           document.querySelector('a[href*="MOON"], a[href*="EARTH"], a[href*="SUN"]')?.textContent?.trim() || '';

        return {
          animal: animalName,
          classification: moonEarthSun,
          traits: commonTraits,
          fullDescription: document.querySelector('p:nth-of-type(2)')?.textContent?.trim() || ''
        };
      });

      return result;
    } catch (error) {
      console.error('NOA Group data collection failed:', error);
      return null;
    }
  }

  /**
   * 検証データ収集の基盤クラス
   * 法的・倫理的配慮を重視した設計
   */
  async collectVerificationData(testCases: FortuneTestData[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const testData of testCases) {
      try {
        // レート制限対応: 1-3秒のランダムディレイ
        await this.randomDelay(1000, 3000);

        // 自システムのAPIを呼び出し
        const apiResult = await this.callOwnFortuneAPI(testData.birthdate);
        
        // 精度計算
        const accuracy = this.calculateAccuracy(testData.expected, apiResult);

        results.push({
          testData,
          apiResult,
          accuracy,
          timestamp: new Date()
        });

        console.log(`Verification completed for ${testData.birthdate.year}-${testData.birthdate.month}-${testData.birthdate.day}: ${accuracy.overallScore.toFixed(2)}`);

      } catch (error) {
        console.error(`Verification failed for test case:`, error);
        // エラー時はnullスコアで記録
        results.push({
          testData,
          apiResult: null,
          accuracy: { animalMatch: false, zodiacMatch: false, sixStarMatch: false, characteristicsMatch: 0, overallScore: 0 },
          timestamp: new Date()
        });
      }
    }

    return results;
  }

  private async callOwnFortuneAPI(birthdate: { year: number; month: number; day: number }) {
    const response = await fetch('http://localhost:3000/api/fortune-calc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(birthdate)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  private calculateAccuracy(expected: any, actual: any): ValidationResult['accuracy'] {
    if (!actual) {
      return { animalMatch: false, zodiacMatch: false, sixStarMatch: false, characteristicsMatch: 0, overallScore: 0 };
    }

    // 動物名の一致確認
    const animalMatch = this.normalizeAnimalName(expected.animal) === this.normalizeAnimalName(actual.animal);
    
    // 干支の一致確認
    const zodiacMatch = expected.zodiac === actual.zodiac;
    
    // 六星占術の一致確認
    const sixStarMatch = this.normalizeSixStar(expected.sixStar) === this.normalizeSixStar(actual.six_star);
    
    // 特徴の類似度計算
    const characteristicsMatch = this.calculateCharacteristicsSimilarity(
      expected.characteristics, 
      actual.fortune_detail?.personality_traits || []
    );

    // 総合スコア計算 (重み付け)
    const overallScore = (
      (animalMatch ? 0.4 : 0) +
      (zodiacMatch ? 0.3 : 0) +
      (sixStarMatch ? 0.2 : 0) +
      (characteristicsMatch * 0.1)
    );

    return {
      animalMatch,
      zodiacMatch,
      sixStarMatch,
      characteristicsMatch,
      overallScore
    };
  }

  private normalizeAnimalName(name: string): string {
    return name.replace(/[・\s]/g, '').toLowerCase();
  }

  private normalizeSixStar(sixStar: string): string {
    return sixStar.replace(/[・\s]/g, '');
  }

  private calculateCharacteristicsSimilarity(expected: string[], actual: string[]): number {
    if (!expected.length || !actual.length) return 0;

    let matches = 0;
    for (const expectedTrait of expected) {
      for (const actualTrait of actual) {
        if (this.calculateStringSimilarity(expectedTrait, actualTrait) > 0.7) {
          matches++;
          break;
        }
      }
    }

    return matches / expected.length;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * テストケース生成: 標準的な生年月日パターン
   */
  static generateTestCases(): FortuneTestData[] {
    return [
      {
        birthdate: { year: 1990, month: 5, day: 15 },
        expected: {
          animal: 'チーター',
          zodiac: '午',
          sixStar: '土星人+',
          characteristics: ['行動力がある', 'スピード重視', '瞬発力に優れる']
        },
        source: 'csv_reference'
      },
      {
        birthdate: { year: 1985, month: 12, day: 3 },
        expected: {
          animal: 'ライオン',
          zodiac: '丑',
          sixStar: '金星人+',
          characteristics: ['リーダーシップ', '堂々としている', '責任感が強い']
        },
        source: 'csv_reference'
      },
      {
        birthdate: { year: 1995, month: 8, day: 20 },
        expected: {
          animal: 'ペガサス',
          zodiac: '亥',
          sixStar: '火星人+',
          characteristics: ['自由奔放', '創造性豊か', '夢見がち']
        },
        source: 'csv_reference'
      },
      // 境界値テスト
      {
        birthdate: { year: 1960, month: 1, day: 1 },
        expected: {
          animal: '子', // 最小値
          zodiac: '子',
          sixStar: '土星人+',
          characteristics: []
        },
        source: 'manual_verification'
      },
      {
        birthdate: { year: 2025, month: 12, day: 31 },
        expected: {
          animal: '巳', // 最大値
          zodiac: '巳',
          sixStar: '水星人-',
          characteristics: []
        },
        source: 'manual_verification'
      },
      // うるう年テスト
      {
        birthdate: { year: 2000, month: 2, day: 29 },
        expected: {
          animal: 'たぬき',
          zodiac: '辰',
          sixStar: '木星人+',
          characteristics: ['人懐っこい', '愛嬌がある', '適応力が高い']
        },
        source: 'manual_verification'
      }
    ];
  }

  /**
   * 検証結果レポート生成
   */
  static generateValidationReport(results: ValidationResult[]): string {
    const totalTests = results.length;
    const successfulTests = results.filter(r => r.apiResult !== null).length;
    const averageAccuracy = results
      .filter(r => r.apiResult !== null)
      .reduce((sum, r) => sum + r.accuracy.overallScore, 0) / successfulTests;

    const animalAccuracy = results.filter(r => r.accuracy.animalMatch).length / totalTests;
    const zodiacAccuracy = results.filter(r => r.accuracy.zodiacMatch).length / totalTests;
    const sixStarAccuracy = results.filter(r => r.accuracy.sixStarMatch).length / totalTests;

    return `
# 算命学API検証レポート

## 検証サマリー
- 総テスト数: ${totalTests}
- 成功実行数: ${successfulTests}
- 実行成功率: ${(successfulTests/totalTests*100).toFixed(1)}%
- 平均精度スコア: ${(averageAccuracy*100).toFixed(1)}%

## 項目別精度
- 動物占い精度: ${(animalAccuracy*100).toFixed(1)}%
- 干支精度: ${(zodiacAccuracy*100).toFixed(1)}%
- 六星占術精度: ${(sixStarAccuracy*100).toFixed(1)}%

## 詳細結果
${results.map((result, index) => `
### テストケース ${index + 1}
- 生年月日: ${result.testData.birthdate.year}/${result.testData.birthdate.month}/${result.testData.birthdate.day}
- 総合スコア: ${(result.accuracy.overallScore*100).toFixed(1)}%
- 動物一致: ${result.accuracy.animalMatch ? '✅' : '❌'}
- 干支一致: ${result.accuracy.zodiacMatch ? '✅' : '❌'}
- 六星一致: ${result.accuracy.sixStarMatch ? '✅' : '❌'}
- 特徴類似度: ${(result.accuracy.characteristicsMatch*100).toFixed(1)}%
`).join('')}

## 推奨改善策
${averageAccuracy < 0.8 ? '- API精度が80%を下回っています。CSVデータの見直しが必要です。' : ''}
${animalAccuracy < 0.9 ? '- 動物占い算出ロジックの見直しを推奨します。' : ''}
${zodiacAccuracy < 0.95 ? '- 干支計算ロジックを確認してください。' : ''}
`;
  }
}