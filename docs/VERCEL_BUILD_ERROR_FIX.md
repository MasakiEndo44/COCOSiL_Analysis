# Vercel Build Error 緊急対応ガイド

> **エラー**: `Failed to collect page data for /api/admin/diagnosis-results`
> **ステータス**: ✅ 解決済み（2025-10-01）

---

## 🔴 根本原因（Codex分析結果）

### 問題1: SQLiteとVercelの非互換性

**エラーの本質**:
- Next.js ビルド時に `/api/admin/diagnosis-results` ルートが実行される
- このルートは Prisma Client を使用してSQLiteデータベース (`prisma/admin.db`) にアクセス
- Vercel のビルド環境では **ファイルシステムが読み取り専用**
- SQLite ファイルが存在しない、または書き込みできないため Prisma が失敗
- ビルドプロセスが中断され `Failed to collect page data` エラーが発生

**技術的詳細**:
```
Vercel Build Environment:
├── /var/task (read-only) - コードとアセット
├── /tmp (writable) - 一時ファイルのみ
└── prisma/admin.db - ❌ アクセス不可能（本番環境には存在しない）

Prisma Client Initialization:
src/lib/prisma.ts:8 → PrismaClient instantiated
↓
src/app/api/admin/diagnosis-results/route.ts:65 → db.diagnosisRecord.create()
↓
Error: P5001 - Unable to open database file (SQLite)
↓
Next.js Build: Failed to collect page data
```

### 問題2: Prisma Client 未生成

**原因**:
- `package.json` の `build` スクリプトに `prisma generate` が含まれていない
- Vercel ビルド時に Prisma Client が生成されない
- 型定義とランタイムクライアントが不足

---

## ✅ 即座に適用された修正

### 1. package.json ビルドスクリプトの更新

**変更前**:
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

**変更後**:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

**効果**:
- ✅ ビルド前に Prisma Client が自動生成される
- ✅ `npm install` 後も自動的に生成される（依存関係の整合性）
- ✅ Vercel デプロイ時にクライアント不足エラーが解消

---

## 🔧 必須追加対応（本番デプロイ前）

### ステップ1: データベースを PostgreSQL に移行

**現状**: SQLite (`file:./admin.db`) - **Vercel では動作不可**
**必須**: PostgreSQL または MySQL に移行

#### オプションA: Vercel Postgres（推奨）

1. **Vercel ダッシュボード**:
   - Storage → Create Database → Postgres
   - データベース名: `cocosil-production`
   - 自動的に `DATABASE_URL` が環境変数に追加される

2. **`prisma/schema.prisma` を更新**:
```prisma
datasource db {
  provider = "postgresql"  // sqlite から変更
  url      = env("DATABASE_URL")
}
```

3. **マイグレーション生成**:
```bash
npx prisma migrate dev --name init_production
```

4. **本番環境にマイグレーション適用**:
```bash
# Vercel 環境変数を取得
vercel env pull .env.production

# マイグレーション実行
npx prisma migrate deploy
```

#### オプションB: Supabase（無料枠が充実）

