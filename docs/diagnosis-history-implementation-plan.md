# 診断履歴機能 実装計画書

**作成日**: 2025-10-30
**対象**: COCOSiL Phase 2 - 診断履歴機能
**ステータス**: 計画策定完了

---

## エグゼクティブサマリー

認証済みユーザーに診断履歴の閲覧・管理機能を提供し、マーケティングコピーと実装の整合性を確保します。セキュリティファーストのアプローチで、既存の匿名診断フローを保持しつつ、認証ユーザーに付加価値を提供します。

### 主要目標
- ✅ 認証済みユーザーの診断データをデータベースに永続化
- ✅ デバイス間でのデータ同期を実現
- ✅ セキュアな履歴閲覧機能の提供
- ✅ 既存の匿名診断フローとの共存

### 工数見積もり
- **合計**: 27時間（約3.5日）
- **優先度**: 🔴 高（マーケティングコピーとの不整合を解消）

---

## 三位一体分析結果

### Gemini の提案
- ✅ `User` モデル作成 + `DiagnosisRecord` との関連付け
- ✅ Prisma Migrate を使用したスキーマ管理
- ✅ RESTful API 設計（`GET /api/users/me/diagnosis-history`）
- ✅ ページネーション・ソート機能の実装

### o3-low の提案
- ✅ 優先順位は正しいが、インデックス戦略を強化
- ✅ `(clerkUserId, createdAt)` 複合インデックス追加
- ✅ Row-Level Security (RLS) の検討
- ✅ 匿名ユーザーのデータ移行時の競合状態リスクに注意
- ✅ 推奨順序: Schema → Secure Writes → Secure Reads → UI → Migration → Testing

### Codex の提案
- 🔴 **優先順位変更**: API 認証を最優先に
- ✅ 修正優先順位: (1) API auth, (2) schema + migration, (3) GET history API, (4) data backfill, (5) UI, (6) E2E
- ✅ `nullable clerkUserId` で開始 → 後から `NOT NULL` 化
- ✅ Cursor-based ページネーション推奨
- ✅ バックフィル戦略の明確化

### 統合結論
**Codex の指摘が重要**: 既存の `/api/admin/diagnosis-results` にセキュリティギャップがあるため、**API 認証を最優先**に実装すべき。

---

## 📋 実装優先度（修正版）

### Phase 2.1: セキュリティ強化（最優先）
**期間**: 2-3時間
**目的**: 既存のセキュリティギャップを塞ぐ

#### Story 2.1.1: 既存診断保存 API に Clerk 認証を追加
**優先度**: 🔴 Critical
**工数**: 2時間

**タスク:**
1. `/api/admin/diagnosis-results/route.ts` に Clerk 認証チェックを追加
2. 認証済みユーザーのみ保存可能にする
3. 匿名ユーザー用の別エンドポイント検討
4. ユニットテスト追加

**実装例:**
```typescript
// src/app/api/diagnosis/save/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId } = auth();

  // 認証チェック
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized: Please sign in to save diagnosis' },
      { status: 401 }
    );
  }

  const body = await request.json();

  // 診断データを保存（clerkUserId を含める）
  const record = await db.diagnosisRecord.create({
    data: {
      ...body,
      clerkUserId: userId, // Clerk User ID を保存
    }
  });

  return NextResponse.json({ success: true, id: record.id });
}
```

**受入基準:**
- ✅ 認証なしリクエストは 401 を返す
- ✅ 認証済みユーザーは正常に保存できる
- ✅ 既存の匿名フローは別エンドポイントで動作

---

### Phase 2.2: データベーススキーマ拡張
**期間**: 3-4時間
**目的**: ユーザーと診断データの関連付け

#### Story 2.2.1: Prisma スキーマ更新
**優先度**: 🔴 高
**工数**: 1.5時間

**スキーマ設計:**
```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique // Clerk User ID
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  diagnosisRecords DiagnosisRecord[]

  @@map("users")
}

model DiagnosisRecord {
  id                 Int      @id @default(autoincrement())
  sessionId          String?  @unique

  // 🆕 ユーザー関連付け（nullable で開始）
  clerkUserId        String?  // Clerk User ID (直接参照)
  user               User?    @relation(fields: [clerkUserId], references: [clerkId])

  // 既存フィールド
  date               String
  name               String
  birthDate          String
  age                Int
  gender             String
  zodiac             String
  animal             String
  orientation        String
  color              String
  mbti               String
  mainTaiheki        Int
  subTaiheki         Int?
  sixStar            String
  theme              String
  advice             String
  satisfaction       Int
  duration           String
  feedback           String
  reportUrl          String?
  interviewScheduled String?
  interviewDone      String?
  memo               String?
  integratedKeywords String?
  aiSummary          String?
  fortuneColor       String?
  reportVersion      String?
  isIntegratedReport Boolean  @default(false)
  markdownContent    String?
  markdownVersion    String?
  counselingSummary  String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // 🆕 履歴取得用の複合インデックス
  @@index([clerkUserId, createdAt])
  @@map("diagnosis_records")
}
```

