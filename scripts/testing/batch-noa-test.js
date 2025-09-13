#!/usr/bin/env node
/**
 * NOA Group サイトの批判テスト自動化スクリプト
 * 20パターンの日付を順次テストし、COCOSiL APIと比較
 */

const { chromium } = require('playwright');

const TEST_CASES = [
  { year: 1964, month: 3, day: 5 },
  { year: 1998, month: 3, day: 26 },
  { year: 1989, month: 10, day: 27 },
  { year: 1991, month: 1, day: 21 },
  { year: 1988, month: 1, day: 14 },
  { year: 1984, month: 12, day: 24 },
  { year: 2023, month: 7, day: 26 },
  { year: 1997, month: 1, day: 16 },
  { year: 2015, month: 4, day: 8 },
  { year: 2023, month: 3, day: 17 },
  { year: 1961, month: 2, day: 7 },
  { year: 1984, month: 7, day: 6 },
  { year: 2017, month: 10, day: 5 },
  { year: 1998, month: 3, day: 18 },
  { year: 2015, month: 11, day: 13 },
  { year: 1971, month: 7, day: 16 },
  { year: 1964, month: 5, day: 9 },
  { year: 2011, month: 10, day: 4 },
  { year: 1990, month: 10, day: 25 },
  { year: 2019, month: 1, day: 17 }
];

const COCOSIL_API_URL = 'http://localhost:3001/api/fortune-calc-v2';

async function testCOCOSiLAPI(testCase) {
  try {
    const response = await fetch(COCOSIL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    return result.data?.animal_character || 'Unknown';
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

async function testNOAGroup(page, testCase) {
  try {
    // NOA Groupサイトに移動
    await page.goto('https://www.noa-group.co.jp/kosei/result', {
      waitUntil: 'networkidle'
    });
    
    // 生年月日設定
    await page.selectOption('select[name="birthdayYear"]', testCase.year.toString());
    await page.selectOption('select[name="birthdayMonth"]', testCase.month.toString());
    await page.selectOption('select[name="birthdayDay"]', testCase.day.toString());
    
    // キャラを調べるボタンをクリック
    await page.click('button:has-text("キャラを調べる")');
    
    // 結果が表示されるまで待機
    await page.waitForLoadState('networkidle');
    
    // 動物キャラ名を取得
    const animalName = await page.textContent('img[alt*="ひょう"], img[alt*="虎"], img[alt*="猿"], img[alt*="ライオン"], img[alt*="こじか"], img[alt*="狼"], img[alt*="ペガサス"], img[alt*="ひつじ"], img[alt*="チーター"], img[alt*="ゾウ"], img[alt*="たぬき"], img[alt*="黒"]');
    
    if (animalName) {
      // altテキストから動物名を抽出
      const altText = await page.getAttribute('img[alt*="ひょう"], img[alt*="虎"], img[alt*="猿"], img[alt*="ライオン"], img[alt*="こじか"], img[alt*="狼"], img[alt*="ペガサス"], img[alt*="ひつじ"], img[alt*="チーター"], img[alt*="ゾウ"], img[alt*="たぬき"], img[alt*="黒"]', 'alt');
      return altText || 'Unknown';
    }
    
    // フォールバック：テキストから動物名を探す
    const bodyText = await page.textContent('body');
    const animalMatches = bodyText.match(/(.*?)(ひょう|虎|猿|ライオン|こじか|狼|ペガサス|ひつじ|チーター|ゾウ|たぬき)/);
    return animalMatches ? animalMatches[0] : 'Unknown';
    
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

async function main() {
  console.log('🚀 NOA Group vs COCOSiL API 比較テスト開始');
  
  // ブラウザ起動
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    const testNum = i + 1;
    
    console.log(`\n📋 Test ${testNum}/20: ${testCase.year}/${testCase.month}/${testCase.day}`);
    
    // 並列でCOCOSiL APIをテスト
    const [cocosilResult, noaResult] = await Promise.all([
      testCOCOSiLAPI(testCase),
      testNOAGroup(page, testCase)
    ]);
    
    const isMatch = cocosilResult.includes(noaResult.split('の')[1] || noaResult.split(' ')[1] || '');
    
    results.push({
      testCase,
      cocosil: cocosilResult,
      noa: noaResult,
      match: isMatch
    });
    
    console.log(`   COCOSiL: ${cocosilResult}`);
    console.log(`   NOA:     ${noaResult}`);
    console.log(`   Match:   ${isMatch ? '✅' : '❌'}`);
    
    // 次のテストまで少し待機
    await page.waitForTimeout(1000);
  }
  
  // 結果サマリー
  const matches = results.filter(r => r.match).length;
  const total = results.length;
  const accuracy = (matches / total * 100).toFixed(1);
  
  console.log(`\n📊 最終結果:`);
  console.log(`=====================================`);
  console.log(`総テスト数: ${total}`);
  console.log(`一致: ${matches}`);
  console.log(`不一致: ${total - matches}`);
  console.log(`精度: ${accuracy}%`);
  
  if (matches < total) {
    console.log(`\n❌ 不一致のケース:`);
    results.filter(r => !r.match).forEach((result, index) => {
      const { year, month, day } = result.testCase;
      console.log(`${index + 1}. ${year}/${month}/${day}`);
      console.log(`   COCOSiL: ${result.cocosil}`);
      console.log(`   NOA:     ${result.noa}`);
    });
  }
  
  // 結果をファイルに保存
  const fs = require('fs');
  fs.writeFileSync('/tmp/noa-comparison-results.json', JSON.stringify(results, null, 2));
  console.log(`\n💾 詳細結果を /tmp/noa-comparison-results.json に保存しました`);
  
  await browser.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testCOCOSiLAPI, testNOAGroup };