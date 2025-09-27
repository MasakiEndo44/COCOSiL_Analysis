/**
 * Metric Aggregation System
 * Processes raw metrics into summaries for dashboard display
 */

import { 
  AllMetrics, 
  MetricSummary, 
  STORAGE_KEYS, 
  RETENTION,
  THRESHOLDS,
  Alert,
  AlertRule 
} from './schema';

interface AggregationPeriod {
  start: number;
  end: number;
  period: '1h' | '24h' | '7d' | '30d';
}

interface MetricBucket {
  timestamp: number;
  metrics: AllMetrics[];
  processed: boolean;
}

class MetricAggregator {
  private buckets = new Map<string, MetricBucket>();
  private alertRules: AlertRule[] = [];
  private activeAlerts = new Map<string, Alert>();

  constructor() {
    // Initialize default alert rules
    this.initializeDefaultAlertRules();
  }

  /**
   * Process raw metrics into aggregated summaries
   */
  async processMetrics(metrics: AllMetrics[]): Promise<void> {
    if (!metrics.length) return;

    // Group metrics by time buckets
    const buckets = this.groupMetricsByTime(metrics);
    
    // Process each bucket
    for (const [bucketKey, bucket] of buckets.entries()) {
      await this.processBucket(bucketKey, bucket);
    }

    // Check alert conditions
    await this.checkAlertRules(metrics);
  }

  /**
   * Group metrics by time buckets for aggregation
   */
  private groupMetricsByTime(metrics: AllMetrics[]): Map<string, AllMetrics[]> {
    const buckets = new Map<string, AllMetrics[]>();

    for (const metric of metrics) {
      // 1-hour buckets for aggregation
      const bucketTime = Math.floor(metric.timestamp / 3600000) * 3600000;
      const bucketKey = `${bucketTime}`;

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, []);
      }

