# Playwright E2E Test Results - User Authentication
**Date:** 2025-11-04
**Command:** `/sc:test "playwrightでユーザー認証機能をテスト"`
**Test File:** `tests/e2e/clerk-auth-integration.spec.ts` (269 lines)

---

## 📊 Test Results Summary

**Overall Status:** 5/12 tests passing (41.7% pass rate)

### ✅ Passing Tests (5/12)

1. **認証選択画面が正しく表示される** - Authentication choice screen displays correctly
2. **認証選択画面をスキップせずに表示される（匿名ユーザー）** - Auth choice screen not skipped for anonymous users
3. **診断ルートは認証なしでアクセス可能** - Diagnosis route accessible without authentication
4. **公開ルートは認証なしでアクセス可能** - Public routes accessible without authentication
5. **管理者ルートはClerk認証をバイパスする（JWT認証）** - Admin routes bypass Clerk authentication

### ❌ Failing Tests (7/12)

#### Category 1: Navigation Failures (2 tests)
- **アカウント作成ボタンがサインアップページにリダイレクトする** - Sign-up button doesn't navigate
- **サインインボタンがサインインページにリダイレクトする** - Sign-in button doesn't navigate

**Error Pattern:**
```
Expected URL: http://localhost:3000/sign-up
Received URL: http://localhost:3000/diagnosis (no navigation occurred)
```

#### Category 2: Anonymous Flow Failures (3 tests)
- **匿名診断フローが正常に動作する** - Anonymous diagnosis flow broken
- **匿名診断でlocalStorageに正しくデータが保存される** - localStorage not saved during anonymous diagnosis
- **認証モードがstoreに正しく保存される（匿名）** - Zustand store authMode is null

**Error Patterns:**
```
1. Heading not found: '基本情報を入力してください' (basic info form doesn't appear)
2. Timeout: select[name="birthdate.year"] element never appears
3. Store authMode is null instead of "anonymous"
```

#### Category 3: Missing Page Elements (2 tests)
- **サインアップページが正しく表示される** - Sign-up page missing expected elements
- **サインインページが正しく表示される** - Sign-in page missing expected elements

**Error Pattern:**
```
Expected heading not found: 'COCOSiL アカウント作成' / 'COCOSiL にサインイン'
```

---

## 🔍 Root Cause Analysis

### Primary Issue: Client-Side Hydration Timing

The application uses **React client-side rendering** with Clerk authentication:
- Server HTML contains minimal content (loading state)
- React hydrates and renders interactive elements after JavaScript loads
- Tests attempt to click elements **before they become interactive**

### Code Evidence

**❌ Current Implementation** (`tests/e2e/clerk-auth-integration.spec.ts:63-64`):
```typescript
const createAccountButton = page.locator('a[href="/sign-up"]').first();
await createAccountButton.click();  // NO WAIT - clicks immediately
```

**Problem:** The button might exist in the DOM but not be interactive yet, causing clicks to fail or not trigger expected behavior.

---

## 🛠️ Required Fixes

### Fix 1: Wait for Element Visibility Before Clicking

**All failing navigation tests need this pattern:**

```typescript
// ❌ BEFORE: No wait
const createAccountButton = page.locator('a[href="/sign-up"]').first();
await createAccountButton.click();

// ✅ AFTER: Wait for visibility
const createAccountButton = page.locator('a[href="/sign-up"]').first();
await createAccountButton.waitFor({ state: 'visible' });  // ← ADD THIS
await createAccountButton.click();
```

**Files Affected:**
- Line 63-64: Sign-up button click
- Line 79-80: Sign-in button click
- Line 100: Anonymous button click (匿名で続ける)
- Line 124: Another anonymous button click

### Fix 2: Use More Specific Selectors

**Problem:** `.first()` suggests multiple matching elements exist.

```typescript
// ❌ AVOID: Generic selector with .first()
page.locator('a[href="/sign-up"]').first()

// ✅ BETTER: Specific selector
page.locator('a[href="/sign-up"]', { hasText: 'アカウントを作成' }).first()

// ✅ BEST: Use data-testid attributes
page.locator('[data-testid="auth-signup-button"]')
```

### Fix 3: Increase Timeout for Clerk Loading

Clerk authentication widgets take time to load. Tests on `/sign-up` and `/sign-in` pages should wait longer:

