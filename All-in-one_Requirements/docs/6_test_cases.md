# COCOSiL テストケース設計書

**バージョン**: v1.0  
**作成日**: 2025-11-05  
**テストフレームワーク**: Jest + React Testing Library + Playwright

---

## 📋 テスト戦略

### テストピラミッド

```
         /\
        /E2E\       少数の重要フロー（10ケース）
       /------\
      /統合テスト \    API・DB連携（30ケース）
     /----------\
    /ユニットテスト\   関数・コンポーネント（100ケース）
   /--------------\
```

### カバレッジ目標

- **ユニットテスト**: 60%以上
- **統合テスト**: 主要API全カバー
- **E2Eテスト**: クリティカルパス100%

---

## 1. ユニットテスト

### 1.1 算命学系診断ロジック

```typescript
describe('算命学系診断', () => {
  test('正しい生年月日で診断結果が返る', () => {
    const result = calculateFortune(1971, 6, 28);
    expect(result.animal_character).toBe('落ち着きのあるペガサス');
    expect(result.western_zodiac).toBe('蟹座');
  });

  test('無効な日付でエラーを返す', () => {
    expect(() => calculateFortune(2024, 2, 30))
      .toThrow('存在しない日付です');
  });

  test('対応年度外でエラーを返す', () => {
    expect(() => calculateFortune(1900, 1, 1))
      .toThrow('対応年度は1930年～2025年です');
  });
});
```

### 1.2 バリデーション

```typescript
describe('入力バリデーション', () => {
  test('ニックネーム: 3-50文字', () => {
    expect(validateNickname('ab')).toBe(false);
    expect(validateNickname('山田太郎')).toBe(true);
  });

  test('生年月日: 形式チェック', () => {
    expect(validateBirthDate('1985-06-15')).toBe(true);
    expect(validateBirthDate('1985/06/15')).toBe(false);
  });
});
```

---

## 2. 統合テスト（API）

### 2.1 ユーザーAPI

#### GET /api/users/me

```typescript
describe('GET /api/users/me', () => {
  test('認証済みユーザーの情報を取得', async () => {
    const response = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('nickname');
  });

  test('未認証の場合401エラー', async () => {
    const response = await fetch('/api/users/me');
    expect(response.status).toBe(401);
  });
});
```

#### PUT /api/users/me

```typescript
test('生年月日変更で診断が再実行される', async () => {
  const response = await put('/api/users/me', {
    birth_date: '1986-06-15'
  });
  
  expect(response.metadata.recalculated_fortune).toBe(true);
});
```

### 2.2 診断API

```typescript
describe('POST /api/fortune/calculate', () => {
  test('正常な診断実行', async () => {
    const response = await post('/api/fortune/calculate', {
      birth_date: '1985-06-15'
    });
    
    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('animal_character');
  });

  test('無効な日付で400エラー', async () => {
    const response = await post('/api/fortune/calculate', {
      birth_date: '2024-02-30'
    });
    
    expect(response.status).toBe(400);
    expect(response.error.code).toBe('INVALID_DATE');
  });
});
```

---

## 3. E2Eテスト（Playwright）

### 3.1 新規登録フロー

```typescript
test('新規ユーザー登録〜診断完了', async ({ page }) => {
  // 1. ランディングページ
  await page.goto('/');
  await page.click('text=今すぐ無料で始める');

  // 2. 登録画面
  await page.fill('[name="nickname"]', 'テストユーザー');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.fill('[name="birth_year"]', '1985');
  await page.fill('[name="birth_month"]', '06');
  await page.fill('[name="birth_day"]', '15');
  await page.click('text=登録して診断を開始');

  // 3. 診断実行中
  await page.waitForSelector('text=診断中...');

  // 4. 診断結果表示
  await page.waitForSelector('text=診断が完了しました', { timeout: 10000 });
  await expect(page.locator('text=ペガサス')).toBeVisible();

  // 5. ダッシュボードへ
  await page.click('text=AIチャットを始める');
  await expect(page).toHaveURL('/dashboard/chat');
});
```

### 3.2 診断追加フロー

```typescript
test('MBTI診断を追加', async ({ page }) => {
  await loginAsTestUser(page);

  // 1. 診断管理画面へ
  await page.click('text=診断管理');
  await page.click('text=診断を追加');

  // 2. MBTI選択
  await page.click('text=MBTI');
  await page.selectOption('[name="mbti_type"]', 'INFP');
  await page.click('text=保存');

  // 3. 成功メッセージ確認
  await expect(page.locator('text=MBTIが保存されました')).toBeVisible();

  // 4. 診断一覧に表示
  await page.goto('/dashboard/diagnosis');
  await expect(page.locator('text=MBTI: INFP')).toBeVisible();
});
```

