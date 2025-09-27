import { z } from 'zod';

// 基本的な定数とバリデータ
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;
const MAX_YEAR = CURRENT_YEAR + 5; // 未来の年も少し許可

// 基本情報バリデーション
export const basicInfoSchema = z.object({
  name: z.string()
    .min(1, 'お名前を入力してください')
    .max(50, 'お名前は50文字以内で入力してください')
    .regex(/^[^\s].*[^\s]$|^[^\s]$/, '前後の空白文字は使用できません'),
  
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .max(100, 'メールアドレスは100文字以内で入力してください'),
  
  gender: z.enum(['male', 'female', 'no_answer'], {
    errorMap: () => ({ message: '性別を選択してください' })
  }),
  
  birthdate: z.object({
    year: z.number()
      .int('年は整数で入力してください')
      .min(MIN_YEAR, `年は${MIN_YEAR}年以降で入力してください`)
      .max(MAX_YEAR, `年は${MAX_YEAR}年以前で入力してください`),
    
    month: z.number()
      .int('月は整数で入力してください')
      .min(1, '月は1から12の間で入力してください')
      .max(12, '月は1から12の間で入力してください'),
    
    day: z.number()
      .int('日は整数で入力してください')
      .min(1, '日は1から31の間で入力してください')
      .max(31, '日は1から31の間で入力してください')
  }).refine((data) => {
    // 月と日の組み合わせの妥当性をチェック
    const { year, month, day } = data;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  }, {
    message: '存在しない日付です',
    path: ['day']
  }).refine((data) => {
    // 未来の日付でないことをチェック
    const { year, month, day } = data;
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
  }, {
    message: '未来の日付は入力できません',
    path: ['day']
  }),
  
  age: z.number()
    .int('年齢は整数で入力してください')
    .min(0, '年齢は0歳以上で入力してください')
    .max(150, '年齢は150歳以下で入力してください')
    .optional(),
  
  timestamp: z.union([z.date(), z.string().datetime(), z.string()]).transform((val) => {
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      const date = new Date(val);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  }).optional()
});

// MBTI関連バリデーション
export const mbtiTypeSchema = z.enum([
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
], {
  errorMap: () => ({ message: '有効なMBTIタイプを選択してください' })
});

export const mbtiScoresSchema = z.object({
  E: z.number().min(0).max(100),
  I: z.number().min(0).max(100),
  S: z.number().min(0).max(100),
  N: z.number().min(0).max(100),
  T: z.number().min(0).max(100),
  F: z.number().min(0).max(100),
  J: z.number().min(0).max(100),
  P: z.number().min(0).max(100)
}).refine((scores) => {
  // E + I = 100, S + N = 100, T + F = 100, J + P = 100 であることをチェック
  return Math.abs(scores.E + scores.I - 100) < 0.01 &&
         Math.abs(scores.S + scores.N - 100) < 0.01 &&
         Math.abs(scores.T + scores.F - 100) < 0.01 &&
         Math.abs(scores.J + scores.P - 100) < 0.01;
}, {
  message: 'MBTIスコアの合計が正しくありません'
});

export const mbtiResultSchema = z.object({
  type: mbtiTypeSchema,
  scores: mbtiScoresSchema.optional(),
  source: z.enum(['known', 'diagnosed'], {
    errorMap: () => ({ message: 'MBTIの取得方法を選択してください' })
  }),
  confidence: z.number()
    .min(0, '信頼度は0以上である必要があります')
    .max(1, '信頼度は1以下である必要があります')
    .optional()
});

// 体癖関連バリデーション
export const taihekiTypeSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
  z.literal(6), z.literal(7), z.literal(8), z.literal(9), z.literal(10)
], {
  errorMap: () => ({ message: '体癖タイプは1から10の間で選択してください' })
});

export const secondaryTaihekiTypeSchema = z.union([
  z.literal(0), ...taihekiTypeSchema.options
], {
  errorMap: () => ({ message: '副体癖タイプは0から10の間で選択してください' })
});

