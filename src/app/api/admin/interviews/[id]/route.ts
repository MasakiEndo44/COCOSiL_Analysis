import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/admin-middleware';

// PUT /api/admin/interviews/[id] - インタビュー情報の更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証確認とadmin権限チェック
    await requireAdminRole(request);

    const recordId = parseInt(params.id);
    if (isNaN(recordId)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const body = await request.json();
    const { interviewScheduled, interviewDone, interviewNotes: _interviewNotes } = body;

    // 日付フォーマットのバリデーション
    if (interviewScheduled && isNaN(Date.parse(interviewScheduled))) {
      return NextResponse.json({ error: '無効な予定日です' }, { status: 400 });
    }

    if (interviewDone && isNaN(Date.parse(interviewDone))) {
      return NextResponse.json({ error: '無効な実施日です' }, { status: 400 });
    }

    // 予定日と実施日の論理チェック
    if (interviewScheduled && interviewDone) {
      const scheduledDate = new Date(interviewScheduled);
      const doneDate = new Date(interviewDone);
      if (doneDate < scheduledDate) {
        return NextResponse.json({ 
          error: '実施日は予定日以降である必要があります' 
        }, { status: 400 });
      }
    }

    // 該当レコードの存在確認
    const existingRecord = await db.diagnosisRecord.findUnique({
      where: { id: recordId }
    });

    if (!existingRecord) {
      return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 });
    }

    // インタビュー情報の更新
    const updatedRecord = await db.diagnosisRecord.update({
      where: { id: recordId },
      data: {
        interviewScheduled: interviewScheduled || null,
        interviewDone: interviewDone || null,

        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      record: {
        id: updatedRecord.id,
        interviewScheduled: updatedRecord.interviewScheduled,
        interviewDone: updatedRecord.interviewDone,
      }
    });

  } catch (error) {
    console.error('インタビュー情報更新エラー:', error);
    return NextResponse.json(
      { error: 'インタビュー情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// GET /api/admin/interviews/[id] - 特定のインタビュー情報取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証確認とadmin権限チェック
    await requireAdminRole(request);

    const recordId = parseInt(params.id);
    if (isNaN(recordId)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    // インタビュー情報取得
    const record = await db.diagnosisRecord.findUnique({
      where: { id: recordId },
      select: {
        id: true,
        name: true,
        date: true,
        interviewScheduled: true,
        interviewDone: true,
        // 診断結果の参考情報
        mbti: true,
        mainTaiheki: true,
        subTaiheki: true,
        animal: true,
        satisfaction: true,
      }
    });

    if (!record) {
      return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ record });

  } catch (error) {
    console.error('インタビュー情報取得エラー:', error);
    return NextResponse.json(
      { error: 'インタビュー情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}