**設計のポイント:**
- `clerkUserId` は nullable で開始（既存レコードとの互換性）
- `User` モデルを作成して将来の拡張に備える
- 複合インデックス `(clerkUserId, createdAt)` で履歴取得を高速化

#### Story 2.2.2: データベースマイグレーション実行
**優先度**: 🔴 高
**工数**: 1.5時間

**実行手順:**
```bash
# 1. マイグレーション生成
npx prisma migrate dev --name add_user_diagnosis_history

# 2. マイグレーション確認
# prisma/migrations/[timestamp]_add_user_diagnosis_history/migration.sql を確認

# 3. 本番環境への適用（後続フェーズ）
npx prisma migrate deploy
```

**マイグレーション内容:**
```sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "diagnosis_records"
ADD COLUMN "clerkUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "diagnosis_records_clerkUserId_createdAt_idx" ON "diagnosis_records"("clerkUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "diagnosis_records" ADD CONSTRAINT "diagnosis_records_clerkUserId_fkey" FOREIGN KEY ("clerkUserId") REFERENCES "users"("clerkId") ON DELETE SET NULL ON UPDATE CASCADE;
```

**受入基準:**
- ✅ マイグレーションが正常に完了
- ✅ 既存データに影響がない
- ✅ ロールバック可能

---

### Phase 2.3: 診断履歴 API 実装
**期間**: 4-5時間
**目的**: セキュアな履歴取得・管理機能

#### Story 2.3.1: 診断履歴取得 API
**優先度**: 🔴 高
**工数**: 3時間

**エンドポイント設計:**
```typescript
// src/app/api/diagnosis/history/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(), // Cursor-based pagination
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  // 認証チェック
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // クエリパラメータ検証
  const { searchParams } = new URL(request.url);
  const { limit, cursor, sortOrder } = querySchema.parse({
    limit: searchParams.get('limit'),
    cursor: searchParams.get('cursor'),
    sortOrder: searchParams.get('sortOrder'),
  });

  // 診断履歴取得（Cursor-based pagination）
  const records = await db.diagnosisRecord.findMany({
    where: { clerkUserId: userId },
    take: limit + 1, // +1 for next cursor detection
    cursor: cursor ? { id: parseInt(cursor) } : undefined,
    orderBy: { createdAt: sortOrder },
    select: {
      id: true,
      sessionId: true,
      date: true,
      name: true,
      mbti: true,
      mainTaiheki: true,
      subTaiheki: true,
      zodiac: true,
      animal: true,
      sixStar: true,
      isIntegratedReport: true,
      createdAt: true,
    },
  });

  // Next cursor 判定
  const hasMore = records.length > limit;
  const data = hasMore ? records.slice(0, -1) : records;
  const nextCursor = hasMore ? records[records.length - 1].id.toString() : null;

  return NextResponse.json({
    data,
    pagination: {
      nextCursor,
      hasMore,
    },
  });
}
```

**API 仕様:**
- **認証**: Clerk middleware で保護
- **ページネーション**: Cursor-based（スケーラブル）
- **フィルタリング**: 将来的に日付範囲、診断タイプで拡張可能
- **レスポンス形式**:
```json
{
  "data": [
    {
      "id": 123,
      "sessionId": "abc123",
      "date": "2025-10-30",
      "name": "山田太郎",
      "mbti": "INTJ",
      "mainTaiheki": 5,
      "createdAt": "2025-10-30T12:00:00Z"
    }
  ],
  "pagination": {
    "nextCursor": "124",
    "hasMore": true
  }
}
```

#### Story 2.3.2: 診断詳細取得 API
**優先度**: 🟡 中
**工数**: 1.5時間

```typescript
// src/app/api/diagnosis/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const record = await db.diagnosisRecord.findFirst({
    where: {
      id: parseInt(params.id),
      clerkUserId: userId, // 所有権チェック
    },
  });

  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ data: record });
}
```

