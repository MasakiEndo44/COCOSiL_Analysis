# Supabase デプロイ実行手順（即実行可能版）

**前提**: Vercel UIで環境変数（DATABASE_URL, ADMIN_PASSWORD等）は設定済み

---

## ステップ1: ローカル環境でSupabaseに接続

### 1-1. SupabaseのDATABASE_URLを取得

Supabaseダッシュボード → Project Settings → Database → Connection string → URI

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### 1-2. ローカルに.env.localファイルを作成

```bash
# プロジェクトルートで実行
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
ADMIN_PASSWORD="5546"
OPENAI_API_KEY="your_openai_api_key_here"
EOF
```

⚠️ `[PROJECT-REF]`と`[YOUR-PASSWORD]`を実際の値に置き換えてください

### 1-3. 依存関係のインストール

```bash
npm install
```

---

## ステップ2: Prismaクライアント生成

```bash
npx prisma generate
```

**期待される出力**:
```
✔ Generated Prisma Client (v5.x.x) to ./node_modules/@prisma/client
```

---

## ステップ3: マイグレーション適用（データベーステーブル作成）

```bash
npx prisma migrate deploy
```

**期待される出力**:
```
1 migration found in prisma/migrations
Applying migration `20251002_init_postgresql`
The following migration(s) have been applied:

migrations/
  └─ 20251002_init_postgresql/
    └─ migration.sql

All migrations have been successfully applied.
```

### 3-1. マイグレーション状態確認

```bash
npx prisma migrate status
```

**期待される出力**:
```
Database schema is up to date!
```

---

## ステップ4: 初期データ投入（Seed実行）

### 4-1. 管理者ユーザーとマスターデータの投入

```bash
node scripts/admin/seed-admin.js
```

**期待される出力**:
```
[Seed] Admin user seeded: admin
[Seed] Master data seeded successfully
[Seed] - animal_master: 60 records
[Seed] - zodiac_master: 12 records
[Seed] - mbti_master: 16 records
[Seed] - taiheki_master: 12 records
[Seed] - six_star_master: 12 records
[Seed] Seeding completed successfully!
```

### 4-2. 管理者ユーザー確認

```bash
node scripts/admin/check-admin.js
```

**期待される出力**:
```
Admin users:
- username: admin
- role: admin
- createdAt: 2025-10-02T...
- lastLogin: null
✅ Admin user exists
```

---

## ステップ5: Supabaseダッシュボードでテーブル確認

1. Supabaseダッシュボードを開く
2. **Table Editor** → 以下のテーブルが存在することを確認

```
✅ admin_users (1件)
✅ animal_master (60件)
✅ zodiac_master (12件)
✅ mbti_master (16件)
✅ taiheki_master (12件)
✅ six_star_master (12件)
✅ system_config (1件以上)
✅ diagnosis_records (0件)
```

---

## ステップ6: ローカルでログインテスト

### 6-1. 開発サーバー起動

```bash
npm run dev
```

### 6-2. ブラウザでアクセス

```
http://localhost:3000/admin
```

### 6-3. ログイン情報入力

- **ユーザー名**: `admin`
- **パスワード**: `5546` (ADMIN_PASSWORDに設定した値)

✅ ログイン成功 → ダッシュボードが表示される

---

## ステップ7: Vercelに再デプロイ

### 7-1. 変更をGitにコミット（既に完了している場合はスキップ）

```bash
git add .
git commit -m "Migrate to PostgreSQL (Supabase)"
git push origin main
```

### 7-2. Vercelで自動デプロイ確認

Vercelダッシュボード → Deployments → 最新のビルドが **Success** になることを確認

### 7-3. ビルドログ確認ポイント

```
✓ Generating Prisma Client
✓ Compiled successfully
```

エラーが出る場合:
- `Prisma schema validation failed` → schema.prismaの構文エラー
- `DATABASE_URL is not set` → Vercel環境変数の設定ミス

---

## ステップ8: 本番環境でログインテスト

