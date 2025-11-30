# ココシル 技術仕様書・実装ガイド

## 📋 MVP実装範囲

### ✅ 含まれる機能
- ユーザー基本情報入力（名前、生年月日、MBTI、体癖）
- 算命学・動物占い自動算出（Python + CSV）
- 簡易MBTIチェック（不明な場合）
- 進捗管理・状態保存（Zustand）
- フォームバリデーション（React Hook Form + Zod）
- OpenAI APIチャット（ストリーミング対応）
- .mdファイル生成・ダウンロード
- データベース送信（API実装）

### ❌ 将来実装予定
- 詳細な体癖診断システム（さらなる拡張）
- 高度な分析機能（機械学習統合）

### ✅ 実装済み（段階的展開中）
- **ユーザー認証・アカウント管理**：Clerk統合によるオプショナル認証
- **結果の永続化・履歴管理**：認証ユーザー向けサーバー保存
- **管理者ダッシュボード**：JWT + 4桁PIN認証システム

---

## 🔄 管理者ワークフロー

### データ確認・ダウンロード手順

1. **通知受信**: ユーザーがデータ送信完了
2. **管理者サイトアクセス**: `admin.cocoseal.com/download/{downloadId}`
3. **データ確認**: プレビュー表示で内容確認
4. **ダウンロード**: .mdファイルをローカル保存
5. **Claude活用**: ダウンロードしたファイルをClaude チャットに貼り付け
6. **本格分析**: 添付の占い師プロンプトで詳細分析実行

### 管理者向け機能要件

```typescript
// 管理者ダッシュボード表示データ
interface AdminDashboard {
  recentSubmissions: {
    downloadId: string;
    userName: string;
    submittedAt: string;
    categories: string[];
    status: 'new' | 'downloaded' | 'processed';
  }[];
  statistics: {
    totalSubmissions: number;
    todaySubmissions: number;
    popularCategories: string[];
  };
}
```

### Claude連携フロー

1. **管理者**: .mdファイルをダウンロード
2. **管理者**: Claudeの新しいチャットを開始
3. **管理者**: 占い師プロンプト（究極の多角的性格プロファイリング占い師）をコピペ
4. **管理者**: ダウンロードした.mdファイルを添付
5. **Claude**: 添付ファイルを解析し、本格的な性格分析レポートを生成
6. **管理者**: 必要に応じてユーザーにフィードバック

---

## 🔐 Clerk認証統合技術仕様

### 概要
COCOSiLシステムに**Clerk認証**を統合し、ユーザーに診断データの永続保存、履歴閲覧、高度なAI機能へのアクセスを提供します。既存の匿名診断フローを維持しつつ、認証ユーザーに付加価値を提供する**オプトインモデル**を採用します。

### 技術スタック追加

#### Clerk関連パッケージ
```json
{
  "@clerk/nextjs": "^6.15.0",
  "@clerk/localizations": "^2.10.0",
  "svix": "^1.40.0"
}
```

### 環境変数（Clerk）

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/diagnosis
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/diagnosis

# Clerk Webhook
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Cron Job Authentication
CRON_SECRET=randomly_generated_secret_key
```

### middleware.ts 実装

**認証レルム分離**：管理者認証（既存JWT）とClerk認証を完全分離

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

    // 診断ルート: 認証推奨だが必須ではない（匿名診断継続）
    if (isDiagnosisRoute(req)) {
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

```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from '@clerk/localizations'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={jaJP}>
      <html lang="ja">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 認証選択画面コンポーネント

```typescript
// src/ui/features/diagnosis/auth-choice-screen.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store'

export function AuthChoiceScreen() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const setAuthMode = useDiagnosisStore(state => state.setAuthMode)

  const handleCreateAccount = () => {
    setAuthMode('authenticated')
    router.push('/sign-up')
  }

  const handleSignIn = () => {
    setAuthMode('authenticated')
    router.push('/sign-in')
  }

  const handleAnonymous = () => {
    setAuthMode('anonymous')
    router.push('/diagnosis/basic-info')
  }

  // 既にサインイン済みの場合は診断へ直接遷移
  if (isSignedIn) {
    setAuthMode('authenticated')
    router.push('/diagnosis/basic-info')
    return null
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        COCOSiL 診断を始める
      </h1>

      <button
        onClick={handleCreateAccount}
        className="w-full p-4 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
      >
        <div className="flex items-center justify-center space-x-2">
          <span>🔐</span>
          <span>アカウントを作成して始める</span>
        </div>
        <p className="text-sm mt-2 opacity-90">
          → 診断結果を保存・履歴閲覧可能
        </p>
      </button>

      <button
        onClick={handleSignIn}
        className="w-full p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center justify-center space-x-2">
          <span>✅</span>
          <span>サインインして始める</span>
        </div>
        <p className="text-sm mt-2 opacity-90">
          → 既存アカウントで続ける
        </p>
      </button>

      <button
        onClick={handleAnonymous}
        className="w-full p-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors border-2 border-gray-300"
      >
        <div className="flex items-center justify-center space-x-2">
          <span>👤</span>
          <span>匿名で続ける</span>
        </div>
        <p className="text-sm mt-2 text-gray-600">
          → 30日間ブラウザに保存
        </p>
      </button>
    </div>
  )
}
```