export const taihekiResultSchema = z.object({
  primary: taihekiTypeSchema,
  secondary: secondaryTaihekiTypeSchema,
  scores: z.record(z.string(), z.number().min(0).max(100))
    .refine((scores) => {
      // 全てのキーが1-10の数字であることをチェック
      const keys = Object.keys(scores);
      return keys.every(key => {
        const num = parseInt(key);
        return !isNaN(num) && num >= 1 && num <= 10;
      });
    }, {
      message: '体癖スコアのキーは1から10の数字である必要があります'
    }),
  characteristics: z.array(z.string().min(1).max(200))
    .min(1, '特徴は最低1つ必要です')
    .max(20, '特徴は最大20個までです'),
  recommendations: z.array(z.string().min(1).max(300))
    .min(1, '推奨事項は最低1つ必要です')
    .max(15, '推奨事項は最大15個までです')
});

export const taihekiQuestionSchema = z.object({
  id: z.number().int().positive('質問IDは正の整数である必要があります'),
  question: z.string().min(1, '質問内容は必須です').max(500, '質問は500文字以内です'),
  choices: z.array(z.object({
    text: z.string().min(1, '選択肢のテキストは必須です').max(200, '選択肢は200文字以内です'),
    taihekiType: taihekiTypeSchema,
    weight: z.number().min(0, '重みは0以上である必要があります').max(10, '重みは10以下である必要があります')
  })).min(2, '選択肢は最低2つ必要です').max(10, '選択肢は最大10個までです')
});

// 算命学・動物占い関連バリデーション
export const fortuneResultSchema = z.object({
  zodiac: z.string().min(1, '十二支は必須です').max(10, '十二支は10文字以内です'),
  animal: z.string().min(1, '動物占いの結果は必須です').max(20, '動物占いは20文字以内です'),
  sixStar: z.string().min(1, '六星占術の結果は必須です').max(10, '六星占術は10文字以内です'),
  element: z.string().min(1, '五行の結果は必須です').max(10, '五行は10文字以内です'),
  fortune: z.string().min(1, '運勢概要は必須です').max(1000, '運勢概要は1000文字以内です'),
  characteristics: z.array(z.string().min(1).max(200))
    .min(1, '特徴は最低1つ必要です')
    .max(20, '特徴は最大20個までです')
});

// プログレス管理バリデーション
export const diagnosisStepSchema = z.enum([
  'basic_info', 'mbti', 'taiheki_learn', 'taiheki_test', 'integration'
], {
  errorMap: () => ({ message: '有効な診断ステップを選択してください' })
});

export const progressStateSchema = z.object({
  step: diagnosisStepSchema,
  percentage: z.number()
    .min(0, '進捗は0%以上である必要があります')
    .max(100, '進捗は100%以下である必要があります'),
  completedSteps: z.array(diagnosisStepSchema)
    .max(5, '完了ステップは最大5個までです')
});

// 統合診断データバリデーション
export const userDiagnosisDataSchema = z.object({
  id: z.string().min(1, 'セッションIDは必須です').max(100, 'セッションIDは100文字以内です'),
  basic: basicInfoSchema,
  mbti: mbtiResultSchema.nullable(),
  taiheki: taihekiResultSchema.nullable(),
  fortune: fortuneResultSchema.nullable(),
  progress: progressStateSchema,
  completedAt: z.union([z.date(), z.string().datetime(), z.string()]).transform((val) => {
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      const date = new Date(val);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  }).optional()
});

// API関連バリデーション
export const fortuneCalcRequestSchema = z.object({
  year: z.number()
    .int('年は整数で入力してください')
    .min(MIN_YEAR, `年は${MIN_YEAR}年以降で入力してください`)
    .max(MAX_YEAR, `年は${MAX_YEAR}年以前で入力してください`),
  month: z.number()
    .int('月は整数で入力してください')
    .min(1, '月は1から12の間で入力してください')
    .max(12, '月は1から12の間で入力してください'),
  day: z.number()
    .int('日は整数で入力してください')
    .min(1, '日は1から31の間で入力してください')
    .max(31, '日は1から31の間で入力してください')
}).refine((data) => {
  // 日付の妥当性をチェック
  const { year, month, day } = data;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}, {
  message: '存在しない日付です'
});

