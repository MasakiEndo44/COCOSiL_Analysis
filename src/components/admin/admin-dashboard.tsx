'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSession } from '@/lib/admin-middleware';
import { DiagnosisRecord, DiagnosisStats } from '@/types/admin';
import AdminHeader from './admin-header';
import DiagnosisTable from './diagnosis-table';
import StatsOverview from './stats-overview';

interface AdminDashboardProps {
  session: AdminSession;
}

export default function AdminDashboard({ session }: AdminDashboardProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'overview' | 'records' | 'stats' | 'export'>('overview');
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [stats, setStats] = useState<DiagnosisStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 診断記録と統計を並行で取得
      const [recordsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/records'),
        fetch('/api/admin/stats'),
      ]);

      if (!recordsResponse.ok || !statsResponse.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const [recordsData, statsData] = await Promise.all([
        recordsResponse.json(),
        statsResponse.json(),
      ]);

      setRecords(recordsData.records || []);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('データ取得エラー:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('ログアウトエラー:', err);
      // エラーが発生してもリダイレクトする
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-800 mb-2">エラーが発生しました</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        session={session} 
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード概要</h1>
            <StatsOverview stats={stats} />
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">最近の診断記録（最新10件）</h2>
              <DiagnosisTable 
                records={records.slice(0, 10)} 
                onEdit={(id) => console.log('Edit record:', id)}
                onDelete={(id) => console.log('Delete record:', id)}
              />
            </div>
          </div>
        )}

        {currentView === 'records' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">診断記録管理</h1>
            <DiagnosisTable 
              records={records} 
              onEdit={(id) => console.log('Edit record:', id)}
              onDelete={(id) => console.log('Delete record:', id)}
            />
          </div>
        )}

        {currentView === 'stats' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">統計分析</h1>
            <StatsOverview stats={stats} detailed />
          </div>
        )}

        {currentView === 'export' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">データ出力</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Excel出力機能は開発中です。</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}