import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin-db';
import { requireAdminAuth, requireAdminRole } from '@/lib/admin-middleware';
import { generateMarkdownFromRecord } from '@/lib/admin-diagnosis-converter';
import type { DiagnosisRecord } from '@/types/admin';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const query = searchParams.get('query') || '';
    const skip = (page - 1) * limit;

    // Build search condition
    const whereCondition = query ? {
      name: {
        contains: query,
        mode: 'insensitive' as const
      }
    } : {};

    const [records, total] = await Promise.all([
      adminDb.diagnosisRecord.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      adminDb.diagnosisRecord.count({
        where: whereCondition,
      }),
    ]);

    return NextResponse.json({
      success: true,
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
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

export async function POST(request: NextRequest) {
  try {
    await requireAdminRole(request);

    const data = await request.json();

    const record = await adminDb.diagnosisRecord.create({
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
        advice: data.advice,
        satisfaction: data.satisfaction,
        duration: data.duration,
        feedback: data.feedback,
        reportUrl: data.reportUrl,
        interviewScheduled: data.interviewScheduled,
        interviewDone: data.interviewDone,
        memo: data.memo,
      },
    });

    // Generate and save markdown content - type cast for compatibility
    try {
      const markdownContent = generateMarkdownFromRecord(record as DiagnosisRecord);
      await adminDb.diagnosisRecord.update({
        where: { id: record.id },
        data: {
          markdownContent,
          markdownVersion: '1.0'
        }
      });
    } catch (markdownError) {
      console.error('Failed to generate markdown for new record:', markdownError);
      // Continue without failing the entire operation
    }

    return NextResponse.json({
      success: true,
      record,
    });

  } catch (error) {
    console.error('診断記録作成エラー:', error);
    
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: '診断記録の作成に失敗しました' },
      { status: 500 }
    );
  }
}