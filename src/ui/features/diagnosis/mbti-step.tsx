'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/ui/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { mbtiQuestions, calculateMBTI, mbtiDescriptions } from '@/lib/data/mbti-questions';
import type { MBTIType } from '@/types';

const mbtiOptions = [
  { value: 'INTJ', label: 'INTJ（建築家）' },
  { value: 'INTP', label: 'INTP（論理学者）' },
  { value: 'ENTJ', label: 'ENTJ（指揮官）' },
  { value: 'ENTP', label: 'ENTP（討論者）' },
  { value: 'INFJ', label: 'INFJ（提唱者）' },
  { value: 'INFP', label: 'INFP（仲介者）' },
  { value: 'ENFJ', label: 'ENFJ（主人公）' },
  { value: 'ENFP', label: 'ENFP（運動家）' },
  { value: 'ISTJ', label: 'ISTJ（管理者）' },
  { value: 'ISFJ', label: 'ISFJ（擁護者）' },
  { value: 'ESTJ', label: 'ESTJ（幹部）' },
  { value: 'ESFJ', label: 'ESFJ（領事）' },
  { value: 'ISTP', label: 'ISTP（巨匠）' },
  { value: 'ISFP', label: 'ISFP（冒険家）' },
  { value: 'ESTP', label: 'ESTP（起業家）' },
  { value: 'ESFP', label: 'ESFP（エンターテイナー）' }
];

export function MbtiStep() {
  const router = useRouter();
  const { setMBTI, setCurrentStep } = useDiagnosisStore();
  
  const [mode, setMode] = useState<'selection' | 'diagnosis'>('selection');
  const [selectedType, setSelectedType] = useState<MBTIType | ''>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(0 | 1)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // MBTI画面表示時に進捗を40%に設定
  useEffect(() => {
    setCurrentStep('mbti');
  }, [setCurrentStep]);

  const handleKnownType = async () => {
    if (!selectedType) return;

    setIsLoading(true);
    try {
      setMBTI({
        type: selectedType,
        source: 'known',
        confidence: 1.0
      });
      
      setCurrentStep('taiheki_test');
      router.push('/diagnosis/taiheki');
    } catch (error) {
      console.error('MBTI設定エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDiagnosis = () => {
    setMode('diagnosis');
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleAnswer = (answerIndex: 0 | 1) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion + 1 < mbtiQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 診断完了
      completeDiagnosis(newAnswers);
    }
  };

  const completeDiagnosis = async (finalAnswers: (0 | 1)[]) => {
    setIsLoading(true);
    try {
      const result = calculateMBTI(finalAnswers);
      
      setMBTI({
        type: result.type as MBTIType,
        scores: result.scores,
        source: 'diagnosed',
        confidence: result.confidence
      });

      setCurrentStep('taiheki_test');
      router.push('/diagnosis/taiheki');
    } catch (error) {
      console.error('MBTI診断エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    } else {
      setMode('selection');
    }
  };

  if (mode === 'selection') {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
            <span className="text-white text-2xl font-bold">2</span>
          </div>
          <div>
            <h1 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-3">
              MBTIタイプを教えてください
            </h1>
            <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted max-w-xl mx-auto">
              既にご自身のMBTIタイプをご存じでしたら選択してください。<br />
              分からない場合は12問診断を行います。
            </p>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex justify-center">
          <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            ステップ 2/5 • 約5分
          </div>
        </div>

        {/* Selection Form */}
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white rounded-card p-8 shadow-z2">
            <h3 className="font-heading text-light-fg mb-4 text-center">
              既知のMBTIタイプ
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-light-fg">あなたのMBTIタイプ</label>
              <Select value={selectedType || ''} onValueChange={(value) => setSelectedType(value as MBTIType)}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {mbtiOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedType && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {mbtiDescriptions[selectedType].name}
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  {mbtiDescriptions[selectedType].description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {mbtiDescriptions[selectedType].traits.map((trait) => (
                    <span key={trait} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleKnownType}
              disabled={!selectedType || isLoading}
              className="w-full mt-6"
              isLoading={isLoading}
            >
              この結果で進む
            </Button>
          </div>
        </div>

        {/* Diagnosis Option */}
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 rounded-card p-6">
              <h3 className="font-heading text-light-fg mb-3">
                MBTIタイプが分からない方
              </h3>
              <p className="text-sm text-light-fg-muted mb-4">
                12問の簡易診断であなたのタイプを判定します
              </p>
              <Button
                variant="secondary"
                onClick={handleStartDiagnosis}
                className="w-full"
              >
                12問診断を受ける
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 診断モード
  const question = mbtiQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / mbtiQuestions.length) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
          <span className="text-white text-2xl font-bold">2</span>
        </div>
        <div>
          <h1 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-3">
            MBTI診断
          </h1>
          <p className="text-body-m-mobile text-light-fg-muted">
            質問 {currentQuestion + 1} / {mbtiQuestions.length}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-brand h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-card p-8 shadow-z2">
          <div className="mb-6">
            <div className="text-sm text-purple-600 font-medium mb-2">
              {question.axis === 'EI' ? '外向性 / 内向性' :
               question.axis === 'SN' ? '感覚 / 直観' :
               question.axis === 'TF' ? '思考 / 感情' :
               '判断 / 知覚'}
            </div>
            <h2 className="text-h3-mobile font-heading text-light-fg">
              {question.question}
            </h2>
          </div>

          <div className="space-y-4">
            {question.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index as 0 | 1)}
                disabled={isLoading}
                className="w-full p-6 text-left border-2 border-border hover:border-brand-500 hover:bg-blue-50 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-opacity-50"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-body-m-mobile text-light-fg leading-relaxed">
                    {choice.text}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {currentQuestion > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={isLoading}
                size="sm"
              >
                ← 前の質問に戻る
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}