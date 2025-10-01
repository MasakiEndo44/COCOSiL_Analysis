/**
 * Performance Monitoring Middleware
 * Next.js middleware for automatic request monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { collector } from './collector';

interface MiddlewareConfig {
  excludeRoutes?: string[];
  includeStatic?: boolean;
  enableRUM?: boolean;
  monitorHeaders?: boolean;
}

const DEFAULT_CONFIG: MiddlewareConfig = {
  excludeRoutes: ['/api/health', '/favicon.ico'],
  includeStatic: false,
  enableRUM: true,
  monitorHeaders: true,
};

/**
 * Enhanced Next.js middleware with comprehensive monitoring
 */
export function withMonitoring(
  handler?: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config: MiddlewareConfig = {}
): (request: NextRequest) => Promise<NextResponse> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Skip monitoring for excluded routes
    if (mergedConfig.excludeRoutes?.some(route => pathname.startsWith(route))) {
      return handler ? await handler(request) : NextResponse.next();
    }

    // Skip static assets unless explicitly included
    if (!mergedConfig.includeStatic && isStaticAsset(pathname)) {
      return handler ? await handler(request) : NextResponse.next();
    }

    // Generate request context
    const requestId = generateRequestId();
    const sessionId = extractSessionId(request);
    const userId = extractUserId(request);

    // Start monitoring
    const monitoringId = collector.startAPIRequest(request, pathname);
    
    let response: NextResponse;
    let error: Error | undefined;

    try {
      // Execute the handler or continue with next
      response = handler ? await handler(request) : NextResponse.next();
      
      // Add monitoring headers
      if (mergedConfig.monitorHeaders) {
        response.headers.set('x-request-id', requestId);
        response.headers.set('x-response-time', (Date.now() - startTime).toString());
        
        if (sessionId) {
          response.headers.set('x-session-id', sessionId);
        }
      }

      // Add RUM script injection for HTML responses
      if (mergedConfig.enableRUM && isHTMLResponse(response)) {
        response = injectRUMScript(response, sessionId);
      }

    } catch (err) {
      error = err as Error;
      
      // Create error response
      response = NextResponse.json(
        { 
          error: 'Internal Server Error',
          requestId,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );

      // Track the error
      collector.collectError(error, {
        route: pathname,
        sessionId,
        userId,
        severity: 'high',
      });
    }

    // Complete monitoring
    collector.completeAPIRequest(monitoringId, response, error);

    // Track performance metrics
    const duration = Date.now() - startTime;
    collector.collectPerformance({
      route: pathname,
      method: request.method,
      duration,
      sessionId,
      userId,
    });

    return response;
  };
}

/**
 * API Route wrapper for automatic monitoring
 */
export function withAPIMonitoring<T extends any[], R>(
  handler: (...args: T) => Promise<Response> | Response
): (...args: T) => Promise<Response> {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now();
    let request: NextRequest | undefined;
    let pathname = 'unknown';
    
    // Extract request from arguments (typically first argument)
    if (args[0] && typeof args[0] === 'object' && 'url' in args[0]) {
      request = args[0] as NextRequest;
      pathname = new URL(request.url).pathname;
    }

    const requestId = request ? collector.startAPIRequest(request, pathname) : undefined;
    
    let response: Response;
    let error: Error | undefined;

    try {
      response = await handler(...args);
    } catch (err) {
      error = err as Error;
      
      // Create error response
      response = Response.json(
        { 
          error: 'Internal Server Error',
          requestId: requestId || generateRequestId(),
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );

      // Track the error
      if (request) {
        collector.collectError(error, {
          route: pathname,
          sessionId: extractSessionId(request),
          userId: extractUserId(request),
          severity: 'high',
        });
      }
    }

    // Complete monitoring
    if (requestId) {
      collector.completeAPIRequest(requestId, response, error);
    }

    return response;
  };
}

/**
 * OpenAI API wrapper with specific monitoring
 */
