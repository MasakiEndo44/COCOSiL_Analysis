/**
 * 体癖診断結果 強化表示コンポーネント
 * 
 * 機能:
 * - 体癖ごとの累積ポイントを高い順に一覧表示
 * - 主体癖・副体癖の明確な表示
 * - 主体癖の信頼度表示
 * - 視覚的なスコア表示バー
 */

'use client';

import React from 'react';
import { TAIHEKI_TYPES_METADATA } from '@/types/taiheki';

// 新しいAPI結果の型定義
interface EnhancedTaihekiResult {
  primaryType: string;
  primaryScore: number;
  secondaryType: string;
  secondaryScore: number;
  allScores: {
    type1: number;
    type2: number;
    type3: number;
    type4: number;
    type5: number;
    type6: number;
    type7: number;
    type8: number;
    type9: number;
    type10: number;
  };
  maxScore: number;
  confidence: number;
  reliabilityText: string;
  reliabilityStars: string;
  totalQuestions: number;
  completionTime?: number;
}

interface EnhancedTaihekiDisplayProps {
  result: EnhancedTaihekiResult;
  isLoading?: boolean;
}

// 体癖タイプの表示順序とスコア情報
interface TypeScore {
  type: string;
  score: number;
  percentage: number;
  isPrimary: boolean;
  isSecondary: boolean;
  metadata: {
    name: string;
    subtitle: string;
    category: string;
    description: string;
  };
}

export function EnhancedTaihekiDisplay({ result, isLoading = false }: EnhancedTaihekiDisplayProps) {
  // スコア情報を整理・ソート
  const getTypeScores = (): TypeScore[] => {
    const { allScores, maxScore, primaryType, secondaryType } = result;
    
    return Object.entries(allScores)
      .map(([type, score]) => ({
        type,
        score,
        percentage: maxScore > 0 ? (score / maxScore) * 100 : 0,
        isPrimary: type === primaryType,
        isSecondary: type === secondaryType,
        metadata: TAIHEKI_TYPES_METADATA[type as keyof typeof TAIHEKI_TYPES_METADATA]
      }))
      .sort((a, b) => b.score - a.score); // 高い順にソート
  };

  // 信頼度の色とアイコンを取得
  const getConfidenceStyle = (confidence: number) => {
    if (confidence >= 1.5) {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        icon: '🎯'
      };
    } else if (confidence >= 1.3) {
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
        icon: '📊'
      };
    } else if (confidence >= 1.15) {
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
        icon: '📈'
      };
    } else {
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300',
        icon: '📝'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-card p-6 shadow-z2">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const typeScores = getTypeScores();
  const confidenceStyle = getConfidenceStyle(result.confidence);

  return (
    <div className="bg-white rounded-card p-6 shadow-z2">
      {/* ヘッダー */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-heading text-light-fg text-lg">体癖診断結果</h3>
          <p className="text-sm text-light-fg-muted">高精度スコア分析 ({result.totalQuestions}問診断)</p>
        </div>
      </div>

      {/* 主体癖・副体癖 サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 主体癖 */}
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-green-900 text-lg">🥇 主体癖</h4>
            <span className="text-2xl font-bold text-green-800">{result.primaryScore}pt</span>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-green-900">
              {result.primaryType.replace('type', '')}種体癖
            </p>
            <p className="text-sm font-medium text-green-800">
              {typeScores.find(ts => ts.isPrimary)?.metadata.name}
            </p>
            <p className="text-xs text-green-700">
              {typeScores.find(ts => ts.isPrimary)?.metadata.subtitle}
            </p>
          </div>
        </div>

        {/* 副体癖 */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-blue-900 text-lg">🥈 副体癖</h4>
            <span className="text-2xl font-bold text-blue-800">{result.secondaryScore}pt</span>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-blue-900">
              {result.secondaryType.replace('type', '')}種体癖
            </p>
            <p className="text-sm font-medium text-blue-800">
              {typeScores.find(ts => ts.isSecondary)?.metadata.name}
            </p>
            <p className="text-xs text-blue-700">
              {typeScores.find(ts => ts.isSecondary)?.metadata.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 信頼度表示 */}
      <div className={`${confidenceStyle.bgColor} ${confidenceStyle.borderColor} border-2 rounded-lg p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{confidenceStyle.icon}</span>
            <div>
              <h4 className={`font-bold ${confidenceStyle.textColor}`}>診断信頼度</h4>
              <p className={`text-sm ${confidenceStyle.textColor}`}>
                {result.reliabilityText} {result.reliabilityStars}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${confidenceStyle.textColor}`}>
              {result.confidence.toFixed(2)}
            </p>
            <p className={`text-xs ${confidenceStyle.textColor}`}>
              信頼度スコア
            </p>
          </div>
        </div>
      </div>

      {/* 全体癖スコア一覧（降順） */}
      <div>
        <h4 className="font-bold text-light-fg text-lg mb-4">📊 全体癖スコア一覧（高い順）</h4>
        <div className="space-y-3">
          {typeScores.map((typeScore, index) => {
            const rank = index + 1;
            let containerClass = "bg-gray-50 border border-gray-200";
            let rankColor = "bg-gray-500 text-white";
            let barColor = "bg-gray-400";

            if (typeScore.isPrimary) {
              containerClass = "bg-green-50 border-2 border-green-300";
              rankColor = "bg-green-600 text-white";
              barColor = "bg-green-500";
            } else if (typeScore.isSecondary) {
              containerClass = "bg-blue-50 border-2 border-blue-300";
              rankColor = "bg-blue-600 text-white";
              barColor = "bg-blue-500";
            } else if (rank <= 3) {
              rankColor = "bg-orange-500 text-white";
              barColor = "bg-orange-400";
            }

            return (
              <div key={typeScore.type} className={`${containerClass} rounded-lg p-4`}>
                <div className="flex items-center space-x-4">
                  {/* 順位 */}
                  <div className={`${rankColor} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {rank}
                  </div>

                  {/* 体癖情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-bold text-light-fg text-lg">
                        {typeScore.type.replace('type', '')}種体癖
                        {typeScore.isPrimary && <span className="text-green-600 ml-1">👑</span>}
                        {typeScore.isSecondary && <span className="text-blue-600 ml-1">🥈</span>}
                      </h5>
                      <span className="text-sm text-light-fg-muted">
                        {typeScore.metadata.category}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-light-fg mb-1">
                      {typeScore.metadata.name}
                    </p>
                    
                    <p className="text-xs text-light-fg-muted mb-3 leading-relaxed">
                      {typeScore.metadata.description}
                    </p>

                    {/* スコアバー */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`${barColor} h-full transition-all duration-500 ease-out`}
                          style={{ width: `${typeScore.percentage}%` }}
                        >
                          <div className="h-full bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-right min-w-0 flex-shrink-0">
                        <p className="text-lg font-bold text-light-fg">
                          {typeScore.score}pt
                        </p>
                        <p className="text-xs text-light-fg-muted">
                          {typeScore.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 診断メタ情報 */}
      {result.completionTime && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between text-xs text-light-fg-muted">
            <span>診断完了時間: {Math.round(result.completionTime / 60)}分{result.completionTime % 60}秒</span>
            <span>処理時間: 高速計算</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedTaihekiDisplay;