'use client';

import { useState } from 'react';
import { PageTag } from '@/lib/dev-tag';
import { TaihekiSelection } from '@/ui/features/diagnosis/taiheki-selection';
import { TaihekiGuide } from '@/ui/features/diagnosis/taiheki-guide';
import { TaihekiDirectInput } from '@/ui/features/diagnosis/taiheki-direct-input';
import { TaihekiStep } from '@/ui/features/diagnosis/taiheki-step';

type DiagnosisMode = 'selection' | 'guide' | 'quick' | 'diagnosis';

export default function TaihekiDiagnosisPage() {
  const [mode, setMode] = useState<DiagnosisMode>('selection');

  const handleModeSelect = (selectedMode: 'guide' | 'quick') => {
    setMode(selectedMode);
  };

  const handleGuideComplete = () => {
    setMode('diagnosis');
  };

  const handleBackToSelection = () => {
    setMode('selection');
  };

  const renderContent = () => {
    switch (mode) {
      case 'selection':
        return <TaihekiSelection onSelect={handleModeSelect} />;
      case 'guide':
        return <TaihekiGuide onComplete={handleGuideComplete} onBack={handleBackToSelection} />;
      case 'quick':
        return <TaihekiDirectInput onBack={handleBackToSelection} />;
      case 'diagnosis':
        return <TaihekiStep />;
      default:
        return <TaihekiSelection onSelect={handleModeSelect} />;
    }
  };

  return (
    <PageTag route="/diagnosis/taiheki" description="体癖診断 - 野口整体理論">
      {renderContent()}
    </PageTag>
  );
}