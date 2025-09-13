'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useDiagnosisStore, checkDataExpiry } from '@/lib/zustand/diagnosis-store';

interface DiagnosisContextValue {
  // Context can be extended with additional shared logic if needed
}

const DiagnosisContext = createContext<DiagnosisContextValue>({});

export function useDiagnosisContext() {
  return useContext(DiagnosisContext);
}

interface DiagnosisProviderProps {
  children: React.ReactNode;
}

export function DiagnosisProvider({ children }: DiagnosisProviderProps) {
  const { initializeSession, clearAll, setCurrentStep } = useDiagnosisStore();

  useEffect(() => {
    // Check for expired data on mount
    const hasExpiredData = checkDataExpiry();
    if (hasExpiredData) {
      clearAll();
    }

    // Initialize session if none exists or force new session if on main diagnosis page
    const store = useDiagnosisStore.getState();
    const isMainDiagnosisPage = window.location.pathname === '/diagnosis';
    
    if (!store.sessionId || (isMainDiagnosisPage && !store.basicInfo)) {
      initializeSession();
    } else {
      // Ensure current step progress is correctly calculated based on current step only
      setCurrentStep(store.currentStep);
    }
  }, [initializeSession, clearAll, setCurrentStep]);

  const contextValue: DiagnosisContextValue = {
    // Add shared diagnosis context values here if needed
  };

  return (
    <DiagnosisContext.Provider value={contextValue}>
      {children}
    </DiagnosisContext.Provider>
  );
}