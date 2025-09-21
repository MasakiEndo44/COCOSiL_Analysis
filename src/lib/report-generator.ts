// COCOSiL レポート生成ユーティリティ
import { remark } from 'remark';
import remarkHtml from 'remark-html';

export interface DiagnosisReportData {
  id: number;
  date: string;
  name: string;
  birthDate: string;
  age: number;
  gender: string;
  zodiac: string;
  animal: string;
  orientation: string;
  color: string;
  mbti: string;
  mainTaiheki: number;
  subTaiheki?: number;
  sixStar: string;
  theme: string;
  advice: string;
  satisfaction: number;
  duration: string;
  feedback: string;
  reportUrl?: string;
  interviewScheduled?: string;
  interviewDone?: string;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportAnalysis {
  strengths: string[];
  risks: string[];
  actionItems: string[];
  progressLog: string[];
  aiInsights: string;
}

/**
 * Markdownレポートテンプレートを生成
 */
export function generateMarkdownReport(
  data: DiagnosisReportData,
  analysis: ReportAnalysis
): string {
  const genderText = data.gender === 'male' ? '男性' : data.gender === 'female' ? '女性' : '回答しない';
  const orientationText = data.orientation === 'people_oriented' ? '人間指向' :
                          data.orientation === 'castle_oriented' ? '城指向' : '大局指向';
  const satisfactionStars = '★'.repeat(data.satisfaction) + '☆'.repeat(5 - data.satisfaction);

  return `# COCOSiL 統合診断レポート

> **${data.name}様 専用レポート**
> 生成日時: ${new Date().toLocaleString('ja-JP')}

---

## 📋 基本情報

| 項目 | 内容 |
|------|------|
| **お名前** | ${data.name}様 |
| **生年月日** | ${data.birthDate} |
| **年齢** | ${data.age}歳 |
| **性別** | ${genderText} |
| **星座** | ${data.zodiac} |
| **診断日** | ${data.date} |

---

## 🧠 統合性格分析結果

### MBTI性格タイプ: ${data.mbti}

### 体癖分析
- **主体癖**: ${data.mainTaiheki}種
${data.subTaiheki ? `- **副体癖**: ${data.subTaiheki}種` : ''}

### 運勢・占術結果
- **動物占い**: ${data.animal}
- **志向性**: ${orientationText}
- **ラッキーカラー**: ${data.color}
- **6星占術**: ${data.sixStar}

---

## 💪 あなたの強み

${analysis.strengths.map(strength => `- ${strength}`).join('\n')}

---

## ⚠️ 注意すべきリスク

${analysis.risks.map(risk => `- ${risk}`).join('\n')}

---

## 🎯 推奨アクションプラン

${analysis.actionItems.map(action => `- ${action}`).join('\n')}

---

## 📈 推移ログ・成長記録

${analysis.progressLog.map(log => `- ${log}`).join('\n')}

---

## 🤖 AI統合分析

${analysis.aiInsights}

---

## 💡 診断コンサルテーション

### 📋 相談テーマ
${data.theme}

### ✨ 専門家からのアドバイス
${data.advice}

---

## 💬 お客様フィードバック

> ${data.feedback}

**満足度評価**: ${satisfactionStars} (${data.satisfaction}/5点)

**所要時間**: ${data.duration}

---

## 📞 フォローアップ情報

${data.interviewScheduled ? `- **インタビュー予定**: ${data.interviewScheduled}` : ''}
${data.interviewDone ? `- **インタビュー実施**: ${data.interviewDone}` : ''}
${data.memo ? `- **備考**: ${data.memo}` : ''}

---

*このレポートはCOCOSiL（ココシル）統合診断システムにより生成されました。*
*診断結果は参考情報として活用し、重要な意思決定の際は専門家にご相談ください。*
`;
}

/**
 * MarkdownをHTMLに変換
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkHtml)
    .process(markdown);

  return result.toString();
}

/**
 * HTMLレポートにスタイルを適用
 */
export function wrapReportHtml(htmlContent: string, title: string = 'COCOSiL 診断レポート'): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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

