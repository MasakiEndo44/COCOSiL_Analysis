'use client';

import Link from 'next/link';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';

export function DiagnosisHeader() {
  const { sessionId, currentStep } = useDiagnosisStore();

  const getStepTitle = (step: string) => {
    switch (step) {
      case 'basic_info': return '基本情報入力';
      case 'mbti': return 'MBTI診断';
      case 'taiheki_learn': return '体癖理論学習';
      case 'taiheki_test': return '体癖診断';
      case 'integration': return '統合結果';
      default: return '診断中';
    }
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container-responsive py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-lg font-heading text-light-fg">COCOSiL</h1>
              <p className="text-xs text-light-fg-muted">統合診断システム</p>
            </div>
          </Link>

          {/* Current Step Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-light-fg">
                {getStepTitle(currentStep)}
              </p>
              <p className="text-xs text-light-fg-muted">
                セッション: {sessionId?.slice(-8)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Help Button */}
            <button
              className="p-2 text-light-fg-muted hover:text-light-fg hover:bg-light-bg-subtle rounded-lg transition-colors"
              title="ヘルプ"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Exit Button */}
            <Link 
              href="/"
              className="p-2 text-light-fg-muted hover:text-error hover:bg-red-50 rounded-lg transition-colors"
              title="診断を終了"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}