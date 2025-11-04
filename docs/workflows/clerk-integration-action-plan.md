# Clerk認証統合 - 実装アクションプラン

**プロジェクト**: COCOSiL統合診断システム
**作成日**: 2025-10-28
**実装戦略**: 段階的統合（Phase 1 → Phase 2 → Phase 3）
**推定期間**: Phase 1（2週間）、Phase 2（2週間）、Phase 3（3週間）

---

## 📋 Phase 1: 認証オプション追加（2週間）

**目標**: 診断開始時に認証選択を提供、認証ユーザーはサーバー保存

### Week 1: 基盤構築

#### Day 1-2: 環境構築
```bash
# タスク
□ Clerkアカウント作成 (https://dashboard.clerk.com/)
□ API Key取得（Publishable Key + Secret Key）
□ @clerk/nextjs インストール
□ 環境変数設定

# コマンド
npm install @clerk/nextjs svix

# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
CRON_SECRET=<ランダム生成>

# 検証
npm run dev
→ http://localhost:3000 でエラーなし確認
```

**成果物**:
- ✅ Clerkアカウント + プロジェクト作成
- ✅ 環境変数設定完了
- ✅ 開発サーバー正常起動

---

#### Day 3: ClerkProvider統合
```typescript
// app/layout.tsx 修正

import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk',
        variables: {
          colorPrimary: 'rgb(var(--brand-500))',
          colorText: 'rgb(var(--foreground))',
        }
      }}
    >
      <html lang="ja">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

**検証**:
```bash
npm run dev
→ Clerk DevTools表示確認（開発モード）
→ Console エラーなし確認
```

**成果物**:
- ✅ ClerkProvider統合完了
- ✅ 既存ページ正常表示確認

---

#### Day 4-5: Middleware実装
```typescript
// middleware.ts 作成

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminJWT } from '@/lib/jwt-session'

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/learn/taiheki(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/fortune-calc-v2(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)'
])

export default async function middleware(request: NextRequest) {
  // 管理者ルート: 既存JWT認証
  if (isAdminRoute(request)) {
    return verifyAdminJWT(request)
  }

  // その他: Clerkミドルウェア
  return clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) {
      return NextResponse.next()
    }

    // 診断ルートは認証推奨（必須ではない）
    if (req.nextUrl.pathname.startsWith('/diagnosis')) {
      return NextResponse.next()
    }

    // その他保護ルート
    await auth.protect()
    return NextResponse.next()
  })(request)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

**検証**:
```bash
# テストシナリオ
1. http://localhost:3000/admin → 既存JWT認証動作確認
2. http://localhost:3000/ → 公開ページ表示確認
3. http://localhost:3000/diagnosis → アクセス可能確認（認証なし）
4. http://localhost:3000/learn/taiheki → 公開ページ表示確認
```

**成果物**:
- ✅ middleware.ts実装完了
- ✅ 認証レルム分離動作確認
- ✅ 既存管理者認証保護確認

---

#### Day 6-7: データモデル拡張
```prisma
// prisma/schema.prisma 修正

model DiagnosisRecord {
  id          String   @id @default(uuid())

  // 認証方式識別（新規）
  clerkUserId String?
  anonymousId String?

  // 既存フィールド
  basicInfo   Json
  mbtiResult  Json?
  taihekiResult Json?
  fortuneResult Json?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  expiresAt   DateTime // createdAt + 30日

  isCompleted Boolean  @default(false)
  completedAt DateTime?

  @@index([clerkUserId])
  @@index([expiresAt])
  @@map("diagnosis_records")
}
```

**コマンド**:
```bash
# マイグレーション作成
npx prisma migrate dev --name add_clerk_user_id

# 検証
npx prisma studio
→ DiagnosisRecordテーブルにclerkUserIdフィールド確認
```

**成果物**:
- ✅ Prismaスキーマ更新
- ✅ マイグレーション実行完了
- ✅ データベーススキーマ確認

---

### Week 2: UI実装 & API統合

#### Day 8-10: 認証選択画面実装
```typescript
// app/diagnosis/auth-choice/page.tsx 作成
// ファイル内容は技術仕様書参照
```

**ディレクトリ構成**:
```
src/app/diagnosis/
├── auth-choice/
│   └── page.tsx       # 新規作成
├── basic-info/
│   └── page.tsx       # 既存（後で修正）
├── mbti/
│   └── page.tsx       # 既存
└── taiheki/
    └── page.tsx       # 既存
```

