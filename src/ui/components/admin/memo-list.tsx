'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DiagnosisRecord } from '@/types/admin';
import { MessageSquare, Edit, Trash2, Plus, Clock, Flag } from 'lucide-react';

interface Memo {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoListProps {
  isOpen: boolean;
  onClose: () => void;
  record: DiagnosisRecord | null;
  onAddMemo: () => void;
}

export default function MemoList({
  isOpen,
  onClose,
  record,
  onAddMemo,
}: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      fetchMemos();
    }
  }, [isOpen, record]);

  const fetchMemos = async () => {
    if (!record) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/memos/${record.id}`);
      if (response.ok) {
        const data = await response.json();
        setMemos(data.memos || []);
      }
    } catch (error) {
      console.error('Error fetching memos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMemo = async (memoId: number) => {
    if (!confirm('このメモを削除しますか？')) return;

    try {
      const response = await fetch(`/api/admin/memos/${memoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMemos(memos.filter(memo => memo.id !== memoId));
      } else {
        alert('メモの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting memo:', error);
      alert('メモの削除に失敗しました');
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      general: '一般',
      follow_up: 'フォローアップ',
      improvement: '改善提案',
      concern: '懸念事項',
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getPriorityLabel = (priority: string) => {
    const priorities = {
      low: '低',
      medium: '中',
      high: '高',
    };
    return priorities[priority as keyof typeof priorities] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      follow_up: 'bg-green-100 text-green-800',
      improvement: 'bg-purple-100 text-purple-800',
      concern: 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            メモ一覧
          </DialogTitle>
          <DialogDescription>
            {record && `${record.name}さんの診断記録に関するメモ`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {memos.length}件のメモが登録されています
            </p>
            <Button onClick={onAddMemo} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              新規メモ追加
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">メモを読み込み中...</p>
            </div>
          ) : memos.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">まだメモが登録されていません</p>
              <Button onClick={onAddMemo} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                最初のメモを追加
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {memos.map((memo) => (
                <div
                  key={memo.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {memo.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
                        >
                          {getCategoryLabel(memo.category)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(memo.priority)}`}
                        >
                          <Flag className="w-3 h-3 mr-1" />
                          {getPriorityLabel(memo.priority)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => deleteMemo(memo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {memo.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        作成: {formatDate(memo.createdAt)}
                      </span>
                      {memo.updatedAt !== memo.createdAt && (
                        <span className="flex items-center gap-1">
                          <Edit className="w-3 h-3" />
                          更新: {formatDate(memo.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}