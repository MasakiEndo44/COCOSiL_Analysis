'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BasicInfoStep } from '@/ui/features/diagnosis/basic-info-step';
import { AuthChoiceScreen } from '@/ui/features/diagnosis/auth-choice-screen';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';

/**
 * Diagnosis Start Page
 *
 * Phase 1 Authentication Integration:
 * - Shows authentication choice screen for unauthenticated users
 * - Directly shows BasicInfoStep for authenticated users
 * - Supports anonymous diagnosis flow (localStorage-based)
 *
 * Flow:
 * 1. Check if user is authenticated (Clerk)
 * 2. If authenticated OR user chose anonymous → show BasicInfoStep
 * 3. Otherwise → show AuthChoiceScreen
 */
export default function DiagnosisStartPage() {
  const { isLoaded, userId } = useAuth();
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const setAuthMode = useDiagnosisStore((state) => state.setAuthMode);

  // Auto-proceed for authenticated users
  useEffect(() => {
    if (isLoaded && userId) {
      setAuthMode('authenticated', userId);
      setShowDiagnosis(true);
    }
  }, [isLoaded, userId, setAuthMode]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-pulse text-lg text-muted-foreground">
          読み込み中...
        </div>
      </div>
    );
  }

  // Show diagnosis flow if user is authenticated or chose anonymous
  if (showDiagnosis) {
    return <BasicInfoStep />;
  }

  // Show authentication choice screen
  return (
    <AuthChoiceScreen
      onProceed={() => {
        console.log('[Zustand] Setting authMode to anonymous');
        setAuthMode('anonymous');
        console.log('[Zustand] authMode set, showing diagnosis');
        setShowDiagnosis(true);
      }}
    />
  );
}