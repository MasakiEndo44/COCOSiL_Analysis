// COCOSiL統合診断システム - TypeScript型定義
// 詳細要件定義書に基づく型定義

// 基本情報 (要件確認に基づき更新)
export interface BasicInfo {
  name: string; // ニックネーム（フルネーム）
  email: string; // メールアドレス
  gender: 'male' | 'female' | 'no_answer'; // 性別
  birthdate: {
    year: number;  // 1900-2025 (西暦のみ)
    month: number; // 1-12
    day: number;   // 1-31
  };
  age?: number;
  timestamp?: Date;
}

// MBTI関連
export type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface MBTIResult {
  type: MBTIType;
  scores?: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  source: 'known' | 'diagnosed'; // 既知選択 or 12問診断
  confidence?: number; // 診断の信頼度 (0-1)
}

// 体癖関連
export type TaihekiType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type SecondaryTaihekiType = 0 | TaihekiType; // 副体癖は0（なし）も許可

export interface TaihekiResult {
  primary: TaihekiType;           // 主体癖
  secondary: SecondaryTaihekiType; // 副体癖（0 = なし）
  scores: Record<TaihekiType, number>; // 各体癖のスコア
  characteristics: string[]; // 特徴一覧
  recommendations: string[]; // 推奨事項
}

export interface TaihekiQuestion {
  id: number;
  question: string;
  choices: {
    text: string;
    taihekiType: TaihekiType;
    weight: number;
  }[];
}

// 算命学・動物占い関連
export interface FortuneResult {
  zodiac: string;      // 十二支
  animal: string;      // 動物占い
  sixStar: string;     // 六星占術
  element: string;     // 五行
  fortune: string;     // 運勢概要
  characteristics: string[]; // 特徴一覧
}

// 統合診断データ
export interface UserDiagnosisData {
  id: string; // セッションID
  basic: BasicInfo;
  mbti: MBTIResult | null;
  taiheki: TaihekiResult | null;
  fortune: FortuneResult | null;
  progress: ProgressState;
  completedAt?: Date;
}

// プログレス管理
export interface ProgressState {
  step: DiagnosisStep;
  percentage: number; // 0-100
  completedSteps: DiagnosisStep[];
}

export type DiagnosisStep = 
  | 'basic_info'    // 基本情報入力 (20%)
  | 'mbti'          // MBTI収集 (40%)
  | 'taiheki_learn' // 体癖理論学習 (60%, 任意)
  | 'taiheki_test'  // 体癖診断 (80%)
  | 'integration'   // 統合結果 (100%)

// 管理者向けデータ
export interface AnonymizedRecord {
  id: string;        // ハッシュ化ID
  age: number;       // 年齢のみ
  mbti: string;      // MBTI結果
  taiheki: {         // 体癖結果
    primary: number;
    secondary: number;
  };
  fortune: {         // 算命学結果（個人特定不可部分）
    animal: string;
    element: string;
  };
  timestamp: Date;   // 診断実施日時
  sessionDuration: number; // 診断所要時間(秒)
  // 個人識別情報は含まない
}

export interface AdminSubmitData {
  userData: UserDiagnosisData;
  mdContent: string;     // Claude AI向け.mdファイル内容
  metadata: {
    sessionDuration: number;  // 診断所要時間
    browserInfo: string;      // ブラウザ情報
    completionRate: number;   // 完了率
  };
}

// API関連
export interface FortuneCalcRequest {
  year: number;   // 1900-2025
  month: number;  // 1-12  
  day: number;    // 1-31
}

export interface FortuneCalcResponse {
  success: boolean;
  data?: FortuneResult;
  error?: string;
}

export interface AdminSubmitRequest {
  userData: UserDiagnosisData;
  mdContent: string;
  metadata: {
    sessionDuration: number;
    browserInfo: string;
  };
}

export interface AdminSubmitResponse {
  success: boolean;
  message: string;
  recordId?: string;
}

// OpenAI チャット関連
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// AI Counseling Session Data
export interface ChatSession {
  sessionId: string;
  selectedTopic: string;          // Which consultation topic was chosen
  messages: ChatMessage[];       // Full conversation history
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
}

export interface ChatSummary {
  topicId: string;
  topicTitle: string;
  qaExchanges: QAExchange[];     // Simple Q&A pairs
  sessionDuration: number;       // Duration in minutes
}

export interface QAExchange {
  question: string;              // OpenAI question summary (max 100 chars)
  answer: string;                // User response summary (max 150 chars)
  timestamp: Date;               // When this exchange occurred
}

export interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt?: string;
  userData?: UserDiagnosisData; // 診断データ活用時
}

// エラーハンドリング
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  retryable?: boolean;
}

// ユーティリティ型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 状態管理 (Zustand)
export interface DiagnosisStore {
  // 状態
  userData: UserDiagnosisData | null;
  currentStep: DiagnosisStep;
  isLoading: boolean;
  error: AppError | null;
  
  // アクション  
  setBasicInfo: (info: BasicInfo) => void;
  setMBTI: (result: MBTIResult) => void;
  setTaiheki: (result: TaihekiResult) => void;
  setFortune: (result: FortuneResult) => void;
  updateProgress: (step: DiagnosisStep, percentage: number) => void;
  setError: (error: AppError | null) => void;
  clearAll: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

// UI関連
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface FormFieldError {
  message: string;
  field: string;
}

// レスポンシブ対応
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface BreakpointConfig {
  xs: number;  // ≤ 399px
  sm: number;  // 400-767px
  md: number;  // 768-1023px
  lg: number;  // 1024-1439px
  xl: number;  // ≥ 1440px
}