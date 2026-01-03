/**
 * Admin Monitoring Page
 * Real-time system monitoring dashboard
 */

import { Suspense } from 'react';
import { MonitoringDashboard } from '@/components/admin/monitoring-dashboard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const metadata = {
  title: 'システム監視 | COCOSiL Admin',
  description: 'リアルタイムシステム監視とパフォーマンス分析',
};

function MonitoringLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminMonitoringPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<MonitoringLoadingSkeleton />}>
        <MonitoringDashboard />
      </Suspense>
    </div>
  );
}

// Static generation disabled for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;