/**
 * COCOSiL Error Handling System - Main Export
 * 統一エラーハンドリングシステムの統合エクスポート
 */

// Core Error Types and Classes
export * from './errorTypes';

// Recovery Strategies
export * from './recoveryStrategies';

// Structured Logger
export * from './logger';

// API Wrapper with Error Handling
export * from './apiWrapper';

// Convenience re-exports for common usage
export {
  COCOSiLError,
  ErrorCode,
  type ErrorType,
  type ErrorSeverity,
  type RequestContext,
  type RecoveryStrategy
} from './errorTypes';

export {
  getRecoveryStrategy,
  attemptAutoRecovery,
  getOpenAIRecoveryStrategy
} from './recoveryStrategies';

export {
  logger,
  createRequestLogger,
  logError,
  logInfo,
  logPerformance,
  logUserAction
} from './logger';

export {
  withErrorBoundary,
  withValidation,
  withAuth,
  withRateLimit,
  createApiError,
  type ApiHandler,
  type ApiContext,
  type ApiResponse
} from './apiWrapper';

// Quick Setup Helpers
export const createDiagnosisError = (
  messageKey: string,
  context?: Record<string, any>
) => new COCOSiLError(
  'Domain',
  'moderate',
  ErrorCode.DIAGNOSIS_CALCULATION_FAILED,
  messageKey,
  context
);

export const createValidationError = (
  field: string,
  message: string,
  context?: Record<string, any>
) => new COCOSiLError(
  'Operational',
  'low',
  ErrorCode.VALIDATION_FAILED,
  message,
  { field, ...context }
);

export const createOpenAIError = (
  cause: unknown,
  context?: Record<string, any>
) => new COCOSiLError(
  'Integration',
  'high',
  ErrorCode.OPENAI_API_ERROR,
  'openai.apiError',
  { ...context, cause }
);

export const createSecurityError = (
  action: string,
  context?: Record<string, any>
) => new COCOSiLError(
  'Security',
  'high',
  ErrorCode.SUSPICIOUS_ACTIVITY,
  'security.suspiciousActivity',
  { action, ...context }
);

// Error Handler Configuration
export const ERROR_HANDLER_CONFIG = {
  // 開発環境設定
  development: {
    enableConsoleLog: true,
    enableStructuredLog: true,
    enableRemoteLog: false,
    logLevel: 'debug' as const,
    showStackTrace: true,
    showSensitiveData: false // 開発でも機密データは隠す
  },
  
  // 本番環境設定
  production: {
    enableConsoleLog: false,
    enableStructuredLog: true,
    enableRemoteLog: true,
    logLevel: 'info' as const,
    showStackTrace: false,
    showSensitiveData: false
  },
  
  // テスト環境設定
  test: {
    enableConsoleLog: false,
    enableStructuredLog: false,
    enableRemoteLog: false,
    logLevel: 'error' as const,
    showStackTrace: true,
    showSensitiveData: false
  }
} as const;

// System Status for Monitoring
export const getSystemHealth = () => {
  return {
    errorHandling: {
      version: '1.0.0',
      features: [
        '5-tier error classification system',
        'Automatic recovery strategies',
        'Structured logging with sanitization',
        'Edge Runtime compatibility',
        'Real-time alerting integration',
        'Psychological safety messaging',
        'Japanese localization support'
      ],
      integrations: [
        'Zod validation',
        'Next.js API Routes',
        'OpenAI API',
        'React Error Boundaries',
        'Vercel Edge Runtime',
        'Slack/Discord webhooks'
      ]
    },
    timestamp: new Date().toISOString()
  };
};

// 実装ガイダンス
export const IMPLEMENTATION_GUIDE = {
  quickStart: {
    apiRoute: `
// API Route with error handling
import { withErrorBoundary, createApiError, ErrorCode } from '@/lib/error';
import { mySchema } from '@/lib/validation/schemas';

export const POST = withErrorBoundary(async (request, context) => {
  const { data } = request._validatedData; // Auto-validated by Zod
  
  try {
    const result = await processData(data);
    return result;
  } catch (error) {
    throw createApiError(ErrorCode.PROCESSING_FAILED, 'processing.failed', { error });
  }
}, { validateSchema: mySchema, rateLimit: { maxRequests: 10, windowMs: 60000 } });
    `,
    
    component: `
// React Component with error boundary
import { ErrorBoundary, useErrorHandler } from '@/ui/components/error/ErrorBoundary';

export function MyComponent() {
  const { reportError } = useErrorHandler();
  
  const handleError = (error: unknown) => {
    reportError(error, { component: 'MyComponent', action: 'userAction' });
  };
  
  return (
    <ErrorBoundary>
      <ComponentContent onError={handleError} />
    </ErrorBoundary>
  );
}
    `,
    
    logging: `
// Structured logging
import { logger, logUserAction, logPerformance } from '@/lib/error';

// Performance monitoring
const start = Date.now();
const result = await expensiveOperation();
logPerformance('expensiveOperation', Date.now() - start, { result });

// User action tracking
logUserAction('diagnosis_completed', userId, { diagnosisType: 'mbti' });

// Error logging
try {
  await riskyOperation();
} catch (error) {
  logger.error(error, { operation: 'riskyOperation', context });
}
    `
  },
  
  bestPractices: [
    'Always use COCOSiLError for application errors',
    'Provide recovery strategies for user-facing errors',
    'Include context information for debugging',
    'Use appropriate error severity levels',
    'Test error boundaries and recovery flows',
    'Monitor error patterns and frequencies',
    'Keep error messages user-friendly and psychological safe',
    'Sanitize sensitive data in logs',
    'Use structured logging for observability',
    'Implement graceful degradation for non-critical features'
  ],
  
  troubleshooting: {
    'Error not being caught': 'Check Error Boundary placement and error throwing location',
    'Recovery not working': 'Verify recovery strategy configuration and canRecover flag',
    'Logs not appearing': 'Check logger configuration and environment settings',
    'Performance impact': 'Review log levels and disable console logging in production',
    'Memory leaks': 'Ensure proper cleanup of error contexts and remove old entries from rate limit map'
  }
} as const;