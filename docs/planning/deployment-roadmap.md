# Deployment Roadmap - Diagnosis History Feature

**Date:** 2025-10-30
**Target Deployment:** TBD
**Current Status:** Implementation Complete, Pre-Deployment Fixes Required

---

## Priority Classification

### 🔴 BLOCKING (Must Fix Before Deployment)

Issues that prevent production deployment or cause critical failures.

### 🟡 PRE-DEPLOY (Recommended Before Deployment)

Important validations that ensure production readiness.

### 🟢 POST-DEPLOY (Can Be Done After Deployment)

Nice-to-have improvements that don't block initial release.

---

## 🔴 BLOCKING ISSUES

### 1. Fix Jest/Prisma TypeScript Errors

**Priority:** CRITICAL
**Status:** ❌ Not Started
**Estimated Time:** 2-3 hours
**Blocks:** CI/CD pipeline, type safety guarantees

**Current Problem:**
```
src/__tests__/api/diagnosis/[id].test.ts(104,40): error TS2339: Property 'mockResolvedValue' does not exist on type...
src/__tests__/api/diagnosis/history.test.ts(91,39): error TS2339: Property 'mockResolvedValue' does not exist on type...
src/__tests__/api/diagnosis/migrate.test.ts(81,41): error TS2339: Property 'mockResolvedValue' does not exist on type...
```

**Root Cause:**
- Prisma client methods are not properly mocked with Jest typing
- Missing proper TypeScript definitions for jest.Mocked<PrismaClient>

**Solution Steps:**

1. **Install Required Packages:**
```bash
npm install -D jest-mock-extended @types/jest
```

2. **Create Prisma Mock Helper:**
```typescript
// tests/helpers/prisma-mock.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
```

3. **Update Jest Mock in Tests:**
```typescript
// Replace existing mock with:
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  db: prismaMock,
}));
```

4. **Update tsconfig.jest.json:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "react",
    "esModuleInterop": true,
    "isolatedModules": false,
    "types": ["jest", "node"]
  }
}
```

**Verification:**
```bash
npm run type-check  # Should pass with 0 errors
npm test -- --runInBand --no-cache  # All tests should pass
```

**Files to Modify:**
- `tests/helpers/prisma-mock.ts` (create)
- `src/__tests__/api/diagnosis/migrate.test.ts`
- `src/__tests__/api/diagnosis/history.test.ts`
- `src/__tests__/api/diagnosis/[id].test.ts`
- `tsconfig.json` or create `tsconfig.jest.json`

---

### 2. Debug Supabase Connection Failure

**Priority:** CRITICAL (if affecting production)
**Status:** ❌ Not Started
**Estimated Time:** 1-2 hours
**Blocks:** Admin authentication in development

**Current Error:**
```
Can't reach database server at `db.htcwkmlkaywglqwdxbrb.supabase.co:5432`
```

**Diagnostic Steps:**

1. **Check Network Connectivity:**
```bash
ping db.htcwkmlkaywglqwdxbrb.supabase.co
telnet db.htcwkmlkaywglqwdxbrb.supabase.co 5432
```

2. **Verify Environment Variables:**
```bash
# Check .env.local has correct DATABASE_URL
cat .env.local | grep DATABASE_URL

