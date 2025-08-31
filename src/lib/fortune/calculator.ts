// 算命学・動物占い計算システム
import type { FortuneResult } from '@/types';

// 干支（十二支）
const zodiacAnimals = [
  '子（ねずみ）', '丑（うし）', '寅（とら）', '卯（うさぎ）',
  '辰（たつ）', '巳（へび）', '午（うま）', '未（ひつじ）',
  '申（さる）', '酉（とり）', '戌（いぬ）', '亥（いのしし）'
];

// 動物占い（12種類）
const fortuneAnimals = [
  'チーター', 'ライオン', 'コアラ', '黒ひょう',
  '猿', '狼', '子守熊', 'たぬき',
  '虎', 'ゾウ', 'こじか', 'ひつじ'
];

// 五行
const elements = ['木', '火', '土', '金', '水'];

// 六星占術（基本6種）
const sixStars = ['土星', '金星', '火星', '天王星', '木星', '水星'];

// 算命学・動物占い計算メイン関数
export function calculateFortune(year: number, month: number, day: number): FortuneResult {
  // 干支計算
  const zodiacIndex = (year - 4) % 12;
  const zodiac = zodiacAnimals[zodiacIndex];
  
  // 動物占い計算（生年月日から）
  const animalIndex = ((year - 1900) + month + day) % 12;
  const animal = fortuneAnimals[animalIndex];
  
  // 五行計算（年の末尾で決定）
  const elementIndex = (year % 10) % 5;
  const element = elements[elementIndex];
  
  // 六星占術計算（生年月日の合計から）
  const birthSum = year + month + day;
  const sixStarIndex = birthSum % 6;
  const sixStar = sixStars[sixStarIndex];
  
  // 特徴と運勢を生成
  const characteristics = generateCharacteristics(animal, element, sixStar);
  const fortune = generateFortune(zodiac, animal, element);
  
  return {
    zodiac,
    animal,
    sixStar,
    element,
    fortune,
    characteristics
  };
}

// 特徴生成
function generateCharacteristics(animal: string, element: string, sixStar: string): string[] {
  const animalTraits: Record<string, string[]> = {
    'チーター': ['行動力がある', '独立心が強い', '目標達成能力が高い', '競争心がある'],
    'ライオン': ['リーダーシップがある', '威厳がある', '面倒見が良い', '自信に満ちている'],
    'コアラ': ['マイペース', '平和主義', '芸術的感性がある', 'のんびりしている'],
    '黒ひょう': ['神秘的', '直感力が鋭い', '独創性がある', '孤高を好む'],
    '猿': ['知的好奇心旺盛', '器用', 'コミュニケーション能力が高い', '適応力がある'],
    '狼': ['職人気質', '完璧主義', '一匹狼的', '専門性を追求する'],
    '子守熊': ['母性的', '世話好き', '情に厚い', '家族思い'],
    'たぬき': ['人懐っこい', '社交的', '愛嬌がある', '協調性がある'],
    '虎': ['正義感が強い', '勇敢', '情熱的', 'エネルギッシュ'],
    'ゾウ': ['包容力がある', '慎重', '長期的視野を持つ', '安定志向'],
    'こじか': ['純真', '感受性が豊か', '美的センスがある', '優しい'],
    'ひつじ': ['穏やか', '協調性がある', '忍耐力がある', '思慮深い']
  };

  const elementTraits: Record<string, string[]> = {
    '木': ['成長性がある', '創造性豊か', '柔軟性がある'],
    '火': ['情熱的', 'エネルギッシュ', '積極的'],
    '土': ['安定性がある', '現実的', '信頼できる'],
    '金': ['意志が強い', '完璧主義', '責任感が強い'],
    '水': ['適応力がある', '直感的', '流動性がある']
  };

  const baseTraits = animalTraits[animal] || [];
  const elementalTraits = elementTraits[element] || [];
  
  return [...baseTraits, ...elementalTraits.slice(0, 2)];
}

// 運勢生成
function generateFortune(zodiac: string, animal: string, element: string): string {
  const fortunePatterns: Record<string, string> = {
    // 動物別基本運勢
    'チーター': 'スピード感のある展開が期待できる時期。新しいチャレンジには絶好のタイミングです。',
    'ライオン': '周囲から注目を集め、リーダーシップを発揮できる時期。堂々と行動しましょう。',
    'コアラ': 'マイペースに物事を進められる穏やかな時期。無理をせず自然体で過ごしましょう。',
    '黒ひょう': '直感力が冴える神秘的な時期。内なる声に耳を傾けることが重要です。',
    '猿': '知的好奇心が旺盛になり、新しい学びのチャンスが多い時期。積極的に学習しましょう。',
    '狼': '専門性を深められる集中の時期。一つのことに打ち込むことで大きな成果が得られます。',
    '子守熊': '人間関係が豊かになる時期。家族や身近な人との絆を大切にしましょう。',
    'たぬき': '社交運が上昇し、多くの人との出会いがある時期。人脈を大切にしましょう。',
    '虎': '情熱を注げる目標が見つかる時期。勇気を持って行動することが成功への鍵です。',
    'ゾウ': '長期的な計画を立てるのに適した時期。慎重に準備を進めることで安定した成果が得られます。',
    'こじか': '感性が豊かになり、美しいものに触れる機会が多い時期。芸術的活動がおすすめです。',
    'ひつじ': '穏やかで調和のとれた時期。周囲との協調を大切にすることで良い結果が生まれます。'
  };

  const baseFortune = fortunePatterns[animal] || '全体的にバランスの取れた良い時期です。';
  
  // 五行による補正
  const elementModifiers: Record<string, string> = {
    '木': '成長と発展の要素が強まります。',
    '火': '情熱とエネルギーが高まります。',
    '土': '安定性と堅実さが重要になります。',
    '金': '意志の強さと完璧性が求められます。',
    '水': '柔軟性と適応力が鍵となります。'
  };

  return `${baseFortune} ${elementModifiers[element] || ''}`;
}

// 相性計算（参考）
export function calculateCompatibility(animal1: string, animal2: string): {
  score: number;
  description: string;
} {
  // 動物占い相性マトリックス（簡略版）
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    'チーター': { 'ライオン': 80, 'コアラ': 40, '猿': 70, '虎': 85 },
    'ライオン': { 'チーター': 80, '子守熊': 75, 'ゾウ': 90, 'ひつじ': 60 },
    'コアラ': { 'チーター': 40, 'こじか': 85, 'ひつじ': 80, 'たぬき': 70 },
    // ... 他の組み合わせ
  };

  const score = compatibilityMatrix[animal1]?.[animal2] || 
                compatibilityMatrix[animal2]?.[animal1] || 
                50; // デフォルト値

  let description = '';
  if (score >= 80) {
    description = '非常に相性が良い組み合わせです。お互いを高め合える関係性が期待できます。';
  } else if (score >= 70) {
    description = '良い相性です。互いの特徴を理解し合うことで良好な関係が築けます。';
  } else if (score >= 50) {
    description = '普通の相性です。お互いの違いを認め合うことが大切です。';
  } else {
    description = '異なる特徴を持つ組み合わせです。理解し合う努力が必要かもしれません。';
  }

  return { score, description };
}