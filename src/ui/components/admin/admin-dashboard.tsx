'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSession } from '@/lib/admin-middleware';
import { DiagnosisRecord, DiagnosisStats } from '@/types/admin';
import { AdminHeader } from './admin-header';
import StatsOverview from './stats-overview';
import { RecordFormModal } from './record-form-modal';
import { InterviewModal } from './interview-modal';
import { ExportForm } from './export-form';
import EnhancedRecordsView from './enhanced-records-view';
import { Button } from '@/ui/components/ui/button';
import { ExportOptions } from '@/types/admin';

interface AdminDashboardProps {
  session: AdminSession;
}

export default function AdminDashboard({ session }: AdminDashboardProps) {
  const router = useRouter();
  const [currentView, _setCurrentView] = useState<'overview' | 'records' | 'stats' | 'export'>('overview'); // Reserved for view switching feature
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [stats, setStats] = useState<DiagnosisStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DiagnosisRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewRecord, setInterviewRecord] = useState<DiagnosisRecord | null>(null);
  const [isInterviewSubmitting, setIsInterviewSubmitting] = useState(false);

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

  // Reserved for logout functionality (currently handled by AdminHeader)
  const _handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('ログアウトエラー:', err);
      // エラーが発生してもリダイレクトする
      router.push('/admin/login');
    }
  };

  // Reserved for inline edit functionality (currently handled by EnhancedRecordsView)
  const _handleEdit = (id: number) => {
    const record = records.find(r => r.id === id);
    if (record) {
      setEditingRecord(record);
      setIsFormModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この診断記録を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/records/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // レコード一覧から削除
      setRecords(prevRecords => prevRecords.filter(r => r.id !== id));
      
      // 統計データを再読み込み
      loadData();
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const url = editingRecord 
        ? `/api/admin/records/${editingRecord.id}`
        : '/api/admin/records';
      
      const method = editingRecord ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      // データを再読み込み
      await loadData();
      
      // モーダルを閉じる
      setIsFormModalOpen(false);
      setEditingRecord(null);
    } catch (err) {
      console.error('保存エラー:', err);
      alert('保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingRecord(null);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('エクスポートに失敗しました');
      }

      // ファイルをダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // ファイル名をレスポンスヘッダーから取得
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `診断記録_${new Date().toISOString().split('T')[0]}.${options.format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]*)['"]?/);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('エクスポートエラー:', err);
      alert('エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };


  const handleManageInterview = (record: DiagnosisRecord) => {
    setInterviewRecord(record);
    setIsInterviewModalOpen(true);
  };

  const handleInterviewSave = async (id: number, data: any) => {
    setIsInterviewSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/interviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('インタビュー情報の保存に失敗しました');
      }

      // レコードリストを更新
      setRecords(prev => prev.map(record => 
        record.id === id 
          ? { 
              ...record, 
              interviewScheduled: data.interviewScheduled || null,
              interviewDone: data.interviewDone || null,
              interviewNotes: data.interviewNotes || null
            }
          : record
      ));

      setIsInterviewModalOpen(false);
      setInterviewRecord(null);
      
    } catch (err) {
      console.error('インタビュー情報保存エラー:', err);
      alert('インタビュー情報の保存に失敗しました');
      throw err; // Re-throw to prevent modal from closing
    } finally {
      setIsInterviewSubmitting(false);
    }
  };


  const handleCloseInterviewModal = () => {
    setIsInterviewModalOpen(false);
    setInterviewRecord(null);
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
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">ダッシュボード概要</h1>
              {session.role === 'admin' && (
                <Button onClick={handleAddNew}>
                  新しい記録を追加
                </Button>
              )}
            </div>
            <StatsOverview stats={stats} />
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">診断記録一覧</h2>
              <EnhancedRecordsView
                onDelete={session.role === 'admin' ? handleDelete : undefined}
                onManageInterview={session.role === 'admin' ? handleManageInterview : undefined}
                userRole={session.role}
              />
            </div>
          </div>
        )}

        {currentView === 'records' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">診断記録管理</h1>
              {session.role === 'admin' && (
                <Button onClick={handleAddNew}>
                  新しい記録を追加
                </Button>
              )}
            </div>
            <EnhancedRecordsView
              onDelete={session.role === 'admin' ? handleDelete : undefined}
              onManageInterview={session.role === 'admin' ? handleManageInterview : undefined}
              userRole={session.role}
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
            {session.role === 'admin' ? (
              <ExportForm 
                onExport={handleExport}
                isLoading={isExporting}
              />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">管理者権限が必要です</h3>
                <p className="text-yellow-600">データエクスポート機能は管理者のみ利用できます。</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      <RecordFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        record={editingRecord}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />
      
      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={handleCloseInterviewModal}
        record={interviewRecord}
        onSave={handleInterviewSave}
        isLoading={isInterviewSubmitting}
      />
    </div>
  );
}