```typescript
// After navigating to Clerk pages
await page.goto('/sign-up');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);  // ← ADD: Wait for Clerk widget hydration

// THEN check for heading
await expect(page.getByRole('heading', { name: 'COCOSiL アカウント作成' })).toBeVisible();
```

### Fix 4: Debug Zustand Store State

The store test shows `authMode` is `null` instead of `"anonymous"`. This indicates:

1. **Either:** The anonymous button click isn't triggering the store update
2. **Or:** The store isn't being persisted to localStorage correctly

**Debug Steps:**
```typescript
// After clicking anonymous button
await anonymousButton.click();
await page.waitForTimeout(1000);

// ADD: Log store contents for debugging
const storeContents = await page.evaluate(() => {
  const stored = localStorage.getItem('cocosil-diagnosis-store');
  console.log('Store contents:', stored);  // Check actual contents
  return stored;
});
```

---

## 📝 Implementation Checklist

### Priority 1: Fix Navigation (High Impact)
- [ ] Add `waitFor({ state: 'visible' })` before sign-up button click (line 63)
- [ ] Add `waitFor({ state: 'visible' })` before sign-in button click (line 79)
- [ ] Add `waitFor({ state: 'visible' })` before anonymous button clicks (lines 100, 124)

### Priority 2: Fix Clerk Page Tests (Medium Impact)
- [ ] Add 2-second timeout after navigating to `/sign-up` (line 180)
- [ ] Add 2-second timeout after navigating to `/sign-in` (line 196)
- [ ] Investigate actual heading text in Clerk widgets (might differ from expected)

### Priority 3: Debug Store Integration (Medium Impact)
- [ ] Add console logging to debug Zustand store updates
- [ ] Verify anonymous button click triggers `setAuthMode('anonymous')`
- [ ] Check if localStorage persistence is working correctly

### Priority 4: Code Quality (Low Impact)
- [ ] Replace `.first()` with more specific selectors
- [ ] Add `data-testid` attributes to critical buttons in application code
- [ ] Consider extracting wait logic into helper functions

---

## 🎯 Expected Outcome After Fixes

With proper wait logic implemented:
- **Navigation tests:** 7/7 should pass (100%)
- **Anonymous flow:** 3/3 should pass (100%)
- **Overall pass rate:** 12/12 (100%) or 11/12 (91.7% if store issue persists)

---

## 🔧 Quick Fix Commands

```bash
# Run single failing test in debug mode
npx playwright test tests/e2e/clerk-auth-integration.spec.ts:58 --project=chromium --debug

# Run with trace to see exact failure point
npx playwright test tests/e2e/clerk-auth-integration.spec.ts --project=chromium --trace on
npx playwright show-trace test-results/[trace-file].zip

# Run with headed browser to visually see failures
npx playwright test tests/e2e/clerk-auth-integration.spec.ts --project=chromium --headed --slowmo=500
```

---

## 📌 Key Learnings

1. **Client-Side Rendered Apps Need Explicit Waits:** Always wait for elements to be visible before interacting
2. **Playwright's Auto-Wait Isn't Enough:** While Playwright auto-waits for elements to exist, it doesn't guarantee React has hydrated and attached event handlers
3. **Clerk Widgets Are Async:** Authentication widgets load asynchronously and need extra wait time
4. **Generic Selectors Can Be Fragile:** Using `.first()` suggests selector specificity issues

---

## 🔗 Related Files

- **Test File:** [tests/e2e/clerk-auth-integration.spec.ts](../tests/e2e/clerk-auth-integration.spec.ts:1)
- **Playwright Config:** [playwright.config.ts](../playwright.config.ts:1)
- **Zustand Store:** [src/lib/zustand/diagnosis-store.ts](../src/lib/zustand/diagnosis-store.ts:1)
- **Auth Components:** `src/app/diagnosis/page.tsx`, `src/app/sign-up/page.tsx`, `src/app/sign-in/page.tsx`

---

## 📅 Next Steps

1. **Implement Priority 1 fixes** (navigation waits) - Est: 15 minutes
2. **Re-run full test suite** to verify improvements
3. **Implement Priority 2 fixes** (Clerk page timeouts) - Est: 10 minutes
4. **Debug Priority 3** (Zustand store) if still failing - Est: 30 minutes
5. **Clean up with Priority 4** (code quality) - Est: 30 minutes

**Total Estimated Time to 100% Pass Rate:** 1-1.5 hours
