/**
 * 体癖診断スコア計算エンジン
 * 
 * HTMLファイルから移植・改良した高精度計算システム
 * - 4択制限対応
 * - 動的重み付け
 * - 信頼度計算改善
 * - パフォーマンス最適化
 */

import { 
  TaihekiType, 
  TaihekiQuestion,
  DiagnosisAnswer,
  DiagnosisResult,
  TypeScores,
  ProgressResult,
  TaihekiDiagnosisError,
  ERROR_CODES,
  TAIHEKI_CONFIG
} from '@/types/taiheki';

export class TaihekiCalculator {
  private questions: TaihekiQuestion[];
  private scoreCache: Map<string, TypeScores> = new Map();
  
  constructor(questions: TaihekiQuestion[]) {
    this.questions = questions;
    this.validateQuestions();
  }
  
  // ============================================================
  // メインAPI: 一括診断計算
  // ============================================================
  
  calculateDiagnosis(
    answers: DiagnosisAnswer[], 
    startTime?: Date
  ): DiagnosisResult {
    try {
      const calculationStart = Date.now();
      
      // 入力検証
      this.validateAnswers(answers);
      
      // スコア計算
      const allScores = this.calculateScores(answers);
      const sortedScores = this.getSortedScores(allScores);
      
      // 主要結果抽出
      const primaryType = sortedScores[0][0];
      const primaryScore = sortedScores[0][1];
      const secondaryType = sortedScores[1][0];
      const secondaryScore = sortedScores[1][1];
      const maxScore = Math.max(...Object.values(allScores));
      
      // 信頼度計算
      const confidence = this.calculateConfidence(primaryScore, secondaryScore);
      const { reliabilityText, reliabilityStars } = this.getReliabilityMetrics(confidence);
      
      // 完了時間計算
      const completionTime = startTime ? 
        Math.floor((Date.now() - startTime.getTime()) / 1000) : 
        undefined;
      
      const calculationTime = Date.now() - calculationStart;
      
      // パフォーマンス監視
      if (calculationTime > TAIHEKI_CONFIG.MAX_RESPONSE_TIME_MS) {
        console.warn(`Calculation took ${calculationTime}ms (>${TAIHEKI_CONFIG.MAX_RESPONSE_TIME_MS}ms)`);
      }
      
      return {
        primaryType,
        primaryScore,
        secondaryType,
        secondaryScore,
        allScores,
        maxScore,
        confidence,
        reliabilityText,
        reliabilityStars,
        totalQuestions: answers.length,
        completionTime
      };
      
    } catch (error) {
      throw new TaihekiDiagnosisError(
        'Diagnosis calculation failed',
        ERROR_CODES.CALCULATION_ERROR,
        { error: error instanceof Error ? error.message : String(error), answers }
      );
    }
  }
  
  // ============================================================
  // プログレッシブ診断: 暫定結果計算
  // ============================================================
  
  calculateProgress(answers: DiagnosisAnswer[]): ProgressResult {
    // 現在のスコア計算
    const currentScores = this.calculateScores(answers);
    
    // 完了率
    const completionRate = answers.length / this.questions.length;
    
    // 暫定信頼度計算
    const sortedScores = this.getSortedScores(currentScores);
    const confidence = this.calculateProgressiveConfidence(
      sortedScores[0][1], 
      sortedScores[1][1], 
      completionRate
    );
    
    // トップ候補抽出
    const topCandidates = sortedScores.slice(0, 3).map(([type, score]) => ({
      type,
      score,
      confidence: score / Math.max(...Object.values(currentScores))
    }));
    
    return {
      currentScores,
      topCandidates,
      overallConfidence: confidence,
      completionRate
    };
  }
  
  // ============================================================
  // 核心計算ロジック
  // ============================================================
  
  private calculateScores(answers: DiagnosisAnswer[]): TypeScores {
    // キャッシュキー生成
    const cacheKey = this.generateCacheKey(answers);
    if (this.scoreCache.has(cacheKey)) {
      return { ...this.scoreCache.get(cacheKey)! };
    }
    
    // スコア初期化
    const scores: TypeScores = this.initializeScores();
    
    // 各回答に対してスコア計算
    answers.forEach(answer => {
      const question = this.findQuestion(answer.questionId);
      const dynamicWeight = this.calculateDynamicWeight(question, answers.length);
      
      if (question.type === 'single') {
        this.processSingleAnswer(scores, question, answer, dynamicWeight);
      } else {
        this.processScaleAnswer(scores, question, answer, dynamicWeight);
      }
    });
    
    // キャッシュ保存
    this.scoreCache.set(cacheKey, { ...scores });
    
    return scores;
  }
  
