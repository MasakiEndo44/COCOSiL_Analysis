# COCOSiL AIチャット心理的安全性向上 実装ワークフロー

## 🎯 プロジェクト概要

### 目標
オープンクエスチョン過多で回答困難なAIチャットを、カール・ロジャーズの3条件（自己一致・無条件の肯定的尊重・共感的理解）に基づく心理的安全性の高いシステムに改修する。

### 期間・リソース
- **総期間**: 8週間（4フェーズ）
- **推定工数**: 120人日
- **チーム構成**: フルスタック開発者3名、UIデザイナー1名、心理学コンサルタント1名

---

## 📋 Phase 1: バックエンド改修（2週間・40人日）

### 1.1 プロンプトエンジン拡張 (1週間・20人日)

#### タスク1: 基盤クラス設計・実装
**責任者**: Backend Lead
**期間**: 3日
**成果物**: PsychologicalSafetyPromptEngine基盤

```typescript
// 実装ファイル
src/lib/ai/psychological-safety-prompt-engine.ts
src/types/psychological-safety.ts
src/types/conversation-context.ts

// 実装内容
interface PsychologicalSafetyPromptEngine extends IntegratedPromptEngine {
  generateRogersCompliantPrompt(): RogersPromptResult;
  determineQuestionType(): QuestionType;
  calculatePsychologicalSafetyScore(): number;
}
```

**依存関係**: 既存IntegratedPromptEngine
**リスク**: 既存システムとの互換性
**検証**: ユニットテスト（カバレッジ85%以上）

#### タスク2: Rogers 3条件実装
**責任者**: Backend Developer 1
**期間**: 2日
**成果物**: 3条件準拠プロンプト生成ロジック

```typescript
// 実装内容
class RogersConditionsImplementor {
  // 自己一致: AIとしての誠実な姿勢
  generateSelfCongruencePrompt(): string;

  // 無条件の肯定的尊重: 判断しない受容
  generateUnconditionalRegardPrompt(): string;

  // 共感的理解: 感情要約と確認
  generateEmpathicUnderstandingPrompt(): string;
}
```

**依存関係**: タスク1完了
**検証**: 心理学コンサルタントレビュー

#### タスク3: 質問タイプ決定ロジック
**責任者**: Backend Developer 2
**期間**: 2日
**成果物**: 段階的質問戦略システム

```typescript
// 実装内容
interface QuestionStrategy {
  warmup: { choice: 80%, open: 20% };
  exploration: { choice: 60%, open: 40% };
  deepDive: { choice: 40%, open: 60% };
  closing: { choice: 70%, open: 30% };
}
```

**依存関係**: タスク1完了
**検証**: A/Bテスト準備

### 1.2 心理的安全性スコア算出 (3日・12人日)

#### タスク4: 感情分析統合
**責任者**: Backend Developer 3
**期間**: 2日
**成果物**: リアルタイム感情分析システム

```typescript
// 実装内容
class SafetyScoreCalculator {
  calculateScore(
    messages: ChatMessage[],
    sentiment: SentimentResult
  ): number {
    // PSS = w1*肯定語率 + w2*感情表現 + w3*継続意欲 - w4*不安要素
  }
}
```

**依存関係**: 外部感情分析API
**リスク**: API制限・レイテンシ
**検証**: パフォーマンステスト

#### タスク5: 会話コンテキスト管理
**責任者**: Backend Developer 1
**期間**: 1日
**成果物**: ConversationContext状態管理

```typescript
// 実装内容
interface ConversationContext {
  stage: ConversationStage;
  questionCount: number;
  safetyScore: number;
  userEngagement: EngagementMetrics;
}
```

### 1.3 API統合 (4日・8人日)

#### タスク6: /api/ai/chat 改修
**責任者**: Backend Lead
**期間**: 2日
**成果物**: 新プロンプトエンジン統合API

```typescript
// 改修内容
export async function POST(request: NextRequest) {
  const psyEngine = new PsychologicalSafetyPromptEngine();
  const context = psyEngine.analyzeConversationContext(messages);
  const safetyScore = await psyEngine.calculatePsychologicalSafetyScore(messages);
  const promptResult = psyEngine.generateRogersCompliantPrompt(data, context, safetyScore);
  // 既存ストリーミング処理統合
}
```

