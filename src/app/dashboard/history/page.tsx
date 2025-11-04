import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DiagnosisHistoryList } from '@/features/dashboard/diagnosis-history-list';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '診断履歴 | COCOSiL',
  description: 'あなたの診断履歴を確認できます',
};

/**
 * Diagnosis History Dashboard Page
 *
 * Server Component that displays user's diagnosis history
 * with authentication protection and pagination support
 *
 * Features:
 * - Server-side authentication check
 * - Cursor-based pagination via searchParams
 * - Responsive grid layout
 * - Empty state handling
 */
export default async function DiagnosisHistoryPage({
  searchParams,
}: {
  searchParams: { cursor?: string; limit?: string };
}) {
  // Server-side authentication check
  const { userId } = await auth();

  if (!userId) {
    // Not authenticated - redirect to sign-in
    redirect('/sign-in?redirect_url=/dashboard/history');
  }

  // Parse pagination parameters
  const cursor = searchParams.cursor ? parseInt(searchParams.cursor, 10) : undefined;
  const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 20;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">診断履歴</h1>
              <p className="mt-2 text-sm text-gray-600">
                これまでの診断結果を確認できます
              </p>
            </div>
            <a
              href="/diagnosis"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
            >
              新しい診断を始める
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DiagnosisHistoryList
          userId={userId}
          initialCursor={cursor}
          limit={limit}
        />
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center text-sm text-gray-500">
        <p>診断結果はあくまで参考情報です</p>
      </footer>
    </div>
  );
}
