/**
 * 管理者診断記録変換ユーティリティ
 * DiagnosisRecord (DB) → DiagnosisData (Markdown生成用) 変換
 */

import { DiagnosisRecord } from '@/types/admin';
import { buildDiagnosisMarkdown } from '@/lib/build-diagnosis-markdown';
import type { BasicInfo, MBTIResult, TaihekiResult, FortuneResult, ChatSummary } from '@/types';

/**
 * DiagnosisRecordをDiagnosisData形式に変換
 */
export function convertDiagnosisRecordToData(record: DiagnosisRecord) {
  // 生年月日をパース（YYYY/MM/DD形式）
  const birthDateParts = record.birthDate.split('/');
  const [year, month, day] = birthDateParts.map(part => parseInt(part, 10));

  // BasicInfo構築
  const basicInfo: BasicInfo = {
    name: record.name,
    birthdate: { year, month, day },
    gender: record.gender as 'male' | 'female' | 'no_answer'
  };

  // MBTIResult構築
  const mbti: MBTIResult = {
    type: record.mbti,
    source: 'known' as const,
    confidence: 1.0,
    description: `${record.mbti}タイプ`
  };

  // TaihekiResult構築
  const taiheki: TaihekiResult = {
    primary: record.mainTaiheki,
    secondary: record.subTaiheki || 0,
    characteristics: [`主体癖${record.mainTaiheki}種（感情豊かな芸術家）`, `副体癖${record.subTaiheki || 0}種（忍耐強い支援者）`]
  };

  // FortuneResult構築
  const fortune: FortuneResult = {
    animal: record.animal,
    sixStar: record.sixStar,
    element: record.color,
    animalDetails: {
      character: record.animal,
      color: record.color,
      orientation: record.orientation
    }
  } as FortuneResult;

  // 星座計算（簡単な例：実際はより複雑な計算が必要）
  const zodiacSign = record.zodiac;

  // 統合プロファイル（基本的な例）
  const integratedProfile = {
    catchphrase: record.theme || '情熱に満ちた芸術家',
    interpersonal: '初対面の人とは積極的にコミュニケーションを取り、相手の気持ちを大切にしながら関係を築くタイプです。社交的な面が周りから信頼されています。',
    cognition: '直感的に判断し、状況に応じて柔軟に行動するタイプです。感情豊かで自由奔放な特徴があり、独自のペースで物事を進めます。'
  };

  // ChatSummary構築（管理者記録から）
  const chatSummary: ChatSummary | undefined = record.advice ? {
    topicTitle: record.theme,
    overallInsight: record.advice,
    keyPoints: [record.feedback],
    fullTranscript: [
      {
        role: 'assistant',
        content: `こんにちは、${record.name}さん！診断結果を基にご相談をお受けします。`
      },
      {
        role: 'user',
        content: `「${record.theme}」について相談したいです。`
      },
      {
        role: 'assistant',
        content: record.advice
      }
    ]
  } : undefined;

  return {
    basicInfo,
    mbti,
    taiheki,
    fortune,
    integratedProfile,
    zodiacSign,
    chatSummary
  };
}

/**
 * DiagnosisRecordからMarkdownを生成
 */
export function generateMarkdownFromRecord(record: DiagnosisRecord): string {
  const diagnosisData = convertDiagnosisRecordToData(record);
  return buildDiagnosisMarkdown(diagnosisData);
}

/**
 * 既存のレコードにMarkdownを追加するバックフィル機能
 */
export async function backfillMarkdownForRecord(recordId: number, db: any): Promise<boolean> {
  try {
    // レコードを取得
    const record = await db.diagnosisRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) {
      console.error(`Record with ID ${recordId} not found`);
      return false;
    }

    // Markdownを生成
    const markdownContent = generateMarkdownFromRecord(record);

    // レコードを更新
    await db.diagnosisRecord.update({
      where: { id: recordId },
      data: {
        markdownContent,
        markdownVersion: '1.0'
      }
    });

    return true;
  } catch (error) {
    console.error(`Failed to backfill markdown for record ${recordId}:`, error);
    return false;
  }
}