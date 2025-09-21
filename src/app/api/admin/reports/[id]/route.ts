import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin-db';
import { requireAdminAuth } from '@/lib/admin-middleware';
import { generateIntegratedReport, convertToDbRecord } from '@/lib/integrated-report-service';
import type { MBTIResult, TaihekiResult, FortuneResult, MBTIType, TaihekiType, SecondaryTaihekiType } from '@/types';

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

    // 統合レポートが既に生成されている場合はそれを使用
    if (record.isIntegratedReport && record.aiSummary) {
      const htmlReport = generateIntegratedHTMLReport(record);

      return new NextResponse(htmlReport, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="統合診断レポート_${record.name}_${record.date}.html"`,
        },
      });
    }

    // レガシー形式の場合は基本レポートを生成
    const htmlReport = generateHTMLReport(record);

    return new NextResponse(htmlReport, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="診断レポート_${record.name}_${record.date}.html"`,
      },
    });

  } catch (error) {
    console.error('レポート取得エラー:', error);

    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'レポートの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // 既存データを統合診断形式に変換
    const mbtiResult: MBTIResult = {
      type: record.mbti as MBTIType,
      source: 'known',
      confidence: 1.0
    };

    const taihekiResult: TaihekiResult = {
      primary: record.mainTaiheki as TaihekiType,
      secondary: (record.subTaiheki || 0) as SecondaryTaihekiType,
      scores: {} as Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, number>,
      characteristics: [`${record.mainTaiheki}種体癖の特徴`],
      recommendations: []
    };

    const fortuneResult: FortuneResult = {
      zodiac: record.zodiac,
      animal: record.animal,
      sixStar: record.sixStar,
      element: '不明',
      fortune: '不明',
      characteristics: []
    };

    // 統合レポート生成
    const { reportData } = await generateIntegratedReport(
      {
        id: record.id,
        date: record.date,
        name: record.name,
        birthDate: record.birthDate,
        age: record.age,
        gender: record.gender,
        zodiac: record.zodiac
      },
      mbtiResult,
      taihekiResult,
      fortuneResult,
      {
        theme: record.theme,
        advice: record.advice,
        satisfaction: record.satisfaction,
        duration: record.duration,
        feedback: record.feedback
      }
    );

    // データベースに統合情報を更新
    const dbRecord = convertToDbRecord(reportData);
    const reportUrl = `/api/admin/reports/${recordId}`;

    await adminDb.diagnosisRecord.update({
      where: { id: recordId },
      data: {
        ...dbRecord,
        reportUrl
      },
    });

    return NextResponse.json({
      success: true,
      reportUrl,
      message: '統合レポートが生成されました',
      reportVersion: reportData.reportVersion,
      keywordsCount: reportData.integratedKeywords.length,
      isIntegratedReport: true
    });

  } catch (error) {
    console.error('統合レポート生成エラー:', error);

    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: '統合レポート生成に失敗しました' },
      { status: 500 }
    );
  }
}

