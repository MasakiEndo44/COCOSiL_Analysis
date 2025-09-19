'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/ui/components/ui/button';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { taihekiQuestions, calculateTaiheki } from '@/lib/data/taiheki-questions';
import type { TaihekiType, SecondaryTaihekiType } from '@/types';

export function TaihekiStep() {
  const router = useRouter();
  const { setTaiheki, setCurrentStep } = useDiagnosisStore();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 体癖診断画面表示時に進捗を80%に設定
  useEffect(() => {
    setCurrentStep('taiheki_test');
  }, [setCurrentStep]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion + 1 < taihekiQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 診断完了
      completeDiagnosis(newAnswers);
    }
  };

  const completeDiagnosis = async (finalAnswers: number[]) => {
    setIsLoading(true);
    try {
      // 新しい体癖診断 bulk API を使用
      const diagnosisAnswers = finalAnswers.map((answer, index) => ({
        questionId: index + 1,
        selectedOptions: [answer]
      }));

      const response = await fetch('/api/taiheki/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: diagnosisAnswers,
          userAgent: navigator.userAgent,
          startTime: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`診断API呼び出し失敗: ${response.status}`);
      }

      const apiResult = await response.json();
      
      // 既存の形式に変換（互換性のため）
      const legacyResult = {
        primary: parseInt(apiResult.result.primaryType.replace('type', '')) as TaihekiType,
        secondary: parseInt(apiResult.result.secondaryType.replace('type', '')) as SecondaryTaihekiType,
        confidence: apiResult.result.confidence,
        characteristics: [
          apiResult.result.reliabilityText,
          `信頼度${apiResult.result.reliabilityStars}`
        ],
        recommendations: [],
        scores: apiResult.result.typeScores || {},
        // 新しいデータも保持
        enhancedResult: apiResult.result
      };
      
      setTaiheki(legacyResult);
      setCurrentStep('integration');
      router.push('/diagnosis/taiheki/results');
    } catch (error) {
      console.error('体癖診断エラー:', error);
      // フォールバック: 従来の計算方式
      try {
        const result = calculateTaiheki(finalAnswers);
        setTaiheki(result);
        setCurrentStep('integration');
        router.push('/diagnosis/taiheki/results');
      } catch (fallbackError) {
        console.error('フォールバック診断エラー:', fallbackError);
        alert('診断処理中にエラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const question = taihekiQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / taihekiQuestions.length) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
          <span className="text-white text-2xl font-bold">4</span>
        </div>
        <div>
          <h1 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-3">
            体癖診断
          </h1>
          <p className="text-body-m-mobile text-light-fg-muted">
            質問 {currentQuestion + 1} / {taihekiQuestions.length}
          </p>
        </div>
      </div>

      {/* Progress Info */}
      <div className="flex justify-center">
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          ステップ 4/5 • 約8分
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-brand h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-light-fg-muted mt-2">
          <span>開始</span>
          <span>{Math.round(progress)}%</span>
          <span>完了</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-card p-8 shadow-z2">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-green-600 font-medium">
                体癖診断 - 野口整体理論
              </div>
              <div className="text-xs text-light-fg-muted bg-gray-100 px-3 py-1 rounded-full">
                質問 {currentQuestion + 1}/{taihekiQuestions.length}
              </div>
            </div>
            <h2 className="text-h3-mobile md:text-h3-desktop font-heading text-light-fg">
              {question.question}
            </h2>
          </div>

          <div className="space-y-3">
            {question.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isLoading}
                className="w-full p-6 text-left border-2 border-border hover:border-green-500 hover:bg-green-50 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center mt-1 flex-shrink-0 group-hover:border-green-500 group-hover:bg-green-100 transition-colors">
                    <span className="text-sm font-medium text-light-fg group-hover:text-green-600">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-body-m-mobile text-light-fg leading-relaxed">
                      {choice.text}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            <div>
              {currentQuestion > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  disabled={isLoading}
                  size="sm"
                >
                  ← 前の質問
                </Button>
              )}
            </div>
            
            <div className="text-xs text-light-fg-muted">
              残り {taihekiQuestions.length - currentQuestion - 1} 問
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      {currentQuestion < 5 && (
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-card p-4 max-w-xl mx-auto">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 text-sm mb-1">
                  体癖診断について
                </h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  野口整体の体癖理論に基づき、あなたの身体的・心理的特徴を分析します。
                  直感的に最も当てはまる選択肢をお選びください。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}