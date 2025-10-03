# COCOSiL 心理的安全性向上実装仕様書

## 📋 実装概要

### 目標
オープンクエスチョン過多で回答困難なAIチャットを、カール・ロジャーズの3条件に基づく心理的安全性の高いシステムに改修する。

### 成果物
1. **新しいプロンプトエンジン**: Rogers3条件実装
2. **選択式質問システム**: ハイブリッド型質問生成
3. **心理的安全性UI**: 温かみのあるデザイン
4. **安全性評価システム**: リアルタイム心理状態モニタリング

---

## 🏗️ システムアーキテクチャ

### A. 既存システム改修ポイント

```typescript
// 1. プロンプトエンジン拡張
interface PsychologicalSafetyPromptEngine extends IntegratedPromptEngine {
  // Rogers3条件実装
  generateRogersCompliantPrompt(
    userData: DiagnosisData,
    context: ConversationContext,
    safetyScore: number
  ): RogersPromptResult;

  // 質問タイプ決定
  determineQuestionType(
    stage: ConversationStage,
    safetyScore: number,
    history: ChatMessage[]
  ): QuestionType;

  // 心理的安全性スコア計算
  calculatePsychologicalSafetyScore(
    messages: ChatMessage[],
    sentimentAnalysis: SentimentResult
  ): number;
}

// 2. 新しいデータ型定義
interface ConversationContext {
  stage: 'warmup' | 'exploration' | 'deep_dive' | 'closing';
  questionCount: number;
  safetyScore: number;
  lastQuestionType: 'choice' | 'open' | 'hybrid';
  userEngagement: EngagementMetrics;
}

interface QuestionGenerationRequest {
  type: 'choice' | 'open' | 'hybrid';
  empathyPrefix: string;
  mainQuestion: string;
  choices?: ChoiceOption[];
  safetyMessage: string;
  followUpPattern: string;
}
```

### B. 新規コンポーネント設計

```typescript
// 3. 選択式質問コンポーネント
interface ChoiceQuestionComponent {
  // プロパティ
  question: QuestionGenerationRequest;
  onSelect: (choice: ChoiceOption) => void;
  onFollowUp: (text: string) => void;

  // 状態管理
  selectedChoice: ChoiceOption | null;
  showFollowUp: boolean;
  safetyIndicator: boolean;
}

// 4. 心理的安全性インジケーター
interface SafetyIndicatorComponent {
  safetyScore: number;
  stage: ConversationStage;
  privacyMode: boolean;
  understandingConfirmation: string;
}

// 5. 共感的応答コンポーネント
interface EmpathicResponseComponent {
  userMessage: string;
  empathicSummary: string;
  confirmationRequest: string;
  onCorrection: (feedback: string) => void;
}
```

---

## 🔧 実装手順

### Phase 1: バックエンド改修 (2週間)

#### 1.1 プロンプトエンジン拡張
```bash
# ファイル作成・修正
src/lib/ai/psychological-safety-prompt-engine.ts  # 新規作成
src/lib/ai/prompt-engine.ts                      # 既存改修
src/types/psychological-safety.ts               # 新規作成
```

**実装内容:**
```typescript
// src/lib/ai/psychological-safety-prompt-engine.ts
export class PsychologicalSafetyPromptEngine extends IntegratedPromptEngine {

  generateRogersCompliantPrompt(
    userData: DiagnosisData,
    context: ConversationContext,
    safetyScore: number
  ): RogersPromptResult {

    // Rogers 3条件テンプレート
    const rogersTemplate = `
あなたは統合診断に基づく心理的安全性を重視するAIカウンセラーです。

## カール・ロジャーズ3条件の遵守
1. 自己一致: AIとして誠実に、理解したい気持ちを表現
2. 無条件の肯定的尊重: いかなる気持ちも判断せず受容
3. 共感的理解: 感情を要約・確認し、誤解時は即座に訂正

## 現在の状況
- 段階: ${context.stage}
- 安全性スコア: ${safetyScore}
- 推奨質問タイプ: ${this.determineQuestionType(context.stage, safetyScore)}

## 必須応答パターン
1. 共感的前置き: "〜と感じていらっしゃるのですね"
2. 理解確認: "私の理解は正しいでしょうか？"
3. 質問生成: ${this.getQuestionInstructions(context)}
4. 安心メッセージ: "お話しくださりありがとうございます"

