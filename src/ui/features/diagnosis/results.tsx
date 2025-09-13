'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { EmptyQAState } from '@/ui/components/counseling/empty-qa-state';
import { SummarizedQAList } from '@/ui/components/counseling/summarized-qa-list';
import { generateFallbackSummary } from '@/lib/counseling/summarizer';

import { mbtiDescriptions } from '@/lib/data/mbti-questions';
import Link from 'next/link';
import type { FortuneResult } from '@/types';

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
      // Regular zodiac
      if ((month === zodiac.startMonth && day >= zodiac.startDay) ||
          (month === zodiac.endMonth && day <= zodiac.endDay) ||
          (month > zodiac.startMonth && month < zodiac.endMonth)) {
        return zodiac.name;
      }
    }
  }
  
  return '山羊座'; // Fallback
};

export function DiagnosisResults() {
  const { basicInfo, mbti, taiheki, setFortune, completeStep, setCurrentStep, chatSession, chatSummary, hasCompletedCounseling, setChatSummary } = useDiagnosisStore();
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(null);
  const [showFinalResultsOverlay, setShowFinalResultsOverlay] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 結果画面表示時に進捗を100%に設定
  useEffect(() => {
    setCurrentStep('integration');
  }, [setCurrentStep]);

  useEffect(() => {
    // 算命学・動物占い結果を計算（新しいAPIを使用）
    if (basicInfo && !fortuneResult) {
      const fetchFortuneData = async () => {
        try {
          const { year, month, day } = basicInfo.birthdate;
          const response = await fetch('/api/fortune-calc-v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ year, month, day }),
          });
          
          if (!response.ok) {
            throw new Error('Fortune calculation failed');
          }
          
          const data = await response.json();
          if (data.success && data.data) {
            // Map v2 API response to FortuneResult format
            const mappedResult: FortuneResult = {
              zodiac: data.data.zodiac,
              animal: data.data.animal,
              sixStar: data.data.six_star,
              element: data.data.fortune_detail?.personality_traits?.[1]?.replace('カラー：', '') || '不明',
              fortune: `${data.data.animal}の特徴を持つ方です`,
              characteristics: [data.data.animal?.split('な')?.[0] || data.data.animal?.split('の')?.[0] || '特別']
            };
            // Store enhanced data for display (extract from fortune_detail)
            (mappedResult as any).animalDetails = {
              character: data.data.animal,
              color: data.data.fortune_detail?.personality_traits?.[1]?.replace('カラー：', '') || '不明'
            };
            setFortuneResult(mappedResult);
            setFortune(mappedResult);
          } else {
            // API呼び出し失敗時のエラーハンドリング
            console.error('Fortune API returned no data');
            setFortuneResult(null);
          }
        } catch (error) {
          console.error('Fortune calculation error:', error);
          // API呼び出し失敗
          setFortuneResult(null);
        }
      };
      
      fetchFortuneData();
    }

    // integration ステップを完了
    completeStep('integration');
  }, [basicInfo, fortuneResult, setFortune, completeStep]);

  // 最終結果を表示
  const showFinalResults = () => {
    setShowFinalResultsOverlay(true);
  };

  // オーバーレイを閉じる
  const closeFinalResults = () => {
    setShowFinalResultsOverlay(false);
  };

  // 質問と回答のリストを生成
  const generateQAList = () => {
    // 相談トピック一覧（chat/page.tsxから取得）
    const consultationTopics = [
      {
        id: 'relationship',
        title: '人間関係の悩み',
        description: '職場、友人、恋愛などの人間関係について',
        icon: '👥'
      },
      {
        id: 'career',
        title: 'キャリア・仕事の悩み',
        description: '転職、昇進、働き方などについて',
        icon: '💼'
      },
      {
        id: 'personality',
        title: '自分の性格・特性理解',
        description: 'あなたの特性を深く理解したい',
        icon: '🧠'
      },
      {
        id: 'future',
        title: '将来・目標設定',
        description: '人生設計や目標達成について',
        icon: '🎯'
      }
    ];

    return consultationTopics;
  };

  // Q&A セクションの条件分岐レンダリング
  const renderQASection = () => {
    if (!hasCompletedCounseling) {
      return <EmptyQAState />;
    }
    
    if (chatSummary) {
      return <SummarizedQAList summary={chatSummary} />;
    }
    
    // フォールバック: サマリーが存在しない場合は生成を試行
    if (chatSession && chatSession.messages.length > 2) {
      const fallbackSummary = generateFallbackSummary(
        chatSession.selectedTopic,
        chatSession.messages.length
      );
      
      // 生成したサマリーを保存
      setChatSummary(fallbackSummary);
      
      return <SummarizedQAList summary={fallbackSummary} />;
    }
    
    // 既存の静的Q&Aリストを表示（完全フォールバック）
    return (
      <div className="bg-white rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">💬 質問＆回答リスト</h3>
        </div>
        <div className="space-y-4 p-4">
          {generateQAList().map((topic, index) => (
            <div key={topic.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">{topic.icon}</span>
                <h4 className="font-semibold text-foreground">{topic.title}</h4>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                <strong>質問内容:</strong> {topic.description}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>診断結果に基づく回答:</strong> 
                {topic.id === 'relationship' && mbti && taiheki ? (
                  `${mbtiDescriptions[mbti.type]?.name}で体癖${taiheki.primary}種の特性を活かした人間関係づくりをお勧めします。`
                ) : topic.id === 'career' && mbti ? (
                  `MBTI ${mbti.type}の特性を活かしたキャリア選択が適しています。`
                ) : (
                  'あなたの診断結果に基づいた個別的なアドバイスです。'
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // クリップボードにコピーするテキストを生成
  const generateClipboardText = (): string => {
    const qa = generateQAList();
    const date = new Date().toLocaleDateString('ja-JP');
    
    let text = `# COCOSiL 診断結果レポート\n`;
    text += `生成日時: ${date}\n\n`;
    
    // 基本情報
    text += `## 基本情報\n`;
    text += `- 氏名: ${basicInfo.name}\n`;
    text += `- 生年月日: ${basicInfo.birthdate.year}年${basicInfo.birthdate.month}月${basicInfo.birthdate.day}日\n`;
    text += `- 年齢・性別: ${calculateAge(basicInfo.birthdate.year, basicInfo.birthdate.month, basicInfo.birthdate.day)}歳・${basicInfo.gender === 'male' ? '男性' : basicInfo.gender === 'female' ? '女性' : '回答なし'}\n`;
    text += `- 動物占い: ${fortuneResult.animal}\n`;
    text += `- MBTI: ${mbti?.type || '診断未実施'}\n`;
    text += `- 体癖: ${taiheki ? `主体癖${taiheki.primary}種・副体癖${taiheki.secondary === 0 ? 'なし' : `${taiheki.secondary}種`}` : '診断未実施'}\n`;
    text += `- 六星占術: ${fortuneResult.sixStar}\n\n`;
    
    // 統合分析
    text += `## 統合分析結果\n`;
    text += `### あなたの特徴\n`;
    text += `あなたの特徴を一言で表すと「${generateCatchphrase(mbti, taiheki, fortuneResult)}」です。\n\n`;
    text += `### 対人的特徴\n`;
    text += `${generateInterpersonalTraits(mbti, taiheki, fortuneResult)}\n\n`;
    text += `### 思考と行動の特徴\n`;
    text += `${generateBehavioralTraits(mbti, taiheki, fortuneResult)}\n\n`;
    
    // 質問&回答リスト (条件分岐)
    if (hasCompletedCounseling && chatSummary) {
      text += `## AIカウンセリング記録\n`;
      text += `**相談カテゴリ**: ${chatSummary.topicTitle}\n`;
      text += `**セッション時間**: ${chatSummary.sessionDuration}分\n\n`;
      
      chatSummary.qaExchanges.forEach((exchange, index) => {
        text += `**Q${index + 1}**: ${exchange.question}\n`;
        text += `**A${index + 1}**: ${exchange.answer}\n\n`;
      });
    } else if (!hasCompletedCounseling) {
      text += `## 質問＆回答リスト\n`;
      text += `AIカウンセリングを利用すると、個別化されたアドバイスがここに表示されます。\n\n`;
    } else {
      // フォールバック: 既存の静的Q&A
      text += `## 相談カテゴリ別アドバイス\n`;
      qa.forEach((topic, index) => {
        text += `### ${index + 1}. ${topic.title}\n`;
        text += `**質問内容**: ${topic.description}\n`;
        text += `**診断結果に基づく回答**: `;
        
        if (topic.id === 'relationship' && mbti && taiheki) {
          text += `${mbtiDescriptions[mbti.type]?.name}で体癖${taiheki.primary}種の特性を活かし、${fortuneResult.animal}のように周囲との調和を大切にした人間関係を築くことをお勧めします。`;
        } else if (topic.id === 'career' && mbti) {
          text += `MBTI ${mbti.type}の特性を活かし、${mbti.type.includes('T') ? '論理的思考力' : '感情や価値観'}を重視したキャリア選択が適しています。`;
        } else if (topic.id === 'personality') {
          text += `あなたは${generateCatchphrase(mbti, taiheki, fortuneResult)}という特徴があり、${generateInterpersonalTraits(mbti, taiheki, fortuneResult)}`;
        } else if (topic.id === 'future') {
          text += `${fortuneResult.sixStar}の特性と${mbti?.type || taiheki ? `体癖${taiheki?.primary}種` : '動物占い'}の特徴を活かした将来設計を立てることで、充実した人生を送ることができるでしょう。`;
        } else {
          text += 'AIカウンセリングを利用して、より詳細なアドバイスを受けることができます。';
        }
        text += `\n\n`;
      });
    }
    
    // フッター
    text += `---\n`;
    text += `※この診断結果は自己理解を深めるための参考情報です。\n`;
    text += `※医療・心理学的診断や治療の代替にはなりません。\n`;
    text += `※生成元: COCOSiL（ココシル）統合診断システム\n`;
    
    return text;
  };

  // クリップボードにコピー
  const copyToClipboard = async () => {
    setIsCopying(true);
    setCopySuccess(false);
    
    try {
      const text = generateClipboardText();
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      
      // 3秒後にフィードバックを非表示
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました:', error);
      alert('クリップボードへのコピーに失敗しました。ブラウザがクリップボード機能をサポートしていない可能性があります。');
    } finally {
      setIsCopying(false);
    }
  };

  // ワードバンクの定義
  const wordBank = {
    mbti: {
      // 外向・内向
      'E': { social: '積極的にコミュニケーションを取り', thinking: 'エネルギッシュに行動し' },
      'I': { social: '深い関係性を重視し', thinking: '内省的に考えを深め' },
      // 感覚・直感
      'S': { thinking: '現実的な視点で', action: '堅実に進める' },
      'N': { thinking: '直感的にアイデアを描き', action: '可能性を追求する' },
      // 思考・感情
      'T': { thinking: '論理的に分析し', action: '効率重視で行動' },
      'F': { thinking: '価値観を大切にし', action: '調和を保ちながら進む' },
      // 計画・柔軟
      'J': { action: '計画的に', behavior: '組織的な進め方を好む' },
      'P': { action: '臨機応変に', behavior: '柔軟性を活かす' }
    },
    taiheki: {
      1: { social: '集中力で周囲を惹きつけ', action: '一点突破の力強さで' },
      2: { social: '包容力で人を安心させ', action: '受け入れる姿勢で' },
      3: { social: '軽快な動きで場を活性化し', action: 'フットワーク軽く' },
      4: { social: '慎重な距離感で信頼を築き', action: '着実なペースで' },
      5: { social: '独自の視点で影響を与え', action: '創造的な発想で' },
      6: { social: '情熱的な表現で人を動かし', action: '熱意を持って' },
      7: { social: '調整力で人と人を繋ぎ', action: 'バランス感覚で' },
      8: { social: '責任感で周囲を支え', action: '粘り強く継続し' },
      9: { social: '寛容さで場を和ませ', action: 'おおらかに構え' },
      10: { social: '集中力で深く関わり', action: '徹底的に取り組む' }
    },
    animals: {
      'チータ': { personality: 'スピード感のある', social: '颯爽と駆け抜ける' },
      '黒ひょう': { personality: 'カリスマ性のある', social: '自由に動き回る' },
      'ライオン': { personality: 'リーダーシップのある', social: '堂々と振る舞う' },
      'トラ': { personality: '情熱的な', social: '力強く前進する' },
      '子守熊': { personality: 'マイペースな', social: 'のんびりと過ごす' },
      'たぬき': { personality: '愛嬌のある', social: '親しみやすく接する' },
      'こじか': { personality: '繊細で美しい', social: '上品に立ち回る' },
      'ひつじ': { personality: '穏やかな', social: '協調性を大切にする' },
      'ペガサス': { personality: '自由奔放な', social: '束縛を嫌い飛び回る' },
      'ウォッカ': { personality: 'クールな', social: '洗練された魅力で' }
    }
  };

  // 文字数制限内で語を組み合わせる関数
  const fitText = (words: string[], limit: number): string => {
    let result = '';
    for (const word of words) {
      const testText = result + word;
      if (Array.from(testText).length > limit) break;
      result = testText;
    }
    return result || words[0]?.substring(0, limit) || '';
  };

  // キーワード抽出関数
  const extractKeywords = (mbti: any, taiheki: any, fortune: FortuneResult) => {
    const keywords = {
      mbtiSocial: '',
      mbtiThinking: '',
      mbtiAction: '',
      taihekiSocial: '',
      taihekiAction: '',
      animalPersonality: '',
      animalSocial: ''
    };

    if (mbti?.type) {
      const type = mbti.type;
      keywords.mbtiSocial = wordBank.mbti[type[0] as keyof typeof wordBank.mbti]?.social || '';
      keywords.mbtiThinking = wordBank.mbti[type[1] as keyof typeof wordBank.mbti]?.thinking || '';
      keywords.mbtiAction = wordBank.mbti[type[3] as keyof typeof wordBank.mbti]?.action || '';
    }

    if (taiheki?.primary) {
      const type = taiheki.primary;
      keywords.taihekiSocial = wordBank.taiheki[type as keyof typeof wordBank.taiheki]?.social || '';
      keywords.taihekiAction = wordBank.taiheki[type as keyof typeof wordBank.taiheki]?.action || '';
    }

    if (fortune?.animal) {
      const animal = fortune.animal;
      const animalKey = Object.keys(wordBank.animals).find(key => 
        animal.includes(key) || key.includes(animal.replace(/[のな]/g, ''))
      );
      if (animalKey) {
        keywords.animalPersonality = wordBank.animals[animalKey as keyof typeof wordBank.animals]?.personality || '';
        keywords.animalSocial = wordBank.animals[animalKey as keyof typeof wordBank.animals]?.social || '';
      }
    }

    return keywords;
  };

  // キャッチフレーズ生成（15-20文字で完結）
  const generateCatchphrase = (mbti: any, taiheki: any, fortune: FortuneResult): string => {
    const keywords = extractKeywords(mbti, taiheki, fortune);
    
    const candidateWords = [
      keywords.animalPersonality,
      keywords.mbtiThinking?.replace(/[をに].*/, ''), // 「論理的に」→「論理的」
      keywords.taihekiAction?.replace(/[でを].*/, ''), // 「フットワーク軽く」→「フットワーク軽」
      '人'
    ].filter(Boolean);

    return fitText(candidateWords, 20);
  };

  // 対人的特徴生成（40-60文字で完結）
  const generateInterpersonalTraits = (mbti: any, taiheki: any, fortune: FortuneResult): string => {
    const keywords = extractKeywords(mbti, taiheki, fortune);
    
    const parts = [
      keywords.mbtiSocial,
      keywords.taihekiSocial,
      keywords.animalSocial + '特徴があります'
    ].filter(Boolean);

    return fitText(parts, 60);
  };

  // 思考と行動の特徴生成（40-60文字で完結）
  const generateBehavioralTraits = (mbti: any, taiheki: any, fortune: FortuneResult): string => {
    const keywords = extractKeywords(mbti, taiheki, fortune);
    
    const parts = [
      keywords.mbtiThinking,
      keywords.taihekiAction,
      keywords.mbtiAction + '傾向があります'
    ].filter(Boolean);

    return fitText(parts, 60);
  };

  // 基本情報と算命学結果は必須、MBTI・体癖は任意
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
                <p className="text-lg font-bold text-yellow-900">{getWesternZodiac(basicInfo.birthdate.month, basicInfo.birthdate.day)}</p>
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
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">あなたの総合的な特徴</h4>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-base font-medium text-blue-900 mb-2">
                    あなたの特徴を一言で表すと「
                    <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                      {generateCatchphrase(mbti, taiheki, fortuneResult)}
                    </span>
                    」です。
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-white rounded p-3">
                    <h5 className="text-sm font-semibold text-blue-700 mb-1">💫 対人的特徴</h5>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {generateInterpersonalTraits(mbti, taiheki, fortuneResult)}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h5 className="text-sm font-semibold text-blue-700 mb-1">🧠 思考と行動の特徴</h5>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {generateBehavioralTraits(mbti, taiheki, fortuneResult)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {taiheki && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-light-fg mb-3">📋 推奨事項</h5>
                <ul className="text-sm text-light-fg-muted space-y-1">
                  {taiheki.recommendations?.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="text-center space-y-6">
        <div className="space-y-6">
          <Link href="/diagnosis/chat">
            <Button
              className="bg-gradient-brand hover:shadow-lg text-lg px-8 py-4"
              size="lg"
            >
              AIカウンセリングを開始
            </Button>
          </Link>
          
          <div className="space-y-4">
            <Button
              onClick={showFinalResults}
              variant="secondary"
              className="w-full max-w-md mx-auto"
            >
              最終結果を出力
            </Button>
            
            <Link href="/" className="block">
              <Button variant="secondary" className="w-full max-w-md mx-auto">
                ホームに戻る
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-xs text-light-fg-muted">
          診断データは30日後に自動削除されます
        </div>
      </div>

      {/* 最終結果オーバーレイ */}
      {showFinalResultsOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* オーバーレイヘッダー */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-light-fg">最終診断結果</h2>
                <button
                  onClick={closeFinalResults}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 基本情報セクション */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-light-fg mb-4">📋 基本情報</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">氏名:</span>
                    <span>{basicInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">生年月日:</span>
                    <span>{basicInfo.birthdate.year}年{basicInfo.birthdate.month}月{basicInfo.birthdate.day}日</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">年齢・性別:</span>
                    <span>
                      {calculateAge(basicInfo.birthdate.year, basicInfo.birthdate.month, basicInfo.birthdate.day)}歳・
                      {basicInfo.gender === 'male' ? '男性' : basicInfo.gender === 'female' ? '女性' : '回答なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">動物占い:</span>
                    <span>{fortuneResult.animal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">MBTI:</span>
                    <span>{mbti?.type || '診断未実施'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">体癖:</span>
                    <span>{taiheki ? `主体癖${taiheki.primary}種・副体癖${taiheki.secondary === 0 ? 'なし' : `${taiheki.secondary}種`}` : '診断未実施'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">六星占術:</span>
                    <span>{fortuneResult.sixStar}</span>
                  </div>
                </div>
              </div>

              {/* 質問＆回答リストセクション */}
              <div className="mb-6">
                {renderQASection()}
              </div>

              {/* アクションボタン */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={copyToClipboard}
                  disabled={isCopying}
                  variant="secondary"
                  className="px-6 py-2 flex items-center space-x-2"
                >
                  {isCopying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span>コピー中...</span>
                    </>
                  ) : copySuccess ? (
                    <>
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>コピー完了!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>テキストをコピー</span>
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={closeFinalResults}
                  className="bg-gradient-brand hover:shadow-lg px-8 py-2"
                >
                  閉じる
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

