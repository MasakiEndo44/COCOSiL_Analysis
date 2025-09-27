/**
 * Monitoring Data Collector
 * Centralized collection of metrics across the application
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  AllMetrics, 
  APIMetric, 
  ErrorMetric, 
  DiagnosisMetric,
  UserMetric,
  PerformanceMetric,
  UserAction,
  THRESHOLDS 
} from './schema';
import { metricQueue } from './queue';

interface RequestContext {
  startTime: number;
  route: string;
  method: string;
  userId?: string;
  sessionId?: string;
}

class MonitoringCollector {
  private requestContexts = new Map<string, RequestContext>();

  /**
   * Start API request monitoring
   */
  startAPIRequest(request: NextRequest, route: string): string {
    const requestId = this.generateRequestId(request);
    const context: RequestContext = {
      startTime: Date.now(),
      route,
      method: request.method,
      sessionId: this.extractSessionId(request),
      userId: this.extractUserId(request),
    };

    this.requestContexts.set(requestId, context);
    return requestId;
  }

  /**
   * Complete API request monitoring
   */
  completeAPIRequest(
    requestId: string, 
    response: NextResponse | Response,
    error?: Error
  ): void {
    const context = this.requestContexts.get(requestId);
    if (!context) return;

    const duration = Date.now() - context.startTime;
    const status = response.status || (error ? 500 : 200);

    const metric: APIMetric = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'api',
      value: duration,
      tags: {
        route: context.route,
        method: context.method,
        status: status.toString(),
      },
      sessionId: context.sessionId,
      userId: context.userId,
      details: {
        endpoint: context.route,
        method: context.method,
        status,
        duration,
        errorType: error?.name,
        retryCount: 0,
      },
    };

    metricQueue.enqueue(metric);

    // Clean up context
    this.requestContexts.delete(requestId);

    // Check performance thresholds
    if (duration > THRESHOLDS.API_RESPONSE_TIME) {
      this.collectSlowAPIAlert(context.route, duration);
    }
  }

  /**
   * Collect error metrics
   */
  collectError(error: Error, context: {
    route?: string;
    component?: string;
    userId?: string;
    sessionId?: string;
    recovered?: boolean;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): void {
    const metric: ErrorMetric = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'error',
      value: 1,
      tags: {
        errorType: error.name,
        route: context.route || 'unknown',
        component: context.component || 'unknown',
        severity: context.severity || 'medium',
      },
      sessionId: context.sessionId,
      userId: context.userId,
      details: {
        errorType: error.name,
        message: error.message.substring(0, 500), // Truncate long messages
        stack: error.stack?.substring(0, 1000), // Truncate stack trace
        component: context.component,
        route: context.route || 'unknown',
        recovered: context.recovered || false,
        severity: context.severity || 'medium',
      },
    };

    metricQueue.enqueue(metric);
  }

  /**
   * Collect diagnosis step metrics
   */
  collectDiagnosisStep(params: {
    type: 'mbti' | 'taiheki' | 'fortune' | 'integrated';
    step: string;
    duration: number;
    completed: boolean;
    accuracy?: number;
    userId?: string;
    sessionId?: string;
  }): void {
    const metric: DiagnosisMetric = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'diagnosis',
      value: params.duration,
      tags: {
        diagnosisType: params.type,
        step: params.step,
        completed: params.completed.toString(),
      },
      sessionId: params.sessionId,
      userId: params.userId,
      details: {
        diagnosisType: params.type,
        step: params.step,
        duration: params.duration,
        completed: params.completed,
        accuracy: params.accuracy,
      },
    };

    metricQueue.enqueue(metric);
  }

  /**
   * Collect user action metrics
   */
  collectUserAction(params: {
    action: UserAction;
    page: string;
    component?: string;
    duration?: number;
    result: 'success' | 'error' | 'abandon';
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): void {
    const metric: UserMetric = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'user',
      value: params.duration || 0,
      tags: {
        action: params.action,
        page: params.page,
        result: params.result,
        component: params.component || 'unknown',
      },
      sessionId: params.sessionId,
      userId: params.userId,
      details: {
        action: params.action,
        page: params.page,
        component: params.component,
        duration: params.duration,
        result: params.result,
      },
    };

    metricQueue.enqueue(metric);
  }

  /**
   * Collect performance metrics
   */
  collectPerformance(params: {
    route: string;
    method: string;
    duration: number;
    memory?: number;
    cpu?: number;
    userId?: string;
    sessionId?: string;
  }): void {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'performance',
      value: params.duration,
      tags: {
        route: params.route,
        method: params.method,
      },
      sessionId: params.sessionId,
      userId: params.userId,
      details: {
        route: params.route,
        method: params.method,
        duration: params.duration,
        memory: params.memory,
        cpu: params.cpu,
      },
    };

    metricQueue.enqueue(metric);
  }

  /**
   * Collect OpenAI API specific metrics
   */
  collectOpenAIMetric(params: {
    endpoint: string;
    model: string;
    tokens: {
      prompt: number;
      completion: number;
      total: number;
    };
    duration: number;
    cost?: number;
    error?: string;
    sessionId?: string;
  }): void {
    const metric: APIMetric = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'api',
      value: params.duration,
      tags: {
        service: 'openai',
        endpoint: params.endpoint,
        model: params.model,
        tokens: params.tokens.total.toString(),
      },
      sessionId: params.sessionId,
      details: {
        endpoint: params.endpoint,
        method: 'POST',
        status: params.error ? 500 : 200,
        duration: params.duration,
        errorType: params.error,
      },
    };

    metricQueue.enqueue(metric);
  }

  /**
   * Collect slow API alert
   */
  private collectSlowAPIAlert(route: string, duration: number): void {
    this.collectError(
      new Error(`Slow API response: ${duration}ms`),
      {
        route,
        severity: duration > THRESHOLDS.API_RESPONSE_TIME * 2 ? 'high' : 'medium',
        recovered: true,
      }
    );
  }

  /**
   * Extract session ID from request
   */
  private extractSessionId(request: NextRequest): string {
    // Try cookie first
    const sessionCookie = request.cookies.get('cocosil-session');
    if (sessionCookie) return sessionCookie.value;

    // Try header
    const sessionHeader = request.headers.get('x-session-id');
    if (sessionHeader) return sessionHeader;

    // Generate new session ID
    return `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract user ID from request
   */
  private extractUserId(request: NextRequest): string | undefined {
    // Try JWT token
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Simple JWT decode (in production, use proper JWT library)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      } catch {
        // Ignore JWT parsing errors
      }
    }

    // Try cookie
    const userCookie = request.cookies.get('cocosil-user');
    if (userCookie) return userCookie.value;

    return undefined;
  }

  /**
   * Generate request ID
   */
  private generateRequestId(request: NextRequest): string {
    const url = new URL(request.url);
    return `${request.method}-${url.pathname}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Generate unique metric ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get collector statistics
   */
  getStats(): {
    activeRequests: number;
    queueStats: ReturnType<typeof metricQueue.getStats>;
  } {
    return {
      activeRequests: this.requestContexts.size,
      queueStats: metricQueue.getStats(),
    };
  }

  /**
   * Flush all pending metrics
   */
  async flush(): Promise<void> {
    await metricQueue.flush();
  }

  /**
   * Clear all contexts and flush queue
   */
  reset(): void {
    this.requestContexts.clear();
    metricQueue.clear();
  }
}

