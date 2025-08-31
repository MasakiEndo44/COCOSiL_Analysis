import { NextRequest, NextResponse } from 'next/server';
import { generateDiagnosisSummary } from '@/lib/ai/openai-client';
import type { UserDiagnosisData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const diagnosisData: UserDiagnosisData = await request.json();

    // 基本的なデータ検証
    if (!diagnosisData.basic || !diagnosisData.mbti || !diagnosisData.taiheki || !diagnosisData.fortune) {
      return NextResponse.json(
        { error: '診断データが不完全です' },
        { status: 400 }
      );
    }

    // gpt-4oを使用した詳細サマリー生成
    const summary = await generateDiagnosisSummary(diagnosisData);

    return NextResponse.json({
      summary,
      generated_at: new Date().toISOString(),
      model_used: 'gpt-4o'
    });

  } catch (error) {
    console.error('AI Summary generation error:', error);
    
    // フォールバック対応
    return NextResponse.json(
      {
        error: 'AI要約の生成に失敗しました',
        fallback_summary: '申し訳ございませんが、現在AI要約の生成ができません。診断結果は正常に保存されています。'
      },
      { status: 500 }
    );
  }
}