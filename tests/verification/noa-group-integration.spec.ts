import { test, expect } from '@playwright/test';
import { FortuneDataCollector } from './fortune-data-collector';

test.describe('NOA Group動物占い照合テスト', () => {
  let collector: FortuneDataCollector;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    collector = new FortuneDataCollector(page, browser);
  });

  test('NOA Groupサイトとの動物占い照合 - 1975年1月1日', async () => {
    const birthdate = { year: 1975, month: 1, day: 1, sex: 0 }; // 女性

    // NOA Groupサイトからデータ取得
    const noaData = await collector.collectFromNoaGroup(birthdate);
    expect(noaData).not.toBeNull();
    expect(noaData.animal).toBeTruthy();

    console.log('NOA Group結果:', {
      animal: noaData.animal,
      classification: noaData.classification,
      traits: noaData.traits.slice(0, 5), // 最初の5つのみ表示
    });

    // 自システムAPIから同じ生年月日でデータ取得
    const apiResponse = await fetch('http://localhost:3000/api/fortune-calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: birthdate.year, month: birthdate.month, day: birthdate.day })
    });

    expect(apiResponse.ok).toBe(true);
    const apiResult = await apiResponse.json();

    console.log('自システム結果:', {
      animal: apiResult.animal,
      zodiac: apiResult.zodiac,
      sixStar: apiResult.six_star,
    });

    // データ照合レポート
    const comparisonReport = {
      birthdate: `${birthdate.year}/${birthdate.month}/${birthdate.day}`,
      noaGroup: {
        animal: noaData.animal,
        traits: noaData.traits.filter((t: string) => 
          !t.includes('お知らせ') && 
          !t.includes('TOP') && 
          !t.includes('グループ') &&
          t.length > 2
        ).slice(0, 7), // 実際の特徴のみ
      },
      ourSystem: {
        animal: apiResult.animal,
        zodiac: apiResult.zodiac,
        sixStar: apiResult.six_star,
        traits: apiResult.fortune_detail?.personality_traits || [],
      },
      compatibility: {
        animalMatch: noaData.animal.includes(apiResult.animal) || apiResult.animal.includes(noaData.animal.replace(/.*な/, '')),
        traitsOverlap: calculateTraitsOverlap(noaData.traits, apiResult.fortune_detail?.personality_traits || []),
      }
    };

    console.log('\n=== 照合レポート ===');
    console.log(JSON.stringify(comparisonReport, null, 2));
  });

  test('複数パターンでの照合テスト', async () => {
    const testPatterns = [
      { year: 1990, month: 5, day: 15, sex: 1 }, // 男性
      { year: 1985, month: 12, day: 3, sex: 0 }, // 女性
      { year: 2000, month: 2, day: 29, sex: 1 }, // うるう年・男性
    ];

    const results = [];

    for (const pattern of testPatterns) {
      // レート制限対応
      await new Promise(resolve => setTimeout(resolve, 2000));

      const noaData = await collector.collectFromNoaGroup(pattern);
      const apiResponse = await fetch('http://localhost:3000/api/fortune-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: pattern.year, month: pattern.month, day: pattern.day })
      });

      const apiResult = apiResponse.ok ? await apiResponse.json() : null;

      results.push({
        input: pattern,
        noa: noaData,
        api: apiResult,
        timestamp: new Date().toISOString()
      });
    }

    console.log('\n=== 複数パターン照合結果 ===');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.input.year}/${result.input.month}/${result.input.day} (${result.input.sex === 0 ? '女性' : '男性'})`);
      console.log(`   NOA: ${result.noa?.animal || 'エラー'}`);
      console.log(`   API: ${result.api?.animal || 'エラー'}`);
      console.log(`   一致: ${result.noa?.animal && result.api?.animal ? (result.noa.animal.includes(result.api.animal) ? '✅' : '❌') : '?'}`);
    });

    // 少なくとも1つは成功することを期待
    expect(results.some(r => r.noa && r.api)).toBe(true);
  });

});

// ヘルパー関数
function calculateTraitsOverlap(noaTraits: string[], apiTraits: string[]): number {
  if (!noaTraits.length || !apiTraits.length) return 0;
  
  let overlap = 0;
  for (const noaTrait of noaTraits) {
    for (const apiTrait of apiTraits) {
      if (noaTrait.includes(apiTrait) || apiTrait.includes(noaTrait)) {
        overlap++;
        break;
      }
    }
  }
  return overlap / noaTraits.length;
}