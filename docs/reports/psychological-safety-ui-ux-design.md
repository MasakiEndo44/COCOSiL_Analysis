# 心理的安全性向上UI/UX設計

## 1. 設計哲学

### 基本理念
- **安心感**: ユーザーが安心して本音を話せる環境
- **非判断的**: 判断や評価を感じさせないデザイン
- **共感性**: AIが理解しようとしている姿勢を視覚化
- **透明性**: AIの能力と限界を誠実に表示

### デザイン原則
1. **温かみのある色彩**: 心理的な安らぎを与える
2. **適切な間**: プレッシャーを与えない空間設計
3. **明確性**: 混乱を避ける分かりやすいインターフェース
4. **制御感**: ユーザーが操作を制御できる安心感

## 2. 色彩・タイポグラフィ設計

### A. カラーパレット
```scss
// 心理的安全性を重視したカラーシステム
$colors: (
  // メインカラー: 自然で安心感のある緑系
  primary: #81C784,        // 穏やかな緑
  primary-light: #A5D6A7,  // より明るい緑
  primary-dark: #4CAF50,   // 深い緑

  // 共感・理解を表すカラー
  empathy: #90CAF9,        // 優しい青
  understanding: #FFCC02,   // 温かい黄色

  // 中性色: 非判断的な印象
  neutral-warm: #F5F5F5,   // 温かいグレー
  neutral-cool: #ECEFF1,   // クールなグレー

  // テキストカラー
  text-primary: #2E2E2E,   // 読みやすい濃灰色
  text-empathy: #1976D2,   // 共感的なメッセージ用
  text-safety: #388E3C,    // 安心感を与えるメッセージ用

  // アクセントカラー
  accent-gentle: #F8BBD9,  // 優しいピンク
  accent-warm: #FFE0B2     // 温かいオレンジ
);
```

### B. タイポグラフィ
```scss
// 心理的安全性を考慮したフォント設計
$typography: (
  // AIメッセージ: 親しみやすく読みやすい
  ai-message: (
    font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif,
    font-size: 16px,
    line-height: 1.6,
    font-weight: 400,
    letter-spacing: 0.02em
  ),

  // 選択肢: 明確で見やすい
  choice-option: (
    font-family: 'Noto Sans JP', sans-serif,
    font-size: 15px,
    line-height: 1.5,
    font-weight: 500
  ),

  // 共感メッセージ: 温かみのある
  empathy-message: (
    font-family: 'Noto Sans JP', sans-serif,
    font-size: 14px,
    line-height: 1.7,
    font-weight: 400,
    color: $text-empathy
  ),

  // 安心メッセージ: 安定感のある
  safety-message: (
    font-family: 'Noto Sans JP', sans-serif,
    font-size: 13px,
    line-height: 1.6,
    font-weight: 400,
    color: $text-safety
  )
);
```

## 3. コンポーネント設計

### A. AIメッセージバブル
```typescript
interface AIMessageBubble {
  // 基本構造
  container: {
    background: 'linear-gradient(135deg, #A5D6A7 0%, #81C784 100%)',
    borderRadius: '18px 18px 18px 4px',
    padding: '16px 20px',
    margin: '8px 0',
    maxWidth: '80%',
    boxShadow: '0 2px 8px rgba(129, 199, 132, 0.15)'
  },

  // 共感プレフィックス
  empathyPrefix: {
    fontSize: '14px',
    color: '#1976D2',
    fontStyle: 'italic',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  // メイン質問
  mainQuestion: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#2E2E2E',
    marginBottom: '12px'
  },

  // 安心メッセージ
  safetyMessage: {
    fontSize: '13px',
    color: '#388E3C',
    marginTop: '8px',
    padding: '8px 12px',
    background: 'rgba(165, 214, 167, 0.2)',
    borderRadius: '8px',
    borderLeft: '3px solid #81C784'
  }
}
```

### B. 選択肢カード
```typescript
interface ChoiceCard {
  // カードデザイン
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    margin: '8px 0',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },

  // ホバー・フォーカス状態
  states: {
    hover: {
      border: '2px solid #A5D6A7',
      boxShadow: '0 4px 12px rgba(165, 214, 167, 0.25)',
      transform: 'translateY(-2px)'
    },
    selected: {
      background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
      border: '2px solid #81C784'
    }
  },

  // 内部レイアウト
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    emoji: {
      fontSize: '20px',
      minWidth: '24px'
    },
    text: {
      flex: 1,
      label: {
        fontSize: '15px',
        fontWeight: 500,
        color: '#2E2E2E',
        marginBottom: '4px'
      },
      description: {
        fontSize: '13px',
        color: '#666',
        lineHeight: '1.4'
      }
    }
  }
}
```

### C. 心理的安全性インジケーター
```typescript
interface SafetyIndicator {
  // プライバシー保護表示
  privacyBadge: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    background: 'rgba(129, 199, 132, 0.1)',
    border: '1px solid #81C784',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '12px',
    color: '#388E3C',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  // 理解確認表示
  understandingCheck: {
    background: 'rgba(144, 202, 249, 0.1)',
    border: '1px solid #90CAF9',
    borderRadius: '8px',
    padding: '12px',
    margin: '16px 0',
    fontSize: '14px',
    color: '#1976D2'
  },

  // 進捗表示（プレッシャーを与えない）
  progressIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    margin: '20px 0',
    dots: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#E0E0E0',
      transition: 'background 0.3s ease'
    },
    activeDot: {
      background: '#81C784'
    }
  }
}
```

## 4. インタラクション設計

