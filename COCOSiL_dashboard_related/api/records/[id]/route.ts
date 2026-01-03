import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin-db';
import { requireAdminAuth, requireAdminRole } from '@/lib/admin-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth(request);

    const recordId = parseInt(params.id, 10);
    if (isNaN(recordId)) {
      return NextResponse.json(
        { success: false, error: '無効なレコードIDです' },
        { status: 400 }
      );
    }

    const record = await adminDb.diagnosisRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'レコードが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      record,
    });

  } catch (error) {
    console.error('診断記録取得エラー:', error);
    
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: '診断記録の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const data = await request.json();

    const record = await adminDb.diagnosisRecord.update({
      where: { id: recordId },
      data: {
        date: data.date,
        name: data.name,
        birthDate: data.birthDate,
        age: data.age,
        gender: data.gender,
        zodiac: data.zodiac,
        animal: data.animal,
        orientation: data.orientation,
        color: data.color,
        mbti: data.mbti,
        mainTaiheki: data.mainTaiheki,
        subTaiheki: data.subTaiheki,
        sixStar: data.sixStar,
        theme: data.theme,
        advice: data.advice || '',
        satisfaction: data.satisfaction,
        duration: data.duration,
        feedback: data.feedback || '',
        reportUrl: data.reportUrl,
        interviewScheduled: data.interviewScheduled,
        interviewDone: data.interviewDone,
        memo: data.memo,
      },
    });

    return NextResponse.json({
      success: true,
      record,
    });

  } catch (error) {
    console.error('診断記録更新エラー:', error);
    
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'レコードが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: '診断記録の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await adminDb.diagnosisRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({
      success: true,
      message: 'レコードが削除されました',
    });

  } catch (error) {
    console.error('診断記録削除エラー:', error);
    
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'レコードが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: '診断記録の削除に失敗しました' },
      { status: 500 }
    );
  }
}