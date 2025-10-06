'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DiagnosisRecord } from '@/types/admin';
import { Search, RefreshCw, Trash2 } from 'lucide-react';
import { Input } from '@/ui/components/ui/input';
import { Button } from '@/ui/components/ui/button';
import DiagnosisTable from './diagnosis-table';

interface EnhancedRecordsViewProps {
  onDelete?: (id: number) => void;
  onManageInterview?: (record: DiagnosisRecord) => void;
  userRole?: 'admin' | 'viewer';
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface RecordsResponse {
  success: boolean;
  records: DiagnosisRecord[];
  pagination: PaginationInfo;
}

export default function EnhancedRecordsView({
  onDelete,
  onManageInterview,
  userRole = 'admin'
}: EnhancedRecordsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [isSearching, setIsSearching] = useState(false);

  // Multi-select state management
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Alert/notification state for better user feedback
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const currentPage = useMemo(() => {
    return parseInt(searchParams.get('page') || '1', 10);
  }, [searchParams]);

  const fetchRecords = useCallback(async (page: number = 1, query: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (query.trim()) {
        params.set('query', query.trim());
      }

      const response = await fetch(`/api/admin/records?${params}`);

      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const data: RecordsResponse = await response.json();

      if (data.success) {
        setRecords(data.records);
        setPagination(data.pagination);
      } else {
        throw new Error('データの取得に失敗しました');
      }
    } catch (err) {
      console.error('Records fetch error:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      setRecords([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [pagination.limit]);

  // Fetch records when page or search query changes
  useEffect(() => {
    fetchRecords(currentPage, debouncedQuery);
  }, [currentPage, debouncedQuery, fetchRecords]);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedQuery.trim()) {
      params.set('query', debouncedQuery.trim());
      params.set('page', '1'); // Reset to first page on search
    } else {
      params.delete('query');
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router, searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset to first page
    if (searchQuery.trim()) {
      params.set('query', searchQuery.trim());
    } else {
      params.delete('query');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleRefresh = () => {
    fetchRecords(currentPage, debouncedQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const params = new URLSearchParams(searchParams);
    params.delete('query');
    params.set('page', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Multi-select handlers
  const toggleSelection = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const currentPageIds = records.map(record => record.id);
    const allCurrentSelected = currentPageIds.every(id => selectedIds.has(id));

    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (allCurrentSelected) {
        // Deselect all on current page
        currentPageIds.forEach(id => newSet.delete(id));
      } else {
        // Select all on current page
        currentPageIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const selectedCount = selectedIds.size;
    if (!confirm(`選択した ${selectedCount} 件の診断記録を削除してもよろしいですか？`)) {
      return;
    }

    setIsDeleting(true);
    setAlertMessage(null);
    
    try {
      // Batch delete using existing individual delete API
      const deletePromises = Array.from(selectedIds).map(async id => {
        const response = await fetch(`/api/admin/records/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error(`Failed to delete record ${id}: ${response.status} ${response.statusText}`);
        }
        return { id, success: true };
      });

      const results = await Promise.allSettled(deletePromises);
      const failures = results.filter(result => result.status === 'rejected');
      const successes = results.filter(result => result.status === 'fulfilled');

      if (failures.length > 0) {
        const ids = Array.from(selectedIds);
        const failureDetails = failures.map((failure, _index) => {
          const recordId = ids[results.indexOf(failure)];
          const errorMessage = failure.reason?.message || 'Unknown error';
          return `Record ${recordId}: ${errorMessage}`;
        }).join('\n');

        setAlertMessage({
          type: 'error',
          message: `${failures.length} 件の削除に失敗しました。${successes.length} 件は正常に削除されました。\n詳細:\n${failureDetails}`
        });
      } else {
        setAlertMessage({
          type: 'success',
          message: `${selectedCount} 件の診断記録を正常に削除しました。`
        });
      }

      // Clear selection and refresh data
      clearSelection();
      await fetchRecords(currentPage, debouncedQuery);
      
      // Auto-hide success message after 5 seconds
      if (failures.length === 0) {
        setTimeout(() => setAlertMessage(null), 5000);
      }
    } catch (error) {
      console.error('一括削除エラー:', error);
      setAlertMessage({
        type: 'error',
        message: `一括削除処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 7;
    const halfRange = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(pagination.pages, currentPage + halfRange);

    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxPagesToShow) {
      if (startPage === 1) {
        endPage = Math.min(pagination.pages, startPage + maxPagesToShow - 1);
      } else {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }

    // Previous button
    pages.push(
      <Button
        key="prev"
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        前へ
      </Button>
    );

    // First page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "primary" : "secondary"}
          size="sm"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-2">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "primary" : "secondary"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // Last page and ellipsis if needed
    if (endPage < pagination.pages) {
      if (endPage < pagination.pages - 1) {
        pages.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      pages.push(
        <Button
          key={pagination.pages}
          variant={currentPage === pagination.pages ? "primary" : "secondary"}
          size="sm"
          onClick={() => handlePageChange(pagination.pages)}
        >
          {pagination.pages}
        </Button>
      );
    }

    // Next button
    pages.push(
      <Button
        key="next"
        variant="secondary"
        size="sm"
        disabled={currentPage >= pagination.pages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        次へ
      </Button>
    );

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          {pagination.total} 件中 {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} 件を表示
        </div>
        <div className="flex items-center space-x-2">
          {pages}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">診断記録検索</h2>
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="ユーザー名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? '検索中...' : '検索'}
          </Button>
          {searchQuery && (
            <Button type="button" variant="secondary" onClick={handleClearSearch}>
              クリア
            </Button>
          )}
        </form>

        {debouncedQuery && (
          <div className="mt-3 text-sm text-gray-600">
            検索キーワード: <span className="font-medium">&ldquo;{debouncedQuery}&rdquo;</span>
            {!loading && ` (${pagination.total} 件見つかりました)`}
          </div>
        )}
      </div>

      {/* Alert/Notification Section */}
      {alertMessage && (
        <div 
          className={`rounded-lg p-4 ${
            alertMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className={`font-medium ${
            alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {alertMessage.type === 'success' ? '成功' : 'エラー'}
          </div>
          <div className={`text-sm mt-1 whitespace-pre-line ${
            alertMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {alertMessage.message}
          </div>
          {alertMessage.type === 'error' && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setAlertMessage(null)} 
              className="mt-3"
            >
              閉じる
            </Button>
          )}
        </div>
      )}

      {/* Results Section */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">エラーが発生しました</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <Button variant="secondary" size="sm" onClick={handleRefresh} className="mt-3">
            再試行
          </Button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <span className="ml-3 text-gray-600">データを読み込んでいます...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Bulk Action Toolbar */}
          {selectedIds.size > 0 && userRole === 'admin' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-blue-800 font-medium">
                  {selectedIds.size} 件選択中
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearSelection}
                >
                  選択解除
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isDeleting ? '削除中...' : '選択項目を削除'}</span>
              </Button>
            </div>
          )}

          <DiagnosisTable
            records={records}
            onDelete={onDelete}
            onManageInterview={onManageInterview}
            userRole={userRole}
            rowOffset={(currentPage - 1) * pagination.limit}
            // Multi-select props
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={toggleSelectAll}
          />

          {renderPagination()}
        </>
      )}
    </div>
  );
}