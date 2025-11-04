'use client';

import { useMigrateAnonymousDiagnosis } from '@/hooks/use-migrate-anonymous-diagnosis';

/**
 * DiagnosisMigrationWrapper
 *
 * Renders nothing but triggers anonymous diagnosis data migration on sign-up
 *
 * Place this component in the root layout after ClerkProvider to ensure
 * it runs on every page load and can detect when a user signs in
 *
 * The migration hook will:
 * 1. Detect authenticated session
 * 2. Check for anonymous diagnosis data in localStorage
 * 3. POST to /api/diagnosis/migrate
 * 4. Clear localStorage on success
 */
export function DiagnosisMigrationWrapper() {
  const { migrationStatus } = useMigrateAnonymousDiagnosis();

  // Log migration status in development
  if (process.env.NODE_ENV === 'development' && migrationStatus !== 'idle') {
    console.log('[DiagnosisMigrationWrapper] Status:', migrationStatus);
  }

  // This component renders nothing
  return null;
}
