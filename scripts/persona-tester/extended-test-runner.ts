// 拡張体癖ペルソナテスト実行エンジン - 10種完全対応版
// 30質問 × 10種ペルソナの包括的精度検証システム

import { TaihekiPersona, TestResult, TestSuite } from './types.js';
import { samplePersonas } from './personas/sample-personas.js';
import { allExtendedPersonas } from './personas/extended-personas.js';
import { extendedTaihekiQuestions, calculateExtendedTaiheki } from '../../src/lib/data/taiheki-questions-extended.js';

// 統合テストスイート用の型定義
interface ExtendedTestResult extends TestResult {
  axisScores: Record<string, Record<number, number>>;
  confidence: number;
  expectedAxis: string;
  actualAxis: string;
  axisAccuracy: boolean;
}

interface StatisticalAnalysis {
  overallAccuracy: number;
  perTypeAccuracy: Record<number, number>;
  perAxisAccuracy: Record<string, number>;
  confidenceDistribution: number[];
  confusionMatrix: number[][];
  misclassificationPatterns: Record<string, number>;
  discriminationPower: Record<number, number>; // 質問番号別判別力
}

export class ExtendedTaihekiPersonaTester {
  private testResults: ExtendedTestResult[] = [];

  async runPersonaTest(persona: TaihekiPersona, useExtendedQuestions: boolean = true): Promise<ExtendedTestResult> {
    console.log(`\n=== 拡張テスト実行: ${persona.name} (期待タイプ: ${persona.type}種) ===`);

    // ペルソナの回答パターンから実際の回答を生成
    const responses = this.generatePersonaResponses(persona, useExtendedQuestions);
    
    console.log(`回答パターン: [${responses.slice(0, 8).join(', ')}...]`);

    // 拡張アルゴリズムで診断実行
    const diagnosis = useExtendedQuestions 
      ? calculateExtendedTaiheki(responses)
      : this.simulateBasicCalculation(responses);

    console.log(`診断結果: 主体癖${diagnosis.primary}種, 副体癖${diagnosis.secondary}種`);
    console.log(`信頼度: ${diagnosis.confidence.toFixed(1)}%`);
    console.log(`軸別スコア: ${JSON.stringify(diagnosis.axisScores)}`);

    // 軸判定
    const expectedAxis = this.getPersonaAxis(persona.type);
    const actualAxis = this.getPersonaAxis(diagnosis.primary);

    const result: ExtendedTestResult = {
      personaId: persona.id,
      expectedType: persona.type,
      actualPrimary: diagnosis.primary,
      actualSecondary: diagnosis.secondary,
      confidence: diagnosis.confidence,
      accuracy: diagnosis.primary === persona.type,
      scores: diagnosis.scores,
      axisScores: diagnosis.axisScores,
      expectedAxis,
      actualAxis,
      axisAccuracy: expectedAxis === actualAxis,
      timestamp: new Date()
    };

    const accuracyIcon = result.accuracy ? '✅' : '❌';
    const axisIcon = result.axisAccuracy ? '🎯' : '⚠️';
    console.log(`判定: ${accuracyIcon} 体癖精度 | ${axisIcon} 軸精度 | 信頼度: ${result.confidence.toFixed(1)}%`);

    this.testResults.push(result);
    return result;
  }

  private generatePersonaResponses(persona: TaihekiPersona, useExtended: boolean): number[] {
    const questionCount = useExtended ? 30 : 20;
    const responses: number[] = [];

    // ペルソナの既定の回答パターンを使用
    for (let i = 0; i < questionCount; i++) {
      const pattern = persona.responsePatterns.find(p => p.questionId === i + 1);
      if (pattern) {
        responses.push(pattern.mostLikelyChoice);
      } else {
        // パターンがない場合は体癖タイプに基づいて推定
        responses.push(this.estimateResponse(i + 1, persona.type));
      }
    }

    return responses;
  }

