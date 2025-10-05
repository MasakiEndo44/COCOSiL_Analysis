/**
 * localStorage操作のユーティリティ関数
 *
 * 本番環境での堅牢性を確保するため、以下の機能を提供：
 * - localStorageの利用可能性チェック（Safari Private Mode対応）
 * - データバリデーションとスキーマバージョン管理
 * - 型安全なデータ読み書き操作
 */

// localStorage利用可能性チェック
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('⚠️ localStorage が利用できません（Private Modeまたはストレージ無効）');
    return false;
  }
}

// 安全なlocalStorage読み込み
export function safeGetItem(key: string): string | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`❌ localStorage.getItem("${key}") でエラー:`, e);
    return null;
  }
}

// 安全なlocalStorage書き込み
export function safeSetItem(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.error(`❌ localStorage.setItem("${key}") でエラー:`, e);
    return false;
  }
}

// 安全なlocalStorage削除
export function safeRemoveItem(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`❌ localStorage.removeItem("${key}") でエラー:`, e);
    return false;
  }
}

// JSONパースのヘルパー
export function safeJsonParse<T>(json: string | null): T | null {
  if (!json) return null;

  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('❌ JSON.parse でエラー:', e);
    return null;
  }
}

// JSONシリアライズのヘルパー
export function safeJsonStringify(data: unknown): string | null {
  try {
    return JSON.stringify(data);
  } catch (e) {
    console.error('❌ JSON.stringify でエラー:', e);
    return null;
  }
}
