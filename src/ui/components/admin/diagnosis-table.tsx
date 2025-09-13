'use client';

import { DiagnosisRecord } from '@/types/admin';
import { Edit, Trash2, ExternalLink } from 'lucide-react';

interface DiagnosisTableProps {
  records: DiagnosisRecord[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function DiagnosisTable({ records, onEdit, onDelete }: DiagnosisTableProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">診断記録がありません。</p>
      </div>
    );
  }

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
    switch (orientation) {
      case 'people_oriented': return '人間指向';
      case 'castle_oriented': return '城指向';
      case 'big_vision_oriented': return '大局指向';
      default: return orientation;
    }
  };

  const getSatisfactionStars = (satisfaction: number) => {
    return '★'.repeat(satisfaction) + '☆'.repeat(5 - satisfaction);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(record.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{record.name}</div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {record.reportUrl && (
                      <a
                        href={record.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-900 p-1 rounded hover:bg-brand-50"
                        title="レポートを表示"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => onEdit(record.id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="編集"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(record.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
    </div>
  );
}