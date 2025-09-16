// 体癖ペルソナテスト実行デモ
// 実際の製品システムと連携する前のコンセプト検証

import { TaihekiPersona, TestResult } from './types.js';
import { samplePersonas } from './personas/sample-personas';

// 現在のシステムに対応した簡略版テスト
class TaihekiPersonaTesterDemo {
  private readonly MAX_QUESTIONS = 20;

  simulateCurrentSystem(responses: number[]): {
    primary: number;
    secondary: number;
    scores: Record<number, number>;
    confidence: number;
  } {
    // 現在の4種システムをシミュレート
    const scores = { 1: 0, 2: 0, 3: 0, 4: 0 };
    
    responses.slice(0, this.MAX_QUESTIONS).forEach((choice, index) => {
      // 各質問で4択→4つの体癖型に対応（重み2）
      if (choice >= 0 && choice <= 3) {
        const targetType = choice + 1;
        scores[targetType as keyof typeof scores] += 2;
      }
    });

    const sortedTypes = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .map(([type]) => parseInt(type));

    const topScore = Object.values(scores).sort((a, b) => b - a)[0];
    const secondScore = Object.values(scores).sort((a, b) => b - a)[1];
    const confidence = topScore > 0 ? ((topScore - secondScore) / topScore) * 100 : 0;

    return {
      primary: sortedTypes[0],
      secondary: sortedTypes[1],
      scores,
      confidence
    };
  }

  async runDemo(): Promise<void> {
    console.log('🎯 体癖診断ペルソナテスト - デモンストレーション');
    console.log('=' .repeat(60));
    
    console.log('\n📊 システム概要:');
    console.log('- 現在: 4種体癖診断システム (1-4種)');
    console.log('- 目標: 10種完全対応システム (1-10種)');
    console.log('- 方法: 仮想ペルソナによる精度検証\n');

    let correctPredictions = 0;
    const results: Array<{
      persona: string;
      expected: number;
      actual: number;
      confidence: number;
      correct: boolean;
    }> = [];

    for (const persona of samplePersonas) {
      console.log(`🤖 ペルソナテスト: ${persona.name} (${persona.type}種)`);
      console.log(`   職業: ${persona.demographics.occupation}`);
      console.log(`   特徴: ${persona.description}`);

      // ペルソナの回答パターンを生成
      const responses = persona.responsePatterns.map(pattern => pattern.mostLikelyChoice);
      
      // 足りない質問分は中立的回答で補完
      while (responses.length < this.MAX_QUESTIONS) {
        responses.push(Math.floor(Math.random() * 4)); // ランダム補完
      }

      console.log(`   回答: [${responses.slice(0, 8).join(', ')}...]`);

      // 診断実行
      const result = this.simulateCurrentSystem(responses);
      const isCorrect = result.primary === persona.type;
      
      if (isCorrect) correctPredictions++;

      results.push({
        persona: persona.name,
        expected: persona.type,
        actual: result.primary,
        confidence: result.confidence,
        correct: isCorrect
      });

      console.log(`   結果: ${result.primary}種 (信頼度: ${result.confidence.toFixed(1)}%)`);
      console.log(`   判定: ${isCorrect ? '✅ 正解' : '❌ 不正解'}`);
      console.log(`   スコア: ${JSON.stringify(result.scores)}\n`);
    }

    // 結果サマリー
    const accuracy = (correctPredictions / samplePersonas.length) * 100;
    console.log('📊 テスト結果サマリー');
    console.log('=' .repeat(40));
    console.log(`総ペルソナ数: ${samplePersonas.length}`);
    console.log(`正解数: ${correctPredictions}`);
    console.log(`精度: ${accuracy.toFixed(1)}%`);
    
    console.log('\n📋 詳細結果:');
    results.forEach(result => {
      const status = result.correct ? '✅' : '❌';
      console.log(`${status} ${result.persona}: ${result.expected}種 → ${result.actual}種 (${result.confidence.toFixed(1)}%)`);
    });

    // 問題分析
    const incorrectResults = results.filter(r => !r.correct);
    if (incorrectResults.length > 0) {
      console.log('\n⚠️  誤分類の分析:');
      incorrectResults.forEach(result => {
        console.log(`- ${result.persona}: ${result.expected}種 → ${result.actual}種に誤分類`);
      });
      
      console.log('\n💡 改善提案:');
      console.log('1. 質問の重みづけ調整');
      console.log('2. 判別困難な型ペア用の新質問追加');
      console.log('3. 選択肢の文言明確化');
      console.log('4. アルゴリズムの改良');
    } else {
      console.log('\n🎉 すべてのペルソナが正しく分類されました！');
    }

    console.log('\n🚀 次のアクション:');
    console.log('1. システムを10種に拡張');
    console.log('2. 体癖5-10種のペルソナ作成');
    console.log('3. より高精度なアルゴリズム開発');
    console.log('4. 実際のユーザーデータでの検証');
  }
}

// デモ実行用関数
export async function runPersonaDemo(): Promise<void> {
  const demo = new TaihekiPersonaTesterDemo();
  await demo.runDemo();
}

// CLI実行
if (require.main === module) {
  runPersonaDemo().catch(console.error);
}