**検証**:
```bash
# テストシナリオ
1. http://localhost:3000/diagnosis/auth-choice 表示確認
2. 「新規登録」→ Clerkモーダル表示確認
3. 「サインイン」→ Clerkモーダル表示確認
4. 「匿名で続行」→ /diagnosis/basic-info?anonymous=true に遷移
```

**成果物**:
- ✅ 認証選択画面UI完成
- ✅ Clerk SignIn/SignUp統合
- ✅ 匿名フロー遷移確認

---

#### Day 11-12: 基本情報フォーム統合
```typescript
// app/diagnosis/basic-info/page.tsx 修正
// Clerk自動入力ロジック追加

'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export default function BasicInfoPage() {
  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const isAnonymous = searchParams.get('anonymous') === 'true'

  useEffect(() => {
    if (isLoaded && user && !isAnonymous) {
      // Clerkから自動入力
      form.setValue('name', `${user.firstName} ${user.lastName}`)
      form.setValue('email', user.emailAddresses[0]?.emailAddress ?? '')

      // publicMetadataから取得
      const birthDate = user.publicMetadata?.birthDate as string
      if (birthDate) form.setValue('birthDate', birthDate)

      const gender = user.publicMetadata?.gender as string
      if (gender) form.setValue('gender', gender)
    }
  }, [isLoaded, user, isAnonymous])

  // 既存フォームロジック...
}
```

**検証**:
```bash
# テストシナリオ
1. 認証後 → 自動入力確認（名前・メール）
2. 匿名 → 手動入力確認
3. バリデーション動作確認
```

**成果物**:
- ✅ Clerk自動入力実装
- ✅ 匿名/認証フロー分岐
- ✅ バリデーション正常動作

---

#### Day 13: Zustand状態管理拡張
```typescript
// lib/zustand/diagnosis-store.ts 修正

interface DiagnosisStore {
  // 既存...

  // 新規: Clerk認証状態
  clerkUserId: string | null
  isAuthenticated: boolean

  setClerkSession: (userId: string | null, isAuthenticated: boolean) => void
  clearSession: () => void
}

// hooks/use-clerk-sync.ts 作成
export function useClerkSync() {
  const { userId, isSignedIn } = useAuth()
  const setClerkSession = useDiagnosisStore(s => s.setClerkSession)

  useEffect(() => {
    setClerkSession(userId ?? null, isSignedIn ?? false)
  }, [userId, isSignedIn, setClerkSession])
}
```

**検証**:
```bash
# React DevTools でZustand状態確認
1. 認証後 → clerkUserId, isAuthenticated: true
2. サインアウト → null, false
```

**成果物**:
- ✅ Zustand拡張完了
- ✅ useClerkSync実装
- ✅ 状態同期動作確認

---

#### Day 14: 診断データ保存API実装
```typescript
// app/api/diagnosis/save/route.ts 作成
// 技術仕様書のコード参照

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/prisma'

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.json()

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const record = await db.diagnosisRecord.create({
    data: {
      clerkUserId: userId,
      basicInfo: data.basicInfo,
      mbtiResult: data.mbtiResult,
      taihekiResult: data.taihekiResult,
      fortuneResult: data.fortuneResult,
      expiresAt,
    },
  })

  return NextResponse.json({ success: true, recordId: record.id })
}
```

**検証**:
```bash
# Postmanテスト
POST http://localhost:3000/api/diagnosis/save
Headers: Authorization: Bearer <Clerk JWT>
Body: { "basicInfo": {...}, ... }

# 期待レスポンス
{ "success": true, "recordId": "uuid..." }

# DB確認
npx prisma studio → DiagnosisRecordに新規レコード確認
```

**成果物**:
- ✅ 診断データ保存API実装
- ✅ Clerk認証チェック動作
- ✅ DB保存動作確認

---

### テスト（Day 15-16）