// Singleton instance
export const collector = new MonitoringCollector();

/**
 * Express/Next.js middleware for automatic API monitoring
 */
export function createMonitoringMiddleware() {
  return async (
    request: NextRequest,
    context: { params?: Record<string, string> }
  ) => {
    const url = new URL(request.url);
    const route = url.pathname;
    
    // Skip monitoring for static assets
    if (route.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      return undefined;
    }

    const requestId = collector.startAPIRequest(request, route);
    
    // Store request ID in headers for downstream use
    const headers = new Headers();
    headers.set('x-request-id', requestId);
    
    return {
      requestId,
      headers,
    };
  };
}

/**
 * Hook for React components to track user actions
 */
export function useMonitoring() {
  const trackAction = (
    action: UserAction,
    details: {
      component?: string;
      duration?: number;
      result?: 'success' | 'error' | 'abandon';
      metadata?: Record<string, any>;
    } = {}
  ) => {
    if (typeof window === 'undefined') return;

    collector.collectUserAction({
      action,
      page: window.location.pathname,
      component: details.component,
      duration: details.duration,
      result: details.result || 'success',
      sessionId: sessionStorage.getItem('cocosil-session-id') || undefined,
      metadata: details.metadata,
    });
  };

  const trackDiagnosis = (
    type: 'mbti' | 'taiheki' | 'fortune' | 'integrated',
    step: string,
    params: {
      duration: number;
      completed: boolean;
      accuracy?: number;
    }
  ) => {
    collector.collectDiagnosisStep({
      type,
      step,
      ...params,
      sessionId: typeof window !== 'undefined' 
        ? sessionStorage.getItem('cocosil-session-id') || undefined 
        : undefined,
    });
  };

  const trackError = (error: Error, context?: {
    component?: string;
    recovered?: boolean;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }) => {
    collector.collectError(error, {
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      sessionId: typeof window !== 'undefined' 
        ? sessionStorage.getItem('cocosil-session-id') || undefined 
        : undefined,
      ...context,
    });
  };

  return {
    trackAction,
    trackDiagnosis,
    trackError,
  };
}

export default collector;