import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = true } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'メッセージが正しい形式ではありません' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません' },
        { status: 500 }
      );
    }

    // ストリーミング対応
    if (stream) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      });

      // ReadableStreamを作成
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const delta = chunk.choices[0]?.delta;
              if (delta?.content) {
                const data = {
                  choices: [{
                    delta: {
                      content: delta.content
                    }
                  }]
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('ストリーミングエラー:', error);
            controller.error(error);
          }
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 通常のレスポンス（非ストリーミング）
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({
      message: response.choices[0]?.message?.content || '',
      usage: response.usage
    });

  } catch (error) {
    console.error('OpenAI API エラー:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `AI応答の生成中にエラーが発生しました: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'AI応答の生成中に予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}