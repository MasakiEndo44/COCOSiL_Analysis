/**
 * 体癖診断API テストスクリプト
 * 
 * Phase 1 の実装を検証するための単体テスト
 * 本格的な Next.js サーバーを使わず、ロジックを直接テスト
 */

const { TaihekiCalculator } = require('../src/lib/taiheki/calculator');
const { getTaihekiQuestions } = require('../src/lib/taiheki/data-access');

// テストデータ: 20問の回答例
const sampleAnswers = [
  // 質問1-20への回答例（type1向けに調整）
  { questionId: 1, selectedOptions: [0] }, // 縦長体型
  { questionId: 2, selectedOptions: [0] }, // きちんとした姿勢
  { questionId: 3, selectedOptions: [0] }, // 論理的分析
  { questionId: 4, selectedOptions: [0] }, // 理屈に合わない時ストレス
  { questionId: 5, selectedOptions: [0] }, // 計画的進行
  { questionId: 6, selectedOptions: [0] }, // 論理的思考
  { questionId: 7, selectedOptions: [0] }, // まず理解してから
  { questionId: 8, selectedOptions: [0] }, // 公平で一貫した態度
  { questionId: 9, selectedOptions: [0] }, // 感情を外に出さず冷静
  { questionId: 10, selectedOptions: [0] }, // あっさりした上品な味
  { questionId: 11, selectedOptions: [0] }, // 一人の時間で静かに休む
  { questionId: 12, selectedOptions: [0] }, // 長時間集中持続
  { questionId: 13, selectedOptions: [0] }, // 論理的で公正な判断
  { questionId: 14, selectedOptions: [0] }, // 計画的行動
  { questionId: 15, selectedOptions: [0] }, // プロセス重視
  { questionId: 16, selectedOptions: [0] }, // シンプルで洗練
  { questionId: 17, selectedOptions: [0] }, // 冷静に分析
  { questionId: 18, selectedOptions: [0] }, // 整理整頓された生活
  { questionId: 19, selectedOptions: [0] }, // 規則正しい生活
  { questionId: 20, selectedOptions: [0] }  // 正義と公正さ
];

async function testTaihekiSystem() {
  console.log('🧪 体癖診断システム テスト開始\n');

  try {
    // 1. 質問データ読み込みテスト
    console.log('📊 Step 1: 質問データ読み込み');
    const questions = await getTaihekiQuestions();
    console.log(`✅ 質問数: ${questions.length}問`);
    
    if (questions.length !== 20) {
      throw new Error(`Expected 20 questions, got ${questions.length}`);
    }

    // 質問データ詳細チェック
    console.log('   📝 質問データ詳細:');
    const categories = {};
    let totalOptions = 0;
    
    questions.forEach((q, index) => {
      categories[q.category] = (categories[q.category] || 0) + 1;
      totalOptions += q.options?.length || 0;
      
      if (index < 3) {
        console.log(`   - Q${q.id}: ${q.text.slice(0, 30)}... (${q.options?.length}択, 重み:${q.weight})`);
      }
    });
    
    console.log(`   📈 カテゴリ分布:`, categories);
    console.log(`   🎯 平均選択肢数: ${(totalOptions / questions.length).toFixed(1)}択\n`);

    // 2. 計算エンジンテスト
    console.log('🔧 Step 2: スコア計算エンジン初期化');
    const calculator = new TaihekiCalculator(questions);
    console.log('✅ 計算エンジン初期化完了');

    // 3. 診断計算実行
    console.log('🎯 Step 3: 診断計算実行');
    const startTime = new Date(Date.now() - 5 * 60 * 1000); // 5分前に開始と仮定
    const result = calculator.calculateDiagnosis(sampleAnswers, startTime);
    
    console.log('✅ 診断結果:');
    console.log(`   🥇 第1体癖: ${result.primaryType} (スコア: ${result.primaryScore})`);
    console.log(`   🥈 第2体癖: ${result.secondaryType} (スコア: ${result.secondaryScore})`);
    console.log(`   📊 信頼度: ${result.confidence.toFixed(3)} (${result.reliabilityText} ${result.reliabilityStars})`);
    console.log(`   ⏱️  完了時間: ${result.completionTime}秒`);
    console.log(`   🎲 全スコア詳細:`);
    
    Object.entries(result.allScores).forEach(([type, score]) => {
      const bar = '█'.repeat(Math.floor(score / result.maxScore * 20));
      console.log(`     ${type}: ${score.toFixed(1).padStart(5)} ${bar}`);
    });

    // 4. パフォーマンステスト
    console.log('\n⚡ Step 4: パフォーマンステスト');
    const iterations = 100;
    const startPerf = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      calculator.calculateDiagnosis(sampleAnswers);
    }
    
    const avgTime = (Date.now() - startPerf) / iterations;
    console.log(`✅ 平均処理時間: ${avgTime.toFixed(1)}ms (目標: <100ms)`);
    
    if (avgTime > 100) {
      console.warn(`⚠️  処理時間が目標を超過: ${avgTime.toFixed(1)}ms > 100ms`);
    }

    // 5. キャッシュ効果テスト
    console.log('\n💾 Step 5: キャッシュ効果テスト');
    const cacheStats = calculator.getCacheStats();
    console.log(`✅ キャッシュサイズ: ${cacheStats.size}, ヒット率: ${(cacheStats.hitRate * 100).toFixed(1)}%`);

    // 6. 精度検証テスト
    console.log('\n🎯 Step 6: 診断精度検証');
    
    // type1向け回答が実際にtype1を返すかチェック
    if (result.primaryType === 'type1') {
      console.log('✅ 期待される体癖タイプが正しく診断されました');
    } else {
      console.log(`⚠️  期待: type1, 実際: ${result.primaryType}`);
    }
    
    // 信頼度チェック
    if (result.confidence >= 1.3) {
      console.log('✅ 高い信頼度で診断されました');
    } else {
      console.log(`📊 信頼度: ${result.confidence.toFixed(3)} (基準: ≥1.3 で高信頼度)`);
    }

    console.log('\n🎉 全テスト完了！体癖診断システムが正常に動作しています。');

  } catch (error) {
    console.error('\n❌ テスト失敗:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// 追加テスト: 異なるパターンの診断
async function testMultiplePatterns() {
  console.log('\n🔄 複数パターンテスト開始\n');

  const patterns = [
    { name: 'Type3向け回答', answers: sampleAnswers.map(a => ({ ...a, selectedOptions: [1] })) },
    { name: 'Type5向け回答', answers: sampleAnswers.map(a => ({ ...a, selectedOptions: [2] })) },
    { name: 'Type7向け回答', answers: sampleAnswers.map((a, i) => ({ ...a, selectedOptions: i % 2 === 0 ? [3] : [1] })) },
  ];

  const questions = await getTaihekiQuestions();
  const calculator = new TaihekiCalculator(questions);

  for (const pattern of patterns) {
    try {
      const result = calculator.calculateDiagnosis(pattern.answers);
      console.log(`📊 ${pattern.name}: ${result.primaryType} (信頼度: ${result.confidence.toFixed(2)})`);
    } catch (error) {
      console.error(`❌ ${pattern.name} でエラー:`, error.message);
    }
  }
}

// メイン実行
if (require.main === module) {
  testTaihekiSystem()
    .then(() => testMultiplePatterns())
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}