**依存関係**: タスク1-5完了
**検証**: 統合テスト

#### タスク7: 新規APIエンドポイント
**責任者**: Backend Developer 2
**期間**: 2日
**成果物**: 心理的安全性評価API

```typescript
// 新規エンドポイント
/api/ai/safety-evaluation  // 安全性スコア取得
/api/ai/question-generation // 選択式質問生成
/api/ai/empathy-response   // 共感的応答生成
```

---

## 🎨 Phase 2: フロントエンド改修（3週間・48人日）

### 2.1 選択式質問コンポーネント (1週間・16人日)

#### タスク8: ChoiceQuestion基盤コンポーネント
**責任者**: Frontend Lead
**期間**: 3日
**成果物**: 選択式質問表示コンポーネント

```tsx
// 実装ファイル
src/ui/components/chat/choice-question.tsx
src/ui/components/chat/choice-option-card.tsx

// コンポーネント仕様
interface ChoiceQuestionProps {
  question: QuestionGenerationRequest;
  onSelect: (choice: ChoiceOption) => void;
  onFollowUp?: (text: string) => void;
}
```

**依存関係**: 設計書のUI仕様
**検証**: Storybookコンポーネントテスト

#### タスク9: 共感的応答コンポーネント
**責任者**: Frontend Developer 1
**期間**: 2日
**成果物**: EmpathicResponse表示システム

```tsx
// 実装内容
interface EmpathicResponseProps {
  userMessage: string;
  empathicSummary: string;
  confirmationRequest: string;
  onCorrection: (feedback: string) => void;
}
```

#### タスク10: 心理的安全性インジケーター
**責任者**: Frontend Developer 2
**期間**: 2日
**成果物**: SafetyIndicator表示コンポーネント

```tsx
// 実装内容
interface SafetyIndicatorProps {
  safetyScore: number;
  stage: ConversationStage;
  privacyMode: boolean;
}
```

### 2.2 チャット画面統合 (1週間・16人日)

#### タスク11: 会話状態管理拡張
**責任者**: Frontend Lead
**期間**: 3日
**成果物**: ConversationContext状態管理

```tsx
// 実装内容
const [conversationContext, setConversationContext] = useState<ConversationContext>({
  stage: 'warmup',
  questionCount: 0,
  safetyScore: 0.8,
  lastQuestionType: 'choice'
});
```

**依存関係**: タスク8-10完了
**検証**: E2Eテスト

#### タスク12: API統合・ストリーミング対応
**責任者**: Frontend Developer 1
**期間**: 2日
**成果物**: 新APIとの統合層

```tsx
// 実装内容
const generateAIResponse = async (userMessage: string) => {
  // 新しいPsychologicalSafetyPromptEngine API呼び出し
  // ストリーミングレスポンス処理
  // 質問タイプ判定と表示切り替え
};
```

#### タスク13: 選択肢選択ハンドリング
**責任者**: Frontend Developer 2
**期間**: 2日
**成果物**: ユーザー選択処理ロジック

```tsx
// 実装内容
const handleChoiceSelect = (choice: ChoiceOption) => {
  // 選択内容をメッセージとして追加
  // 会話コンテキスト更新
  // フォローアップ質問処理
};
```

### 2.3 状態管理・パフォーマンス最適化 (1週間・16人日)

#### タスク14: Zustand状態管理拡張
**責任者**: Frontend Lead
**期間**: 3日
**成果物**: 心理的安全性状態ストア

```typescript
// 実装ファイル
src/lib/zustand/psychological-safety-store.ts

// ストア設計
interface PsychologicalSafetyStore {
  conversationContext: ConversationContext;
  safetyScore: number;
  currentQuestionType: QuestionType;
  updateContext: (context: ConversationContext) => void;
  calculateSafetyTrend: () => SafetyTrend;
}
```

#### タスク15: メモリ最適化
**責任者**: Frontend Developer 1
**期間**: 2日
**成果物**: 会話履歴最適化システム

**依存関係**: 既存conversation-utils
**検証**: メモリ使用量測定

#### タスク16: レスポンシブ対応
**責任者**: Frontend Developer 2
**期間**: 2日
**成果物**: モバイル最適化UI

