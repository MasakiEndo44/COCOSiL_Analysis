/**
 * COCOSiL簡素化算命学API v2.0 - Edge Runtime最適化版
 * 
 * 出力要件: [年齢][星座][動物][6星人]
 * パフォーマンス目標: P95 < 100ms, 同時接続50人対応
 * キャッシュ戦略: LRU メモリキャッシュ (7日TTL)
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateFortuneSimplified } from '@/lib/fortune/precision-calculator';

// Edge Runtime設定 (o3推奨)
export const runtime = 'edge';
export const preferredRegion = 'auto';

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
 * 簡素化算命学計算API (Edge Runtime最適化版)
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディの解析
    const body = await request.json();
    const { year, month, day } = body;

    // 入力値検証
    if (!year || !month || !day) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'year, month, dayが必要です' 
        },
        { status: 400 }
      );
    }

    // 数値変換と範囲チェック
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);

    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '年月日は数値で入力してください' 
        },
        { status: 400 }
      );
    }

    // キャッシュキーの生成 (最適化: 8バイト文字列)
    const cacheKey = `${y}-${m}-${d}`;
    const now = Date.now();

    // キャッシュヒットチェック
    const cached = fortuneCache.get(cacheKey);
    if (cached && cached.exp > now) {
      return NextResponse.json({
        success: true,
        data: cached.val,
        cached: true
      }, {
        headers: {
          'Cache-Control': 's-maxage=31536000, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'max-age=86400'
        }
      });
    }

    // 算命学計算実行 (同期処理 - o3推奨)
    const result = calculateFortuneSimplified(y, m, d);

    // キャッシュに保存
    fortuneCache.set(cacheKey, {
      exp: now + CACHE_TTL,
      val: result
    });

    // 定期的なキャッシュクリーンアップ (1%確率)
    if (Math.random() < 0.01) {
      cleanupCache();
    }

    // レスポンス返却
    return NextResponse.json({
      success: true,
      data: result,
      cached: false
    }, {
      headers: {
        'Cache-Control': 's-maxage=31536000, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'max-age=86400'
      }
    });

  } catch (error) {
    console.error('Fortune calculation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '計算エラーが発生しました' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fortune-calc-v2 (クエリパラメータ版)
 * パフォーマンステスト用
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const day = searchParams.get('day');

    if (!year || !month || !day) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'year, month, dayパラメータが必要です' 
        },
        { status: 400 }
      );
    }

    // POST処理を再利用
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
    console.error('Fortune calculation GET error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'GETリクエストエラーが発生しました' 
      },
      { status: 500 }
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