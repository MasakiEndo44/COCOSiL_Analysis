# Supabase + Vercel デプロイメントガイド

このガイドでは、Supabase PostgreSQL データベースを使用した Vercel デプロイメントの完全な手順を説明します。

## ✅ 完了した準備

以下の設定がすでに完了しています：

1. ✅ **Prisma Schema 更新**: `prisma/schema.prisma` が PostgreSQL 用に設定済み
2. ✅ **マイグレーションファイル生成**: `prisma/migrations/20251002_init_postgresql/`
3. ✅ **環境変数設定例更新**: `.env.example` に `DATABASE_URL` 追加

## 🚀 デプロイ手順

### ステップ1: Vercel 環境変数を確認

Vercel Dashboard で以下の環境変数が設定されているか確認：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres` | Production, Preview, Development |
| `ADMIN_PASSWORD` | `5546` (またはお好みの値) | Production, Preview, Development |
| `OPENAI_API_KEY` | あなたの OpenAI API キー | Production, Preview, Development |

**重要**: `DATABASE_URL` の `[PASSWORD]` と `[PROJECT-REF]` を Supabase の実際の値に置き換えてください。

### ステップ2: マイグレーションの適用

Supabase データベースにマイグレーションを適用します。

#### オプションA: ローカルから実行（推奨）

```bash
# ローカルの .env.local に Supabase 接続情報を設定
echo 'DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"' > .env.local

# マイグレーション適用
npx prisma migrate deploy

# 確認
npx prisma studio  # ブラウザで http://localhost:5555 を開く
```

#### オプションB: Supabase SQL Editor から実行

1. Supabase Dashboard → SQL Editor
2. 以下の SQL を実行（`prisma/migrations/20251002_init_postgresql/migration.sql` の内容をコピー）

```sql
-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- 以下、すべてのテーブルとインデックスを実行...
```

### ステップ3: 初期データ（Seed）の投入

管理者アカウントとマスターデータを作成します。

#### オプションA: 初期化 API を使用（推奨）

1. **Vercel に環境変数を追加**:
   ```
   INIT_TOKEN=<32文字以上のランダム文字列>
   ```
   生成方法:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **初期化 API を作成**:

[src/app/api/admin/init/route.ts](src/app/api/admin/init/route.ts) を新規作成:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { initToken } = await request.json();

    // セキュリティトークン確認
    if (initToken !== process.env.INIT_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 既存の admin ユーザーをチェック
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists',
        skipSeed: true
      });
    }

    // Admin ユーザー作成
    const adminPassword = process.env.ADMIN_PASSWORD || '5546';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.adminUser.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      }
    });

    // マスターデータを投入（簡略版、必要に応じて拡張）
    const animals = [
      { animal: '狼', orientation: 'people_oriented', trait: '一匹狼', strength: '独立心が強い', caution: '協調性を意識' },
      { animal: '子守熊', orientation: 'castle_oriented', trait: '面倒見が良い', strength: 'サポート力', caution: '自分の時間も大切に' },
      // ... 他の動物データ
    ];

    for (const animal of animals) {
      await prisma.animalMaster.upsert({
        where: { animal: animal.animal },
        update: {},
        create: animal,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      username: 'admin'
    });

  } catch (error: any) {
    console.error('Init error:', error);
    return NextResponse.json({
      error: 'Initialization failed',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
```

3. **デプロイして初期化を実行**:

```bash
# コミット & プッシュ
git add .
git commit -m "feat: Add Supabase PostgreSQL support and init API"
git push origin main

# Vercel デプロイ完了後、初期化を実行
curl -X POST https://your-app.vercel.app/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"initToken":"your-init-token-here"}'
```

#### オプションB: ローカルから Seed スクリプト実行

```bash
# .env.local に Supabase 接続情報を設定
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
export ADMIN_PASSWORD="5546"

# Seed 実行
node scripts/admin/seed-admin.js

# 確認
npx prisma studio
```

### ステップ4: ログイン確認

1. `https://your-app.vercel.app/admin` にアクセス
2. ログイン情報を入力:
   - Username: `admin`
   - Password: `5546` (または `ADMIN_PASSWORD` で設定した値)

## 🔧 トラブルシューティング

### エラー: "P1001: Can't reach database server"

**原因**: Supabase データベース接続文字列が間違っている

**解決策**:
1. Supabase Dashboard → Settings → Database → Connection string → URI
2. **Mode** が "Transaction" ではなく "Session" になっているか確認
3. パスワードに特殊文字が含まれている場合、URL エンコード:
   ```bash
   # 例: パスワードに # が含まれている場合
   # Before: postgresql://postgres:pass#word@...
   # After:  postgresql://postgres:pass%23word@...
   ```

