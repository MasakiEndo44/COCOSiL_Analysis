import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

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

    // 日付の妥当性検証
    if (year < 1960 || year > 2025) {
      return NextResponse.json(
        { error: '対応年度は1960年～2025年です' },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: '月は1～12の範囲で入力してください' },
        { status: 400 }
      );
    }

    if (day < 1 || day > 31) {
      return NextResponse.json(
        { error: '日は1～31の範囲で入力してください' },
        { status: 400 }
      );
    }

    // 実際の日付として有効かチェック
    const testDate = new Date(year, month - 1, day);
    if (testDate.getFullYear() !== year || 
        testDate.getMonth() !== month - 1 || 
        testDate.getDate() !== day) {
      return NextResponse.json(
        { error: '存在しない日付です（例：2月30日など）' },
        { status: 400 }
      );
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - year;

    // 干支計算（正確な計算）
    const zodiacAnimals = [
      '子', '丑', '寅', '卯', '辰', '巳',
      '午', '未', '申', '酉', '戌', '亥'
    ];
    const zodiacIndex = (year - 4) % 12;
    const zodiac = zodiacAnimals[zodiacIndex];

    // CSVから正確な動物占い・六星占術データを取得
    const fortuneData = getFortuneFromCSV(year, month, day);
    const animal = fortuneData.animal;
    const six_star = fortuneData.six_star;

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
        animal_fortune: `動物占い：${fortuneData.animal_detail.character || animal}`,
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

function getFortuneFromCSV(year: number, month: number, day: number): { animal: string; six_star: string; animal_detail: any } {
  try {
    const csvPath = join(process.cwd(), 'References', '動物占い&6星占術計算', 'doubutsu_rokusei_full_lookup_1960_2025.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').slice(1); // ヘッダー除去

    const targetDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    for (const line of lines) {
      if (!line.trim()) continue;
      
      const parts = line.split(',');
      if (parts.length >= 9) {
        const date = parts[0];
        if (date === targetDate) {
          return {
            animal: parts[5], // 動物名(12動物)
            six_star: parts[8], // ６星占術(星人±)
            animal_detail: {
              number: parseInt(parts[4]), // 動物番号(1-60)
              character: parts[6], // 本質キャラ
              color: parts[7] // アニマルカラー
            }
          };
        }
      }
    }
    
    // CSVで見つからない場合のフォールバック
    throw new Error(`${targetDate}のデータがCSVに見つかりません`);
    
  } catch (error) {
    console.error('CSV読み込みエラー:', error);
    
    // フォールバック：基本的な12動物計算
    const animals = [
      'チーター', 'ブラックパンサー', 'ライオン', 'トラ', 
      'タヌキ', 'コアラ', 'ゾウ', 'ひつじ', 
      'ペガサス', '狼', 'サル', 'こじか'
    ];
    const sixStars = ['土星人+', '金星人+', '火星人+', '天王星人+', '木星人+', '水星人+'];
    
    return {
      animal: animals[(month + day) % 12],
      six_star: sixStars[(year + month + day) % 6],
      animal_detail: {
        number: 0,
        character: 'フォールバック算出',
        color: ''
      }
    };
  }
}

function getPersonalityTraits(animal: string, sixStar: string): string[] {
  // 動物別の基本特性（CSVデータに合わせて修正）
  const animalTraits: Record<string, string[]> = {
    'チーター': ['行動力がある', 'スピード重視', '瞬発力に優れる'],
    '黒ひょう': ['神秘的', '独立心が強い', '洞察力がある'],
    'ライオン': ['リーダーシップ', '堂々としている', '責任感が強い'],
    'トラ': ['勇敢', '情熱的', '自信に満ちている'],
    'たぬき': ['人懐っこい', '愛嬌がある', '適応力が高い'],
    '子守熊': ['マイペース', '温厚', '平和主義'],
    'ゾウ': ['慎重', '記憶力が良い', '家族思い'],
    'ひつじ': ['優しい', '協調性がある', '従順'],
    'ペガサス': ['自由奔放', '創造性豊か', '夢見がち'],
    '狼': ['孤独を愛する', '忠実', '直感力がある'],
    'サル': ['知恵がある', '器用', '社交的'],
    'こじか': ['繊細', '美的センス', '純粋']
  };

  // 六星占術別の特性
  const sixStarTraits: Record<string, string[]> = {
    '土星人+': ['責任感が強い', '忍耐力がある', '安定志向'],
    '土星人-': ['慎重', '地道な努力家', '現実的'],
    '金星人+': ['美的センスが優れている', '愛情豊か', '魅力的'],
    '金星人-': ['繊細', '芸術的才能', '感受性豊か'],
    '火星人+': ['エネルギッシュ', '情熱的', '行動力がある'],
    '火星人-': ['直感力がある', '瞬発力に優れる', '集中力が高い'],
    '天王星人+': ['独創性がある', '革新的', '自由を愛する'],
    '天王星人-': ['個性的', '変化を好む', '柔軟性がある'],
    '木星人+': ['包容力がある', 'おおらか', 'リーダーシップがある'],
    '木星人-': ['温厚', '人望がある', '調和を重視する'],
    '水星人+': ['知性的', '分析力がある', '論理的思考'],
    '水星人-': ['洞察力がある', '計画性がある', '冷静沈着']
  };

  const animalT = animalTraits[animal] || ['個性的'];
  const sixStarT = sixStarTraits[sixStar] || ['特別な才能を持つ'];
  
  return [...animalT, ...sixStarT];
}