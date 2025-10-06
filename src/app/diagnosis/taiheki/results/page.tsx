/**
 * 体癖診断詳細結果ページ
 * 
 * 体癖ごとの累積ポイントを高い順に表示する専用ページ
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { EnhancedTaihekiDisplay } from '@/ui/features/diagnosis/enhanced-taiheki-display';
import { Button } from '@/ui/components/ui/button';

export default function TaihekiResultsPage() {
  const { taiheki, setCurrentStep } = useDiagnosisStore();
  const _router = useRouter();

  useEffect(() => {
    setCurrentStep('taiheki_test');
  }, [setCurrentStep]);

  // 体癖診断結果が存在しない場合は診断ページにリダイレクト
  if (!taiheki || !(taiheki as any).enhancedResult) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-light-fg mb-2">
              体癖診断結果が見つかりません
            </h1>
            <p className="text-light-fg-muted mb-6">
              体癖診断を完了してから結果を確認してください
            </p>
            <Link href="/diagnosis/taiheki" className="inline-block">
              <Button>体癖診断を受ける</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-light-fg mb-2">
              体癖診断結果
            </h1>
            <p className="text-light-fg-muted">
              あなたの体癖タイプごとの詳細な分析結果です
            </p>
          </div>
        </div>

        {/* 詳細結果表示 */}
        <div className="mb-8">
          <EnhancedTaihekiDisplay result={(taiheki as any).enhancedResult} />
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/diagnosis/taiheki" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full">
              ← 体癖診断をやり直す
            </Button>
          </Link>
          
          <Link href="/diagnosis/results" className="w-full sm:w-auto">
            <Button className="w-full">
              統合分析結果を見る →
            </Button>
          </Link>
        </div>

        {/* 説明テキスト */}
        <div className="mt-8 bg-white rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-light-fg mb-3">
            📊 結果の見方
          </h3>
          <div className="space-y-2 text-sm text-light-fg-muted">
            <p>• <strong>主体癖</strong>: 最も高いスコアを獲得したあなたの基本タイプです</p>
            <p>• <strong>副体癖</strong>: 2番目に高いスコアで、補完的な特徴を表します</p>
            <p>• <strong>信頼度</strong>: 診断結果の確実性を示しています（★が多いほど高精度）</p>
            <p>• <strong>各タイプのスコア</strong>: 20問の回答から算出された累積ポイントです</p>
          </div>
        </div>
      </div>
    </div>
  );
}