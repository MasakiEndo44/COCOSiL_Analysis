# Clerk認証統合 - 技術仕様書

**プロジェクト**: COCOSiL（ココシル）統合診断システム
**作成日**: 2025-10-28
**ステータス**: 要件確定完了
**実装フェーズ**: Phase 1 準備中

## エグゼクティブサマリー

COCOSiLシステムに**Clerk認証**を段階的に統合し、ユーザーに診断データの永続保存、履歴閲覧、高度なAI機能へのアクセスを提供します。既存の匿名診断フローとプライバシーファースト設計を維持しつつ、認証ユーザーに付加価値を提供する**オプトインモデル**を採用します。

### 主要方針
- ✅ **既存システム影響最小化**: 管理者認証（JWT + 4桁PIN）は完全維持
- ✅ **プライバシーファースト継続**: 匿名診断フロー継続、30日自動削除ポリシー堅持
- ✅ **段階的価値提供**: Phase 1（認証オプション）→ Phase 2（履歴）→ Phase 3（高度機能）
- ✅ **技術負債最小化**: Clerkベストプラクティスに準拠、保守性の高い設計

---

## 目次
1. [要件定義](#要件定義)
2. [アーキテクチャ設計](#アーキテクチャ設計)
3. [データモデル](#データモデル)
4. [API設計](#api設計)
5. [ユーザーフロー](#ユーザーフロー)
6. [実装フェーズ](#実装フェーズ)
7. [セキュリティ・プライバシー](#セキュリティプライバシー)
8. [テスト戦略](#テスト戦略)
9. [デプロイメント](#デプロイメント)

---

## 要件定義

### 機能要件

#### FR-1: 認証オプション提供
- 診断開始時に「アカウント作成」「サインイン」「匿名で続行」の3択を提供
- 匿名ユーザーは既存フロー通り診断可能（変更なし）
- 認証ユーザーは診断データをサーバー保存

#### FR-2: 基本情報フォーム統合
- Clerkサインイン済みユーザーは基本情報（名前・メール）を自動入力
- 生年月日・性別はClerk `publicMetadata` から取得（存在する場合）
- 匿名ユーザーは手動入力（現状維持）

#### FR-3: 診断データ永続化（認証ユーザーのみ）
- 認証ユーザーの診断データはPrisma DBに保存
- `clerkUserId` でデータ紐付け
- 30日後に自動削除（Vercel Cron + Webhook）

#### FR-4: 匿名診断継続
- 認証なしでも全機能利用可能
- 診断データはlocalStorageに保存（現行方式）
- 30日後にクライアント側で自動削除

#### FR-5: 管理者認証分離
- `/admin/*` ルートは既存JWT + 4桁PIN認証を継続
- Clerk認証とは完全に独立したレルム
- middleware.tsで認証方式を分岐

### 非機能要件

#### NFR-1: パフォーマンス
- 認証チェックのオーバーヘッド < 50ms
- 既存診断フローのレスポンスタイムへの影響 < 5%

#### NFR-2: プライバシー
- GDPR、CCPA準拠
- 30日自動削除ポリシーの堅持
- 個人識別情報（PII）の最小化

#### NFR-3: 可用性
- 認証サービス障害時も匿名診断は継続利用可能
- フェイルセーフ設計（Clerk障害 → 匿名フローにフォールバック）

#### NFR-4: 保守性
- Clerkベストプラクティスに準拠
- 既存コードベースへの変更は最小限
- TypeScript型安全性の維持

---

## アーキテクチャ設計

### システム全体図

```
┌─────────────────────────────────────────────────────────────┐
│                    COCOSiL + Clerk統合                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14 App Router)                          │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ ランディング  │ 認証選択     │ 診断フロー   │ 管理画面     │ │
│  │ (公開)      │ (Clerk UI)  │ (保護可能)  │ (既存JWT)   │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Middleware Layer                                           │
│  ┌─────────────────────┬─────────────────────────────────┐ │
│  │ /admin/* →          │ その他 →                         │ │
│  │ 既存JWT検証          │ Clerk認証（オプショナル）          │ │
│  └─────────────────────┴─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                │
│  ┌──────────────────────┬──────────────────────────────┐  │
│  │ 診断状態 + Clerkセッション │ 学習進捗 + 認証状態      │  │
│  └──────────────────────┴──────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                  │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ 診断API      │ Clerk        │ 管理者API   │ Webhook     │ │
│  │ (auth任意)  │ Webhook      │ (既存JWT)   │ (30日削除)  │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ Clerk       │ Prisma DB   │ localStorage│ Vercel Cron │ │
│  │ (ユーザー)   │ (診断データ) │ (匿名診断)  │ (削除Job)   │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 認証レルム分離

#### middleware.ts 設計

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminJWT } from '@/lib/jwt-session'

// ルートマッチャー定義
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/learn/taiheki(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/fortune-calc-v2(.*)',
  '/api/public(.*)'
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)'
])

const isDiagnosisRoute = createRouteMatcher([
  '/diagnosis(.*)',
  '/api/diagnosis(.*)'
])

export default async function middleware(request: NextRequest) {
  // 管理者ルート: 既存JWT認証（Clerkをスキップ）
  if (isAdminRoute(request)) {
    return verifyAdminJWT(request)
  }

  // その他: Clerkミドルウェア
  return clerkMiddleware(async (auth, req) => {
    // 公開ルートは認証不要
    if (isPublicRoute(req)) {
      return NextResponse.next()
    }

    // 診断ルート: 認証推奨だが必須ではない
    if (isDiagnosisRoute(req)) {
      const { userId } = await auth()

      // 認証済みならそのまま通過
      if (userId) {
        return NextResponse.next()
      }

      // 未認証でも診断は可能（匿名フロー）
      // クライアント側で認証選択画面を表示
      return NextResponse.next()
    }

    // その他の保護ルート: 認証必須
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

### ClerkProvider統合

#### app/layout.tsx

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'COCOSiL - 統合診断システム',
  description: '体癖理論・MBTI・算命学・動物占いを統合した包括的な人間理解プラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk', // Tailwind 4互換性
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

### 認証状態の統合（Zustand + Clerk）

#### lib/zustand/diagnosis-store.ts（拡張）

```typescript
// lib/zustand/diagnosis-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DiagnosisStore {
  // 既存フィールド
  sessionId: string
  basicInfo: BasicInfo | null
  mbti: MBTIResult | null
  taiheki: TaihekiResult | null
  fortune: FortuneResult | null
  progress: ProgressState

  // 新規: Clerk認証状態
  clerkUserId: string | null
  isAuthenticated: boolean

  // アクション
  setClerkSession: (userId: string | null, isAuthenticated: boolean) => void
  clearSession: () => void
}

export const useDiagnosisStore = create<DiagnosisStore>()(
  persist(
    (set, get) => ({
      // 既存実装...

      // 新規: Clerk認証状態管理
      clerkUserId: null,
      isAuthenticated: false,

      setClerkSession: (userId, isAuthenticated) =>
        set({ clerkUserId: userId, isAuthenticated }),

      clearSession: () =>
        set({
          clerkUserId: null,
          isAuthenticated: false,
          // 診断データもクリア
          basicInfo: null,
          mbti: null,
          taiheki: null,
          fortune: null,
        }),
    }),
    {
      name: 'diagnosis-storage',
      // clerkUserIdはlocalStorageに保存しない（セキュリティ）
      partialize: (state) => ({
        sessionId: state.sessionId,
        basicInfo: state.basicInfo,
        mbti: state.mbti,
        taiheki: state.taiheki,
        fortune: state.fortune,
        progress: state.progress,
        // clerkUserId, isAuthenticated は除外
      }),
    }
  )
)
```

#### カスタムフック: useClerkSync

```typescript
// hooks/use-clerk-sync.ts
'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store'

/**
 * Clerkセッション状態とZustandストアを同期
 */
export function useClerkSync() {
  const { userId, isSignedIn } = useAuth()
  const setClerkSession = useDiagnosisStore(s => s.setClerkSession)

  useEffect(() => {
    setClerkSession(userId ?? null, isSignedIn ?? false)
  }, [userId, isSignedIn, setClerkSession])
}
```

---

## データモデル

### Prismaスキーマ拡張

```prisma
// prisma/schema.prisma

// 既存のモデルに追加

model DiagnosisRecord {
  id          String   @id @default(uuid())

  // 認証方式の識別
  clerkUserId String?  // Clerk認証ユーザー
  anonymousId String?  // 匿名ユーザー（将来的な移行用）

  // 診断データ（既存）
  basicInfo   Json     // { name, email, birthDate, gender }
  mbtiResult  Json?    // { type, scores, confidence }
  taihekiResult Json?  // { primaryType, secondaryType, scores }
  fortuneResult Json?  // { age, westernZodiac, animalCharacter, sixStar }

  // メタデータ
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  expiresAt   DateTime // createdAt + 30日

  // 診断完了状態
  isCompleted Boolean  @default(false)
  completedAt DateTime?

  // リレーション
  chatSessions ChatSession[]

  @@index([clerkUserId])
  @@index([expiresAt])
  @@index([createdAt])
  @@map("diagnosis_records")
}

model ChatSession {
  id               String   @id @default(uuid())
  diagnosisRecordId String
  diagnosisRecord  DiagnosisRecord @relation(fields: [diagnosisRecordId], references: [id], onDelete: Cascade)

  messages         Json     // ChatMessage[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([diagnosisRecordId])
  @@map("chat_sessions")
}

// マイグレーションコマンド
// npx prisma migrate dev --name add_clerk_user_id
```

### TypeScript型定義

```typescript
// types/index.ts（既存に追加）

export interface DiagnosisRecordDB {
  id: string
  clerkUserId: string | null
  anonymousId: string | null
  basicInfo: BasicInfo
  mbtiResult: MBTIResult | null
  taihekiResult: TaihekiResult | null
  fortuneResult: FortuneResult | null
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  isCompleted: boolean
  completedAt: Date | null
}

export interface CreateDiagnosisRecordInput {
  clerkUserId?: string
  basicInfo: BasicInfo
  mbtiResult?: MBTIResult
  taihekiResult?: TaihekiResult
  fortuneResult?: FortuneResult
}
```

---

## API設計

### 新規APIエンドポイント

#### 1. 診断データ保存API

**エンドポイント**: `POST /api/diagnosis/save`
**認証**: Clerk（オプショナル）
**説明**: 診断データをサーバーに保存

```typescript
// app/api/diagnosis/save/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { z } from 'zod'

const saveDiagnosisSchema = z.object({
  basicInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    birthDate: z.string(),
    gender: z.enum(['male', 'female', 'other']),
  }),
  mbtiResult: z.object({}).optional(),
  taihekiResult: z.object({}).optional(),
  fortuneResult: z.object({}).optional(),
})

export async function POST(request: Request) {
  try {
    // Clerk認証チェック（オプショナル）
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = saveDiagnosisSchema.parse(body)

    // 30日後の有効期限を設定
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

    return NextResponse.json({
      success: true,
      recordId: record.id
    })
  } catch (error) {
    console.error('診断データ保存エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### 2. 診断履歴取得API

**エンドポイント**: `GET /api/diagnosis/history`
**認証**: Clerk（必須）
**説明**: 認証ユーザーの過去診断履歴を取得

```typescript
// app/api/diagnosis/history/route.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const records = await db.diagnosisRecord.findMany({
      where: {
        clerkUserId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // 最新10件
    })

    return NextResponse.json({
      success: true,
      records
    })
  } catch (error) {
    console.error('診断履歴取得エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### 3. Clerk Webhook（ユーザー削除）

**エンドポイント**: `POST /api/webhooks/clerk`
**認証**: Clerk Webhook署名検証
**説明**: Clerkユーザー削除時に診断データを即時削除

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import type { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set')
  }

  // Webhook署名を取得
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Webhook署名検証
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook検証エラー:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // イベントタイプ処理
  if (evt.type === 'user.deleted') {
    const { id: userId } = evt.data

    try {
      // ユーザーの診断データを削除
      await db.diagnosisRecord.deleteMany({
        where: {
          clerkUserId: userId,
        },
      })

      console.log(`Deleted diagnosis records for user: ${userId}`)
    } catch (error) {
      console.error('診断データ削除エラー:', error)
      return NextResponse.json(
        { error: 'Failed to delete diagnosis data' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ success: true })
}
```

#### 4. 30日削除Cron Job

**エンドポイント**: `GET /api/cron/cleanup-expired`
**認証**: Vercel Cron Secret
**説明**: 30日経過した診断データを自動削除

```typescript
// app/api/cron/cleanup-expired/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

export async function GET(request: Request) {
  // Vercel Cron認証
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const now = new Date()

    // 有効期限切れのレコードを削除
    const result = await db.diagnosisRecord.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    })

    console.log(`Deleted ${result.count} expired diagnosis records`)

    return NextResponse.json({
      success: true,
      deletedCount: result.count
    })
  } catch (error) {
    console.error('期限切れデータ削除エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
```

---

## ユーザーフロー

### 診断開始フロー

```
┌──────────────┐
│ ランディング  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ 認証選択画面          │
│ - アカウント作成      │
│ - サインイン          │
│ - 匿名で続行          │
└──────┬───────────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼ 匿名             ▼ 新規            ▼ 既存
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 基本情報入力  │  │ Clerk        │  │ Clerk        │
│ (手動)       │  │ サインアップ  │  │ サインイン    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │                 ▼                 │
       │          ┌──────────────┐         │
       │          │ 基本情報      │         │
       │          │ (自動入力)    │         │
       │          └──────┬───────┘         │
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ MBTI診断      │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ 体癖診断      │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ 統合結果表示  │
                  │ - 匿名: 一時  │
                  │ - 認証: 保存  │
                  └──────────────┘
```

### コンポーネント実装

#### 認証選択画面

```typescript
// app/diagnosis/auth-choice/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/ui/components/ui/button'
import { Card } from '@/ui/components/ui/card'

export default function AuthChoicePage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          診断を開始しましょう
        </h1>

        <div className="grid gap-6">
          {/* 認証オプション */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              アカウントを作成して結果を保存
            </h2>
            <ul className="mb-4 space-y-2 text-muted-foreground">
              <li>✓ 診断結果を30日間保存</li>
              <li>✓ 過去の診断履歴を閲覧</li>
              <li>✓ 複数回診断の比較分析</li>
              <li>✓ AI対話カウンセリング利用</li>
            </ul>
            <div className="flex gap-4">
              <SignUpButton mode="modal" redirectUrl="/diagnosis/basic-info">
                <Button size="lg" className="flex-1">
                  新規登録
                </Button>
              </SignUpButton>
              <SignInButton mode="modal" redirectUrl="/diagnosis/basic-info">
                <Button size="lg" variant="secondary" className="flex-1">
                  サインイン
                </Button>
              </SignInButton>
            </div>
          </Card>

          {/* 匿名オプション */}
          <Card className="p-6 border-muted">
            <h2 className="text-xl font-semibold mb-4">
              匿名で診断を続行
            </h2>
            <ul className="mb-4 space-y-2 text-muted-foreground">
              <li>✓ アカウント不要で即座に開始</li>
              <li>✓ 診断結果は端末に一時保存</li>
              <li>• 30日後に自動削除されます</li>
              <li>• 履歴機能は利用できません</li>
            </ul>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/diagnosis/basic-info?anonymous=true')}
            >
              匿名で続行
            </Button>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          いずれの方法でも、個人データは30日後に自動削除されます。
        </p>
      </div>
    </div>
  )
}
```

#### 基本情報フォーム（Clerk統合）

```typescript
// app/diagnosis/basic-info/page.tsx
'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { basicInfoSchema } from '@/lib/data/schemas'
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store'
import { useRouter, useSearchParams } from 'next/navigation'

export default function BasicInfoPage() {
  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const isAnonymous = searchParams.get('anonymous') === 'true'
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: '',
      email: '',
      birthDate: '',
      gender: '',
    }
  })

  // Clerkユーザー情報から自動入力
  useEffect(() => {
    if (isLoaded && user && !isAnonymous) {
      form.setValue('name', `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim())
      form.setValue('email', user.emailAddresses[0]?.emailAddress ?? '')

      // publicMetadataから生年月日を取得
      const birthDate = user.publicMetadata?.birthDate as string
      if (birthDate) {
        form.setValue('birthDate', birthDate)
      }

      const gender = user.publicMetadata?.gender as string
      if (gender) {
        form.setValue('gender', gender)
      }
    }
  }, [isLoaded, user, isAnonymous, form])

  const onSubmit = async (data: any) => {
    // Zustand storeに保存
    useDiagnosisStore.getState().setBasicInfo(data)

    // 次のステップへ
    router.push('/diagnosis/mbti')
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* フォーム実装（既存コード） */}
        {!isAnonymous && user && (
          <p className="text-sm text-muted-foreground mb-4">
            アカウント情報から自動入力されています
          </p>
        )}
        {/* ... */}
      </form>
    </div>
  )
}
```

---

## 実装フェーズ

### Phase 1: 認証オプション追加（2週間）

**目標**: 診断開始時に認証選択を提供、認証ユーザーはサーバー保存

#### タスク

1. **環境構築**（2日）
   - [ ] Clerkアカウント作成、API Key取得
   - [ ] `@clerk/nextjs` インストール
   - [ ] 環境変数設定（`.env.local`）
   - [ ] ClerkProviderをapp/layout.tsxに統合

2. **Middleware実装**（3日）
   - [ ] middleware.ts作成、認証レルム分離
   - [ ] 既存JWT検証との共存確認
   - [ ] ルートマッチャー定義
   - [ ] テスト（/admin保護、/diagnosis任意）

3. **認証UI実装**（4日）
   - [ ] 認証選択画面作成（`/diagnosis/auth-choice`）
   - [ ] Clerk SignIn/SignUp統合
   - [ ] 匿名続行フロー実装
   - [ ] レスポンシブ対応

4. **データモデル拡張**（2日）
   - [ ] Prismaスキーマ更新（`clerkUserId`追加）
   - [ ] マイグレーション実行
   - [ ] Zustand store拡張（Clerkセッション状態）
   - [ ] useClerkSync フック作成

5. **基本情報フォーム統合**（3日）
   - [ ] Clerk自動入力ロジック実装
   - [ ] publicMetadata読み取り
   - [ ] 匿名/認証フロー分岐
   - [ ] バリデーション調整

6. **診断データ保存API**（3日）
   - [ ] POST /api/diagnosis/save 実装
   - [ ] Clerk認証チェック
   - [ ] Prisma DB保存ロジック
   - [ ] エラーハンドリング

7. **テスト**（3日）
   - [ ] E2Eテスト（認証フロー）
   - [ ] E2Eテスト（匿名フロー）
   - [ ] 統合テスト（API）
   - [ ] パフォーマンステスト

**デリバラブル**:
- ✅ 認証選択画面
- ✅ Clerk統合（SignIn/SignUp）
- ✅ 診断データサーバー保存（認証ユーザーのみ）
- ✅ 匿名診断フロー継続

---

### Phase 2: 診断履歴機能（2週間）

**目標**: 認証ユーザーは過去診断を閲覧、複数回診断を比較可能

#### タスク

1. **履歴表示UI**（5日）
   - [ ] `/dashboard` ページ作成
   - [ ] 診断履歴一覧コンポーネント
   - [ ] 詳細モーダル
   - [ ] 比較分析UI

2. **診断履歴API**（3日）
   - [ ] GET /api/diagnosis/history
   - [ ] GET /api/diagnosis/:id
   - [ ] ページネーション実装

3. **比較分析機能**（4日）
   - [ ] 複数診断の選択UI
   - [ ] 差分計算ロジック
   - [ ] 視覚化コンポーネント

4. **テスト**（2日）
   - [ ] E2Eテスト
   - [ ] パフォーマンステスト

---

### Phase 3: 高度機能拡張（3週間）

**目標**: AI対話カウンセリング認証必須化、学習進捗保存

#### タスク

1. **AI対話認証必須化**（5日）
   - [ ] AI対話ページ保護
   - [ ] 認証プロンプト表示
   - [ ] セッション管理改善

2. **学習システム進捗保存**（5日）
   - [ ] 進捗データモデル
   - [ ] サーバー保存API
   - [ ] 進捗同期ロジック

3. **Webhook実装**（3日）
   - [ ] Clerk user.deleted webhook
   - [ ] 診断データ即時削除
   - [ ] エラー処理・リトライ

4. **30日削除Cron**（2日）
   - [ ] Vercel Cron設定
   - [ ] cleanup-expired API実装
   - [ ] ログ・モニタリング

5. **最終テスト**（5日）
   - [ ] 統合E2Eテスト
   - [ ] セキュリティ監査
   - [ ] パフォーマンス最適化

---

## セキュリティ・プライバシー

### セキュリティ対策

#### 1. 認証・認可
- ✅ Clerk JWT検証（自動）
- ✅ 管理者JWT検証（既存）
- ✅ Webhook署名検証（Svix）
- ✅ Cron Secret認証

#### 2. データ保護
- ✅ 個人情報の暗号化（DB at-rest）
- ✅ HTTPS通信（Vercel標準）
- ✅ CORS設定（Next.js middleware）
- ✅ CSPヘッダー（next.config.js）

#### 3. 脆弱性対策
- ✅ SQL Injection防止（Prisma ORM）
- ✅ XSS対策（Next.js標準）
- ✅ CSRF対策（SameSite cookies）
- ✅ レート制限（Vercel Edge Config）

### プライバシーコンプライアンス

#### GDPR準拠
- ✅ **データ最小化**: 必要最小限のデータのみ収集
- ✅ **同意取得**: 診断開始時にプライバシーポリシー同意
- ✅ **アクセス権**: ユーザーは自身のデータにアクセス可能
- ✅ **削除権**: 30日自動削除 + Clerkアカウント削除で即時削除
- ✅ **データポータビリティ**: JSON形式でエクスポート可能

#### 30日削除ポリシー
1. **Webhook削除**: Clerkユーザー削除時に即時実行
2. **Cron削除**: 毎日0時（UTC）にexpiresAt < now() を削除
3. **クライアント削除**: localStorage自動期限切れ

---

## テスト戦略

### ユニットテスト

```typescript
// __tests__/lib/clerk-sync.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useClerkSync } from '@/hooks/use-clerk-sync'
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store'

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}))

