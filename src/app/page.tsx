import { Suspense } from 'react';
import { PageTag, SectionTag } from '@/lib/dev-tag';
import { LandingHero } from '@/ui/features/landing/hero';
import { FeatureOverview } from '@/ui/features/landing/feature-overview';
import { DiagnosisFlow } from '@/ui/features/landing/diagnosis-flow';
import { PrivacyNotice } from '@/ui/features/landing/privacy-notice';
import { StartDiagnosisButton } from '@/ui/features/landing/start-diagnosis-button';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <PageTag route="/" description="ランディングページ - システム概要と診断開始">
      <main className="min-h-screen">
        <Suspense fallback={<LoadingFallback />}>
          {/* Hero Section */}
          <SectionTag name="Hero" functionality="メインビジュアル・タイトル">
            <section className="container-responsive section-padding">
              <LandingHero />
            </section>
          </SectionTag>

          {/* Feature Overview */}
          <SectionTag name="Features" functionality="機能紹介・統合診断システム">
            <section className="bg-surface py-16">
              <div className="container-responsive">
                <FeatureOverview />
              </div>
            </section>
          </SectionTag>

          {/* Diagnosis Flow */}
          <SectionTag name="Flow" functionality="診断フローの説明">
            <section className="container-responsive section-padding">
              <DiagnosisFlow />
            </section>
          </SectionTag>

          {/* Privacy Notice */}
          <SectionTag name="Privacy" functionality="個人情報保護・使用目的">
            <section className="bg-surface py-16">
              <div className="container-responsive">
                <PrivacyNotice />
              </div>
            </section>
          </SectionTag>

          {/* Start Diagnosis CTA */}
          <SectionTag name="CTA" functionality="診断開始ボタン">
            <section className="container-responsive pb-20">
              <StartDiagnosisButton />
            </section>
          </SectionTag>
        </Suspense>
      </main>
    </PageTag>
  );
}