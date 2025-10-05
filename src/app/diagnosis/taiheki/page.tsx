'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/ui/components/ui/button';

export default function TaihekiDiagnosisPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelection = (mode: 'detailed' | 'guide' | 'quick') => {
    setIsLoading(true);

    if (mode === 'detailed') {
      // 詳細な体癖診断HTMLへリダイレクト
      window.location.href = '/taiheki_diagnosis.html';
    } else if (mode === 'guide') {
      // 学習ページへ遷移
      router.push('/learn/taiheki');
    } else {
      // 直接入力ページへ遷移
      router.push('/diagnosis/taiheki/direct');
    }
  };

  const options = [
    {
      id: 'detailed',
      title: '体癖診断を受ける',
      description: '20問の詳細な質問に答えて、あなたの体癖タイプを診断します。主体癖・副体癖・信頼度を含む詳細な結果が得られます。',
      time: '約5分',
      icon: '📝',
      color: 'bg-purple-500',
      recommended: true
    },
    {
      id: 'guide',
      title: '体癖理論を学んでから診断',
      description: '体癖理論について初めて知る方におすすめ。基礎知識を学んでから診断に進みます。',
      time: '約10分',
      icon: '📚',
      color: 'bg-blue-500',
      recommended: false
    },
    {
      id: 'quick',
      title: '体癖番号を直接入力',
      description: 'すでに自分の体癖番号をご存知の方はこちら。即座に次のステップへ進めます。',
      time: '約1分',
      icon: '⚡',
      color: 'bg-green-500',
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-light-bg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <span className="text-white text-2xl font-bold">4</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-light-fg mb-3">
                体癖診断方法の選択
              </h1>
              <p className="text-base text-light-fg-muted max-w-2xl mx-auto">
                体癖理論に関する知識レベルに応じて、最適な診断方法をお選びください。
              </p>
            </div>
          </div>

          {/* Progress Info */}
          <div className="flex justify-center">
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              ステップ 4/5 • 体癖診断
            </div>
          </div>

          {/* Selection Options */}
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
            {options.map((option) => (
              <div key={option.id} className="relative">
                {option.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-full font-medium">
                      おすすめ
                    </span>
                  </div>
                )}

                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all cursor-pointer h-full border-2 hover:border-purple-500 group">
                  <div className="text-center space-y-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center mx-auto text-2xl`}>
                      {option.icon}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-bold text-light-fg mb-2">
                        {option.title}
                      </h3>
                      <p className="text-sm text-light-fg-muted mb-4 leading-relaxed">
                        {option.description}
                      </p>
                      <div className="flex items-center justify-center space-x-2 mb-6">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-light-fg-muted">{option.time}</span>
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      onClick={() => handleSelection(option.id as 'detailed' | 'guide' | 'quick')}
                      disabled={isLoading}
                      variant={option.recommended ? "primary" : "secondary"}
                      className="w-full group-hover:scale-105 transition-transform"
                    >
                      この方法で進む
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Help Information */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm mb-2">
                    体癖理論について
                  </h3>
                  <p className="text-xs text-blue-800 leading-relaxed mb-3">
                    体癖理論は野口整体の創始者・野口晴哉によって提唱された、人間の身体的・心理的特徴を10の型に分類する理論です。
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• <strong>体癖1〜5種</strong>：左右系の体癖（頭脳的・思考系）</li>
                    <li>• <strong>体癖6〜10種</strong>：前後系の体癖（感情的・行動系）</li>
                    <li>• <strong>主体癖・副体癖</strong>：複数の特徴を組み合わせた分析</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}