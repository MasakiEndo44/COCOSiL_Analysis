// 拡張体癖ペルソナテストの簡単な動作確認
// Node.js で直接実行可能

console.log('🎯 体癖診断拡張システム - 簡易テスト開始');
console.log('=' .repeat(50));

// サンプルペルソナデータ（簡略版）
const samplePersonas = [
  {
    id: 'type1_test',
    type: 1,
    name: '田中理(論理型)',
    responses: [0, 0, 0, 0, 0] // 1種に対応する選択肢
  },
  {
    id: 'type5_test', 
    type: 5,
    name: '前田健太(積極型)',
    responses: [0, 0, 0, 0, 0] // 5種に対応する選択肢（推定）
  },
  {
    id: 'type7_test',
    type: 7, 
    name: '山田博士(批判型)',
    responses: [0, 2, 0, 2, 0] // 7種に対応する選択肢（推定）
  }
];

// 簡略化された体癖計算アルゴリズム
function calculateTaiheki(responses) {
  const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
  
  // 簡単なスコア計算
  responses.forEach((choice, index) => {
    if (choice >= 0 && choice <= 3) {
      const targetType = choice + 1;
      scores[targetType] += 2;
    }
  });
  
  // 5種以上へのスコア分散（仮の実装）
  if (scores[1] > 0) scores[5] += 1; // 1種→5種の関連性
  if (scores[3] > 0) scores[7] += 1; // 3種→7種の関連性
  
  const sortedTypes = Object.keys(scores)
    .map(k => parseInt(k))
    .sort((a, b) => scores[b] - scores[a]);
  
  const primary = sortedTypes[0];
  const secondary = sortedTypes[1];
  const confidence = scores[primary] > 0 ? 
    ((scores[primary] - scores[secondary]) / scores[primary]) * 100 : 0;
  
  return {
    primary,
    secondary,
    scores,
    confidence
  };
}

// テスト実行
console.log('\n📊 ペルソナテスト実行:');
let correctCount = 0;
const results = [];

samplePersonas.forEach(persona => {
  console.log(`\n🤖 テスト: ${persona.name} (期待: ${persona.type}種)`);
  
  const diagnosis = calculateTaiheki(persona.responses);
  const isCorrect = diagnosis.primary === persona.type;
  
  if (isCorrect) correctCount++;
  
  results.push({
    persona: persona.name,
    expected: persona.type,
    actual: diagnosis.primary,
    confidence: diagnosis.confidence,
    correct: isCorrect
  });
  
  console.log(`   結果: ${diagnosis.primary}種 (信頼度: ${diagnosis.confidence.toFixed(1)}%)`);
  console.log(`   判定: ${isCorrect ? '✅ 正解' : '❌ 不正解'}`);
  console.log(`   スコア: ${JSON.stringify(diagnosis.scores)}`);
});

// 結果サマリー
console.log('\n📈 テスト結果サマリー:');
console.log('=' .repeat(40));
const accuracy = (correctCount / samplePersonas.length) * 100;
console.log(`総ペルソナ数: ${samplePersonas.length}`);
console.log(`正解数: ${correctCount}`);
console.log(`精度: ${accuracy.toFixed(1)}%`);

console.log('\n📋 詳細結果:');
results.forEach(result => {
  const status = result.correct ? '✅' : '❌';
  console.log(`${status} ${result.persona}: ${result.expected}種 → ${result.actual}種`);
});

if (accuracy < 100) {
  console.log('\n💡 改善が必要な領域:');
  console.log('1. 5-10種用の質問設計の精密化');
  console.log('2. 重みづけアルゴリズムの調整');
  console.log('3. より多様なペルソナでの検証');
} else {
  console.log('\n🎉 基本テストは成功！拡張テストに進行可能');
}

console.log('\n🚀 次のアクション:');
console.log('1. TypeScript版での拡張テスト実行');
console.log('2. 30問版アルゴリズムの統合');
console.log('3. 統計分析の実施');

console.log('\n✅ 簡易テスト完了');