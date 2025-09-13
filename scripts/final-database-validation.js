/**
 * 最終データベース検証テスト
 * 参照サイトベースのデータベース駆動システムの完全検証
 */

const testCases = [
  // 主要テストケース（データベース対応済み）
  { year: 2008, month: 1, day: 5, expected: '木星人+', description: '基準テストケース' },
  { year: 1990, month: 5, day: 15, expected: '金星人-', description: '平成2年テスト' },
  { year: 1985, month: 12, day: 25, expected: '水星人+', description: '昭和60年テスト' },
  { year: 2000, month: 2, day: 29, expected: '火星人-', description: '平成12年うるう年テスト' },
  
  // 追加検証ケース
  { year: 2019, month: 7, day: 10, expected: null, description: '令和元年テスト' },
  { year: 2020, month: 3, day: 20, expected: null, description: '令和2年テスト' },
];

async function testCase(testCase) {
  try {
    const response = await fetch('http://localhost:3000/api/fortune-calc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        year: testCase.year, 
        month: testCase.month, 
        day: testCase.day 
      }),
    });
    
    const data = await response.json();
    const actual = data.six_star;
    const isMatch = testCase.expected ? actual === testCase.expected : true;
    
    console.log(`${isMatch ? '✅' : '❌'} ${testCase.year}/${testCase.month}/${testCase.day} - ${testCase.description}`);
    
    if (testCase.expected) {
      console.log(`   期待値: ${testCase.expected}`);
      console.log(`   実際値: ${actual}`);
    } else {
      console.log(`   結果: ${actual}`);
    }
    
    console.log(`   動物: ${data.animal}`);
    console.log(`   星座: ${data.zodiac}`);
    console.log('');
    
    return isMatch;
  } catch (error) {
    console.log(`🚨 ${testCase.year}/${testCase.month}/${testCase.day} - エラー: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 運命数データベース - 最終検証テスト');
  console.log('=========================================\n');
  
  let passed = 0;
  let total = 0;
  
  for (const test of testCases) {
    const result = await testCase(test);
    if (test.expected) {
      total++;
      if (result) passed++;
    }
  }
  
  console.log('📊 検証結果サマリー');
  console.log('==================');
  console.log(`✅ 成功: ${passed}/${total} (${total > 0 ? ((passed/total)*100).toFixed(1) : 0}%)`);
  
  if (passed === total && total > 0) {
    console.log('🎉 全てのテストケースが成功しました！');
    console.log('📈 データベース駆動システムが正常に動作しています。');
  } else {
    console.log('⚠️  一部のテストケースが失敗しました。');
  }
  
  console.log('\n✨ 最終検証完了');
}

// テスト実行
runAllTests().catch(console.error);