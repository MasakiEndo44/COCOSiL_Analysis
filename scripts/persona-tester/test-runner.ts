// 体癖ペルソナテスト実行エンジン

import { TaihekiPersona, TestResult, TestSuite, QuestionAnalysis } from './types';
import { samplePersonas, personaVariations } from './personas/sample-personas';

// 現在のアルゴリズムをインポート（実際のプロジェクトファイルから）
// 注意: 実際の実装時はパスを調整
type TaihekiType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface TaihekiResult {
  primary: TaihekiType;
  secondary: TaihekiType;
  scores: Record<TaihekiType, number>;
  characteristics: string[];
  recommendations: string[];
}

// 簡略版のテスト用算出ロジック（実際のものを使用する場合は import）
function calculateTaihekiForTest(answers: number[]): TaihekiResult {
  const scores: Record<TaihekiType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0
  };

  // 簡略化された計算（実際のアルゴリズムでは重みや質問構造を反映）
  answers.forEach((answerIndex, questionIndex) => {
    // 現在の4種システムの簡略化
    if (answerIndex >= 0 && answerIndex <= 3) {
      const targetType = (answerIndex + 1) as TaihekiType;
      scores[targetType] += 2;
    }
  });

  const sortedTypes = (Object.keys(scores) as unknown as TaihekiType[])
    .sort((a, b) => scores[b] - scores[a]);

  return {
    primary: sortedTypes[0],
    secondary: sortedTypes[1],
    scores,
    characteristics: [],
    recommendations: []
  };
}

export class TaihekiPersonaTester {
  private testResults: TestResult[] = [];

  async runPersonaTest(persona: TaihekiPersona): Promise<TestResult> {
    console.log(`\n=== テスト実行: ${persona.name} (期待タイプ: ${persona.type}種) ===`);

    // ペルソナの回答パターンから実際の回答を生成
    const responses = persona.responsePatterns.map(pattern => {
      return pattern.mostLikelyChoice;
    });

    // 不足分は中立的な回答で補完（現在のシステムが20問ある場合）
    while (responses.length < 20) {
      responses.push(0); // デフォルト回答
    }

    console.log(`回答パターン: [${responses.slice(0, 5).join(', ')}...]`);

    // 現在のアルゴリズムで診断実行
    const diagnosis = calculateTaihekiForTest(responses);

    console.log(`診断結果: 主体癖${diagnosis.primary}種, 副体癖${diagnosis.secondary}種`);
    console.log(`スコア分布: ${JSON.stringify(diagnosis.scores)}`);

    const result: TestResult = {
      personaId: persona.id,
      expectedType: persona.type,
      actualPrimary: diagnosis.primary,
      actualSecondary: diagnosis.secondary,
      confidence: this.calculateConfidence(diagnosis.scores),
      accuracy: diagnosis.primary === persona.type,
      scores: diagnosis.scores,
      timestamp: new Date()
    };

    console.log(`精度: ${result.accuracy ? '✅ 正解' : '❌ 不正解'} (信頼度: ${result.confidence.toFixed(2)})`);

    this.testResults.push(result);
    return result;
  }