# Test connection with Prisma
npx prisma db push --skip-generate
```

3. **Check Supabase Dashboard:**
- Verify database is running (not paused)
- Check connection pooler settings
- Verify IP allowlist if enabled

4. **Test with Direct Connection:**
```typescript
// scripts/test-db-connection.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    const count = await prisma.diagnosisRecord.count();
    console.log(`Found ${count} diagnosis records`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

**Common Fixes:**
- Supabase project paused (restart from dashboard)
- Wrong connection string (check for typos)
- SSL mode mismatch (add `?sslmode=require` to DATABASE_URL)
- Connection pooler needed (use pooler URL instead of direct)

**Verification:**
```bash
npm run ts-node scripts/test-db-connection.ts
node scripts/admin/check-admin.js  # Should connect successfully
```

---

### 3. Implement /dashboard/history/[id] Detail Page

**Priority:** HIGH
**Status:** ❌ Not Started
**Estimated Time:** 3-4 hours
**Blocks:** User navigation from history cards (404 error)

**Requirements:**
- Display full diagnosis record details
- Server-side authentication check
- Authorization (user can only view their own diagnoses)
- Responsive design matching app style
- Link back to history list

**Implementation Steps:**

1. **Create Dynamic Route Page:**
```typescript
// src/app/dashboard/history/[id]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/prisma';
import { DiagnosisDetailView } from '@/features/dashboard/diagnosis-detail-view';

export const dynamic = 'force-dynamic';

export default async function DiagnosisDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard/history/' + params.id);
  }

  const recordId = parseInt(params.id, 10);
  if (isNaN(recordId)) {
    notFound();
  }

  const record = await db.diagnosisRecord.findFirst({
    where: {
      id: recordId,
      clerkUserId: userId,
    },
  });

  if (!record) {
    notFound();
  }

  return <DiagnosisDetailView record={record} />;
}
```

2. **Create Detail View Component:**
```typescript
// src/ui/features/dashboard/diagnosis-detail-view.tsx
interface DiagnosisDetailViewProps {
  record: DiagnosisRecord;
}

export function DiagnosisDetailView({ record }: DiagnosisDetailViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back button */}
        {/* Basic Info Section */}
        {/* MBTI Results */}
        {/* Taiheki Results */}
        {/* Fortune Results */}
        {/* Six Star Results */}
        {/* AI Summary if available */}
      </div>
    </div>
  );
}
```

3. **Add Metadata Generation:**
```typescript
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `診断結果 #${params.id} | COCOSiL`,
    description: '診断結果の詳細を確認できます',
  };
}
```

**Verification:**
```bash
npm run type-check
npm run lint
# Manual test: Navigate from /dashboard/history → click card → verify detail page loads
```

**Files to Create:**
- `src/app/dashboard/history/[id]/page.tsx`
- `src/ui/features/dashboard/diagnosis-detail-view.tsx`

---

## 🟡 PRE-DEPLOY CHECKLIST

### 4. Run Full Lint and Type Check

**Command:**
```bash
npm run lint
npm run type-check
npm run format  # If using Prettier
```

**Expected Output:**
```
✓ No ESLint warnings or errors
✓ No TypeScript errors
✓ Code properly formatted
```

**Fix Common Issues:**
- Unused imports → Remove
- `any` types → Replace with proper types
- Missing return types → Add explicit types
- Accessibility warnings → Fix ARIA attributes

---

### 5. Test Database Migrations on Staging

**Steps:**

1. **Create Staging Database:**
```bash
# If using Supabase, create staging project
# Update .env.staging with staging DATABASE_URL
```

2. **Run Migration:**
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

3. **Verify Migration:**
```bash
npx prisma db pull  # Should match schema.prisma
npx prisma studio  # Visual inspection of tables
```

4. **Test Rollback Plan:**
```sql
-- Document rollback SQL
ALTER TABLE "diagnosis_records" DROP COLUMN "clerkUserId";
DROP INDEX "diagnosis_records_clerkUserId_createdAt_idx";
```

**Verification:**
- Migration completes without errors
- New column and index exist in database
- Existing data preserved
- Rollback SQL tested in isolation

---

### 6. Manual Smoke Test

**Test Flow:**

1. **Anonymous User → Sign Up → Migration:**
   - [ ] Complete diagnosis anonymously
   - [ ] Verify localStorage has data
   - [ ] Sign up with Clerk
   - [ ] Verify migration completes
   - [ ] Verify localStorage cleared
   - [ ] Check database record has clerkUserId

2. **View History:**
   - [ ] Navigate to `/dashboard/history`
   - [ ] Verify diagnosis cards display
   - [ ] Check pagination if >20 records
   - [ ] Verify "Load More" button works

3. **View Detail:**
   - [ ] Click on diagnosis card
   - [ ] Verify detail page loads
   - [ ] Check all diagnosis data displays
   - [ ] Verify back button works

4. **Security:**
   - [ ] Log out
   - [ ] Try accessing `/dashboard/history` → redirects to sign-in
   - [ ] Try accessing `/dashboard/history/123` → redirects to sign-in
   - [ ] Log in as different user
   - [ ] Try accessing another user's diagnosis ID → 404

**Test Accounts Needed:**
- Anonymous user (no account)
- User A with existing diagnoses
- User B with no diagnoses

---

### 7. Verify Environment Variables

**Development (.env.local):**
```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
OPENAI_API_KEY="sk-..."
ADMIN_PASSWORD="5546"
```

**Production (.env.production or Vercel):**
```bash
DATABASE_URL="postgresql://..."  # Production Supabase
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."  # Production Clerk
CLERK_SECRET_KEY="sk_live_..."
OPENAI_API_KEY="sk-..."
ADMIN_PASSWORD="[secure-password]"  # Change from dev password
```

**Verification:**
```bash
# Check all required vars are set
node -e "console.log(process.env.DATABASE_URL ? '✓ DATABASE_URL' : '✗ DATABASE_URL missing')"
node -e "console.log(process.env.CLERK_SECRET_KEY ? '✓ CLERK_SECRET_KEY' : '✗ CLERK_SECRET_KEY missing')"
```

---

### 8. Production Build Verification

**Commands:**
```bash
npm run build
npm run start  # Test production build locally
```

**Check for:**
- [ ] Build completes without errors
- [ ] No warnings about large bundles (>244 KB)
- [ ] All pages pre-render correctly
- [ ] API routes compile
- [ ] Static assets optimized

**Common Issues:**
- Client component importing server-only code
- Missing environment variables during build
- Circular dependencies
- Large node_modules in bundle

**Fix:**
```bash
# Analyze bundle
npm run analyze

