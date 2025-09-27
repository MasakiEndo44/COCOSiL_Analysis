/**
 * COCOSiL Validation System
 * Comprehensive Zod-based validation for all application data
 */

// Export all schemas
export * from './schemas';

// Export all utilities
export * from './utils';

// Re-export commonly used Zod types
export { z } from 'zod';

// Validation summary for documentation
export const VALIDATION_FEATURES = {
  schemas: [
    'BasicInfo - 基本情報バリデーション',
    'MBTIResult - MBTI診断結果バリデーション', 
    'TaihekiResult - 体癖診断結果バリデーション',
    'FortuneResult - 算命学結果バリデーション',
    'ChatMessage - チャットメッセージバリデーション',
    'UserDiagnosisData - 統合診断データバリデーション',
    'API Request/Response - APIリクエスト・レスポンスバリデーション'
  ],
  utilities: [
    'validateRequestBody - Next.js API Route用リクエストバリデーション',
    'validateQueryParams - URLクエリパラメータバリデーション', 
    'formatValidationErrors - エラーメッセージフォーマット',
    'validateBirthDate - 生年月日詳細バリデーション',
    'validateDiagnosisCompleteness - 診断データ完整性チェック',
    'validatePasswordStrength - パスワード強度チェック',
    'sanitizeString - セキュリティサニタイズ',
    'escapeHtml - XSS対策エスケープ'
  ],
  features: [
    '日本語文字列対応',
    '業務ロジックバリデーション',
    '包括的エラーハンドリング',
    'TypeScript型安全性',
    'パフォーマンス最適化',
    'セキュリティ対策',
    'API統合サポート',
    'ユニットテスト完備'
  ]
} as const;