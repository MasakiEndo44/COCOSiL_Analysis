/**
 * 算命学API v2.0 - 6星占術新バージョン統合
 * 統一スキーマ、包括的エラーハンドリング、パフォーマンス監視対応
 * Edge Runtime最適化版
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateFortuneSimplified } from '@/lib/fortune/precision-calculator';
import { getSupportedYearRange } from '@/lib/data/destiny-number-database';
// Remove unused validation imports
import {
  createRequestContext,
  PerformanceMonitor,
  checkRateLimit,
  createErrorResponse,
  createSuccessResponse,
  createApiError,
  validateDate,
  ValidationRule,
  validateInput
} from '@/lib/api-utils';
import { ErrorCode } from '@/types/api';

// Edge Runtime設定 (o3推奨)
export const runtime = 'edge';
export const preferredRegion = 'auto';

// 入力バリデーションルール
interface FortuneCalculationRequest {
  year: number;
  month: number;
  day: number;
  timezone?: string;
}

// レスポンスデータ型定義
interface FortuneCalculationData {
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
  calculation_source: 'database' | 'algorithm';
  supported_features: string[];
}

const validationRules: ValidationRule<FortuneCalculationRequest>[] = [
  { field: 'year', required: true, type: 'number', min: 1900, max: 2100 },
  { field: 'month', required: true, type: 'number', min: 1, max: 12 },
  { field: 'day', required: true, type: 'number', min: 1, max: 31 },
  {
    field: 'timezone',
    required: false,
    type: 'string',
    pattern: /^[A-Za-z]+\/[A-Za-z_]+$/,
    custom: (value) => !value || ['Asia/Tokyo', 'UTC'].includes(value)
  }
];

// LRU キャッシュ設定
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7日間
const MAX_CACHE_SIZE = 10000; // 最大10,000エントリ

// グローバルキャッシュ (Edge Runtime用)
interface CacheEntry {
  exp: number;
  val: any;
}

const fortuneCache: Map<string, CacheEntry> = 
  // @ts-ignore - Edge Runtime グローバル変数
  (globalThis as any).fortuneCache || new Map();

if (!(globalThis as any).fortuneCache) {
  (globalThis as any).fortuneCache = fortuneCache;
}

/**
 * LRU キャッシュクリーンアップ (メモリ効率化)
 */
function cleanupCache() {
  const now = Date.now();
  const entries = Array.from(fortuneCache.entries());
  
  // 期限切れエントリの削除
  for (const [key, entry] of entries) {
    if (entry.exp <= now) {
      fortuneCache.delete(key);
    }
  }
  
  // サイズ制限のチェック (LRU方式)
  if (fortuneCache.size > MAX_CACHE_SIZE) {
    const sortedEntries = entries.sort((a, b) => a[1].exp - b[1].exp);
    const toDelete = fortuneCache.size - MAX_CACHE_SIZE;
    
    for (let i = 0; i < toDelete; i++) {
      fortuneCache.delete(sortedEntries[i][0]);
    }
  }
}

/**
 * POST /api/fortune-calc-v2
 * 算命学計算API v2.0 (統一スキーマ・エラーハンドリング対応)
 */
