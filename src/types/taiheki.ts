/**
 * 体癖診断システム 型定義
 * 
 * HTMLファイルからの移植＋改良版
 * 4択制限と高精度スコア計算に対応
 */

// ============================================================
// 基本型定義
// ============================================================

export type TaihekiType = 
  | 'type1' | 'type2' | 'type3' | 'type4' | 'type5'
  | 'type6' | 'type7' | 'type8' | 'type9' | 'type10';

export type QuestionType = 'single' | 'scale';
export type QuestionCategory = 'physical' | 'behavioral' | 'mental' | 'social';

// ============================================================
// 質問・選択肢データ構造
// ============================================================

export interface TaihekiOption {
  text: string;
  scores: Partial<Record<TaihekiType, number>>;
  confidenceLevel?: number; // 0.0-1.0 (選択肢の確度)
}

export interface TaihekiScaleOption {
  value: number; // 1-5 (リッカート尺度)
  scores: Partial<Record<TaihekiType, number>>;
}

export interface TaihekiQuestion {
  id: number;
  type: QuestionType;
  weight: number;
  text: string;
  category: QuestionCategory;
  maxSelections: number; // single: 1-2, scale: 1
  
  // 選択肢（4択制限）
  options?: TaihekiOption[];        // single type用
  scaleOptions?: TaihekiScaleOption[]; // scale type用（5段階）
}

// ============================================================
// 診断データ構造
// ============================================================

export interface DiagnosisAnswer {
  questionId: number;
  selectedOptions: number[]; // 選択した選択肢のインデックス配列
}

export interface TypeScores {
  type1: number;
  type2: number;
  type3: number;
  type4: number;
  type5: number;
  type6: number;
  type7: number;
  type8: number;
  type9: number;
  type10: number;
}

export interface DiagnosisResult {
  primaryType: TaihekiType;
  primaryScore: number;
  secondaryType: TaihekiType;
  secondaryScore: number;
  
  allScores: TypeScores;
  maxScore: number;
  
  // 信頼度計算
  confidence: number;          // 0.0-1.0
  reliabilityText: string;     // '非常に高い' | '高い' | '中程度' | '参考程度'
  reliabilityStars: string;    // '★★★★★' 形式
  
  // メタ情報
  totalQuestions: number;
  completionTime?: number;     // 秒
}

export interface ProgressResult {
  currentScores: TypeScores;
  topCandidates: {
    type: TaihekiType;
    score: number;
    confidence: number;
  }[];
  overallConfidence: number;
  completionRate: number;
  recommendedNext?: number[];  // 次に重要な質問ID
}

// ============================================================
// セッション管理
// ============================================================

export interface DiagnosisSession {
  id: string;
  currentQuestion: number;
  answers: DiagnosisAnswer[];
  progressData?: ProgressResult;
  status: 'active' | 'completed' | 'expired' | 'abandoned';
  expiresAt: Date;
  createdAt: Date;
  completedAt?: Date;
  userAgent?: string;
}

// ============================================================
// API インターフェース
// ============================================================

// 一括診断API
export interface BulkDiagnosisRequest {
  answers: DiagnosisAnswer[];
  userAgent?: string;
  startTime?: Date;
}

export interface BulkDiagnosisResponse {
  result: DiagnosisResult;
  sessionId: string;
  processingTime: number; // ms
}

// セッション管理API
export interface SessionStartResponse {
  sessionId: string;
  expiresAt: string;
  totalQuestions: number;
}

export interface SessionAnswerRequest {
  questionId: number;
  selectedOptions: number[];
}

export interface SessionProgressResponse {
  currentScores: TypeScores;
  topCandidates: {
    type: TaihekiType;
    score: number;
    confidence: number;
  }[];
  overallConfidence: number;
  completionRate: number;
  questionsRemaining: number;
  estimatedTimeMinutes: number;
}

// ============================================================
// 管理・統計用
// ============================================================

export interface DiagnosisStats {
  totalDiagnoses: number;
  todayDiagnoses: number;
  weeklyDiagnoses: number;
  monthlyDiagnoses: number;
  averageCompletionTime: number; // 秒
  completionRate: number; // 0.0-1.0
}

