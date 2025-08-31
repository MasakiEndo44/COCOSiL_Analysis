import { NextRequest, NextResponse } from 'next/server';

interface FortuneRequest {
  year: number;
  month: number;
  day: number;
}

interface FortuneResponse {
  age: number;
  zodiac: string;
  animal: string;
  six_star: string;
  fortune_detail: {
    birth_date: string;
    chinese_zodiac: string;
    animal_fortune: string;
    six_star_detail: string;
    personality_traits: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: FortuneRequest = await request.json();
    const { year, month, day } = body;

    // 入力検証
    if (!year || !month || !day) {
      return NextResponse.json(
        { error: '生年月日が正しく入力されていません' },
        { status: 400 }
      );
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - year;

    // 干支計算
    const zodiacAnimals = [
      '子', '丑', '寅', '卯', '辰', '巳',
      '午', '未', '申', '酉', '戌', '亥'
    ];
    const zodiacIndex = (year - 4) % 12;
    const zodiac = zodiacAnimals[zodiacIndex];

    // 動物占い計算（簡易版）
    const animals = [
      'チーター', 'ブラックパンサー', 'ライオン', 'トラ', 
      'タヌキ', 'コアラ', 'ゾウ', 'ひつじ', 
      'ペガサス', '狼', 'サル', 'こじか'
    ];
    const animalIndex = (month + day) % 12;
    const animal = animals[animalIndex];

    // 六星占術計算（簡易版）
    const sixStars = [
      '土星', '金星', '火星', '天王星', '木星', '水星'
    ];
    const sixStarIndex = (year + month + day) % 6;
    const six_star = sixStars[sixStarIndex];

    // 性格特性の算出
    const personalityTraits = getPersonalityTraits(animal, six_star);

    const response: FortuneResponse = {
      age,
      zodiac,
      animal,
      six_star,
      fortune_detail: {
        birth_date: `${year}年${month}月${day}日`,
        chinese_zodiac: `${zodiac}年生まれ`,
        animal_fortune: `動物占い：${animal}`,
        six_star_detail: `六星占術：${six_star}`,
        personality_traits: personalityTraits
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Fortune calculation error:', error);
    return NextResponse.json(
      { error: '算命学計算中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function getPersonalityTraits(animal: string, sixStar: string): string[] {
  const traits: Record<string, string[]> = {
    'チーター': ['行動力がある', 'スピード重視', '瞬発力に優れる'],
    'ブラックパンサー': ['神秘的', '独立心が強い', '洞察力がある'],
    'ライオン': ['リーダーシップ', '堂々としている', '責任感が強い'],
    'トラ': ['勇敢', '情熱的', '自信に満ちている'],
    'タヌキ': ['人懐っこい', '愛嬌がある', '適応力が高い'],
    'コアラ': ['マイペース', '温厚', '平和主義'],
    'ゾウ': ['慎重', '記憶力が良い', '家族思い'],
    'ひつじ': ['優しい', '協調性がある', '従順'],
    'ペガサス': ['自由奔放', '創造性豊か', '夢見がち'],
    '狼': ['孤独を愛する', '忠実', '直感力がある'],
    'サル': ['知恵がある', '器用', '社交的'],
    'こじか': ['繊細', '美的センス', '純粋']
  };

  return traits[animal] || ['個性的', '魅力的', '独特な才能を持つ'];
}