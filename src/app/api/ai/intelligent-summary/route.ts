/**
 * API Route for IntelligentSummarizer
 * Phase 2: AI-powered session summarization with quality monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIntelligentSummarizer } from '@/lib/ai/intelligent-summarizer';
import type { ChatSession, ChatSummary } from '@/types';

interface SummaryRequest {
  session: ChatSession;
  options?: {
    useAI?: boolean;
    qualityCheck?: boolean;
    priority?: 'speed' | 'quality';
  };
}

interface SummaryResponse {
  success: boolean;
  summary?: ChatSummary;
  error?: string;
  metadata?: {
    cached: boolean;
    aiGenerated: boolean;
    processingTime: number;
    qualityChecked: boolean;
  };
}

interface SystemStatsResponse {
  success: boolean;
  stats?: any;
  error?: string;
}

/**
 * POST /api/ai/intelligent-summary
 * Generate intelligent summary for chat session
 */
export async function POST(request: NextRequest): Promise<NextResponse<SummaryResponse>> {
  const startTime = Date.now();

  try {
    // Validate request body
    const body: SummaryRequest = await request.json();

    if (!body.session) {
      return NextResponse.json({
        success: false,
        error: 'セッションデータが提供されていません'
      }, { status: 400 });
    }

    // Validate session structure
    if (!body.session.sessionId || !body.session.messages || !Array.isArray(body.session.messages)) {
      return NextResponse.json({
        success: false,
        error: 'セッションデータの形式が正しくありません'
      }, { status: 400 });
    }

    // Check minimum message count
    if (body.session.messages.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'セッションに十分なメッセージが含まれていません'
      }, { status: 400 });
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API キーが設定されていません'
      }, { status: 500 });
    }

    // Get summarizer instance
    const summarizer = getIntelligentSummarizer();

    // Check if we need to override options
    if (body.options) {
      // Note: In a production system, you might want to create a new instance
      // with custom options rather than modifying the singleton
      console.log('Custom options provided:', body.options);
    }

    // Generate summary
    const result = await summarizer.summarizeSession(body.session);

    const processingTime = Date.now() - startTime;

    // Enhance summary with metadata
    const enhancedSummary: ChatSummary = {
      ...result.summary,
      generatedAt: new Date(),
      summaryVersion: '2.0', // Phase 2 version
    };

    // Prepare response metadata
    const metadata = {
      cached: result.cached,
      aiGenerated: result.summary.aiGenerated || false,
      processingTime,
      qualityChecked: body.options?.qualityCheck !== false
    };

    return NextResponse.json({
      success: true,
      summary: enhancedSummary,
      metadata
    });

  } catch (error) {
    console.error('Intelligent summary error:', error);

    const processingTime = Date.now() - startTime;

    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: `要約生成中にエラーが発生しました: ${error.message}`,
        metadata: {
          cached: false,
          aiGenerated: false,
          processingTime,
          qualityChecked: false
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: '要約生成中に予期しないエラーが発生しました',
      metadata: {
        cached: false,
        aiGenerated: false,
        processingTime,
        qualityChecked: false
      }
    }, { status: 500 });
  }
}

/**
 * GET /api/ai/intelligent-summary
 * Get system statistics and health status
 */
export async function GET(): Promise<NextResponse<SystemStatsResponse>> {
  try {
    // Get summarizer instance
    const summarizer = getIntelligentSummarizer();

    // Get system statistics
    const stats = summarizer.getSystemStats();

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    });

  } catch (error) {
    console.error('System stats error:', error);

    return NextResponse.json({
      success: false,
      error: 'システム統計の取得に失敗しました'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/ai/intelligent-summary
 * Clear summarization cache (admin function)
 */
export async function DELETE(): Promise<NextResponse<{ success: boolean; message: string }>> {
  try {
    // Get summarizer instance
    const summarizer = getIntelligentSummarizer();

    // Clear cache
    summarizer.clearCache();

    return NextResponse.json({
      success: true,
      message: 'キャッシュが正常にクリアされました'
    });

  } catch (error) {
    console.error('Cache clear error:', error);

    return NextResponse.json({
      success: false,
      message: 'キャッシュのクリアに失敗しました'
    }, { status: 500 });
  }
}