## 診断データ統合
${this.integrateDiagnosisData(userData)}
`;

    return {
      systemPrompt: rogersTemplate,
      questionType: this.determineQuestionType(context.stage, safetyScore),
      expectedResponseFormat: this.getResponseFormat(context),
      safetyGuidelines: this.getSafetyGuidelines(safetyScore)
    };
  }

  private determineQuestionType(
    stage: ConversationStage,
    safetyScore: number
  ): QuestionType {
    // 安全性スコアが低い場合は選択式優先
    if (safetyScore < 0.4) return 'choice';

    // 段階別比率
    const ratios = {
      warmup: { choice: 0.8, open: 0.2 },
      exploration: { choice: 0.6, open: 0.4 },
      deep_dive: { choice: 0.4, open: 0.6 },
      closing: { choice: 0.7, open: 0.3 }
    };

    return Math.random() < ratios[stage].choice ? 'choice' : 'open';
  }

  calculatePsychologicalSafetyScore(
    messages: ChatMessage[],
    sentimentAnalysis: SentimentResult
  ): number {
    const weights = {
      positiveLanguage: 0.3,
      emotionalExpression: 0.25,
      continuationWillingness: 0.25,
      anxietyLevel: -0.2
    };

    // スコア計算ロジック実装
    const positiveScore = this.analyzePositiveLanguage(messages);
    const emotionScore = sentimentAnalysis.emotionalOpenness;
    const continuationScore = this.analyzeContinuationWillingness(messages);
    const anxietyScore = sentimentAnalysis.anxietyLevel;

    return Math.max(0, Math.min(1,
      weights.positiveLanguage * positiveScore +
      weights.emotionalExpression * emotionScore +
      weights.continuationWillingness * continuationScore +
      weights.anxietyLevel * anxietyScore
    ));
  }
}
```

#### 1.2 API エンドポイント改修
```typescript
// src/app/api/ai/chat/route.ts 改修
export async function POST(request: NextRequest) {
  try {
    const { messages, diagnosisData, topic, priority } = await request.json();

    // 新しいプロンプトエンジン使用
    const psyEngine = new PsychologicalSafetyPromptEngine();

    // 会話コンテキスト分析
    const context = psyEngine.analyzeConversationContext(messages);
    const safetyScore = psyEngine.calculatePsychologicalSafetyScore(
      messages,
      await analyzeSentiment(messages)
    );

    // Rogers準拠プロンプト生成
    const promptResult = psyEngine.generateRogersCompliantPrompt(
      diagnosisData,
      context,
      safetyScore
    );

    // 既存のストリーミング処理に統合
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: promptResult.systemPrompt },
        ...windowedMessages
      ],
      stream: true,
      temperature: psyEngine.calculateOptimalTemperature(context),
      max_tokens: psyEngine.calculateOptimalTokens(context.stage, safetyScore)
    });

    // 応答ストリーミング（既存処理を維持）
    return new Response(readable, { headers: { /* ... */ } });

  } catch (error) {
    // エラーハンドリング
  }
}
```

### Phase 2: フロントエンド改修 (3週間)

#### 2.1 選択式質問コンポーネント作成
```bash
# 新規コンポーネント作成
src/ui/components/chat/choice-question.tsx
src/ui/components/chat/choice-option-card.tsx
src/ui/components/chat/empathic-response.tsx
src/ui/components/chat/safety-indicator.tsx
```

**選択式質問コンポーネント:**
```tsx
// src/ui/components/chat/choice-question.tsx
interface ChoiceQuestionProps {
  question: QuestionGenerationRequest;
  onSelect: (choice: ChoiceOption) => void;
  onFollowUp?: (text: string) => void;
  className?: string;
}

export const ChoiceQuestion = ({
  question,
  onSelect,
  onFollowUp,
  className
}: ChoiceQuestionProps) => {
  const [selectedChoice, setSelectedChoice] = useState<ChoiceOption | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const handleSelect = (choice: ChoiceOption) => {
    setSelectedChoice(choice);
    onSelect(choice);

    // フォローアップ質問があれば表示
    if (choice.followUpQuestions && choice.followUpQuestions.length > 0) {
      setShowFollowUp(true);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 共感的前置き */}
      {question.empathyPrefix && (
        <div className="flex items-center gap-2 text-empathy text-sm italic">
          <HeartIcon className="w-4 h-4" />
          {question.empathyPrefix}
        </div>
      )}

      {/* メイン質問 */}
      <div className="ai-message-bubble">
        {question.mainQuestion}
      </div>

      {/* 選択肢 */}
      <div className="choice-options-container space-y-3">
        {question.choices?.map((choice, index) => (
          <ChoiceOptionCard
            key={choice.id}
            choice={choice}
            isSelected={selectedChoice?.id === choice.id}
            onSelect={() => handleSelect(choice)}
            index={index + 1}
          />
        ))}
      </div>

      {/* フォローアップ質問 */}
      {showFollowUp && selectedChoice?.followUpQuestions && (
        <div className="follow-up-section">
          <p className="text-sm text-muted-foreground mb-2">
            もしよろしければ、詳しく教えてください：
          </p>
          <textarea
            className="follow-up-textarea"
            placeholder="こちらは任意です。お話ししたい範囲で構いません。"
            onBlur={(e) => onFollowUp?.(e.target.value)}
          />
        </div>
      )}

      {/* 安心メッセージ */}
      {question.safetyMessage && (
        <div className="safety-message">
          <ShieldCheckIcon className="w-4 h-4" />
          {question.safetyMessage}
        </div>
      )}
    </div>
  );
};
```