describe('useClerkSync', () => {
  it('should sync Clerk session to Zustand store', async () => {
    const mockUseAuth = require('@clerk/nextjs').useAuth
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      isSignedIn: true,
    })

    renderHook(() => useClerkSync())

    await waitFor(() => {
      const state = useDiagnosisStore.getState()
      expect(state.clerkUserId).toBe('user_123')
      expect(state.isAuthenticated).toBe(true)
    })
  })
})
```

### 統合テスト

```typescript
// __tests__/api/diagnosis/save.test.ts
import { POST } from '@/app/api/diagnosis/save/route'
import { auth } from '@clerk/nextjs/server'

jest.mock('@clerk/nextjs/server')

describe('POST /api/diagnosis/save', () => {
  it('should save diagnosis data for authenticated user', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_123' })

    const request = new Request('http://localhost/api/diagnosis/save', {
      method: 'POST',
      body: JSON.stringify({
        basicInfo: { name: 'Test User', email: 'test@example.com' },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.recordId).toBeDefined()
  })

  it('should return 401 for unauthenticated user', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: null })

    const request = new Request('http://localhost/api/diagnosis/save', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

### E2Eテスト（Playwright）

```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Clerk Authentication Flow', () => {
  test('should allow user to sign up and complete diagnosis', async ({ page }) => {
    // ランディングページ
    await page.goto('/')
    await page.click('text=診断を始める')

    // 認証選択
    await page.waitForURL('**/diagnosis/auth-choice')
    await page.click('text=新規登録')

    // Clerk SignUp（モーダル）
    await page.fill('input[name="emailAddress"]', 'test@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.click('button:has-text("続ける")')

    // 基本情報（自動入力確認）
    await page.waitForURL('**/diagnosis/basic-info')
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toHaveValue('test@example.com')

    // 診断フロー続行
    await page.fill('input[name="birthDate"]', '1990-01-01')
    await page.selectOption('select[name="gender"]', 'male')
    await page.click('button:has-text("次へ")')

    // MBTI診断
    await page.waitForURL('**/diagnosis/mbti')
    // ... 診断ロジック

    // 結果画面で保存確認
    await page.waitForURL('**/diagnosis/result')
    await expect(page.locator('text=診断結果を保存しました')).toBeVisible()
  })

  test('should allow anonymous diagnosis', async ({ page }) => {
    await page.goto('/')
    await page.click('text=診断を始める')

    // 匿名選択
    await page.waitForURL('**/diagnosis/auth-choice')
    await page.click('text=匿名で続行')

    // 基本情報（手動入力）
    await page.waitForURL('**/diagnosis/basic-info?anonymous=true')
    await page.fill('input[name="name"]', 'Anonymous User')
    await page.fill('input[name="email"]', 'anon@example.com')

    // ... 診断続行
  })
})
```

---

## デプロイメント

### 環境変数設定

**Vercel環境変数**:
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# 既存
OPENAI_API_KEY=sk-...
ADMIN_PASSWORD=1234
JWT_SECRET=...

# Cron
CRON_SECRET=... # ランダム文字列

# Database
DATABASE_URL=...
```

### Vercel Cron設定

**vercel.json**:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-expired",
    "schedule": "0 0 * * *"
  }]
}
```

### Clerkダッシュボード設定

1. **Webhook設定**
   - URL: `https://cocosil.vercel.app/api/webhooks/clerk`
   - Events: `user.deleted`
   - Signing Secret: `.env.local` に保存

2. **認証設定**
   - Email/Password: 有効化
   - OAuth Providers: Google, GitHub（オプション）
   - MFA: 有効化推奨

3. **セッション設定**
   - Session lifetime: 7日
   - Inactivity timeout: 30分

---

## まとめ

### 主要成果物

1. ✅ **認証選択画面** - アカウント作成 vs 匿名選択
2. ✅ **Clerk統合** - middleware、ClerkProvider、認証フック
3. ✅ **データモデル拡張** - clerkUserId、30日削除対応
4. ✅ **診断データ保存API** - 認証ユーザーのサーバー保存
5. ✅ **Webhook実装** - ユーザー削除時の即時削除
6. ✅ **Cron Job** - 30日経過データの自動削除

### 技術的メリット

- ✅ **既存システム保護**: 管理者認証は完全分離、影響ゼロ
- ✅ **プライバシーファースト**: 匿名診断継続、30日削除堅持
- ✅ **段階的価値提供**: Phase 1→2→3で認証インセンティブを訴求
- ✅ **保守性**: Clerkベストプラクティス、TypeScript型安全性
- ✅ **拡張性**: Phase 2（履歴）、Phase 3（高度機能）への明確なパス

### 次のステップ

**推奨**: **Phase 1から開始**

Phase 1完了後、ユーザーフィードバックを収集し、Phase 2の優先順位を調整します。

---

**作成者**: Claude Code
**レビュー**: 要ユーザー承認
**実装開始予定**: Phase 1承認後
