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

    // API キーが正しく読み込まれているかデバッグログ
    console.log('OpenAI API Key length:', process.env.OPENAI_API_KEY?.length);
    console.log('OpenAI API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 15));

    // ストリーミング対応
    if (stream) {
      // メッセージに300文字制限の指示を追加
      const systemMessage = {
        role: 'system' as const,
        content: '回答は必ず300文字以内で簡潔に。論理的な深掘り質問を中心とした短い応答のみ。'
      };
      
      const enhancedMessages = [systemMessage, ...messages];
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: enhancedMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 150, // 300文字制限のため削減
      });

      // ReadableStreamを作成
      const encoder = new TextEncoder();
      let totalLength = 0;
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const delta = chunk.choices[0]?.delta;
              if (delta?.content) {
                // 300文字制限チェック
                const remaining = 300 - totalLength;
                let content = delta.content;
                
                if (content.length > remaining) {
                  content = content.substring(0, remaining);
                  if (remaining > 0) {
                    const data = {
                      choices: [{
                        delta: {
                          content: content
                        }
                      }]
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                  }
                  break; // 300文字に達したら終了
                }
                
                totalLength += content.length;
                const data = {
                  choices: [{
                    delta: {
                      content: content
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
    const systemMessage = {
      role: 'system' as const,
      content: '回答は必ず300文字以内で簡潔に。論理的な深掘り質問を中心とした短い応答のみ。'
    };
    
    const enhancedMessages = [systemMessage, ...messages];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: enhancedMessages,
      temperature: 0.7,
      max_tokens: 150, // 300文字制限のため削減
    });

    const content = response.choices[0]?.message?.content || '';
    const truncatedContent = content.length > 300 ? content.substring(0, 300) : content;

    return NextResponse.json({
      message: truncatedContent,
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