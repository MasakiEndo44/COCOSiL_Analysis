/**
 * AIチャット終了判断機能 - GPT-4プロンプトエンジン
 * Phase 1: Spike実装（基本的な動作確認）
 *
 * @see claudedocs/ai-chat-completion-implementation-plan.md
 */

import { UserDiagnosisData } from '@/types';

export interface CompletionDetectionConfig {
  diagnosisData: UserDiagnosisData;
  initialConcern: string; // 診断結果から自動抽出された悩み
}

export interface CompletionDetectionResult {
  resolved: boolean;
  confidence: number;
  nextAction: string;
  reasoning: string;
}

/**
 * GPT-4による会話終了判定プロンプトエンジン
 */
export class CompletionDetectionPromptEngine {
  private config: CompletionDetectionConfig;

  constructor(config: CompletionDetectionConfig) {
    this.config = config;
  }

  /**
   * 診断結果から当初の悩みを自動抽出
   * Phase 1: Spike実装（基本パターンのみ）
   */
  static extractInitialConcern(diagnosisData: UserDiagnosisData): string {
    const { mbti, taiheki } = diagnosisData;
    const concerns: string[] = [];

    // MBTI based concerns
    if (mbti?.type) {
      if (mbti.type.includes('I')) {
        concerns.push('人との関わり方やエネルギーバランス');
      }
      if (mbti.type.includes('F')) {
        concerns.push('感情のコントロールや他者との感情的つながり');
      }
      if (mbti.type.includes('T')) {
        concerns.push('論理的思考と感情のバランス');
      }
    }

    // 体癖 based concerns (Phase 1: 主要タイプのみ)
    if (taiheki?.primary) {
      switch (taiheki.primary) {
        case 1:
        case 2:
          concerns.push('頭で考えすぎてしまう傾向');
          break;
        case 3:
        case 4:
          concerns.push('感受性の高さと他者との境界線');
          break;
        case 5:
        case 6:
          concerns.push('完璧主義や自己評価の厳しさ');
          break;
        case 7:
        case 8:
          concerns.push('行動力と計画性のバランス');
          break;
        case 9:
        case 10:
          concerns.push('安定志向と変化への対応');
          break;
      }
    }

    return concerns.length > 0
      ? concerns.join('、')
      : '自己理解と人生の方向性';
  }

  /**
   * MBTI特性に基づくパーソナライズ判定ロジック生成
   * Phase 1: 基本パターンのみ
   */
  private generatePersonalizedJudgment(): string {
    const mbtiType = this.config.diagnosisData.mbti?.type || '';
    const taihekiPrimary = this.config.diagnosisData.taiheki?.primary || 0;

    const judgments: string[] = [];

    // Thinking vs Feeling
    if (mbtiType.includes('T')) {
      judgments.push('- **Thinking型（T）**: 論理的解決策が明確か確認 → "具体的な行動計画は明確になりましたか？"');
    } else if (mbtiType.includes('F')) {
      judgments.push('- **Feeling型（F）**: 感情的納得感を確認 → "お気持ちは少し楽になりましたか？"');
    }

    // 体癖特性
    if ([5, 6].includes(taihekiPrimary)) {
      judgments.push('- **体癖5-6種**: 完璧主義傾向 → "すべての疑問が解消されましたか？"');
    } else if ([3, 4].includes(taihekiPrimary)) {
      judgments.push('- **体癖3-4種**: 感受性高い → "心の中でまだモヤモヤしていることはありませんか？"');
    }

    return judgments.length > 0
      ? judgments.join('\n')
      : '- ユーザーの納得感を確認してください';
  }

