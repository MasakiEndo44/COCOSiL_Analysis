/**
 * Admin Monitoring API Endpoint
 * Provides monitoring data for the admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTSession } from '@/lib/jwt-session';
import { aggregator } from '@/lib/monitoring/aggregator';
import { collector } from '@/lib/monitoring/collector';
import { withAPIMonitoring } from '@/lib/monitoring/middleware';
import type { MetricSummary } from '@/lib/monitoring/schema';

async function getMonitoringHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify admin authentication
    const session = await verifyJWTSession(request);
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') as '1h' | '24h' | '7d' | '30d' || '24h';
    
    // Get metric summaries
    const summaries = await aggregator.getSummaries(period, 24);
    
    // Get active alerts
    const alerts = aggregator.getActiveAlerts();
    
    // Get real-time metrics
    const collectorStats = collector.getStats();
    
    // Generate mock real-time data (in production, this would come from actual metrics)
    const realtime = {
      activeUsers: Math.floor(Math.random() * 50) + 10, // 10-60 users
      currentThroughput: Math.floor(Math.random() * 100) + 20, // 20-120 req/min
      avgResponseTime: Math.floor(Math.random() * 500) + 200, // 200-700ms
      errorRate: Math.random() * 0.05, // 0-5%
    };

    // Generate sample data if no summaries exist (for demonstration)
    const sampleSummaries: MetricSummary[] = summaries.length > 0 ? summaries : generateSampleData(period);

    return NextResponse.json({
      summaries: sampleSummaries,
      alerts,
      realtime,
      collectorStats,
      period,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate sample monitoring data for demonstration
 */
function generateSampleData(period: '1h' | '24h' | '7d' | '30d'): MetricSummary[] {
  const now = Date.now();
  const periodMs = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  
  const interval = periodMs[period] / 24; // 24 data points
  const summaries: MetricSummary[] = [];

  for (let i = 23; i >= 0; i--) {
    const timestamp = now - (i * interval);
    
    // Generate realistic sample data with trends
    const baseResponseTime = 300 + Math.sin(i * 0.1) * 100; // Oscillating pattern
    const baseErrorRate = 0.02 + Math.random() * 0.03; // 2-5% error rate
    const baseUsers = Math.floor(20 + Math.sin(i * 0.2) * 15); // User activity pattern
    const baseRequests = Math.floor(50 + Math.random() * 50); // Request volume

    const summary: MetricSummary = {
      period,
      timestamp,
      metrics: {
        totalRequests: baseRequests,
        avgResponseTime: Math.round(baseResponseTime + Math.random() * 100),
        errorRate: Math.round((baseErrorRate + Math.random() * 0.01) * 10000) / 10000,
        activeUsers: Math.max(1, baseUsers + Math.floor(Math.random() * 10 - 5)),
        completedDiagnoses: Math.floor(Math.random() * 20),
        systemHealth: Math.round(95 - (baseErrorRate * 1000) - (Math.max(0, baseResponseTime - 500) / 10)),
      },
      breakdown: {
        byRoute: {
          '/api/ai/chat': {
            requests: Math.floor(baseRequests * 0.3),
            avgTime: Math.round(baseResponseTime * 2),
            errorRate: baseErrorRate * 0.5,
          },
          '/api/fortune-calc-v2': {
            requests: Math.floor(baseRequests * 0.4),
            avgTime: Math.round(baseResponseTime * 0.3),
            errorRate: baseErrorRate * 0.2,
          },
          '/api/admin/stats': {
            requests: Math.floor(baseRequests * 0.1),
            avgTime: Math.round(baseResponseTime * 0.8),
            errorRate: baseErrorRate * 0.1,
          },
          '/diagnosis': {
            requests: Math.floor(baseRequests * 0.2),
            avgTime: Math.round(baseResponseTime * 1.2),
            errorRate: baseErrorRate * 0.3,
          },
        },
        byError: {
          'ValidationError': Math.floor(Math.random() * 5),
          'OpenAIError': Math.floor(Math.random() * 3),
          'TimeoutError': Math.floor(Math.random() * 2),
          'NetworkError': Math.floor(Math.random() * 2),
        },
        byDiagnosis: {
          'mbti': {
            started: Math.floor(Math.random() * 30) + 10,
            completed: Math.floor(Math.random() * 25) + 8,
            avgTime: Math.floor(Math.random() * 30000) + 60000, // 1-1.5 minutes
          },
          'taiheki': {
            started: Math.floor(Math.random() * 25) + 8,
            completed: Math.floor(Math.random() * 20) + 6,
            avgTime: Math.floor(Math.random() * 45000) + 90000, // 1.5-2.25 minutes
          },
          'fortune': {
            started: Math.floor(Math.random() * 40) + 15,
            completed: Math.floor(Math.random() * 35) + 12,
            avgTime: Math.floor(Math.random() * 15000) + 15000, // 15-30 seconds
          },
          'integrated': {
            started: Math.floor(Math.random() * 15) + 5,
            completed: Math.floor(Math.random() * 12) + 3,
            avgTime: Math.floor(Math.random() * 60000) + 120000, // 2-3 minutes
          },
        },
      },
    };

    summaries.push(summary);
  }

  return summaries;
}

// Monitoring-specific alert generation
async function generateSampleAlerts() {
  const alerts = [];
  
  // Simulate some active alerts
  if (Math.random() > 0.8) {
    alerts.push({
      id: `alert-${Date.now()}`,
      ruleId: 'high-error-rate',
      timestamp: Date.now() - Math.random() * 3600000, // Within last hour
      metric: {
        id: 'sample',
        timestamp: Date.now(),
        type: 'api' as const,
        value: 0.08, // 8% error rate
        tags: { severity: 'high' },
        details: {
          endpoint: '/api/ai/chat',
          method: 'POST',
          status: 500,
          duration: 5000,
        },
      },
      message: 'High Error Rate: 8% error rate detected',
      severity: 'error' as const,
      resolved: false,
    });
  }

  if (Math.random() > 0.9) {
    alerts.push({
      id: `alert-${Date.now() + 1}`,
      ruleId: 'slow-api-response',
      timestamp: Date.now() - Math.random() * 1800000, // Within last 30 minutes
      metric: {
        id: 'sample',
        timestamp: Date.now(),
        type: 'api' as const,
        value: 3500, // 3.5 seconds
        tags: { severity: 'medium' },
        details: {
          endpoint: '/api/fortune-calc-v2',
          method: 'POST',
          status: 200,
          duration: 3500,
        },
      },
      message: 'Slow API Response: 3500ms response time detected',
      severity: 'warning' as const,
      resolved: false,
    });
  }

  return alerts;
}

// Export with monitoring wrapper
export const GET = withAPIMonitoring(getMonitoringHandler);

// Health check endpoint
export async function HEAD() {
  return new Response(null, { status: 200 });
}

// Runtime configuration for Edge
export const runtime = 'edge';
export const dynamic = 'force-dynamic';