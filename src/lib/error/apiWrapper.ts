/**
 * COCOSiL API Wrapper with Enhanced Error Handling
 * Next.js API Routes用の統一エラーハンドリングラッパー
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { 
  COCOSiLError, 
  ErrorCode, 
  RequestContext,
  isCOCOSiLError 
} from './errorTypes';
import { getRecoveryStrategy, attemptAutoRecovery } from './recoveryStrategies';
import { createRequestLogger } from './logger';
import { validateRequestBody } from '@/lib/validation/utils';

// API Handler の型定義
export type ApiHandler<T = any> = (
  request: NextRequest,
  context: ApiContext
) => Promise<T>;

// API コンテキスト
export interface ApiContext {
  requestId: string;
  traceId: string;
  logger: ReturnType<typeof createRequestLogger>;
  startTime: number;
  params?: Record<string, string>;
}

// API レスポンス形式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    id: string;
    code: string;
    messageKey: string;
    severity: string;
    timestamp: string;
    recovery?: {
      canRecover: boolean;
      userAction?: any;
    };
  };
  metadata?: {
    requestId: string;
    traceId: string;
    duration: number;
    timestamp: string;
  };
}

// レート制限管理
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// リクエストコンテキスト生成
function createRequestContext(request: NextRequest): RequestContext {
  const traceId = request.headers.get('x-trace-id') || 
                  `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    traceId,
    requestId,
    userId: request.headers.get('x-user-id') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
    route: new URL(request.url).pathname,
    method: request.method,
    timestamp: new Date()
  };
}

// レート制限チェック
function checkRateLimit(
  clientId: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const clientLimit = rateLimitMap.get(clientId);

  if (!clientLimit || now > clientLimit.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (clientLimit.count >= maxRequests) {
    return false;
  }

  clientLimit.count++;
  return true;
}

// メイン API ラッパー
export function withErrorBoundary<T = any>(
  handler: ApiHandler<T>,
  options: {
    validateSchema?: ZodSchema;
    rateLimit?: { maxRequests: number; windowMs: number };
    requireAuth?: boolean;
    enableAutoRecovery?: boolean;
  } = {}
) {
  return async function wrappedHandler(
    request: NextRequest,
    routeParams?: { params: Record<string, string> }
  ): Promise<NextResponse> {
    const startTime = Date.now();
    const requestContext = createRequestContext(request);
    const logger = createRequestLogger(requestContext);
    
    try {
      // リクエストログ
      logger.info('API request started', {
        route: requestContext.route,
        method: requestContext.method,
        userAgent: requestContext.userAgent ? 'present' : 'none'
      });

      // レート制限チェック
      if (options.rateLimit) {
        const clientId = requestContext.ip || requestContext.userId || 'anonymous';
        if (!checkRateLimit(clientId, options.rateLimit.maxRequests, options.rateLimit.windowMs)) {
          throw new COCOSiLError(
            'Security',
            'moderate',
            ErrorCode.RATE_LIMIT_EXCEEDED,
            'api.rateLimitExceeded',
            { clientId: clientId.substring(0, 8) + '***' }
          );
        }
      }

      // 認証チェック
      if (options.requireAuth) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          throw new COCOSiLError(
            'Security',
            'moderate',
            ErrorCode.UNAUTHORIZED_ACCESS,
            'api.authRequired'
          );
        }
      }

      // リクエストボディバリデーション
      let validatedData: any;
      if (options.validateSchema && (request.method === 'POST' || request.method === 'PUT')) {
        const validation = await validateRequestBody(request, options.validateSchema);
        if (!validation.success) {
          return validation.error;
        }
        validatedData = validation.data;
      }

      // API コンテキスト作成
      const apiContext: ApiContext = {
        requestId: requestContext.requestId,
        traceId: requestContext.traceId,
        logger,
        startTime,
        params: routeParams?.params
      };

      // ハンドラー実行
      let result: T;
      try {
        // バリデーション済みデータを request に注入（擬似的）
        if (validatedData) {
          (request as any)._validatedData = validatedData;
        }
        
        result = await handler(request, apiContext);
      } catch (handlerError) {
        // 自動復旧試行
        if (options.enableAutoRecovery && isCOCOSiLError(handlerError)) {
          logger.warn('Attempting auto recovery', { error: handlerError.code });
          
          const recoveryResult = await attemptAutoRecovery(handlerError, async () => {
            return await handler(request, apiContext);
          });

          if (recoveryResult.success) {
            logger.info('Auto recovery successful');
            result = recoveryResult.result;
          } else {
            throw recoveryResult.error || handlerError;
          }
        } else {
          throw handlerError;
        }
      }

      // 成功レスポンス
      const duration = Date.now() - startTime;
      logger.performance('API request completed', duration);

      const response: ApiResponse<T> = {
        success: true,
        data: result,
        metadata: {
          requestId: requestContext.requestId,
          traceId: requestContext.traceId,
          duration,
          timestamp: new Date().toISOString()
        }
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'X-Request-ID': requestContext.requestId,
          'X-Trace-ID': requestContext.traceId,
          'X-Processing-Time': duration.toString()
        }
      });

    } catch (error) {
      return handleApiError(error, requestContext, startTime);
    }
  };
}

// エラーハンドリング関数
async function handleApiError(
  error: unknown,
  requestContext: RequestContext,
  startTime: number
): Promise<NextResponse> {
  const logger = createRequestLogger(requestContext);
  const duration = Date.now() - startTime;

  // COCOSiLError に変換
  let cocosilError: COCOSiLError;
  
  if (isCOCOSiLError(error)) {
    cocosilError = error;
  } else if (error instanceof Error) {
    // 既知のエラーパターンに基づいて分類
    cocosilError = classifyError(error, requestContext);
  } else {
    cocosilError = new COCOSiLError(
      'Infrastructure',
      'high',
      ErrorCode.EDGE_RUNTIME_ERROR,
      'api.unknownError',
      { originalError: String(error) },
      error
    );
  }

  // エラーログ記録
  logger.error(cocosilError, {
    route: requestContext.route,
    method: requestContext.method,
    duration
  });

  // エラーレスポンス構築
  const response: ApiResponse = {
    success: false,
    error: {
      id: cocosilError.id,
      code: cocosilError.code,
      messageKey: cocosilError.messageKey,
      severity: cocosilError.severity,
      timestamp: cocosilError.timestamp.toISOString(),
      recovery: cocosilError.recovery ? {
        canRecover: cocosilError.recovery.canRecover,
        userAction: cocosilError.recovery.userAction
      } : undefined
    },
    metadata: {
      requestId: requestContext.requestId,
      traceId: requestContext.traceId,
      duration,
      timestamp: new Date().toISOString()
    }
  };

  // HTTPステータスコード決定
  const statusCode = getHttpStatusCode(cocosilError);

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'X-Request-ID': requestContext.requestId,
      'X-Trace-ID': requestContext.traceId,
      'X-Error-ID': cocosilError.id,
      'X-Processing-Time': duration.toString()
    }
  });
}

// エラー分類関数
function classifyError(error: Error, context: RequestContext): COCOSiLError {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack || '';

  // OpenAI API エラー
  if (errorMessage.includes('openai') || errorMessage.includes('api')) {
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return new COCOSiLError(
        'Integration',
        'moderate',
        ErrorCode.OPENAI_RATE_LIMIT,
        'api.openai.rateLimit',
        { originalError: error.message },
        error
      );
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
      return new COCOSiLError(
        'Integration',
        'moderate',
        ErrorCode.OPENAI_TIMEOUT,
        'api.openai.timeout',
        { originalError: error.message },
        error
      );
    }

    return new COCOSiLError(
      'Integration',
      'high',
      ErrorCode.OPENAI_API_ERROR,
      'api.openai.general',
      { originalError: error.message },
      error
    );
  }

  // バリデーションエラー
  if (errorMessage.includes('validation') || errorMessage.includes('zod')) {
    return new COCOSiLError(
      'Operational',
      'low',
      ErrorCode.VALIDATION_FAILED,
      'api.validation.failed',
      { originalError: error.message },
      error
    );
  }

  // ネットワークエラー
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return new COCOSiLError(
      'Infrastructure',
      'moderate',
      ErrorCode.NETWORK_CONNECTION_ERROR,
      'api.network.connectionFailed',
      { originalError: error.message },
      error
    );
  }

  // データベースエラー
  if (errorMessage.includes('database') || errorMessage.includes('prisma') || errorMessage.includes('sql')) {
    return new COCOSiLError(
      'Infrastructure',
      'high',
      ErrorCode.DATABASE_CONNECTION_ERROR,
      'api.database.connectionFailed',
      { originalError: error.message },
      error
    );
  }

  // タイムアウトエラー
  if (errorMessage.includes('timeout') || errorStack.includes('timeout')) {
    return new COCOSiLError(
      'Infrastructure',
      'moderate',
      ErrorCode.FUNCTION_TIMEOUT,
      'api.timeout.functionTimeout',
      { originalError: error.message },
      error
    );
  }

  // デフォルト
  return new COCOSiLError(
    'Infrastructure',
    'moderate',
    ErrorCode.EDGE_RUNTIME_ERROR,
    'api.error.general',
    { originalError: error.message },
    error
  );
}

// HTTPステータスコード決定
function getHttpStatusCode(error: COCOSiLError): number {
  switch (error.code) {
    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.INVALID_INPUT_FORMAT:
    case ErrorCode.MISSING_REQUIRED_FIELD:
      return 400; // Bad Request

    case ErrorCode.UNAUTHORIZED_ACCESS:
      return 401; // Unauthorized

    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return 429; // Too Many Requests

    case ErrorCode.OPENAI_API_ERROR:
    case ErrorCode.DATABASE_CONNECTION_ERROR:
    case ErrorCode.EDGE_RUNTIME_ERROR:
      return 500; // Internal Server Error

    case ErrorCode.OPENAI_TIMEOUT:
    case ErrorCode.FUNCTION_TIMEOUT:
      return 504; // Gateway Timeout

    case ErrorCode.EXTERNAL_API_UNAVAILABLE:
      return 503; // Service Unavailable

    default:
      return error.severity === 'critical' ? 500 : 400;
  }
}

// 便利なヘルパー関数
export const createApiError = (
  code: ErrorCode,
  messageKey: string,
  context?: Record<string, any>
): COCOSiLError => {
  const typeMap: Record<string, any> = {
    VALIDATION_FAILED: ['Operational', 'low'],
    OPENAI_API_ERROR: ['Integration', 'high'],
    RATE_LIMIT_EXCEEDED: ['Security', 'moderate'],
    UNAUTHORIZED_ACCESS: ['Security', 'moderate'],
    DATABASE_CONNECTION_ERROR: ['Infrastructure', 'high'],
    EDGE_RUNTIME_ERROR: ['Infrastructure', 'high']
  };

  const [type, severity] = typeMap[code] || ['Infrastructure', 'moderate'];
  
  return new COCOSiLError(type, severity, code, messageKey, context);
};

// バリデーション付きラッパー
export const withValidation = <T>(schema: ZodSchema<T>) => 
  (handler: ApiHandler<any>) => 
    withErrorBoundary(handler, { validateSchema: schema });

// 認証付きラッパー  
export const withAuth = (handler: ApiHandler<any>) =>
  withErrorBoundary(handler, { requireAuth: true });

// レート制限付きラッパー
export const withRateLimit = (maxRequests: number = 100, windowMs: number = 60000) =>
  (handler: ApiHandler<any>) =>
    withErrorBoundary(handler, { rateLimit: { maxRequests, windowMs } });