### 8-1. 本番URLにアクセス

```
https://your-project.vercel.app/admin
```

### 8-2. ログイン情報入力

- **ユーザー名**: `admin`
- **パスワード**: `5546` (Vercel環境変数のADMIN_PASSWORD)

✅ ログイン成功 → ダッシュボードが表示される

---

## トラブルシューティング

### ❌ ステップ3で「Migration failed」エラー

**原因**: DATABASE_URLが正しくない、またはSupabaseへの接続失敗

**対処**:
```bash
# 接続テスト
npx prisma db pull
```

接続できない場合:
1. Supabaseプロジェクトが **Active** 状態か確認
2. DATABASE_URLのパスワード部分に特殊文字がある場合はURLエンコード
3. ファイアウォール/ネットワーク設定確認

### ❌ ステップ4で「Admin user seeding failed」エラー

**原因**: マイグレーションが未適用、またはADMIN_PASSWORD未設定

**対処**:
```bash
# マイグレーション状態確認
npx prisma migrate status

# 環境変数確認
echo $ADMIN_PASSWORD  # 値が表示されない場合は .env.local に追加
```

### ❌ ステップ6/8でログイン失敗（「認証処理でエラーが発生しました」）

**原因1**: パスワードが間違っている

**対処**: `.env.local` と Vercel環境変数の `ADMIN_PASSWORD` が一致しているか確認

**原因2**: admin_usersテーブルにデータがない

**対処**:
```bash
# 管理者ユーザー確認
node scripts/admin/check-admin.js

# 存在しない場合は再シード
node scripts/admin/seed-admin.js
```

**原因3**: bcryptハッシュの不整合

**対処**: パスワードリセットAPI使用
```bash
# ローカルで実行
curl -X POST http://localhost:3000/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken":"your-reset-token"}'

# 本番で実行
curl -X POST https://your-project.vercel.app/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken":"your-reset-token"}'
```

⚠️ `RESET_TOKEN` 環境変数の設定が必要

### ❌ Vercelビルド失敗

**症状**: `Type error: ... is not assignable to type ...`

**対処**:
```bash
# ローカルで型チェック
npm run type-check

# エラー箇所を修正後
git add .
git commit -m "Fix TypeScript errors"
git push
```

---

## セキュリティ推奨事項

### デプロイ完了後の対応

1. **RESET_TOKEN削除** (使用した場合)
   - Vercel環境変数から `RESET_TOKEN` を削除
   - `/api/admin/reset-password` エンドポイントを無効化

2. **ADMIN_PASSWORD強化** (本番運用開始前)
   - 4桁の `5546` から8文字以上の複雑なパスワードに変更
   - Vercel環境変数を更新
   - パスワードリセットAPIで反映

3. **データベースバックアップ設定**
   - Supabase → Database → Backups → 自動バックアップ有効化

---

## 完了チェックリスト

- [ ] ステップ1: .env.local作成、DATABASE_URL設定
- [ ] ステップ2: `npx prisma generate` 成功
- [ ] ステップ3: `npx prisma migrate deploy` 成功
- [ ] ステップ4: `node scripts/admin/seed-admin.js` 成功
- [ ] ステップ5: Supabaseダッシュボードでテーブル確認
- [ ] ステップ6: ローカル(`localhost:3000/admin`)でログイン成功
- [ ] ステップ7: Vercel再デプロイ成功
- [ ] ステップ8: 本番(`your-project.vercel.app/admin`)でログイン成功

---

## 次のステップ（任意）

### サンプル診断データ投入

```bash
node scripts/admin/seed-sample-data.js
```

管理画面でダミーの診断結果を表示して動作確認できます。

### パフォーマンス最適化

- Supabase Connection Pooling確認 (`?pgbouncer=true` がDATABASE_URLに含まれているか)
- Prisma Connection Limit設定 (`connection_limit=1` 推奨)

### モニタリング設定

- Supabase → Reports → Database負荷確認
- Vercel → Analytics → 関数実行時間確認
