import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { adminDb } from '@/lib/admin-db';
import { requireAdminRole } from '@/lib/admin-middleware';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireAdminRole(request);

    const { format, includeStats, includeMasterData, dateRange } = await request.json();

    // データを取得
    let whereClause = {};
    if (dateRange?.start && dateRange?.end) {
      whereClause = {
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      };
    }

    const [records, stats] = await Promise.all([
      adminDb.diagnosisRecord.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      }),
      includeStats ? await getStats(whereClause) : null,
    ]);

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      
      // 診断記録シート
      const recordsSheet = workbook.addWorksheet('診断記録');
      
      // ヘッダーを設定
      const headers = [
        'ID', '診断日', '名前', '生年月日', '年齢', '性別', '星座', 
        'MBTI', '主体癖', '副体癖', '動物占い', '志向', '色', 
        '6星占術', 'テーマ', 'アドバイス', '満足度', '所要時間', 
        'フィードバック', 'レポートURL', 'インタビュー予定', 
        'インタビュー実施', '備考', '作成日時'
      ];
      
      recordsSheet.addRow(headers);
      
      // ヘッダーのスタイル設定
      const headerRow = recordsSheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // データ行を追加
      records.forEach(record => {
        recordsSheet.addRow([
          record.id,
          record.date,
          record.name,
          record.birthDate,
          record.age,
          record.gender === 'male' ? '男性' : record.gender === 'female' ? '女性' : '回答しない',
          record.zodiac,
          record.mbti,
          record.mainTaiheki,
          record.subTaiheki || '',
          record.animal,
          record.orientation === 'people_oriented' ? '人間指向' : 
          record.orientation === 'castle_oriented' ? '城指向' : '大局指向',
          record.color,
          record.sixStar,
          record.theme,
          record.advice,
          record.satisfaction,
          record.duration,
          record.feedback,
          record.reportUrl || '',
          record.interviewScheduled || '',
          record.interviewDone || '',
          record.memo || '',
          record.createdAt.toISOString().split('T')[0]
        ]);
      });
      
      // 列幅を自動調整
      headers.forEach((header, index) => {
        const column = recordsSheet.getColumn(index + 1);
        let maxLength = header.length;
        
        records.forEach(record => {
          const value = String(Object.values(record)[index] || '');
          if (value.length > maxLength) {
            maxLength = Math.min(value.length, 50);
          }
        });
        
        column.width = maxLength + 2;
      });

      // 統計シートを追加（オプション）
      if (includeStats && stats) {
        const statsSheet = workbook.addWorksheet('統計');
        
        // 基本統計
        statsSheet.addRow(['基本統計', '']);
        statsSheet.addRow(['総診断数', stats.totalRecords]);
        statsSheet.addRow(['平均満足度', stats.averageSatisfaction.toFixed(1)]);
        statsSheet.addRow(['平均所要時間', `${stats.averageDuration.toFixed(0)}分`]);
        statsSheet.addRow(['']);
        
        // 性別分布
        statsSheet.addRow(['性別分布', '']);
        Object.entries(stats.genderDistribution).forEach(([gender, count]) => {
          const genderLabel = gender === 'male' ? '男性' : gender === 'female' ? '女性' : '回答しない';
          statsSheet.addRow([genderLabel, count]);
        });
        statsSheet.addRow(['']);
        
        // MBTI分布
        statsSheet.addRow(['MBTI分布', '']);
        Object.entries(stats.mbtiDistribution).forEach(([type, count]) => {
          statsSheet.addRow([type, count]);
        });
        statsSheet.addRow(['']);
        
        // 満足度分布
        statsSheet.addRow(['満足度分布', '']);
        Object.entries(stats.satisfactionDistribution).forEach(([rating, count]) => {
          statsSheet.addRow([`${rating}星`, count]);
        });
        
        // スタイル設定
        const titleStyle = { bold: true, size: 12 };
        statsSheet.getRow(1).font = titleStyle;
        statsSheet.getRow(6).font = titleStyle;
        statsSheet.getRow(6 + Object.keys(stats.genderDistribution).length + 2).font = titleStyle;
        
        statsSheet.getColumn(1).width = 20;
        statsSheet.getColumn(2).width = 15;
      }

      // マスターデータシート（オプション）
      if (includeMasterData) {
        const masterSheet = workbook.addWorksheet('マスターデータ');
        
        const [animalMaster, mbtiMaster, _taihekiMaster] = await Promise.all([
          adminDb.animalMaster.findMany(),
          adminDb.mbtiMaster.findMany(),
          adminDb.taihekiMaster.findMany(),
        ]);
        
        // 動物占いマスター
        masterSheet.addRow(['動物占いマスター', '', '', '', '']);
        masterSheet.addRow(['動物', '志向', '特徴', '強み', '注意点']);
        animalMaster.forEach(animal => {
          masterSheet.addRow([animal.animal, animal.orientation, animal.trait, animal.strength, animal.caution]);
        });
        masterSheet.addRow(['']);
        
        // MBTIマスター
        const mbtiStartRow = masterSheet.lastRow?.number || 0;
        masterSheet.addRow(['MBTIマスター', '', '', '', '']);
        masterSheet.addRow(['タイプ', 'ニックネーム', '特徴', '強み', '注意点']);
        mbtiMaster.forEach(mbti => {
          masterSheet.addRow([mbti.type, mbti.nickname, mbti.trait, mbti.strength, mbti.caution]);
        });
        
        // スタイル設定
        const titleStyle = { bold: true, size: 12 };
        masterSheet.getRow(1).font = titleStyle;
        masterSheet.getRow(mbtiStartRow + 1).font = titleStyle;
      }

      // Excelファイルをバッファとして生成
      const buffer = await workbook.xlsx.writeBuffer();
      
      // ファイル名を生成
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `診断記録_${timestamp}.xlsx`;
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      });
      
    } else if (format === 'csv') {
      // CSV形式での出力
      const headers = [
        'ID', '診断日', '名前', '生年月日', '年齢', '性別', '星座', 
        'MBTI', '主体癖', '副体癖', '動物占い', '志向', '色', 
        '6星占術', 'テーマ', 'アドバイス', '満足度', '所要時間', 
        'フィードバック', '作成日時'
      ];
      
      let csvContent = headers.join(',') + '\n';
      
      records.forEach(record => {
        const row = [
          record.id,
          record.date,
          `"${record.name}"`,
          record.birthDate,
          record.age,
          record.gender === 'male' ? '男性' : record.gender === 'female' ? '女性' : '回答しない',
          record.zodiac,
          record.mbti,
          record.mainTaiheki,
          record.subTaiheki || '',
          record.animal,
          record.orientation === 'people_oriented' ? '人間指向' : 
          record.orientation === 'castle_oriented' ? '城指向' : '大局指向',
          record.color,
          record.sixStar,
          `"${record.theme}"`,
          `"${record.advice.replace(/"/g, '""')}"`,
          record.satisfaction,
          record.duration,
          `"${record.feedback.replace(/"/g, '""')}"`,
          record.createdAt.toISOString().split('T')[0]
        ];
        csvContent += row.join(',') + '\n';
      });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `診断記録_${timestamp}.csv`;
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: '無効な出力形式です' },
      { status: 400 }
    );

  } catch (error) {
    console.error('エクスポートエラー:', error);
    
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'データの出力に失敗しました' },
      { status: 500 }
    );
  }
}

