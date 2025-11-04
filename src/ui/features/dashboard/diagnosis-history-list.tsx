import { db } from '@/lib/prisma';
import { DiagnosisHistoryCard } from './diagnosis-history-card';
import { LoadMoreButton } from './load-more-button';

interface DiagnosisHistoryListProps {
  userId: string;
  initialCursor?: number;
  limit?: number;
}

/**
 * DiagnosisHistoryList - Server Component
 *
 * Fetches and displays diagnosis history for authenticated user
 * with cursor-based pagination support
 *
 * Features:
 * - Server-side data fetching
 * - Cursor-based pagination (more performant than offset)
 * - Empty state handling
 * - Responsive grid layout
 */
export async function DiagnosisHistoryList({
  userId,
  initialCursor,
  limit = 20,
}: DiagnosisHistoryListProps) {
  // Fetch diagnosis records for this user
  const records = await db.diagnosisRecord.findMany({
    where: {
      clerkUserId: userId,
    },
    take: limit + 1, // Fetch one extra to determine if there are more
    cursor: initialCursor ? { id: initialCursor } : undefined,
    orderBy: {
      createdAt: 'desc', // Most recent first
    },
    select: {
      id: true,
      sessionId: true,
      date: true,
      name: true,
      birthDate: true,
      age: true,
      gender: true,
      mbti: true,
      mainTaiheki: true,
      subTaiheki: true,
      zodiac: true,
      animal: true,
      sixStar: true,
      isIntegratedReport: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Determine pagination state
  const hasMore = records.length > limit;
  const displayRecords = hasMore ? records.slice(0, -1) : records;
  const nextCursor = hasMore ? records[records.length - 2].id : null;

  // Empty state
  if (displayRecords.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block p-6 bg-white rounded-2xl shadow-sm">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            診断履歴がありません
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            まだ診断を受けていないか、診断データが移行中です
          </p>
          <a
            href="/diagnosis"
            className="inline-block px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
          >
            最初の診断を始める
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Record count */}
      <div className="text-sm text-gray-600">
        {displayRecords.length} 件の診断結果
        {hasMore && ' (さらに表示可能)'}
      </div>

      {/* Diagnosis cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayRecords.map((record) => (
          <DiagnosisHistoryCard key={record.id} record={record} />
        ))}
      </div>

      {/* Pagination: Load more button */}
      {hasMore && nextCursor && (
        <div className="flex justify-center pt-8">
          <LoadMoreButton cursor={nextCursor} />
        </div>
      )}
    </div>
  );
}
