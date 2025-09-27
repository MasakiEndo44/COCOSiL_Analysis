/**
 * COCOSiL Error Handling System
 * 統一エラー処理システムの型定義とエラークラス
 */

// エラー重要度レベル
export type ErrorSeverity = 'critical' | 'high' | 'moderate' | 'low' | 'info';

// エラー分類体系
export type ErrorType = 
  | 'Operational'     // ユーザ操作・データ欠落関連
  | 'Domain'          // 診断ロジック・ビジネスルール関連  
  | 'Integration'     // 外部API・サードパーティ連携関連
  | 'Infrastructure'  // Edge Runtime・DB・システム基盤関連
  | 'Security';       // セキュリティ・攻撃検知関連

// エラーコード体系
export enum ErrorCode {
  // Operational Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INCOMPLETE_DIAGNOSIS_DATA = 'INCOMPLETE_DIAGNOSIS_DATA',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT_FORMAT = 'INVALID_INPUT_FORMAT',
  USER_SESSION_EXPIRED = 'USER_SESSION_EXPIRED',
  
  // Domain Errors
  DIAGNOSIS_CALCULATION_FAILED = 'DIAGNOSIS_CALCULATION_FAILED',
  INVALID_MBTI_TYPE = 'INVALID_MBTI_TYPE',
  INVALID_TAIHEKI_TYPE = 'INVALID_TAIHEKI_TYPE',
  FORTUNE_CALCULATION_ERROR = 'FORTUNE_CALCULATION_ERROR',
  PSYCHOLOGICAL_SAFETY_ERROR = 'PSYCHOLOGICAL_SAFETY_ERROR',
  
  // Integration Errors
  OPENAI_API_ERROR = 'OPENAI_API_ERROR',
  OPENAI_RATE_LIMIT = 'OPENAI_RATE_LIMIT',
  OPENAI_TIMEOUT = 'OPENAI_TIMEOUT',
  EXTERNAL_API_UNAVAILABLE = 'EXTERNAL_API_UNAVAILABLE',
  NETWORK_CONNECTION_ERROR = 'NETWORK_CONNECTION_ERROR',
  
  // Infrastructure Errors
  EDGE_RUNTIME_ERROR = 'EDGE_RUNTIME_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  CACHE_OPERATION_FAILED = 'CACHE_OPERATION_FAILED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  FUNCTION_TIMEOUT = 'FUNCTION_TIMEOUT',
  
  // Security Errors
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_TAMPERING_DETECTED = 'DATA_TAMPERING_DETECTED',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID'
}

// リクエストコンテキスト
export interface RequestContext {
  traceId: string;
  requestId: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
  route: string;
  method: string;
  timestamp: Date;
}

// エラーコンテキスト
export interface ErrorContext {
  request?: RequestContext;
  user?: {
    id?: string;
    age?: number;
    sessionId?: string;
  };
  diagnosis?: {
    step?: string;
    completedSteps?: string[];
    dataAvailable?: {
      mbti: boolean;
      taiheki: boolean;
      fortune: boolean;
    };
  };
  api?: {
    provider?: string;
    endpoint?: string;
    retryCount?: number;
    rateLimitState?: {
      remaining: number;
      resetTime: number;
    };
  };
  system?: {
    memory?: number;
    cpu?: number;
    edge?: boolean;
  };
}

// 復旧戦略の定義
export interface RecoveryStrategy {
  canRecover: boolean;
  autoRetry?: {
    maxAttempts: number;
    backoffMs: number;
    exponential: boolean;
  };
  fallback?: {
    type: 'cache' | 'alternative' | 'degraded' | 'offline';
    description: string;
    action?: () => Promise<any>;
  };
  userAction?: {
    message: string;
    buttons: Array<{
      label: string;
      action: 'retry' | 'reset' | 'contact' | 'continue';
      url?: string;
    }>;
  };
}

// COCOSiL専用エラークラス
export class COCOSiLError extends Error {
  public readonly id: string;
  public readonly timestamp: Date;
  public readonly recovery?: RecoveryStrategy;

