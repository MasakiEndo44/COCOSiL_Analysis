/**
 * Performance Monitoring Queue System
 * Edge Runtime compatible batch processing for metrics
 */

import { MetricData, AllMetrics, STORAGE_KEYS, RETENTION } from './schema';

interface QueueConfig {
  batchSize: number;
  flushInterval: number; // milliseconds
  maxRetries: number;
  compressionThreshold: number;
}

interface QueuedMetric {
  metric: AllMetrics;
  timestamp: number;
  retries: number;
}

class MetricQueue {
  private queue: QueuedMetric[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private config: QueueConfig;
  private isProcessing = false;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      maxRetries: 3,
      compressionThreshold: 100,
      ...config,
    };
  }

  /**
   * Add metric to queue for batch processing
   */
  enqueue(metric: AllMetrics): void {
    const queuedMetric: QueuedMetric = {
      metric,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queuedMetric);

    // Auto-flush if batch size reached
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  /**
   * Schedule automatic flush
   */
  private scheduleFlush(): void {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Manually flush queue
   */
  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const batch = this.queue.splice(0, this.config.batchSize);
    
    try {
      await this.processBatch(batch);
    } catch (error) {
      // Re-queue failed metrics with retry increment
      const retriableMetrics = batch.filter(item => item.retries < this.config.maxRetries);
      retriableMetrics.forEach(item => {
        item.retries++;
        this.queue.unshift(item);
      });

      console.error('Metric batch processing failed:', error);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if queue has items
      if (this.queue.length > 0) {
        this.scheduleFlush();
      }
    }
  }

  /**
   * Process batch of metrics
   */
  private async processBatch(batch: QueuedMetric[]): Promise<void> {
    if (!batch.length) return;

    // Group metrics by type and time bucket
    const groupedMetrics = this.groupMetrics(batch);
    
    // Store metrics in parallel
    const storagePromises = Object.entries(groupedMetrics).map(
      async ([key, metrics]) => {
        return this.storeMetrics(key, metrics);
      }
    );

    await Promise.all(storagePromises);
  }

  /**
   * Group metrics by storage key
   */
  private groupMetrics(batch: QueuedMetric[]): Record<string, AllMetrics[]> {
    const grouped: Record<string, AllMetrics[]> = {};

    for (const { metric } of batch) {
      const key = STORAGE_KEYS.METRICS(metric.type, metric.timestamp);
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      
      grouped[key].push(metric);
    }

    return grouped;
  }

  /**
   * Store metrics to persistent storage
   */
  private async storeMetrics(key: string, metrics: AllMetrics[]): Promise<void> {
    try {
      // Compress large batches
      const data = metrics.length > this.config.compressionThreshold 
        ? await this.compressMetrics(metrics)
        : metrics;

      // Store with TTL
      await this.setWithTTL(key, data, RETENTION.RAW_METRICS);
      
    } catch (error) {
      console.error(`Failed to store metrics for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Compress metrics for storage efficiency
   */
  private async compressMetrics(metrics: AllMetrics[]): Promise<string> {
    try {
      // Simple JSON compression - in production, consider gzip
      return JSON.stringify(metrics);
    } catch (error) {
      console.error('Metric compression failed:', error);
      return JSON.stringify(metrics);
    }
  }

  /**
   * Store data with TTL (Time To Live)
   */
  private async setWithTTL(key: string, data: any, ttlSeconds: number): Promise<void> {
    if (typeof window === 'undefined') {
      // Server-side: Use Vercel KV (will be implemented when dependency is added)
      try {
        // Note: This will require @vercel/kv dependency
        // const { kv } = await import('@vercel/kv');
        // await kv.setex(key, ttlSeconds, JSON.stringify(data));
        
        // Fallback to in-memory storage for now
        console.log(`[MetricQueue] Storing ${key} with ${Array.isArray(data) ? data.length : 1} metrics`);
      } catch (error) {
        console.error('KV storage error:', error);
      }
    } else {
      // Client-side: Use IndexedDB or localStorage with expiry
      const item = {
        data,
        expiry: Date.now() + (ttlSeconds * 1000),
      };
      
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.warn('localStorage storage failed:', error);
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): { queueSize: number; isProcessing: boolean; hasTimer: boolean } {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      hasTimer: this.flushTimer !== null,
    };
  }

  /**
   * Clear queue and reset timers
   */
  clear(): void {
    this.queue = [];
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// Singleton instance for global use
export const metricQueue = new MetricQueue();

/**
 * Client-side Real User Monitoring (RUM) collector
 */
export class RUMCollector {
  private observer: PerformanceObserver | null = null;
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
    
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.collectInitialMetrics();
    }
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    try {
      // Observe navigation timing
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  /**
   * Collect initial page metrics
   */
  private collectInitialMetrics(): void {
    // Core Web Vitals
    if ('web-vitals' in window) {
      // Will be implemented when web-vitals library is added
    }

    // Custom timing metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectPageLoadMetrics();
      }, 0);
    });
  }

  /**
   * Handle performance entries
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    const baseMetric = {
      id: this.generateId(),
      timestamp: Date.now(),
      tags: {
        page: window.location.pathname,
        userAgent: navigator.userAgent.substring(0, 100),
      },
      sessionId: this.getSessionId(),
    };

    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        metricQueue.enqueue({
          ...baseMetric,
          type: 'performance',
          value: navEntry.loadEventEnd - navEntry.loadEventStart,
          details: {
            route: window.location.pathname,
            method: 'GET',
            duration: navEntry.loadEventEnd - navEntry.loadEventStart,
          },
        });
        break;

      case 'paint':
        metricQueue.enqueue({
          ...baseMetric,
          type: 'performance',
          value: entry.startTime,
          tags: { ...baseMetric.tags, paintType: entry.name },
          details: {
            route: window.location.pathname,
            method: 'PAINT',
            duration: entry.startTime,
          },
        });
        break;

      case 'largest-contentful-paint':
        metricQueue.enqueue({
          ...baseMetric,
          type: 'performance',
          value: entry.startTime,
          tags: { ...baseMetric.tags, metric: 'lcp' },
          details: {
            route: window.location.pathname,
            method: 'LCP',
            duration: entry.startTime,
          },
        });
        break;
    }
  }

  /**
   * Collect page load metrics
   */
  private collectPageLoadMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        connection: navigation.connectEnd - navigation.connectStart,
        ssl: navigation.connectEnd - navigation.secureConnectionStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domInteractive - navigation.responseEnd,
        load: navigation.loadEventEnd - navigation.loadEventStart,
      };

      Object.entries(metrics).forEach(([name, value]) => {
        if (value > 0) {
          metricQueue.enqueue({
            id: this.generateId(),
            timestamp: Date.now(),
            type: 'performance',
            value,
            tags: {
              page: window.location.pathname,
              metric: name,
            },
            sessionId: this.getSessionId(),
            details: {
              route: window.location.pathname,
              method: name.toUpperCase(),
              duration: value,
            },
          });
        }
      });
    }
  }

  /**
   * Track user action
   */
  trackAction(action: string, details: Record<string, any> = {}): void {
    metricQueue.enqueue({
      id: this.generateId(),
      timestamp: Date.now(),
      type: 'user',
      value: performance.now() - this.startTime,
      tags: {
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        action,
      },
      sessionId: this.getSessionId(),
      details: {
        action: action as any,
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        duration: performance.now() - this.startTime,
        result: 'success',
        ...details,
      },
    });
  }

  /**
   * Generate unique metric ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('cocosil-session-id');
    
    if (!sessionId) {
      sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('cocosil-session-id', sessionId);
    }
    
    return sessionId;
  }

  /**
   * Cleanup observers
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Export singleton RUM collector
export const rumCollector = new RUMCollector();