# Check for issues
npm run build 2>&1 | tee build.log
```

---

## 🟢 POST-DEPLOY IMPROVEMENTS

### 9. Set Up Clerk Test Environment

**Goal:** Enable E2E tests to run with real Clerk authentication

**Steps:**

1. **Install Clerk Testing Package:**
```bash
npm install -D @clerk/testing
```

2. **Configure Playwright with Clerk:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    storageState: 'tests/fixtures/auth.json',  // Clerk session
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
```

3. **Create Auth Setup Script:**
```typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/sign-in');
  await page.fill('input[name="identifier"]', process.env.TEST_USER_EMAIL);
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'tests/fixtures/auth.json' });
});
```

4. **Unskip E2E Tests:**
```typescript
// tests/e2e/diagnosis-history.spec.ts
// Remove test.skip() calls
test('should display history page when authenticated', async ({ page }) => {
  await page.goto('/dashboard/history');
  await expect(page.locator('h1')).toContainText('診断履歴');
});
```

**Verification:**
```bash
npm run test:e2e  # Should run all tests successfully
```

---

### 10. Polish Migration UX

**Improvements:**

1. **Add Loading State:**
```typescript
// src/ui/components/diagnosis/diagnosis-migration-wrapper.tsx
export function DiagnosisMigrationWrapper() {
  const { migrationStatus, isMigrating } = useMigrateAnonymousDiagnosis();

  if (isMigrating) {
    return (
      <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Spinner />
          <span>診断データを移行中...</span>
        </div>
      </div>
    );
  }

  return null;
}
```

2. **Add Error Handling with Retry:**
```typescript
const [retryCount, setRetryCount] = useState(0);

const migrateDiagnosisData = async () => {
  try {
    // ... migration logic
  } catch (error) {
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        migrateDiagnosisData();
      }, 2000 * (retryCount + 1));  // Exponential backoff
    } else {
      setMigrationStatus('error');
    }
  }
};
```

3. **Add Success Toast:**
```typescript
import { toast } from 'sonner';  // or your toast library

// On successful migration
toast.success('診断データを移行しました！', {
  description: '診断履歴から確認できます',
  action: {
    label: '履歴を見る',
    onClick: () => router.push('/dashboard/history'),
  },
});
```

---

## Deployment Timeline

### Phase 1: Critical Fixes (Day 1-2)
- Fix Jest/Prisma TypeScript errors
- Debug Supabase connection
- Implement detail page

### Phase 2: Pre-Deployment Validation (Day 3)
- Run full lint/type check
- Test migrations on staging
- Manual smoke testing
- Verify environment variables
- Production build verification

### Phase 3: Deployment (Day 4)
- Deploy to production
- Monitor error logs
- Validate with real users

### Phase 4: Post-Deployment (Week 2)
- Set up Clerk test environment
- Polish migration UX
- Enable E2E test suite

---

## Rollback Plan

If deployment fails or critical bugs discovered:

1. **Database Rollback:**
```sql
BEGIN;
ALTER TABLE "diagnosis_records" DROP COLUMN "clerkUserId";
DROP INDEX "diagnosis_records_clerkUserId_createdAt_idx";
COMMIT;
```

2. **Code Rollback:**
```bash
# Revert to previous deployment
git revert HEAD~1
vercel --prod  # Or your deployment command
```

3. **Feature Flag:**
```typescript
// Disable history feature temporarily
const HISTORY_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_HISTORY === 'true';

if (!HISTORY_FEATURE_ENABLED) {
  redirect('/dashboard');
}
```

---

## Success Criteria

**Deployment is successful when:**
- ✅ All blocking issues resolved
- ✅ Type check passes with 0 errors
- ✅ All unit tests pass
- ✅ Production build completes
- ✅ Manual smoke test passes
- ✅ No errors in production logs (first 24 hours)
- ✅ Migration works for new signups
- ✅ Existing users can view history
- ✅ Performance acceptable (<500ms page load)

---

## Contact & Escalation

**If Issues Arise:**
1. Check error logs (Vercel/Sentry)
2. Review this deployment guide
3. Consult implementation summary: `diagnosis-history-phase2-implementation-summary.md`
4. Rollback if critical (see Rollback Plan above)

**Key Files:**
- Implementation: `docs/diagnosis-history-phase2-implementation-summary.md`
- Plan: `docs/diagnosis-history-implementation-plan.md`
- This guide: `docs/deployment-roadmap.md`