### 3.3 AIチャットフロー

```typescript
test('AIチャットでメッセージ送信', async ({ page }) => {
  await loginAsTestUser(page);

  // 1. チャット画面へ
  await page.click('text=AIチャット');

  // 2. 利用回数確認
  const usageText = await page.locator('text=今月の利用:').textContent();
  expect(usageText).toMatch(/\d+\/10回/);

  // 3. メッセージ送信
  await page.fill('[placeholder="メッセージを入力..."]', 'こんにちは');
  await page.click('text=送信');

  // 4. AI応答を待つ
  await page.waitForSelector('text=こんにちは！', { timeout: 10000 });
  await expect(page.locator('.chat-message.assistant')).toBeVisible();
});
```

---

## 4. パフォーマンステスト

### 4.1 応答時間

```typescript
test('算命学系診断: 100ms以内', async () => {
  const start = Date.now();
  await fetch('/api/fortune/calculate', {
    method: 'POST',
    body: JSON.stringify({ birth_date: '1985-06-15' })
  });
  const elapsed = Date.now() - start;
  
  expect(elapsed).toBeLessThan(100);
});

test('ページ初期表示: 3秒以内', async ({ page }) => {
  const start = Date.now();
  await page.goto('/dashboard');
  await page.waitForLoadState('load');
  const elapsed = Date.now() - start;
  
  expect(elapsed).toBeLessThan(3000);
});
```

---

## 5. セキュリティテスト

### 5.1 認証・認可

```typescript
test('未認証でダッシュボードアクセス→リダイレクト', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/sign-in');
});

test('他人のデータにアクセス不可', async () => {
  const response = await fetch('/api/users/other-user-id', {
    headers: { Authorization: `Bearer ${testToken}` }
  });
  
  expect(response.status).toBe(403);
});
```

### 5.2 XSS対策

```typescript
test('スクリプトタグがエスケープされる', async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto('/dashboard/settings');
  await page.fill('[name="nickname"]', '<script>alert("XSS")</script>');
  await page.click('text=変更を保存');
  
  // スクリプトが実行されないことを確認
  const nickname = await page.locator('.user-nickname').textContent();
  expect(nickname).toBe('<script>alert("XSS")</script>');
  
  // ダイアログが表示されないことを確認
  page.on('dialog', () => fail('XSS実行された'));
});
```

---

## 6. アクセシビリティテスト

```typescript
test('キーボード操作のみで登録完了', async ({ page }) => {
  await page.goto('/sign-up');
  
  // Tabキーで順次移動
  await page.keyboard.press('Tab'); // ニックネーム
  await page.keyboard.type('テストユーザー');
  await page.keyboard.press('Tab'); // メール
  await page.keyboard.type('test@example.com');
  // ... 以下同様
  await page.keyboard.press('Enter'); // 送信
  
  await expect(page).toHaveURL('/onboarding');
});

test('スクリーンリーダー用ARIAラベル', async ({ page }) => {
  await page.goto('/dashboard');
  
  const nav = await page.locator('nav[aria-label="メインナビゲーション"]');
  expect(nav).toBeDefined();
});
```

---

## 7. レスポンシブテスト

```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];

viewports.forEach(({ name, width, height }) => {
  test(`${name}: ダッシュボード表示`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await loginAsTestUser(page);
    await page.goto('/dashboard');
    
    await expect(page.locator('.dashboard')).toBeVisible();
    
    if (name === 'mobile') {
      // モバイルではハンバーガーメニュー
      await expect(page.locator('.hamburger-menu')).toBeVisible();
    } else {
      // デスクトップではサイドバー
      await expect(page.locator('.sidebar')).toBeVisible();
    }
  });
});
```

---

## 8. テスト実行手順

### ローカル環境

```bash
# ユニットテスト
npm run test

# ユニットテスト（カバレッジ）
npm run test:coverage

# E2Eテスト
npm run test:e2e

# すべてのテスト
npm run test:all
```

### CI/CD（GitHub Actions）

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

---

## 9. テストデータ管理

### テストユーザー

```typescript
export const testUsers = {
  user1: {
    email: 'test1@example.com',
    password: 'Password123!',
    nickname: 'テストユーザー1',
    birth_date: '1985-06-15'
  },
  user2: {
    email: 'test2@example.com',
    password: 'Password123!',
    nickname: 'テストユーザー2',
    birth_date: '1992-11-22'
  }
};
```

### テスト後のクリーンアップ

```typescript
afterEach(async () => {
  // テストデータ削除
  await cleanupTestData();
});
```

---

**文書バージョン**: v1.0  
**最終更新**: 2025-11-05
