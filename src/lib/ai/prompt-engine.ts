/**
 * Integrated Prompt Engine for COCOSiL AI Chat
 * Phase 1: 基盤改善 - Dynamic token management and unified prompt generation
 */

interface DiagnosisData {
  mbti: string;
  taiheki: { primary: number; secondary: number };
  fortune: { animal: string; sixStar: string };
  basic: { age: number; name: string };
}

interface PromptContext {
  topic: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  complexity: number; // 1-3 scale for conversation complexity
  priority: 'speed' | 'quality';
}

/**
 * IntegratedPromptEngine - Core class for unified prompt generation
 * Implements 4-diagnosis integration with strict quality guidelines
 */
export class IntegratedPromptEngine {
  /**
   * Generate system prompt integrating all 4 diagnosis types
   * Enforces 相槌禁止 and 本質分析特化 requirements
   */
  generateSystemPrompt(userData: DiagnosisData, topic: string): string {
    return `あなたは統合診断に基づく専門カウンセラーです。

## 基本姿勢（傾聴と共感）
- **共感のワンクッション**: ユーザーの発言に対し、まずは「それは大変でしたね」「お辛い気持ち、よく分かります」といった共感の言葉から始めてください。
- **受容的態度**: ユーザーの感情を否定せず、ありのまま受け止めてください。
- **温かいトーン**: 専門的でありながらも、冷たくならず、温かみのある口調を心がけてください。

## 禁止事項
- 複数の質問を一度に投げかけない（ユーザーが答えやすいよう、質問は1つに絞る）
- 説教がましい態度や、一方的な断定

## 実行指示
1. まずはユーザーの感情に寄り添う言葉をかける
2. ${userData.mbti}型の思考パターンと意思決定スタイルを深く考慮
3. 体癖${userData.taiheki.primary}種の身体的傾向と心理的特性を分析
4. ${userData.fortune.animal}の性格特性と行動パターンを統合
5. ${userData.fortune.sixStar}の運命傾向と人生の課題を加味
6. ${topic}における根本原因を3層掘り下げて質問

## 応答形式（必須）
- 共感メッセージ（冒頭）
- 最重要質問1つのみ
- 具体的状況の深掘り
- 必要な長さで詳細に説明（文字数制限なし）
- Markdown記法（箇条書き、太字など）を適切に使用して可読性を高める

## 分析アプローチ
- ${this.getMBTIAnalysisPrompt(userData.mbti)}
- ${this.getTaihekiAnalysisPrompt(userData.taiheki.primary)}
- ${this.getFortuneAnalysisPrompt(userData.fortune)}

## 質問の深度設定
真因分析のため、以下の順序で深掘りを実施（ただし、まずは共感を優先）：
1. 表面的な症状の確認
2. 背景にある構造的な問題の特定
3. 根本的な価値観や思考パターンの探索`;
  }

  /**
   * Calculate optimal token count based on context and complexity
   * Updated to allow full-length responses without artificial limits
   */
  calculateOptimalTokens(context: string, complexity: number, priority: 'speed' | 'quality' = 'quality'): number {
    const baseTokens = priority === 'speed' ? 1000 : 2000;
    const contextLength = context.length;

    // Context multiplier: longer conversations need more tokens
    const contextMultiplier = Math.min(contextLength / 1000, 4.0);

    // Complexity bonus: complex topics need deeper responses
    const complexityBonus = complexity * 300;

    // Calculate with much higher ceiling to allow full responses
    const calculatedTokens = baseTokens + (contextMultiplier * 200) + complexityBonus;

    // Allow up to 4000 tokens for complete responses
    return Math.round(Math.min(Math.max(calculatedTokens, 1000), 4000));
  }

  /**
   * Assess conversation complexity based on topic and history
   */
  assessComplexity(topic: string, conversationHistory: Array<{ content: string }>): number {
    const complexTopics = ['人間関係', 'キャリア', '将来'];
    const isComplexTopic = complexTopics.includes(topic) ? 1 : 0;

    const conversationLength = conversationHistory.length;
    const lengthComplexity = Math.min(conversationLength / 4, 2);

    const deepKeywords = ['なぜ', '根本的', '本質的', '価値観', '信念'];
    const deepnessScore = conversationHistory.reduce((score, msg) => {
      const matches = deepKeywords.filter(keyword => msg.content.includes(keyword)).length;
      return score + matches;
    }, 0);
    const deepnessComplexity = Math.min(deepnessScore / 3, 1);

    return Math.min(isComplexTopic + lengthComplexity + deepnessComplexity, 3);
  }

