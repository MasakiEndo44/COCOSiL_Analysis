# Deployment Checklist - Quick Reference

**Last Updated:** 2025-10-30
**Feature:** Diagnosis History (Phases 2.4-2.6)

---

## 🔴 BLOCKING (Must Complete Before Deploy)

### 1. Fix TypeScript Errors in Tests
- [ ] Install `jest-mock-extended` and `@types/jest`
- [ ] Create `tests/helpers/prisma-mock.ts`
- [ ] Update all 3 test files to use new mock
- [ ] Run `npm run type-check` → 0 errors
- [ ] Run `npm test` → all pass

**Files:**
- `tests/helpers/prisma-mock.ts` (create)
- `src/__tests__/api/diagnosis/migrate.test.ts`
- `src/__tests__/api/diagnosis/history.test.ts`
- `src/__tests__/api/diagnosis/[id].test.ts`

**Verification:**
```bash
npm run type-check  # Should show 0 errors
npm test -- --runInBand --no-cache  # All tests pass
```

---

### 2. Fix Supabase Connection Issue
- [ ] Check Supabase project status (not paused)
- [ ] Verify `DATABASE_URL` in `.env.local`
- [ ] Test connection: `npx prisma db push --skip-generate`
- [ ] Run admin check: `node scripts/admin/check-admin.js`

**Quick Test:**
```bash
ping db.htcwkmlkaywglqwdxbrb.supabase.co
npx prisma studio  # Should open successfully
```

---

### 3. Implement Detail Page
- [ ] Create `/dashboard/history/[id]/page.tsx`
- [ ] Create `diagnosis-detail-view.tsx` component
- [ ] Add authentication check
- [ ] Add authorization check (user owns record)
- [ ] Test navigation: history card → detail page

**Verification:**
```bash
npm run type-check
npm run lint
# Manual: Click card from /dashboard/history → should load detail
```

---

## 🟡 PRE-DEPLOY (Strongly Recommended)

### 4. Code Quality
- [ ] `npm run lint` → 0 warnings
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run format` (if using Prettier)

---

### 5. Database Migration
- [ ] Test migration on staging database
- [ ] Verify new column exists: `clerkUserId`
- [ ] Verify new index exists: `(clerkUserId, createdAt)`
- [ ] Document rollback SQL

**Staging Test:**
```bash
npx prisma migrate deploy
npx prisma db pull  # Verify schema matches
```

---

### 6. Manual Smoke Test

#### Anonymous User Flow
- [ ] Complete diagnosis without signing in
- [ ] Check localStorage has `cocosil_diagnosis_data`
- [ ] Sign up with Clerk
- [ ] Verify migration toast appears
- [ ] Check localStorage cleared
- [ ] Navigate to `/dashboard/history` → see migrated record

#### Authenticated User Flow
- [ ] Navigate to `/dashboard/history`
- [ ] Verify cards display correctly
- [ ] Click on a card
- [ ] Verify detail page shows full diagnosis
- [ ] Click back → returns to history list

#### Pagination
- [ ] If >20 records, verify "Load More" button appears
- [ ] Click "Load More"
- [ ] Verify next batch loads

#### Security
- [ ] Log out
- [ ] Try `/dashboard/history` → redirects to sign-in
- [ ] Log in as different user
- [ ] Try accessing another user's diagnosis ID → 404

---

### 7. Environment Variables
- [ ] All required vars in `.env.local` (dev)
- [ ] All required vars in Vercel/production
- [ ] Clerk keys: test → live for production
- [ ] Change `ADMIN_PASSWORD` from `5546` to secure password

**Required Variables:**
```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
OPENAI_API_KEY
ADMIN_PASSWORD
```

---

### 8. Production Build
- [ ] Run `npm run build` → completes without errors
- [ ] No bundle size warnings (>244 KB)
- [ ] Test locally: `npm run start`
- [ ] Check all pages render correctly

**Build Check:**
```bash
npm run build 2>&1 | tee build.log
grep -i "error\|warning" build.log
```

---

## 🟢 POST-DEPLOY (Can Do After Launch)

### 9. E2E Test Setup
- [ ] Install `@clerk/testing`
- [ ] Create `tests/auth.setup.ts`
- [ ] Configure Playwright for Clerk
- [ ] Unskip tests in `tests/e2e/diagnosis-history.spec.ts`
- [ ] Run `npm run test:e2e` → all pass

---

### 10. UX Polish
- [ ] Add loading spinner during migration
- [ ] Add error state with retry logic
- [ ] Add success toast after migration
- [ ] Add migration progress indicator

---

## Quick Command Reference

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test -- --runInBand --no-cache

# Build
npm run build

# Database
npx prisma migrate deploy
npx prisma studio

# Admin tools
node scripts/admin/check-admin.js
node scripts/admin/seed-admin.js
```

---

## Emergency Rollback

If critical issues found after deployment:

```bash
# Database rollback
psql $DATABASE_URL -c "ALTER TABLE diagnosis_records DROP COLUMN clerkUserId;"

# Code rollback
git revert HEAD~1
vercel --prod

# Feature flag disable
# Set NEXT_PUBLIC_ENABLE_HISTORY=false in Vercel
```

---

## Final Go/No-Go Decision

**Deploy when ALL blocking items checked:**
- ✅ TypeScript errors fixed
- ✅ Supabase connection working
- ✅ Detail page implemented
- ✅ Lint passes
- ✅ Tests pass
- ✅ Build succeeds
- ✅ Smoke test passes
- ✅ Environment variables set

**Status:** ⏳ **Not Ready** - 3 blocking items remaining

---

## Post-Deployment Monitoring

**First 24 Hours:**
- [ ] Check error logs every 2 hours
- [ ] Monitor migration success rate
- [ ] Verify no performance degradation
- [ ] Watch for 404 errors on detail page
- [ ] Check database connection errors

**Success Metrics:**
- Migration success rate: >95%
- History page load time: <500ms
- Detail page load time: <300ms
- Zero critical errors
- No user complaints

---

**Detailed Documentation:**
- Full deployment guide: `docs/deployment-roadmap.md`
- Implementation summary: `docs/diagnosis-history-phase2-implementation-summary.md`
- Original plan: `docs/diagnosis-history-implementation-plan.md`