#### 2.2 チャット画面統合
```tsx
// src/app/diagnosis/chat/page.tsx 改修
export default function ChatPage() {
  // 既存の状態管理に追加
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    stage: 'warmup',
    questionCount: 0,
    safetyScore: 0.8, // 初期値
    lastQuestionType: 'choice',
    userEngagement: { responseRate: 1.0, averageLength: 0 }
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuestionGenerationRequest | null>(null);

  // AI応答処理改修
  const generateAIResponse = async (userMessage: string) => {
    if (!userData) return;

    setIsStreaming(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          diagnosisData: {
            mbti: userData.mbti?.type || '',
            taiheki: { primary: userData.taiheki?.primary || 1 },
            fortune: { animal: userData.fortune?.animal || '' },
            basic: { age: userData.basic?.age || 0, name: userData.basic?.name || '' }
          },
          topic: selectedTopic || 'relationship',
          priority: 'quality',
          stream: true,
          conversationContext // 新規追加
        }),
        signal: abortControllerRef.current.signal
      });

      // ストリーミング処理で質問タイプを判定
      // ...既存のストリーミング処理...

    } catch (error) {
      console.error('AI応答エラー:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  // 選択肢選択ハンドラー
  const handleChoiceSelect = (choice: ChoiceOption) => {
    const choiceMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: `選択: ${choice.label}${choice.description ? ` (${choice.description})` : ''}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, choiceMessage]);

    // 会話コンテキスト更新
    setConversationContext(prev => ({
      ...prev,
      questionCount: prev.questionCount + 1,
      lastQuestionType: 'choice'
    }));

    // AI応答生成
    generateAIResponse(choiceMessage.content);
  };

  return (
    <div className="chat-container">
      {/* 既存のヘッダー・UI要素 */}

      {/* 心理的安全性インジケーター */}
      <SafetyIndicator
        safetyScore={conversationContext.safetyScore}
        stage={conversationContext.stage}
      />

      {/* メッセージ表示エリア */}
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={message.id}>
            {/* 既存のメッセージ表示 */}
            {message.role === 'assistant' && currentQuestion && (
              <ChoiceQuestion
                question={currentQuestion}
                onSelect={handleChoiceSelect}
                onFollowUp={(text) => {
                  if (text.trim()) {
                    generateAIResponse(`追加情報: ${text}`);
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 既存の入力エリア */}
    </div>
  );
}
```

### Phase 3: UI/UX改善 (2週間)

#### 3.1 スタイリング実装
```scss
// src/styles/psychological-safety.scss
@use '../utils/colors';

// カール・ロジャーズ3条件に基づくデザイン
.ai-message-bubble {
  background: linear-gradient(135deg, #A5D6A7 0%, #81C784 100%);
  border-radius: 18px 18px 18px 4px;
  padding: 16px 20px;
  margin: 8px 0;
  max-width: 80%;
  box-shadow: 0 2px 8px rgba(129, 199, 132, 0.15);

  // 温かみのあるテキスト
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #2E2E2E;
}

.choice-option-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    border: 2px solid #A5D6A7;
    box-shadow: 0 4px 12px rgba(165, 214, 167, 0.25);
    transform: translateY(-2px);
  }

  &.selected {
    background: linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%);
    border: 2px solid #81C784;
  }

  .emoji {
    font-size: 20px;
    min-width: 24px;
  }

  .text {
    flex: 1;

    .label {
      font-size: 15px;
      font-weight: 500;
      color: #2E2E2E;
      margin-bottom: 4px;
    }

    .description {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }
  }
}

.empathy-prefix {
  font-size: 14px;
  color: #1976D2;
  font-style: italic;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.safety-message {
  font-size: 13px;
  color: #388E3C;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(165, 214, 167, 0.2);
  border-radius: 8px;
  border-left: 3px solid #81C784;
  display: flex;
  align-items: center;
  gap: 6px;
}

.safety-indicator {
  position: fixed;
  top: 16px;
  right: 16px;
  background: rgba(129, 199, 132, 0.1);
  border: 1px solid #81C784;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  color: #388E3C;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 100;
}
```

### Phase 4: 評価・監視システム (1週間)

#### 4.1 心理的安全性評価システム
```typescript
// src/lib/evaluation/safety-metrics.ts
export class SafetyMetricsCollector {

  // リアルタイム評価
  async evaluateConversationSafety(
    sessionId: string,
    messages: ChatMessage[]
  ): Promise<SafetyEvaluation> {

    const metrics = {
      avgResponseLength: this.calculateAvgResponseLength(messages),
      emotionalOpenness: await this.analyzeEmotionalOpenness(messages),
      continuationRate: this.calculateContinuationRate(messages),
      safetyKeywords: this.countSafetyKeywords(messages),
      negativeIndicators: this.detectNegativeIndicators(messages)
    };

    const overallScore = this.calculateOverallSafetyScore(metrics);

    return {
      sessionId,
      timestamp: new Date(),
      overallScore,
      metrics,
      recommendations: this.generateRecommendations(overallScore, metrics)
    };
  }

  // A/Bテスト準備
  async logConversationOutcome(
    sessionId: string,
    variation: 'original' | 'rogers_enhanced',
    outcome: ConversationOutcome
  ): Promise<void> {
    // データベースに記録
    await this.metricsDB.insert({
      sessionId,
      variation,
      outcome,
      timestamp: new Date()
    });
  }
}
```

---

## 📊 評価指標・成功基準

### A. 定量指標
```typescript
interface SuccessMetrics {
  // ユーザーエンゲージメント
  engagement: {
    avgSessionDuration: 'target: +40% vs baseline',
    avgMessagesPerSession: 'target: +60% vs baseline',
    followUpQuestionRate: 'target: >30%',
    sessionCompletionRate: 'target: >85%'
  },

  // 心理的安全性
  psychologicalSafety: {
    avgSafetyScore: 'target: >0.7',
    safetyRecoveryRate: 'target: >90% when score drops',
    userCorrectionRate: 'target: <10%',
    negativeFeedbackRate: 'target: <5%'
  },

  // 質問品質
  questionQuality: {
    choiceQuestionUsageRate: 'target: 60% during warmup',
    questionResponseRate: 'target: >95%',
    clarificationRequestRate: 'target: <15%'
  }
}
```

### B. 定性評価
```typescript
interface QualitativeEvaluation {
  // ユーザーフィードバック
  userFeedback: {
    postSessionSurvey: 'psychological safety scale 1-7',
    openFeedback: 'qualitative comments analysis',
    npsScore: 'net promoter score tracking'
  },

  // 専門家評価
  expertReview: {
    clinicalPsychologist: 'Rogers conditions compliance review',
    uiUxExpert: 'design safety evaluation',
    conversationSamples: 'blind evaluation of 100 conversations'
  }
}
```

---

## 🚀 デプロイメント戦略

### A. 段階的リリース
```yaml
Phase 1 - Alpha Test:
  target: Internal team (5 people)
  duration: 1 week
  focus: Basic functionality + safety

Phase 2 - Beta Test:
  target: Friendly users (20 people)
  duration: 2 weeks
  focus: User experience + edge cases

Phase 3 - A/B Test:
  target: 10% of users
  duration: 4 weeks
  focus: Original vs Rogers-enhanced comparison

Phase 4 - Full Rollout:
  target: All users
  duration: 2 weeks gradual rollout
  focus: Performance monitoring
```

### B. 監視・アラート
```typescript
interface MonitoringSetup {
  // リアルタイム監視
  realTimeAlerts: {
    safetyScoreDrop: 'alert if avg safety score < 0.5',
    errorRateSpike: 'alert if error rate > 5%',
    responseLatency: 'alert if p95 > 3 seconds'
  },

  // 日次レポート
  dailyMetrics: {
    safetyScoreDistribution: 'histogram of safety scores',
    questionTypeUsage: 'choice vs open question ratios',
    userSatisfactionTrends: 'trending satisfaction metrics'
  },

  // 週次分析
  weeklyAnalysis: {
    conversationQualityReview: 'sample conversation analysis',
    performanceComparison: 'before/after performance comparison',
    userBehaviorPatterns: 'usage pattern analysis'
  }
}
```

---

## 📝 まとめ

### 実装により期待される効果

1. **心理的安全性の向上**: Rogers 3条件実装により、ユーザーが安心して本音を話せる環境を構築
2. **回答負荷の軽減**: 選択式質問の導入により、表現が苦手なユーザーも参加しやすいシステム
3. **深い洞察の獲得**: 段階的な質問戦略により、表面的でない深い相談が可能
4. **継続的改善**: 評価システムによる定量・定性的な改善サイクル確立

### 技術的革新

- **AI倫理の実装**: Carl Rogers の人間中心療法をAIシステムに実装
- **適応的質問生成**: ユーザーの心理状態に応じた動的な質問タイプ選択
- **心理的安全性の定量化**: 感情分析とユーザー行動から安全性スコアを算出

この実装により、COCOSiLのAIチャットシステムは業界をリードする心理的安全性の高いカウンセリングシステムとなることが期待されます。