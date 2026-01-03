/**
 * 診断結果マークダウン生成ユーティリティ
 * COCOSiL統合診断結果をMarkdown形式で出力
 */

import { calculateAge } from '@/lib/utils';
import type { BasicInfo, MBTIResult, TaihekiResult, FortuneResult, ChatSummary } from '@/types';

interface DiagnosisData {
  basicInfo: BasicInfo | null;
  mbti: MBTIResult | null;
  taiheki: TaihekiResult | null;
  fortune: FortuneResult | null;
  integratedProfile: {
    catchphrase: string;
    interpersonal: string;
    cognition: string;
  };
  zodiacSign: string;
  chatSummary?: ChatSummary;
}

/**
 * 診断結果をMarkdown形式で生成
 */
export function buildDiagnosisMarkdown(data: DiagnosisData): string {
  const sections: string[] = [];

  // ヘッダー
  sections.push('# COCOSiL 統合診断結果');
  sections.push('');

  if (data.basicInfo) {
    const age = calculateAge(data.basicInfo.birthdate);
    const genderText = data.basicInfo.gender === 'male' ? '男性' :
                      data.basicInfo.gender === 'female' ? '女性' : '回答なし';

    sections.push(`**お名前**: ${data.basicInfo.name || '未記入'}`);
    sections.push(`**年齢**: ${age}歳`);
    sections.push(`**性別**: ${genderText}`);
    sections.push(`**生年月日**: ${data.basicInfo.birthdate.year}年${data.basicInfo.birthdate.month}月${data.basicInfo.birthdate.day}日`);
    sections.push(`**診断日**: ${new Date().toLocaleDateString('ja-JP')}`);
    sections.push('');
  }

  // 統合分析結果
  if (data.integratedProfile.catchphrase) {
    sections.push('## 📋 統合分析結果');
    sections.push('');
    sections.push('### あなたの性格をひとことで表すと');
    sections.push(`**${data.integratedProfile.catchphrase}**`);
    sections.push('');

    if (data.integratedProfile.interpersonal) {
      sections.push('### 対人的特徴');
      sections.push(`- ${data.integratedProfile.interpersonal}`);
      sections.push('');
    }

    if (data.integratedProfile.cognition) {
      sections.push('### 思考と行動の特徴');
      sections.push(`- ${data.integratedProfile.cognition}`);
      sections.push('');
    }
  }

  // MBTI結果
  if (data.mbti) {
    sections.push('## 🧠 MBTI性格タイプ');
    sections.push('');
    sections.push(`- **タイプ**: ${data.mbti.type}`);
    sections.push(`- **診断方法**: ${data.mbti.source === 'known' ? '既知のタイプ' : '12問診断'}`);
    if (data.mbti.confidence) {
      sections.push(`- **信頼度**: ${Math.round(data.mbti.confidence * 100)}%`);
    }
    sections.push('');
  } else {
    sections.push('## 🧠 MBTI性格タイプ');
    sections.push('- 診断未実施');
    sections.push('');
  }

  // 体癖診断結果
  if (data.taiheki) {
    sections.push('## 🏃 体癖タイプ（野口整体理論）');
    sections.push('');
    sections.push(`- **主体癖**: ${data.taiheki.primary}種`);
    sections.push(`- **副体癖**: ${data.taiheki.secondary === 0 ? 'なし' : `${data.taiheki.secondary}種`}`);
    if (data.taiheki.characteristics && data.taiheki.characteristics.length > 0) {
      sections.push('- **主な特徴**:');
      data.taiheki.characteristics.slice(0, 4).forEach(characteristic => {
        sections.push(`  - ${characteristic}`);
      });
    }
    sections.push('');
  } else {
    sections.push('## 🏃 体癖タイプ（野口整体理論）');
    sections.push('- 診断未実施');
    sections.push('');
  }

  // 算命学・動物占い結果
  if (data.fortune) {
    sections.push('## ⭐ 算命学・動物占い');
    sections.push('');

    // 動物
    if (data.fortune.animal) {
      sections.push(`- **動物**: ${data.fortune.animal}`);
    }

    // 動物詳細（animalDetailsがある場合）
    if ((data.fortune as any).animalDetails) {
      const details = (data.fortune as any).animalDetails;
      sections.push(`- **動物詳細**: ${details.character} - ${details.color}`);
    }

    // 6星占術
    if (data.fortune.sixStar) {
      sections.push(`- **6星占術**: ${data.fortune.sixStar}`);
    }

    // 星座
    if (data.zodiacSign) {
      sections.push(`- **星座**: ${data.zodiacSign}`);
    }

    // 算命学要素
    if (data.fortune.element) {
      sections.push(`- **要素**: ${data.fortune.element}`);
    }

    sections.push('');
  }

  // AIカウンセリング結果
  if (data.chatSummary && (data.chatSummary.fullTranscript || data.chatSummary.qaExchanges)) {
    sections.push('## 💬 AIカウンセリング結果');
    sections.push('');

    // 相談トピックを表示
    if (data.chatSummary.topicTitle) {
      sections.push(`**相談テーマ**: ${data.chatSummary.topicTitle}`);
      sections.push('');
    }

    // フルトランスクリプトがある場合
    if (data.chatSummary.fullTranscript && data.chatSummary.fullTranscript.length > 0) {
      sections.push('### 相談内容（会話記録）');
      data.chatSummary.fullTranscript.forEach((message, index) => {
        const roleText = message.role === 'user' ? '👤 **あなた**' : '🤖 **COCOSiL AI**';
        sections.push(`${index + 1}. ${roleText}`);
        sections.push(`   ${message.content}`);
        sections.push('');
      });
    }
    // qaExchangesがある場合
    else if (data.chatSummary.qaExchanges && data.chatSummary.qaExchanges.length > 0) {
      sections.push('### 質問と回答');
      data.chatSummary.qaExchanges.forEach((exchange, index) => {
        sections.push(`#### Q${index + 1}. ${exchange.question}`);
        sections.push(`**A${index + 1}.** ${exchange.answer}`);
        sections.push('');
      });
    }

    // AI生成のインサイトがある場合
    if (data.chatSummary.overallInsight) {
      sections.push('### AIによる総合インサイト');
      sections.push(data.chatSummary.overallInsight);
      sections.push('');
    }

    // 重要なポイントがある場合
    if (data.chatSummary.keyPoints && data.chatSummary.keyPoints.length > 0) {
      sections.push('### 重要なポイント');
      data.chatSummary.keyPoints.forEach(point => {
        sections.push(`- ${point}`);
      });
      sections.push('');
    }

    // アクションアドバイスがある場合
    if (data.chatSummary.actionableAdvice && data.chatSummary.actionableAdvice.length > 0) {
      sections.push('### 実行可能なアドバイス');
      data.chatSummary.actionableAdvice.forEach(advice => {
        sections.push(`- ${advice}`);
      });
      sections.push('');
    }
  } else {
    sections.push('## 💬 AIカウンセリング');
    sections.push('- 実施されませんでした');
    sections.push('');
  }

  // フッター
  sections.push('---');
  sections.push('');
  sections.push('*この診断結果は参考情報として提供されています。*');
  sections.push('');
  sections.push('**COCOSiL（ココシル）**: 体癖理論・MBTI・算命学・動物占いを統合した包括的人間理解プラットフォーム');
  sections.push(`**生成日時**: ${new Date().toLocaleString('ja-JP')}`);

  return sections.join('\n');
}

/**
 * 診断データの完全性をチェック
 */
export function validateDiagnosisData(data: DiagnosisData): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  if (!data.basicInfo) {
    missingFields.push('基本情報');
  }

  if (!data.fortune) {
    missingFields.push('算命学・動物占い結果');
  }

  if (!data.integratedProfile.catchphrase) {
    missingFields.push('統合分析結果');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}