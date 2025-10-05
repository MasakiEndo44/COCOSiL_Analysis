/**
 * 体癖診断結果のバリデーション
 *
 * localStorageから読み込んだデータの整合性を検証し、
 * 本番環境での堅牢性を確保します。
 */

import type { TaihekiResult } from '@/types';

// スキーマバージョン管理
export const TAIHEKI_SCHEMA_VERSION = '1.0.0';

// localStorage形式の体癖診断結果の型定義
export interface LocalStorageTaihekiResult {
  type: 'taiheki';
  version?: string; // スキーマバージョン
  timestamp: string;
  primary: {
    type: string;
    name: string;
    subtitle: string;
    description: string;
    score: number;
  };
  secondary: {
    type: string;
    name: string;
    subtitle: string;
    score: number;
  };
  reliability: {
    value: number;
    text: string;
    stars: number;
  };
  allScores: Record<string, number>;
}

// バリデーション結果の型定義
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 体癖診断結果のバリデーション
 */
export function validateTaihekiResult(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本的な型チェック
  if (!data || typeof data !== 'object') {
    errors.push('データが存在しないか、オブジェクトではありません');
    return { isValid: false, errors, warnings };
  }

  const result = data as Partial<LocalStorageTaihekiResult>;

  // 必須フィールドの検証
  if (result.type !== 'taiheki') {
    errors.push(`無効なデータ形式: type="${result.type}" (期待値: "taiheki")`);
  }

  // スキーマバージョンチェック（警告のみ）
  if (!result.version) {
    warnings.push('スキーマバージョンが設定されていません（古い形式の可能性）');
  } else if (result.version !== TAIHEKI_SCHEMA_VERSION) {
    warnings.push(`スキーマバージョンが異なります: ${result.version} (現在: ${TAIHEKI_SCHEMA_VERSION})`);
  }

  // タイムスタンプの検証
  if (!result.timestamp) {
    errors.push('タイムスタンプが存在しません');
  } else {
    const timestamp = new Date(result.timestamp);
    if (isNaN(timestamp.getTime())) {
      errors.push('無効なタイムスタンプ形式');
    }
  }

  // primary フィールドの検証
  if (!result.primary) {
    errors.push('primary フィールドが存在しません');
  } else {
    if (!result.primary.type || !result.primary.type.startsWith('type')) {
      errors.push(`無効な primary.type: ${result.primary.type}`);
    }
    if (!result.primary.name) {
      errors.push('primary.name が存在しません');
    }
    if (typeof result.primary.score !== 'number' || result.primary.score < 0) {
      errors.push(`無効な primary.score: ${result.primary.score}`);
    }
  }

  // secondary フィールドの検証
  if (!result.secondary) {
    errors.push('secondary フィールドが存在しません');
  } else {
    if (!result.secondary.type || !result.secondary.type.startsWith('type')) {
      errors.push(`無効な secondary.type: ${result.secondary.type}`);
    }
    if (!result.secondary.name) {
      errors.push('secondary.name が存在しません');
    }
    if (typeof result.secondary.score !== 'number' || result.secondary.score < 0) {
      errors.push(`無効な secondary.score: ${result.secondary.score}`);
    }
  }

  // reliability フィールドの検証
  if (!result.reliability) {
    errors.push('reliability フィールドが存在しません');
  } else {
    if (typeof result.reliability.value !== 'number' || result.reliability.value < 0 || result.reliability.value > 1) {
      errors.push(`無効な reliability.value: ${result.reliability.value} (範囲: 0-1)`);
    }
    if (typeof result.reliability.stars !== 'number' || result.reliability.stars < 1 || result.reliability.stars > 5) {
      errors.push(`無効な reliability.stars: ${result.reliability.stars} (範囲: 1-5)`);
    }
  }

  // allScores フィールドの検証
  if (!result.allScores || typeof result.allScores !== 'object') {
    errors.push('allScores フィールドが存在しないか、オブジェクトではありません');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * localStorage形式からZustand形式への変換
 */
export function convertToZustandFormat(data: LocalStorageTaihekiResult): TaihekiResult {
  const primaryType = parseInt(data.primary.type.replace('type', ''));
  const secondaryType = parseInt(data.secondary.type.replace('type', ''));

  return {
    primary: primaryType,
    secondary: secondaryType,
    confidence: data.reliability.value,
    characteristics: [
      data.primary.name,
      data.primary.subtitle,
      data.secondary.name,
      data.secondary.subtitle
    ].filter(Boolean)
  };
}

/**
 * 体癖診断結果の完全な検証と変換
 */
export function parseAndValidateTaihekiResult(jsonString: string | null): {
  success: boolean;
  result?: TaihekiResult;
  validation?: ValidationResult;
  error?: string;
} {
  if (!jsonString) {
    return {
      success: false,
      error: 'データが存在しません'
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return {
      success: false,
      error: `JSONパースエラー: ${e instanceof Error ? e.message : String(e)}`
    };
  }

  const validation = validateTaihekiResult(parsed);

  if (!validation.isValid) {
    return {
      success: false,
      validation,
      error: `バリデーションエラー: ${validation.errors.join(', ')}`
    };
  }

  try {
    const result = convertToZustandFormat(parsed as LocalStorageTaihekiResult);
    return {
      success: true,
      result,
      validation
    };
  } catch (e) {
    return {
      success: false,
      validation,
      error: `変換エラー: ${e instanceof Error ? e.message : String(e)}`
    };
  }
}