  async runBatchTest(personas: TaihekiPersona[]): Promise<TestSuite> {
    console.log(`\n🚀 バッチテスト開始: ${personas.length}体のペルソナをテスト`);
    
    const results: TestResult[] = [];
    
    for (const persona of personas) {
      const result = await this.runPersonaTest(persona);
      results.push(result);
      
      // 少し間隔を空ける（実際のテストでは不要）
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const testSuite: TestSuite = {
      id: `test-${Date.now()}`,
      timestamp: new Date(),
      totalPersonas: personas.length,
      results,
      metrics: this.calculateMetrics(results)
    };

    this.generateReport(testSuite);
    return testSuite;
  }

  private calculateConfidence(scores: Record<TaihekiType, number>): number {
    const sortedScores = Object.values(scores).sort((a, b) => b - a);
    const topScore = sortedScores[0];
    const secondScore = sortedScores[1];
    
    if (topScore === 0) return 0;
    
    // 1位と2位のスコア差が大きいほど信頼度が高い
    const confidence = topScore > 0 ? (topScore - secondScore) / topScore : 0;
    return Math.min(confidence * 100, 100);
  }

  private calculateMetrics(results: TestResult[]) {
    const totalTests = results.length;
    const correctTests = results.filter(r => r.accuracy).length;
    const overallAccuracy = totalTests > 0 ? correctTests / totalTests : 0;

    // 体癖型別の精度計算
    const perTypeAccuracy: Record<TaihekiType, number> = {} as Record<TaihekiType, number>;
    for (let type = 1; type <= 10; type++) {
      const typeResults = results.filter(r => r.expectedType === type);
      const typeCorrect = typeResults.filter(r => r.accuracy).length;
      perTypeAccuracy[type as TaihekiType] = typeResults.length > 0 ? typeCorrect / typeResults.length : 0;
    }

    // 平均信頼度
    const averageConfidence = results.length > 0 
      ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
      : 0;

    // 混同行列（簡略版）
    const confusionMatrix: number[][] = Array(10).fill(0).map(() => Array(10).fill(0));
    results.forEach(result => {
      const expected = result.expectedType - 1; // 0-based index
      const actual = result.actualPrimary - 1;
      if (expected >= 0 && expected < 10 && actual >= 0 && actual < 10) {
        confusionMatrix[expected][actual]++;
      }
    });

    return {
      overallAccuracy,
      perTypeAccuracy,
      averageConfidence,
      confusionMatrix
    };
  }

  private generateReport(testSuite: TestSuite): void {
    console.log(`\n📊 ===== テスト結果レポート =====`);
    console.log(`テストID: ${testSuite.id}`);
    console.log(`実行時刻: ${testSuite.timestamp.toLocaleString('ja-JP')}`);
    console.log(`総ペルソナ数: ${testSuite.totalPersonas}`);
    console.log(`\n📈 総合指標:`);
    console.log(`全体精度: ${(testSuite.metrics.overallAccuracy * 100).toFixed(1)}%`);
    console.log(`平均信頼度: ${testSuite.metrics.averageConfidence.toFixed(1)}%`);
    
    console.log(`\n📋 体癖型別精度:`);
    for (let type = 1; type <= 4; type++) { // 現在は4型のみ
      const accuracy = testSuite.metrics.perTypeAccuracy[type as TaihekiType];
      if (accuracy > 0) {
        console.log(`  ${type}種: ${(accuracy * 100).toFixed(1)}%`);
      }
    }

    console.log(`\n🔍 詳細結果:`);
    testSuite.results.forEach(result => {
      const status = result.accuracy ? '✅' : '❌';
      console.log(`  ${status} ${result.personaId}: 期待${result.expectedType}種 → 実際${result.actualPrimary}種 (信頼度: ${result.confidence.toFixed(1)}%)`);
    });

    console.log(`\n⚠️  問題のある結果:`);
    const incorrectResults = testSuite.results.filter(r => !r.accuracy);
    if (incorrectResults.length > 0) {
      incorrectResults.forEach(result => {
        console.log(`  ❌ ${result.personaId}: ${result.expectedType}種 → ${result.actualPrimary}種 (誤分類)`);
        console.log(`     スコア: ${JSON.stringify(result.scores)}`);
      });
    } else {
      console.log(`  🎉 すべてのペルソナが正しく分類されました！`);
    }

    console.log(`\n💡 改善提案:`);
    this.generateOptimizationSuggestions(testSuite);
  }

  private generateOptimizationSuggestions(testSuite: TestSuite): void {
    const incorrectResults = testSuite.results.filter(r => !r.accuracy);
    
    if (incorrectResults.length === 0) {
      console.log(`  ✨ 現在のアルゴリズムは十分に機能しています`);
      return;
    }

    // 誤分類パターンの分析
    const misclassificationPatterns: { [key: string]: number } = {};
    incorrectResults.forEach(result => {
      const pattern = `${result.expectedType}→${result.actualPrimary}`;
      misclassificationPatterns[pattern] = (misclassificationPatterns[pattern] || 0) + 1;
    });

    console.log(`  📊 よくある誤分類パターン:`);
    Object.entries(misclassificationPatterns)
      .sort(([,a], [,b]) => b - a)
      .forEach(([pattern, count]) => {
        console.log(`    ${pattern}: ${count}回`);
      });

    console.log(`  🔧 推奨改善策:`);
    console.log(`    1. 重み調整: 誤分類の多い型に対する質問の重みを増加`);
    console.log(`    2. 選択肢改善: 曖昧な選択肢の文言を明確化`);
    console.log(`    3. 新質問追加: 区別困難な型ペア用の判別質問を追加`);
    console.log(`    4. アルゴリズム改良: 信頼度計算の精度向上`);
  }

  // 個別質問の判別力分析
  analyzeQuestionDiscrimination(results: TestResult[]): QuestionAnalysis[] {
    // 実装予定: 各質問がどの程度正確に型を判別できているかを分析
    return [];
  }

  // アルゴリズム最適化提案生成
  generateOptimizationProposals(testSuite: TestSuite) {
    // 実装予定: 具体的な重み調整や質問改善の提案を生成
    return [];
  }
}

// テスト実行用のエントリーポイント
export async function runPersonaTesting(): Promise<void> {
  const tester = new TaihekiPersonaTester();
  
  console.log('🎯 体癖診断アルゴリズム精度テスト開始');
  console.log('現在のシステム: 1-4種対応');
  console.log('テスト対象: サンプルペルソナ');
  
  // 基本的なペルソナテスト
  const testSuite = await tester.runBatchTest(samplePersonas);
  
  console.log('\n🔄 バリエーションテスト');
  await tester.runBatchTest([...samplePersonas, ...personaVariations]);
  
  console.log('\n✅ テスト完了');
  console.log('\n📝 次のステップ:');
  console.log('1. システムを10種に拡張');
  console.log('2. より多様なペルソナを作成');
  console.log('3. 統計的分析の実施');
  console.log('4. アルゴリズムの最適化');
}

// CLI実行時のエントリーポイント
if (require.main === module) {
  runPersonaTesting().catch(console.error);
}