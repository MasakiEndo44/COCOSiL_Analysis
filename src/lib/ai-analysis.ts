// AI統合分析機能（Claude連携）
import { openai } from '@/lib/ai/openai-client';
import type { DiagnosisReportData, ReportAnalysis } from './report-generator';

/**
 * AIを使用して高度な診断分析を生成
 */
export async function generateAIAnalysis(data: DiagnosisReportData): Promise<ReportAnalysis> {
  const prompt = createAnalysisPrompt(data);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `あなたは経験豊富な心理学専門家・キャリアコンサルタントです。
MBTI、体癖理論、動物占い、六星占術の知識を活用して、
クライアントの総合的な性格分析と具体的なアドバイスを提供してください。

分析結果は以下のJSON形式で返してください：
{
  "strengths": ["強み1", "強み2", "強み3"],
  "risks": ["リスク1", "リスク2"],
  "actionItems": ["アクション1", "アクション2", "アクション3"],
  "progressLog": ["進捗ログ1", "進捗ログ2"],
  "aiInsights": "総合的なAI分析結果（300-500文字）"
}

- 強みは3-5個
- リスクは2-3個
- アクションアイテムは3-5個の具体的な行動提案
- 進捗ログは現在の状況と今後の展望
- AI洞察は包括的で実用的な内容にしてください`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('AI分析の生成に失敗しました');
    }

    // JSONレスポンスをパース
    const analysisResult = JSON.parse(response) as ReportAnalysis;

    // 基本的なバリデーション
    if (!analysisResult.strengths || !analysisResult.risks || !analysisResult.actionItems) {
      throw new Error('AI分析の形式が不正です');
    }

    return analysisResult;

  } catch (error) {
    console.error('AI分析生成エラー:', error);

    // フォールバック: 基本的な分析を返す
    return generateFallbackAnalysis(data);
  }
}

/**
 * AI分析用のプロンプトを作成
 */
function createAnalysisPrompt(data: DiagnosisReportData): string {
  const genderText = data.gender === 'male' ? '男性' : data.gender === 'female' ? '女性' : '性別未回答';
  const orientationText = data.orientation === 'people_oriented' ? '人間指向' :
                          data.orientation === 'castle_oriented' ? '城指向' : '大局指向';

  return `
【クライアント情報】
- 名前: ${data.name}様
- 年齢: ${data.age}歳 (${genderText})
- 生年月日: ${data.birthDate}
- 星座: ${data.zodiac}

【性格診断結果】
- MBTI: ${data.mbti}
- 体癖（主）: ${data.mainTaiheki}種
${data.subTaiheki ? `- 体癖（副）: ${data.subTaiheki}種` : ''}
- 動物占い: ${data.animal}
- 志向性: ${orientationText}
- ラッキーカラー: ${data.color}
- 6星占術: ${data.sixStar}

【相談内容・フィードバック】
- 相談テーマ: ${data.theme}
- 専門家アドバイス: ${data.advice}
- クライアントフィードバック: ${data.feedback}
- 満足度: ${data.satisfaction}/5点
- 所要時間: ${data.duration}

【分析依頼】
上記の診断結果を総合的に分析し、以下の観点から具体的で実用的なアドバイスを提供してください：

1. この方の性格特性から見える主要な強み
2. 注意すべきリスクや課題
3. 成長と改善のための具体的なアクションプラン
4. 現在の状況と今後の成長可能性
5. 各診断結果の相関関係と統合的な人格像

特に、MBTI、体癖、動物占いの組み合わせから見える独特な特徴や、
相談テーマに対する具体的な解決策を含めてください。
`;
}

/**
 * AIが利用できない場合のフォールバック分析
 */
function generateFallbackAnalysis(data: DiagnosisReportData): ReportAnalysis {
  const strengths: string[] = [];
  const risks: string[] = [];
  const actionItems: string[] = [];
  const progressLog: string[] = [];

  // MBTI基本分析
  const mbtiType = data.mbti;

  // 外向性/内向性
  if (mbtiType.includes('E')) {
    strengths.push('コミュニケーション能力が高く、チームを活性化させる力');
    actionItems.push('ネットワーキングイベントや交流会に積極的に参加する');
  } else {
    strengths.push('集中力が高く、深く考察する能力に長けている');
    actionItems.push('一人の時間を確保して、内省や学習に時間を投資する');
  }

  // 感覚/直観
  if (mbtiType.includes('S')) {
    strengths.push('現実的で実用的な問題解決能力');
    risks.push('大局的な視点や将来の可能性を見落とすことがある');
  } else {
    strengths.push('創造性と革新的なアイデア創出能力');
    risks.push('細部への注意や現実的な制約を軽視しがち');
  }

  // 思考/感情
  if (mbtiType.includes('T')) {
    strengths.push('論理的思考と客観的な判断力');
    risks.push('人間関係で感情面への配慮が不足することがある');
  } else {
    strengths.push('共感力と調和を重視する人間関係構築能力');
    risks.push('客観的判断よりも感情を優先してしまうことがある');
  }

  // 判断/知覚
  if (mbtiType.includes('J')) {
    strengths.push('計画性と組織的な行動力');
    actionItems.push('明確な目標設定と段階的な計画立案を行う');
  } else {
    strengths.push('柔軟性と適応能力');
    actionItems.push('変化を恐れず、新しい機会に積極的にチャレンジする');
  }

  // 体癖分析
  if (data.mainTaiheki <= 2) {
    strengths.push('理論的思考と知的好奇心');
    actionItems.push('専門知識の習得や研究活動に取り組む');
  } else if (data.mainTaiheki <= 4) {
    strengths.push('感受性と芸術的センス');
    actionItems.push('創作活動や芸術鑑賞を通じて感性を磨く');
  } else if (data.mainTaiheki <= 6) {
    strengths.push('行動力と実践的な問題解決能力');
    actionItems.push('身体を動かす活動や実践的なスキルを身につける');
  }

  // 満足度分析
  if (data.satisfaction >= 4) {
    progressLog.push(`現在の取り組みに高い満足度（${data.satisfaction}/5）を示している`);
    progressLog.push('現在のアプローチを継続し、さらなる発展を目指す段階');
  } else if (data.satisfaction >= 3) {
    progressLog.push(`中程度の満足度（${data.satisfaction}/5）で改善の余地がある`);
    risks.push('現在のアプローチに見直しが必要な可能性');
  } else {
    progressLog.push(`満足度（${data.satisfaction}/5）が低く、根本的な改善が必要`);
    risks.push('現在の状況に大きな不満や課題を抱えている');
    actionItems.push('現在のアプローチを根本的に見直し、新しい方向性を模索する');
  }

  const orientationText = data.orientation === 'people_oriented' ? '人間指向' :
                          data.orientation === 'castle_oriented' ? '城指向' : '大局指向';

  const aiInsights = `${data.name}様は${mbtiType}タイプとして、${data.mainTaiheki}種体癖の特徴を持ち、${orientationText}の志向性を示す${data.animal}の特質を兼ね備えています。この組み合わせから、バランスの取れた個性と独自の強みが見えてきます。今回の診断結果（満足度${data.satisfaction}/5）を踏まえ、特定された強みを活かしながら、リスク要因に対する適切な対策を講じることで、より充実した人生を送ることができるでしょう。継続的な自己理解と成長への取り組みをお勧めします。`;

  return {
    strengths,
    risks,
    actionItems,
    progressLog,
    aiInsights
  };
}