### 基本情報フォーム自動入力

```typescript
// src/ui/features/forms/basic-info-form.tsx
import { useUser } from '@clerk/nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function BasicInfoForm() {
  const { user } = useUser()

  // Clerkユーザー情報から自動入力
  const form = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: user?.fullName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      birthDate: user?.publicMetadata?.birthDate as string || '',
      gender: user?.publicMetadata?.gender as string || '',
    }
  })

  // ... 既存フォームロジック
}
```

### Prismaスキーマ拡張

```prisma
// prisma/schema.prisma

model DiagnosisRecord {
  id          String   @id @default(uuid())

  // ユーザー識別
  clerkUserId String?  // Clerk認証ユーザー
  anonymousId String?  // 匿名ユーザー（将来拡張用）

  // 診断データ（JSON形式）
  basicInfo   Json     // 名前、生年月日、性別など
  mbtiResult  Json?    // MBTI診断結果
  taihekiResult Json?  // 体癖診断結果
  fortuneResult Json?  // 算命学診断結果

  // メタデータ
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  expiresAt   DateTime // createdAt + 30日

  // インデックス
  @@index([clerkUserId])
  @@index([expiresAt])
  @@index([createdAt])
}
```

### API実装：診断データ保存

```typescript
// src/app/api/diagnosis/save/route.ts
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { basicInfo, mbtiResult, taihekiResult, fortuneResult } = body

    // 30日後の削除日時を計算
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const record = await db.diagnosisRecord.create({
      data: {
        clerkUserId: userId,
        basicInfo,
        mbtiResult,
        taihekiResult,
        fortuneResult,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      recordId: record.id
    })
  } catch (error) {
    console.error('Save diagnosis error:', error)
    return NextResponse.json(
      { error: 'Failed to save diagnosis' },
      { status: 500 }
    )
  }
}
```

### API実装：診断履歴取得

```typescript
// src/app/api/diagnosis/history/route.ts
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const records = await db.diagnosisRecord.findMany({
      where: {
        clerkUserId: userId,
        expiresAt: { gte: new Date() }, // 削除期限前のみ
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        basicInfo: true,
        mbtiResult: true,
        taihekiResult: true,
        fortuneResult: true,
      },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json(
      { error: 'Failed to get history' },
      { status: 500 }
    )
  }
}
```

