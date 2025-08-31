import { NextRequest, NextResponse } from 'next/server';
import { generateAdminPrompt } from '@/lib/ai/openai-client';
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

    // gpt-4o-miniを使用した管理者向けプロンプト生成
    const adminPrompt = await generateAdminPrompt(diagnosisData);

    return NextResponse.json({
      prompt: adminPrompt,
      generated_at: new Date().toISOString(),
      model_used: 'gpt-4o-mini'
    });

  } catch (error) {
    console.error('Admin prompt generation error:', error);
    
    return NextResponse.json(
      {
        error: '管理者プロンプトの生成に失敗しました',
        fallback_prompt: '診断結果を基にした個別化された対話を行ってください。'
      },
      { status: 500 }
    );
  }
}