/**
 * @jest-environment node
 */

import {
  COCOSiLError,
  ErrorCode,
  ErrorContext,
  getErrorPriority,
  isCriticalError,
  requiresImmediateAlert
} from '@/lib/error/errorTypes';

import {
  getRecoveryStrategy,
  attemptAutoRecovery,
  getOpenAIRecoveryStrategy,
  getDiagnosisDataRecoveryStrategy
} from '@/lib/error/recoveryStrategies';

import { logger, createRequestLogger } from '@/lib/error/logger';

describe('Error Handling System', () => {
  describe('COCOSiLError Class', () => {
    test('should create error with all properties', () => {
      const context = {
        user: { id: 'user123', age: 25 },
        request: {
          traceId: 'trace123',
          requestId: 'req123',
          route: '/api/test',
          method: 'POST',
          timestamp: new Date()
        }
      };

      const error = new COCOSiLError(
        'Integration',
        'high',
        ErrorCode.OPENAI_API_ERROR,
        'openai.connectionFailed',
        context
      );

      expect(error.type).toBe('Integration');
      expect(error.severity).toBe('high');
      expect(error.code).toBe(ErrorCode.OPENAI_API_ERROR);
      expect(error.messageKey).toBe('openai.connectionFailed');
      expect(error.context).toEqual(context);
      expect(error.id).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    test('should generate structured log entry', () => {
      const error = new COCOSiLError(
        'Security',
        'critical',
        ErrorCode.SUSPICIOUS_ACTIVITY,
        'security.suspiciousActivity'
      );

      const logEntry = error.toLogEntry();

      expect(logEntry).toHaveProperty('id');
      expect(logEntry).toHaveProperty('type', 'Security');
      expect(logEntry).toHaveProperty('severity', 'critical');
      expect(logEntry).toHaveProperty('code', ErrorCode.SUSPICIOUS_ACTIVITY);
      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should generate API response format', () => {
      const error = new COCOSiLError(
        'Operational',
        'moderate',
        ErrorCode.VALIDATION_FAILED,
        'validation.emailInvalid'
      );

      const apiResponse = error.toApiResponse();

      expect(apiResponse.success).toBe(false);
      expect(apiResponse.error).toHaveProperty('id');
      expect(apiResponse.error).toHaveProperty('code', ErrorCode.VALIDATION_FAILED);
      expect(apiResponse.error).toHaveProperty('messageKey', 'validation.emailInvalid');
      expect(apiResponse.error).toHaveProperty('severity', 'moderate');
    });

    test('should sanitize sensitive context data', () => {
      const sensitiveContext = {
        user: { id: 'user123@example.com', age: 25 },
        api: { endpoint: 'https://api.openai.com/v1/chat?api_key=secret123' },
        request: {
          traceId: 'trace123',
          requestId: 'req123',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          route: '/api/test',
          method: 'POST',
          timestamp: new Date()
        }
      };

      const error = new COCOSiLError(
        'Integration',
        'high',
        ErrorCode.OPENAI_API_ERROR,
        'openai.error',
        sensitiveContext
      );

      const logEntry = error.toLogEntry();
      const sanitizedContext = logEntry.context;

      // ユーザーIDがハッシュ化されている
      expect(sanitizedContext.user.id).not.toBe('user123@example.com');
      expect(sanitizedContext.user.id).toMatch(/^user_[A-Za-z0-9+/=]+$/);

      // APIエンドポイントの機密情報がマスクされている
      expect(sanitizedContext.api.endpoint).toBe('https://api.openai.com/v1/chat?api_key=***');

      // IPアドレスがマスクされている
      expect(sanitizedContext.request.ip).toBe('192.168.1.***');

      // ユーザーエージェントがマスクされている
      expect(sanitizedContext.request.userAgent).toBe('masked');
    });
  });

  describe('Error Priority System', () => {
    test('should calculate correct priority scores', () => {
      expect(getErrorPriority('Security', 'critical')).toBe(10);
      expect(getErrorPriority('Infrastructure', 'high')).toBe(8);
      expect(getErrorPriority('Operational', 'low')).toBe(1);
    });

    test('should identify critical errors', () => {
      const criticalError = new COCOSiLError(
        'Security',
        'critical',
        ErrorCode.SUSPICIOUS_ACTIVITY,
        'security.critical'
      );

      const moderateError = new COCOSiLError(
        'Operational',
        'moderate',
        ErrorCode.VALIDATION_FAILED,
        'validation.failed'
      );

      expect(isCriticalError(criticalError)).toBe(true);
      expect(isCriticalError(moderateError)).toBe(false);
    });

    test('should identify errors requiring immediate alerts', () => {
      const securityError = new COCOSiLError(
        'Security',
        'moderate',
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'security.rateLimit'
      );

      const infrastructureCritical = new COCOSiLError(
        'Infrastructure',
        'critical',
        ErrorCode.EDGE_RUNTIME_ERROR,
        'infrastructure.critical'
      );

      const operationalError = new COCOSiLError(
        'Operational',
        'high',
        ErrorCode.VALIDATION_FAILED,
        'validation.failed'
      );

      expect(requiresImmediateAlert(securityError)).toBe(true);
      expect(requiresImmediateAlert(infrastructureCritical)).toBe(true);
      expect(requiresImmediateAlert(operationalError)).toBe(false);
    });
  });

  describe('Recovery Strategies', () => {
    test('should provide OpenAI recovery strategy for rate limit', () => {
      const rateLimitError = { code: 'rate_limit_exceeded', status: 429 };
      const strategy = getOpenAIRecoveryStrategy(rateLimitError, 0);

      expect(strategy.canRecover).toBe(true);
      expect(strategy.autoRetry).toBeDefined();
      expect(strategy.autoRetry!.maxAttempts).toBe(2);
      expect(strategy.autoRetry!.backoffMs).toBe(60000);
      expect(strategy.fallback).toBeDefined();
      expect(strategy.fallback!.type).toBe('alternative');
      expect(strategy.userAction).toBeDefined();
      expect(strategy.userAction!.buttons).toHaveLength(2);
    });

    test('should provide OpenAI recovery strategy for timeout', () => {
      const timeoutError = { name: 'AbortError' };
      const strategy = getOpenAIRecoveryStrategy(timeoutError, 0);

      expect(strategy.canRecover).toBe(true);
      expect(strategy.autoRetry).toBeDefined();
      expect(strategy.autoRetry!.maxAttempts).toBe(3);
      expect(strategy.autoRetry!.exponential).toBe(true);
    });

    test('should provide diagnosis data recovery strategy', () => {
      const missingFields = ['mbti', 'taiheki'];
      const strategy = getDiagnosisDataRecoveryStrategy(missingFields);

      expect(strategy.canRecover).toBe(true);
      expect(strategy.userAction).toBeDefined();
      expect(strategy.userAction!.message).toContain('mbti、taiheki');
      expect(strategy.userAction!.buttons).toHaveLength(2);
    });

    test('should get recovery strategy from COCOSiLError', () => {
      const error = new COCOSiLError(
        'Integration',
        'moderate',
        ErrorCode.OPENAI_RATE_LIMIT,
        'openai.rateLimit'
      );

      const strategy = getRecoveryStrategy(error);

      expect(strategy.canRecover).toBe(true);
      expect(strategy.autoRetry).toBeDefined();
    });
  });

  describe('Auto Recovery', () => {
    test('should successfully recover on retry', async () => {
      let attemptCount = 0;
      const mockAction = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('First attempt fails');
        }
        return 'success';
      });

      const error = new COCOSiLError(
        'Integration',
        'moderate',
        ErrorCode.OPENAI_TIMEOUT,
        'openai.timeout'
      );

      const result = await attemptAutoRecovery(error, mockAction);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(mockAction).toHaveBeenCalledTimes(2);
    });

    test('should fail after max attempts', async () => {
      const mockAction = jest.fn().mockRejectedValue(new Error('Always fails'));

      const error = new COCOSiLError(
        'Integration',
        'moderate',
        ErrorCode.OPENAI_TIMEOUT,
        'openai.timeout'
      );

      const result = await attemptAutoRecovery(error, mockAction);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockAction).toHaveBeenCalledTimes(3); // maxAttempts for timeout
    });

    test('should not attempt recovery for non-recoverable errors', async () => {
      const mockAction = jest.fn();

      const error = new COCOSiLError(
        'Security',
        'critical',
        ErrorCode.SUSPICIOUS_ACTIVITY,
        'security.suspicious'
      );

      const result = await attemptAutoRecovery(error, mockAction);

      expect(result.success).toBe(false);
      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe('Logger Integration', () => {
    test('should create request logger with context', () => {
      const context = {
        traceId: 'trace123',
        requestId: 'req123',
        route: '/api/test',
        method: 'POST',
        timestamp: new Date()
      };

      const requestLogger = createRequestLogger(context);
      
      expect(requestLogger.getRequestContext()).toEqual(context);
    });

    test('should log COCOSiLError properly', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = new COCOSiLError(
        'Integration',
        'high',
        ErrorCode.OPENAI_API_ERROR,
        'openai.error'
      );

      logger.error(error);

      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('should log regular errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = new Error('Regular error');
      logger.error(error);

      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('should log performance metrics', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      logger.performance('API call', 150);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance: API call'),
        expect.objectContaining({
          performance: expect.objectContaining({
            operation: 'API call',
            duration: 150
          })
        })
      );
      
      consoleSpy.mockRestore();
    });

    test('should log user actions', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      logger.userAction('diagnosis_started', 'user123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('User action: diagnosis_started'),
        expect.objectContaining({
          user: expect.objectContaining({
            action: 'diagnosis_started'
          })
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined context gracefully', () => {
      const error = new COCOSiLError(
        'Operational',
        'low',
        ErrorCode.VALIDATION_FAILED,
        'validation.failed',
        undefined
      );

      const logEntry = error.toLogEntry();
      expect(logEntry.context).toBeUndefined();
    });

    test('should handle null cause gracefully', () => {
      const error = new COCOSiLError(
        'Operational',
        'low',
        ErrorCode.VALIDATION_FAILED,
        'validation.failed',
        {},
        null
      );

      const logEntry = error.toLogEntry();
      expect(logEntry.cause).toBeNull();
    });

    test('should handle complex nested context', () => {
      const complexContext: ErrorContext = {
        user: {
          id: 'user123',
          age: 30,
          sessionId: 'session123'
        },
        api: {
          provider: 'openai',
          endpoint: '/api/chat',
          retryCount: 2
        }
      };

      const error = new COCOSiLError(
        'Operational',
        'low',
        ErrorCode.VALIDATION_FAILED,
        'validation.failed',
        complexContext
      );

      const logEntry = error.toLogEntry();

      // Context should be preserved
      expect(logEntry.context.user?.id).toBe('user123');
      expect(logEntry.context.user?.age).toBe(30);

      // API context should be preserved
      expect(logEntry.context.api?.provider).toBe('openai');
      expect(logEntry.context.api?.endpoint).toBe('/api/chat');
    });
  });
});