**受入基準:**
- ✅ 認証済みユーザーのみアクセス可能
- ✅ 他ユーザーのデータは取得不可（403 Forbidden）
- ✅ Cursor-based pagination で高速動作
- ✅ エラーハンドリングが適切

---

### Phase 2.4: データバックフィル戦略
**期間**: 4-6時間
**目的**: 既存データへのユーザー紐付け

#### Story 2.4.1: バックフィルスクリプト作成
**優先度**: 🟡 中
**工数**: 3時間

**戦略:**
1. **メールアドレスでマッチング**: `DiagnosisRecord.name` と `User.email` を照合
2. **手動確認**: 完全一致しないレコードは管理者が手動で確認
3. **匿名レコード保持**: マッチしないレコードは `clerkUserId = NULL` のまま

**実装:**
```typescript
// scripts/backfill-diagnosis-records.ts
import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

async function backfillDiagnosisRecords() {
  console.log('🔄 Starting diagnosis records backfill...');

  // 1. clerkUserId が NULL のレコードを取得
  const unlinkedRecords = await prisma.diagnosisRecord.findMany({
    where: { clerkUserId: null },
  });

  console.log(`📊 Found ${unlinkedRecords.length} unlinked records`);

  let matched = 0;
  let failed = 0;

  for (const record of unlinkedRecords) {
    try {
      // 2. Clerk でメールアドレスから User を検索
      const users = await clerkClient.users.getUserList({
        emailAddress: [record.email], // DiagnosisRecord に email フィールドがある場合
      });

      if (users.length === 1) {
        // 3. マッチした場合、clerkUserId を更新
        await prisma.diagnosisRecord.update({
          where: { id: record.id },
          data: { clerkUserId: users[0].id },
        });
        matched++;
        console.log(`✅ Matched record ${record.id} to user ${users[0].id}`);
      } else {
        failed++;
        console.log(`⚠️  No unique match for record ${record.id}`);
      }
    } catch (error) {
      failed++;
      console.error(`❌ Error processing record ${record.id}:`, error);
    }
  }

  console.log(`\n✅ Backfill complete: ${matched} matched, ${failed} failed`);
}

backfillDiagnosisRecords()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**実行手順:**
```bash
# 開発環境でテスト
NODE_ENV=development npx tsx scripts/backfill-diagnosis-records.ts

# 本番環境で実行（慎重に）
NODE_ENV=production npx tsx scripts/backfill-diagnosis-records.ts
```

#### Story 2.4.2: 匿名データ移行機能（サインアップ時）
**優先度**: 🟡 中
**工数**: 2.5時間

**クライアント側実装:**
```typescript
// src/hooks/use-migrate-anonymous-diagnosis.ts
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';

export function useMigrateAnonymousDiagnosis() {
  const { isSignedIn, userId } = useAuth();
  const store = useDiagnosisStore();

  useEffect(() => {
    async function migrateData() {
      // 1. サインイン直後で、localStorage に匿名データがある場合
      if (isSignedIn && userId && store.authMode === 'anonymous') {
        const diagnosisData = store.getUserData();

        if (!diagnosisData) return;

        try {
          // 2. サーバーに匿名データを送信
          const response = await fetch('/api/diagnosis/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              diagnosis: diagnosisData,
              sessionId: store.sessionId,
            }),
          });

          if (response.ok) {
            // 3. 成功したら localStorage をクリア
            store.clearAll();
            console.log('✅ Anonymous diagnosis migrated successfully');
          }
        } catch (error) {
          console.error('❌ Failed to migrate anonymous diagnosis:', error);
        }
      }
    }

    migrateData();
  }, [isSignedIn, userId, store]);
}
```

**サーバー側実装:**
```typescript
// src/app/api/diagnosis/migrate/route.ts
export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { diagnosis, sessionId } = await request.json();

  // 重複チェック（同じ sessionId が既に存在する場合はスキップ）
  const existing = await db.diagnosisRecord.findUnique({
    where: { sessionId },
  });

  if (existing) {
    return NextResponse.json({
      message: 'Already migrated',
      duplicate: true
    });
  }

  // 診断データを保存
  await db.diagnosisRecord.create({
    data: {
      ...diagnosis,
      clerkUserId: userId,
      sessionId,
    },
  });

  return NextResponse.json({ success: true });
}
```

**受入基準:**
- ✅ サインアップ時に自動でデータ移行
- ✅ 重複を防止（sessionId でチェック）
- ✅ 移行失敗時もユーザー体験を損なわない

---

### Phase 2.5: UI/UX 実装
**期間**: 8-10時間
**目的**: 直感的な履歴閲覧インターフェース

#### Story 2.5.1: 診断履歴ダッシュボードページ
**優先度**: 🔴 高
**工数**: 5時間

**ページ構成:**
```
/app/dashboard/page.tsx
/app/dashboard/history/page.tsx
```

**実装:**
```typescript
// src/app/dashboard/history/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DiagnosisHistoryList } from '@/ui/features/history/diagnosis-history-list';

