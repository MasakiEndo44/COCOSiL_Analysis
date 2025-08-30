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
 * MBTI タイプから特徴を取得
 */
export function getMBTICharacteristics(type: MBTIType): string[] {
  const characteristics: Record<MBTIType, string[]> = {
    // Analysts (NT)
    INTJ: ['戦略家', '独立心が強い', '論理的思考', '長期計画が得意'],
    INTP: ['思想家', '理論重視', '分析的', '知的好奇心旺盛'],
    ENTJ: ['指揮官', 'リーダーシップ', '効率重視', '目標達成力'],
    ENTP: ['討論者', '創造的', '適応力が高い', '可能性を追求'],
    
    // Diplomats (NF)
    INFJ: ['提唱者', '洞察力がある', '理想主義', '人との深いつながり'],
    INFP: ['仲介者', '価値観重視', '創造性', '個性を大切にする'],
    ENFJ: ['主人公', '人を励ます', '共感力が高い', '調和を重視'],
    ENFP: ['運動家', '熱意溢れる', '人とのつながり', '新しい体験を求める'],
    
    // Sentinels (SJ)
    ISTJ: ['管理者', '責任感が強い', '実用的', '伝統を重んじる'],
    ISFJ: ['擁護者', '人への奉仕', '細やかな配慮', '安定を求める'],
    ESTJ: ['幹部', '組織運営が得意', '実行力', '秩序を重視'],
    ESFJ: ['領事', '人を支える', '協調性', 'チームワークを大切にする'],
    
    // Explorers (SP)
    ISTP: ['巨匠', '実用的なスキル', '問題解決能力', '独立性'],
    ISFP: ['冒険家', '美的感覚', '柔軟性', '平和を愛する'],
    ESTP: ['起業家', '行動力', '現実的', '人とのつながり'],
    ESFP: ['エンターテイナー', '人を楽しませる', '自発性', '経験を重視']
  };
  
  return characteristics[type] || [];
}

/**
 * 体癖タイプから特徴を取得
 */
export function getTaihekiCharacteristics(type: TaihekiType): string[] {
  const characteristics: Record<TaihekiType, string[]> = {
    1: ['頭脳型', '理論的', '集中力が高い', '論理思考重視'],
    2: ['バランス型', '協調性', '安定志向', '調和を重視'],
    3: ['上半身型', 'エネルギッシュ', '行動力', '感情表現豊か'],
    4: ['下半身型', '安定性', '持続力', '地に足がついている'],
    5: ['捻じれ型', '独創性', '個性的', '変化を好む'],
    6: ['捻じれ型', '繊細', '美意識が高い', '感受性豊か'],
    7: ['下半身型', '意志が強い', '頑固', '粘り強い'],
    8: ['上半身型', '開放的', '表現力', '人とのつながりを重視'],
    9: ['頭脳型', '分析力', '客観視', '冷静な判断'],
    10: ['全身型', 'バランス感覚', '適応力', '総合的な視点']
  };
  
  return characteristics[type] || [];
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
 * データを安全にlocalStorageに保存
 */
export function saveToLocalStorage<T>(key: string, data: T): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * localStorageからデータを安全に読み込み
 */
export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * データをlocalStorageから削除
 */
export function removeFromLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
}

/**
 * 30日後の有効期限付きでデータを保存
 */
export function saveWithExpiry<T>(key: string, data: T, ttlDays: number = 30): boolean {
  try {
    const now = new Date();
    const item = {
      value: data,
      expiry: now.getTime() + (ttlDays * 24 * 60 * 60 * 1000)
    };
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Failed to save with expiry:', error);
    return false;
  }
}

/**
 * 有効期限付きデータの読み込み
 */
export function loadWithExpiry<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    const now = new Date();
    
    if (now.getTime() > parsed.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.value;
  } catch (error) {
    console.error('Failed to load with expiry:', error);
    return null;
  }
}

/**
 * 文字列をハッシュ化 (個人情報の匿名化用)
 */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

/**
 * APIレスポンスの型安全なパース
 */
export function parseApiResponse<T>(response: any): { success: boolean; data?: T; error?: string } {
  if (typeof response !== 'object' || response === null) {
    return { success: false, error: 'Invalid response format' };
  }
  
  if (response.success === false) {
    return { success: false, error: response.error || 'Unknown error' };
  }
  
  return { success: true, data: response.data };
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 配列をシャッフル
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}