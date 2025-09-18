'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DiagnosisRecord } from '@/types/admin';
import { Save, X } from 'lucide-react';

const memoSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().min(1, 'メモ内容は必須です'),
  category: z.enum(['general', 'follow_up', 'improvement', 'concern'], {
    required_error: 'カテゴリーを選択してください',
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: '優先度を選択してください',
  }),
});

type MemoFormData = z.infer<typeof memoSchema>;

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DiagnosisRecord | null;
  onMemoSaved: () => void;
}

export default function MemoModal({
  isOpen,
  onClose,
  record,
  onMemoSaved,
}: MemoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MemoFormData>({
    resolver: zodResolver(memoSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: MemoFormData) => {
    if (!record) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/memos/${record.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recordId: record.id,
        }),
      });

      if (!response.ok) {
        throw new Error('メモの保存に失敗しました');
      }

      onMemoSaved();
      onClose();
    } catch (error) {
      console.error('Error saving memo:', error);
      alert('メモの保存に失敗しました');
    } finally {
      setIsSubmitting(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>メモ追加</DialogTitle>
          <DialogDescription>
            {record && `${record.name}さんの診断記録にメモを追加します`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="メモのタイトルを入力"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">カテゴリー</Label>
            <select
              id="category"
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">一般</option>
              <option value="follow_up">フォローアップ</option>
              <option value="improvement">改善提案</option>
              <option value="concern">懸念事項</option>
            </select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">優先度</Label>
            <select
              id="priority"
              {...register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
            {errors.priority && (
              <p className="text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">メモ内容</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="メモの内容を入力..."
              rows={4}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? '保存中...' : 'メモ保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}