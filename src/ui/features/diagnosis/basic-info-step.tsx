'use client';

import { useRouter } from 'next/navigation';
import { BasicInfoForm } from '@/ui/features/forms/basic-info-form';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';

export function BasicInfoStep() {
  const router = useRouter();
  const { setCurrentStep } = useDiagnosisStore();

  const handleSuccess = () => {
    setCurrentStep('mbti');
    router.push('/diagnosis/mbti');
  };

  const handleError = (error: string) => {
    console.error('Basic info form error:', error);
    // Could show toast notification here
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Introduction */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
          <span className="text-white text-2xl font-bold">1</span>
        </div>
        <div>
          <h1 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-3">
            基本情報を入力してください
          </h1>
          <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted max-w-xl mx-auto">
            診断に必要な基本情報を入力いただきます。入力いただいた情報は診断目的のみに使用し、30日後に自動削除されます。
          </p>
        </div>
      </div>

      {/* Progress Info */}
      <div className="flex justify-center">
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          ステップ 1/5 • 約2分
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto">
        <BasicInfoForm 
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>

      {/* Help Text */}
      <div className="text-center space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-card p-4 max-w-2xl mx-auto">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900 text-sm mb-1">
                なぜこの情報が必要なのですか？
              </h3>
              <p className="text-xs text-yellow-800 leading-relaxed">
                生年月日は算命学・動物占い診断に、性別は体癖診断の精度向上に使用します。
                名前とメールアドレスは結果通知と管理のために必要です。
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-light-fg-muted">
          次のステップ：MBTIタイプの収集（既知の場合は選択、不明の場合は12問診断）
        </div>
      </div>
    </div>
  );
}