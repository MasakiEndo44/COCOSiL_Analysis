import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 校正用プロンプト生成関数
const buildProofreadPrompt = (text: string, targetLength: 'short' | 'long') => {
  const lengthGuide = targetLength === 'short' 
    ? '15〜20文字'
    : '40〜60文字';
    
  return `以下の文章を自然な日本語に校正してください。

要件：
1. 接続詞や読点を適切に調整し、読みやすくする
2. 元の意味を保持する
3. 文字数を${lengthGuide}に収める（句読点も含む）
4. 一文として完結させる

校正対象：${text}

校正結果：`;
};

// 文字数チェック関数
const checkLength = (text: string, originalText: string): string => {
  const length = Array.from(text).length; // Unicode対応
  const isValidLength = (length >= 15 && length <= 20) || (length >= 40 && length <= 60);
  
  return isValidLength ? text : originalText; // 条件を満たさない場合は元の文章を返す
};

export async function POST(request: NextRequest) {
  try {
    const { text, targetLength = 'long' } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'テキストが提供されていません' }, 
        { status: 400 }
      );
    }

    // OpenAI APIキーの確認
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { result: text, error: 'API設定エラー' },
        { status: 200 } // UI破綻を避けるため200を返す
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // コスト最適化
      temperature: 0.2, // 一貫性を重視
      max_tokens: 120, // 60文字 + 余裕
      messages: [
        {
          role: 'user',
          content: buildProofreadPrompt(text, targetLength)
        }
      ],
    });

    const rawResult = completion.choices[0]?.message?.content?.trim() || '';
    
    // 「校正結果：」プレフィックスを除去
    const cleanResult = rawResult.replace(/^.*?校正結果：?\s*/, '').trim();
    
    // 文字数チェックとフォールバック
    const finalResult = checkLength(cleanResult, text);

    return NextResponse.json({
      result: finalResult,
      originalLength: Array.from(text).length,
      correctedLength: Array.from(finalResult).length,
      wasModified: finalResult !== text
    });

  } catch (error) {
    console.error('校正API エラー:', error);
    
    // エラー時は元の文章を返してUI破綻を防ぐ
    const { text } = await request.json().catch(() => ({ text: '' }));
    
    return NextResponse.json(
      { 
        result: text, 
        error: true, 
        message: 'AI校正中にエラーが発生しました' 
      },
      { status: 200 }
    );
  }
}