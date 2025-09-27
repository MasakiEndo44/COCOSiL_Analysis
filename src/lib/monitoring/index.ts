/**
 * Monitoring System Entry Point
 * Exports all monitoring utilities and hooks
 */

// Core monitoring system
export { collector, useMonitoring } from './collector';
export { metricQueue, rumCollector, RUMCollector } from './queue';
export { aggregator } from './aggregator';

// Middleware and wrappers
export {
  withMonitoring,
  withAPIMonitoring,
  withOpenAIMonitoring,
  withErrorBoundaryMonitoring,
  useRouteMonitoring,
  edgeConfig,
  routeConfig,
} from './middleware';

// Types and schemas
export type {
  MetricData,
  PerformanceMetric,
  APIMetric,
  UserMetric,
  ErrorMetric,
  DiagnosisMetric,
  SystemMetric,
  AllMetrics,
  MetricSummary,
  Alert,
  AlertRule,
  MetricType,
  UserAction,
} from './schema';

export {
  STORAGE_KEYS,
  RETENTION,
  THRESHOLDS,
} from './schema';

/**
 * Initialize monitoring system
 * Call this in your app initialization
 */
export function initializeMonitoring(config?: {
  enableRUM?: boolean;
  enableErrorTracking?: boolean;
  flushInterval?: number;
  batchSize?: number;
}) {
  const {
    enableRUM = true,
    enableErrorTracking = true,
    flushInterval = 30000,
    batchSize = 50,
  } = config || {};

  console.log('[Monitoring] Initializing monitoring system...');

  // Initialize RUM collector on client
  if (typeof window !== 'undefined' && enableRUM) {
    console.log('[Monitoring] RUM collector initialized');
  }

  // Set up global error handling
  if (typeof window !== 'undefined' && enableErrorTracking) {
    window.addEventListener('error', (event) => {
      collector.collectError(
        new Error(event.message),
        {
          route: window.location.pathname,
          component: 'global',
          sessionId: sessionStorage.getItem('cocosil-session-id') || undefined,
          severity: 'medium',
        }
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      collector.collectError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          route: window.location.pathname,
          component: 'promise',
          sessionId: sessionStorage.getItem('cocosil-session-id') || undefined,
          severity: 'high',
        }
      );
    });

    console.log('[Monitoring] Global error tracking initialized');
  }

  // Set up periodic flush
  if (typeof window !== 'undefined') {
    setInterval(() => {
      metricQueue.flush();
    }, flushInterval);
  }

  console.log('[Monitoring] System initialized successfully');
}

/**
 * Monitoring status and health check
 */
export function getMonitoringStatus() {
  return {
    collector: collector.getStats(),
    queue: metricQueue.getStats(),
    aggregator: {
      activeAlerts: aggregator.getActiveAlerts().length,
      alertRules: aggregator.getAlertRules().length,
    },
    system: {
      initialized: true,
      timestamp: Date.now(),
    },
  };
}

/**
 * Emergency monitoring shutdown
 */
export function shutdownMonitoring() {
  console.log('[Monitoring] Shutting down monitoring system...');
  
  // Flush remaining metrics
  metricQueue.flush();
  
  // Clean up collectors
  collector.reset();
  metricQueue.clear();
  
  // Disconnect RUM collector
  if (typeof window !== 'undefined') {
    rumCollector.disconnect();
  }
  
  console.log('[Monitoring] System shutdown complete');
}

/**
 * Quick monitoring utilities for common use cases
 */
export const monitor = {
  /**
   * Track user action with simplified interface
   */
  action: (action: UserAction, result: 'success' | 'error' | 'abandon' = 'success') => {
    if (typeof window === 'undefined') return;
    
    collector.collectUserAction({
      action,
      page: window.location.pathname,
      result,
      sessionId: sessionStorage.getItem('cocosil-session-id') || undefined,
    });
  },

  /**
   * Track diagnosis progress
   */
  diagnosis: (
    type: 'mbti' | 'taiheki' | 'fortune' | 'integrated',
    step: string,
    completed: boolean,
    duration?: number
  ) => {
    collector.collectDiagnosisStep({
      type,
      step,
      completed,
      duration: duration || 0,
      sessionId: typeof window !== 'undefined' 
        ? sessionStorage.getItem('cocosil-session-id') || undefined 
        : undefined,
    });
  },

  /**
   * Track error with simplified interface
   */
  error: (error: Error, component?: string, severity?: 'low' | 'medium' | 'high' | 'critical') => {
    collector.collectError(error, {
      component,
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      sessionId: typeof window !== 'undefined' 
        ? sessionStorage.getItem('cocosil-session-id') || undefined 
        : undefined,
      severity: severity || 'medium',
    });
  },

  /**
   * Track API call
   */
  api: (endpoint: string, duration: number, status: number, error?: string) => {
    const metric = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'api' as const,
      value: duration,
      tags: {
        endpoint,
        status: status.toString(),
      },
      sessionId: typeof window !== 'undefined' 
        ? sessionStorage.getItem('cocosil-session-id') || undefined 
        : undefined,
      details: {
        endpoint,
        method: 'POST',
        status,
        duration,
        errorType: error,
      },
    };

    metricQueue.enqueue(metric);
  },

  /**
   * Flush metrics immediately
   */
  flush: () => metricQueue.flush(),

  /**
   * Get current monitoring stats
   */
  status: () => getMonitoringStatus(),
};

/**
 * Development utilities
 */
export const dev = {
  /**
   * Log monitoring stats to console
   */
  logStats: () => {
    const status = getMonitoringStatus();
    console.table({
      'Queue Size': status.queue.queueSize,
      'Is Processing': status.queue.isProcessing,
      'Active Requests': status.collector.activeRequests,
      'Active Alerts': status.aggregator.activeAlerts,
      'Alert Rules': status.aggregator.alertRules,
    });
  },

  /**
   * Generate test metrics
   */
  generateTestMetrics: (count: number = 10) => {
    for (let i = 0; i < count; i++) {
      monitor.action('page_view');
      monitor.api('/api/test', Math.random() * 1000, 200);
    }
    console.log(`Generated ${count} test metrics`);
  },

  /**
   * Simulate error for testing
   */
  simulateError: (severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    monitor.error(new Error('Test error for monitoring'), 'test-component', severity);
    console.log(`Simulated ${severity} error`);
  },
};

// Default export for convenience
export default {
  initialize: initializeMonitoring,
  monitor,
  status: getMonitoringStatus,
  shutdown: shutdownMonitoring,
  dev,
};