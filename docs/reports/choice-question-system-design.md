# 選択式質問システム設計仕様

## 1. システム概要

### 目的
- オープンクエスチョンの回答負荷を軽減
- 段階的に心理的安全性を構築
- ユーザーの表現能力に関係なく気持ちを伝えられる仕組み

### 基本構造
```typescript
interface ChoiceQuestion {
  id: string;
  type: 'single' | 'multiple' | 'scale' | 'emotion_scale';
  question: string;
  empathyPrefix: string; // 共感的な前置き
  options: ChoiceOption[];
  followUp?: string; // 選択後の追加確認
  safetyMessage: string; // 安心感を与えるメッセージ
}

interface ChoiceOption {
  id: string;
  label: string;
  description?: string; // 20文字以内の説明
  emoji?: string;
  followUpQuestions?: string[]; // この選択肢選択後の追加質問候補
}
```

## 2. 質問タイプ別設計

### A. 基本選択式 (single)
```yaml
purpose: 基本的な状況・感情の把握
example:
  question: "今のお気持ちを教えていただけますか？"
  empathy_prefix: "お忙しい中、お話しくださりありがとうございます。"
  options:
    - label: "とても困っている"
      emoji: "😰"
      description: "深刻に悩んでいる状態"
    - label: "少し悩んでいる"
      emoji: "😔"
      description: "気になることがある程度"
    - label: "迷っている"
      emoji: "🤔"
      description: "どうしたらいいか分からない"
    - label: "その他"
      emoji: "💭"
      description: "上記にあてはまらない"
  safety_message: "どの選択肢も、あなたの大切なお気持ちです。"
```

### B. 複数選択式 (multiple)
```yaml
purpose: 複合的な感情・状況の把握
example:
  question: "どのような場面で特に感じることが多いですか？（複数選択可）"
  empathy_prefix: "様々な場面があると思います。"
  options:
    - label: "人といるとき"
      description: "対人場面で感じる"
    - label: "一人のとき"
      description: "ひとりの時間で感じる"
    - label: "仕事・学校で"
      description: "活動中に感じる"
    - label: "家にいるとき"
      description: "リラックス時に感じる"
  safety_message: "いくつ選んでいただいても大丈夫です。"
```

### C. スケール式 (scale)
```yaml
purpose: 程度・強度の測定
example:
  question: "その気持ちの強さを5段階で表すとどのくらいでしょうか？"
  empathy_prefix: "お気持ちの強さには個人差があります。"
  scale_type: "1-5"
  labels:
    1: "ほとんど感じない"
    2: "少し感じる"
    3: "まあまあ感じる"
    4: "かなり感じる"
    5: "とても強く感じる"
  safety_message: "感じ方に正解・不正解はありません。"
```

### D. 感情スケール (emotion_scale)
```yaml
purpose: 具体的感情の強度測定
example:
  question: "今のお気持ちに最も近いものはどれですか？"
  empathy_prefix: "感情は複雑なものです。近いもので大丈夫です。"
  emotions:
    - name: "不安"
      emoji: "😰"
      scale: 1-5
    - name: "悲しみ"
      emoji: "😢"
      scale: 1-5
    - name: "怒り"
      emoji: "😠"
      scale: 1-5
    - name: "混乱"
      emoji: "😵‍💫"
      scale: 1-5
  safety_message: "どの感情も自然なことです。"
```

## 3. 診断結果連動システム

### A. MBTI連動選択肢
```typescript
interface MBTIAdaptedChoices {
  INTJ: {
    thinking_options: [
      "論理的に分析したい",
      "長期的な影響を考えたい",
      "根本原因を知りたい"
    ]
  },
  ENFP: {
    feeling_options: [
      "みんなと話し合いたい",
      "新しい可能性を探したい",
      "直感的に感じることを大切にしたい"
    ]
  }
  // 他のMBTIタイプも同様に定義
}
```

### B. 体癖連動選択肢
```typescript
interface TaihekiAdaptedChoices {
  type_1: { // 上下型
    situation_options: [
      "目標に向かって進みたい",
      "上の立場から判断したい",
      "責任を持って決めたい"
    ]
  },
  type_2: { // 左右型
    balance_options: [
      "バランスを取りたい",
      "みんなの意見を聞きたい",
      "調和を大切にしたい"
    ]
  }
  // 他の体癖タイプも同様に定義
}
```

## 4. 質問進行アルゴリズム

### A. 段階管理
```typescript
enum ConversationStage {
  WARMUP = 'warmup',           // 0-2質問: 選択式80%
  EXPLORATION = 'exploration', // 3-7質問: 選択式60%
  DEEP_DIVE = 'deep_dive',    // 8+質問: 選択式40%
  CLOSING = 'closing'          // 終了段階: 選択式70%
}

interface StageConfig {
  choiceRatio: number;
  maxQuestions: number;
  requiredSafetyScore: number;
  transitionConditions: string[];
}
```

### B. 質問選択ロジック
```typescript
class QuestionSelector {
  selectQuestionType(
    stage: ConversationStage,
    safetyScore: number,
    previousResponses: Response[]
  ): 'choice' | 'open' | 'hybrid' {

    // 安全性スコアが低い場合は選択式優先
    if (safetyScore < 0.4) {
      return 'choice';
    }

    // 段階別の基本比率
    const stageRatios = {
      warmup: { choice: 0.8, open: 0.2 },
      exploration: { choice: 0.6, open: 0.4 },
      deep_dive: { choice: 0.4, open: 0.6 },
      closing: { choice: 0.7, open: 0.3 }
    };

    // ランダム選択（加重）
    return Math.random() < stageRatios[stage].choice ? 'choice' : 'open';
  }
}
```

## 5. フォローアップシステム

### A. 選択後の確認
```yaml
follow_up_patterns:
  elaboration: "その選択肢について、もう少し教えていただけますか？"
  validation: "なるほど、${選択肢}ということですね。"
  empathy: "${選択肢}と感じていらっしゃるのですね。"
  safety: "お話しくださり、ありがとうございます。"
```

### B. ハイブリッド質問
```yaml
hybrid_structure:
  1. 選択式で基本状況把握
  2. "「その他」を選ばれた方は、よろしければ詳しく教えてください"
  3. "選択肢の中で特に当てはまる理由があれば、お聞かせください"
```

## 6. UI/UX考慮事項

### A. 視覚的配慮
- カード型デザイン（Material Design準拠）
- 適切な余白とタップしやすいサイズ
- 温かみのある色彩（#A5D6A7など）
- 絵文字で親しみやすさ演出

### B. アクセシビリティ
- スクリーンリーダー対応
- 高コントラスト表示
- キーボード操作対応
- 文字サイズ調整機能

### C. 心理的配慮
- 選択時間のプレッシャーを与えない
- 「戻る」ボタンで選択変更可能
- 進捗表示で安心感提供
- プライバシー保護の明示