export async function POST(request: NextRequest) {
  const context = createRequestContext('/api/fortune-calc-v2', 'POST');
  const monitor = new PerformanceMonitor();
  
  try {
    // レート制限チェック
    const clientId = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return createErrorResponse(
        createApiError(
          ErrorCode.RATE_LIMIT_EXCEEDED,
          'リクエスト制限に達しました。しばらく待ってから再試行してください',
          { retryAfter: 60 },
          true
        ),
        context
      );
    }

    // リクエストボディ解析
    const body = await request.json();
    
    // 入力値バリデーション
    const validationError = validateInput<FortuneCalculationRequest>(body, validationRules);
    if (validationError) {
      return createErrorResponse(validationError, context);
    }

    const { year, month, day, timezone: _timezone = 'Asia/Tokyo' } = body as FortuneCalculationRequest;

    // 日付妥当性検証
    const dateValidationError = validateDate(year, month, day);
    if (dateValidationError) {
      return createErrorResponse(dateValidationError, context);
    }

    // キャッシュキーの生成 (最適化: 8バイト文字列)
    const cacheKey = `${year}-${month}-${day}`;
    const now = Date.now();

    // キャッシュヒットチェック
    const cached = fortuneCache.get(cacheKey);
    if (cached && cached.exp > now) {
      monitor.setCacheHit(true);
      
      const responseData: FortuneCalculationData = {
        ...cached.val,
        calculation_source: 'database',
        supported_features: [
          '60種動物キャラクター',
          'データベース駆動運命数',
          '西洋12星座',
          '六星占術（土星人/金星人/火星人/天王星人/木星人/水星人）',
          '陰陽判定',
          'Edge Runtime最適化',
          'LRUキャッシュ最適化'
        ]
      };
      
      const response = createSuccessResponse(responseData, context);
      response.headers.set('X-Cache-Hit', 'true');
      response.headers.set('Cache-Control', 's-maxage=31536000, stale-while-revalidate=86400');
      response.headers.set('CDN-Cache-Control', 'max-age=86400');
      
      return response;
    }

    // 6星占術計算実行（パフォーマンス監視付き）
    monitor.markCalculationStart();
    let result;
    let calculationSource: 'database' | 'algorithm' = 'algorithm';

    try {
      result = calculateFortuneSimplified(year, month, day);
      calculationSource = 'database'; // 新システムはデフォルトでdatabase
      monitor.setCacheHit(false);
      
    } catch (error) {
      monitor.markCalculationEnd();
      
      if (error instanceof Error) {
        // 具体的なエラーハンドリング
        if (error.message.includes('対応年度')) {
          return createErrorResponse(
            createApiError(
              ErrorCode.DATE_OUT_OF_RANGE,
              `指定された年度は対応範囲外です（${getSupportedYearRange().min}-${getSupportedYearRange().max}年）`,
              { year, supportedRange: `${getSupportedYearRange().min}-${getSupportedYearRange().max}` }
            ),
            context
          );
        }

        if (error.message.includes('存在しない日付')) {
          return createErrorResponse(
            createApiError(
              ErrorCode.INVALID_DATE_FORMAT,
              '存在しない日付が指定されました',
              { year, month, day }
            ),
            context
          );
        }

        if (error.message.includes('database')) {
          return createErrorResponse(
            createApiError(
              ErrorCode.DATABASE_CONNECTION_ERROR,
              'データベース検索中にエラーが発生しました',
              { error: error.message },
              true
            ),
            context
          );
        }
      }
      
      // その他の計算エラー
      return createErrorResponse(
        createApiError(
          ErrorCode.CALCULATION_ERROR,
          '算命学計算中にエラーが発生しました',
          { error: error instanceof Error ? error.message : String(error) },
          true
        ),
        context
      );
    }
    
    monitor.markCalculationEnd();

    // レスポンスデータ構築
    const responseData: FortuneCalculationData = {
      age: result.age,
      zodiac: result.western_zodiac,
      animal: result.animal_character,
      six_star: result.six_star,
      fortune_detail: {
        birth_date: `${year}年${month}月${day}日`,
        chinese_zodiac: result.western_zodiac,
        animal_fortune: `動物占い：${result.animal_character}`,
        six_star_detail: `六星占術：${result.six_star}`,
        personality_traits: result.animal_details?.character ? 
          [result.animal_details.character, `カラー：${result.animal_details.color}`] : 
          ['動物キャラクター', '特性']
      },
      calculation_source: calculationSource,
      supported_features: [
        '60種動物キャラクター',
        'データベース駆動運命数',
        '西洋12星座',
        '六星占術（土星人/金星人/火星人/天王星人/木星人/水星人）',
        '陰陽判定',
        'Edge Runtime最適化',
        'LRUキャッシュ最適化'
      ]
    };

    // キャッシュに保存
    fortuneCache.set(cacheKey, {
      exp: now + CACHE_TTL,
      val: responseData
    });

    // 定期的なキャッシュクリーンアップ (1%確率)
    if (Math.random() < 0.01) {
      cleanupCache();
    }

    // パフォーマンスメトリクスをヘッダーに追加
    const metrics = monitor.getMetrics();
    const response = createSuccessResponse(responseData, context);
    
    // デバッグ用ヘッダー（本番では削除可能）
    response.headers.set('X-Processing-Time', `${metrics.totalProcessingTime.toFixed(2)}ms`);
    response.headers.set('X-Calculation-Time', `${metrics.calculationTime.toFixed(2)}ms`);
    response.headers.set('X-Memory-Usage', `${metrics.memoryUsage.toFixed(2)}MB`);
    response.headers.set('X-Cache-Hit', String(metrics.cacheHit));
    response.headers.set('X-Calculation-Source', calculationSource);
    response.headers.set('Cache-Control', 's-maxage=31536000, stale-while-revalidate=86400');
    response.headers.set('CDN-Cache-Control', 'max-age=86400');

    return response;

  } catch (error) {
    // 予期しないエラー
    console.error(`[${context.id}] Unexpected error:`, error);
    
    return createErrorResponse(
      createApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        '内部サーバーエラーが発生しました',
        {
          error: error instanceof Error ? error.message : String(error),
          requestId: context.id
        },
        true
      ),
      context
    );
  }
}