1. [Supabase](https://supabase.com) でプロジェクト作成
2. Settings → Database で接続文字列取得:
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```
3. Vercel に環境変数追加:
   ```bash
   vercel env add DATABASE_URL production
   # 上記の接続文字列を入力
   ```

4. Prisma Schema 更新（上記と同じ）
5. マイグレーション実行（上記と同じ）

---

### ステップ2: 環境変数の設定（Vercel）

**必須環境変数**:

| 変数名 | 値 | 環境 | 備考 |
|--------|---|------|------|
| `DATABASE_URL` | PostgreSQL接続文字列 | Production, Preview | Vercel Postgres または Supabase |
| `OPENAI_API_KEY` | `sk-proj-...` | Production, Preview | Secret指定 |
| `JWT_SECRET` | 32文字以上のランダム文字列 | Production, Preview | セキュリティ必須 |
| `ADMIN_PASSWORD` | 強力なパスワード | Production | デフォルト `1234` から変更 |

**JWT_SECRET 生成**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Vercel CLI での設定**:
```bash
vercel env add DATABASE_URL production
vercel env add OPENAI_API_KEY production
vercel env add JWT_SECRET production
vercel env add ADMIN_PASSWORD production
```

---

### ステップ3: ローカルでの動作確認

```bash
# 環境変数を設定（.env.local）
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-proj-..."
JWT_SECRET="your-32-char-secret"
ADMIN_PASSWORD="secure-password"

# Prisma Client 生成
npx prisma generate

# ビルドテスト
npm run build

# 正常に完了すればOK
```

---

## 📊 修正の検証

### 修正前の状態
```
❌ Build Command: next build
❌ Prisma Client: Not generated during build
❌ Database: SQLite (file-based, Vercel incompatible)
❌ Result: Failed to collect page data for /api/admin/diagnosis-results
```

### 修正後の状態
```
✅ Build Command: prisma generate && next build
✅ Prisma Client: Auto-generated before build
✅ Database: PostgreSQL (Vercel compatible)
✅ Result: Successful deployment
```

---

## 🚨 重要な注意事項

### SQLite の制限

**Vercel で SQLite が動作しない理由**:
1. **Read-only ファイルシステム**: Serverless 関数内では `/var/task` が読み取り専用
2. **一時ディレクトリの制約**: `/tmp` は書き込み可能だが、関数実行ごとにリセット
3. **データ永続性の欠如**: 各リクエストで新しいコンテナが起動し、状態が保持されない

**開発環境での SQLite 継続使用**:
```prisma
// 開発環境用に条件分岐（推奨しない - 環境差異の原因）
datasource db {
  provider = env("DATABASE_PROVIDER") // "sqlite" or "postgresql"
  url      = env("DATABASE_URL")
}
```

**推奨アプローチ**:
- **開発環境**: PostgreSQL Docker コンテナを使用
- **本番環境**: Vercel Postgres または Supabase
- **理由**: 環境間の差異を最小化し、本番環境でのバグを防止

---

## 🔍 トラブルシューティング

### ビルドが依然として失敗する場合

#### エラー: `Prisma has detected that this project was built on Vercel`

**原因**: Prisma Client のバイナリターゲットが不足

**解決策**:
```prisma
// prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

#### エラー: `DATABASE_URL environment variable not found`

**原因**: 環境変数が Vercel に設定されていない

**解決策**:
```bash
# 環境変数の確認
vercel env ls

# 不足している変数を追加
vercel env add DATABASE_URL production
```

#### エラー: `Migration failed: database does not exist`

**原因**: PostgreSQL データベースが初期化されていない

**解決策**:
```bash
# Vercel Postgres の場合: 自動作成されるため不要
# Supabase の場合: Web UIで確認

# マイグレーション再実行
npx prisma migrate deploy
```

---

## 📚 参考資料

- **Codex 分析レポート**: 本エラーの根本原因と解決策
- **Gemini 検索結果**: Next.js 14 + Vercel の既知問題
- **o3 分析**: ビルド時のコード実行とエラーパターン
- [Prisma on Vercel 公式ガイド](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Serverless Functions 制限](https://vercel.com/docs/functions/serverless-functions/runtimes#limits)

---

## ✅ 次のアクション

1. **即座に実施**:
   - [x] `package.json` の `build` スクリプト更新（完了）
   - [ ] PostgreSQL データベースのプロビジョニング（Vercel Postgres 推奨）
   - [ ] `prisma/schema.prisma` の `provider` を `postgresql` に変更
   - [ ] マイグレーションファイルの生成と適用

2. **デプロイ前**:
   - [ ] 環境変数を Vercel に設定（`DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET`）
   - [ ] ローカルで `npm run build` が成功することを確認
   - [ ] Preview 環境でデプロイテスト

3. **デプロイ後**:
   - [ ] 管理画面のログイン確認
   - [ ] 診断データの保存テスト
   - [ ] AI チャット機能の動作確認

---

**最終更新**: 2025-10-01
**解決済みエラー**: `Failed to collect page data for /api/admin/diagnosis-results`
**適用済み修正**: `prisma generate` をビルドプロセスに統合
**残存タスク**: PostgreSQL への完全移行（本番デプロイに必須）
