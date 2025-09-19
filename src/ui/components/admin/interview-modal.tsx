'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';
import { DiagnosisRecord } from '@/types/admin';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DiagnosisRecord | null;
  onSave: (id: number, data: InterviewData) => Promise<void>;
  isLoading?: boolean;
}

interface InterviewData {
  interviewScheduled?: string;
  interviewDone?: string;
  interviewNotes?: string;
}

export function InterviewModal({ 
  isOpen, 
  onClose, 
  record, 
  onSave, 
  isLoading = false 
}: InterviewModalProps) {
  const [formData, setFormData] = useState<InterviewData>({
    interviewScheduled: '',
    interviewDone: '',
    interviewNotes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (record && isOpen) {
      setFormData({
        interviewScheduled: record.interviewScheduled || '',
        interviewDone: record.interviewDone || '',
        interviewNotes: record.interviewNotes || ''
      });
      setErrors({});
    }
  }, [record, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!record) return;

    // 基本的なバリデーション
    const newErrors: Record<string, string> = {};
    
    if (formData.interviewScheduled && formData.interviewDone) {
      const scheduledDate = new Date(formData.interviewScheduled);
      const doneDate = new Date(formData.interviewDone);
      if (doneDate < scheduledDate) {
        newErrors.interviewDone = '実施日は予定日以降である必要があります';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(record.id, formData);
      onClose();
    } catch (error) {
      console.error('インタビュー情報の保存に失敗:', error);
    }
  };

  const handleChange = (field: keyof InterviewData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDateTimeLocal = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const getInterviewStatus = () => {
    if (formData.interviewDone) {
      return { status: 'completed', label: '実施済み', color: 'text-green-600' };
    } else if (formData.interviewScheduled) {
      return { status: 'scheduled', label: '予定済み', color: 'text-blue-600' };
    } else {
      return { status: 'none', label: '未予定', color: 'text-gray-500' };
    }
  };

  if (!isOpen) return null;

  const status = getInterviewStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              インタビュー管理
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {record?.name} さん ({record?.date})
            </p>
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
              {status.status === 'completed' && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
              )}
              {status.status === 'scheduled' && (
                <Clock className="ml-2 h-4 w-4 text-blue-600" />
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* インタビュー予定日 */}
          <div>
            <Label htmlFor="interviewScheduled" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              インタビュー予定日時
            </Label>
            <Input
              id="interviewScheduled"
              type="datetime-local"
              value={formatDateTimeLocal(formData.interviewScheduled || '')}
              onChange={(e) => handleChange('interviewScheduled', e.target.value)}
              className="mt-1"
            />
            {errors.interviewScheduled && (
              <p className="mt-1 text-sm text-red-600">{errors.interviewScheduled}</p>
            )}
          </div>

          {/* インタビュー実施日 */}
          <div>
            <Label htmlFor="interviewDone" className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              インタビュー実施日時
            </Label>
            <Input
              id="interviewDone"
              type="datetime-local"
              value={formatDateTimeLocal(formData.interviewDone || '')}
              onChange={(e) => handleChange('interviewDone', e.target.value)}
              className="mt-1"
            />
            {errors.interviewDone && (
              <p className="mt-1 text-sm text-red-600">{errors.interviewDone}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              実施後に入力してください
            </p>
          </div>

          {/* インタビューメモ */}
          <div>
            <Label htmlFor="interviewNotes">
              インタビューメモ・フィードバック
            </Label>
            <Textarea
              id="interviewNotes"
              value={formData.interviewNotes}
              onChange={(e) => handleChange('interviewNotes', e.target.value)}
              className="mt-1"
              rows={4}
              placeholder="インタビューの内容、気づいた点、フォローアップが必要な事項などを記録してください..."
            />
          </div>

          {/* 診断結果サマリー（参考情報） */}
          {record && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">診断結果サマリー（参考）</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">MBTI:</span> {record.mbti}
                </div>
                <div>
                  <span className="text-gray-600">体癖:</span> {record.mainTaiheki}種
                  {record.subTaiheki && ` (副: ${record.subTaiheki}種)`}
                </div>
                <div>
                  <span className="text-gray-600">動物占い:</span> {record.animal}
                </div>
                <div>
                  <span className="text-gray-600">満足度:</span> {'★'.repeat(record.satisfaction)}
                </div>
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}