export default async function DiagnosisHistoryPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container-responsive py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          診断履歴
        </h1>
        <p className="mt-2 text-muted-foreground">
          これまでの診断結果を確認できます
        </p>
      </div>

      <DiagnosisHistoryList userId={userId} />
    </div>
  );
}
```

#### Story 2.5.2: 診断履歴リストコンポーネント
**優先度**: 🔴 高
**工数**: 3時間

```typescript
// src/ui/features/history/diagnosis-history-list.tsx
'use client';

import { useState, useEffect } from 'react';
import { DiagnosisHistoryCard } from './diagnosis-history-card';
import { Button } from '@/components/ui/button';

interface DiagnosisHistoryListProps {
  userId: string;
}

export function DiagnosisHistoryList({ userId }: DiagnosisHistoryListProps) {
  const [history, setHistory] = useState([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    const params = new URLSearchParams({ limit: '20' });
    if (cursor) params.set('cursor', cursor);

    const response = await fetch(`/api/diagnosis/history?${params}`);
    const data = await response.json();

    setHistory((prev) => [...prev, ...data.data]);
    setCursor(data.pagination.nextCursor);
    setHasMore(data.pagination.hasMore);
    setLoading(false);
  }

  if (loading && history.length === 0) {
    return <div>読み込み中...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          まだ診断履歴がありません
        </p>
        <Button className="mt-4" onClick={() => window.location.href = '/diagnosis'}>
          診断を始める
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record) => (
        <DiagnosisHistoryCard key={record.id} record={record} />
      ))}

      {hasMore && (
        <Button
          onClick={fetchHistory}
          disabled={loading}
          className="w-full"
        >
          {loading ? '読み込み中...' : 'さらに読み込む'}
        </Button>
      )}
    </div>
  );
}
```

#### Story 2.5.3: 診断履歴カードコンポーネント
**優先度**: 🟡 中
**工数**: 2時間

```typescript
// src/ui/features/history/diagnosis-history-card.tsx
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface DiagnosisHistoryCardProps {
  record: {
    id: number;
    date: string;
    name: string;
    mbti: string;
    mainTaiheki: number;
    zodiac: string;
    animal: string;
    createdAt: string;
  };
}