**検証**: クロスブラウザテスト

---

## 🎨 Phase 3: UI/UX改善（2週間・24人日）

### 3.1 心理的安全性デザイン実装 (1週間・12人日)

#### タスク17: カラーシステム・タイポグラフィ
**責任者**: UI Designer
**期間**: 2日
**成果物**: 心理的安全性重視デザインシステム

```scss
// 実装ファイル
src/styles/psychological-safety.scss
src/styles/rogers-design-tokens.scss

// カラーパレット
$colors: (
  primary: #81C784,        // 穏やかな緑
  empathy: #90CAF9,        // 優しい青
  safety: #A5D6A7,        // 安心感の緑
  neutral-warm: #F5F5F5    // 温かいグレー
);
```

#### タスク18: コンポーネントスタイリング
**責任者**: Frontend Developer 1 + UI Designer
**期間**: 3日
**成果物**: Rogers 3条件準拠コンポーネントデザイン

```scss
// スタイル仕様
.ai-message-bubble {
  background: linear-gradient(135deg, #A5D6A7 0%, #81C784 100%);
  border-radius: 18px 18px 18px 4px;
  // 温かみのあるフォント・間隔
}

.choice-option-card {
  // 非判断的な印象のカードデザイン
  // ホバー・選択状態のマイクロインタラクション
}
```

### 3.2 アクセシビリティ・ユーザビリティ (1週間・12人日)

#### タスク19: アクセシビリティ実装
**責任者**: Frontend Developer 2
**期間**: 3日
**成果物**: WCAG 2.1 AA準拠実装

```tsx
// 実装内容
- スクリーンリーダー対応（aria-label, live regions）
- キーボードナビゲーション
- 高コントラストモード
- フォントサイズ調整機能
```

**検証**: axe-core自動テスト + 手動テスト

#### タスク20: モバイル・タッチ最適化
**責任者**: Frontend Developer 1
**期間**: 2日
**成果物**: タッチインタラクション最適化

```scss
// タッチターゲット仕様
.choice-card {
  min-height: 44px; // iOS/Android推奨サイズ
  touch-action: manipulation;
  // ハプティックフィードバック対応
}
```

#### タスク21: パフォーマンス最適化
**責任者**: Frontend Lead
**期間**: 2日
**成果物**: Core Web Vitals最適化

**検証**: Lighthouse パフォーマンススコア 90以上

---

## 📊 Phase 4: 評価システム（1週間・16人日）

### 4.1 心理的安全性メトリクス (3日・8人日)

#### タスク22: 評価指標実装
**責任者**: Backend Developer 3
**期間**: 2日
**成果物**: SafetyMetricsCollector

```typescript
// 実装ファイル
src/lib/evaluation/safety-metrics.ts

// 評価システム
class SafetyMetricsCollector {
  evaluateConversationSafety(): SafetyEvaluation;
  generateRecommendations(): SafetyRecommendation[];
  logConversationOutcome(): void;
}
```

#### タスク23: ダッシュボード実装
**責任者**: Frontend Developer 2
**期間**: 1日
**成果物**: 管理者向け安全性ダッシュボード

**依存関係**: 既存admin dashboard

### 4.2 A/Bテスト・監視システム (4日・8人日)

#### タスク24: A/Bテスト準備
**責任者**: Backend Developer 1
**期間**: 2日
**成果物**: Original vs Rogers-enhanced 比較システム

```typescript
// 実装内容
interface ABTestVariation {
  original: 'existing prompt engine',
  rogers_enhanced: 'PsychologicalSafetyPromptEngine'
}
```

#### タスク25: 監視・アラートシステム
**責任者**: Backend Developer 2
**期間**: 2日
**成果物**: リアルタイム監視システム

```typescript
// 監視指標
interface MonitoringMetrics {
  avgSafetyScore: number;
  errorRate: number;
  responseLatency: number;
  userSatisfactionTrend: number[];
}
```

---

## 🔍 リスク分析・品質保証戦略

### A. 主要リスク

#### 技術リスク
| リスク | 影響度 | 対策 |
|--------|--------|------|
| OpenAI API制限 | 高 | レート制限監視・フォールバック実装 |
| パフォーマンス劣化 | 中 | 段階的リリース・監視体制 |
| 既存機能影響 | 中 | 後方互換性維持・漸進的移行 |

