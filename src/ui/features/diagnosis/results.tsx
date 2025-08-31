'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { calculateFortune } from '@/lib/fortune/calculator';
import { mbtiDescriptions } from '@/lib/data/mbti-questions';
import Link from 'next/link';
import type { FortuneResult } from '@/types';

export function DiagnosisResults() {
  const { basicInfo, mbti, taiheki, setFortune, completeStep } = useDiagnosisStore();
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showIntegration, setShowIntegration] = useState(false);

  useEffect(() => {
    // 算命学・動物占い結果を計算
    if (basicInfo && !fortuneResult) {
      const { year, month, day } = basicInfo.birthdate;
      const fortune = calculateFortune(year, month, day);
      setFortuneResult(fortune);
      setFortune(fortune);
    }

    // integration ステップを完了
    completeStep('integration');
  }, [basicInfo, fortuneResult, setFortune, completeStep]);

  const generateAdminPrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const userData = useDiagnosisStore.getState().getUserData();
      if (!userData) return;

      // OpenAI API経由で管理者向けプロンプトを生成
      const response = await fetch('/api/ai/admin-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('プロンプト生成に失敗しました');
      }

      const data = await response.json();
      console.log('Generated Admin Prompt:', data.prompt);
      
      // プロンプトをクリップボードにコピー
      await navigator.clipboard.writeText(data.prompt);
      alert('管理者向けプロンプトがクリップボードにコピーされました。');
    } catch (error) {
      console.error('プロンプト生成エラー:', error);
      alert('プロンプト生成に失敗しました。後で再試行してください。');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateAISummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const userData = useDiagnosisStore.getState().getUserData();
      if (!userData) return;

      // OpenAI API経由で詳細要約を生成
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('要約生成に失敗しました');
      }

      const data = await response.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error('要約生成エラー:', error);
      alert('AI要約の生成に失敗しました。後で再試行してください。');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (!basicInfo || !mbti || !taiheki || !fortuneResult) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-light-fg-muted">診断結果を生成中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-3">
            診断完了！
          </h1>
          <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted">
            {basicInfo.name}さんの統合診断結果
          </p>
        </div>
      </div>

      {/* Success Badge */}
      <div className="flex justify-center">
        <div className="bg-green-50 text-green-700 px-6 py-3 rounded-full text-sm font-medium flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>すべての診断が完了しました</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* MBTI結果 */}
        <div className="bg-white rounded-card p-6 shadow-z2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-light-fg text-lg">MBTI性格タイプ</h3>
              <p className="text-sm text-light-fg-muted">{mbti.source === 'known' ? '既知' : '12問診断'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-2xl font-bold text-purple-900">{mbti.type}</h4>
                {mbti.confidence && (
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                    信頼度 {Math.round(mbti.confidence * 100)}%
                  </span>
                )}
              </div>
              <p className="text-lg font-medium text-purple-800 mb-2">
                {mbtiDescriptions[mbti.type]?.name}
              </p>
              <p className="text-sm text-purple-700">
                {mbtiDescriptions[mbti.type]?.description}
              </p>
            </div>
            
            {mbtiDescriptions[mbti.type]?.traits && (
              <div>
                <p className="text-sm font-medium text-light-fg mb-2">主な特徴</p>
                <div className="flex flex-wrap gap-2">
                  {mbtiDescriptions[mbti.type].traits.map((trait) => (
                    <span key={trait} className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 体癖結果 */}
        <div className="bg-white rounded-card p-6 shadow-z2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-light-fg text-lg">体癖タイプ</h3>
              <p className="text-sm text-light-fg-muted">野口整体理論</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-3">
                <div>
                  <span className="text-2xl font-bold text-green-900">主体癖 {taiheki.primary}種</span>
                  <span className="text-lg text-green-700 ml-2">副体癖 {taiheki.secondary}種</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-light-fg mb-2">あなたの特徴</p>
              <div className="space-y-1">
                {taiheki.characteristics.slice(0, 4).map((characteristic, index) => (
                  <p key={index} className="text-sm text-light-fg-muted flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{characteristic}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 算命学・動物占い結果 */}
        <div className="bg-white rounded-card p-6 shadow-z2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-light-fg text-lg">算命学・動物占い</h3>
              <p className="text-sm text-light-fg-muted">生年月日から算出</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-700">干支</p>
                <p className="font-bold text-yellow-900">{fortuneResult.zodiac}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-700">動物</p>
                <p className="font-bold text-yellow-900">{fortuneResult.animal}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-700">五行</p>
                <p className="font-bold text-yellow-900">{fortuneResult.element}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs text-yellow-700">六星</p>
                <p className="font-bold text-yellow-900">{fortuneResult.sixStar}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-light-fg mb-2">運勢</p>
              <p className="text-sm text-light-fg-muted leading-relaxed">
                {fortuneResult.fortune}
              </p>
            </div>
          </div>
        </div>

        {/* 統合分析結果 */}
        <div className="bg-white rounded-card p-6 shadow-z2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-light-fg text-lg">統合分析</h3>
              <p className="text-sm text-light-fg-muted">総合的な人物像</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">あなたの総合的な特徴</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                MBTI「{mbti.type}」の{mbtiDescriptions[mbti.type as keyof typeof mbtiDescriptions]?.name}タイプで、
                体癖{taiheki.primary}種の特徴を持つあなたは、
                {fortuneResult.animal}のように{fortuneResult.characteristics[0]}性格です。
                {fortuneResult.element}の要素が強く、バランスの取れた判断力を持っています。
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowIntegration(!showIntegration)}
                variant="secondary"
                className="flex-1"
              >
                {showIntegration ? '詳細を非表示' : '詳細な統合分析を表示'}
              </Button>
              <Button
                onClick={generateAISummary}
                disabled={isGeneratingSummary}
                className="flex-1"
              >
                {isGeneratingSummary ? 'AI分析中...' : 'AI総合分析'}
              </Button>
            </div>

            {aiSummary && (
              <div className="space-y-3 bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h5 className="font-medium text-green-900">AI総合分析結果 (GPT-4o生成)</h5>
                </div>
                <div className="prose prose-sm text-green-800 max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br>') }} />
                </div>
              </div>
            )}

            {showIntegration && (
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div>
                  <h5 className="font-medium text-light-fg mb-1">推奨事項</h5>
                  <ul className="text-sm text-light-fg-muted space-y-1">
                    {taiheki.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <Link href="/diagnosis/chat">
            <Button
              className="bg-gradient-brand hover:shadow-lg text-lg px-8 py-4"
              size="lg"
            >
              AIカウンセリングを開始
            </Button>
          </Link>
          
          <Button
            onClick={generateAdminPrompt}
            disabled={isGeneratingPrompt}
            variant="secondary"
          >
            {isGeneratingPrompt ? 'プロンプト生成中...' : 'OpenAI管理者向けプロンプト生成'}
          </Button>
          
          <div className="flex justify-center space-x-4">
            <Button variant="secondary" onClick={() => window.print()}>
              結果を印刷
            </Button>
            <Link href="/">
              <Button variant="secondary">
                ホームに戻る
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-xs text-light-fg-muted">
          診断データは30日後に自動削除されます
        </div>
      </div>
    </div>
  );
}