/**
 * GET /api/fortune-calc-v2 (API情報取得・クエリパラメータ版)
 */
export async function GET(request: NextRequest) {
  const context = createRequestContext('/api/fortune-calc-v2', 'GET');
  
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const day = searchParams.get('day');

    // パラメータがない場合はAPI情報を返す
    if (!year || !month || !day) {
      const apiInfo = {
        name: '算命学API v2.0',
        description: '6星占術データベース駆動システム統合版',
        version: '2.0.0',
        features: [
          '統一API応答スキーマ',
          '包括的エラーハンドリング',
          'リクエスト追跡とメトリクス',
          'データベース駆動運命数計算',
          '60種動物キャラクター対応',
          'パフォーマンス監視',
          'レート制限',
          'Edge Runtime最適化',
          'LRUキャッシュ最適化'
        ],
        endpoints: {
          POST: {
            description: '生年月日から算命学情報を計算',
            requestBody: {
              year: 'number (1900-2100)',
              month: 'number (1-12)',
              day: 'number (1-31)',
              timezone: 'string (optional, default: Asia/Tokyo)'
            },
            response: 'FortuneCalculationData with metadata'
          },
          GET: {
            description: 'API情報取得、またはクエリパラメータで計算',
            queryParams: {
              year: 'number (optional)',
              month: 'number (optional)',
              day: 'number (optional)'
            }
          }
        },
        rateLimit: {
          maxRequests: 100,
          windowMs: 60000
        },
        cache: {
          strategy: 'LRU',
          ttl: '7 days',
          maxSize: 10000
        }
      };
      
      return createSuccessResponse(apiInfo, context);
    }

    // POST処理を再利用（クエリパラメータ版）
    const body = { 
      year: Number(year), 
      month: Number(month), 
      day: Number(day) 
    };
    
    const mockRequest = new Request(request.url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' }
    }) as NextRequest;

    return await POST(mockRequest);

  } catch (error) {
    console.error(`[${context.id}] GET error:`, error);
    
    return createErrorResponse(
      createApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'GETリクエスト処理中にエラーが発生しました',
        {
          error: error instanceof Error ? error.message : String(error),
          requestId: context.id
        },
        true
      ),
      context
    );
  }
}

/**
 * OPTIONS /api/fortune-calc-v2 (CORS対応)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}