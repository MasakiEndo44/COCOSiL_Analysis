/**
 * APIユーティリティ v2.0
 * 統一されたエラーハンドリング、リクエスト追跡、パフォーマンス監視
 */

import { NextResponse } from 'next/server';
import { 
  ApiSuccessResponse, 
  ApiErrorResponse, 
  ApiError, 
  ApiMetadata,
  RequestContext,
  PerformanceMetrics,
  ErrorCode,
  ApiVersion 
} from '@/types/api';

// リクエストIDジェネレーター
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// タイムスタンプ生成（ISO 8601形式）
export function generateTimestamp(): string {
  return new Date().toISOString();
}

// リクエストコンテキスト作成
export function createRequestContext(endpoint: string, method: string = 'POST'): RequestContext {
  return {
    id: generateRequestId(),
    startTime: performance.now(),
    endpoint,
    method
  };
}

// APIメタデータ作成
export function createApiMetadata(
  context: RequestContext,
  version: ApiVersion = ApiVersion.V2
): ApiMetadata {
  return {
    requestId: context.id,
    timestamp: generateTimestamp(),
    version,
    processingTimeMs: Math.round(performance.now() - context.startTime),
    endpoint: context.endpoint
  };
}

// 成功レスポンス作成
export function createSuccessResponse<T>(
  data: T,
  context: RequestContext,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    metadata: createApiMetadata(context)
  };

  return NextResponse.json(response, { status });
}

// エラーレスポンス作成
export function createErrorResponse(
  error: ApiError,
  context: RequestContext
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
    metadata: createApiMetadata(context)
  };

  // エラーログ出力
  console.error(`[${context.id}] API Error:`, {
    code: error.code,
    message: error.message,
    endpoint: context.endpoint,
    processingTime: response.metadata.processingTimeMs
  });

  return NextResponse.json(response, { status: error.httpStatus });
}

// エラー作成ヘルパー
export function createApiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, any>,
  retryable: boolean = false
): ApiError {
  const httpStatusMap: Record<string, number> = {
    // 10xxx: Bad Request
    '10001': 400, '10002': 400, '10003': 400, '10004': 400, '10005': 400,
    // 20xxx: Unprocessable Entity
    '20001': 422, '20002': 422, '20003': 422, '20004': 422,
    // 30xxx: Internal Server Error
    '30001': 500, '30002': 503, '30003': 502, '30004': 504, '30005': 429,
    // 40xxx: Authentication/Authorization
    '40001': 401, '40003': 403, '40004': 401
  };

  return {
    code,
    message,
    details,
    retryable,
    httpStatus: httpStatusMap[code] || 500
  };
}

// 入力値バリデーション
export interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export function validateInput<T extends Record<string, any>>(
  input: T,
  rules: ValidationRule<T>[]
): ApiError | null {
  for (const rule of rules) {
    const value = input[rule.field];
    
    // 必須チェック
    if (rule.required && (value === undefined || value === null || value === '')) {
      return createApiError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        `必須フィールド '${String(rule.field)}' が指定されていません`,
        { field: rule.field }
      );
    }
    
    // 型チェック
    if (value !== undefined && rule.type) {
      if (rule.type === 'number' && (isNaN(Number(value)) || typeof Number(value) !== 'number')) {
        return createApiError(
          ErrorCode.INVALID_NUMERIC_VALUE,
          `フィールド '${String(rule.field)}' は数値である必要があります`,
          { field: rule.field, value }
        );
      }
    }
    
    // 範囲チェック
    if (value !== undefined && rule.type === 'number') {
      const numValue = Number(value);
      if (rule.min !== undefined && numValue < rule.min) {
        return createApiError(
          ErrorCode.DATE_OUT_OF_RANGE,
          `フィールド '${String(rule.field)}' は ${rule.min} 以上である必要があります`,
          { field: rule.field, value, min: rule.min }
        );
      }
      if (rule.max !== undefined && numValue > rule.max) {
        return createApiError(
          ErrorCode.DATE_OUT_OF_RANGE,
          `フィールド '${String(rule.field)}' は ${rule.max} 以下である必要があります`,
          { field: rule.field, value, max: rule.max }
        );
      }
    }
    
    // パターンチェック
    if (value !== undefined && rule.pattern && !rule.pattern.test(String(value))) {
      return createApiError(
        ErrorCode.INVALID_INPUT,
        `フィールド '${String(rule.field)}' の形式が正しくありません`,
        { field: rule.field, value, pattern: rule.pattern.source }
      );
    }
    
    // カスタムバリデーション
    if (value !== undefined && rule.custom && !rule.custom(value)) {
      return createApiError(
        ErrorCode.INVALID_INPUT,
        `フィールド '${String(rule.field)}' の値が無効です`,
        { field: rule.field, value }
      );
    }
  }
  
  return null;
}

// 日付バリデーション
export function validateDate(year: number, month: number, day: number): ApiError | null {
  // 基本範囲チェック
  if (year < 1900 || year > 2100) {
    return createApiError(
      ErrorCode.DATE_OUT_OF_RANGE,
      `年は 1900-2100 の範囲で入力してください`,
      { year, validRange: '1900-2100' }
    );
  }
  
  if (month < 1 || month > 12) {
    return createApiError(
      ErrorCode.DATE_OUT_OF_RANGE,
      `月は 1-12 の範囲で入力してください`,
      { month, validRange: '1-12' }
    );
  }
  
  if (day < 1 || day > 31) {
    return createApiError(
      ErrorCode.DATE_OUT_OF_RANGE,
      `日は 1-31 の範囲で入力してください`,
      { day, validRange: '1-31' }
    );
  }
  
  // 実際の日付として有効かチェック
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || 
      date.getMonth() !== month - 1 || 
      date.getDate() !== day) {
    return createApiError(
      ErrorCode.INVALID_DATE_FORMAT,
      `存在しない日付です`,
      { year, month, day }
    );
  }
  
  return null;
}

// パフォーマンス監視
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private startTime: number;
  
  constructor() {
    this.startTime = performance.now();
  }
  
  markDbLookupStart(): void {
    this.metrics.dbLookupTime = performance.now();
  }
  
  markDbLookupEnd(): void {
    if (this.metrics.dbLookupTime) {
      this.metrics.dbLookupTime = performance.now() - this.metrics.dbLookupTime;
    }
  }
  
  markCalculationStart(): void {
    this.metrics.calculationTime = performance.now();
  }
  
  markCalculationEnd(): void {
    if (this.metrics.calculationTime) {
      this.metrics.calculationTime = performance.now() - this.metrics.calculationTime;
    }
  }
  
  setCacheHit(hit: boolean): void {
    this.metrics.cacheHit = hit;
  }
  
  getMetrics(): PerformanceMetrics {
    return {
      dbLookupTime: this.metrics.dbLookupTime || 0,
      calculationTime: this.metrics.calculationTime || 0,
      totalProcessingTime: performance.now() - this.startTime,
      cacheHit: this.metrics.cacheHit || false,
      memoryUsage: 0 // Edge Runtime doesn't support process.memoryUsage()
    };
  }
}

// レート制限チェック（簡易版）
const requestCounts = new Map<string, { count: number, resetTime: number }>();

export function checkRateLimit(clientId: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const clientData = requestCounts.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (clientData.count >= maxRequests) {
    return false;
  }
  
  clientData.count++;
  return true;
}