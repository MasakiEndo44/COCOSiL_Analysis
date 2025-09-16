/**
 * 強化体癖表示のテスト用コンポーネント
 * 
 * 開発・デモ用途
 */

'use client';

import React, { useState } from 'react';
import { EnhancedTaihekiDisplay } from './enhanced-taiheki-display';
import { Button } from '@/ui/components/ui/button';

// サンプルデータ
const sampleResults = [
  {
    primaryType: "type1",
    primaryScore: 60,
    secondaryType: "type2",
    secondaryScore: 27,
    allScores: {
      type1: 60, type2: 27, type3: 0, type4: 24, type5: 0,
      type6: 6, type7: 0, type8: 0, type9: 8, type10: 0
    },
    maxScore: 60,
    confidence: 2.22,
    reliabilityText: "非常に高い",
    reliabilityStars: "★★★★★",
    totalQuestions: 20,
    completionTime: 180
  },
  {
    primaryType: "type5",
    primaryScore: 48,
    secondaryType: "type2",
    secondaryScore: 21,
    allScores: {
      type1: 0, type2: 21, type3: 0, type4: 2, type5: 48,
      type6: 12, type7: 14, type8: 14, type9: 4, type10: 2
    },
    maxScore: 48,
    confidence: 2.29,
    reliabilityText: "非常に高い",
    reliabilityStars: "★★★★★",
    totalQuestions: 20,
    completionTime: 210
  },
  {
    primaryType: "type3",
    primaryScore: 42,
    secondaryType: "type10",
    secondaryScore: 35,
    allScores: {
      type1: 2, type2: 8, type3: 42, type4: 12, type5: 6,
      type6: 9, type7: 15, type8: 8, type9: 11, type10: 35
    },
    maxScore: 42,
    confidence: 1.2,
    reliabilityText: "中程度",
    reliabilityStars: "★★★☆☆",
    totalQuestions: 20,
    completionTime: 165
  }
];

export function TestEnhancedDisplay() {
  const [selectedResult, setSelectedResult] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">強化体癖表示テスト</h1>
        <p className="text-gray-600 mb-6">
          新しい体癖診断結果表示のデモ・テストページ
        </p>
      </div>

      {/* コントロール */}
      <div className="flex flex-wrap gap-4 justify-center">
        {sampleResults.map((result, index) => (
          <Button
            key={index}
            variant={selectedResult === index ? "primary" : "secondary"}
            onClick={() => setSelectedResult(index)}
            size="sm"
          >
            {result.primaryType} サンプル
          </Button>
        ))}
        
        <Button
          variant="secondary"
          onClick={simulateLoading}
          size="sm"
        >
          ローディング表示テスト
        </Button>
      </div>

      {/* 現在の結果情報 */}
      <div className="text-center text-sm text-gray-600">
        表示中: {sampleResults[selectedResult].primaryType} 
        (主{sampleResults[selectedResult].primaryScore}pt, 
        副{sampleResults[selectedResult].secondaryScore}pt,
        信頼度{sampleResults[selectedResult].confidence.toFixed(2)})
      </div>

      {/* 強化表示 */}
      <div className="max-w-4xl mx-auto">
        <EnhancedTaihekiDisplay 
          result={sampleResults[selectedResult]} 
          isLoading={isLoading}
        />
      </div>

      {/* デバッグ情報 */}
      <details className="max-w-4xl mx-auto bg-gray-50 p-4 rounded">
        <summary className="cursor-pointer text-sm font-medium">
          デバッグ: JSON データ表示
        </summary>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify(sampleResults[selectedResult], null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default TestEnhancedDisplay;