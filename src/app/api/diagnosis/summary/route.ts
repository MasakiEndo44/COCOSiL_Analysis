import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai/openai-client';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { prompt, keywords } = body;

    // 入力検証
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    // OpenAI APIキーの環境変数チェック
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'AIサマリー機能は現在利用できません。管理者にお問い合わせください。' },
        { status: 503 }
      );
    }

    console.log('🤖 AI診断サマリー生成開始:', { prompt: prompt.slice(0, 100) + '...' });

    // OpenAIクライアントを取得してAI診断サマリーを生成
    const openaiClient = getOpenAIClient();
    const summary = await openaiClient.generateQuickAnalysis(prompt);

    if (!summary) {
      console.error('❌ OpenAI APIからレスポンスが取得できませんでした');
      return NextResponse.json(
        { error: 'AIサマリーの生成に失敗しました' },
        { status: 500 }
      );
    }

    console.log('✅ AI診断サマリー生成完了:', { length: summary.length });

    return NextResponse.json({
      success: true,
      summary: summary.trim(),
      keywords: keywords || [],
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI診断サマリー生成エラー:', error);

    // OpenAI APIエラーの詳細ログ
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.slice(0, 500)
      });
    }

    return NextResponse.json(
      {
        error: 'AIサマリーの生成中にエラーが発生しました',
        fallback: true // フォールバック可能であることを示す
      },
      { status: 500 }
    );
  }
}

// GETメソッドでヘルスチェック
export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    service: 'AI診断サマリー生成API',
    status: hasApiKey ? 'available' : 'unavailable',
    version: '1.0.0',
    features: [
      'GPT-4による診断サマリー生成',
      '4つの診断システム統合分析',
      'セキュアなサーバーサイド処理'
    ]
  });
}