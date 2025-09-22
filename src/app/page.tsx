import { Suspense } from 'react';
import { LandingHero } from '@/ui/features/landing/hero';
import { FeatureOverview } from '@/ui/features/landing/feature-overview';
import { DiagnosisFlow } from '@/ui/features/landing/diagnosis-flow';
import { PrivacyNotice } from '@/ui/features/landing/privacy-notice';
import { StartDiagnosisButton } from '@/ui/features/landing/start-diagnosis-button';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingFallback />}>
        {/* Hero Section */}
        <section className="container-responsive section-padding">
          <LandingHero />
        </section>

        {/* Feature Overview */}
        <section className="bg-surface py-16">
          <div className="container-responsive">
            <FeatureOverview />
          </div>
        </section>

        {/* Diagnosis Flow */}
        <section className="container-responsive section-padding">
          <DiagnosisFlow />
        </section>

        {/* Privacy Notice */}
        <section className="bg-surface py-16">
          <div className="container-responsive">
            <PrivacyNotice />
          </div>
        </section>

        {/* Start Diagnosis CTA */}
        <section className="container-responsive pb-20">
          <StartDiagnosisButton />
        </section>
      </Suspense>
    </main>
  );
}