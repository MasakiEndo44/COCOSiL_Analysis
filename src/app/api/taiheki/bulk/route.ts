/**
 * 体癖診断 一括診断API
 * 
 * POST /api/taiheki/bulk
 * - 20問の回答を一括受信
 * - 高精度スコア計算
 * - 結果をセッション付きで返却
 * - レスポンス時間 < 100ms目標
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { TaihekiCalculator } from '@/lib/taiheki/calculator';
import { 
  BulkDiagnosisResponse,
  TaihekiDiagnosisError,
  ERROR_CODES
} from '@/types/taiheki';
import { getTaihekiQuestions } from '@/lib/taiheki/data-access';
import { saveDiagnosisResult } from '@/lib/taiheki/session-manager';
import { createHash } from 'crypto';

// ============================================================
// リクエスト検証スキーマ
// ============================================================

const DiagnosisAnswerSchema = z.object({
  questionId: z.number().int().min(1).max(20),
  selectedOptions: z.array(z.number().int().min(0).max(3)).min(1).max(2) // 最大2選択
});

const BulkDiagnosisRequestSchema = z.object({
  answers: z.array(DiagnosisAnswerSchema).min(20).max(20), // 厳密に20問
  userAgent: z.string().optional(),
  startTime: z.string().datetime().optional()
});

// ============================================================
// API ハンドラー
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // ============================================================
    // 1. リクエスト解析・検証
    // ============================================================
    
    const rawBody = await request.json();
    const validatedRequest = BulkDiagnosisRequestSchema.parse(rawBody);
    
    const { answers, userAgent, startTime: diagnosisStartTime } = validatedRequest;
    
    // 診断開始時刻の解析
    const parsedStartTime = diagnosisStartTime ? new Date(diagnosisStartTime) : undefined;
    
    // IPアドレス取得（匿名化）
    const clientIP = getClientIP(request);
    const ipHash = createHash('sha256').update(clientIP + process.env.IP_SALT || 'salt').digest('hex');
    
    // ============================================================
    // 2. 質問データ読み込み
    // ============================================================
    
    const questions = await getTaihekiQuestions();
    
    // 回答の質問IDが全て有効かチェック
    const questionIds = new Set(questions.map(q => q.id));
    const invalidQuestions = answers.filter(a => !questionIds.has(a.questionId));
    
    if (invalidQuestions.length > 0) {
      return NextResponse.json({
        error: 'Invalid question IDs',
        code: ERROR_CODES.INVALID_QUESTION,
        details: invalidQuestions.map(q => q.questionId)
      }, { status: 400 });
    }
    
    // ============================================================
    // 3. 診断計算実行
    // ============================================================
    
    const calculator = new TaihekiCalculator(questions);
    const diagnosisResult = calculator.calculateDiagnosis(answers, parsedStartTime);
    
    // ============================================================
    // 4. セッション作成・結果保存
    // ============================================================
    
    const sessionId = uuidv4();
    
    // 回答パターンハッシュ生成（重複検知用）
    const answerPattern = answers
      .sort((a, b) => a.questionId - b.questionId)
      .map(a => `${a.questionId}:${a.selectedOptions.sort().join(',')}`)
      .join('|');
    const answerPatternHash = createHash('md5').update(answerPattern).digest('hex');
    
    // データベースに結果保存（非同期）
    // Note: await しないことで、レスポンス速度を優先
    saveDiagnosisResult({
      sessionId,
      result: diagnosisResult,
      answers,
      answerPatternHash,
      ipHash,
      userAgent: userAgent || 'Unknown'
    }).catch(error => {
      console.error('Failed to save diagnosis result:', error);
      // エラーログ記録（別途ログシステムに送信）
    });
    
    // ============================================================
    // 5. レスポンス生成
    // ============================================================
    
    const processingTime = Date.now() - startTime;
    
    const response: BulkDiagnosisResponse = {
      result: diagnosisResult,
      sessionId,
      processingTime
    };
    
    // パフォーマンス監視
    if (processingTime > 100) {
      console.warn(`Bulk diagnosis took ${processingTime}ms (target: <100ms)`);
    }
    
    // レスポンスヘッダー設定
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Processing-Time': processingTime.toString(),
      'X-Session-Id': sessionId,
      // キャッシュ無効化（診断結果は個人的）
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache'
    });
    
    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers
    });
    
  } catch (error) {
    return handleDiagnosisError(error, Date.now() - startTime);
  }
}

// ============================================================
// エラーハンドリング
// ============================================================

function handleDiagnosisError(error: unknown, processingTime: number): NextResponse {
  console.error('Bulk diagnosis error:', error);
  
  // Zod バリデーションエラー
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      error: 'Invalid request format',
      code: ERROR_CODES.INVALID_ANSWER,
      details: error.errors,
      processingTime
    }, { status: 400 });
  }
  
  // 体癖診断固有エラー
  if (error instanceof TaihekiDiagnosisError) {
    const statusCode = getStatusCodeForError(error.code);
    return NextResponse.json({
      error: error.message,
      code: error.code,
      details: error.details,
      processingTime
    }, { status: statusCode });
  }
  
  // 一般的なエラー
  return NextResponse.json({
    error: 'Internal server error',
    code: ERROR_CODES.CALCULATION_ERROR,
    message: 'An unexpected error occurred during diagnosis calculation',
    processingTime
  }, { status: 500 });
}

function getStatusCodeForError(errorCode: string): number {
  switch (errorCode) {
    case ERROR_CODES.INVALID_QUESTION:
    case ERROR_CODES.INVALID_ANSWER:
    case ERROR_CODES.TOO_MANY_SELECTIONS:
      return 400;
    case ERROR_CODES.CALCULATION_ERROR:
    case ERROR_CODES.DATABASE_ERROR:
      return 500;
    default:
      return 500;
  }
}

// ============================================================
// ユーティリティ関数
// ============================================================

function getClientIP(request: NextRequest): string {
  // Vercel/Cloudflare/その他CDNからの実IPアドレス取得
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cloudflare = request.headers.get('cf-connecting-ip');
  
  if (cloudflare) return cloudflare;
  if (real) return real;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

// ============================================================


// OPTIONS プリフライトリクエスト対応
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// GET リクエスト（API仕様表示用）
export async function GET() {
  const apiSpec = {
    endpoint: '/api/taiheki/bulk',
    method: 'POST',
    description: '体癖診断一括実行API',
    version: '1.0.0',
    
    request: {
      answers: [
        {
          questionId: 'number (1-20)',
          selectedOptions: 'number[] (0-3, max 2 selections)'
        }
      ],
      userAgent: 'string (optional)',
      startTime: 'ISO datetime string (optional)'
    },
    
    response: {
      result: {
        primaryType: 'string (type1-type10)',
        primaryScore: 'number',
        secondaryType: 'string (type1-type10)', 
        secondaryScore: 'number',
        allScores: 'object (type1-type10 scores)',
        confidence: 'number (reliability)',
        reliabilityText: 'string (非常に高い|高い|中程度|参考程度)',
        reliabilityStars: 'string (★★★★★)',
        totalQuestions: 'number',
        completionTime: 'number (seconds, optional)'
      },
      sessionId: 'string (UUID)',
      processingTime: 'number (milliseconds)'
    },
    
    limits: {
      maxRequestsPerMinute: 10,
      maxResponseTimeMs: 100,
      requiredQuestions: 20
    }
  };
  
  return NextResponse.json(apiSpec);
}