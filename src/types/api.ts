/**
 * 統一API応答スキーマ v2.0
 * 6星占術新バージョン統合対応
 */

// 基本API応答インターface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: ApiMetadata;
}

// API成功応答
export interface ApiSuccessResponse<T> extends Omit<ApiResponse<T>, 'error'> {
  success: true;
  data: T;
}

// APIエラー応答
export interface ApiErrorResponse extends Omit<ApiResponse, 'data'> {
  success: false;
  error: ApiError;
}

// APIメタデータ
export interface ApiMetadata {
  requestId: string;
  timestamp: string;
  version: string;
  processingTimeMs: number;
  endpoint: string;
}

// エラー情報
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
  httpStatus: number;
}

// エラーコード定義
export enum ErrorCode {
  // 入力バリデーション系 (10xxx)
  INVALID_INPUT = '10001',
  MISSING_REQUIRED_FIELD = '10002',
  INVALID_DATE_FORMAT = '10003',
  DATE_OUT_OF_RANGE = '10004',
  INVALID_NUMERIC_VALUE = '10005',
  
  // ビジネスロジック系 (20xxx)
  CALCULATION_ERROR = '20001',
  UNSUPPORTED_DATE = '20002',
  DATABASE_LOOKUP_FAILED = '20003',
  DESTINY_NUMBER_NOT_FOUND = '20004',
  
  // システム系 (30xxx)
  INTERNAL_SERVER_ERROR = '30001',
  DATABASE_CONNECTION_ERROR = '30002',
  EXTERNAL_SERVICE_ERROR = '30003',
  TIMEOUT_ERROR = '30004',
  RATE_LIMIT_EXCEEDED = '30005',
  
  // 認証・認可系 (40xxx)
  UNAUTHORIZED = '40001',
  FORBIDDEN = '40003',
  API_KEY_INVALID = '40004',
}

// 算命学特化型定義
export interface FortuneCalculationRequest {
  year: number;
  month: number;
  day: number;
  timezone?: string; // デフォルト: 'Asia/Tokyo'
}

export interface FortuneCalculationData {
  age: number;
  zodiac: string;
  animal: string;
  six_star: string;
  fortune_detail: {
    birth_date: string;
    chinese_zodiac: string;
    animal_fortune: string;
    six_star_detail: string;
    personality_traits: string[];
  };
  calculation_source: 'database' | 'algorithm';
  supported_features: string[];
}

// APIバージョニング
export enum ApiVersion {
  V1 = 'v1.0.0',
  V2 = 'v2.0.0'
}

// リクエスト追跡用
export interface RequestContext {
  id: string;
  startTime: number;
  endpoint: string;
  method: string;
  userAgent?: string;
  ip?: string;
}

// パフォーマンスメトリクス
export interface PerformanceMetrics {
  dbLookupTime: number;
  calculationTime: number;
  totalProcessingTime: number;
  cacheHit: boolean;
  memoryUsage: number;
}

// キャッシュ設定
export interface CacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxSize: number;
  strategy: 'memory' | 'redis' | 'hybrid';
}