export function withOpenAIMonitoring<T extends any[], R>(
  openaiCall: (...args: T) => Promise<R>,
  config: {
    endpoint: string;
    model: string;
    getTokenCount?: (args: T, result: R) => { prompt: number; completion: number; total: number };
  }
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let result: R | undefined;
    let error: string | undefined;

    try {
      result = await openaiCall(...args);
    } catch (err) {
      error = (err as Error).message;
      throw err;
    } finally {
      const duration = Date.now() - startTime;

      // Calculate token usage if function provided (only if result exists)
      const tokens = config.getTokenCount && result !== undefined
        ? config.getTokenCount(args, result)
        : { prompt: 0, completion: 0, total: 0 };

      // Collect OpenAI-specific metrics
      collector.collectOpenAIMetric({
        endpoint: config.endpoint,
        model: config.model,
        tokens,
        duration,
        error,
      });
    }

    return result as R;
  };
}

/**
 * React Error Boundary monitoring
 */
export function withErrorBoundaryMonitoring(
  onError: (error: Error, errorInfo: { componentStack: string }) => void
): (error: Error, errorInfo: { componentStack: string }) => void {
  return (error: Error, errorInfo: { componentStack: string }) => {
    // Extract component name from stack
    const componentMatch = errorInfo.componentStack.match(/\s+in\s+([^\s]+)/);
    const component = componentMatch ? componentMatch[1] : 'Unknown';

    // Track error
    collector.collectError(error, {
      component,
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      sessionId: typeof window !== 'undefined' 
        ? sessionStorage.getItem('cocosil-session-id') || undefined 
        : undefined,
      severity: 'medium',
    });

    // Call original handler
    onError(error, errorInfo);
  };
}

// Utility functions

/**
 * Check if path is a static asset
 */
function isStaticAsset(pathname: string): boolean {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/.test(pathname) ||
         pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/static/');
}

/**
 * Check if response is HTML
 */
function isHTMLResponse(response: NextResponse): boolean {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('text/html');
}

/**
 * Inject RUM (Real User Monitoring) script
 */
function injectRUMScript(response: NextResponse, sessionId?: string): NextResponse {
  // Note: In a real implementation, you would inject the RUM script
  // This is a simplified version
  if (sessionId) {
    response.headers.set('x-rum-enabled', 'true');
    response.headers.set('x-session-id', sessionId);
  }
  
  return response;
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Extract session ID from request
 */
function extractSessionId(request: NextRequest): string | undefined {
  // Try cookie first
  const sessionCookie = request.cookies.get('cocosil-session');
  if (sessionCookie) return sessionCookie.value;

  // Try header
  const sessionHeader = request.headers.get('x-session-id');
  if (sessionHeader) return sessionHeader;

  return undefined;
}

/**
 * Extract user ID from request
 */
function extractUserId(request: NextRequest): string | undefined {
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
 * Monitoring hook for React components
 */
export function useRouteMonitoring() {
  const trackPageView = (pathname: string) => {
    if (typeof window === 'undefined') return;

    collector.collectUserAction({
      action: 'page_view',
      page: pathname,
      duration: 0,
      result: 'success',
      sessionId: sessionStorage.getItem('cocosil-session-id') || undefined,
    });
  };

  const trackRouteChange = (from: string, to: string, duration: number) => {
    if (typeof window === 'undefined') return;

    collector.collectPerformance({
      route: to,
      method: 'NAVIGATION',
      duration,
      sessionId: sessionStorage.getItem('cocosil-session-id') || undefined,
    });

    trackPageView(to);
  };

  return {
    trackPageView,
    trackRouteChange,
  };
}

/**
 * Performance monitoring configuration for Edge Runtime
 */
export const edgeConfig = {
  runtime: 'edge',
  regions: ['nrt1', 'iad1'], // Tokyo and Virginia for global coverage
};

/**
 * Monitoring configuration for specific routes
 */
export const routeConfig = {
  '/api/ai/chat': {
    timeout: 30000, // 30 seconds for AI responses
    rateLimit: { requests: 10, window: 60000 }, // 10 requests per minute
    monitoring: { includePayload: false, trackTokens: true },
  },
  '/api/fortune-calc-v2': {
    timeout: 5000, // 5 seconds for calculations
    rateLimit: { requests: 100, window: 60000 }, // 100 requests per minute
    monitoring: { includePayload: true, trackAccuracy: true },
  },
  '/api/admin/*': {
    timeout: 10000, // 10 seconds for admin operations
    rateLimit: { requests: 50, window: 60000 }, // 50 requests per minute
    monitoring: { includePayload: false, trackSecurity: true },
  },
};

export default withMonitoring;