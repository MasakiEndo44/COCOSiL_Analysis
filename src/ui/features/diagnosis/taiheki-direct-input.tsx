'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/ui/components/ui/button';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import type { TaihekiType, SecondaryTaihekiType } from '@/types';

interface TaihekiDirectInputProps {
  onBack: () => void;
}

export function TaihekiDirectInput({ onBack }: TaihekiDirectInputProps) {
  const router = useRouter();
  const { setTaiheki, setCurrentStep } = useDiagnosisStore();
  
  const [primaryType, setPrimaryType] = useState<number | null>(null);
  const [secondaryType, setSecondaryType] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!primaryType) return;
    
    setIsLoading(true);
    try {
      const result = {
        primary: primaryType as TaihekiType,
        secondary: (secondaryType || 0) as SecondaryTaihekiType,
        scores: {} as Record<TaihekiType, number>,
        characteristics: [getTypeDescription(primaryType, secondaryType)],
        recommendations: ['体癖番号を直接入力いただきました。']
      };
      
      setTaiheki(result);
      setCurrentStep('integration');
      router.push('/diagnosis/results');
    } catch (error) {
      console.error('体癖入力エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeDescription = (primary: number, secondary: number | null): string => {
    const types = {
      1: "冷静沈着な分析家",
      2: "協調性のある調整役", 
      3: "明るく社交的なムードメーカー",
      4: "感情豊かな芸術家",
      5: "行動的な実業家",
      6: "ロマンチックな夢想家",
      7: "闘争心旺盛な戦士",
      8: "忍耐強い支援者",
      9: "完璧主義の専門家",
      10: "包容力のある母性型"
    };
    
    const primaryDesc = types[primary as keyof typeof types] || "";
    const secondaryDesc = secondary ? types[secondary as keyof typeof types] : null;
    
    return secondaryDesc 
      ? `主体癖${primary}種（${primaryDesc}）、副体癖${secondary}種（${secondaryDesc}）`
      : `主体癖${primary}種（${primaryDesc}）`;
  };

  const typeOptions = [
    { value: 1, label: "1種", description: "冷静沈着な分析家" },
    { value: 2, label: "2種", description: "協調性のある調整役" },
    { value: 3, label: "3種", description: "明るく社交的なムードメーカー" },
    { value: 4, label: "4種", description: "感情豊かな芸術家" },
    { value: 5, label: "5種", description: "行動的な実業家" },
    { value: 6, label: "6種", description: "ロマンチックな夢想家" },
    { value: 7, label: "7種", description: "闘争心旺盛な戦士" },
    { value: 8, label: "8種", description: "忍耐強い支援者" },
    { value: 9, label: "9種", description: "完璧主義の専門家" },
    { value: 10, label: "10種", description: "包容力のある母性型" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
          <span className="text-white text-2xl font-bold">⚡</span>
        </div>
        <div>
          <h1 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-3">
            体癖番号の直接入力
          </h1>
          <p className="text-body-m-mobile text-light-fg-muted max-w-2xl mx-auto">
            すでにご存知の体癖番号を入力して、次のステップへ進んでください。
          </p>
        </div>
      </div>

      {/* Progress Info */}
      <div className="flex justify-center">
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          ステップ 4/5 • 約1分
        </div>
      </div>

      {/* Input Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-card p-8 shadow-z2 space-y-6">
          {/* Primary Type Selection */}
          <div>
            <h3 className="font-heading text-light-fg mb-4">主体癖（必須）</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPrimaryType(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                    primaryType === option.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-border hover:border-green-300 text-light-fg'
                  }`}
                >
                  <div className="font-bold text-lg">{option.label}</div>
                  <div className="text-xs mt-1 leading-tight">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Type Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-light-fg">副体癖（任意）</h3>
              <span className="text-xs text-light-fg-muted bg-gray-100 px-2 py-1 rounded-full">
                分からない場合は空欄でOK
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSecondaryType(secondaryType === option.value ? null : option.value)}
                  disabled={primaryType === option.value}
                  className={`p-4 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                    primaryType === option.value
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : secondaryType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-border hover:border-blue-300 text-light-fg'
                  }`}
                >
                  <div className="font-bold text-lg">{option.label}</div>
                  <div className="text-xs mt-1 leading-tight">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {primaryType && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-medium text-green-900 mb-2">入力内容の確認</h4>
              <p className="text-sm text-green-800">
                {getTypeDescription(primaryType, secondaryType)}
              </p>
            </div>
          )}

          {/* Help Link */}
          <div className="text-center">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              体癖理論について詳しく知りたい方はこちら
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
            <Button
              variant="secondary"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1"
            >
              ← 選択画面に戻る
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!primaryType || isLoading}
              className="flex-1"
            >
              {isLoading ? '処理中...' : '入力完了・次へ進む →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}