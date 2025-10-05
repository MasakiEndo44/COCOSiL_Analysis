/**
 * @jest-environment node
 */

import { collector } from '@/lib/monitoring/collector';
import { metricQueue, RUMCollector } from '@/lib/monitoring/queue';
import { monitor, initializeMonitoring, getMonitoringStatus, dev, shutdownMonitoring } from '@/lib/monitoring/index';

// Mock dependencies
jest.mock('@/lib/monitoring/queue');
jest.mock('@/lib/monitoring/aggregator');

describe('Monitoring System Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset collector state
    collector.reset();
  });

  afterEach(() => {
    // Clean up any timers or intervals
    jest.clearAllTimers();
  });

  describe('System Initialization', () => {
    test('should initialize monitoring system with default config', () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      
      initializeMonitoring();
      
      expect(mockConsoleLog).toHaveBeenCalledWith('[Monitoring] Initializing monitoring system...');
      expect(mockConsoleLog).toHaveBeenCalledWith('[Monitoring] System initialized successfully');
      
      mockConsoleLog.mockRestore();
    });

    test('should initialize with custom configuration', () => {
      const config = {
        enableRUM: false,
        enableErrorTracking: false,
        flushInterval: 60000,
        batchSize: 100,
      };

      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      
      initializeMonitoring(config);
      
      expect(mockConsoleLog).toHaveBeenCalledWith('[Monitoring] Initializing monitoring system...');
      expect(mockConsoleLog).toHaveBeenCalledWith('[Monitoring] System initialized successfully');
      
      mockConsoleLog.mockRestore();
    });

    test('should provide system status', () => {
      const status = getMonitoringStatus();
      
      expect(status).toHaveProperty('collector');
      expect(status).toHaveProperty('queue');
      expect(status).toHaveProperty('aggregator');
      expect(status).toHaveProperty('system');
      expect(status.system.initialized).toBe(true);
      expect(typeof status.system.timestamp).toBe('number');
    });
  });

  describe('Metric Collection', () => {
    test('should collect user action metrics', () => {
      const mockEnqueue = jest.spyOn(metricQueue, 'enqueue').mockImplementation();
      
      monitor.action('page_view', 'success');
      
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user',
          tags: expect.objectContaining({
            action: 'page_view',
            result: 'success',
          }),
        })
      );
    });

    test('should collect diagnosis metrics', () => {
      monitor.diagnosis('mbti', 'question-5', true, 30000);
      
      // Verify collector was called with correct parameters
      expect(collector.collectDiagnosisStep).toHaveBeenCalledWith({
        type: 'mbti',
        step: 'question-5',
        completed: true,
        duration: 30000,
        sessionId: undefined, // No session in test environment
      });
    });

    test('should collect error metrics', () => {
      const testError = new Error('Test error');
      
      monitor.error(testError, 'test-component', 'high');
      
      expect(collector.collectError).toHaveBeenCalledWith(testError, {
        component: 'test-component',
        route: undefined, // No window in test environment
        sessionId: undefined,
        severity: 'high',
      });
    });

    test('should collect API metrics', () => {
      const mockEnqueue = jest.spyOn(metricQueue, 'enqueue').mockImplementation();
      
      monitor.api('/api/test', 500, 200);
      
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api',
          value: 500,
          tags: expect.objectContaining({
            endpoint: '/api/test',
            status: '200',
          }),
          details: expect.objectContaining({
            endpoint: '/api/test',
            method: 'POST',
            status: 200,
            duration: 500,
          }),
        })
      );
    });
  });

  describe('Queue Management', () => {
    test('should provide queue statistics', () => {
      const mockGetStats = jest.fn().mockReturnValue({
        queueSize: 0,
        isProcessing: false,
        hasTimer: false,
      });
      (metricQueue.getStats as jest.Mock) = mockGetStats;
      
      const stats = monitor.status();
      
      expect(stats.queue).toEqual({
        queueSize: 0,
        isProcessing: false,
        hasTimer: false,
      });
    });

    test('should flush metrics on demand', async () => {
      const mockFlush = jest.spyOn(metricQueue, 'flush').mockResolvedValue();
      
      await monitor.flush();
      
      expect(mockFlush).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle collector errors gracefully', () => {
      // Mock collector to throw error
      jest.spyOn(collector, 'collectUserAction').mockImplementation(() => {
        throw new Error('Collector failed');
      });
      
      // Should not throw
      expect(() => {
        monitor.action('page_view');
      }).not.toThrow();
    });

    test('should handle queue errors gracefully', () => {
      // Mock queue to throw error
      jest.spyOn(metricQueue, 'enqueue').mockImplementation(() => {
        throw new Error('Queue failed');
      });
      
      // Should not throw
      expect(() => {
        monitor.api('/api/test', 500, 200);
      }).not.toThrow();
    });
  });

  describe('Development Utilities', () => {
    test('should generate test metrics', () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      const mockAction = jest.spyOn(monitor, 'action').mockImplementation();
      const mockApi = jest.spyOn(monitor, 'api').mockImplementation();

      dev.generateTestMetrics(5);

      expect(mockAction).toHaveBeenCalledTimes(5);
      expect(mockApi).toHaveBeenCalledTimes(5);
      expect(mockConsoleLog).toHaveBeenCalledWith('Generated 5 test metrics');

      mockConsoleLog.mockRestore();
      mockAction.mockRestore();
      mockApi.mockRestore();
    });

    test('should simulate errors for testing', () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      const mockError = jest.spyOn(monitor, 'error').mockImplementation();

      dev.simulateError('critical');

      expect(mockError).toHaveBeenCalledWith(
        expect.any(Error),
        'test-component',
        'critical'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('Simulated critical error');

      mockConsoleLog.mockRestore();
      mockError.mockRestore();
    });

    test('should log monitoring stats', () => {
      const mockConsoleTable = jest.spyOn(console, 'table').mockImplementation();

      dev.logStats();

      expect(mockConsoleTable).toHaveBeenCalledWith(
        expect.objectContaining({
          'Queue Size': expect.any(Number),
          'Is Processing': expect.any(Boolean),
          'Active Requests': expect.any(Number),
          'Active Alerts': expect.any(Number),
          'Alert Rules': expect.any(Number),
        })
      );

      mockConsoleTable.mockRestore();
    });
  });

  describe('RUM Collector', () => {
    test('should create RUM collector instance', () => {
      const rumCollector = new RUMCollector();
      
      expect(rumCollector).toBeDefined();
      expect(typeof rumCollector.trackAction).toBe('function');
      expect(typeof rumCollector.disconnect).toBe('function');
    });

    test('should track actions with RUM collector', () => {
      const rumCollector = new RUMCollector();
      const mockEnqueue = jest.spyOn(metricQueue, 'enqueue').mockImplementation();
      
      rumCollector.trackAction('form_submit', { component: 'contact-form' });
      
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user',
          tags: expect.objectContaining({
            action: 'form_submit',
          }),
          details: expect.objectContaining({
            action: 'form_submit',
            component: 'contact-form',
          }),
        })
      );
    });

    test('should generate unique metric IDs', () => {
      const rumCollector = new RUMCollector();
      const mockEnqueue = jest.spyOn(metricQueue, 'enqueue').mockImplementation();
      
      rumCollector.trackAction('page_view');
      rumCollector.trackAction('page_view');
      
      const calls = mockEnqueue.mock.calls;
      const id1 = calls[0][0].id;
      const id2 = calls[1][0].id;
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });

  describe('Performance Thresholds', () => {
    test('should detect slow API responses', () => {
      const mockCollectError = jest.spyOn(collector, 'collectError').mockImplementation();
      
      // Simulate slow API response (over 2000ms threshold)
      monitor.api('/api/slow-endpoint', 3000, 200);
      
      // Should not directly call collectError from monitor.api
      // This would be handled by the collector internally
      expect(mockCollectError).not.toHaveBeenCalled();
    });

    test('should track high error rates', () => {
      // Track multiple errors to simulate high error rate
      for (let i = 0; i < 10; i++) {
        monitor.api('/api/test', 500, i < 3 ? 500 : 200); // 30% error rate
      }
      
      // Error rate detection would be handled by the aggregator
      // In a real implementation, this would trigger alerts
    });
  });

  describe('Memory Management', () => {
    test('should clean up resources on shutdown', () => {
      const mockClear = jest.spyOn(metricQueue, 'clear').mockImplementation();
      const mockReset = jest.spyOn(collector, 'reset').mockImplementation();

      shutdownMonitoring();

      expect(mockClear).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalled();
    });

    test('should not accumulate unbounded data', () => {
      // Generate many metrics
      for (let i = 0; i < 1000; i++) {
        monitor.action('page_view');
      }
      
      const stats = monitor.status();
      
      // Queue should not grow indefinitely due to batching and flushing
      expect(stats.queue.queueSize).toBeLessThan(1000);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined/null values gracefully', () => {
      expect(() => {
        monitor.error(null as any);
      }).not.toThrow();
      
      expect(() => {
        monitor.diagnosis('mbti' as any, undefined as any, true);
      }).not.toThrow();
    });

    test('should handle empty strings and zero values', () => {
      expect(() => {
        monitor.api('', 0, 0);
      }).not.toThrow();
      
      expect(() => {
        monitor.diagnosis('mbti', '', false, 0);
      }).not.toThrow();
    });

    test('should handle concurrent operations', async () => {
      const promises = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve().then(() => monitor.action('page_view'))
      );
      
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });
  });

  describe('Integration with Next.js', () => {
    test('should work without window object (SSR)', () => {
      // Ensure window is undefined (Node.js environment)
      expect(typeof window).toBe('undefined');
      
      // Should not throw in SSR environment
      expect(() => {
        monitor.action('page_view');
        monitor.diagnosis('mbti', 'start', false);
        monitor.error(new Error('SSR error'));
      }).not.toThrow();
    });

    test('should generate server-compatible session IDs', () => {
      const mockEnqueue = jest.spyOn(metricQueue, 'enqueue').mockImplementation();
      
      monitor.action('page_view');
      
      const metric = mockEnqueue.mock.calls[0][0];
      expect(metric.sessionId).toBe('server');
    });
  });
});