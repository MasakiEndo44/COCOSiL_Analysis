'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { EmptyQAState } from '@/ui/components/counseling/empty-qa-state';
import { SummarizedQAList } from '@/ui/components/counseling/summarized-qa-list';
import { calculateAge } from '@/lib/utils';
import { ExportDialog } from '@/ui/components/diagnosis/export-dialog';
import { buildDiagnosisMarkdown, validateDiagnosisData } from '@/lib/build-diagnosis-markdown';
import { GuidanceOverlay } from '@/ui/components/overlays/guidance-overlay';

import { mbtiDescriptions } from '@/lib/data/mbti-questions';
import { animals60WordBank } from '@/lib/data/animals60';
import { ANIMAL_FORTUNE_MAPPING } from '@/lib/data/animal-fortune-mapping';
import Link from 'next/link';
import type { FortuneResult } from '@/types';
import { safeGetItem, safeRemoveItem } from '@/lib/localStorage-utils';
import { parseAndValidateTaihekiResult } from '@/lib/taiheki-validation';

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

// Enhanced word bank for natural Japanese catchphrase generation
const getSimpleWordBank = () => {
  return {
    mbti: {
      'ENFP': {
        base: '情熱',
        attributive: '情熱的な',
        connective: '情熱的で',
        noun: '創造者',
        shortNoun: '創造者',
        trait1: '自由奔放',
        trait2: '直感的',
        trait3: '社交的'
      },
      'INFP': {
        base: '理想',
        attributive: '理想的な',
        connective: '理想的で',
        noun: '探求者',
        shortNoun: '探求者',
        trait1: '内向的',
        trait2: '感情豊か',
        trait3: '創造的'
      },
      'ENFJ': {
        base: 'カリスマ',
        attributive: 'カリスマ的な',
        connective: 'カリスマ的で',
        noun: '指導者',
        shortNoun: '指導者',
        trait1: '外向的',
        trait2: '思いやり深い',
        trait3: '計画的'
      },
      'INFJ': {
        base: '洞察',
        attributive: '洞察力のある',
        connective: '洞察力があり',
        noun: '賢者',
        shortNoun: '賢者',
        trait1: '内向的',
        trait2: '直感的',
        trait3: '計画的'
      },
      'ENTP': {
        base: '革新',
        attributive: '革新的な',
        connective: '革新的で',
        noun: '起業家',
        shortNoun: '起業家',
        trait1: '外向的',
        trait2: '論理的',
        trait3: '柔軟'
      },
      'INTP': {
        base: '論理',
        attributive: '論理的な',
        connective: '論理的で',
        noun: '思考家',
        shortNoun: '思考家',
        trait1: '内向的',
        trait2: '論理的',
        trait3: '独立的'
      },
      'ENTJ': {
        base: '戦略',
        attributive: '戦略的な',
        connective: '戦略的で',
        noun: '指揮官',
        shortNoun: '指揮官',
        trait1: '外向的',
        trait2: '論理的',
        trait3: '計画的'
      },
      'INTJ': {
        base: '独創',
        attributive: '独創的な',
        connective: '独創的で',
        noun: '建築家',
        shortNoun: '建築家',
        trait1: '内向的',
        trait2: '論理的',
        trait3: '計画的'
      },
      'ESFP': {
        base: '自由',
        attributive: '自由奔放な',
        connective: '自由奔放で',
        noun: '表現者',
        shortNoun: '表現者',
        trait1: '外向的',
        trait2: '現実的',
        trait3: '感情的'
      },
      'ISFP': {
        base: '芸術',
        attributive: '芸術的な',
        connective: '芸術的で',
        noun: '魂の人',
        shortNoun: '魂の人',
        trait1: '内向的',
        trait2: '現実的',
        trait3: '感情的'
      },
      'ESFJ': {
        base: '思いやり',
        attributive: '思いやり深い',
        connective: '思いやり深く',
        noun: '社交家',
        shortNoun: '社交家',
        trait1: '外向的',
        trait2: '現実的',
        trait3: '計画的'
      },
      'ISFJ': {
        base: '献身',
        attributive: '献身的な',
        connective: '献身的で',
        noun: '守護者',
        shortNoun: '守護者',
        trait1: '内向的',
        trait2: '現実的',
        trait3: '計画的'
      },
      'ESTP': {
        base: '行動',
        attributive: '行動的な',
        connective: '行動的で',
        noun: '実行者',
        shortNoun: '実行者',
        trait1: '外向的',
        trait2: '現実的',
        trait3: '柔軟'
      },
      'ISTP': {
        base: '職人',
        attributive: '職人気質の',
        connective: '職人気質で',
        noun: '技術者',
        shortNoun: '技術者',
        trait1: '内向的',
        trait2: '現実的',
        trait3: '論理的'
      },
      'ESTJ': {
        base: '実務',
        attributive: '実務的な',
        connective: '実務的で',
        noun: '管理者',
        shortNoun: '管理者',
        trait1: '外向的',
        trait2: '現実的',
        trait3: '計画的'
      },
      'ISTJ': {
        base: '堅実',
        attributive: '堅実な',
        connective: '堅実で',
        noun: '管理者',
        shortNoun: '管理者',
        trait1: '内向的',
        trait2: '現実的',
        trait3: '計画的'
      }
    },
    taiheki: {
      1: {
        base: '冷静',
        attributive: '冷静な',
        connective: '冷静で',
        noun: '分析家',
        shortNoun: '分析家',
        trait1: '論理的',
        trait2: '理性的',
        trait3: '集中力'
      },
      2: {
        base: '協調',
        attributive: '協調性のある',
        connective: '協調性を持ち',
        noun: '調整役',
        shortNoun: '調整役',
        trait1: '思考力',
        trait2: '共感力',
        trait3: '調和'
      },
      3: {
        base: '明るさ',
        attributive: '明るい',
        connective: '明るく',
        noun: 'ムードメーカー',
        shortNoun: 'ムードメーカー',
        trait1: '感情豊か',
        trait2: '楽しさ重視',
        trait3: '愛され'
      },
      4: {
        base: '感性',
        attributive: '感性豊かな',
        connective: '感性豊かで',
        noun: '芸術家',
        shortNoun: '芸術家',
        trait1: '感情豊か',
        trait2: '内面世界',
        trait3: '美的感覚'
      },
      5: {
        base: '行動',
        attributive: '行動的な',
        connective: '行動的で',
        noun: '実業家',
        shortNoun: '実業家',
        trait1: 'リーダーシップ',
        trait2: '実用重視',
        trait3: '常に動く'
      },
      6: {
        base: 'ロマン',
        attributive: 'ロマンチックな',
        connective: 'ロマンチックで',
        noun: '夢想家',
        shortNoun: '夢想家',
        trait1: 'ロマンチスト',
        trait2: '想像力',
        trait3: 'ひねくれ'
      },
      7: {
        base: '闘争',
        attributive: '闘争心のある',
        connective: '闘争心を持ち',
        noun: '戦士',
        shortNoun: '戦士',
        trait1: '闘争心',
        trait2: '経験重視',
        trait3: '勝ち負け'
      },
      8: {
        base: '忍耐',
        attributive: '忍耐強い',
        connective: '忍耐強く',
        noun: '支援者',
        shortNoun: '支援者',
        trait1: '正義感',
        trait2: '我慢強い',
        trait3: '安定感'
      },
      9: {
        base: '完璧',
        attributive: '完璧主義の',
        connective: '完璧主義で',
        noun: '専門家',
        shortNoun: '専門家',
        trait1: '職人気質',
        trait2: '完璧主義',
        trait3: '集中力'
      },
      10: {
        base: '包容',
        attributive: '包容力のある',
        connective: '包容力を持ち',
        noun: '母性型',
        shortNoun: '母性型',
        trait1: '安定感',
        trait2: '包容力',
        trait3: '母性'
      }
    },
    
    animals60: animals60WordBank,

    zodiac: {
      '牡羊座': {
        element: '火',
        adjective: '情熱的な',
        noun: '開拓者',
        trait1: '積極的',
        trait2: '率直',
        trait3: '行動力'
      },
      '牡牛座': {
        element: '土',
        adjective: '安定した',
        noun: '実務家',
        trait1: 'マイペース',
        trait2: '堅実',
        trait3: '継続力'
      },
      '双子座': {
        element: '風',
        adjective: '知的な',
        noun: '情報通',
        trait1: '好奇心',
        trait2: '機転利く',
        trait3: '多才'
      },
      '蟹座': {
        element: '水',
        adjective: '愛情深い',
        noun: '家族思い',
        trait1: '共感力',
        trait2: '面倒見良い',
        trait3: '情に厚い'
      },
      '獅子座': {
        element: '火',
        adjective: '華やかな',
        noun: 'スター',
        trait1: '存在感',
        trait2: '創造的',
        trait3: '負けず嫌い'
      },
      '乙女座': {
        element: '土',
        adjective: '完璧主義の',
        noun: '分析家',
        trait1: '几帳面',
        trait2: '実務的',
        trait3: '献身的'
      },
      '天秤座': {
        element: '風',
        adjective: '調和を重んじる',
        noun: '美学者',
        trait1: 'バランス感覚',
        trait2: '社交的',
        trait3: '公正'
      },
      '蠍座': {
        element: '水',
        base: '神秘',
        attributive: '神秘的な',
        connective: '神秘的で',
        noun: '洞察者',
        shortNoun: '洞察者',
        trait1: '集中力',
        trait2: '深い愛情',
        trait3: '洞察力'
      },
      '射手座': {
        element: '火',
        base: '自由',
        attributive: '自由な',
        connective: '自由で',
        noun: '冒険家',
        shortNoun: '冒険家',
        trait1: '楽観的',
        trait2: '向学心',
        trait3: '自由愛好'
      },
      '山羊座': {
        element: '土',
        adjective: '責任感のある',
        noun: '登山家',
        trait1: '計画的',
        trait2: '忍耐力',
        trait3: '責任感'
      },
      '水瓶座': {
        element: '風',
        adjective: '革新的な',
        noun: '理想家',
        trait1: '独創的',
        trait2: '客観的',
        trait3: '未来志向'
      },
      '魚座': {
        element: '水',
        adjective: '感受性豊かな',
        noun: '芸術家',
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


// Helper function to generate natural Japanese catchphrase
const generateNaturalCatchphrase = (
  mbtiData: any,
  taihekiData: any,
  zodiacData: any
): string => {

  // Safe accessor functions for vocabulary data with fallbacks
  const getAttributive = (data: any): string => {
    return data?.attributive || data?.adjective || '多面的な';
  };

  const getNoun = (data: any): string => {
    return data?.shortNoun || data?.noun || 'タイプ';
  };

  const getBase = (data: any): string => {
    return data?.base || data?.adjective?.replace(/な$|の$/, '') || '個性';
  };

  const getConnective = (data: any): string => {
    return data?.connective || data?.adjective?.replace(/な$/, 'で') || '多面的で';
  };

  // Helper function to ensure length is appropriate (15-20 characters)
  const adjustLength = (phrase: string, maxLength: number = 20): string => {
    if (phrase.length <= maxLength) return phrase;

    // If too long, try to shorten by removing connectors or simplifying
    const simplified = phrase
      .replace(/タイプの/g, '')
      .replace(/かつ/g, '')
      .replace(/である/g, '')
      .replace(/のある/g, '');

    return simplified.length <= maxLength ? simplified : phrase.substring(0, maxLength);
  };

  // Pattern generation strategies with length consideration
  const generatePattern = (adj: string, noun: string, connector?: string): string => {
    if (connector) {
      const withConnector = `${adj}${connector}${noun}`;
      if (withConnector.length <= 20) return withConnector;
      // If too long, remove connector
      return `${adj}${noun}`;
    }
    return `${adj}${noun}`;
  };

  // Priority: MBTI + Taiheki > MBTI + Zodiac > Single source
  if (mbtiData && taihekiData) {
    // Try different combinations for best fit using safe accessors
    const options = [
      `${getAttributive(mbtiData)}${getNoun(taihekiData)}`, // 最も自然：情熱的な思考家
      `${getBase(mbtiData)}に満ちた${getNoun(taihekiData)}`, // 感情的：情熱に満ちた思考家
      generatePattern(getConnective(mbtiData), getNoun(taihekiData)), // 接続：情熱的で思考家
    ];

    // Find the best option that fits length requirements
    for (const option of options) {
      if (option.length >= 8 && option.length <= 20) {
        return option;
      }
    }
    return adjustLength(options[0]);

  } else if (mbtiData && zodiacData) {
    const result = `${getAttributive(mbtiData)}${getNoun(zodiacData)}`;
    return adjustLength(result);

  } else if (mbtiData) {
    return adjustLength(`${getAttributive(mbtiData)}${getNoun(mbtiData)}`);

  } else if (taihekiData) {
    return adjustLength(`${getAttributive(taihekiData)}${getNoun(taihekiData)}`);

  } else if (zodiacData) {
    return adjustLength(`${getAttributive(zodiacData)}${getNoun(zodiacData)}`);

  } else {
    return 'バランス型の個性';
  }
};

// Generate integrated profile in the new 3-field format
const generateIntegratedProfile = (
  mbti: any,
  taiheki: any,
  fortuneResult: FortuneResult,
  zodiacSign: string
) => {
  const wordBank = getSimpleWordBank();

  // Get base data
  const mbtiData = mbti && wordBank.mbti[mbti.type as keyof typeof wordBank.mbti];
  const taihekiData = taiheki && wordBank.taiheki[taiheki.primary as keyof typeof wordBank.taiheki];
  const zodiacData = zodiacSign && wordBank.zodiac[zodiacSign as keyof typeof wordBank.zodiac];

  // 1. キャッチフレーズ (20文字程度) - 自然な日本語形式
  const catchphrase = generateNaturalCatchphrase(mbtiData, taihekiData, zodiacData);

  // 2. 対人的特徴 (100文字程度、具体的シチュエーション含む)
  let interpersonal = '';
  const situation = ['職場で', '友人と', 'チームで', '初対面の人と'][Math.floor(Math.random() * 4)];
  
  if (mbtiData) {
    const socialStyle = mbti.type.includes('E') ? '積極的にコミュニケーションを取り' : '相手の話をじっくり聞いて';
    const approach = mbti.type.includes('F') ? '相手の気持ちを大切にし' : '論理的に物事を整理し';
    interpersonal = `${situation}は${socialStyle}、${approach}ながら関係を築くタイプです。${mbtiData.trait3}な面が周りから信頼されています。`;
  } else {
    interpersonal = `${situation}は自然体で接し、相手に合わせたコミュニケーションを心がけるタイプです。バランスの取れた対人関係を築くことができます。`;
  }

  // 3. 思考と行動の特徴 (100文字程度)
  let cognition = '';
  if (taihekiData && mbtiData) {
    const thinkingStyle = mbti.type.includes('T') ? '論理的に分析し' : '直感的に判断し';
    const actionStyle = mbti.type.includes('J') ? '計画を立ててから着実に' : '状況に応じて柔軟に';
    cognition = `${thinkingStyle}、${actionStyle}行動するタイプです。${taihekiData.trait1}で${mbtiData.trait1}な特徴があり、独自のペースで物事を進めます。`;
  } else if (mbtiData) {
    const processStyle = mbti.type.includes('N') ? '全体像を把握してから' : '具体的な事実を重視して';
    cognition = `${processStyle}判断し、${mbtiData.trait2}に行動するタイプです。自分なりの価値観を大切にしながら決断を下します。`;
  } else if (taihekiData) {
    cognition = `${taihekiData.trait1}で${taihekiData.trait2}な思考パターンを持ち、自分のペースを大切にしながら行動するタイプです。`;
  } else {
    cognition = '状況を客観的に判断し、バランスを取りながら行動するタイプです。柔軟性と安定性の両方を重視して物事を進めます。';
  }

  return {
    catchphrase,
    interpersonal,
    cognition
  };
};

// Helper function to get orientation from animal character name
const getAnimalOrientation = (animalCharacter: string): string => {
  const mapping = Object.values(ANIMAL_FORTUNE_MAPPING).find(
    item => item.character === animalCharacter
  );
  return mapping?.orientation || 'people_oriented';
};

export default function DiagnosisResults() {
  const {
    basicInfo,
    mbti,
    taiheki,
    fortune: fortuneResult,
    chatSummary,
    hasCompletedCounseling,
    overlayHints,
    markOverlaySeen,
    setTaiheki
  } = useDiagnosisStore();

  // Overlay state management
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [taihekiLoadError, setTaihekiLoadError] = useState<string | null>(null);

  // Load taiheki result from localStorage if available
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Zustandストアに既にデータがある場合はスキップ
    if (taiheki) return;

    const STORAGE_KEY = 'taiheki_diagnosis_result';
    const storedJson = safeGetItem(STORAGE_KEY);

    if (!storedJson) {
      // データが存在しない場合は何もしない（エラーではない）
      return;
    }

    // データの検証と変換
    const { success, result, validation, error } = parseAndValidateTaihekiResult(storedJson);

    if (!success || !result) {
      // バリデーションエラー - データをクリーンアップ
      console.error('❌ 体癖診断結果のバリデーションエラー:', error);
      console.error('詳細:', validation?.errors);

      // 無効なデータを削除
      safeRemoveItem(STORAGE_KEY);
      setTaihekiLoadError(error || '診断結果の読み込みに失敗しました');
      return;
    }

    // 警告がある場合はログ出力（エラーではない）
    if (validation?.warnings && validation.warnings.length > 0) {
      console.warn('⚠️ 体癖診断結果に警告があります:', validation.warnings);
    }

    // Zustandストアに保存
    setTaiheki(result);
    console.log('✅ localStorage から体癖診断結果を読み込みました:', result);

    // 成功したらlocalStorageデータをクリア（Zustandストアに移行済み）
    safeRemoveItem(STORAGE_KEY);
    console.log('🧹 localStorage データをクリーンアップしました（Zustand移行完了）');
  }, [taiheki, setTaiheki]);

  const zodiacSign = basicInfo ? getWesternZodiac(basicInfo.birthdate.month, basicInfo.birthdate.day) : '';
  const integratedProfile = useMemo(() => {
    return (basicInfo && fortuneResult)
      ? generateIntegratedProfile(mbti, taiheki, fortuneResult, zodiacSign)
      : { catchphrase: '', interpersonal: '', cognition: '' };
  }, [basicInfo, fortuneResult, mbti, taiheki, zodiacSign]);

  // Generate markdown content for export
  const { markdownContent, dataValidation } = useMemo(() => {
    const diagnosisData = {
      basicInfo,
      mbti,
      taiheki,
      fortune: fortuneResult,
      integratedProfile,
      zodiacSign,
      chatSummary: chatSummary || undefined
    };

    const validation = validateDiagnosisData(diagnosisData);
    const markdown = buildDiagnosisMarkdown(diagnosisData);

    return {
      markdownContent: markdown,
      dataValidation: validation
    };
  }, [basicInfo, mbti, taiheki, fortuneResult, integratedProfile, zodiacSign, chatSummary]);

  // Handle mounting state for SSR
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Show welcome overlay on initial load if not seen before
  useEffect(() => {
    if (hasMounted && basicInfo && !overlayHints.resultsIntroSeen) {
      setShowWelcomeOverlay(true);
    }
  }, [hasMounted, basicInfo, overlayHints.resultsIntroSeen]);

  // Overlay content definition
  const overlayContent = useMemo(() => {
    const userName = basicInfo?.name || 'お疲れさまでした';
    return {
      title: '診断完了！',
      body: `${userName}さん、診断お疲れさまでした！ここからはAIチャットで相談することも、このまま結果を出力することもできます。どちらも自由にお選びいただけます。`,
      primaryAction: {
        label: 'AIチャットで相談する',
        onClick: () => {
          setShowWelcomeOverlay(false);
          markOverlaySeen('results');
          // Navigate to chat - we can use window.location or router here
          window.location.href = '/diagnosis/chat';
        },
        variant: 'primary' as const,
        'data-testid': 'welcome-overlay-chat-action'
      },
      secondaryAction: {
        label: '結果を確認する',
        onClick: () => {
          setShowWelcomeOverlay(false);
          markOverlaySeen('results');
        },
        variant: 'secondary' as const,
        'data-testid': 'welcome-overlay-continue-action'
      }
    };
  }, [basicInfo, markOverlaySeen]);

  const handleOverlayClose = () => {
    setShowWelcomeOverlay(false);
    markOverlaySeen('results');
  };

  // Save diagnosis result to admin database - AUTO SAVE ENABLED
  useEffect(() => {
    const saveDiagnosisResult = async () => {
      if (basicInfo && fortuneResult && zodiacSign) {
        // Generate integratedProfile inside useEffect to avoid reference dependency issues
        const currentProfile = (basicInfo && fortuneResult)
          ? generateIntegratedProfile(mbti, taiheki, fortuneResult, zodiacSign)
          : { catchphrase: '', interpersonal: '', cognition: '' };

        // Skip save if profile not generated yet
        if (!currentProfile.catchphrase) return;

        try {
          console.log('💾 自動保存開始: 診断結果をデータベースに保存中...');

          const payload = {
            name: basicInfo.name || 'Unknown',
            birthDate: `${basicInfo.birthdate.year}/${String(basicInfo.birthdate.month).padStart(2, '0')}/${String(basicInfo.birthdate.day).padStart(2, '0')}`,
            gender: basicInfo.gender || 'no_answer',
            age: calculateAge(basicInfo.birthdate),
            zodiac: zodiacSign || 'Unknown',
            animal: fortuneResult.animal || 'Unknown',
            orientation: getAnimalOrientation(fortuneResult.animal || ''),
            color: currentProfile.catchphrase, // キャッチフレーズを色として使用
            mbti: mbti?.type || 'UNKNOWN',
            mainTaiheki: taiheki?.primary || 1,
            subTaiheki: taiheki?.secondary || null,
            sixStar: fortuneResult.sixStar || 'Unknown',
            theme: currentProfile.catchphrase || 'No theme',
            advice: '',
            satisfaction: 5,
            duration: '自動記録',
            feedback: '診断完了時に自動保存されました',
            // 統合診断専用フィールド
            integratedKeywords: JSON.stringify(currentProfile),
            aiSummary: `キャッチフレーズ: ${currentProfile.catchphrase}\n対人的特徴: ${currentProfile.interpersonal}\n思考と行動: ${currentProfile.cognition}`,
            fortuneColor: currentProfile.catchphrase,
            reportVersion: 'v2.0-integrated',
            isIntegratedReport: true,
            // AIカウンセリングデータ
            counselingCompleted: hasCompletedCounseling,
            counselingSummary: chatSummary ? JSON.stringify(chatSummary) : null
          };

          console.log('📋 保存データ:', payload);

          const response = await fetch('/api/admin/diagnosis-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            console.log('✅ 診断結果が正常に保存されました');
          } else {
            console.error('❌ 診断結果の保存に失敗しました:', response.status);
          }
        } catch (error) {
          console.error('❌ 診断結果保存エラー:', error);
        }
      }
    };

    // データが揃った時点で一度だけ保存実行
    saveDiagnosisResult();
  }, [basicInfo, mbti, taiheki, fortuneResult, zodiacSign, hasCompletedCounseling, chatSummary]);


  // エラー時のフォールバックUI
  if (taihekiLoadError) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-light-fg mb-2">
              診断結果の読み込みエラー
            </h1>
            <p className="text-light-fg-muted mb-4">
              {taihekiLoadError}
            </p>
            <p className="text-sm text-light-fg-muted mb-6">
              お手数ですが、もう一度体癖診断を受けてください。
            </p>
            <Link href="/diagnosis/taiheki" className="inline-block">
              <Button>体癖診断を受け直す</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Basic info and fortune result are required, MBTI and taiheki are optional
  if (!basicInfo || !fortuneResult) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
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
            {basicInfo.name}さん（{calculateAge(basicInfo.birthdate)}歳・{basicInfo.gender === 'male' ? '男性' : basicInfo.gender === 'female' ? '女性' : '回答なし'}）の統合診断結果
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

              {/* 🆕 学習CTAセクション */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">
                      あなたの体癖をもっと深く理解しませんか？
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      体癖理論の学習で、あなた（{taiheki.primary}種）の特徴や活用法をより詳しく知ることができます。
                    </p>
                    <Link
                      href={`/learn/taiheki?my_type=${taiheki.primary}&secondary=${taiheki.secondary}`}
                      className="inline-block"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white border-none"
                      >
                        📚 体癖理論を学ぶ（約10分）
                      </Button>
                    </Link>
                  </div>
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
            {/* あなたの性格をひとことで表すと */}
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-xs text-amber-700 mb-2 font-medium">あなたの性格をひとことで表すと</p>
              <p className="text-lg text-amber-900 font-medium leading-relaxed">{integratedProfile.catchphrase}</p>
            </div>

            {/* 対人的特徴 */}
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-green-700 mb-2 font-medium">対人的特徴</p>
              <p className="text-sm text-green-900 leading-relaxed">{integratedProfile.interpersonal}</p>
            </div>

            {/* 思考と行動の特徴 */}
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-xs text-purple-700 mb-2 font-medium">思考と行動の特徴</p>
              <p className="text-sm text-purple-900 leading-relaxed">{integratedProfile.cognition}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Moved above AI Counseling Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <nav
          className="flex flex-col sm:flex-row justify-center items-center gap-4 p-6 bg-white rounded-lg border border-border shadow-sm"
          aria-label="診断結果の操作"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-2 sm:mb-0 sm:mr-4">診断結果の操作:</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/diagnosis" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-8" aria-describedby="new-diagnosis-desc">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                新しい診断を受ける
              </Button>
            </Link>

            <ExportDialog
              markdownContent={markdownContent}
              isDataComplete={dataValidation.isValid}
              missingFields={dataValidation.missingFields}
            />
          </div>

          {/* Screen reader descriptions */}
          <div className="sr-only">
            <p id="new-diagnosis-desc">新しい診断を開始します</p>
            <p id="export-desc">診断結果をMarkdown形式で出力します</p>
          </div>
        </nav>
      </div>

      {/* AI Counseling Section */}
      <div className="max-w-6xl mx-auto">
        {hasCompletedCounseling && chatSummary ? (
          <SummarizedQAList summary={chatSummary} />
        ) : (
          <EmptyQAState />
        )}
      </div>

      {/* Welcome Guidance Overlay */}
      <GuidanceOverlay
        open={showWelcomeOverlay}
        onClose={handleOverlayClose}
        title={overlayContent.title}
        body={overlayContent.body}
        primaryAction={overlayContent.primaryAction}
        secondaryAction={overlayContent.secondaryAction}
        tone="welcome"
        illustration={
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        }
      />
    </div>
  );
}