  private estimateResponse(questionId: number, personaType: number): number {
    // 体癖タイプに基づく回答推定ロジック
    const typeMapping = {
      1: 0, 2: 1, 3: 2, 4: 3, 5: 0, 6: 1, 7: 2, 8: 3, 9: 0, 10: 1
    };
    
    // 基本的には自分のタイプに対応する選択肢を選ぶ傾向
    if (personaType <= 4) {
      return typeMapping[personaType as keyof typeof typeMapping];
    } else {
      // 5-10種は循環的にマッピング
      return (personaType - 1) % 4;
    }
  }

  private simulateBasicCalculation(responses: number[]): any {
    // 既存の4種システムのシミュレート（比較用）
    const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    
    responses.slice(0, 20).forEach((choice) => {
      if (choice >= 0 && choice <= 3) {
        const targetType = choice + 1;
        scores[targetType as keyof typeof scores] += 2;
      }
    });

    const sortedTypes = (Object.keys(scores) as unknown as number[])
      .sort((a, b) => scores[b] - scores[a]);

    return {
      primary: sortedTypes[0],
      secondary: sortedTypes[1],
      scores,
      axisScores: {},
      confidence: 50 // 基本システムは信頼度計算なし
    };
  }

  private getPersonaAxis(type: number): string {
    const axisMap: Record<number, string> = {
      1: '上下', 2: '上下',
      3: '左右', 4: '左右',
      5: '前後', 6: '前後',
      7: '捻れ', 8: '捻れ',
      9: '開閉', 10: '開閉'
    };
    return axisMap[type] || '不明';
  }