#### 心理学的リスク
| リスク | 影響度 | 対策 |
|--------|--------|------|
| Rogers理論実装不備 | 高 | 心理学専門家監修・継続レビュー |
| 文化的適応性不足 | 中 | 日本文化コンテキスト考慮 |
| ユーザー受容性 | 中 | 段階的導入・フィードバック収集 |

### B. 品質保証戦略

#### テスト戦略
```yaml
Unit Testing:
  coverage: "> 85%"
  focus: "プロンプトエンジン・スコア計算ロジック"

Integration Testing:
  scope: "API統合・コンポーネント連携"
  automation: "CI/CDパイプライン統合"

E2E Testing:
  tools: "Playwright"
  scenarios: "完全な会話フロー・心理的安全性体験"

Accessibility Testing:
  standards: "WCAG 2.1 AA"
  tools: "axe-core + 手動検証"

Performance Testing:
  metrics: "Core Web Vitals, Response Time"
  targets: "LCP < 2.5s, CLS < 0.1"
```

#### コードレビュー戦略
- **2段階レビュー**: 技術レビュー + 心理学的妥当性レビュー
- **ペアプログラミング**: 複雑なロジック実装時
- **専門家レビュー**: Rogers理論実装の妥当性確認

---

## 📅 総合実装ロードマップ

### スプリント構成

#### Sprint 1-2: Phase 1 Backend (2週間)
```yaml
Week 1:
  - プロンプトエンジン基盤設計
  - Rogers 3条件実装
  - 質問タイプ決定ロジック

Week 2:
  - 心理的安全性スコア算出
  - API統合・テスト
  - 基盤システム検証
```

#### Sprint 3-5: Phase 2 Frontend (3週間)
```yaml
Week 3:
  - 選択式質問コンポーネント
  - 共感的応答システム
  - 基本UI実装

Week 4:
  - チャット画面統合
  - 状態管理拡張
  - API統合

Week 5:
  - パフォーマンス最適化
  - バグフィックス
  - 統合テスト
```

#### Sprint 6-7: Phase 3 UI/UX (2週間)
```yaml
Week 6:
  - デザインシステム実装
  - 心理的安全性UI
  - アクセシビリティ対応

Week 7:
  - モバイル最適化
  - ユーザビリティ改善
  - デザインQA
```

#### Sprint 8: Phase 4 Evaluation (1週間)
```yaml
Week 8:
  - 評価システム実装
  - A/Bテスト準備
  - 監視システム構築
  - リリース準備
```

### デプロイメント戦略

#### 段階的リリース
```yaml
Alpha (Week 6):
  target: "開発チーム内部テスト"
  scope: "基本機能動作確認"

Beta (Week 7):
  target: "フレンドリーユーザー 20名"
  scope: "ユーザビリティ・心理的安全性検証"

A/B Test (Week 8-11):
  target: "全ユーザーの10%"
  duration: "4週間"
  metrics: "安全性スコア・満足度比較"

Full Rollout (Week 12-13):
  target: "全ユーザー"
  method: "段階的ロールアウト（10%→50%→100%）"
```

### 成功指標

#### 定量指標
- **セッション継続率**: +40% vs baseline
- **平均メッセージ数**: +60% vs baseline
- **心理的安全性スコア**: >0.7平均
- **ユーザー満足度**: NPS +20ポイント改善

#### 定性指標
- **心理学専門家評価**: Rogers理論準拠性95%以上
- **ユーザーフィードバック**: 「安心して話せる」評価80%以上
- **アクセシビリティ**: WCAG 2.1 AA完全準拠

---

## 🎯 まとめ

この実装ワークフローにより、COCOSiLのAIチャットシステムは：

1. **心理的安全性**: Rogers 3条件に基づく業界初のAI実装
2. **ユーザビリティ**: 選択式質問による回答負荷軽減
3. **技術革新**: 心理状態の定量化とリアルタイム適応
4. **品質保証**: 多層的テスト戦略による高品質確保

**8週間のスプリント実行により、心理的安全性の高い次世代AIカウンセリングシステムが完成します。**