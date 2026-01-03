/**
 * Performance Monitoring Schema
 * Edge Runtime compatible monitoring data structures
 */

export interface MetricData {
  id: string;
  timestamp: number;
  type: MetricType;
  value: number;
  tags: Record<string, string>;
  sessionId?: string;
  userId?: string;
}

export interface PerformanceMetric extends MetricData {
  type: 'performance';
  details: {
    route: string;
    method: string;
    duration: number;
    memory?: number;
    cpu?: number;
  };
}

export interface APIMetric extends MetricData {
  type: 'api';
  details: {
    endpoint: string;
    method: string;
    status: number;
    duration: number;
    errorType?: string;
    retryCount?: number;
  };
}

export interface UserMetric extends MetricData {
  type: 'user';
  details: {
    action: UserAction;
    page: string;
    component?: string;
    duration?: number;
    result: 'success' | 'error' | 'abandon';
  };
}

export interface ErrorMetric extends MetricData {
  type: 'error';
  details: {
    errorType: string;
    message: string;
    stack?: string;
    component?: string;
    route: string;
    recovered: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface DiagnosisMetric extends MetricData {
  type: 'diagnosis';
  details: {
    diagnosisType: 'mbti' | 'taiheki' | 'fortune' | 'integrated';
    step: string;
    duration: number;
    completed: boolean;
    accuracy?: number;
  };
}

export interface SystemMetric extends MetricData {
  type: 'system';
  details: {
    metric: 'memory' | 'cpu' | 'latency' | 'throughput';
    value: number;
    threshold?: number;
    region?: string;
  };
}

export type MetricType = 'performance' | 'api' | 'user' | 'error' | 'diagnosis' | 'system';
export type UserAction = 
  | 'page_view' 
  | 'diagnosis_start' 
  | 'diagnosis_step' 
  | 'diagnosis_complete'
  | 'learn_chapter_view'
  | 'learn_chapter_complete'
  | 'chat_message'
  | 'form_submit'
  | 'error_recovery';

export type AllMetrics = PerformanceMetric | APIMetric | UserMetric | ErrorMetric | DiagnosisMetric | SystemMetric;

// Aggregated metrics for dashboard
export interface MetricSummary {
  period: '1h' | '24h' | '7d' | '30d';
  timestamp: number;
  metrics: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    activeUsers: number;
    completedDiagnoses: number;
    systemHealth: number; // 0-100
  };
  breakdown: {
    byRoute: Record<string, { requests: number; avgTime: number; errorRate: number }>;
    byError: Record<string, number>;
    byDiagnosis: Record<string, { started: number; completed: number; avgTime: number }>;
  };
}

// Alert configuration
export interface AlertRule {
  id: string;
  name: string;
  metric: MetricType;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  window: number; // minutes
  enabled: boolean;
  channels: ('slack' | 'discord' | 'email')[];
}

export interface Alert {
  id: string;
  ruleId: string;
  timestamp: number;
  metric: AllMetrics;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  resolved: boolean;
  resolvedAt?: number;
}

// Storage key patterns for Vercel KV
export const STORAGE_KEYS = {
  METRICS: (type: MetricType, timestamp: number) => `metrics:${type}:${Math.floor(timestamp / 60000)}`, // 1-minute buckets
  SUMMARY: (period: string, timestamp: number) => `summary:${period}:${Math.floor(timestamp / 3600000)}`, // 1-hour buckets
  ALERT: (id: string) => `alert:${id}`,
  ALERT_RULE: (id: string) => `alert_rule:${id}`,
  SESSION: (id: string) => `session:${id}`,
  USER_JOURNEY: (userId: string) => `journey:${userId}`,
} as const;

// Retention policies (in seconds)
export const RETENTION = {
  RAW_METRICS: 24 * 60 * 60, // 24 hours
  HOURLY_SUMMARY: 7 * 24 * 60 * 60, // 7 days
  DAILY_SUMMARY: 30 * 24 * 60 * 60, // 30 days
  WEEKLY_SUMMARY: 365 * 24 * 60 * 60, // 1 year
  ALERTS: 30 * 24 * 60 * 60, // 30 days
} as const;

// Performance thresholds
export const THRESHOLDS = {
  API_RESPONSE_TIME: 2000, // 2 seconds
  PAGE_LOAD_TIME: 3000, // 3 seconds
  ERROR_RATE: 0.05, // 5%
  MEMORY_USAGE: 0.8, // 80%
  CPU_USAGE: 0.8, // 80%
  DIAGNOSIS_ABANDONMENT: 0.3, // 30%
} as const;