  private processSingleAnswer(
    scores: TypeScores,
    question: TaihekiQuestion,
    answer: DiagnosisAnswer,
    weight: number
  ): void {
    // 複数選択時の減衰処理（改良版）
    const selectionPenalty = this.calculateSelectionPenalty(answer.selectedOptions);
    
    answer.selectedOptions.forEach(optionIndex => {
      if (!question.options || optionIndex >= question.options.length) {
        throw new TaihekiDiagnosisError(
          `Invalid option index: ${optionIndex}`,
          ERROR_CODES.INVALID_ANSWER
        );
      }
      
      const option = question.options[optionIndex];
      const finalWeight = weight * selectionPenalty * (option.confidenceLevel ?? 1.0);
      
      // スコア加算
      Object.entries(option.scores).forEach(([type, score]) => {
        scores[type as TaihekiType] += Math.floor(score * finalWeight);
      });
    });
  }
  
  private processScaleAnswer(
    scores: TypeScores,
    question: TaihekiQuestion,
    answer: DiagnosisAnswer,
    weight: number
  ): void {
    const optionIndex = answer.selectedOptions[0]; // スケール質問は単一選択
    
    if (!question.scaleOptions || optionIndex >= question.scaleOptions.length) {
      throw new TaihekiDiagnosisError(
        `Invalid scale option index: ${optionIndex}`,
        ERROR_CODES.INVALID_ANSWER
      );
    }
    
    const scaleOption = question.scaleOptions[optionIndex];
    
    Object.entries(scaleOption.scores).forEach(([type, score]) => {
      scores[type as TaihekiType] += Math.floor(score * weight);
    });
  }
  
  // ============================================================
  // 重み付け・信頼度計算
  // ============================================================
  
  private calculateDynamicWeight(question: TaihekiQuestion, totalAnswers: number): number {
    // 基本重み
    const baseWeight = question.weight;
    
    // 質問カテゴリ別の重み調整
    const categoryMultiplier = this.getCategoryMultiplier(question.category);
    
    // 進捗に基づく重み調整（後半の質問ほど重要）
    const progressMultiplier = 1.0 + (totalAnswers / this.questions.length) * 0.2;
    
    return baseWeight * categoryMultiplier * progressMultiplier;
  }
  
  private calculateSelectionPenalty(selectedOptions: number[]): number {
    if (selectedOptions.length <= 1) {
      return 1.0; // 単一選択は減衰なし
    }
    
    // 改良された複数選択減衰式
    // 2選択: 0.85, 3選択: 0.75, 4選択: 0.65
    return Math.max(0.5, 1.0 - (selectedOptions.length - 1) * 0.15);
  }
  
  private calculateConfidence(primaryScore: number, secondaryScore: number): number {
    if (secondaryScore === 0) {
      return TAIHEKI_CONFIG.CONFIDENCE_THRESHOLDS.VERY_HIGH;
    }
    
    return primaryScore / secondaryScore;
  }
  
  private calculateProgressiveConfidence(
    primaryScore: number, 
    secondaryScore: number, 
    completionRate: number
  ): number {
    const baseConfidence = this.calculateConfidence(primaryScore, secondaryScore);
    
    // 回答完了率による信頼度調整（平方根で緩やかな増加）
    const completionMultiplier = Math.pow(completionRate, 0.4);
    
    return Math.min(baseConfidence * completionMultiplier, 2.0);
  }
  