        h1 {
            color: #2c3e50;
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        h2 {
            color: #34495e;
            border-bottom: 3px solid #3498db;
            padding-bottom: 0.5rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }

        h3 {
            color: #2980b9;
            margin-top: 1.5rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
        }

        tr:hover {
            background-color: #f5f5f5;
        }

        blockquote {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 1.5rem 0;
            border-left: none;
            font-style: italic;
        }

        ul, ol {
            padding-left: 1.5rem;
        }

        li {
            margin-bottom: 0.5rem;
        }

        hr {
            border: none;
            height: 2px;
            background: linear-gradient(90deg, transparent, #3498db, transparent);
            margin: 2rem 0;
        }

        .report-section {
            background: white;
            padding: 2rem;
            margin: 1.5rem 0;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        strong {
            color: #2c3e50;
        }

        em {
            color: #7f8c8d;
            font-style: italic;
        }

        @media print {
            body {
                background-color: white;
                font-size: 12pt;
            }
            .report-section {
                box-shadow: none;
                border: 1px solid #ddd;
            }
        }

        @media (max-width: 768px) {
            body {
                padding: 20px 10px;
            }
            h1 {
                font-size: 2rem;
            }
            table {
                font-size: 0.9rem;
            }
        }
    </style>
</head>
<body>
    <div class="report-section">
        ${htmlContent}
    </div>
</body>
</html>`;
}

/**
 * 診断データから基本的な分析を生成
 */
export function generateBasicAnalysis(data: DiagnosisReportData): ReportAnalysis {
  const strengths: string[] = [];
  const risks: string[] = [];
  const actionItems: string[] = [];
  const progressLog: string[] = [];

  // MBTI別の基本分析
  if (data.mbti.includes('E')) {
    strengths.push('外向的なエネルギーで周囲を活性化させる力');
    actionItems.push('チームプロジェクトでリーダーシップを発揮する');
  } else {
    strengths.push('内向的な集中力で深く考察する力');
    actionItems.push('一人の時間を大切にして自己省察を深める');
  }

  if (data.mbti.includes('N')) {
    strengths.push('創造的なアイデアと未来志向の思考');
    risks.push('現実的な詳細を見落とす可能性');
  } else {
    strengths.push('現実的で具体的な問題解決能力');
    risks.push('新しいアイデアに対して保守的になりがち');
  }

  if (data.mbti.includes('F')) {
    strengths.push('他者への共感力と調和を重視する姿勢');
    risks.push('感情に左右されて客観的判断が困難になることがある');
  } else {
    strengths.push('論理的思考と客観的な判断力');
    risks.push('他者の感情を軽視してしまう可能性');
  }

  // 体癖別の分析
  if (data.mainTaiheki <= 2) {
    strengths.push('頭脳明晰で理論的思考に長けている');
    actionItems.push('知的な活動や学習を積極的に取り入れる');
  } else if (data.mainTaiheki <= 4) {
    strengths.push('感情豊かで人間関係を大切にする');
    actionItems.push('感情表現を大切にしながら人とのつながりを深める');
  } else if (data.mainTaiheki <= 6) {
    strengths.push('行動力があり実践的な問題解決が得意');
    actionItems.push('身体を動かす活動や実践的な取り組みを増やす');
  }

  // 動物占い別の分析
  if (data.orientation === 'people_oriented') {
    strengths.push('人との関係性を重視し、協調性に優れている');
    actionItems.push('チームワークを活かせる環境で能力を発揮する');
  } else if (data.orientation === 'castle_oriented') {
    strengths.push('安定性を重視し、着実に目標を達成する');
    actionItems.push('計画的なアプローチで目標設定と達成を行う');
  } else {
    strengths.push('大局的な視野で物事を捉え、革新的な発想ができる');
    actionItems.push('長期的な視点で戦略的な思考を身につける');
  }

  // 満足度に基づくフィードバック
  if (data.satisfaction >= 4) {
    progressLog.push(`高い満足度（${data.satisfaction}/5）を獲得。現在のアプローチが効果的`);
  } else if (data.satisfaction >= 3) {
    progressLog.push(`中程度の満足度（${data.satisfaction}/5）。改善の余地あり`);
    risks.push('現在のアプローチに見直しが必要な可能性');
  } else {
    progressLog.push(`満足度（${data.satisfaction}/5）が低め。大幅な改善が必要`);
    risks.push('現在の状況に大きな不満を抱えている可能性');
    actionItems.push('根本的なアプローチの見直しを検討する');
  }

  return {
    strengths,
    risks,
    actionItems,
    progressLog,
    aiInsights: `${data.mbti}タイプの${data.name}様は、${data.mainTaiheki}種体癖の特徴を活かしながら、${orientationText}の志向性を持つ${data.animal}として、バランスの取れた個性を発揮されています。今回の診断結果を踏まえ、継続的な成長と自己理解を深めることをお勧めします。`
  };

  function orientationText(orientation: string): string {
    return orientation === 'people_oriented' ? '人間指向' :
           orientation === 'castle_oriented' ? '城指向' : '大局指向';
  }
}