export const fortuneCalcResponseSchema = z.object({
  success: z.boolean(),
  data: fortuneResultSchema.optional(),
  error: z.string().optional()
}).refine((data) => {
  // successがtrueの場合はdataが必要、falseの場合はerrorが必要
  if (data.success) {
    return data.data !== undefined;
  } else {
    return data.error !== undefined;
  }
}, {
  message: 'レスポンス形式が正しくありません'
});

// チャット関連バリデーション
export const chatMessageSchema = z.object({
  id: z.string().min(1, 'メッセージIDは必須です').optional(),
  role: z.enum(['user', 'assistant', 'system'], {
    errorMap: () => ({ message: '有効な役割を選択してください' })
  }),
  content: z.string().min(1, 'メッセージ内容は必須です').max(5000, 'メッセージは5000文字以内です'),
  timestamp: z.union([z.date(), z.string().datetime(), z.string()]).transform((val) => {
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      // Handle ISO datetime strings or simple datetime strings
      const date = new Date(val);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  }).optional()
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'メッセージは最低1つ必要です'),
  systemPrompt: z.string().max(2000, 'システムプロンプトは2000文字以内です').optional(),
  userData: userDiagnosisDataSchema.optional(),
  stream: z.boolean().optional().default(false)
});

// 管理者向けデータバリデーション
export const anonymizedRecordSchema = z.object({
  id: z.string().min(1, 'IDは必須です'),
  age: z.number().int().min(0).max(150, '年齢は0から150の間である必要があります'),
  mbti: z.string().min(4).max(4, 'MBTIは4文字である必要があります'),
  taiheki: z.object({
    primary: z.number().int().min(1).max(10),
    secondary: z.number().int().min(0).max(10)
  }),
  fortune: z.object({
    animal: z.string().min(1).max(20),
    element: z.string().min(1).max(10)
  }),
  timestamp: z.date(),
  sessionDuration: z.number().int().min(0, 'セッション時間は0以上である必要があります')
});

export const adminSubmitRequestSchema = z.object({
  userData: userDiagnosisDataSchema,
  mdContent: z.string().max(50000, 'MDコンテンツは50000文字以内です'),
  metadata: z.object({
    sessionDuration: z.number().int().min(0),
    browserInfo: z.string().max(500, 'ブラウザ情報は500文字以内です')
  })
});

export const adminSubmitResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1, 'メッセージは必須です'),
  recordId: z.string().optional()
});

// エラーハンドリングスキーマ
export const appErrorSchema = z.object({
  code: z.string().min(1, 'エラーコードは必須です'),
  message: z.string().min(1, 'エラーメッセージは必須です'),
  details: z.any().optional(),
  timestamp: z.date(),
  retryable: z.boolean().optional()
});

// フォームバリデーション用のヘルパー関数
export const validateBasicInfo = (data: unknown) => {
  return basicInfoSchema.safeParse(data);
};

export const validateMBTIResult = (data: unknown) => {
  return mbtiResultSchema.safeParse(data);
};

export const validateTaihekiResult = (data: unknown) => {
  return taihekiResultSchema.safeParse(data);
};

export const validateFortuneCalcRequest = (data: unknown) => {
  return fortuneCalcRequestSchema.safeParse(data);
};

export const validateChatRequest = (data: unknown) => {
  return chatRequestSchema.safeParse(data);
};

export const validateAdminSubmitRequest = (data: unknown) => {
  return adminSubmitRequestSchema.safeParse(data);
};

// API レスポンス用の型ガード
export const isValidFortuneCalcResponse = (data: unknown): data is z.infer<typeof fortuneCalcResponseSchema> => {
  return fortuneCalcResponseSchema.safeParse(data).success;
};

export const isValidAdminSubmitResponse = (data: unknown): data is z.infer<typeof adminSubmitResponseSchema> => {
  return adminSubmitResponseSchema.safeParse(data).success;
};

// バリデーションエラーのフォーマット用ヘルパー
export const formatZodError = (error: z.ZodError) => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
};

// 型エクスポート（推論された型）
export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type MBTIResultInput = z.infer<typeof mbtiResultSchema>;
export type TaihekiResultInput = z.infer<typeof taihekiResultSchema>;
export type FortuneCalcRequestInput = z.infer<typeof fortuneCalcRequestSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type AdminSubmitRequestInput = z.infer<typeof adminSubmitRequestSchema>;