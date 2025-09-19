import { NextRequest, NextResponse } from 'next/server';
import { calculateFortuneSimplified } from '@/lib/fortune/precision-calculator';



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
    // リクエストボディの解析
    const body = await request.json();
    const { year, month, day } = body;

    // 入力値検証
    if (!year || !month || !day) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'year, month, dayが必要です' 
        },
        { status: 400 }
      );
    }

    // 数値変換と範囲チェック
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);

    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '年月日は数値で入力してください' 
        },
        { status: 400 }
      );
    }

    // 算命学計算実行 (precision-calculator使用)
    const result = calculateFortuneSimplified(y, m, d);

    // 従来のレスポンス形式に変換
    const response: FortuneResponse = {
      age: result.age,
      zodiac: result.western_zodiac,
      animal: result.animal_character,
      six_star: result.six_star,
      fortune_detail: {
        birth_date: `${y}年${m}月${d}日`,
        chinese_zodiac: `${result.western_zodiac}`,
        animal_fortune: `動物占い：${result.animal_character}`,
        six_star_detail: `六星占術：${result.six_star}`,
        personality_traits: result.animal_details?.character ? 
          [result.animal_details.character, `カラー：${result.animal_details.color}`] : 
          ['動物キャラクター', '特性']
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

