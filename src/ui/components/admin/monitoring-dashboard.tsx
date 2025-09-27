'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Activity, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { MetricSummary, Alert } from '@/lib/monitoring/schema';

interface MonitoringDashboardProps {
  className?: string;
}

interface DashboardData {
  summaries: MetricSummary[];
  alerts: Alert[];
  realtime: {
    activeUsers: number;
    currentThroughput: number;
    avgResponseTime: number;
    errorRate: number;
  };
}

export function MonitoringDashboard({ className }: MonitoringDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch monitoring data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/monitoring?period=${selectedPeriod}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up auto-refresh
    let interval: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedPeriod, autoRefresh]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 animate-spin" />
          <span>監視データを読み込んでいます...</span>
        </div>
      </div>
    );
  }

  const latestSummary = data.summaries[data.summaries.length - 1];
  const criticalAlerts = data.alerts.filter(a => !a.resolved && a.severity === 'critical');
  const warningAlerts = data.alerts.filter(a => !a.resolved && (a.severity === 'error' || a.severity === 'warning'));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">パフォーマンス監視</h1>
          <p className="text-muted-foreground">システムの健全性とパフォーマンス指標</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            自動更新
          </Button>
          <Badge variant={latestSummary?.metrics.systemHealth > 80 ? "default" : "destructive"}>
            システム健全性: {latestSummary?.metrics.systemHealth || 0}%
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
        <div className="space-y-2">
          {criticalAlerts.map((alert) => (
            <Card key={alert.id} className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">{alert.message}</span>
                  <Badge variant="destructive">{alert.severity}</Badge>
                  <span className="text-sm text-red-600">
                    {new Date(alert.timestamp).toLocaleString('ja-JP')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {warningAlerts.map((alert) => (
            <Card key={alert.id} className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">{alert.message}</span>
                  <Badge variant="outline">{alert.severity}</Badge>
                  <span className="text-sm text-yellow-600">
                    {new Date(alert.timestamp).toLocaleString('ja-JP')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.realtime.activeUsers}</div>
            <p className="text-xs text-muted-foreground">現在オンライン</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">スループット</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.realtime.currentThroughput}</div>
            <p className="text-xs text-muted-foreground">リクエスト/分</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均応答時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.realtime.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">過去5分間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">エラー率</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.realtime.errorRate * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">過去5分間</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector */}
      <Tabs value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1h">1時間</TabsTrigger>
          <TabsTrigger value="24h">24時間</TabsTrigger>
          <TabsTrigger value="7d">7日間</TabsTrigger>
          <TabsTrigger value="30d">30日間</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>応答時間の推移</CardTitle>
                <CardDescription>過去{selectedPeriod}の平均応答時間</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.summaries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString('ja-JP')}
                      formatter={(value: number) => [`${value}ms`, '応答時間']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="metrics.avgResponseTime" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>エラー率の推移</CardTitle>
                <CardDescription>過去{selectedPeriod}のエラー発生率</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.summaries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                    />
                    <YAxis tickFormatter={(value) => `${(value * 100).toFixed(1)}%`} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString('ja-JP')}
                      formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'エラー率']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="metrics.errorRate" 
                      stroke="#ff7300" 
                      fill="#ff7300"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Active Users Chart */}
            <Card>
              <CardHeader>
                <CardTitle>アクティブユーザー数</CardTitle>
                <CardDescription>過去{selectedPeriod}の同時接続ユーザー数</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.summaries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString('ja-JP')}
                      formatter={(value: number) => [`${value}人`, 'アクティブユーザー']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="metrics.activeUsers" 
                      stroke="#00c49f" 
                      fill="#00c49f"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Route Performance */}
            <Card>
              <CardHeader>
                <CardTitle>ルート別パフォーマンス</CardTitle>
                <CardDescription>各APIルートの応答時間</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(latestSummary?.breakdown.byRoute || {}).map(([route, data]) => ({
                    route: route.replace('/api/', ''),
                    avgTime: data.avgTime,
                    requests: data.requests,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'avgTime' ? `${value}ms` : value,
                        name === 'avgTime' ? '平均応答時間' : 'リクエスト数'
                      ]}
                    />
                    <Bar dataKey="avgTime" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Diagnosis Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>診断システムパフォーマンス</CardTitle>
              <CardDescription>各診断タイプの完了率と所要時間</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(latestSummary?.breakdown.byDiagnosis || {}).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold capitalize">{type}</h4>
                      <p className="text-sm text-muted-foreground">
                        完了率: {data.started > 0 ? Math.round((data.completed / data.started) * 100) : 0}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{data.completed}/{data.started}</div>
                      <div className="text-sm text-muted-foreground">平均{Math.round(data.avgTime / 1000)}秒</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}