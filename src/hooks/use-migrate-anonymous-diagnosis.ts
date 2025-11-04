'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

/**
 * localStorage key for anonymous diagnosis data
 * This should match the key used by the diagnosis flow
 */
const ANONYMOUS_DIAGNOSIS_KEY = 'cocosil_diagnosis_data';

/**
 * localStorage key for migration completion flag
 * Format: "migration_completed_{clerkUserId}"
 */
const MIGRATION_COMPLETED_PREFIX = 'cocosil_migration_completed_';

/**
 * Hook to automatically migrate anonymous diagnosis data when user signs up
 *
 * Usage:
 *   Place this hook in the root layout or a component that renders on all pages
 *   after ClerkProvider
 *
 * Flow:
 *   1. User completes diagnosis anonymously → data saved to localStorage
 *   2. User signs up → Clerk redirects back to app
 *   3. This hook detects authenticated session + localStorage data
 *   4. POSTs data to /api/diagnosis/migrate with authentication
 *   5. On success, clears localStorage and sets migration flag
 *
 * Idempotency:
 *   - Uses migration flag keyed by userId to prevent re-running
 *   - Server checks sessionId for deduplication
 *   - Safe to call multiple times (e.g., tab refreshes)
 */
export function useMigrateAnonymousDiagnosis() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [migrationStatus, setMigrationStatus] = useState<
    'idle' | 'checking' | 'migrating' | 'completed' | 'error'
  >('idle');

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return;

    // Only proceed if user is signed in
    if (!isSignedIn || !userId) return;

    // Check if migration already completed for this user
    const migrationFlag = localStorage.getItem(`${MIGRATION_COMPLETED_PREFIX}${userId}`);
    if (migrationFlag) {
      console.log('[MIGRATION] Already completed for this user');
      setMigrationStatus('completed');
      return;
    }

    // Check for anonymous diagnosis data
    const anonymousDataRaw = localStorage.getItem(ANONYMOUS_DIAGNOSIS_KEY);
    if (!anonymousDataRaw) {
      console.log('[MIGRATION] No anonymous diagnosis data found');
      setMigrationStatus('completed'); // No data to migrate
      localStorage.setItem(`${MIGRATION_COMPLETED_PREFIX}${userId}`, 'true');
      return;
    }

    // Attempt migration
    const migrateDiagnosisData = async () => {
      try {
        setMigrationStatus('migrating');
        console.log('[MIGRATION] Starting migration for user', userId);

        const anonymousData = JSON.parse(anonymousDataRaw);

        // Validate data structure
        if (!anonymousData.sessionId || !anonymousData.diagnosisData) {
          console.error('[MIGRATION] Invalid data structure in localStorage');
          setMigrationStatus('error');
          return;
        }

        // POST to migration endpoint
        const response = await fetch('/api/diagnosis/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: anonymousData.sessionId,
            diagnosisData: anonymousData.diagnosisData,
            migrationToken: userId, // Use userId as extra dedup token
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('[MIGRATION] Server error:', error);

          // If conflict (409), it means data already migrated - safe to clear localStorage
          if (response.status === 409) {
            console.log('[MIGRATION] Data already migrated (conflict), clearing localStorage');
            localStorage.removeItem(ANONYMOUS_DIAGNOSIS_KEY);
            localStorage.setItem(`${MIGRATION_COMPLETED_PREFIX}${userId}`, 'true');
            setMigrationStatus('completed');
            return;
          }

          setMigrationStatus('error');
          return;
        }

        const result = await response.json();
        console.log('[MIGRATION] Success:', result);

        // Clear anonymous data from localStorage
        localStorage.removeItem(ANONYMOUS_DIAGNOSIS_KEY);

        // Set migration completed flag
        localStorage.setItem(`${MIGRATION_COMPLETED_PREFIX}${userId}`, 'true');

        setMigrationStatus('completed');

        // Optional: Show success notification to user
        // You can emit an event or use a toast notification here

      } catch (error) {
        console.error('[MIGRATION] Unexpected error:', error);
        setMigrationStatus('error');
      }
    };

    migrateDiagnosisData();

  }, [isLoaded, isSignedIn, userId]);

  return {
    migrationStatus,
    isMigrating: migrationStatus === 'migrating',
    isCompleted: migrationStatus === 'completed',
    hasError: migrationStatus === 'error',
  };
}
