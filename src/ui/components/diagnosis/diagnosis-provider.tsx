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
  const { initializeSession, clearAll } = useDiagnosisStore();

  useEffect(() => {
    // Check for expired data on mount
    const hasExpiredData = checkDataExpiry();
    if (hasExpiredData) {
      clearAll();
    }

    // Initialize session if none exists
    const store = useDiagnosisStore.getState();
    if (!store.sessionId) {
      initializeSession();
    }
  }, [initializeSession, clearAll]);

  const contextValue: DiagnosisContextValue = {
    // Add shared diagnosis context values here if needed
  };

  return (
    <DiagnosisContext.Provider value={contextValue}>
      {children}
    </DiagnosisContext.Provider>
  );
}