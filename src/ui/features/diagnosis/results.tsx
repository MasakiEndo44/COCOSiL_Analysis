'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';

import { mbtiDescriptions } from '@/lib/data/mbti-questions';
import Link from 'next/link';
import type { FortuneResult } from '@/types';
import { getOpenAIClient } from '@/lib/ai/openai-client';

// Utility functions for age and zodiac calculation
const calculateAge = (year: number, month: number, day: number): number => {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const getWesternZodiac = (month: number, day: number): string => {
  const zodiacData = [
    { name: '山羊座', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { name: '水瓶座', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { name: '魚座', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { name: '牡羊座', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { name: '牡牛座', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { name: '双子座', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
    { name: '蟹座', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
    { name: '獅子座', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { name: '乙女座', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { name: '天秤座', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { name: '蠍座', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { name: '射手座', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 }
  ];

  for (const zodiac of zodiacData) {
    if (zodiac.startMonth > zodiac.endMonth) {
      // Cross-year zodiac (Capricorn)
      if ((month === zodiac.startMonth && day >= zodiac.startDay) ||
          (month === zodiac.endMonth && day <= zodiac.endDay)) {
        return zodiac.name;
      }
    } else {
      // Same-year zodiac
      if ((month === zodiac.startMonth && day >= zodiac.startDay) ||
          (month === zodiac.endMonth && day <= zodiac.endDay) ||
          (month > zodiac.startMonth && month < zodiac.endMonth)) {
        return zodiac.name;
      }
    }
  }

  return '不明';
};

// Simplified word bank for demonstration
const getSimpleWordBank = () => {
  return {
    mbti: {
      'ENFP': {
        catchphrase: '情熱的創造者',
        trait1: '自由奔放',
        trait2: '直感的',
        trait3: '社交的'
      },
      'INFP': {
        catchphrase: '理想追求者',
        trait1: '内向的',
        trait2: '感情豊か',
        trait3: '創造的'
      },
      'ENFJ': {
        catchphrase: 'カリスマ指導者',
        trait1: '外向的',
        trait2: '思いやり深い',
        trait3: '計画的'
      },
      'INFJ': {
        catchphrase: '洞察力の賢者',
        trait1: '内向的',
        trait2: '直感的',
        trait3: '計画的'
      },
      'ENTP': {
        catchphrase: 'アイデア起業家',
        trait1: '外向的',
        trait2: '論理的',
        trait3: '柔軟'
      },
      'INTP': {
        catchphrase: '論理的思考家',
        trait1: '内向的',
        trait2: '論理的',
        trait3: '独立的'
      },
      'ENTJ': {
        catchphrase: '戦略的指揮官',
        trait1: '外向的',
        trait2: '論理的',
        trait3: '計画的'
      },
      'INTJ': {
        catchphrase: '戦略的建築家',
        trait1: '内向的',
        trait2: '論理的',
        trait3: '計画的'
      },
      'ESFP': {
        catchphrase: '自由な表現者',
        trait1: '外向的',
        trait2: '現実的',
        trait3: '感情的'
      },
      'ISFP': {
        catchphrase: '芸術家の魂',
        trait1: '内向的',
        trait2: '現実的',
        trait3: '感情的'
      },
      'ESFJ': {
        catchphrase: '思いやりの社交家',
        trait1: '外向的',
        trait2: '現実的',
        trait3: '計画的'
      },
      'ISFJ': {
        catchphrase: '献身的な守護者',
        trait1: '内向的',
        trait2: '現実的',
        trait3: '計画的'
      },
      'ESTP': {
        catchphrase: '行動派の実行者',
        trait1: '外向的',
        trait2: '現実的',
        trait3: '柔軟'
      },
      'ISTP': {
        catchphrase: '職人の技術者',
        trait1: '内向的',
        trait2: '現実的',
        trait3: '論理的'
      },
      'ESTJ': {
        catchphrase: '実務的管理者',
        trait1: '外向的',
        trait2: '現実的',
        trait3: '計画的'
      },
      'ISTJ': {
        catchphrase: '堅実な管理者',
        trait1: '内向的',
        trait2: '現実的',
        trait3: '計画的'
      }
    },
    taiheki: {
      1: {
        catchphrase: '上下型の人',
        trait1: '頭で考える',
        trait2: '理性的',
        trait3: '集中力'
      },
      2: {
        catchphrase: '上下型の人',
        trait1: '感情豊か',
        trait2: '消化重視',
        trait3: '好き嫌い'
      },
      3: {
        catchphrase: '左右型の人',
        trait1: '呼吸重視',
        trait2: '感受性',
        trait3: '美意識'
      },
      4: {
        catchphrase: '左右型の人',
        trait1: '肝臓型',
        trait2: '行動力',
        trait3: '感情表現'
      },
      5: {
        catchphrase: '前後型の人',
        trait1: '骨盤型',
        trait2: '持続力',
        trait3: '愛情深い'
      },
      6: {
        catchphrase: '前後型の人',
        trait1: '腎臓型',
        trait2: '意志力',
        trait3: '頑固'
      },
      7: {
        catchphrase: '回転型の人',
        trait1: '泌尿器型',
        trait2: '瞬発力',
        trait3: '切り替え上手'
      },
      8: {
        catchphrase: '回転型の人',
        trait1: '生殖器型',
        trait2: '持久力',
        trait3: '粘り強い'
      },
      9: {
        catchphrase: '開閉型の人',
        trait1: '緊張弛緩',
        trait2: '変化対応',
        trait3: '極端'
      },
      10: {
        catchphrase: '開閉型の人',
        trait1: '過敏型',
        trait2: '細やか',
        trait3: '神経質'
      }
    },
    animals60: {
      'チーター': {
        catchphrase: '俊敏な挑戦者',
        trait1: 'スピード重視',
        trait2: '瞬発力',
        trait3: '集中型'
      },
      'ライオン': {
        catchphrase: '堂々とした王者',
        trait1: 'リーダー気質',
        trait2: 'プライド高い',
        trait3: '責任感'
      },
      'ペガサス': {
        catchphrase: '自由な創造者',
        trait1: '独立心',
        trait2: '創造的',
        trait3: '理想主義'
      },
      'サル': {
        catchphrase: '器用な演技者',
        trait1: '適応力',
        trait2: '社交的',
        trait3: '機転利く'
      },
      'コアラ': {
        catchphrase: 'のんびり平和主義',
        trait1: 'マイペース',
        trait2: '癒し系',
        trait3: '穏やか'
      },
      'トラ': {
        catchphrase: '情熱の行動派',
        trait1: '情熱的',
        trait2: '勇敢',
        trait3: '一直線'
      }
    },
    zodiac: {
      '牡羊座': {
        element: '火',
        catchphrase: '情熱の開拓者',
        trait1: '積極的',
        trait2: '率直',
        trait3: '行動力'
      },
      '牡牛座': {
        element: '土',
        catchphrase: '安定の実務家',
        trait1: 'マイペース',
        trait2: '堅実',
        trait3: '継続力'
      },
      '双子座': {
        element: '風',
        catchphrase: '知的な情報通',
        trait1: '好奇心',
        trait2: '機転利く',
        trait3: '多才'
      },
      '蟹座': {
        element: '水',
        catchphrase: '愛情深い家族思い',
        trait1: '共感力',
        trait2: '面倒見良い',
        trait3: '情に厚い'
      },
      '獅子座': {
        element: '火',
        catchphrase: '華やかなスター',
        trait1: '存在感',
        trait2: '創造的',
        trait3: '寛大'
      },
      '乙女座': {
        element: '土',
        catchphrase: '完璧主義の分析家',
        trait1: '几帳面',
        trait2: '実務的',
        trait3: '献身的'
      },
      '天秤座': {
        element: '風',
        catchphrase: '調和の美学者',
        trait1: 'バランス感覚',
        trait2: '社交的',
        trait3: '公正'
      },
      '蠍座': {
        element: '水',
        catchphrase: '神秘的な洞察者',
        trait1: '集中力',
        trait2: '深い愛情',
        trait3: '洞察力'
      },
      '射手座': {
        element: '火',
        catchphrase: '自由な冒険家',
        trait1: '楽観的',
        trait2: '向学心',
        trait3: '自由愛好'
      },
      '山羊座': {
        element: '土',
        catchphrase: '責任感の登山家',
        trait1: '計画的',
        trait2: '忍耐力',
        trait3: '責任感'
      },
      '水瓶座': {
        element: '風',
        catchphrase: '革新的な理想家',
        trait1: '独創的',
        trait2: '客観的',
        trait3: '未来志向'
      },
      '魚座': {
        element: '水',
        catchphrase: '感受性の芸術家',
        trait1: '感受性',
        trait2: '想像力',
        trait3: '献身的'
      }
    },
    sixStar: {
      '土星人': {
        catchphrase: '堅実な実務家',
        trait1: '計画的',
        trait2: '継続力',
        trait3: '責任感'
      },
      '金星人': {
        catchphrase: '美の追求者',
        trait1: '美意識',
        trait2: '調和重視',
        trait3: '社交的'
      },
      '火星人': {
        catchphrase: '情熱の戦士',
        trait1: 'エネルギッシュ',
        trait2: '競争心',
        trait3: 'リーダー気質'
      },
      '天王星人': {
        catchphrase: '革新の発明家',
        trait1: '独創的',
        trait2: '革新的',
        trait3: '自由主義'
      },
      '木星人': {
        catchphrase: '包容力の指導者',
        trait1: '包容力',
        trait2: '指導力',
        trait3: '成長志向'
      },
      '水星人': {
        catchphrase: '知的な伝達者',
        trait1: '機敏',
        trait2: '分析力',
        trait3: 'コミュニケーション'
      }
    }
  };
};

// Keyword extraction function for 5-system integration
const extractIntegratedKeywords = (
  mbti: any,
  taiheki: any,
  fortuneResult: FortuneResult,
  zodiacSign: string
) => {
  const wordBank = getSimpleWordBank();
  const keywords: string[] = [];

  // 60% 後天的特性 (MBTI + 体癖)
  if (mbti && wordBank.mbti[mbti.type as keyof typeof wordBank.mbti]) {
    const mbtiData = wordBank.mbti[mbti.type as keyof typeof wordBank.mbti];
    keywords.push(mbtiData.catchphrase, mbtiData.trait1, mbtiData.trait2);
  }

  if (taiheki && wordBank.taiheki[taiheki.primary as keyof typeof wordBank.taiheki]) {
    const taihekiData = wordBank.taiheki[taiheki.primary as keyof typeof wordBank.taiheki];
    keywords.push(taihekiData.catchphrase, taihekiData.trait1);
  }

  // 40% 先天的特性 (動物占い + 星座 + 六星占術)
  const animalKey = (fortuneResult as any).animalDetails?.character || fortuneResult.animal;
  if (animalKey && wordBank.animals60[animalKey as keyof typeof wordBank.animals60]) {
    const animalData = wordBank.animals60[animalKey as keyof typeof wordBank.animals60];
    keywords.push(animalData.trait1, animalData.trait2);
  }

  if (zodiacSign && wordBank.zodiac[zodiacSign as keyof typeof wordBank.zodiac]) {
    const zodiacData = wordBank.zodiac[zodiacSign as keyof typeof wordBank.zodiac];
    keywords.push(zodiacData.trait1);
  }

  if (fortuneResult.sixStar && wordBank.sixStar[fortuneResult.sixStar as keyof typeof wordBank.sixStar]) {
    const sixStarData = wordBank.sixStar[fortuneResult.sixStar as keyof typeof wordBank.sixStar];
    keywords.push(sixStarData.trait1);
  }

  return keywords.filter(Boolean).slice(0, 6); // Top 6 keywords
};

export default function DiagnosisResults() {
  const { basicInfo, mbti, taiheki, fortune: fortuneResult } = useDiagnosisStore();
  const [summary, setSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const zodiacSign = basicInfo ? getWesternZodiac(basicInfo.birthdate.month, basicInfo.birthdate.day) : '';
  const integratedKeywords = (basicInfo && fortuneResult)
    ? extractIntegratedKeywords(mbti, taiheki, fortuneResult, zodiacSign)
    : [];

  // Save diagnosis result to admin database
  useEffect(() => {
    const saveDiagnosisResult = async () => {
      if (basicInfo && fortuneResult) {
        try {
          const payload = {
            name: basicInfo.name,
            gender: basicInfo.gender,
            age: calculateAge(
              basicInfo.birthdate.year,
              basicInfo.birthdate.month,
              basicInfo.birthdate.day
            ),
            primaryTaiheki: taiheki?.primary || null,
            subTaiheki: taiheki?.secondary || null,
            mbtiType: mbti?.type || null,
            animal: fortuneResult.animal,
            sixStar: fortuneResult.sixStar,
            zodiac: zodiacSign,
            keywords: integratedKeywords.join(', ')
          };

          const response = await fetch('/api/admin/diagnosis-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            console.error('Failed to save diagnosis result');
          }
        } catch (error) {
          console.error('Error saving diagnosis result:', error);
        }
      }
    };

    saveDiagnosisResult();
  }, [basicInfo, mbti, taiheki, fortuneResult, zodiacSign, integratedKeywords]);

  // Generate AI summary
  const generateAISummary = async () => {
    if (!basicInfo || !fortuneResult) return;

    setIsGeneratingSummary(true);
    const openai = getOpenAIClient();

    const prompt = `以下の診断結果から、${basicInfo.name}さんの性格や特徴を120文字以内で分かりやすく要約してください。

診断結果:
- MBTI: ${mbti?.type || '未診断'}
- 体癖: ${taiheki ? `${taiheki.primary}種` : '未診断'}
- 動物占い: ${fortuneResult.animal}
- 六星占術: ${fortuneResult.sixStar}
- 星座: ${zodiacSign}
- 統合キーワード: ${integratedKeywords.join('、')}

要約は親しみやすく、ポジティブな表現で書いてください。`;

    try {
      const content = await openai.generateQuickAnalysis(prompt);
      if (content) {
        setSummary(content);
      } else {
        setSummary(`${basicInfo.name}さんは、${mbti?.type || '未知の'}タイプで、${taiheki ? `${taiheki.primary}種体癖の` : ''}個性的な方です。${fortuneResult.animal}の特徴を持ち、${fortuneResult.sixStar}の性格が表れています。バランスの取れた魅力的な人格をお持ちです。`);
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setSummary(`${basicInfo.name}さんは、${mbti?.type || '未知の'}タイプで、${taiheki ? `${taiheki.primary}種体癖の` : ''}個性的な方です。${fortuneResult.animal}の特徴を持ち、${fortuneResult.sixStar}の性格が表れています。バランスの取れた魅力的な人格をお持ちです。`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Load initial summary
  useEffect(() => {
    if (basicInfo && fortuneResult && !summary && !isGeneratingSummary) {
      generateAISummary();
    }
  }, [basicInfo, fortuneResult, summary, isGeneratingSummary]);

  // Basic info and fortune result are required, MBTI and taiheki are optional
  if (!basicInfo || !fortuneResult) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-light-fg-muted">診断結果を生成中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-3">
            診断完了！
          </h1>
          <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted">
            {basicInfo.name}さん（{calculateAge(basicInfo.birthdate.year, basicInfo.birthdate.month, basicInfo.birthdate.day)}歳・{basicInfo.gender === 'male' ? '男性' : basicInfo.gender === 'female' ? '女性' : '回答なし'}）の統合診断結果
          </p>
        </div>
      </div>

      {/* Success Badge */}
      <div className="flex justify-center">
        <div className="bg-green-50 text-green-700 px-6 py-3 rounded-full text-sm font-medium flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>すべての診断が完了しました</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* MBTI結果 */}
        {mbti ? (
          <div className="bg-white rounded-card p-6 shadow-z2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-light-fg text-lg">MBTI性格タイプ</h3>
                <p className="text-sm text-light-fg-muted">{mbti.source === 'known' ? '既知' : '12問診断'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-2xl font-bold text-purple-900">{mbti.type}</h4>
                  {mbti.confidence && (
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                      信頼度 {Math.round(mbti.confidence * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-lg font-medium text-purple-800 mb-2">
                  {mbtiDescriptions[mbti.type]?.name}
                </p>
                <p className="text-sm text-purple-700">
                  {mbtiDescriptions[mbti.type]?.description}
                </p>
              </div>

              {mbtiDescriptions[mbti.type]?.traits && (
                <div>
                  <p className="text-sm font-medium text-light-fg mb-2">主な特徴</p>
                  <div className="flex flex-wrap gap-2">
                    {mbtiDescriptions[mbti.type].traits.map((trait) => (
                      <span key={trait} className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-card p-6 shadow-z2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-light-fg text-lg">MBTI性格タイプ</h3>
                <p className="text-sm text-light-fg-muted">診断未実施</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">MBTI診断は実施されませんでした</p>
              <Link href="/diagnosis/mbti" className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2 inline-block">
                MBTI診断を受ける →
              </Link>
            </div>
          </div>
        )}

        {/* 体癖結果 */}
        {taiheki ? (
          <div className="bg-white rounded-card p-6 shadow-z2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-light-fg text-lg">体癖タイプ</h3>
                <p className="text-sm text-light-fg-muted">野口整体理論</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-3">
                  <div>
                    <span className="text-2xl font-bold text-green-900">主体癖 {taiheki.primary}種</span>
                    <span className="text-lg text-green-700 ml-2">副体癖 {taiheki.secondary === 0 ? 'なし' : `${taiheki.secondary}種`}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-light-fg mb-2">主な特徴</p>
                <div className="flex flex-wrap gap-2">
                  {taiheki.characteristics.slice(0, 4).map((characteristic, index) => (
                    <span key={index} className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                      {characteristic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-card p-6 shadow-z2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-light-fg text-lg">体癖タイプ</h3>
                <p className="text-sm text-light-fg-muted">診断未実施</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">体癖診断は実施されませんでした</p>
              <Link href="/diagnosis/taiheki" className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 inline-block">
                体癖診断を受ける →
              </Link>
            </div>
          </div>
        )}

        {/* 算命学・動物占い結果 */}
        <div className="bg-white rounded-card p-6 shadow-z2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-light-fg text-lg">算命学占い</h3>
              <p className="text-sm text-light-fg-muted">算命学APIの結果に基づく</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* 動物 */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-xs text-yellow-700 mb-1">動物</p>
                <p className="text-lg font-bold text-yellow-900">
                  {(fortuneResult as any).animalDetails
                    ? `${(fortuneResult as any).animalDetails.character} - ${(fortuneResult as any).animalDetails.color}`
                    : fortuneResult.animal
                  }
                </p>
              </div>

              {/* 6星占術 */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-xs text-yellow-700 mb-1">6星占術</p>
                <p className="text-lg font-bold text-yellow-900">{fortuneResult.sixStar}</p>
              </div>

              {/* 星座 */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-xs text-yellow-700 mb-1">星座</p>
                <p className="text-lg font-bold text-yellow-900">{zodiacSign}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 統合分析結果 */}
        <div className="bg-white rounded-card p-6 shadow-z2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-light-fg text-lg">統合分析</h3>
              <p className="text-sm text-light-fg-muted">総合的な人物像</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* AI要約 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-700 mb-2">AIによる性格分析</p>
              {isGeneratingSummary ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-700">分析中...</p>
                </div>
              ) : (
                <p className="text-sm text-blue-900 leading-relaxed">{summary}</p>
              )}
            </div>

            {/* 統合キーワード */}
            {integratedKeywords.length > 0 && (
              <div>
                <p className="text-sm font-medium text-light-fg mb-2">統合キーワード</p>
                <div className="flex flex-wrap gap-2">
                  {integratedKeywords.map((keyword, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
        <Button
          onClick={() => window.print()}
          variant="secondary"
          className="flex-1"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          結果を印刷
        </Button>

        <Link href="/diagnosis" className="flex-1">
          <Button className="w-full">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            新しい診断を受ける
          </Button>
        </Link>
      </div>
    </div>
  );
}