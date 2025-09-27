import { z } from 'zod';
import type { FormFieldError } from '@/types';

/**
 * Zodバリデーションエラーをフォーム用エラーフォーマットに変換
 */
export const formatValidationErrors = (error: z.ZodError): FormFieldError[] => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
};

/**
 * APIレスポンス用のエラーフォーマット
 */
export const formatApiValidationError = (error: z.ZodError) => {
  const errors = formatValidationErrors(error);
  return {
    success: false,
    error: 'バリデーションエラーが発生しました',
    details: errors,
    code: 'VALIDATION_ERROR'
  };
};

/**
 * 安全なJSONパース with バリデーション
 */
export const safeParseJson = <T>(
  jsonString: string,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    const result = schema.safeParse(parsed);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        error: `バリデーションエラー: ${formatValidationErrors(result.error).map(e => e.message).join(', ')}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'JSONの解析に失敗しました' 
    };
  }
};

/**
 * リクエストボディのバリデーション（Next.js API Route用）
 */
export const validateRequestBody = async <T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: Response }> => {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errorResponse = formatApiValidationError(result.error);
      return { 
        success: false, 
        error: Response.json(errorResponse, { status: 400 })
      };
    }
  } catch (error) {
    return {
      success: false,
      error: Response.json({
        success: false,
        error: 'リクエストボディの解析に失敗しました',
        code: 'INVALID_JSON'
      }, { status: 400 })
    };
  }
};

/**
 * クエリパラメータのバリデーション
 */
export const validateQueryParams = <T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: FormFieldError[] } => {
  const params: Record<string, any> = {};
  
  // URLSearchParamsからオブジェクトに変換
  for (const [key, value] of searchParams.entries()) {
    // 数値っぽい文字列は数値に変換を試行
    if (/^\d+$/.test(value)) {
      params[key] = parseInt(value, 10);
    } else if (/^\d+\.\d+$/.test(value)) {
      params[key] = parseFloat(value);
    } else if (value === 'true') {
      params[key] = true;
    } else if (value === 'false') {
      params[key] = false;
    } else {
      params[key] = value;
    }
  }
  
  const result = schema.safeParse(params);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: formatValidationErrors(result.error) };
  }
};

/**
 * ファイルサイズのバリデーション
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * 画像ファイルタイプのバリデーション
 */
export const validateImageType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(file.type);
};

/**
 * 日付の相対的バリデーション（生年月日など）
 */
export const validateBirthDate = (birthDate: { year: number; month: number; day: number }): {
  isValid: boolean;
  age?: number;
  errors: string[];
} => {
  const errors: string[] = [];
  const { year, month, day } = birthDate;
  
  // 日付の存在チェック
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    errors.push('存在しない日付です');
    return { isValid: false, errors };
  }
  
  // 未来日チェック
  const today = new Date();
  if (date > today) {
    errors.push('未来の日付は指定できません');
  }
  
  // 年齢計算と妥当性チェック
  const age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  const dayDiff = today.getDate() - day;
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  
  if (actualAge < 0) {
    errors.push('未来の日付は指定できません');
  } else if (actualAge > 150) {
    errors.push('150歳を超える年齢は指定できません');
  }
  
  return {
    isValid: errors.length === 0,
    age: actualAge,
    errors
  };
};

/**
 * パスワード強度のバリデーション
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number; // 0-100
  suggestions: string[];
} => {
  const suggestions: string[] = [];
  let score = 0;
  
  // 長さチェック
  if (password.length >= 8) {
    score += 25;
  } else {
    suggestions.push('8文字以上にしてください');
  }
  
  // 大文字小文字
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 25;
  } else {
    suggestions.push('大文字と小文字を組み合わせてください');
  }
  
  // 数字
  if (/\d/.test(password)) {
    score += 25;
  } else {
    suggestions.push('数字を含めてください');
  }
  
  // 特殊文字
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 25;
  } else {
    suggestions.push('特殊文字を含めてください');
  }
  
  return {
    isValid: score >= 75,
    score,
    suggestions
  };
};

/**
 * 診断データの完整性チェック
 */
export const validateDiagnosisCompleteness = (data: {
  mbti: boolean;
  taiheki: boolean;
  fortune: boolean;
  age: number;
  name: string;
}): {
  isComplete: boolean;
  missingFields: string[];
  canProceedToChat: boolean;
} => {
  const missingFields: string[] = [];
  
  if (!data.name) missingFields.push('お名前');
  if (data.age <= 0) missingFields.push('年齢');
  if (!data.mbti) missingFields.push('MBTI診断');
  if (!data.taiheki) missingFields.push('体癖診断');
  if (!data.fortune) missingFields.push('算命学');
  
  // チャットに進むためには最低限MBTIと体癖が必要
  const canProceedToChat = data.mbti && data.taiheki && data.age > 0 && data.name.length > 0;
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    canProceedToChat
  };
};

/**
 * セキュリティ: XSS対策のためのHTML エスケープ
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * セキュリティ: SQLインジェクション対策のための文字列サニタイズ
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/['"\\;]/g, '') // 危険な文字を除去
    .trim()
    .substring(0, 1000); // 長すぎる入力を制限
};

/**
 * デバッグ用: バリデーション結果の詳細表示
 */
export const debugValidationResult = <T>(
  result: z.SafeParseReturnType<any, T>,
  label = 'Validation'
): void => {
  if (process.env.NODE_ENV === 'development') {
    if (result.success) {
      console.log(`✅ ${label} successful:`, result.data);
    } else {
      console.error(`❌ ${label} failed:`, formatValidationErrors(result.error));
    }
  }
};