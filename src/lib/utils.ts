import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { BasicInfo, MBTIType, TaihekiType } from '@/types';

/**
 * Tailwind CSS クラス名をマージするユーティリティ
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 生年月日から年齢を計算
 */
export function calculateAge(birthdate: BasicInfo['birthdate']): number {
  const today = new Date();
  const birth = new Date(birthdate.year, birthdate.month - 1, birthdate.day);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * 日付の妥当性をチェック
 */
export function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}

/**
 * セッションIDを生成
 */
export function generateSessionId(): string {
  return `cocosil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}



/**
 * プログレスの進捗率を計算
 */
export function calculateProgress(completedSteps: string[]): number {
  const stepWeights = {
    basic_info: 20,
    mbti: 20,        // 20% + 20% = 40%
    taiheki_learn: 20, // 任意のため、完了時のみ加算
    taiheki_test: 20,  // 20% + 40% = 60% または 80% (学習スキップ時)
    integration: 20    // 最終20%
  };
  
  return completedSteps.reduce((total, step) => {
    return total + (stepWeights[step as keyof typeof stepWeights] || 0);
  }, 0);
}


/**
 * エラーオブジェクトを標準化
 */
export function createError(code: string, message: string, details?: any) {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  };
}