export interface TypeDistribution {
  typeDistribution: Record<TaihekiType, number>;
  confidenceDistribution: {
    high: number;    // ★★★★★
    medium: number;  // ★★★☆☆
    low: number;     // ★★☆☆☆
  };
}

export interface AnswerPattern {
  questions: number[];
  pattern: number[];
  frequency: number;
  resultingType: TaihekiType;
  confidence: number;
}

// ============================================================
// エラーハンドリング
// ============================================================

export class TaihekiDiagnosisError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TaihekiDiagnosisError';
  }
}

export const ERROR_CODES = {
  INVALID_SESSION: 'INVALID_SESSION',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_QUESTION: 'INVALID_QUESTION',
  INVALID_ANSWER: 'INVALID_ANSWER',
  TOO_MANY_SELECTIONS: 'TOO_MANY_SELECTIONS',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
} as const;

// ============================================================
// 設定・定数
// ============================================================

export const TAIHEKI_CONFIG = {
  // セッション設定
  SESSION_TTL_MINUTES: 30,
  MAX_CONCURRENT_SESSIONS: 50,
  
  // 診断設定
  TOTAL_QUESTIONS: 20,
  MAX_OPTIONS_PER_QUESTION: 4,
  ESTIMATED_TIME_MINUTES: 15,
  
  // 信頼度閾値
  CONFIDENCE_THRESHOLDS: {
    VERY_HIGH: 1.5,   // ★★★★★
    HIGH: 1.3,        // ★★★★☆
    MEDIUM: 1.15,     // ★★★☆☆
    LOW: 0.0          // ★★☆☆☆
  },
  
  // パフォーマンス設定
  MAX_RESPONSE_TIME_MS: 100,
  CACHE_TTL_SECONDS: 300, // 5分
} as const;

export const TAIHEKI_TYPES_METADATA = {
  type1: { 
    name: '1種体癖', 
    subtitle: '上下型・論理的思考型', 
    category: '上下型',
    description: '理論的で論理的な思考を重視。物事を言葉で説明し、善悪の判断を大切にします。'
  },
  type2: { 
    name: '2種体癖', 
    subtitle: '上下型・心配性型', 
    category: '上下型',
    description: '慎重で真面目、マニュアルを重視。不安を感じやすく、準備を大切にします。'
  },
  type3: { 
    name: '3種体癖', 
    subtitle: '左右型・感情表出型', 
    category: '左右型',
    description: '感情豊かで明るく社交的。美味しいものや楽しいことが大好きなムードメーカー。'
  },
  type4: { 
    name: '4種体癖', 
    subtitle: '左右型・感情抑制型', 
    category: '左右型',
    description: 'クールで感情を抑制。他人の気持ちに寄り添い、調和を大切にします。'
  },
  type5: { 
    name: '5種体癖', 
    subtitle: '前後型・行動的合理型', 
    category: '前後型',
    description: '行動的で合理的。効率を重視し、常に動き回るエネルギッシュなタイプ。'
  },
  type6: { 
    name: '6種体癖', 
    subtitle: '前後型・内向的理想型', 
    category: '前後型',
    description: '理想家でロマンチスト。静かで内向的ですが、高い理想を追求します。'
  },
  type7: { 
    name: '7種体癖', 
    subtitle: '捻れ型・闘争型', 
    category: '捻れ型',
    description: '闘志にあふれ、競争心が強い。親分肌でリーダーシップを発揮します。'
  },
  type8: { 
    name: '8種体癖', 
    subtitle: '捻れ型・忍耐型', 
    category: '捻れ型',
    description: '我慢強く地道な努力家。義理堅く、縁の下の力持ちタイプ。'
  },
  type9: { 
    name: '9種体癖', 
    subtitle: '開閉型・集中型', 
    category: '開閉型',
    description: '凝り性で完璧主義。一つのことに集中し、深く極めることを好みます。'
  },
  type10: { 
    name: '10種体癖', 
    subtitle: '開閉型・包容型', 
    category: '開閉型',
    description: '包容力があり世話好き。大らかで、みんなをまとめる親分肌。'
  }
} as const;