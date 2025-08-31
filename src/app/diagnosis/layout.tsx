import { Suspense } from 'react';
import { DiagnosisHeader } from '@/ui/components/diagnosis/diagnosis-header';
import { ProgressBar } from '@/ui/components/diagnosis/progress-bar';
import { DiagnosisProvider } from '@/ui/components/diagnosis/diagnosis-provider';

interface DiagnosisLayoutProps {
  children: React.ReactNode;
}

function DiagnosisLayoutContent({ children }: DiagnosisLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DiagnosisProvider>
        {/* Header */}
        <DiagnosisHeader />
        
        {/* Progress Bar */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border">
          <div className="container-responsive py-4">
            <ProgressBar />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="container-responsive py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </main>
      </DiagnosisProvider>
    </div>
  );
}

export default function DiagnosisLayout({ children }: DiagnosisLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="text-muted-foreground">診断システムを準備中...</p>
        </div>
      </div>
    }>
      <DiagnosisLayoutContent>{children}</DiagnosisLayoutContent>
    </Suspense>
  );
}