#### E2Eテスト（Playwright）
```typescript
// tests/e2e/clerk-integration.spec.ts

test('認証ユーザー診断フロー', async ({ page }) => {
  await page.goto('/diagnosis/auth-choice')

  // サインアップ
  await page.click('text=新規登録')
  await page.fill('input[name="emailAddress"]', 'test@example.com')
  await page.fill('input[name="password"]', 'SecurePass123!')
  await page.click('button:has-text("続ける")')

  // 基本情報自動入力確認
  await page.waitForURL('**/diagnosis/basic-info')
  const email = await page.inputValue('input[name="email"]')
  expect(email).toBe('test@example.com')

  // 診断完了
  await page.fill('input[name="birthDate"]', '1990-01-01')
  await page.selectOption('select[name="gender"]', 'male')
  await page.click('button:has-text("次へ")')

  // 結果画面で保存確認
  await page.waitForURL('**/diagnosis/result')
  await expect(page.locator('text=診断結果を保存しました')).toBeVisible()
})

test('匿名ユーザー診断フロー', async ({ page }) => {
  await page.goto('/diagnosis/auth-choice')
  await page.click('text=匿名で続行')

  await page.waitForURL('**/diagnosis/basic-info?anonymous=true')
  await page.fill('input[name="name"]', 'Anonymous User')
  await page.fill('input[name="email"]', 'anon@example.com')

  // ... 診断続行
})
```

**実行**:
```bash
npm run test:e2e

# 期待結果
✓ 認証ユーザー診断フロー (15s)
✓ 匿名ユーザー診断フロー (12s)
```

**成果物**:
- ✅ E2Eテスト実装完了
- ✅ 全テスト合格確認

---

## 📊 Phase 1 完了チェックリスト

### 環境構築
- [ ] Clerkアカウント作成
- [ ] API Key取得・設定
- [ ] `@clerk/nextjs` インストール
- [ ] ClerkProvider統合

### 認証基盤
- [ ] middleware.ts実装（認証レルム分離）
- [ ] 既存JWT認証との共存確認
- [ ] ルートマッチャー定義

### データ層
- [ ] Prismaスキーマ更新（clerkUserId）
- [ ] マイグレーション実行
- [ ] Zustand拡張（Clerkセッション状態）

### UI実装
- [ ] 認証選択画面作成
- [ ] 基本情報フォーム統合（自動入力）
- [ ] レスポンシブ対応

### API実装
- [ ] POST /api/diagnosis/save
- [ ] Clerk認証チェック
- [ ] DB保存ロジック

### テスト
- [ ] E2Eテスト（認証フロー）
- [ ] E2Eテスト（匿名フロー）
- [ ] 統合テスト（API）

### ドキュメント
- [ ] 技術仕様書完成
- [ ] 実装ガイド作成
- [ ] READMEに手順追加

---

## 📈 Phase 2: 診断履歴機能（2週間）

**開始条件**: Phase 1完了後、ユーザーフィードバック収集

### Week 3: 履歴UI実装

#### Day 17-19: ダッシュボードページ作成
```typescript
// app/dashboard/page.tsx

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/prisma'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const records = await db.diagnosisRecord.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div>
      <h1>診断履歴</h1>
      <DiagnosisHistoryList records={records} />
    </div>
  )
}
```

**成果物**:
- ✅ ダッシュボードページ
- ✅ 履歴一覧表示
- ✅ 詳細モーダル

---

#### Day 20-21: 診断履歴API
```typescript
// app/api/diagnosis/history/route.ts
// 技術仕様書参照
```

**成果物**:
- ✅ GET /api/diagnosis/history
- ✅ GET /api/diagnosis/:id
- ✅ ページネーション

---

### Week 4: 比較分析機能

#### Day 22-25: 比較分析UI
```typescript
// app/dashboard/compare/page.tsx
```

**成果物**:
- ✅ 複数診断選択UI
- ✅ 差分計算ロジック
- ✅ 視覚化コンポーネント

---

#### Day 26-27: Phase 2テスト
```bash
npm run test:e2e -- --grep "診断履歴"
```

**成果物**:
- ✅ E2Eテスト完了
- ✅ パフォーマンステスト

---

## 🚀 Phase 3: 高度機能拡張（3週間）

**開始条件**: Phase 2完了、ユーザー採用率 > 20%

### Week 5: AI対話認証必須化

#### Day 28-30: AI対話ページ保護
```typescript
// app/diagnosis/result/ai-chat/page.tsx
// 認証ガード追加
```

**成果物**:
- ✅ AI対話ページ保護
- ✅ 認証プロンプト
- ✅ セッション管理

---

#### Day 31-32: 学習システム進捗保存
```prisma
model LearningProgress {
  id          String   @id @default(uuid())
  clerkUserId String
  chapter     Int
  completed   Boolean
  score       Int?
  createdAt   DateTime @default(now())

  @@index([clerkUserId])
}
```