  /**
   * Generate MBTI-specific analysis prompt
   */
  private getMBTIAnalysisPrompt(mbtiType: string): string {
    const mbtiPrompts: Record<string, string> = {
      'INTJ': '戦略的思考と長期計画に焦点を当て、システム改善の視点から質問',
      'ENFP': '可能性と人間関係の価値を重視し、創造的解決策を探る質問',
      'ISTJ': '具体的事実と実践的解決策に基づく、段階的アプローチの質問',
      'ESFJ': '人間関係の調和と他者への配慮を考慮した、共感的な質問',
      // 他のMBTIタイプも同様に定義
    };

    return mbtiPrompts[mbtiType] || '思考パターンと価値観に基づいた個別化された質問';
  }

  /**
   * Generate Taiheki-specific analysis prompt
   */
  private getTaihekiAnalysisPrompt(primaryType: number): string {
    const taihekiPrompts: Record<number, string> = {
      1: '上下型：上昇志向と権威への関心を考慮し、目標達成に関する質問',
      2: '左右型：バランス感覚と調和を重視し、対人関係の均衡に関する質問',
      3: '前後型：積極性と慎重さのバランスを考慮し、行動パターンに関する質問',
      4: '捻れ型：独創性と変化への対応を重視し、適応戦略に関する質問',
      5: '開閉型：開放性と内省のバランスを考慮し、コミュニケーションに関する質問',
      // 他の体癖タイプも同様に定義
    };

    return taihekiPrompts[primaryType] || '身体的特性と心理傾向に基づいた質問';
  }

  /**
   * Generate Fortune-specific analysis prompt
   */
  private getFortuneAnalysisPrompt(fortune: { animal: string; sixStar: string }): string {
    return `${fortune.animal}の特性（${this.getAnimalCharacteristics(fortune.animal)}）と${fortune.sixStar}の運命傾向を統合した質問`;
  }

  /**
   * Get animal-specific characteristics for prompt generation
   */
  private getAnimalCharacteristics(animal: string): string {
    const characteristics: Record<string, string> = {
      '子（ネズミ）': '機敏性と適応力',
      '丑（ウシ）': '忍耐力と着実性',
      '寅（トラ）': '勇気と行動力',
      '卯（ウサギ）': '優雅さと協調性',
      '辰（龍）': 'リーダーシップと理想主義',
      '巳（ヘビ）': '洞察力と慎重性',
      '午（ウマ）': '自由奔放さと情熱',
      '未（ヒツジ）': '温和さと芸術性',
      '申（サル）': '知恵と創造性',
      '酉（トリ）': '几帳面さと正義感',
      '戌（イヌ）': '忠実さと責任感',
      '亥（イノシシ）': '直進性と情熱'
    };

    return characteristics[animal] || '個性的特性';
  }

  /**
   * Generate context-aware prompt with conversation history
   */
  generateContextualPrompt(
    userData: DiagnosisData,
    context: PromptContext
  ): { systemPrompt: string; maxTokens: number; temperature: number } {
    const systemPrompt = this.generateSystemPrompt(userData, context.topic);
    const complexity = this.assessComplexity(context.topic, context.conversationHistory);
    const maxTokens = this.calculateOptimalTokens(
      context.conversationHistory.map(msg => msg.content).join(' '),
      complexity,
      context.priority
    );

    // Temperature調整: 複雑な話題ほど創造性を要求
    const temperature = Math.min(0.3 + (complexity * 0.2), 0.7);

    return {
      systemPrompt,
      maxTokens,
      temperature
    };
  }
}

/**
 * Factory function for creating IntegratedPromptEngine instances
 */
export function createPromptEngine(): IntegratedPromptEngine {
  return new IntegratedPromptEngine();
}

/**
 * Utility function for validating diagnosis data completeness
 */
export function validateDiagnosisData(data: Partial<DiagnosisData>): data is DiagnosisData {
  // More robust validation that handles edge cases like age=0
  const isValid = !!(
    data.mbti &&
    data.taiheki?.primary &&
    data.fortune?.animal &&
    data.fortune?.sixStar &&
    typeof data.basic?.age === 'number' && data.basic.age >= 0 && // Allow age 0, check for valid number
    data.basic?.name && data.basic.name.trim().length > 0 // Ensure name is not empty string
  );

  if (!isValid) {
    console.log('診断データ検証失敗:', {
      mbti: !!data.mbti,
      taiheki: !!data.taiheki?.primary,
      fortune: !!(data.fortune?.animal && data.fortune?.sixStar),
      age: typeof data.basic?.age === 'number' ? data.basic.age : 'invalid',
      name: data.basic?.name ? 'provided' : 'missing'
    });
  }

  return isValid;
}