      buckets.get(bucketKey)!.push(metric);
    }

    return buckets;
  }

  /**
   * Process individual bucket into summary
   */
  private async processBucket(bucketKey: string, metrics: AllMetrics[]): Promise<void> {
    const timestamp = parseInt(bucketKey);
    
    // Generate summary for different time periods
    const periods: Array<'1h' | '24h' | '7d' | '30d'> = ['1h', '24h', '7d', '30d'];
    
    for (const period of periods) {
      const summary = await this.generateSummary(metrics, timestamp, period);
      await this.storeSummary(period, timestamp, summary);
    }
  }

  /**
   * Generate metric summary for a time period
   */
  private async generateSummary(
    metrics: AllMetrics[], 
    timestamp: number, 
    period: '1h' | '24h' | '7d' | '30d'
  ): Promise<MetricSummary> {
    // Filter metrics by period
    const periodMetrics = this.filterMetricsByPeriod(metrics, timestamp, period);
    
    // Calculate aggregated metrics
    const apiMetrics = periodMetrics.filter(m => m.type === 'api');
    const errorMetrics = periodMetrics.filter(m => m.type === 'error');
    const userMetrics = periodMetrics.filter(m => m.type === 'user');
    const diagnosisMetrics = periodMetrics.filter(m => m.type === 'diagnosis');

    // Core metrics
    const totalRequests = apiMetrics.length;
    const avgResponseTime = totalRequests > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / totalRequests 
      : 0;
    const errorRate = totalRequests > 0 ? errorMetrics.length / totalRequests : 0;
    const activeUsers = new Set(userMetrics.map(m => m.userId).filter(Boolean)).size;
    const completedDiagnoses = diagnosisMetrics.filter(m => 
      m.type === 'diagnosis' && m.details.completed
    ).length;

    // System health score (0-100)
    const systemHealth = this.calculateSystemHealth({
      avgResponseTime,
      errorRate,
      activeUsers,
      totalRequests,
    });

    // Breakdown analytics
    const breakdown = {
      byRoute: this.aggregateByRoute(apiMetrics),
      byError: this.aggregateByError(errorMetrics),
      byDiagnosis: this.aggregateByDiagnosis(diagnosisMetrics),
    };

    return {
      period,
      timestamp,
      metrics: {
        totalRequests,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 10000) / 10000, // 4 decimal places
        activeUsers,
        completedDiagnoses,
        systemHealth: Math.round(systemHealth),
      },
      breakdown,
    };
  }

  /**
   * Filter metrics by time period
   */
  private filterMetricsByPeriod(
    metrics: AllMetrics[], 
    currentTime: number, 
    period: '1h' | '24h' | '7d' | '30d'
  ): AllMetrics[] {
    const periodMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const cutoffTime = currentTime - periodMs[period];
    return metrics.filter(m => m.timestamp >= cutoffTime);
  }

  /**
   * Calculate system health score
   */
  private calculateSystemHealth(params: {
    avgResponseTime: number;
    errorRate: number;
    activeUsers: number;
    totalRequests: number;
  }): number {
    let score = 100;

    // Response time penalty
    if (params.avgResponseTime > THRESHOLDS.API_RESPONSE_TIME) {
      const penalty = Math.min(30, (params.avgResponseTime - THRESHOLDS.API_RESPONSE_TIME) / 100);
      score -= penalty;
    }

    // Error rate penalty
    if (params.errorRate > THRESHOLDS.ERROR_RATE) {
      const penalty = Math.min(40, (params.errorRate - THRESHOLDS.ERROR_RATE) * 1000);
      score -= penalty;
    }

    // Low activity penalty
    if (params.totalRequests < 10 && params.activeUsers < 2) {
      score -= 10; // Minor penalty for low activity
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Aggregate metrics by route
   */
  private aggregateByRoute(apiMetrics: AllMetrics[]): Record<string, { 
    requests: number; 
    avgTime: number; 
    errorRate: number 
  }> {
    const routes = new Map<string, { requests: number; totalTime: number; errors: number }>();

    for (const metric of apiMetrics) {
      if (metric.type !== 'api') continue;

      const route = metric.details.endpoint;
      const existing = routes.get(route) || { requests: 0, totalTime: 0, errors: 0 };

      existing.requests++;
      existing.totalTime += metric.value;
      if (metric.details.status >= 400) {
        existing.errors++;
      }

      routes.set(route, existing);
    }

    const result: Record<string, { requests: number; avgTime: number; errorRate: number }> = {};
    
    for (const [route, data] of routes.entries()) {
      result[route] = {
        requests: data.requests,
        avgTime: Math.round(data.totalTime / data.requests),
        errorRate: data.requests > 0 ? data.errors / data.requests : 0,
      };
    }

    return result;
  }

  /**
   * Aggregate metrics by error type
   */
  private aggregateByError(errorMetrics: AllMetrics[]): Record<string, number> {
    const errors: Record<string, number> = {};

    for (const metric of errorMetrics) {
      if (metric.type !== 'error') continue;

      const errorType = metric.details.errorType;
      errors[errorType] = (errors[errorType] || 0) + 1;
    }

    return errors;
  }

  /**
   * Aggregate metrics by diagnosis type
   */
  private aggregateByDiagnosis(diagnosisMetrics: AllMetrics[]): Record<string, { 
    started: number; 
    completed: number; 
    avgTime: number 
  }> {
    const diagnosis = new Map<string, { started: number; completed: number; totalTime: number; completedCount: number }>();

    for (const metric of diagnosisMetrics) {
      if (metric.type !== 'diagnosis') continue;

      const type = metric.details.diagnosisType;
      const existing = diagnosis.get(type) || { started: 0, completed: 0, totalTime: 0, completedCount: 0 };

      existing.started++;
      if (metric.details.completed) {
        existing.completed++;
        existing.totalTime += metric.value;
        existing.completedCount++;
      }

      diagnosis.set(type, existing);
    }

    const result: Record<string, { started: number; completed: number; avgTime: number }> = {};
    
    for (const [type, data] of diagnosis.entries()) {
      result[type] = {
        started: data.started,
        completed: data.completed,
        avgTime: data.completedCount > 0 ? Math.round(data.totalTime / data.completedCount) : 0,
      };
    }

    return result;
  }

  /**
   * Store aggregated summary
   */
  private async storeSummary(
    period: '1h' | '24h' | '7d' | '30d',
    timestamp: number,
    summary: MetricSummary
  ): Promise<void> {
    const key = STORAGE_KEYS.SUMMARY(period, timestamp);
    const ttl = this.getSummaryTTL(period);

    try {
      // Store with appropriate TTL
      await this.setWithTTL(key, summary, ttl);
    } catch (error) {
      console.error(`Failed to store summary for ${period}:`, error);
    }
  }

  /**
   * Get TTL for summary storage
   */
  private getSummaryTTL(period: '1h' | '24h' | '7d' | '30d'): number {
    switch (period) {
      case '1h': return RETENTION.HOURLY_SUMMARY;
      case '24h': return RETENTION.DAILY_SUMMARY;
      case '7d': return RETENTION.WEEKLY_SUMMARY;
      case '30d': return RETENTION.WEEKLY_SUMMARY;
      default: return RETENTION.DAILY_SUMMARY;
    }
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        metric: 'api',
        condition: 'greater_than',
        threshold: THRESHOLDS.ERROR_RATE,
        window: 5,
        enabled: true,
        channels: ['slack', 'discord'],
      },
      {
        id: 'slow-api-response',
        name: 'Slow API Response',
        metric: 'api',
        condition: 'greater_than',
        threshold: THRESHOLDS.API_RESPONSE_TIME,
        window: 10,
        enabled: true,
        channels: ['slack'],
      },
      {
        id: 'high-diagnosis-abandonment',
        name: 'High Diagnosis Abandonment',
        metric: 'diagnosis',
        condition: 'greater_than',
        threshold: THRESHOLDS.DIAGNOSIS_ABANDONMENT,
        window: 30,
        enabled: true,
        channels: ['discord'],
      },
    ];
  }

  /**
   * Check alert rules against current metrics
   */
  private async checkAlertRules(metrics: AllMetrics[]): Promise<void> {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      await this.evaluateAlertRule(rule, metrics);
    }
  }

  /**
   * Evaluate individual alert rule
   */
  private async evaluateAlertRule(rule: AlertRule, metrics: AllMetrics[]): Promise<void> {
    // Filter metrics by rule type and time window
    const windowStart = Date.now() - (rule.window * 60 * 1000);
    const relevantMetrics = metrics.filter(
      m => m.type === rule.metric && m.timestamp >= windowStart
    );

    if (!relevantMetrics.length) return;

    // Calculate metric value based on rule type
    const metricValue = this.calculateRuleMetricValue(rule, relevantMetrics);
    const conditionMet = this.evaluateCondition(rule.condition, metricValue, rule.threshold);

    if (conditionMet && !this.activeAlerts.has(rule.id)) {
      // Create new alert
      const alert: Alert = {
        id: `${rule.id}-${Date.now()}`,
        ruleId: rule.id,
        timestamp: Date.now(),
        metric: relevantMetrics[0], // Representative metric
        message: `${rule.name}: ${metricValue.toFixed(2)} ${rule.condition} ${rule.threshold}`,
        severity: this.getSeverityFromRule(rule),
        resolved: false,
      };

      this.activeAlerts.set(rule.id, alert);
      await this.sendAlert(alert, rule);
    } else if (!conditionMet && this.activeAlerts.has(rule.id)) {
      // Resolve existing alert
      const alert = this.activeAlerts.get(rule.id)!;
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      
      this.activeAlerts.delete(rule.id);
      await this.sendAlertResolution(alert, rule);
    }
  }

  /**
   * Calculate metric value for alert rule
   */
  private calculateRuleMetricValue(rule: AlertRule, metrics: AllMetrics[]): number {
    switch (rule.metric) {
      case 'api':
        if (rule.id === 'high-error-rate') {
          const errors = metrics.filter(m => m.type === 'api' && (m as any).details.status >= 400).length;
          return metrics.length > 0 ? errors / metrics.length : 0;
        } else {
          return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
        }
      
      case 'diagnosis':
        const started = metrics.length;
        const completed = metrics.filter(m => (m as any).details.completed).length;
        return started > 0 ? 1 - (completed / started) : 0;
      
      default:
        return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
    }
  }

  /**
   * Evaluate alert condition
   */
  private evaluateCondition(
    condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals',
    value: number,
    threshold: number
  ): boolean {
    switch (condition) {
      case 'greater_than': return value > threshold;
      case 'less_than': return value < threshold;
      case 'equals': return Math.abs(value - threshold) < 0.001;
      case 'not_equals': return Math.abs(value - threshold) >= 0.001;
      default: return false;
    }
  }

  /**
   * Get alert severity from rule
   */
  private getSeverityFromRule(rule: AlertRule): 'info' | 'warning' | 'error' | 'critical' {
    if (rule.id.includes('critical')) return 'critical';
    if (rule.id.includes('error') || rule.id.includes('high')) return 'error';
    if (rule.id.includes('slow') || rule.id.includes('warning')) return 'warning';
    return 'info';
  }

  /**
   * Send alert notification
   */
  private async sendAlert(alert: Alert, rule: AlertRule): Promise<void> {
    console.log(`🚨 ALERT: ${alert.message}`);
    
    // Store alert
    const key = STORAGE_KEYS.ALERT(alert.id);
    await this.setWithTTL(key, alert, RETENTION.ALERTS);

    // Send to configured channels (implementation depends on webhook setup)
    for (const channel of rule.channels) {
      await this.sendToChannel(channel, alert, 'triggered');
    }
  }

  /**
   * Send alert resolution notification
   */
  private async sendAlertResolution(alert: Alert, rule: AlertRule): Promise<void> {
    console.log(`✅ RESOLVED: ${alert.message}`);
    
    // Update stored alert
    const key = STORAGE_KEYS.ALERT(alert.id);
    await this.setWithTTL(key, alert, RETENTION.ALERTS);

    // Send resolution to configured channels
    for (const channel of rule.channels) {
      await this.sendToChannel(channel, alert, 'resolved');
    }
  }

  /**
   * Send notification to specific channel
   */
  private async sendToChannel(
    channel: 'slack' | 'discord' | 'email',
    alert: Alert,
    action: 'triggered' | 'resolved'
  ): Promise<void> {
    // This would be implemented with actual webhook URLs
    const message = `${action === 'triggered' ? '🚨' : '✅'} ${alert.message}`;
    console.log(`[${channel.toUpperCase()}] ${message}`);
  }

  /**
   * Store data with TTL
   */
  private async setWithTTL(key: string, data: any, ttlSeconds: number): Promise<void> {
    try {
      // Note: This will require @vercel/kv dependency
      // const { kv } = await import('@vercel/kv');
      // await kv.setex(key, ttlSeconds, JSON.stringify(data));
      
      // Fallback for development
      console.log(`[Aggregator] Storing ${key} with TTL ${ttlSeconds}s`);
    } catch (error) {
      console.error('KV storage error:', error);
    }
  }

  /**
   * Retrieve metric summaries
   */
  async getSummaries(
    period: '1h' | '24h' | '7d' | '30d',
    count: number = 24
  ): Promise<MetricSummary[]> {
    const summaries: MetricSummary[] = [];
    const now = Date.now();
    const periodMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    for (let i = 0; i < count; i++) {
      const timestamp = now - (i * periodMs[period]);
      const key = STORAGE_KEYS.SUMMARY(period, timestamp);
      
      try {
        // Retrieve from storage
        // const data = await kv.get(key);
        // if (data) summaries.push(JSON.parse(data));
      } catch (error) {
        console.error(`Failed to retrieve summary ${key}:`, error);
      }
    }

    return summaries.reverse(); // Chronological order
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alert rules
   */
  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  /**
   * Add or update alert rule
   */
  setAlertRule(rule: AlertRule): void {
    const existingIndex = this.alertRules.findIndex(r => r.id === rule.id);
    
    if (existingIndex >= 0) {
      this.alertRules[existingIndex] = rule;
    } else {
      this.alertRules.push(rule);
    }
  }
}

// Singleton instance
export const aggregator = new MetricAggregator();

export default aggregator;