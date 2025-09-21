// 統合レポート生成サービス
// 統合分析結果表示と管理者ダッシュボードの仕様を統一

import { openai } from '@/lib/ai/openai-client';
import { generateMarkdownReport, markdownToHtml, wrapReportHtml } from './report-generator';
import type { DiagnosisReportData, ReportAnalysis } from './report-generator';
import type { MBTIResult, TaihekiResult, FortuneResult } from '@/types';

// 統合キーワード抽出（results.tsxから移植）
export function extractIntegratedKeywords(
  mbti: MBTIResult,
  taiheki: TaihekiResult,
  fortuneResult: FortuneResult,
  zodiacSign: string
): string[] {
  const keywords: string[] = [];

  // MBTI基本特性
  const mbtiType = mbti.type;

  // 外向性/内向性
  if (mbtiType.includes('E')) {
    keywords.push('外向的', 'エネルギッシュ', '社交的');
  } else {
    keywords.push('内向的', '集中力', '深い思考');
  }

  // 感覚/直観
  if (mbtiType.includes('S')) {
    keywords.push('現実的', '実用的', '詳細重視');
  } else {
    keywords.push('創造的', '未来志向', 'アイデア豊富');
  }

  // 思考/感情
  if (mbtiType.includes('T')) {
    keywords.push('論理的', '客観的', '分析力');
  } else {
    keywords.push('共感的', '調和重視', '人間関係');
  }

  // 判断/知覚
  if (mbtiType.includes('J')) {
    keywords.push('計画的', '組織的', '決断力');
  } else {
    keywords.push('柔軟性', '適応力', '自由度');
  }

  // 体癖特性
  const mainTaiheki = taiheki.primary;
  if (mainTaiheki <= 2) {
    keywords.push('頭脳型', '理論思考', '知的好奇心');
  } else if (mainTaiheki <= 4) {
    keywords.push('感情型', '表現力', '芸術的センス');
  } else if (mainTaiheki <= 6) {
    keywords.push('行動型', '実践力', '身体的活力');
  } else {
    keywords.push('調整型', 'バランス感覚', '協調性');
  }

  // 動物占い特性
  if (fortuneResult.animal) {
    const animal = fortuneResult.animal;
    // 動物の特性をキーワードに変換
    if (animal.includes('ライオン')) {
      keywords.push('リーダーシップ', '威厳', '統率力');
    } else if (animal.includes('チーター')) {
      keywords.push('スピード', '瞬発力', '集中力');
    } else if (animal.includes('ペガサス')) {
      keywords.push('自由', '創造性', '独立心');
    } else if (animal.includes('象')) {
      keywords.push('安定感', '信頼性', '持続力');
    } else if (animal.includes('猿')) {
      keywords.push('機敏', '適応力', 'コミュニケーション');
    } else if (animal.includes('狼')) {
      keywords.push('独立性', '忠誠心', 'チームワーク');
    }
  }

  // 星座特性
  const zodiacKeywords = {
    'おひつじ座': ['情熱', '積極性', 'パイオニア精神'],
    'おうし座': ['安定', '持続力', '現実主義'],
    'ふたご座': ['好奇心', '多才', 'コミュニケーション'],
    'かに座': ['共感力', '保護本能', '家族愛'],
    'しし座': ['自信', '表現力', 'リーダーシップ'],
    'おとめ座': ['完璧主義', '分析力', '実用性'],
    'てんびん座': ['バランス', '調和', '美的センス'],
    'さそり座': ['集中力', '洞察力', '変革力'],
    'いて座': ['自由', '冒険心', '楽観性'],
    'やぎ座': ['責任感', '忍耐力', '目標達成'],
    'みずがめ座': ['独創性', '人道主義', '未来志向'],
    'うお座': ['直感力', '創造性', '共感性']
  };

  if (zodiacKeywords[zodiacSign as keyof typeof zodiacKeywords]) {
    keywords.push(...zodiacKeywords[zodiacSign as keyof typeof zodiacKeywords]);
  }

  // 6星占術特性
  if (fortuneResult.sixStar) {
    const sixStar = fortuneResult.sixStar;
    if (sixStar.includes('大殺界')) {
      keywords.push('変革期', '内省', '準備期間');
    } else if (sixStar.includes('天中殺')) {
      keywords.push('転換期', '新展開', '可能性');
    } else {
      keywords.push('安定期', '成長', '発展');
    }
  }

  // 重複を削除して最大10個に制限
  return Array.from(new Set(keywords)).slice(0, 10);
}

