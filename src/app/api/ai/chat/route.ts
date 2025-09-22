import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { IntegratedPromptEngine, validateDiagnosisData } from '@/lib/ai/prompt-engine';

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// プロンプトエンジンのインスタンス
const promptEngine = new IntegratedPromptEngine();

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = true, diagnosisData, topic = '人間関係', priority = 'quality' } = await request.json();

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

    // 診断データの検証
    if (!diagnosisData || !validateDiagnosisData(diagnosisData)) {
      return NextResponse.json(
        { error: '統合診断データが不足しています。診断を完了してからチャットをご利用ください。' },
        { status: 400 }
      );
    }

    // プロンプトエンジンを使用してコンテキスト生成
    const promptContext = {
      topic,
      conversationHistory: messages,
      complexity: promptEngine.assessComplexity(topic, messages),
      priority: priority as 'speed' | 'quality'
    };

    const { systemPrompt, maxTokens, temperature } = promptEngine.generateContextualPrompt(
      diagnosisData,
      promptContext
    );

    console.log('Dynamic Token Count:', maxTokens);
    console.log('Assessed Complexity:', promptContext.complexity);

    // ストリーミング対応
    if (stream) {
      const enhancedMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages
      ];
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: enhancedMessages,
        stream: true,
        temperature,
        max_tokens: maxTokens,
      });

      // ReadableStreamを作成（文字数制限を削除）
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
    const enhancedMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages
    ];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: enhancedMessages,
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content || '';

    return NextResponse.json({
      message: content,
      usage: response.usage,
      metadata: {
        maxTokens,
        temperature,
        complexity: promptContext.complexity
      }
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