import { Button } from '@/ui/components/ui/button';
import Link from 'next/link';

export function LandingHero() {
  return (
    <div className="text-center space-y-8">
      {/* Logo/Title */}
      <div className="space-y-4">
        <div className="w-32 h-32 mx-auto bg-gradient-brand rounded-3xl flex items-center justify-center mb-8">
          <span className="text-white text-4xl font-bold">C</span>
        </div>
        <h1 className="text-h1-mobile md:text-h1-desktop font-heading text-light-fg">
          COCOSiL<br />
          <span className="text-brand-500">（ココシル）</span>
        </h1>
        <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted max-w-2xl mx-auto">
          体癖理論・MBTI・算命学・動物占いを統合した<br />
          包括的な人間理解プラットフォーム
        </p>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="p-6 bg-white rounded-card shadow-z1 hover:shadow-z2 transition-all">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-h3-mobile font-heading text-light-fg mb-2">科学的診断</h3>
          <p className="text-body-m-mobile text-light-fg-muted">
            複数の診断手法を統合した包括的な分析
          </p>
        </div>

        <div className="p-6 bg-white rounded-card shadow-z1 hover:shadow-z2 transition-all">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-h3-mobile font-heading text-light-fg mb-2">プライバシー保護</h3>
          <p className="text-body-m-mobile text-light-fg-muted">
            個人データを30日後に自動削除
          </p>
        </div>

        <div className="p-6 bg-white rounded-card shadow-z1 hover:shadow-z2 transition-all">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-h3-mobile font-heading text-light-fg mb-2">即時結果</h3>
          <p className="text-body-m-mobile text-light-fg-muted">
            診断完了後すぐに結果を確認
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-8">
        <Link href="/diagnosis">
          <Button size="lg" className="text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
            診断を始める
          </Button>
        </Link>
      </div>

      {/* Additional Info */}
      <div className="pt-4">
        <p className="text-body-s-mobile text-light-fg-muted">
          診断時間：約15-20分 | 完全無料
        </p>
      </div>
    </div>
  );
}