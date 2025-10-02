# 🔴 緊急: Vercel デプロイでログインできない問題の解決

## 現象
- `admin123` でログイン不可
- `5546` でログイン不可
- エラーメッセージ: 「認証処理でエラーが発生しました」または「認証に失敗しました」

## 根本原因

**SQLite は Vercel Serverless 環境で動作しません**

### なぜ両方のパスワードでログインできないのか？

1. **データベースファイルが永続化されない**
   - Vercel Serverless 環境では `/tmp` のみが書き込み可能
   - `prisma/admin.db` ファイルは各リクエストでリセットされる
   - または、ビルド時に含まれていても書き込み不可

2. **認証フローが失敗する理由**
   ```
   ログインリクエスト
   ↓
   Prisma Client が admin.db にアクセス試行
   ↓
   ファイルが存在しない / 読み取り専用エラー
   ↓
   adminUser.findUnique() が null または例外
   ↓
   「認証処理でエラーが発生しました」
   ```

3. **パスワードリセット API も無効**
   - データベースが存在しないため、リセット API も動作不可

## 解決策

### 🚀 即座の解決（5分）: Supabase PostgreSQL（無料）

最も早く動作させる方法です。

#### ステップ1: Supabase アカウント作成

1. https://supabase.com/ にアクセス
2. "Start your project" をクリック
3. GitHub アカウントでサインアップ（無料）

#### ステップ2: プロジェクト作成

1. "New Project" をクリック
2. プロジェクト名: `cocosil-admin`
3. Database Password: 安全なパスワードを設定（メモする）
4. Region: `Northeast Asia (Tokyo)` を選択
5. "Create new project" をクリック（約2分待機）

#### ステップ3: 接続文字列を取得

1. プロジェクト作成完了後、"Settings" → "Database"
2. "Connection string" セクションで "URI" タブを選択
3. 接続文字列をコピー（例）:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. `[YOUR-PASSWORD]` を実際のパスワードに置き換える

#### ステップ4: Vercel 環境変数設定

1. Vercel Dashboard → あなたのプロジェクト → Settings → Environment Variables
2. 新しい環境変数を追加:
   ```
   Name: DATABASE_URL
   Value: postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres
   ```
3. 適用環境: **Production, Preview, Development** すべてにチェック
4. "Save" をクリック

#### ステップ5: schema.prisma を更新

ローカル環境で以下を実行:

```bash
cd /Users/masaki/Documents/Projects/COCOSiL_Analysis
```

[prisma/schema.prisma](prisma/schema.prisma) を編集:
```prisma
datasource db {
  provider = "postgresql"  // "sqlite" から変更
  url      = env("DATABASE_URL")  // "file:./admin.db" から変更
}
```

#### ステップ6: マイグレーション生成とデプロイ

```bash
# ローカルで環境変数設定（テスト用）
export DATABASE_URL="postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"

# マイグレーション生成
npx prisma migrate dev --name init_production

# Git にコミット
git add .
git commit -m "Fix: Migrate from SQLite to PostgreSQL for Vercel compatibility"
git push origin main
```

#### ステップ7: Vercel で確認

1. Vercel が自動的に再デプロイ（約1-2分）
2. デプロイ完了後、`https://your-app.vercel.app/admin` にアクセス
3. ログイン:
   - Username: `admin`
   - Password: `5546` （環境変数 `ADMIN_PASSWORD` で設定した値）

**重要**: 初回デプロイ後、データベースが空なので seed スクリプトを実行する必要があります。

#### ステップ8: Seed スクリプト実行（Vercel CLI 使用）

ローカルから Vercel の本番環境でコマンドを実行:

```bash
# Vercel CLI インストール（未インストールの場合）
npm install -g vercel

# Vercel にログイン
vercel login

# プロジェクトにリンク
vercel link

# 本番環境で seed スクリプト実行
vercel env pull .env.production
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" node scripts/admin/seed-admin.js
```

または、簡易的に API エンドポイントから初期化:

