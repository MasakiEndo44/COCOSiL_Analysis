import { test, expect } from '@playwright/test';

/**
 * Clerk Authentication Integration E2E Tests
 *
 * Phase 1 Implementation Tests:
 * - Authentication choice screen display
 * - Anonymous diagnosis flow (preserved functionality)
 * - Sign-in/Sign-up page accessibility
 * - Zustand store authentication mode tracking
 *
 * Note: Actual Clerk sign-up/sign-in flows require manual testing
 * as Clerk uses external authentication UI that's not easily automated
 */

test.describe('Clerk Authentication Integration', () => {

  test.beforeEach(async ({ page }) => {
    // Clear cookies before test
    await page.context().clearCookies();

    // Navigate to homepage first to enable localStorage access
    await page.goto('/');

    // Now clear localStorage (must be done after navigation)
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Authentication Choice Screen', () => {

    test('認証選択画面が正しく表示される', async ({ page }) => {
      // Navigate to diagnosis entry point
      await page.goto('/diagnosis');
      await page.waitForLoadState('networkidle');

      // Verify authentication choice screen is displayed
      await expect(page.getByRole('heading', { name: '診断を始める' })).toBeVisible();
      await expect(page.locator('text=診断方法を選択してください')).toBeVisible();

      // Verify all 3 authentication buttons are present
      const createAccountButton = page.locator('a[href="/sign-up"]', { hasText: 'アカウントを作成' });
      const signInButton = page.locator('a[href="/sign-in"]', { hasText: 'サインイン' });
      const anonymousButton = page.locator('button', { hasText: '匿名で続ける' });

      await expect(createAccountButton).toBeVisible();
      await expect(signInButton).toBeVisible();
      await expect(anonymousButton).toBeVisible();

      // Verify button descriptions
      await expect(page.locator('text=診断結果を保存・履歴閲覧可能')).toBeVisible();
      await expect(page.locator('text=既存アカウントで続ける')).toBeVisible();
      await expect(page.locator('text=30日間ブラウザに保存')).toBeVisible();

      // Verify privacy notice
      await expect(page.locator('text=匿名診断の場合、診断データはブラウザのローカルストレージに保存され')).toBeVisible();
    });

    test('アカウント作成ボタンがサインアップページにリダイレクトする', async ({ page }) => {
      await page.goto('/diagnosis');
      await page.waitForLoadState('networkidle');

      // Click "Create Account" button
      const createAccountButton = page.locator('a[href="/sign-up"]').first();
      await createAccountButton.click();

      // Verify redirect to sign-up page
      await expect(page).toHaveURL('/sign-up');
      await page.waitForLoadState('networkidle');

      // Verify Clerk sign-up component is present
      await expect(page.getByRole('heading', { name: 'COCOSiL アカウント作成' })).toBeVisible();
    });

    test('サインインボタンがサインインページにリダイレクトする', async ({ page }) => {
      await page.goto('/diagnosis');
      await page.waitForLoadState('networkidle');

      // Click "Sign In" button
      const signInButton = page.locator('a[href="/sign-in"]').first();
      await signInButton.click();

      // Verify redirect to sign-in page
      await expect(page).toHaveURL('/sign-in');
      await page.waitForLoadState('networkidle');

      // Verify Clerk sign-in component is present
      await expect(page.getByRole('heading', { name: 'COCOSiL にサインイン' })).toBeVisible();
    });

  });

  test.describe('Anonymous Diagnosis Flow (Preserved)', () => {

    test('匿名診断フローが正常に動作する', async ({ page }) => {
      await page.goto('/diagnosis');
      await page.waitForLoadState('networkidle');

      // Click "Continue Anonymously" button
      const anonymousButton = page.locator('button', { hasText: '匿名で続ける' }).first();
      await anonymousButton.click();

      // Wait for navigation to basic info form
      await page.waitForTimeout(1000);

      // Verify basic info form is displayed
      await expect(page.getByRole('heading', { name: '基本情報を入力してください' })).toBeVisible();

      // Verify Zustand store has authMode set to 'anonymous'
      const authMode = await page.evaluate(() => {
        const stored = localStorage.getItem('cocosil-diagnosis-store');
        if (!stored) return null;
        const data = JSON.parse(stored);
        return data.state?.authMode;
      });

      expect(authMode).toBe('anonymous');
    });

    test('匿名診断でlocalStorageに正しくデータが保存される', async ({ page }) => {
      await page.goto('/diagnosis');
      await page.waitForLoadState('networkidle');

      // Start anonymous diagnosis
      await page.locator('button', { hasText: '匿名で続ける' }).first().click();
      await page.waitForTimeout(1000);

      // Fill basic info form
      await page.locator('input[name="name"]').fill('匿名太郎');
      await page.locator('input[name="email"]').fill('anonymous@example.com');

      // Select birthdate using dropdowns
      await page.locator('select[name="birthdate.year"]').first().selectOption('1990');
      await page.locator('select[name="birthdate.month"]').first().selectOption('5');
      await page.locator('select[name="birthdate.day"]').first().selectOption('15');

      // Select gender
      await page.locator('select[name="gender"]').first().selectOption('male');

      // Accept privacy consent
      await page.locator('input[name="privacyConsent"]').check();

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Wait for API call and data storage
      await page.waitForTimeout(3000);

      // Verify localStorage has diagnosis data
      const diagnosisData = await page.evaluate(() => {
        const stored = localStorage.getItem('cocosil-diagnosis-store');
        if (!stored) return null;
        return JSON.parse(stored);
      });

      expect(diagnosisData).not.toBeNull();
      expect(diagnosisData?.state?.authMode).toBe('anonymous');
      expect(diagnosisData?.state?.basicInfo).toBeTruthy();
      expect(diagnosisData?.state?.basicInfo?.name).toBe('匿名太郎');
      expect(diagnosisData?.state?.userId).toBeNull();
    });

    test('認証選択画面をスキップせずに表示される（匿名ユーザー）', async ({ page }) => {
      await page.goto('/diagnosis');
      await page.waitForLoadState('networkidle');

      // Verify auth choice screen is shown (not skipped)
      await expect(page.getByRole('heading', { name: '診断を始める' })).toBeVisible();
      await expect(page.locator('button', { hasText: '匿名で続ける' })).toBeVisible();

      // Verify basic info form is NOT shown yet
      await expect(page.locator('text=基本情報を入力してください')).not.toBeVisible();
    });

  });

  test.describe('Sign-in/Sign-up Pages', () => {

    test('サインアップページが正しく表示される', async ({ page }) => {
      await page.goto('/sign-up');
      await page.waitForLoadState('networkidle');

      // Verify page title
      await expect(page.getByRole('heading', { name: 'COCOSiL アカウント作成' })).toBeVisible();

      // Verify benefits list
      await expect(page.locator('text=アカウント作成のメリット')).toBeVisible();
      await expect(page.locator('text=診断結果を永久保存')).toBeVisible();
      await expect(page.locator('text=診断履歴の閲覧')).toBeVisible();

      // Verify privacy notice
      await expect(page.locator('a[href="/privacy"]')).toBeVisible();
    });

    test('サインインページが正しく表示される', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForLoadState('networkidle');

      // Verify page title
      await expect(page.getByRole('heading', { name: 'COCOSiL にサインイン' })).toBeVisible();

      // Verify description
      await expect(page.locator('text=診断結果を保存してアクセスできます')).toBeVisible();

      // Verify privacy notice
      await expect(page.locator('a[href="/privacy"]')).toBeVisible();
    });

  });

  test.describe('Middleware and Route Protection', () => {

    test('診断ルートは認証なしでアクセス可能', async ({ page }) => {
      await page.goto('/diagnosis');
      await page.waitForLoadState('networkidle');

      // Should not redirect, should show auth choice screen
      await expect(page).toHaveURL('/diagnosis');
      await expect(page.getByRole('heading', { name: '診断を始める' })).toBeVisible();
    });

    test('公開ルートは認証なしでアクセス可能', async ({ page }) => {
      // Test landing page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/');

      // Test learning page
      await page.goto('/learn/taiheki');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/learn/taiheki');
    });

    test('管理者ルートはClerk認証をバイパスする（JWT認証）', async ({ page }) => {
      // Admin routes should use JWT authentication, not Clerk
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Should reach admin page (may show login form, but not Clerk redirect)
      await expect(page).toHaveURL('/admin');

      // Verify it's NOT redirecting to Clerk sign-in
      await expect(page).not.toHaveURL(/sign-in/);
    });

  });

  test.describe('Zustand Store Integration', () => {

    test('認証モードがstoreに正しく保存される（匿名）', async ({ page }) => {
      await page.goto('/diagnosis');
      await page.waitForLoadState('networkidle');

      // Start anonymous diagnosis
      await page.locator('button', { hasText: '匿名で続ける' }).first().click();
      await page.waitForTimeout(500);

      // Check store state
      const storeState = await page.evaluate(() => {
        const stored = localStorage.getItem('cocosil-diagnosis-store');
        if (!stored) return null;
        const data = JSON.parse(stored);
        return {
          authMode: data.state?.authMode,
          userId: data.state?.userId
        };
      });

      expect(storeState?.authMode).toBe('anonymous');
      expect(storeState?.userId).toBeNull();
    });

  });

});

/**
 * Manual Testing Checklist (Cannot be automated):
 *
 * ✅ Clerk Sign-up Flow:
 *    1. Navigate to /sign-up
 *    2. Complete Clerk registration form
 *    3. Verify redirect to /diagnosis
 *    4. Verify name/email auto-filled in basic info form
 *    5. Complete diagnosis and verify data saved
 *
 * ✅ Clerk Sign-in Flow:
 *    1. Navigate to /sign-in
 *    2. Sign in with existing account
 *    3. Verify redirect to /diagnosis
 *    4. Verify authenticated state in Zustand store
 *    5. Verify diagnosis data associated with user ID
 *
 * ✅ Authenticated User Auto-Skip:
 *    1. Sign in to account
 *    2. Navigate to /diagnosis
 *    3. Verify auth choice screen is skipped
 *    4. Verify basic info form shown directly
 *
 * ✅ Data Persistence:
 *    1. Complete diagnosis as authenticated user
 *    2. Sign out and sign back in
 *    3. Verify diagnosis history accessible (Phase 2)
 */