  constructor(
    public readonly type: ErrorType,
    public readonly severity: ErrorSeverity,
    public readonly code: ErrorCode,
    public readonly messageKey: string,
    public readonly context?: ErrorContext,
    public readonly cause?: unknown,
    recovery?: RecoveryStrategy
  ) {
    super(messageKey);
    this.name = 'COCOSiLError';
    this.id = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.recovery = recovery;
    
    // Error.captureStackTrace が利用可能な場合はスタックトレースを調整
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, COCOSiLError);
    }
  }

  // ログ出力用の構造化データ
  toLogEntry() {
    return {
      id: this.id,
      type: this.type,
      severity: this.severity,
      code: this.code,
      messageKey: this.messageKey,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      context: this.sanitizeContext(),
      stack: this.stack,
      cause: this.cause instanceof Error ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack
      } : this.cause
    };
  }

  // API レスポンス用の安全なデータ
  toApiResponse() {
    return {
      success: false,
      error: {
        id: this.id,
        code: this.code,
        messageKey: this.messageKey,
        severity: this.severity,
        timestamp: this.timestamp.toISOString(),
        recovery: this.recovery ? {
          canRecover: this.recovery.canRecover,
          userAction: this.recovery.userAction
        } : undefined
      }
    };
  }

  // UI表示用のデータ
  toRenderable() {
    return {
      id: this.id,
      code: this.code,
      messageKey: this.messageKey,
      severity: this.severity,
      timestamp: this.timestamp,
      recovery: this.recovery,
      isRetryable: this.recovery?.autoRetry !== undefined || 
                   this.recovery?.userAction?.buttons.some(b => b.action === 'retry')
    };
  }

  // コンテキストから機密情報を除去
  private sanitizeContext(): any {
    if (!this.context) return undefined;

    const sanitized = { ...this.context };

    // ユーザー情報のマスキング
    if (sanitized.user?.id) {
      sanitized.user.id = this.hashUserId(sanitized.user.id);
    }

    // API関連の機密情報をマスキング
    if (sanitized.api?.endpoint) {
      sanitized.api.endpoint = this.maskSensitiveUrl(sanitized.api.endpoint);
    }

    // リクエスト情報の最小化
    if (sanitized.request) {
      const { userAgent, ip, ...safeRequest } = sanitized.request;
      sanitized.request = {
        ...safeRequest,
        userAgent: userAgent ? 'masked' : undefined,
        ip: ip ? this.maskIp(ip) : undefined
      };
    }

    return sanitized;
  }

  private hashUserId(userId: string): string {
    // 簡易ハッシュ化（本番では crypto.subtle.digest 使用を推奨）
    return `user_${Buffer.from(userId).toString('base64').substring(0, 8)}`;
  }

  private maskSensitiveUrl(url: string): string {
    return url.replace(/([?&])(api_key|token|secret)=([^&]*)/g, '$1$2=***');
  }

  private maskIp(ip: string): string {
    // IPv4 の最後のオクテットをマスク
    if (ip.includes('.')) {
      const parts = ip.split('.');
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    // IPv6 の場合は最後の部分をマスク
    if (ip.includes(':')) {
      const parts = ip.split(':');
      return `${parts.slice(0, -2).join(':')}::***`;
    }
    return '***';
  }
}

// エラー優先度マトリックス
export const ERROR_PRIORITY_MATRIX: Record<ErrorType, Record<ErrorSeverity, number>> = {
  Security: {
    critical: 10, high: 9, moderate: 8, low: 7, info: 6
  },
  Infrastructure: {
    critical: 9, high: 8, moderate: 6, low: 4, info: 2
  },
  Integration: {
    critical: 8, high: 7, moderate: 5, low: 3, info: 1
  },
  Domain: {
    critical: 7, high: 6, moderate: 4, low: 2, info: 1
  },
  Operational: {
    critical: 6, high: 5, moderate: 3, low: 1, info: 1
  }
};

// 便利な型ガード
export function isCOCOSiLError(error: unknown): error is COCOSiLError {
  return error instanceof COCOSiLError;
}

// エラー重要度チェック関数
export function getErrorPriority(type: ErrorType, severity: ErrorSeverity): number {
  return ERROR_PRIORITY_MATRIX[type][severity];
}

// クリティカルエラーかどうかの判定
export function isCriticalError(error: COCOSiLError): boolean {
  return getErrorPriority(error.type, error.severity) >= 8;
}

// 即座に通知が必要かどうかの判定
export function requiresImmediateAlert(error: COCOSiLError): boolean {
  return error.type === 'Security' || 
         (error.type === 'Infrastructure' && error.severity === 'critical') ||
         isCriticalError(error);
}