### A. ユーザー入力フロー
```typescript
interface InputFlow {
  // 1. 質問表示
  questionAppearance: {
    animation: 'fadeInUp 0.5s ease-out',
    timing: 'after 1s delay for reading',
    effect: 'gentle typing indicator before question'
  },

  // 2. 選択肢表示
  choicesAppearance: {
    animation: 'fadeInUp 0.3s ease-out',
    stagger: '0.1s between each option',
    timing: 'after question is fully displayed'
  },

  // 3. 選択フィードバック
  selectionFeedback: {
    immediate: 'gentle highlight + haptic feedback',
    confirmation: 'checkmark animation',
    delay: '500ms before proceeding'
  },

  // 4. 次の質問への遷移
  transition: {
    animation: 'smooth slide transition',
    timing: '1s total duration',
    empathyDisplay: 'show understanding message first'
  }
}
```

### B. 心理的安全性向上の相互作用
```typescript
interface SafetyInteractions {
  // 理解確認システム
  understandingConfirmation: {
    trigger: 'after every user response',
    format: '"${response}と感じていらっしゃるのですね"',
    userCorrection: {
      button: '少し違います',
      action: 'show clarification request',
      message: 'ご指摘ありがとうございます。どの部分が違いましたか？'
    }
  },

  // 安心感回復システム
  safetyRecovery: {
    trigger: 'when safety score < 0.4',
    actions: [
      'show privacy protection reminder',
      'display warm encouragement message',
      'switch to easier choice questions',
      'offer conversation pause option'
    ]
  },

  // 非判断的な言語表示
  nonJudgmentalLanguage: {
    avoidWords: ['正しい', '間違っている', '良い', '悪い', 'べき', 'すべき'],
    preferWords: ['感じる', '思う', '考える', '大切', '理解', '受け入れる'],
    examples: {
      instead_of: 'それは良い考えですね',
      use: 'そう考えていらっしゃるのですね'
    }
  }
}
```

## 5. アクセシビリティ配慮

### A. 視覚的アクセシビリティ
```typescript
interface VisualAccessibility {
  // 色覚多様性への配慮
  colorBlindness: {
    mainColors: 'sufficient contrast ratio (4.5:1 minimum)',
    patterns: 'use shapes + text, not color alone',
    alternatives: 'provide texture/pattern options'
  },

  // フォントサイズ調整
  fontScaling: {
    baseSize: '16px',
    scaleRange: '14px - 24px',
    method: 'CSS custom properties + user controls'
  },

  // 高コントラストモード
  highContrast: {
    trigger: 'user preference or system setting',
    colors: {
      background: '#000000',
      text: '#FFFFFF',
      accent: '#FFFF00'
    }
  }
}
```

### B. 操作アクセシビリティ
```typescript
interface OperationalAccessibility {
  // キーボード操作
  keyboardNavigation: {
    focusIndicator: 'clear, visible focus ring',
    tabOrder: 'logical sequence through interface',
    shortcuts: {
      enter: 'select highlighted choice',
      escape: 'go back or pause',
      numbers: 'select choice by number'
    }
  },

  // スクリーンリーダー
  screenReader: {
    labels: 'descriptive aria-labels for all interactive elements',
    announcements: 'live region for AI responses',
    structure: 'proper heading hierarchy and landmarks'
  },

  // モーター機能配慮
  motorFunction: {
    targetSize: 'minimum 44px tap targets',
    spacing: 'adequate space between interactive elements',
    timeout: 'no time limits on responses'
  }
}
```

## 6. モバイル最適化

### A. レスポンシブデザイン
```scss
// モバイルファーストアプローチ
@media (max-width: 768px) {
  .choice-card {
    padding: 20px 16px;
    margin: 12px 0;
    font-size: 16px; // タップしやすいサイズ
  }

  .ai-message {
    padding: 16px;
    font-size: 16px;
    line-height: 1.7; // 読みやすい行間
  }

  .choice-options {
    gap: 16px; // 十分な間隔
  }
}
```

### B. タッチインタラクション
```typescript
interface TouchInteractions {
  // ジェスチャー配慮
  gestures: {
    tap: 'single tap for selection',
    avoid: 'complex gestures (swipe, pinch, etc.)',
    feedback: 'haptic feedback on selection'
  },

  // 安全なタッチエリア
  touchTargets: {
    minSize: '44px x 44px',
    spacing: '8px minimum between targets',
    feedback: 'visual + haptic confirmation'
  }
}
```

## 7. 心理的配慮の実装詳細

### A. ローディング・待機状態
```typescript
interface LoadingStates {
  // 思考表示
  thinkingIndicator: {
    text: 'お話を伺っています...',
    animation: 'gentle pulse dots',
    duration: 'realistic AI thinking time (2-5s)',
    avoidText: ['処理中', '計算中'] // 機械的な印象を避ける
  },

  // 理解プロセス表示
  understandingProcess: {
    steps: [
      'お話をお伺いしています',
      'お気持ちを理解しようとしています',
      '次の質問を考えています'
    ],
    timing: '各ステップ1-2秒',
    visual: 'gentle animated icon'
  }
}
```

### B. エラー・問題状況の処理
```typescript
interface ErrorHandling {
  // 理解できない場合
  misunderstanding: {
    message: '申し訳ございません。私の理解が不足していました。',
    action: 'もう一度教えていただけますか？',
    tone: 'humble and genuine'
  },

  // 技術的エラー
  technicalError: {
    message: '一時的に調子が悪いようです。少し待ってから再度お試しください。',
    action: 'provide alternative contact method',
    avoidTone: 'mechanical error messages'
  },

  // 不適切な内容検出
  inappropriateContent: {
    message: 'より良くお手伝いするため、別の表現で教えていただけますか？',
    tone: 'non-judgmental and supportive'
  }
}
```