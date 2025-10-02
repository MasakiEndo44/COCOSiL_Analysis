# Vercel デプロイ環境での管理者ログイン修正ガイド

## 問題
環境変数 `ADMIN_PASSWORD = 5546` を設定したが、ログイン時に「認証処理でエラーが発生しました」となる。

## 根本原因
Vercel のビルド時に `ADMIN_PASSWORD` 環境変数が読み込まれないため、seed スクリプトがデフォルト値 `admin123` でパスワードハッシュを作成している。

その後、ランタイムで環境変数 `5546` が読み込まれても、DB のハッシュは `admin123` のままなので認証が失敗する。

## 解決手順

### 方法1: データベースの再初期化（推奨）

1. **Vercel 環境変数の確認**
   - Vercel Dashboard → Settings → Environment Variables
   - `ADMIN_PASSWORD = 5546` が **すべての環境** (Production, Preview, Development) に設定されているか確認
   - 特に **Production** に設定されていることを確認

2. **既存データベースの削除**
   - Vercel Storage または接続先データベースから `admin.db` を削除
   - SQLite の場合: プロジェクトルートの `prisma/admin.db` を削除

3. **再デプロイ**
   ```bash
   # ローカルで確認用コミット
   git add .
   git commit -m "Fix: Admin password environment variable timing"
   git push origin main
   ```
   - Vercel が自動的に再ビルド
   - この時点で `ADMIN_PASSWORD = 5546` が読み込まれ、正しいハッシュが生成される

4. **ログイン確認**
   - デプロイ完了後、`/admin` にアクセス
   - Username: `admin`
   - Password: `5546`

### 方法2: 管理者パスワードのリセットスクリプト作成

より安全な方法として、パスワードリセット用の API エンドポイントを作成：

```typescript
// src/app/api/admin/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb } from '@/lib/admin-db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // セキュリティ: 本番環境では認証トークンなどでガード
    const { resetToken } = await request.json();

    // 開発用の簡易トークン（本番では削除または強化）
    if (resetToken !== process.env.RESET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newPassword = process.env.ADMIN_PASSWORD || '5546';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await adminDb.adminUser.update({
      where: { username: 'admin' },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
```

使用方法:
```bash
# Vercel 環境変数に RESET_TOKEN を追加
# 例: RESET_TOKEN=your-secure-random-token-here

# curl でリクエスト
curl -X POST https://your-app.vercel.app/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken":"your-secure-random-token-here"}'
```

### 方法3: Vercel Postgres を使用（本番環境推奨）

SQLite は Vercel の Serverless 環境で永続化に制限があります。本番環境では Vercel Postgres への移行を推奨：

1. **Vercel Postgres の作成**
   - Vercel Dashboard → Storage → Create Database → Postgres

2. **prisma/schema.prisma の更新**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("POSTGRES_PRISMA_URL") // Vercel が自動設定
   }
   ```

3. **マイグレーション実行**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## デバッグ方法

### ログ確認
Vercel Dashboard → Deployments → 該当デプロイ → Runtime Logs

以下を確認:
```
✅ 管理者データベースの初期化が完了しました
デフォルト管理者: admin / 5546
```

`admin / admin123` となっている場合、環境変数が読み込まれていません。

### ローカルでの検証
```bash
# 環境変数設定
export ADMIN_PASSWORD=5546

# シードスクリプト実行
node scripts/admin/seed-admin.js

# 確認
# ログに "デフォルト管理者: admin / 5546" と表示されることを確認
```

## 注意事項

- 環境変数は **すべての環境** (Production, Preview, Development) に設定する
- Vercel ビルド時に環境変数が利用可能になるまで数分かかる場合がある
- データベース再初期化は既存データを削除するため、本番環境では慎重に実行
- 4桁の数字パスワードはセキュリティ的に弱いため、本番環境では8文字以上の複雑なパスワードを推奨

## トラブルシューティング

### Q: 再デプロイしてもログインできない
A: Vercel の環境変数が正しく設定されているか、以下を確認:
   - Environment Variables で **Production** 環境が選択されているか
   - 変数名が `ADMIN_PASSWORD` (大文字) であるか
   - 値に余計なスペースや引用符が入っていないか

### Q: SQLite ファイルが削除できない
A: Vercel の Serverless 環境では永続ストレージは `/tmp` のみ。
   デプロイごとに初期化されるため、`prisma/admin.db` の場所を確認。

### Q: 本番環境だけ失敗する
A: ビルドログを確認し、seed スクリプトの実行ログを探す。
   `package.json` の `prisma.seed` 設定が正しいか確認。