### Clerk Webhook実装（30日自動削除）

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!

    if (!WEBHOOK_SECRET) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set')
    }

    const svix = new Webhook(WEBHOOK_SECRET)

    const payload = await request.text()
    const headers = {
      'svix-id': request.headers.get('svix-id')!,
      'svix-timestamp': request.headers.get('svix-timestamp')!,
      'svix-signature': request.headers.get('svix-signature')!,
    }

    let event
    try {
      event = svix.verify(payload, headers)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    if (event.type === 'user.deleted') {
      const userId = event.data.id

      // ユーザーの全診断データを削除
      const result = await db.diagnosisRecord.deleteMany({
        where: { clerkUserId: userId },
      })

      console.log(`Deleted ${result.count} records for user: ${userId}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
```

### Vercel Cron実装（期限切れデータ削除）

```typescript
// src/app/api/cron/delete-expired-diagnoses/route.ts
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Vercel Cronからの認証トークン検証
    const authHeader = request.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()

    // 期限切れレコードを削除
    const result = await db.diagnosisRecord.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    })

    console.log(`Deleted ${result.count} expired diagnosis records`)

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}
```

### Vercel Cron設定

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/delete-expired-diagnoses",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Zustandストア拡張

```typescript
// src/lib/zustand/diagnosis-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DiagnosisStore {
  // 既存フィールド
  basicInfo: BasicInfo | null
  mbti: MBTIResult | null
  taiheki: TaihekiResult | null
  fortune: FortuneResult | null
  progress: ProgressState

  // 新規フィールド（認証関連）
  authMode: 'authenticated' | 'anonymous'
  recordId: string | null // サーバー保存時のレコードID

  // 新規アクション
  setAuthMode: (mode: 'authenticated' | 'anonymous') => void
  saveToServer: () => Promise<void>
  loadFromServer: (recordId: string) => Promise<void>

  // 既存アクション
  setBasicInfo: (info: BasicInfo) => void
  setMBTI: (result: MBTIResult) => void
  setTaiheki: (result: TaihekiResult) => void
  setFortune: (result: FortuneResult) => void
  updateProgress: (progress: ProgressState) => void
  reset: () => void
}

export const useDiagnosisStore = create<DiagnosisStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      basicInfo: null,
      mbti: null,
      taiheki: null,
      fortune: null,
      progress: { completedSteps: [], percentage: 0 },
      authMode: 'anonymous',
      recordId: null,

      // アクション実装
      setAuthMode: (mode) => set({ authMode: mode }),

      saveToServer: async () => {
        const state = get()
        if (state.authMode === 'anonymous') return

        const response = await fetch('/api/diagnosis/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            basicInfo: state.basicInfo,
            mbtiResult: state.mbti,
            taihekiResult: state.taiheki,
            fortuneResult: state.fortune,
          }),
        })

        const data = await response.json()
        if (data.success) {
          set({ recordId: data.recordId })
        }
      },

      loadFromServer: async (recordId) => {
        const response = await fetch(`/api/diagnosis/${recordId}`)
        const data = await response.json()

        set({
          basicInfo: data.basicInfo,
          mbti: data.mbtiResult,
          taiheki: data.taihekiResult,
          fortune: data.fortuneResult,
          recordId: recordId,
        })
      },

      // ... 既存アクション
    }),
    {
      name: 'diagnosis-storage',
      partialize: (state) => ({
        // 認証ユーザーはサーバー保存のため、localStorageには最小限のみ
        authMode: state.authMode,
        recordId: state.recordId,
        // 匿名ユーザーは全データをlocalStorageに保存
        ...(state.authMode === 'anonymous' && {
          basicInfo: state.basicInfo,
          mbti: state.mbti,
          taiheki: state.taiheki,
          fortune: state.fortune,
        }),
      }),
    }
  )
)
```

### セキュリティ考慮事項

#### 認証レルム分離の重要性
- **管理者認証（JWT + 4桁PIN）**と**一般ユーザー認証（Clerk）**は完全独立
- middleware.tsで明確にルーティング分離
- 管理者ルートはClerkミドルウェアをスキップ

#### プライバシーポリシー準拠
- 30日自動削除の2重メカニズム（Webhook + Cron）
- GDPR「忘れられる権利」への対応
- 個人識別情報（PII）の最小化

#### フェイルセーフ設計
- Clerk障害時も匿名診断は継続利用可能
- 診断ルートは認証推奨だが必須ではない
- ネットワークエラー時のlocalStorageフォールバック

---

## 🏗️ プロジェクト構造

```
cocoseal-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # ランディングページ
│   │   ├── input/             # 基本情報入力フロー
│   │   │   ├── name/page.tsx
│   │   │   ├── birthdate/page.tsx
│   │   │   ├── mbti/page.tsx
│   │   │   └── taiheki/page.tsx
│   │   ├── chat/page.tsx      # AIチャット画面
│   │   ├── result/page.tsx    # 完了画面
│   │   └── api/               # API Routes
│   │       ├── fortune-calc/route.ts
│   │       └── submit-data/route.ts
│   ├── components/            # Reactコンポーネント
│   │   ├── forms/            # フォーム関連
│   │   ├── ui/               # 共通UIコンポーネント
│   │   ├── chat/             # チャット関連
│   │   └── progress/         # 進捗管理
│   ├── stores/               # Zustand状態管理
│   │   └── userDataStore.ts
│   ├── lib/                  # ユーティリティ
│   │   ├── validations.ts    # Zodスキーマ
│   │   ├── openai.ts         # OpenAI API設定
│   │   └── fortune-calc/     # 占い計算ロジック
│   ├── types/                # TypeScript型定義
│   └── styles/               # Tailwind CSS
├── public/
│   ├── data/
│   │   └── doubutsu_uranai_essence_lookup_1960_2025.csv
│   └── scripts/
│       └── fortune_calculator_fixed.py
├── docs/                     # ドキュメント
└── package.json
```

---

## 🔧 技術スタック詳細

### Frontend Core
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0"
}
```

### 状態管理・フォーム
```json
{
  "zustand": "^4.4.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

### API・ストリーミング
```json
{
  "openai": "^4.24.0",
  "@ai-sdk/openai": "^0.0.0",
  "ai": "^3.0.0"
}
```

---

## 🎨 Zustand Store設計

### userDataStore.ts
```typescript
interface UserDataState {
  // 基本情報
  name: string;
  birthDate: {
    year: number;
    month: number;
    day: number;
  };
  
  // 占い結果
  fortuneData: {
    age: number;
    zodiac: string;
    animal: string;
    animalDetail: AnimalDetail;
    sixStar: string;
  };
  
  // 性格診断
  mbti: string;
  taiheki: number | null;
  
  // チャット履歴
  chatHistory: ChatMessage[];
  
  // UI状態
  progress: number;
  currentStep: string;
  isLoading: boolean;
  
  // アクション
  updateName: (name: string) => void;
  updateBirthDate: (date: BirthDate) => void;
  setFortuneData: (data: FortuneData) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateProgress: (progress: number) => void;
  reset: () => void;
}
```

---

## 📝 フォームバリデーション（Zod）

### validations.ts
```typescript
import { z } from 'zod';

export const nameSchema = z.object({
  name: z.string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください')
    .regex(/^[ぁ-んァ-ヶ一-龠a-zA-Z\s]+$/, '名前は日本語またはアルファベットで入力してください')
});

export const birthDateSchema = z.object({
  year: z.number()
    .min(1900, '1900年以降を入力してください')
    .max(new Date().getFullYear(), '未来の日付は入力できません'),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31)
}).refine((date) => {
  const { year, month, day } = date;
  const inputDate = new Date(year, month - 1, day);
  return inputDate.getFullYear() === year &&
         inputDate.getMonth() === month - 1 &&
         inputDate.getDate() === day;
}, {
  message: '正しい日付を入力してください'
});

export const mbtiSchema = z.object({
  mbti: z.string()
    .length(4, 'MBTIは4文字で入力してください')
    .regex(/^[EIJFNPST]{4}$/, '正しいMBTI形式で入力してください')
});
```

---

## 🚀 API Routes実装

### /api/admin-submit/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mdContent, metadata, userInfo, chatHistory } = body;
    
    // ダウンロードID生成
    const downloadId = nanoid(12);
    const timestamp = new Date().toISOString();
    
    // 管理者用データ構造
    const adminData = {
      downloadId,
      timestamp,
      userInfo: {
        name: userInfo.name,
        birthDate: userInfo.birthDate,
        fortuneData: userInfo.fortuneData,
        mbti: userInfo.mbti,
        taiheki: userInfo.taiheki
      },
      mdContent,
      chatHistory,
      metadata: {
        sessionId: metadata.sessionId,
        completionTime: timestamp,
        totalMessages: chatHistory.length,
        categories: metadata.categories || []
      }
    };
    
    // データベース専用サイトに送信
    // TODO: 実際のデータベース保存処理
    // await saveToAdminDatabase(adminData);
    
    // 管理者用URL生成
    const adminUrl = `${process.env.ADMIN_SITE_URL}/download/${downloadId}`;
    
    return NextResponse.json({
      success: true,
      downloadId,
      adminUrl,
      message: 'データが正常に送信されました'
    });
    
  } catch (error) {
    console.error('Admin submission error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'データ送信中にエラーが発生しました'
    }, { status: 500 });
  }
}
```

---

## 📄 .mdファイル生成・プレビュー機能

### mdFileGenerator.ts
```typescript
import { UserDataState } from '@/stores/userDataStore';
import { ChatMessage } from '@/types';

