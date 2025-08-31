'use client';

import { Button } from '@/ui/components/ui/button';
import Link from 'next/link';

export function StartDiagnosisButton() {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <h2 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg">
          準備はできましたか？
        </h2>
        <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted max-w-2xl mx-auto">
          あなたの包括的な自己分析を始めましょう。約15-20分で完了します。
        </p>
      </div>

      {/* Large CTA Button */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-brand rounded-2xl blur opacity-75 animate-pulse"></div>
        <div className="relative">
          <Link href="/diagnosis">
            <Button 
              size="lg" 
              className="text-xl px-16 py-6 rounded-2xl bg-gradient-brand hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              診断を開始する
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Info */}
      <div className="flex items-center justify-center space-x-8 text-body-s-mobile text-light-fg-muted">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>完全無料</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>15-20分</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>安全・匿名</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-card p-6 shadow-z1 max-w-md mx-auto">
        <div className="flex items-center justify-between text-sm text-light-fg-muted mb-3">
          <span>進捗状況</span>
          <span>0%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-brand h-2 rounded-full w-0 transition-all duration-500"></div>
        </div>
        <p className="text-xs text-light-fg-muted mt-3 text-center">
          まだ診断を開始していません
        </p>
      </div>
    </div>
  );
}