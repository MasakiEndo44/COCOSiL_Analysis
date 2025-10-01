import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin-db';
import { requireAdminRole } from '@/lib/admin-middleware';
import { generateMarkdownFromRecord } from '@/lib/admin-diagnosis-converter';
import type { DiagnosisRecord } from '@/types/admin';

/**
 * 指定された診断記録にMarkdownを生成・保存するAPI
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminRole(request);

    const recordId = parseInt(params.id, 10);
    if (isNaN(recordId)) {
      return NextResponse.json(
        { success: false, error: '無効なレコードIDです' },
        { status: 400 }
      );
    }

    // レコードを取得
    const record = await adminDb.diagnosisRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'レコードが見つかりません' },
        { status: 404 }
      );
    }

    // Markdownを生成 - type cast for compatibility
    const markdownContent = generateMarkdownFromRecord(record as DiagnosisRecord);

    // レコードを更新
    const updatedRecord = await adminDb.diagnosisRecord.update({
      where: { id: recordId },
      data: {
        markdownContent,
        markdownVersion: '1.0',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Markdownが正常に生成されました',
      record: updatedRecord,
      markdownLength: markdownContent.length
    });

  } catch (error) {
    console.error('Markdown生成エラー:', error);

    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Markdownの生成に失敗しました' },
      { status: 500 }
    );
  }
}