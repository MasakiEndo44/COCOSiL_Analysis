#!/usr/bin/env node
/**
 * NOA Group動物占いサイトとCOCOSiL APIの検証テスト
 * 20パターンのランダム日付でブラウザテストを実行
 */

const API_URL = 'http://localhost:3001/api/fortune-calc-v2';

// テストデータ生成（1960-2025年の範囲で20パターン）
function generateRandomTestCases(count = 20) {
  const testCases = [];
  for (let i = 0; i < count; i++) {
    const year = 1960 + Math.floor(Math.random() * 66); // 1960-2025
    const month = 1 + Math.floor(Math.random() * 12);   // 1-12
    const day = 1 + Math.floor(Math.random() * 28);     // 1-28 (safe range)
    
    testCases.push({ year, month, day, testId: i + 1 });
  }
  return testCases;
}

// COCOSiL APIテスト
async function testCOCOSiLAPI(testCase) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: testCase.year,
        month: testCase.month,
        day: testCase.day
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// テスト結果の分析とレポート生成
function analyzeResults(results) {
  const successful = results.filter(r => r.cocosil.success && r.noa.success);
  const failed = results.filter(r => !r.cocosil.success || !r.noa.success);
  
  console.log(`\n📊 検証テスト結果サマリー`);
  console.log(`================================`);
  console.log(`総テストケース: ${results.length}`);
  console.log(`成功: ${successful.length}`);
  console.log(`失敗: ${failed.length}`);
  console.log(`成功率: ${(successful.length / results.length * 100).toFixed(1)}%`);
  
  if (successful.length > 0) {
    console.log(`\n✅ 成功したテストケース:`);
    successful.forEach((result, index) => {
      const { year, month, day } = result.testCase;
      const cocosil = result.cocosil.data;
      console.log(`${index + 1}. ${year}/${month}/${day}`);
      console.log(`   COCOSiL: ${cocosil.animal_character}`);
      console.log(`   NOA: ${result.noa.animalName} (${result.noa.rawText})`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ 失敗したテストケース:`);
    failed.forEach((result, index) => {
      const { year, month, day } = result.testCase;
      console.log(`${index + 1}. ${year}/${month}/${day}`);
      if (!result.cocosil.success) {
        console.log(`   COCOSiL Error: ${result.cocosil.error}`);
      }
      if (!result.noa.success) {
        console.log(`   NOA Error: ${result.noa.error}`);
      }
    });
  }
}

// Playwright用のテストケース情報を出力
function outputPlaywrightInstructions(testCases) {
  console.log(`\n🎭 Playwright テストケース情報:`);
  console.log(`以下の日付でブラウザテストを実行します:\n`);
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.year}年${testCase.month}月${testCase.day}日`);
  });
  
  return testCases;
}

async function main() {
  console.log(`🚀 NOA Group vs COCOSiL API 検証テスト開始`);
  
  // テストケース生成
  const testCases = generateRandomTestCases(20);
  
  console.log(`\n📋 生成されたテストケース (20パターン):`);
  testCases.forEach((tc, i) => {
    console.log(`${i+1}. ${tc.year}年${tc.month}月${tc.day}日`);
  });
  
  // COCOSiL API事前テスト
  console.log(`\n⚙️ COCOSiL API 事前テスト中...`);
  const results = [];
  
  for (const testCase of testCases) {
    const cocosil = await testCOCOSiLAPI(testCase);
    
    results.push({
      testCase,
      cocosil,
      noa: { success: false, error: 'Playwright test pending' } // Playwrightテスト待ち
    });
    
    if (cocosil.success) {
      console.log(`✅ Test ${testCase.testId}: ${testCase.year}/${testCase.month}/${testCase.day} → ${cocosil.data.animal_character}`);
    } else {
      console.log(`❌ Test ${testCase.testId}: ${testCase.year}/${testCase.month}/${testCase.day} → Error: ${cocosil.error}`);
    }
  }
  
  console.log(`\n🎭 次に、Playwrightでブラウザテストを実行してください。`);
  outputPlaywrightInstructions(testCases);
  
  // テストケース情報をファイルに保存
  const fs = require('fs');
  fs.writeFileSync('/tmp/noa-test-cases.json', JSON.stringify(testCases, null, 2));
  console.log(`\n💾 テストケース情報を /tmp/noa-test-cases.json に保存しました`);
  
  return testCases;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateRandomTestCases, testCOCOSiLAPI, analyzeResults };