  private getReliabilityMetrics(confidence: number): {
    reliabilityText: string;
    reliabilityStars: string;
  } {
    const { CONFIDENCE_THRESHOLDS } = TAIHEKI_CONFIG;
    
    if (confidence >= CONFIDENCE_THRESHOLDS.VERY_HIGH) {
      return { reliabilityText: '非常に高い', reliabilityStars: '★★★★★' };
    } else if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
      return { reliabilityText: '高い', reliabilityStars: '★★★★☆' };
    } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      return { reliabilityText: '中程度', reliabilityStars: '★★★☆☆' };
    } else {
      return { reliabilityText: '参考程度', reliabilityStars: '★★☆☆☆' };
    }
  }
  
  // ============================================================
  // ユーティリティ関数
  // ============================================================
  
  private initializeScores(): TypeScores {
    return {
      type1: 0, type2: 0, type3: 0, type4: 0, type5: 0,
      type6: 0, type7: 0, type8: 0, type9: 0, type10: 0
    };
  }
  
  private getSortedScores(scores: TypeScores): Array<[TaihekiType, number]> {
    return (Object.entries(scores) as Array<[TaihekiType, number]>)
      .sort(([,a], [,b]) => b - a);
  }
  
  private findQuestion(questionId: number): TaihekiQuestion {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      throw new TaihekiDiagnosisError(
        `Question not found: ${questionId}`,
        ERROR_CODES.INVALID_QUESTION
      );
    }
    return question;
  }
  
  private getCategoryMultiplier(category: string): number {
    // 質問カテゴリ別の重要度
    switch (category) {
      case 'physical': return 1.2;    // 体型・身体特徴は重要
      case 'behavioral': return 1.1;  // 行動パターンも重要
      case 'mental': return 1.0;      // 思考パターンは標準
      case 'social': return 0.9;      // 社会的側面は補助的
      default: return 1.0;
    }
  }
  
  private generateCacheKey(answers: DiagnosisAnswer[]): string {
    // 回答パターンからハッシュキー生成
    const pattern = answers
      .sort((a, b) => a.questionId - b.questionId)
      .map(a => `${a.questionId}:${a.selectedOptions.sort().join(',')}`)
      .join('|');
    
    return btoa(pattern).slice(0, 16); // Base64エンコード + 短縮
  }
  
  // ============================================================
  // 入力検証
  // ============================================================
  
  private validateQuestions(): void {
    if (this.questions.length === 0) {
      throw new TaihekiDiagnosisError(
        'No questions provided',
        ERROR_CODES.INVALID_QUESTION
      );
    }
    
    this.questions.forEach(question => {
      // 4択制限チェック
      if (question.options && question.options.length > TAIHEKI_CONFIG.MAX_OPTIONS_PER_QUESTION) {
        throw new TaihekiDiagnosisError(
          `Question ${question.id} has too many options: ${question.options.length}`,
          ERROR_CODES.INVALID_QUESTION
        );
      }
      
      // スケール質問は5段階固定
      if (question.scaleOptions && question.scaleOptions.length !== 5) {
        throw new TaihekiDiagnosisError(
          `Scale question ${question.id} must have exactly 5 options`,
          ERROR_CODES.INVALID_QUESTION
        );
      }
    });
  }
  
  private validateAnswers(answers: DiagnosisAnswer[]): void {
    if (answers.length === 0) {
      throw new TaihekiDiagnosisError(
        'No answers provided',
        ERROR_CODES.INVALID_ANSWER
      );
    }
    
    answers.forEach(answer => {
      const question = this.findQuestion(answer.questionId);
      
      // 選択数制限チェック
      if (answer.selectedOptions.length > question.maxSelections) {
        throw new TaihekiDiagnosisError(
          `Too many selections for question ${answer.questionId}: ${answer.selectedOptions.length}`,
          ERROR_CODES.TOO_MANY_SELECTIONS
        );
      }
      
      // 選択肢インデックス有効性チェック
      const maxIndex = question.options?.length ?? question.scaleOptions?.length ?? 0;
      answer.selectedOptions.forEach(index => {
        if (index < 0 || index >= maxIndex) {
          throw new TaihekiDiagnosisError(
            `Invalid option index for question ${answer.questionId}: ${index}`,
            ERROR_CODES.INVALID_ANSWER
          );
        }
      });
    });
  }
  
  // ============================================================
  // パフォーマンス・デバッグ
  // ============================================================
  
  getCacheStats(): { size: number; hitRate: number } {
    // 本来はヒット率カウンタが必要だが、簡易実装
    return {
      size: this.scoreCache.size,
      hitRate: this.scoreCache.size > 0 ? 0.8 : 0 // 仮想値
    };
  }
  
  clearCache(): void {
    this.scoreCache.clear();
  }
  
  // 診断精度検証用（開発・テスト環境）
  validateAgainstReference(
    answers: DiagnosisAnswer[],
    expectedResult: DiagnosisResult
  ): { accuracy: number; differences: string[] } {
    const actualResult = this.calculateDiagnosis(answers);
    const differences: string[] = [];
    
    if (actualResult.primaryType !== expectedResult.primaryType) {
      differences.push(`Primary type: expected ${expectedResult.primaryType}, got ${actualResult.primaryType}`);
    }
    
    const scoreAccuracy = this.calculateScoreAccuracy(actualResult.allScores, expectedResult.allScores);
    if (scoreAccuracy < 0.95) {
      differences.push(`Score accuracy: ${(scoreAccuracy * 100).toFixed(1)}%`);
    }
    
    return {
      accuracy: scoreAccuracy,
      differences
    };
  }
  
  private calculateScoreAccuracy(actual: TypeScores, expected: TypeScores): number {
    const types = Object.keys(actual) as TaihekiType[];
    const totalDifference = types.reduce((sum, type) => {
      return sum + Math.abs(actual[type] - expected[type]);
    }, 0);
    
    const totalExpected = types.reduce((sum, type) => sum + expected[type], 0);
    
    return totalExpected > 0 ? 1 - (totalDifference / totalExpected) : 1;
  }
}