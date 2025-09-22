import { getServerAdminSession } from '@/lib/admin-session-server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { RecordEditForm } from '@/ui/features/admin/record-edit-form';
import type { DiagnosisRecord } from '@/types/admin';

interface EditRecordPageProps {
  params: {
    id: string;
  };
}

async function getRecord(id: string): Promise<DiagnosisRecord | null> {
  try {
    const prismaRecord = await db.diagnosisRecord.findUnique({
      where: { id: parseInt(id) },
    });

    if (!prismaRecord) return null;

    // Prismaの型をDiagnosisRecord型に変換（型アサーション）
    const record = prismaRecord as DiagnosisRecord;

    return record;
  } catch (error) {
    console.error('Failed to fetch record:', error);
    return null;
  }
}

export default async function EditRecordPage({ params }: EditRecordPageProps) {
  // 認証チェック
  const session = await getServerAdminSession();
  if (!session) {
    redirect('/admin');
  }

  // レコード取得
  const record = await getRecord(params.id);
  if (!record) {
    redirect('/admin?error=record-not-found');
  }

  return (
    <PageTag route={`/admin/records/${params.id}/edit`} description="診断記録編集ページ">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* ヘッダー */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <a href="/admin" className="hover:text-gray-700">管理者ダッシュボード</a>
              <span>/</span>
              <span className="text-gray-900">診断記録編集</span>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">診断記録編集</h1>
                <p className="text-gray-600 mt-1">
                  {record.name}さんの診断記録（ID: {record.id}）
                </p>
              </div>
              <a
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                一覧に戻る
              </a>
            </div>
          </div>

          {/* 編集フォーム */}
          <RecordEditForm record={record} />
        </div>
      </div>
    </PageTag>
  );
}