// 統合レポート用HTML生成
function generateIntegratedHTMLReport(record: any): string {
  const keywords = record.integratedKeywords ? JSON.parse(record.integratedKeywords) : [];
  const genderText = record.gender === 'male' ? '男性' :
                     record.gender === 'female' ? '女性' : '回答しない';
  const satisfactionStars = '★'.repeat(record.satisfaction) +
                           '☆'.repeat(5 - record.satisfaction);

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>COCOSiL 統合診断レポート - ${record.name}様</title>
    <style>
        body {
            font-family: 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro W3', Meiryo, sans-serif;
            line-height: 1.8;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #fafafa;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2.5rem;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 1.1rem;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 8px;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .info-item .label {
            font-weight: bold;
            color: #555;
            font-size: 0.9rem;
        }
        .info-item .value {
            font-size: 1.1rem;
            margin-top: 5px;
        }
        .keywords-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin: 20px 0;
        }
        .keyword-tag {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            text-align: center;
            font-size: 0.9rem;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .ai-insights {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
            line-height: 1.8;
            font-size: 1.05rem;
        }
        .ai-insights h3 {
            margin-top: 0;
            font-size: 1.3rem;
        }
        .advice-box {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
        }
        .feedback-box {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: #333;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
        }
        .satisfaction {
            text-align: center;
            font-size: 1.5rem;
            margin: 25px 0;
            padding: 20px;
            background: #fff9c4;
            border-radius: 10px;
        }
        .version-badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-left: 10px;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            margin-top: 30px;
            padding: 20px;
            border-top: 2px solid #eee;
        }
        @media print {
            body { background-color: white; }
            .content { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>COCOSiL 統合診断レポート</h1>
        <p>${record.name}様 専用レポート</p>
        <p>生成日時: ${new Date().toLocaleString('ja-JP')}</p>
        <span class="version-badge">${record.reportVersion || 'v2.0-integrated'}</span>
    </div>

    <div class="content">
        <div class="section">
            <h2>📋 基本情報</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="label">お名前</div>
                    <div class="value">${record.name} 様</div>
                </div>
                <div class="info-item">
                    <div class="label">生年月日</div>
                    <div class="value">${record.birthDate}</div>
                </div>
                <div class="info-item">
                    <div class="label">年齢</div>
                    <div class="value">${record.age}歳</div>
                </div>
                <div class="info-item">
                    <div class="label">性別</div>
                    <div class="value">${genderText}</div>
                </div>
                <div class="info-item">
                    <div class="label">星座</div>
                    <div class="value">${record.zodiac}</div>
                </div>
                <div class="info-item">
                    <div class="label">診断日</div>
                    <div class="value">${record.date}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🧠 統合性格分析結果</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="label">MBTI性格タイプ</div>
                    <div class="value">${record.mbti}</div>
                </div>
                <div class="info-item">
                    <div class="label">体癖（主）</div>
                    <div class="value">${record.mainTaiheki}種</div>
                </div>
                ${record.subTaiheki ? `
                <div class="info-item">
                    <div class="label">体癖（副）</div>
                    <div class="value">${record.subTaiheki}種</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="label">動物占い</div>
                    <div class="value">${record.animal}</div>
                </div>
                <div class="info-item">
                    <div class="label">ラッキーカラー</div>
                    <div class="value">${record.fortuneColor || record.color}</div>
                </div>
                <div class="info-item">
                    <div class="label">6星占術</div>
                    <div class="value">${record.sixStar}</div>
                </div>
            </div>
        </div>

        ${keywords.length > 0 ? `
        <div class="section">
            <h2>🔑 統合キーワード</h2>
            <div class="keywords-grid">
                ${keywords.map((keyword: string) => `<div class="keyword-tag">${keyword}</div>`).join('')}
            </div>
        </div>
        ` : ''}

        ${record.aiSummary ? `
        <div class="section">
            <h2>🤖 AI統合分析</h2>
            <div class="ai-insights">
                <h3>総合的な性格分析</h3>
                <p>${record.aiSummary.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h2>💡 診断コンサルテーション</h2>
            <div class="advice-box">
                <h3>📋 相談テーマ</h3>
                <p>${record.theme}</p>
                <h3>✨ 専門家からのアドバイス</h3>
                <p>${record.advice}</p>
            </div>
        </div>

        <div class="section">
            <h2>💬 お客様フィードバック</h2>
            <div class="feedback-box">
                <h3>ご感想</h3>
                <p>${record.feedback}</p>
            </div>
            <div class="satisfaction">
                <h3>満足度評価</h3>
                <div style="font-size: 2rem; color: #ffd700; margin: 10px 0;">
                    ${satisfactionStars}
                </div>
                <p>5段階中 ${record.satisfaction}点</p>
                <p><strong>所要時間:</strong> ${record.duration}</p>
            </div>
        </div>

        ${record.memo ? `
        <div class="section">
            <h2>📝 備考</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <p>${record.memo}</p>
            </div>
        </div>
        ` : ''}

        ${record.interviewScheduled || record.interviewDone ? `
        <div class="section">
            <h2>📞 フォローアップ情報</h2>
            <div class="info-grid">
                ${record.interviewScheduled ? `
                <div class="info-item">
                    <div class="label">インタビュー予定</div>
                    <div class="value">${record.interviewScheduled}</div>
                </div>
                ` : ''}
                ${record.interviewDone ? `
                <div class="info-item">
                    <div class="label">インタビュー実施</div>
                    <div class="value">${record.interviewDone}</div>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
    </div>

    <div class="footer">
        <p><strong>COCOSiL（ココシル）統合診断システム</strong></p>
        <p>このレポートはあなた専用の統合診断結果です。大切に保管してください。</p>
        <p>診断結果は参考情報として活用し、重要な意思決定の際は専門家にご相談ください。</p>
        <p>レポートバージョン: ${record.reportVersion || 'v2.0-integrated'} | 生成日時: ${new Date().toLocaleString('ja-JP')}</p>
    </div>
</body>
</html>
  `.trim();
}

// レガシー形式の基本HTMLレポート生成
function generateHTMLReport(record: any): string {
  const genderText = record.gender === 'male' ? '男性' : record.gender === 'female' ? '女性' : '回答しない';
  const orientationText = record.orientation === 'people_oriented' ? '人間指向' : 
                         record.orientation === 'castle_oriented' ? '城指向' : '大局指向';
  
  const satisfactionStars = '★'.repeat(record.satisfaction) + '☆'.repeat(5 - record.satisfaction);

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>COCOSiL 診断レポート - ${record.name}様</title>
    <style>
        body {
            font-family: 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro W3', Meiryo, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2rem;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .info-item .label {
            font-weight: bold;
            color: #555;
            font-size: 0.9rem;
        }
        .info-item .value {
            font-size: 1.1rem;
            margin-top: 5px;
        }
        .advice-box {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .feedback-box {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .personality-summary {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .satisfaction {
            text-align: center;
            font-size: 1.5rem;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            margin-top: 30px;
            padding: 20px;
        }
        @media print {
            body {
                background-color: white;
            }
            .content {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>COCOSiL 統合診断レポート</h1>
        <p>〜 あなたの個性を科学的に分析 〜</p>
    </div>

    <div class="content">
        <div class="section">
            <h2>📋 基本情報</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="label">お名前</div>
                    <div class="value">${record.name} 様</div>
                </div>
                <div class="info-item">
                    <div class="label">生年月日</div>
                    <div class="value">${record.birthDate}</div>
                </div>
                <div class="info-item">
                    <div class="label">年齢</div>
                    <div class="value">${record.age}歳</div>
                </div>
                <div class="info-item">
                    <div class="label">性別</div>
                    <div class="value">${genderText}</div>
                </div>
                <div class="info-item">
                    <div class="label">星座</div>
                    <div class="value">${record.zodiac}</div>
                </div>
                <div class="info-item">
                    <div class="label">診断日</div>
                    <div class="value">${record.date}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🧠 性格分析結果</h2>
            <div class="personality-summary">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">MBTI性格タイプ</div>
                        <div class="value">${record.mbti}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">体癖（主）</div>
                        <div class="value">${record.mainTaiheki}種</div>
                    </div>
                    ${record.subTaiheki ? `
                    <div class="info-item">
                        <div class="label">体癖（副）</div>
                        <div class="value">${record.subTaiheki}種</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🔮 運勢・占術結果</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="label">動物占い</div>
                    <div class="value">${record.animal}</div>
                </div>
                <div class="info-item">
                    <div class="label">志向性</div>
                    <div class="value">${orientationText}</div>
                </div>
                <div class="info-item">
                    <div class="label">ラッキーカラー</div>
                    <div class="value">${record.color}</div>
                </div>
                <div class="info-item">
                    <div class="label">6星占術</div>
                    <div class="value">${record.sixStar}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>💡 診断アドバイス</h2>
            <div class="advice-box">
                <h3>📋 相談テーマ</h3>
                <p>${record.theme}</p>
                <h3>✨ 専門家からのアドバイス</h3>
                <p>${record.advice}</p>
            </div>
        </div>

        <div class="section">
            <h2>💬 お客様の声</h2>
            <div class="feedback-box">
                <p>${record.feedback}</p>
            </div>
            <div class="satisfaction">
                <h3>満足度評価</h3>
                <div style="font-size: 2rem; color: #ffd700;">
                    ${satisfactionStars}
                </div>
                <p>5段階中 ${record.satisfaction}点</p>
            </div>
        </div>

        <div class="section">
            <h2>📈 診断詳細</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="label">所要時間</div>
                    <div class="value">${record.duration}</div>
                </div>
                <div class="info-item">
                    <div class="label">診断実施日</div>
                    <div class="value">${record.createdAt.toISOString().split('T')[0]}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>COCOSiL（ココシル）統合診断システム</p>
        <p>このレポートはあなた専用の診断結果です。大切に保管してください。</p>
        <p>生成日時: ${new Date().toLocaleString('ja-JP')}</p>
    </div>
</body>
</html>
  `.trim();
}