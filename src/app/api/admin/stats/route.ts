import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin-db';
import { requireAdminAuth } from '@/lib/admin-middleware';
import { DiagnosisStats } from '@/types/admin';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    // 全レコード数を取得
    const totalRecords = await adminDb.diagnosisRecord.count();

    if (totalRecords === 0) {
      // データがない場合は空の統計を返す
      const emptyStats: DiagnosisStats = {
        totalRecords: 0,
        genderDistribution: {},
        ageGroups: {},
        animalDistribution: {},
        orientationDistribution: {},
        satisfactionDistribution: {},
        themeDistribution: {},
        mbtiDistribution: {},
        taihekiDistribution: {},
        sixStarDistribution: {},
        averageSatisfaction: 0,
        averageDuration: 0,
      };

      return NextResponse.json(emptyStats);
    }

    // 全レコードを取得（統計計算のため）
    const records = await adminDb.diagnosisRecord.findMany();

    // 統計計算
    const genderDistribution: Record<string, number> = {};
    const ageGroups: Record<string, number> = {};
    const animalDistribution: Record<string, number> = {};
    const orientationDistribution: Record<string, number> = {};
    const satisfactionDistribution: Record<string, number> = {};
    const themeDistribution: Record<string, number> = {};
    const mbtiDistribution: Record<string, number> = {};
    const taihekiDistribution: Record<string, number> = {};
    const sixStarDistribution: Record<string, number> = {};

    let totalSatisfaction = 0;
    let totalDurationMinutes = 0;
    let validDurationCount = 0;

    for (const record of records) {
      // 性別分布
      genderDistribution[record.gender] = (genderDistribution[record.gender] || 0) + 1;

      // 年齢グループ分布
      const ageGroup = getAgeGroup(record.age);
      ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;

      // 動物占い分布
      animalDistribution[record.animal] = (animalDistribution[record.animal] || 0) + 1;

      // 志向分布
      orientationDistribution[record.orientation] = (orientationDistribution[record.orientation] || 0) + 1;

      // 満足度分布
      const satisfactionKey = `${record.satisfaction}`;
      satisfactionDistribution[satisfactionKey] = (satisfactionDistribution[satisfactionKey] || 0) + 1;
      totalSatisfaction += record.satisfaction;

      // テーマ分布（カンマ区切りで分割）
      const themes = record.theme.split(',').map(t => t.trim()).filter(t => t);
      for (const theme of themes) {
        themeDistribution[theme] = (themeDistribution[theme] || 0) + 1;
      }

      // MBTI分布
      mbtiDistribution[record.mbti] = (mbtiDistribution[record.mbti] || 0) + 1;

      // 体癖分布（主体癖のみ）
      const taihekiKey = `${record.mainTaiheki}種`;
      taihekiDistribution[taihekiKey] = (taihekiDistribution[taihekiKey] || 0) + 1;

      // 6星占術分布
      sixStarDistribution[record.sixStar] = (sixStarDistribution[record.sixStar] || 0) + 1;

      // 所要時間の平均計算
      const durationMinutes = parseDuration(record.duration);
      if (durationMinutes > 0) {
        totalDurationMinutes += durationMinutes;
        validDurationCount++;
      }
    }

    const stats: DiagnosisStats = {
      totalRecords,
      genderDistribution,
      ageGroups,
      animalDistribution,
      orientationDistribution,
      satisfactionDistribution,
      themeDistribution,
      mbtiDistribution,
      taihekiDistribution,
      sixStarDistribution,
      averageSatisfaction: totalSatisfaction / totalRecords,
      averageDuration: validDurationCount > 0 ? totalDurationMinutes / validDurationCount : 0,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('統計取得エラー:', error);
    
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: '統計データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

function getAgeGroup(age: number): string {
  if (age < 20) return '10代';
  if (age < 30) return '20代';
  if (age < 40) return '30代';
  if (age < 50) return '40代';
  if (age < 60) return '50代';
  if (age < 70) return '60代';
  return '70代以上';
}

function parseDuration(duration: string): number {
  // "45分", "1時間30分" などの形式を分に変換
  const hourMatch = duration.match(/(\d+)時間/);
  const minuteMatch = duration.match(/(\d+)分/);
  
  let totalMinutes = 0;
  
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }
  
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }
  
  return totalMinutes;
}