**成果物**:
- ✅ 進捗データモデル
- ✅ サーバー保存API
- ✅ 進捗同期ロジック

---

### Week 6: Webhook & Cron実装

#### Day 33-35: Clerk Webhook
```typescript
// app/api/webhooks/clerk/route.ts
// 技術仕様書参照
```

**Clerkダッシュボード設定**:
1. Webhooks → Add Endpoint
2. URL: `https://<your-domain>/api/webhooks/clerk`
3. Events: `user.deleted`
4. Save Signing Secret → `.env.local`

**成果物**:
- ✅ Webhook実装
- ✅ ユーザー削除時データ削除
- ✅ エラー処理・リトライ

---

#### Day 36-37: Vercel Cron
```typescript
// app/api/cron/cleanup-expired/route.ts
```

**vercel.json**:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-expired",
    "schedule": "0 0 * * *"
  }]
}
```

**成果物**:
- ✅ Cron Job実装
- ✅ 30日削除ロジック
- ✅ ログ・モニタリング

---

### Week 7: 最終テスト & デプロイ

#### Day 38-40: 統合E2Eテスト
```bash
npm run test:e2e -- --workers=4
```

**テストシナリオ**:
1. 認証フロー（サインアップ → 診断 → 保存）
2. 匿名フロー（診断 → 一時保存）
3. 履歴閲覧（認証ユーザーのみ）
4. 比較分析（2つ以上の診断）
5. AI対話（認証必須）
6. ユーザー削除（Webhook動作）
7. 30日削除（Cron動作）

**成果物**:
- ✅ 全E2Eテスト合格
- ✅ パフォーマンステスト合格

---

#### Day 41-42: セキュリティ監査
```bash
# 脆弱性スキャン
npm audit
npm audit fix

# 依存関係チェック
npm outdated
```

**チェック項目**:
- [ ] XSS対策確認
- [ ] SQL Injection対策（Prisma）
- [ ] CSRF対策（SameSite cookies）
- [ ] Webhook署名検証
- [ ] 環境変数管理（Vercel Secrets）

**成果物**:
- ✅ セキュリティ監査完了
- ✅ 脆弱性修正完了

---

#### Day 43-44: 本番デプロイ
```bash
# ビルド確認
npm run build

# Vercel環境変数設定
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_WEBHOOK_SECRET
vercel env add CRON_SECRET

# デプロイ
vercel --prod
```

**デプロイ後確認**:
1. https://cocosil.vercel.app/ → 正常表示
2. 認証フロー動作確認
3. Webhook動作確認（テストユーザー削除）
4. Cron動作確認（ログ確認）

**成果物**:
- ✅ 本番デプロイ完了
- ✅ 全機能動作確認

---

## 📝 継続的改善

### モニタリング
- [ ] Vercel Analytics有効化
- [ ] Sentry エラートラッキング
- [ ] Clerk Analytics確認

### ユーザーフィードバック
- [ ] 認証採用率モニタリング
- [ ] 匿名 vs 認証ユーザー比率
- [ ] AI対話利用率

### 最適化
- [ ] 認証フローの摩擦削減
- [ ] パフォーマンス最適化
- [ ] UXテスト実施

---

## 🎯 成功指標（KPI）

### Phase 1
- ✅ 認証機能正常動作（エラー率 < 1%）
- ✅ 匿名診断フロー維持（既存機能100%継続）
- ✅ レスポンスタイム影響 < 5%

### Phase 2
- ✅ 認証ユーザー比率 > 20%
- ✅ 履歴閲覧率 > 50%（認証ユーザー内）
- ✅ 比較分析利用率 > 10%

### Phase 3
- ✅ AI対話利用率 > 30%（認証ユーザー内）
- ✅ 30日削除動作100%正常
- ✅ Webhook動作100%正常

---

## 📚 参考資料

### ドキュメント
- [技術仕様書](./clerk-authentication-integration-spec.md)
- [Clerk公式ドキュメント](https://clerk.com/docs)
- [Next.js 14 App Router](https://nextjs.org/docs/app)

### コードリポジトリ
- [Clerk Next.js Quickstart](https://github.com/clerk/clerk-nextjs-app-quickstart)
- [COCOSiL Main Repository](https://github.com/your-org/cocosil)

---

**作成者**: Claude Code
**最終更新**: 2025-10-28
**ステータス**: Phase 1準備完了
