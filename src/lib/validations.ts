import { z } from 'zod';

// 基本情報フォームのバリデーション
export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
  
  gender: z.enum(['male', 'female', 'no_answer'], {
    errorMap: () => ({ message: '性別を選択してください' })
  }),
  
  birthdate: z.object({
    year: z
      .number()
      .min(1900, '1900年以降を選択してください')
      .max(new Date().getFullYear(), '未来の年は選択できません'),
    
    month: z
      .number()
      .min(1, '1月から12月の間で選択してください')
      .max(12, '1月から12月の間で選択してください'),
    
    day: z
      .number()
      .min(1, '1日から31日の間で選択してください')
      .max(31, '1日から31日の間で選択してください')
  }),
  
  privacyConsent: z
    .boolean()
    .refine(val => val === true, {
      message: 'プライバシーポリシーに同意してください'
    })
}).refine((data) => {
  // 日付の妥当性チェック
  const { year, month, day } = data.birthdate;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}, {
  message: '正しい日付を入力してください',
  path: ['birthdate']
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

// MBTI診断フォームのバリデーション（12問未定のため仮実装）
export const mbtiQuestionSchema = z.object({
  answers: z.array(z.boolean()).length(12, '全ての質問に回答してください')
});

export const mbtiKnownSchema = z.object({
  type: z.enum([
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ], {
    errorMap: () => ({ message: 'MBTIタイプを選択してください' })
  })
});

// 体癖診断フォームのバリデーション
export const taihekiQuestionSchema = z.object({
  answers: z.array(z.number().min(1).max(4)).length(20, '全ての質問に回答してください')
});

// 管理者認証フォームのバリデーション
export const adminAuthSchema = z.object({
  password: z
    .string()
    .length(4, 'パスワードは4桁で入力してください')
    .regex(/^\d{4}$/, 'パスワードは数字のみで入力してください')
});

// 算命学API リクエストのバリデーション
export const fortuneCalcSchema = z.object({
  year: z.number().min(1900).max(new Date().getFullYear()),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31)
}).refine((data) => {
  const { year, month, day } = data;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}, {
  message: '正しい日付を入力してください'
});

// データ削除要求フォームのバリデーション
export const dataDeleteRequestSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  reason: z.string().min(10, '削除理由を10文字以上で入力してください')
});