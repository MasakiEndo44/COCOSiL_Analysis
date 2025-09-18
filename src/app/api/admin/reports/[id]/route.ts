import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin-db';
import { requireAdminAuth } from '@/lib/admin-middleware';

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

    // HTML レポートを生成
    const htmlReport = generateHTMLReport(record);

    return new NextResponse(htmlReport, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="診断レポート_${record.name}_${record.date}.html"`,
      },
    });

  } catch (error) {
    console.error('レポート生成エラー:', error);
    
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'レポートの生成に失敗しました' },
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

    // レポートURLを生成してデータベースに保存
    const reportUrl = `/api/admin/reports/${recordId}`;
    
    await adminDb.diagnosisRecord.update({
      where: { id: recordId },
      data: { reportUrl },
    });

    return NextResponse.json({
      success: true,
      reportUrl,
      message: 'レポートが生成されました',
    });

  } catch (error) {
    console.error('レポートURL生成エラー:', error);
    
    if (error instanceof Error && error.message.includes('認証')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'レポートURLの生成に失敗しました' },
      { status: 500 }
    );
  }
}

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