**オプション: 初期化 API を作成**

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
    const existing = await prisma.adminUser.findUnique({
      where: { username: 'admin' }
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists'
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

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
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

Vercel 環境変数に追加:
```
INIT_TOKEN=your-secure-init-token-here
```

初期化実行:
```bash
curl -X POST https://your-app.vercel.app/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"initToken":"your-secure-init-token-here"}'
```

---

### 🏆 推奨（長期）: Vercel Postgres

Vercel の公式 PostgreSQL サービスで、より統合されたエクスペリエンス。

#### 料金
- **Hobby**: 無料（60時間のコンピュート、256MB ストレージ）
- **Pro**: $20/月（100時間コンピュート、512MB ストレージ）

#### セットアップ

1. **Vercel Dashboard**:
   - Storage → Create Database → Postgres
   - プロジェクト選択: あなたの COCOSiL プロジェクト
   - Database Name: `cocosil-admin`
   - Region: Tokyo または最も近いリージョン

2. **自動設定**:
   - Vercel が自動的に `DATABASE_URL` などの環境変数を設定
   - プロジェクトに自動的にリンク

3. **マイグレーション**:
   ```bash
   # schema.prisma は Supabase と同じ設定を使用
   npx prisma migrate deploy
   ```

4. **Seed 実行**:
   ```bash
   # Vercel CLI または上記の初期化 API を使用
   ```

---

## トラブルシューティング

### Q: マイグレーション実行時に「テーブルが既に存在する」エラー

A: データベースをリセットしてから実行:
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

### Q: 「P1001: Can't reach database server」エラー

A: 接続文字列を確認:
1. パスワードに特殊文字が含まれている場合、URL エンコードが必要
2. Supabase の "Connection pooling" ではなく "Direct connection" を使用
3. ファイアウォールで 5432 ポートが開いているか確認

### Q: Seed スクリプトが「Admin user already exists」

A: パスワードリセット API を使用:
```bash
curl -X POST https://your-app.vercel.app/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken":"your-reset-token"}'
```

### Q: ローカル環境でも PostgreSQL を使いたい

A: Docker で PostgreSQL を起動:
```bash
docker run --name cocosil-postgres \
  -e POSTGRES_PASSWORD=localpassword \
  -e POSTGRES_DB=cocosil \
  -p 5432:5432 \
  -d postgres:15

# .env.local に追加
DATABASE_URL="postgresql://postgres:localpassword@localhost:5432/cocosil"
```

---

## なぜ SQLite が動作しないのか？

### Vercel Serverless の制約

| 項目 | ローカル開発 | Vercel Serverless |
|------|-------------|------------------|
| ファイルシステム | 読み書き可能 | `/tmp` のみ書き込み可 |
| データ永続化 | ✅ 可能 | ❌ 不可（関数終了で削除） |
| SQLite | ✅ 動作 | ❌ 永続化されない |
| PostgreSQL | ✅ 動作 | ✅ 動作（外部接続） |

### SQLite の問題点

1. **ファイルベース**: データベースファイルがローカルに必要
2. **書き込み不可**: Vercel の本番環境は読み取り専用
3. **一時的**: `/tmp` に作成してもリクエスト終了で削除

### PostgreSQL の利点

1. **ネットワーク接続**: ファイルシステム不要
2. **永続化**: 外部サーバーでデータ保持
3. **スケーラブル**: 複数の Serverless 関数から同時接続可能

---

## 参考ドキュメント

- [VERCEL_BUILD_ERROR_FIX.md](docs/VERCEL_BUILD_ERROR_FIX.md) - SQLite 問題の詳細
- [VERCEL_DEPLOYMENT_GUIDE.md](docs/VERCEL_DEPLOYMENT_GUIDE.md) - 完全なデプロイガイド
- [PASSWORD_RESET_GUIDE.md](PASSWORD_RESET_GUIDE.md) - パスワードリセット手順

---

## まとめ

✅ **即座の解決**: Supabase PostgreSQL（無料、5分）
✅ **長期推奨**: Vercel Postgres（統合、有料/無料プランあり）
❌ **SQLite**: Vercel Serverless では動作不可

**次のステップ**: 上記の「即座の解決」セクションに従って、Supabase をセットアップしてください。