export interface GeneratedMdData {
  content: string;
  metadata: {
    sessionId: string;
    generatedAt: string;
    totalMessages: number;
    categories: string[];
  };
}

export const generateMdFile = (
  userData: UserDataState, 
  chatHistory: ChatMessage[]
): GeneratedMdData => {
  const timestamp = new Date().toISOString();
  const sessionId = `session_${Date.now()}`;
  
  const content = `# ココシル 性格分析レポート

## 📊 基本情報
- **お名前**: ${userData.name}
- **生年月日**: ${userData.birthDate.year}年${userData.birthDate.month}月${userData.birthDate.day}日
- **年齢**: ${userData.fortuneData.age}歳
- **星座**: ${userData.fortuneData.zodiac}
- **動物占い**: ${userData.fortuneData.animal}
- **算命学**: ${userData.fortuneData.sixStar}
- **MBTI**: ${userData.mbti}
- **体癖**: ${userData.taiheki || '未回答'}

## 🎯 相談内容・対話履歴

${chatHistory.map((message, index) => {
  const role = message.role === 'user' ? '👤 ユーザー' : '🤖 AI占い師';
  return `### ${role} (${index + 1})
${message.content}
`;
}).join('\n')}

## 📋 セッション情報
- **セッションID**: ${sessionId}
- **生成日時**: ${timestamp}
- **総メッセージ数**: ${chatHistory.length}
- **完了ステータス**: 完了

---
*本レポートは「ココシル」にて生成されました*
`;

  return {
    content,
    metadata: {
      sessionId,
      generatedAt: timestamp,
      totalMessages: chatHistory.length,
      categories: extractCategories(chatHistory)
    }
  };
};