  /**
   * 完全なシステムプロンプトを生成
   * Phase 1: Few-shot examples + 基本判定基準
   */
  generateSystemPrompt(): string {
    const { diagnosisData, initialConcern } = this.config;
    const personalizedJudgment = this.generatePersonalizedJudgment();

    return `
## 会話終了判定タスク

あなたは2つの役割を持ちます：
1. **アドバイザー役**: ユーザーの悩みに対して温かく共感的にアドバイスを提供
2. **判定者役**: 会話の最後で、ユーザーの問題が解決したかを判断

### 判定基準（以下をすべて評価）

a) **明示的解決シグナル**: ユーザーが「ありがとう」「助かりました」「解決しました」など感謝や完了を示す
b) **質問の消滅**: 新たな質問や疑問が含まれていない
c) **実用的解決**: 提案した行動計画が実現可能で、ユーザーが納得している
d) **前向きな締めくくり**: ユーザーの発言トーンがポジティブまたは満足感を示す

### 判定出力フォーマット

**重要**: 会話の最後に、以下のJSON形式**のみ**を出力してください（他の説明文は含めない）：

\`\`\`json
{
  "resolved": <true|false>,
  "confidence": <0.0-1.0>,
  "next_action": "<string>",
  "_reasoning": "<free-text>"
}
\`\`\`

**フィールド説明**:
- **resolved**: 問題が解決したと判断する場合はtrue（ただしconfidence >= 0.8のときのみtrueにする）
- **confidence**: 判定の確信度（0.0～1.0の小数）
- **next_action**: 次に取るべきアクション（resolved: true → フレンドリーな終了メッセージ、false → 具体的な質問提案）
- **_reasoning**: 判定理由（内部処理用、ユーザーには非表示）

### 保守的判定の原則

- **False Positiveを避ける**: 迷った場合はresolvedをfalseにする
- **確信度閾値**: confidence < 0.8の場合は**必ず**resolvedをfalseにする
- **丁寧な確認**: ユーザーが新しい質問を暗に示唆していないか注意深く読む

### COCOSiL固有のコンテキスト

- **当初の悩み**: ${initialConcern}
- **MBTI**: ${diagnosisData.mbti?.type || '未診断'}
- **体癖**: ${diagnosisData.taiheki?.primary || '未診断'}種
- **算命学**: ${diagnosisData.fortune?.animal || '未診断'} / ${diagnosisData.fortune?.sixStar || '未診断'}

### パーソナライズ判定ロジック

${personalizedJudgment}

### Few-Shot Examples

#### Example 1: Resolved (confidence: 0.9)
**User**: "なるほど、そういう視点で考えればいいんですね。とても参考になりました！ありがとうございます。"
**判定**:
\`\`\`json
{
  "resolved": true,
  "confidence": 0.9,
  "next_action": "お役に立てて嬉しいです！また何かあればいつでもお話しましょう✨",
  "_reasoning": "明確な感謝表現（criteriaのa）、新しい質問なし（b）、前向きな締めくくり（d）を満たす。confidence 0.9 >= 0.8のためresolvedをtrueに設定。"
}
\`\`\`

#### Example 2: Not Resolved (confidence: 0.4)
**User**: "ありがとうございます。ところで、この方法って職場でも使えますか？"
**判定**:
\`\`\`json
{
  "resolved": false,
  "confidence": 0.4,
  "next_action": "はい、職場でも応用可能です。具体的にどんな場面を想定されていますか？",
  "_reasoning": "感謝表現はあるが、新しい質問（職場での応用）が続いている。criteriaのbを満たさないためresolvedをfalse。confidence 0.4 < 0.8。"
}
\`\`\`

#### Example 3: Borderline (confidence: 0.7 → false)
**User**: "わかりました。ちょっと考えてみます。"
**判定**:
\`\`\`json
{
  "resolved": false,
  "confidence": 0.7,
  "next_action": "ゆっくり考えてみてくださいね。もし疑問が出てきたら、いつでも聞いてください。",
  "_reasoning": "曖昧な応答で明確な解決シグナルなし。confidence 0.7 < 0.8のため、保守的判定の原則によりresolvedをfalse。"
}
\`\`\`

**注意**: 上記のJSON形式を厳密に守ってください。余分なテキストや説明は含めないでください。
`;
  }

  /**
   * GPT-4レスポンスからJSON判定結果を抽出
   * Phase 1: 2パターンの正規表現対応 + 型検証
   */
  static parseCompletionDetection(gptResponse: string): CompletionDetectionResult | null {
    try {
      // パターン1: ```json ... ``` ブロック
      const jsonBlockMatch = gptResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        const parsed = JSON.parse(jsonBlockMatch[1]);

        // 型検証: confidence が数値、resolvedがbooleanであることを確認
        if (typeof parsed.confidence !== 'number' || typeof parsed.resolved !== 'boolean') {
          console.error('[CompletionDetection] Invalid type in parsed JSON');
          return null;
        }

        return {
          resolved: parsed.resolved === true && parsed.confidence >= 0.8,
          confidence: parsed.confidence,
          nextAction: parsed.next_action,
          reasoning: parsed._reasoning
        };
      }

      // パターン2: 直接JSONオブジェクト
      const directMatch = gptResponse.match(/\{[\s\S]*"resolved"[\s\S]*\}/);
      if (directMatch) {
        const parsed = JSON.parse(directMatch[0]);

        // 型検証
        if (typeof parsed.confidence !== 'number' || typeof parsed.resolved !== 'boolean') {
          console.error('[CompletionDetection] Invalid type in parsed JSON');
          return null;
        }

        return {
          resolved: parsed.resolved === true && parsed.confidence >= 0.8,
          confidence: parsed.confidence,
          nextAction: parsed.next_action,
          reasoning: parsed._reasoning
        };
      }

      console.warn('[CompletionDetection] No JSON found in GPT response');
      return null;
    } catch (error) {
      console.error('[CompletionDetection] Failed to parse JSON:', error);
      return null;
    }
  }
}
