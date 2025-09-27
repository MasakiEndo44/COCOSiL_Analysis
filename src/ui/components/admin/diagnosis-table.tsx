'use client';

import { useState } from 'react';
import { DiagnosisRecord } from '@/types/admin';
import { Edit, Trash2, Calendar, MessageSquare, Eye } from 'lucide-react';
import { ORIENTATION_LABELS } from '@/lib/data/animal-fortune-mapping';
import { AdminMarkdownModal } from './admin-markdown-modal';

interface DiagnosisTableProps {
  records: DiagnosisRecord[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onManageInterview?: (record: DiagnosisRecord) => void;
  userRole?: 'admin' | 'viewer';
  rowOffset?: number;
  // Multi-select props
  selectedIds?: Set<number>;
  onToggleSelection?: (id: number) => void;
  onToggleSelectAll?: () => void;
}

export default function DiagnosisTable({
  records,
  onEdit,
  onDelete,
  onManageInterview,
  userRole = 'admin',
  rowOffset = 0,
  selectedIds = new Set(),
  onToggleSelection,
  onToggleSelectAll
}: DiagnosisTableProps) {
  const [selectedMarkdown, setSelectedMarkdown] = useState<{ record: DiagnosisRecord; isOpen: boolean }>({ record: {} as DiagnosisRecord, isOpen: false });

  const handleShowMarkdown = (record: DiagnosisRecord) => {
    setSelectedMarkdown({ record, isOpen: true });
  };

  const handleCloseMarkdown = () => {
    setSelectedMarkdown({ record: {} as DiagnosisRecord, isOpen: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return '男性';
      case 'female': return '女性';
      default: return '未回答';
    }
  };

  const getOrientationLabel = (orientation: string) => {
    return ORIENTATION_LABELS[orientation as keyof typeof ORIENTATION_LABELS] || orientation;
  };

  const getSatisfactionStars = (satisfaction: number) => {
    return '★'.repeat(satisfaction) + '☆'.repeat(5 - satisfaction);
  };

  const getInterviewStatus = (record: DiagnosisRecord) => {
    if (record.interviewDone) {
      return { 
        status: 'completed', 
        label: '実施済み', 
        color: 'bg-green-100 text-green-800',
        icon: MessageSquare
      };
    } else if (record.interviewScheduled) {
      const scheduledDate = new Date(record.interviewScheduled);
      const now = new Date();
      if (scheduledDate < now) {
        return { 
          status: 'overdue', 
          label: '予定超過', 
          color: 'bg-red-100 text-red-800',
          icon: Calendar
        };
      } else {
        return { 
          status: 'scheduled', 
          label: '予定済み', 
          color: 'bg-blue-100 text-blue-800',
          icon: Calendar
        };
      }
    } else {
      return { 
        status: 'none', 
        label: '未予定', 
        color: 'bg-gray-100 text-gray-800',
        icon: Calendar
      };
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">診断記録がありません。</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox column for multi-select */}
              {onToggleSelection && (
                <th scope="col" className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={records.length > 0 && records.every(record => selectedIds.has(record.id))}
                    ref={(input) => {
                      if (input) {
                        const someSelected = records.some(record => selectedIds.has(record.id));
                        const allSelected = records.length > 0 && records.every(record => selectedIds.has(record.id));
                        input.indeterminate = someSelected && !allSelected;
                      }
                    }}
                    onChange={onToggleSelectAll}
                    aria-label="Select all diagnoses"
                  />
                </th>
              )}
              <th className="w-16 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                診断日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                基本情報
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MBTI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                体癖
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                動物占い
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                6星占術
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                満足度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                インタビュー
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Markdown
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record, index) => {
              const isSelected = selectedIds.has(record.id);
              const rowId = `record-${record.id}`;

              return (
                <tr key={record.id} className="hover:bg-gray-50" aria-selected={isSelected}>
                  {/* Checkbox column */}
                  {onToggleSelection && (
                    <td className="w-10 px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={isSelected}
                        onChange={() => onToggleSelection(record.id)}
                        aria-labelledby={`${rowId}-label`}
                      />
                    </td>
                  )}
                  <td className="w-16 px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {rowOffset + index + 1}
                  </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(record.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div id={`${rowId}-label`} className="text-sm text-gray-900">{record.name}</div>
                  <div className="text-sm text-gray-500">
                    {record.age}歳 / {getGenderLabel(record.gender)}
                  </div>
                  <div className="text-sm text-gray-500">{record.zodiac}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {record.mbti}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    主: {record.mainTaiheki}種
                  </div>
                  {record.subTaiheki && (
                    <div className="text-sm text-gray-500">
                      副: {record.subTaiheki}種
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{record.animal}</div>
                  <div className="text-sm text-gray-500">
                    {getOrientationLabel(record.orientation)}
                  </div>
                  <div className="text-sm text-gray-500">{record.color}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {record.sixStar}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getSatisfactionStars(record.satisfaction)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {record.duration}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const status = getInterviewStatus(record);
                    const Icon = status.icon;
                    return (
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <Icon className="mr-1 h-3 w-3" />
                          {status.label}
                        </span>
                        {onManageInterview && (
                          <button
                            onClick={() => onManageInterview(record)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="インタビュー管理"
                          >
                            <Calendar size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {record.markdownContent ? (
                    <button
                      onClick={() => handleShowMarkdown(record)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                      title="診断結果Markdownを表示"
                    >
                      <Eye size={16} />
                    </button>
                  ) : (
                    <span className="text-gray-400" title="Markdownコンテンツなし">
                      <Eye size={16} className="opacity-30" />
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* Edit and Delete buttons - only for admin role */}
                    {userRole === 'admin' && (
                      <a
                        href={`/admin/records/${record.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 inline-block"
                        title="編集"
                      >
                        <Edit size={16} />
                      </a>
                    )}
                    {userRole === 'admin' && onDelete && (
                      <button
                        onClick={() => onDelete(record.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {records.length > 10 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {records.length}件中 最大10件を表示しています
          </p>
        </div>
      )}

      {/* Markdown Modal */}
      <AdminMarkdownModal
        isOpen={selectedMarkdown.isOpen}
        onClose={handleCloseMarkdown}
        markdownContent={selectedMarkdown.record.markdownContent || ''}
        recordName={selectedMarkdown.record.name}
        recordId={selectedMarkdown.record.id}
      />
    </div>
  );
}