### エラー: "relation 'admin_users' does not exist"

**原因**: マイグレーションが適用されていない

**解決策**:
```bash
# ローカルから実行
npx prisma migrate deploy

# または、Supabase SQL Editor から migration.sql を実行
```

### エラー: "Invalid `prisma.adminUser.findUnique()` invocation"

**原因**: Prisma Client が再生成されていない

**解決策**:
```bash
npx prisma generate
npm run build
```

### ログインできない（認証エラー）

**原因**: admin ユーザーが作成されていない、またはパスワードが一致しない

**解決策**:
1. Supabase Dashboard → Table Editor → admin_users を確認
2. レコードがない場合、初期化 API を実行
3. パスワードリセット API を使用:
   ```bash
   curl -X POST https://your-app.vercel.app/api/admin/reset-password \
     -H "Content-Type: application/json" \
     -d '{"resetToken":"your-reset-token"}'
   ```

### Vercel ビルドエラー: "DATABASE_URL environment variable not found"

**原因**: ビルド時に `DATABASE_URL` が設定されていない

**解決策**:
1. Vercel Dashboard → Settings → Environment Variables
2. `DATABASE_URL` を **Development** 環境にも追加
3. 再デプロイ

## 📊 データベース管理

### Prisma Studio（ローカル）

```bash
# ローカルから Supabase DB を管理
export DATABASE_URL="postgresql://..."
npx prisma studio
```

ブラウザで http://localhost:5555 を開く

### Supabase Dashboard

Supabase Dashboard → Table Editor でデータを直接確認・編集可能

### バックアップ

Supabase では自動バックアップが有効です：
- **無料プラン**: 7日間のバックアップ保持
- **Pro プラン**: 14日間のバックアップ保持

手動バックアップ:
```bash
# PostgreSQL ダンプ
pg_dump -h db.[PROJECT-REF].supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup.dump

# リストア
pg_restore -h db.[PROJECT-REF].supabase.co \
  -U postgres \
  -d postgres \
  backup.dump
```

## 🔒 セキュリティベストプラクティス

### 1. 接続文字列の保護

- ❌ `.env` ファイルを Git にコミットしない
- ✅ `.env.example` のみコミット
- ✅ Vercel 環境変数で管理

### 2. Supabase Row Level Security (RLS)

管理者データベースには RLS を無効にしてもOK（Next.js API 経由でのみアクセス）

診断結果データベースには RLS を有効化推奨:

```sql
-- RLS を有効化
ALTER TABLE diagnosis_records ENABLE ROW LEVEL SECURITY;

-- ポリシー: API経由のみアクセス許可
CREATE POLICY "API access only" ON diagnosis_records
  USING (auth.role() = 'service_role');
```

### 3. 接続プール制限

Supabase 無料プランの制限:
- 最大接続数: 60
- 同時接続: 15

Vercel Serverless 対策:
```typescript
// src/lib/admin-db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const adminDb = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = adminDb;
```

## 📈 パフォーマンス最適化

### 1. 接続プーリング

Supabase は自動的に PgBouncer を提供:
```
Transaction mode: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres
Session mode: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**推奨**: Serverless 環境では Transaction mode (port 6543) を使用

### 2. インデックス

頻繁に検索されるカラムにインデックスを追加:
```sql
-- 診断記録の検索パフォーマンス向上
CREATE INDEX idx_diagnosis_records_name ON diagnosis_records(name);
CREATE INDEX idx_diagnosis_records_created_at ON diagnosis_records(createdAt DESC);
```

### 3. クエリ最適化

```typescript
// ❌ N+1 クエリ
const records = await prisma.diagnosisRecord.findMany();
for (const record of records) {
  const user = await prisma.adminUser.findUnique({ where: { id: record.userId } });
}

// ✅ include で1クエリに集約
const records = await prisma.diagnosisRecord.findMany({
  include: { user: true }
});
```

## 🎯 次のステップ

1. ✅ マイグレーション適用
2. ✅ 初期データ投入
3. ✅ ログイン確認
4. ⏭️ 管理画面で診断記録を確認
5. ⏭️ パスワードリセット API の削除（セキュリティ）
6. ⏭️ 本番環境での監視設定（Supabase Logs）

## 📚 参考リンク

- [Supabase ドキュメント](https://supabase.com/docs)
- [Prisma + PostgreSQL ガイド](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel 環境変数](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js + Prisma ベストプラクティス](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