const extractCategories = (chatHistory: ChatMessage[]): string[] => {
  const categories = new Set<string>();
  
  chatHistory.forEach(message => {
    if (message.content.includes('悩み')) categories.add('悩み相談');
    if (message.content.includes('性格')) categories.add('性格分析');
    if (message.content.includes('恋愛')) categories.add('恋愛');
    if (message.content.includes('仕事')) categories.add('仕事');
    if (message.content.includes('人間関係')) categories.add('人間関係');
  });
  
  return Array.from(categories);
};
```

---

## 🔍 プレビュー画面コンポーネント

### PreviewModal.tsx
```typescript
'use client';

import { useState } from 'react';
import { useUserDataStore } from '@/stores/userDataStore';
import { generateMdFile } from '@/lib/mdFileGenerator';
import ReactMarkdown from 'react-markdown';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mdData: GeneratedMdData) => void;
}

export const PreviewModal = ({ isOpen, onClose, onSubmit }: PreviewModalProps) => {
  const userData = useUserDataStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const mdData = generateMdFile(userData, userData.chatHistory);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(mdData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDownload = () => {
    const blob = new Blob([mdData.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cocoseal_report_${userData.name}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📄 生成されたレポートのプレビュー
          </h2>
          <p className="text-gray-600">
            内容をご確認ください。問題なければ送信ボタンを押してください。
          </p>
        </div>
        
        {/* プレビューコンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{mdData.content}</ReactMarkdown>
          </div>
        </div>
        
        {/* フッター */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              📥 ダウンロード
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ✏️ 修正する
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '送信中...' : '✅ 送信する'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 管理者向けダウンロードシステム

### 管理者専用サイト構成案
```
admin.cocoseal.com/
├── /download/{downloadId}     # ダウンロードページ
├── /list                      # データ一覧
└── /analytics                 # 統計情報
```

### 管理者用API設計
```typescript
// GET /admin/download/{downloadId}
export async function GET(
  request: NextRequest,
  { params }: { params: { downloadId: string } }
) {
  try {
    const { downloadId } = params;
    
    // 認証チェック（簡易版）
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // データ取得
    const data = await getAdminData(downloadId);
    
    if (!data) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }
    
    // .mdファイルとしてダウンロード
    return new NextResponse(data.mdContent, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="cocoseal_${downloadId}.md"`
      }
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## 💬 OpenAI APIストリーミング実装

### /api/chat/route.ts
```typescript
import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, userData } = await req.json();
  
  const systemPrompt = `あなたは究極の多角的性格プロファイリング占い師です。
以下のユーザー情報を基に分析してください：
- 名前: ${userData.name}
- 生年月日: ${userData.birthDate}
- 動物占い: ${userData.fortuneData.animal}
- MBTI: ${userData.mbti}
- 体癖: ${userData.taiheki}

温かく親しみやすい口調で、具体的な行動パターンを提示してください。`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

---

## 📱 レスポンシブUI実装例

### Progress Component
```typescript
'use client';

import { useUserDataStore } from '@/stores/userDataStore';

export const ProgressBar = () => {
  const progress = useUserDataStore((state) => state.progress);
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
      <p className="text-sm text-center mt-2 text-gray-600">
        {progress}% 完了
      </p>
    </div>
  );
};
```

### Chat Streaming Component
```typescript
'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { useUserDataStore } from '@/stores/userDataStore';

export const StreamingChat = () => {
  const userData = useUserDataStore();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { userData },
    onFinish: (message) => {
      userData.addChatMessage({
        role: 'assistant',
        content: message.content
      });
    }
  });
  
  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="animate-pulse">入力中...</div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
};
```

---

## 🔒 環境変数設定

### .env.local (開発環境)
```bash
# OpenAI API
OPENAI_API_KEY=sk-xxxxx

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/diagnosis
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/diagnosis
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Admin Authentication (既存JWT)
ADMIN_PASSWORD=1234
ADMIN_SECRET_KEY=admin_secret_key_dev

# Cron Job Authentication
CRON_SECRET=randomly_generated_secret_key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SITE_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://localhost:5432/cocoseal_dev
```

### Vercelデプロイ時環境変数

#### OpenAI
- `OPENAI_API_KEY`: OpenAI APIキー（GPT-4ストリーミング用）

#### Clerk認証
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerkパブリッシャブルキー
- `CLERK_SECRET_KEY`: Clerkシークレットキー
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: サインインURL（`/sign-in`）
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: サインアップURL（`/sign-up`）
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: サインイン後リダイレクト（`/diagnosis`）
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: サインアップ後リダイレクト（`/diagnosis`）
- `CLERK_WEBHOOK_SECRET`: Clerk Webhook署名検証用シークレット

#### 管理者認証（既存JWT）
- `ADMIN_PASSWORD`: 管理者4桁PIN（例: `1234`）
- `ADMIN_SECRET_KEY`: 管理者認証用シークレットキー
- `ADMIN_SITE_URL`: 管理者専用サイトURL（`https://admin.cocoseal.com`）

#### Cron Job
- `CRON_SECRET`: Vercel Cron認証用ランダム秘密鍵

#### アプリケーション
- `NEXT_PUBLIC_APP_URL`: 本番URL（`https://cocoseal.com`）
- `DATABASE_URL`: PostgreSQLデータベース接続URL

---

## 🚀 デプロイ手順

### 1. Vercelプロジェクト作成
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. 環境変数設定
Vercelダッシュボード → Settings → Environment Variables

### 3. 自動デプロイ設定
- GitHub連携
- mainブランチプッシュで自動デプロイ
- Preview環境は全ブランチ

---

## 📊 エラーハンドリング戦略

### フロントエンド
- React Error Boundary
- API エラーのToast表示
- ネットワークエラーのリトライ機能
- フォームバリデーションエラーのリアルタイム表示

### バックエンド
- try-catch による例外処理
- 適切なHTTPステータスコード
- エラーログの出力
- レスポンス型の統一

---

## 🎯 パフォーマンス最適化

### コード分割
```typescript
// 動的インポートによる遅延ロード
const ChatComponent = lazy(() => import('@/components/chat/StreamingChat'));
```

### 画像最適化
```typescript
import Image from 'next/image';

// Next.js Image コンポーネント使用
<Image 
  src="/images/logo.png" 
  alt="ココシル" 
  width={200} 
  height={100}
  priority
/>
```

---

## 📈 実装順序（推奨）

### Phase 1: 基本フロー (1-2週間)
1. プロジェクトセットアップ
2. Zustand Store実装
3. 基本情報入力フォーム
4. 算命学計算API
5. 進捗管理

### Phase 2: チャット機能 (1-2週間)
1. OpenAI API連携
2. ストリーミングチャット
3. 対話フロー実装
4. エラーハンドリング

### Phase 3: データ管理・プレビュー機能 (1-2週間)
1. .mdファイル生成ロジック
2. プレビューモーダル実装
3. ReactMarkdown統合
4. 管理者向け送信API (/api/admin-submit)
5. ダウンロードID生成・管理
6. 完了画面

### Phase 4: 管理者システム (1週間)
1. 管理者専用サイト設計
2. 認証機能（簡易版）
3. ダウンロードAPI実装
4. データ一覧・統計機能
5. エラーハンドリング

### Phase 5: 最適化・テスト (1週間)
1. レスポンシブ対応
2. パフォーマンス最適化
3. テスト実装
4. デプロイ・運用設定

---

## 🧪 テスト戦略

### 単体テスト
- Zustand Store
- フォームバリデーション
- ユーティリティ関数

### 統合テスト
- API Routes
- フォーム送信フロー
- OpenAI API連携

### E2Eテスト
- ユーザージャーニー全体
- 主要フロー動作確認