  async runComprehensiveTest(): Promise<TestSuite> {
    console.log(`\n🚀 包括的体癖診断精度テスト開始`);
    console.log('=' .repeat(60));
    
    console.log('\n📊 テスト構成:');
    console.log('- 基本ペルソナ: 4体 (1-4種)');
    console.log('- 拡張ペルソナ: 6体 (5-10種)');
    console.log('- バリエーション: 2体');
    console.log('- 境界ケース: 2体');
    console.log('- 総計: 14体のペルソナ');
    console.log('- 質問数: 30問 (拡張システム)');

    const allPersonas = [...samplePersonas, ...allExtendedPersonas];
    const results: ExtendedTestResult[] = [];
    
    for (const persona of allPersonas) {
      const result = await this.runPersonaTest(persona, true);
      results.push(result);
      
      // 少し間隔を空ける
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const testSuite: TestSuite = {
      id: `extended-test-${Date.now()}`,
      timestamp: new Date(),
      totalPersonas: allPersonas.length,
      results,
      metrics: this.calculateExtendedMetrics(results)
    };

    this.generateExtendedReport(testSuite, results);
    return testSuite;
  }

  private calculateExtendedMetrics(results: ExtendedTestResult[]): any {
    const totalTests = results.length;
    const correctTests = results.filter(r => r.accuracy).length;
    const overallAccuracy = totalTests > 0 ? correctTests / totalTests : 0;

    // 体癖型別精度
    const perTypeAccuracy: Record<number, number> = {};
    for (let type = 1; type <= 10; type++) {
      const typeResults = results.filter(r => r.expectedType === type);
      const typeCorrect = typeResults.filter(r => r.accuracy).length;
      perTypeAccuracy[type] = typeResults.length > 0 ? typeCorrect / typeResults.length : 0;
    }

    // 軸別精度
    const axes = ['上下', '左右', '前後', '捻れ', '開閉'];
    const perAxisAccuracy: Record<string, number> = {};
    axes.forEach(axis => {
      const axisResults = results.filter(r => r.expectedAxis === axis);
      const axisCorrect = axisResults.filter(r => r.axisAccuracy).length;
      perAxisAccuracy[axis] = axisResults.length > 0 ? axisCorrect / axisResults.length : 0;
    });

    // 信頼度分布
    const confidenceDistribution = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100
    results.forEach(result => {
      const bucket = Math.min(Math.floor(result.confidence / 20), 4);
      confidenceDistribution[bucket]++;
    });

    // 混同行列
    const confusionMatrix: number[][] = Array(10).fill(0).map(() => Array(10).fill(0));
    results.forEach(result => {
      const expected = result.expectedType - 1;
      const actual = result.actualPrimary - 1;
      if (expected >= 0 && expected < 10 && actual >= 0 && actual < 10) {
        confusionMatrix[expected][actual]++;
      }
    });

    // 誤分類パターン
    const misclassificationPatterns: Record<string, number> = {};
    results.filter(r => !r.accuracy).forEach(result => {
      const pattern = `${result.expectedType}→${result.actualPrimary}`;
      misclassificationPatterns[pattern] = (misclassificationPatterns[pattern] || 0) + 1;
    });

    // 平均信頼度
    const averageConfidence = results.length > 0 
      ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
      : 0;

    return {
      overallAccuracy,
      perTypeAccuracy,
      perAxisAccuracy,
      confidenceDistribution,
      confusionMatrix,
      misclassificationPatterns,
      averageConfidence
    };
  }

  private generateExtendedReport(testSuite: TestSuite, results: ExtendedTestResult[]): void {
    console.log(`\n📊 ===== 拡張体癖診断精度テスト結果レポート =====`);
    console.log(`テストID: ${testSuite.id}`);
    console.log(`実行時刻: ${testSuite.timestamp.toLocaleString('ja-JP')}`);
    console.log(`総ペルソナ数: ${testSuite.totalPersonas}`);
    
    const metrics = testSuite.metrics;
    
    console.log(`\n📈 総合指標:`);
    console.log(`全体精度: ${(metrics.overallAccuracy * 100).toFixed(1)}%`);
    console.log(`平均信頼度: ${metrics.averageConfidence.toFixed(1)}%`);
    
    console.log(`\n🎯 体癖型別精度:`);
    for (let type = 1; type <= 10; type++) {
      const accuracy = metrics.perTypeAccuracy[type];
      if (accuracy !== undefined) {
        const icon = accuracy >= 0.8 ? '✅' : accuracy >= 0.6 ? '⚠️' : '❌';
        console.log(`  ${icon} ${type}種: ${(accuracy * 100).toFixed(1)}%`);
      }
    }

    console.log(`\n⚖️ 軸別精度:`);
    Object.entries(metrics.perAxisAccuracy).forEach(([axis, accuracy]) => {
      const icon = accuracy >= 0.8 ? '✅' : accuracy >= 0.6 ? '⚠️' : '❌';
      console.log(`  ${icon} ${axis}型: ${(accuracy * 100).toFixed(1)}%`);
    });

    console.log(`\n📊 信頼度分布:`);
    const labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
    metrics.confidenceDistribution.forEach((count: number, index: number) => {
      console.log(`  ${labels[index]}: ${count}件`);
    });

    console.log(`\n🔍 詳細結果:`);
    results.forEach(result => {
      const typeIcon = result.accuracy ? '✅' : '❌';
      const axisIcon = result.axisAccuracy ? '🎯' : '⚠️';
      console.log(`  ${typeIcon}${axisIcon} ${result.personaId}: ${result.expectedType}種→${result.actualPrimary}種 (${result.confidence.toFixed(1)}%)`);
    });

    console.log(`\n⚠️ 誤分類パターン:`);
    const incorrectResults = results.filter(r => !r.accuracy);
    if (incorrectResults.length > 0) {
      Object.entries(metrics.misclassificationPatterns)
        .sort(([,a], [,b]) => b - a)
        .forEach(([pattern, count]) => {
          console.log(`  ❌ ${pattern}: ${count}回`);
        });
      
      console.log(`\n💡 改善提案:`);
      this.generateOptimizationSuggestions(incorrectResults);
    } else {
      console.log(`  🎉 誤分類なし！完璧な精度を達成しました！`);
    }

    console.log(`\n📋 次のアクション:`);
    if (metrics.overallAccuracy < 0.85) {
      console.log(`1. 🔧 アルゴリズム最適化が必要（目標85%以上）`);
      console.log(`2. 📝 質問の重みづけ調整`);
      console.log(`3. ❓ 判別困難な型ペア用の新質問追加`);
    } else {
      console.log(`1. ✅ 精度目標達成！実用レベルに到達`);
      console.log(`2. 🔍 さらなる精度向上のための微調整`);
      console.log(`3. 🚀 本番システムへの統合準備`);
    }
  }

  private generateOptimizationSuggestions(incorrectResults: ExtendedTestResult[]): void {
    console.log(`  📊 分析結果:`);
    console.log(`    - 誤分類数: ${incorrectResults.length}件`);
    
    // 軸間違いの分析
    const axisErrors = incorrectResults.filter(r => !r.axisAccuracy);
    if (axisErrors.length > 0) {
      console.log(`    - 軸判定ミス: ${axisErrors.length}件`);
      console.log(`  🔧 推奨改善策:`);
      console.log(`    1. 軸別質問の重み増加`);
      console.log(`    2. 軸判別力の高い質問の追加`);
    }
    
    // 低信頼度の分析
    const lowConfidence = incorrectResults.filter(r => r.confidence < 60);
    if (lowConfidence.length > 0) {
      console.log(`    - 低信頼度誤答: ${lowConfidence.length}件`);
      console.log(`  🎯 信頼度改善:`);
      console.log(`    1. 判別質問の明確化`);
      console.log(`    2. 選択肢の文言改善`);
    }
    
    console.log(`  🔧 技術的改善:`);
    console.log(`    1. 重み調整アルゴリズムの適用`);
    console.log(`    2. 境界ケース判定ロジックの強化`);
    console.log(`    3. 信頼度計算式の最適化`);
  }

  // 基本システムとの比較テスト
  async runComparisonTest(): Promise<void> {
    console.log(`\n🔄 基本システム vs 拡張システム 比較テスト`);
    console.log('=' .repeat(60));
    
    const comparisonPersonas = [...samplePersonas, ...allExtendedPersonas.slice(0, 6)]; // 1-10種の代表
    
    console.log(`\n📊 基本システム（20問・4種判定）テスト:`);
    const basicResults: ExtendedTestResult[] = [];
    for (const persona of comparisonPersonas) {
      const result = await this.runPersonaTest(persona, false);
      basicResults.push(result);
    }
    
    console.log(`\n📊 拡張システム（30問・10種判定）テスト:`);
    const extendedResults: ExtendedTestResult[] = [];
    for (const persona of comparisonPersonas) {
      const result = await this.runPersonaTest(persona, true);
      extendedResults.push(result);
    }
    
    // 比較結果
    const basicAccuracy = basicResults.filter(r => r.accuracy).length / basicResults.length;
    const extendedAccuracy = extendedResults.filter(r => r.accuracy).length / extendedResults.length;
    
    console.log(`\n📈 比較結果:`);
    console.log(`基本システム精度: ${(basicAccuracy * 100).toFixed(1)}%`);
    console.log(`拡張システム精度: ${(extendedAccuracy * 100).toFixed(1)}%`);
    console.log(`精度向上: ${((extendedAccuracy - basicAccuracy) * 100).toFixed(1)}ポイント`);
    
    if (extendedAccuracy > basicAccuracy) {
      console.log(`✅ 拡張システムの優位性を確認`);
    } else {
      console.log(`⚠️ 拡張システムの更なる調整が必要`);
    }
  }
}

// テスト実行用のエントリーポイント
export async function runExtendedPersonaTesting(): Promise<void> {
  const tester = new ExtendedTaihekiPersonaTester();
  
  console.log('🎯 体癖診断拡張アルゴリズム精度テスト開始');
  console.log('拡張システム: 1-10種対応・30問・軸別分析');
  
  // 包括的テスト実行
  await tester.runComprehensiveTest();
  
  // 基本システムとの比較
  await tester.runComparisonTest();
  
  console.log('\n✅ 拡張テスト完了');
  console.log('\n📝 次のステップ:');
  console.log('1. アルゴリズム最適化の実施');
  console.log('2. 本番システムへの統合');
  console.log('3. 実ユーザーでの検証');
}

// CLI実行時のエントリーポイント
if (require.main === module) {
  runExtendedPersonaTesting().catch(console.error);
}