// 統計データを取得する関数
async function getStats(whereClause: any) {
  const records = await adminDb.diagnosisRecord.findMany({
    where: whereClause,
  });

  if (records.length === 0) {
    return {
      totalRecords: 0,
      genderDistribution: {},
      mbtiDistribution: {},
      satisfactionDistribution: {},
      averageSatisfaction: 0,
      averageDuration: 0,
    };
  }

  const genderDistribution: Record<string, number> = {};
  const mbtiDistribution: Record<string, number> = {};
  const satisfactionDistribution: Record<string, number> = {};

  let totalSatisfaction = 0;
  let totalDurationMinutes = 0;
  let validDurationCount = 0;

  for (const record of records) {
    // 性別分布
    genderDistribution[record.gender] = (genderDistribution[record.gender] || 0) + 1;
    
    // MBTI分布
    mbtiDistribution[record.mbti] = (mbtiDistribution[record.mbti] || 0) + 1;
    
    // 満足度分布
    const satisfactionKey = `${record.satisfaction}`;
    satisfactionDistribution[satisfactionKey] = (satisfactionDistribution[satisfactionKey] || 0) + 1;
    totalSatisfaction += record.satisfaction;
    
    // 所要時間の平均計算
    const durationMinutes = parseDuration(record.duration);
    if (durationMinutes > 0) {
      totalDurationMinutes += durationMinutes;
      validDurationCount++;
    }
  }

  return {
    totalRecords: records.length,
    genderDistribution,
    mbtiDistribution,
    satisfactionDistribution,
    averageSatisfaction: totalSatisfaction / records.length,
    averageDuration: validDurationCount > 0 ? totalDurationMinutes / validDurationCount : 0,
  };
}

function parseDuration(duration: string): number {
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