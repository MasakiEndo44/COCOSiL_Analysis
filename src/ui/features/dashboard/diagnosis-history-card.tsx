import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DiagnosisRecord {
  id: number;
  sessionId: string | null;
  date: string;
  name: string;
  birthDate: string;
  age: number;
  gender: string;
  mbti: string;
  mainTaiheki: number;
  subTaiheki: number | null;
  zodiac: string;
  animal: string;
  sixStar: string;
  isIntegratedReport: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DiagnosisHistoryCardProps {
  record: DiagnosisRecord;
}

/**
 * DiagnosisHistoryCard
 *
 * Displays a summary card for a single diagnosis record
 *
 * Features:
 * - Key diagnosis information at a glance
 * - Visual indicators (icons, badges)
 * - Link to detailed view
 * - Responsive design
 */
export function DiagnosisHistoryCard({ record }: DiagnosisHistoryCardProps) {
  // Format dates
  const diagnosisDate = format(new Date(record.createdAt), 'yyyy年M月d日', { locale: ja });
  const timeAgo = format(new Date(record.createdAt), 'HH:mm', { locale: ja });

  // Gender display
  const genderLabel = {
    male: '男性',
    female: '女性',
    no_answer: '回答なし',
  }[record.gender] || record.gender;

  // Taiheki display
  const taihekiDisplay = record.subTaiheki
    ? `${record.mainTaiheki}-${record.subTaiheki}種`
    : `${record.mainTaiheki}種`;

  return (
    <Link
      href={`/dashboard/history/${record.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-brand-300 group"
    >
      <div className="p-6 space-y-4">
        {/* Header: Date and integrated badge */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{diagnosisDate}</p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
          {record.isIntegratedReport && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              統合診断
            </span>
          )}
        </div>

        {/* Name and basic info */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            {record.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {record.age}歳 · {genderLabel}
          </p>
        </div>

        {/* Diagnosis results summary */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* MBTI */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">MBTI</p>
            <p className="font-semibold text-blue-900">{record.mbti}</p>
          </div>

          {/* Taiheki */}
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">体癖</p>
            <p className="font-semibold text-green-900">{taihekiDisplay}</p>
          </div>

          {/* Zodiac */}
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">星座</p>
            <p className="font-semibold text-purple-900">{record.zodiac}</p>
          </div>

          {/* Animal */}
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">動物</p>
            <p className="font-semibold text-orange-900">{record.animal}</p>
          </div>
        </div>

        {/* Six Star */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-200">
          <p className="text-xs text-gray-600 mb-1">六星占術</p>
          <p className="font-semibold text-amber-900">{record.sixStar}</p>
        </div>

        {/* View details link */}
        <div className="flex items-center justify-end text-sm text-brand-600 group-hover:text-brand-700 font-medium pt-2">
          <span>詳細を見る</span>
          <svg
            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