// AIサマリー生成（統合分析用）
export async function generateIntegratedAISummary(
  mbti: MBTIResult,
  taiheki: TaihekiResult,
  fortuneResult: FortuneResult,
  zodiacSign: string,
  keywords: string[]
): Promise<string> {
  const prompt = `
あなたは経験豊富な心理学専門家・キャリアコンサルタントです。
以下の統合診断結果を基に、総合的な性格分析を300-500文字で提供してください。

【診断結果】
- MBTI: ${mbti.type}
- 体癖（主）: ${taiheki.primary}種
${taiheki.secondary ? `- 体癖（副）: ${taiheki.secondary}種` : ''}
- 星座: ${zodiacSign}
- 動物占い: ${fortuneResult.animal}
- 6星占術: ${fortuneResult.sixStar}
- 抽出キーワード: ${keywords.join(', ')}

【分析要求】
1. 各診断結果の相関関係と統合的な人格像
2. この方の独特な特徴と強み
3. 現在の人生フェーズと成長可能性
4. 具体的で実用的なアドバイス

温かみのある、前向きで建設的な内容にしてください。
結果は普通の文章として返してください（JSON形式不要）。
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'あなたは経験豊富な心理学専門家です。診断結果を総合的に分析し、温かく前向きなアドバイスを提供してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('AI分析の生成に失敗しました');
    }

    return response.trim();

  } catch (error) {
    console.error('AI分析生成エラー:', error);

    // フォールバック分析
    return `${mbti.type}タイプとして、${taiheki.primary}種体癖の特徴を活かしながら、${zodiacSign}生まれの${fortuneResult.animal}として、バランスの取れた個性を発揮されています。${keywords.slice(0, 3).join('、')}といった強みを持ち、現在は${fortuneResult.sixStar}の時期として、新たな可能性を探求する絶好のタイミングです。継続的な自己理解と成長への取り組みを通じて、より充実した人生を送ることができるでしょう。`;
  }
}

// 統合レポートデータ準備
export interface IntegratedReportData {
  id: number;
  date: string;
  name: string;
  birthDate: string;
  age: number;
  gender: string;
  zodiac: string;
  mbti: MBTIResult;
  taiheki: TaihekiResult;
  fortune: FortuneResult;
  theme?: string;
  advice?: string;
  satisfaction?: number;
  duration?: string;
  feedback?: string;
  integratedKeywords: string[];
  aiSummary: string;
  fortuneColor: string;
  reportVersion: string;
  isIntegratedReport: boolean;
}

// 統合レポート生成メイン関数
export async function generateIntegratedReport(
  basicData: {
    id?: number;
    date: string;
    name: string;
    birthDate: string;
    age: number;
    gender: string;
    zodiac: string;
  },
  mbti: MBTIResult,
  taiheki: TaihekiResult,
  fortune: FortuneResult,
  options: {
    theme?: string;
    advice?: string;
    satisfaction?: number;
    duration?: string;
    feedback?: string;
  } = {}
): Promise<{
  markdownReport: string;
  htmlReport: string;
  reportData: IntegratedReportData;
}> {

  // 統合キーワード抽出
  const integratedKeywords = extractIntegratedKeywords(
    mbti,
    taiheki,
    fortune,
    basicData.zodiac
  );

  // AIサマリー生成
  const aiSummary = await generateIntegratedAISummary(
    mbti,
    taiheki,
    fortune,
    basicData.zodiac,
    integratedKeywords
  );

  // 算命学由来の色を取得
  const fortuneColor = fortune.animal?.includes('赤') ? '赤' :
                       fortune.animal?.includes('青') ? '青' :
                       fortune.animal?.includes('黄') ? '黄' :
                       fortune.animal?.includes('緑') ? '緑' :
                       fortune.animal?.includes('紫') ? '紫' : '金';

  // 統合レポートデータ作成
  const reportData: IntegratedReportData = {
    id: basicData.id || 0,
    date: basicData.date,
    name: basicData.name,
    birthDate: basicData.birthDate,
    age: basicData.age,
    gender: basicData.gender,
    zodiac: basicData.zodiac,
    mbti,
    taiheki,
    fortune,
    theme: options.theme || integratedKeywords.slice(0, 3).join('・') || 'キーワード分析',
    advice: options.advice || 'あなたの独特な個性を活かし、バランスの取れた成長を心がけてください。',
    satisfaction: options.satisfaction || 5,
    duration: options.duration || '60分',
    feedback: options.feedback || '大変参考になりました。',
    integratedKeywords,
    aiSummary,
    fortuneColor,
    reportVersion: 'v2.0-integrated',
    isIntegratedReport: true
  };

  // レポート用データ変換（既存のインターフェースに合わせる）
  const legacyReportData: DiagnosisReportData = {
    id: reportData.id,
    date: reportData.date,
    name: reportData.name,
    birthDate: reportData.birthDate,
    age: reportData.age,
    gender: reportData.gender,
    zodiac: reportData.zodiac,
    animal: reportData.fortune.animal || '不明',
    orientation: 'people_oriented', // 統合分析では志向を統合キーワードで表現
    color: reportData.fortuneColor,
    mbti: reportData.mbti.type,
    mainTaiheki: reportData.taiheki.primary,
    subTaiheki: reportData.taiheki.secondary,
    sixStar: reportData.fortune.sixStar || '不明',
    theme: reportData.theme || '',
    advice: reportData.advice || '',
    satisfaction: reportData.satisfaction || 3,
    duration: reportData.duration || '',
    feedback: reportData.feedback || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // 分析データ作成
  const analysis: ReportAnalysis = {
    strengths: [
      `${reportData.mbti.type}タイプとしての${reportData.mbti.type.includes('E') ? 'コミュニケーション' : '深い思考'}能力`,
      `${reportData.taiheki.primary}種体癖による${reportData.taiheki.primary <= 2 ? '理論的思考' : reportData.taiheki.primary <= 4 ? '感情表現' : '実践的行動'}力`,
      `${reportData.zodiac}の特質を活かした個性的な魅力`,
      ...reportData.integratedKeywords.slice(0, 2)
    ],
    risks: [
      reportData.mbti.type.includes('E') ? '過度な外部刺激による疲労' : '内向きになりすぎるリスク',
      reportData.taiheki.primary <= 4 ? '感情的になりすぎる可能性' : '現実的すぎて創造性を制限する可能性'
    ],
    actionItems: [
      `${reportData.integratedKeywords[0]}を活かした具体的な取り組みを開始する`,
      `${reportData.mbti.type}タイプの特性を理解し、強みを伸ばす学習を継続する`,
      `${reportData.taiheki.primary}種体癖に適した環境作りと習慣形成を行う`,
      '定期的な自己省察と目標設定を行い、バランスの取れた成長を目指す'
    ],
    progressLog: [
      `統合診断完了：${reportData.integratedKeywords.length}個のキーワードを抽出`,
      `現在の満足度：${reportData.satisfaction}/5点で良好な状態`,
      `今後の展望：${reportData.fortuneColor}の要素を意識した成長計画の実行段階`
    ],
    aiInsights: reportData.aiSummary
  };

  // Markdownレポート生成
  const markdownReport = generateMarkdownReport(legacyReportData, analysis);

  // HTMLレポート生成
  const htmlContent = await markdownToHtml(markdownReport);
  const htmlReport = wrapReportHtml(htmlContent, `${reportData.name}様 統合診断レポート`);

  return {
    markdownReport,
    htmlReport,
    reportData
  };
}

// データベース保存用のデータ変換
export function convertToDbRecord(reportData: IntegratedReportData) {
  return {
    date: reportData.date,
    name: reportData.name,
    birthDate: reportData.birthDate,
    age: reportData.age,
    gender: reportData.gender,
    zodiac: reportData.zodiac,
    animal: reportData.fortune.animal || '不明',
    orientation: 'integrated', // 統合診断の識別子
    color: reportData.fortuneColor,
    mbti: reportData.mbti.type,
    mainTaiheki: reportData.taiheki.primary,
    subTaiheki: reportData.taiheki.secondary,
    sixStar: reportData.fortune.sixStar || '不明',
    theme: reportData.theme,
    advice: reportData.advice,
    satisfaction: reportData.satisfaction,
    duration: reportData.duration,
    feedback: reportData.feedback,
    // 新しい統合フィールド
    integratedKeywords: JSON.stringify(reportData.integratedKeywords),
    aiSummary: reportData.aiSummary,
    fortuneColor: reportData.fortuneColor,
    reportVersion: reportData.reportVersion,
    isIntegratedReport: reportData.isIntegratedReport
  };
}