export function DiagnosisHistoryCard({ record }: DiagnosisHistoryCardProps) {
  return (
    <Link href={`/diagnosis/results/${record.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{formatDate(record.createdAt)}</span>
            <span className="text-sm text-muted-foreground">
              {record.name}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">MBTI:</span> {record.mbti}
            </div>
            <div>
              <span className="font-semibold">体癖:</span> {record.mainTaiheki}種
            </div>
            <div>
              <span className="font-semibold">星座:</span> {record.zodiac}
            </div>
            <div>
              <span className="font-semibold">動物:</span> {record.animal}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

**受入基準:**
- ✅ 診断履歴が時系列で表示される
- ✅ Infinite scroll / ページネーションが動作
- ✅ 空状態のハンドリングが適切
- ✅ レスポンシブデザイン対応

---

### Phase 2.6: テスト戦略
**期間**: 4-5時間
**目的**: 品質保証と回帰防止

#### Story 2.6.1: ユニットテスト
**優先度**: 🟡 中
**工数**: 2時間

```typescript
// src/__tests__/api/diagnosis/history.test.ts
describe('GET /api/diagnosis/history', () => {
  it('should return 401 for unauthenticated users', async () => {
    const response = await fetch('/api/diagnosis/history');
    expect(response.status).toBe(401);
  });

  it('should return user diagnosis history', async () => {
    // Mock Clerk auth
    // Mock database response
    // Verify response format
  });

  it('should not return other users data', async () => {
    // Verify authorization
  });
});
```

#### Story 2.6.2: E2E テスト
**優先度**: 🟡 中
**工数**: 2.5時間

```typescript
// tests/e2e/diagnosis-history.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Diagnosis History', () => {
  test('authenticated user can view history', async ({ page }) => {
    // 1. ログイン
    await page.goto('/sign-in');
    // ... Clerk login flow

    // 2. 履歴ページにアクセス
    await page.goto('/dashboard/history');

    // 3. 履歴が表示されることを確認
    await expect(page.locator('text=診断履歴')).toBeVisible();
  });

  test('anonymous user migrates data on sign-up', async ({ page }) => {
    // 1. 匿名で診断実行
    await page.goto('/diagnosis');
    // ... Complete diagnosis flow

    // 2. サインアップ
    await page.goto('/sign-up');
    // ... Complete sign-up

    // 3. 履歴ページで過去の診断が表示されることを確認
    await page.goto('/dashboard/history');
    await expect(page.locator('.diagnosis-history-card')).toBeVisible();
  });
});
```

**受入基準:**
- ✅ ユニットテストカバレッジ > 80%
- ✅ E2E テストが全て PASS
- ✅ セキュリティテスト（認証・認可）が完了

---

## 📊 実装ロードマップ

### マイルストーン 1: セキュリティ強化（Week 1, Day 1）
- [x] Story 2.1.1: 既存 API に Clerk 認証追加
- **デリバラブル**: 認証保護された診断保存 API

### マイルストーン 2: データ基盤整備（Week 1, Day 1-2）
- [x] Story 2.2.1: Prisma スキーマ更新
- [x] Story 2.2.2: マイグレーション実行
- **デリバラブル**: ユーザー紐付け可能な DB スキーマ

### マイルストーン 3: API 実装（Week 1, Day 2-3）
- [x] Story 2.3.1: 履歴取得 API
- [x] Story 2.3.2: 診断詳細取得 API
- **デリバラブル**: セキュアな履歴 API

### マイルストーン 4: データ移行（Week 1, Day 3）
- [x] Story 2.4.1: バックフィルスクリプト
- [x] Story 2.4.2: サインアップ時の自動移行
- **デリバラブル**: 既存データの整合性確保

### マイルストーン 5: UI/UX（Week 1, Day 4）
- [x] Story 2.5.1: 履歴ダッシュボード
- [x] Story 2.5.2: 履歴リストコンポーネント
- [x] Story 2.5.3: 履歴カードコンポーネント
- **デリバラブル**: ユーザーフレンドリーな履歴 UI

### マイルストーン 6: テスト・品質保証（Week 1, Day 4-5）
- [x] Story 2.6.1: ユニットテスト
- [x] Story 2.6.2: E2E テスト
- **デリバラブル**: 品質保証完了

---

## 🚨 リスクと軽減策

### リスク 1: 既存データの整合性
**影響度**: 🔴 高
**確率**: 🟡 中

**軽減策:**
- マイグレーション前にバックアップ取得
- Staging 環境でテスト実施
- ロールバックプラン策定

### リスク 2: Clerk サービス障害
**影響度**: 🟡 中
**確率**: 🟢 低

**軽減策:**
- 匿名診断フローは Clerk 非依存で継続動作
- フェイルセーフ設計（認証失敗時は匿名モードにフォールバック）

### リスク 3: パフォーマンス劣化
**影響度**: 🟡 中
**確率**: 🟡 中

**軽減策:**
- 複合インデックス `(clerkUserId, createdAt)` で最適化
- Cursor-based pagination で大量データに対応
- 必要に応じてキャッシュ層追加（Redis）

### リスク 4: データ移行時の競合
**影響度**: 🟡 中
**確率**: 🟡 中

**軽減策:**
- `sessionId` の UNIQUE 制約で重複防止
- localStorage に移行済みフラグ設定
- サーバー側でべき等性を保証

---

## 📈 成功指標

### 技術指標
- ✅ API レスポンスタイム < 200ms
- ✅ ユニットテストカバレッジ > 80%
- ✅ E2E テスト成功率 100%
- ✅ セキュリティスキャン 0 Critical issues

### ビジネス指標
- ✅ マーケティングコピーとの整合性確保
- ✅ サインアップ率向上（履歴機能訴求により）
- ✅ ユーザー満足度向上
- ✅ サポート問い合わせ削減

---

## 📝 次のアクション

### 即座に実行
1. ✅ 実装計画書のレビュー承認
2. ✅ 開発環境のセットアップ確認
3. ✅ Phase 2.1（セキュリティ強化）の実装開始

### Phase 2 完了後
1. ✅ Phase 3（高度機能）の計画策定
2. ✅ ユーザーフィードバック収集
3. ✅ パフォーマンスモニタリング

---

**承認者**: _______________
**承認日**: _______________
