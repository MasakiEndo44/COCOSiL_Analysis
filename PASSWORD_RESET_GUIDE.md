# 管理者パスワードリセットガイド

このガイドでは、デプロイ環境で管理者パスワードをリセットする方法を説明します。

## 概要

パスワードリセット API を使用することで、データベースを削除せずに管理者パスワードを更新できます。

## 前提条件

- Vercel または他のホスティング環境にデプロイ済み
- 環境変数の設定権限がある

## セットアップ手順

### ステップ1: 環境変数の設定

Vercel Dashboard（または使用しているホスティングサービス）で以下の環境変数を設定：

```
RESET_TOKEN=your-secure-random-token-here-min-32-chars
ADMIN_PASSWORD=5546
```

**セキュリティ重要**: `RESET_TOKEN` は推測困難なランダム文字列を使用してください。

推奨される RESET_TOKEN 生成方法:
```bash
# ランダムな32文字の文字列を生成（ローカルで実行）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### ステップ2: デプロイ完了を確認

環境変数設定後、以下のいずれかの方法でデプロイを実行：

1. **自動デプロイ**: Git にプッシュすると自動的に再デプロイされる
2. **手動デプロイ**: Vercel Dashboard から "Redeploy" を実行

デプロイ完了まで待ちます（通常1-3分）。

### ステップ3: リセット API の動作確認

リセット API が利用可能か確認：

```bash
curl https://your-app.vercel.app/api/admin/reset-password
```

期待されるレスポンス:
```json
{
  "available": true,
  "configured": {
    "resetToken": true,
    "adminPassword": true
  },
  "message": "Password reset is available"
}
```

`"available": false` の場合、環境変数が正しく設定されていません。

### ステップ4: パスワードリセット実行

```bash
curl -X POST https://your-app.vercel.app/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken":"your-secure-random-token-here-min-32-chars"}'
```

**注意**: `your-secure-random-token-here-min-32-chars` をステップ1で設定した実際の `RESET_TOKEN` 値に置き換えてください。

成功時のレスポンス:
```json
{
  "success": true,
  "message": "Admin password reset successfully",
  "username": "admin",
  "timestamp": "2025-10-02T12:34:56.789Z"
}
```

### ステップ5: ログイン確認

1. ブラウザで `https://your-app.vercel.app/admin` を開く
2. 以下の認証情報でログイン:
   - Username: `admin`
   - Password: `5546` (または `ADMIN_PASSWORD` で設定した値)

## トラブルシューティング

### エラー: "RESET_TOKEN environment variable not set"

**原因**: 環境変数 `RESET_TOKEN` が設定されていない

**解決策**:
1. Vercel Dashboard → Settings → Environment Variables
2. `RESET_TOKEN` を追加
3. 再デプロイ

### エラー: "Invalid reset token"

**原因**: リクエストの `resetToken` と環境変数の `RESET_TOKEN` が一致しない

**解決策**:
1. curl コマンドの `resetToken` 値を確認
2. Vercel の環境変数で設定した値と一致するか確認
3. 余分なスペースや引用符がないか確認

### エラー: "Admin user not found"

**原因**: データベースに admin ユーザーが存在しない

**解決策**:
```bash
# ローカル環境でシードスクリプトを実行
npm run db:seed

# または、Vercel でビルドスクリプトが実行されるよう確認
# package.json の "prisma": { "seed": "..." } が設定されているか確認
```

### 成功したがログインできない

**確認項目**:
1. パスワード入力時に余分なスペースがないか
2. 環境変数 `ADMIN_PASSWORD` の値を確認
3. ブラウザのシークレットモードで試す（Cookie クリア）

## セキュリティ上の注意事項

### 本番環境での推奨事項

1. **リセット後は RESET_TOKEN を削除**
   ```
   パスワードリセット完了後、環境変数 RESET_TOKEN を削除して
   API エンドポイントを無効化することを推奨
   ```

2. **強力なパスワードを使用**
   ```
   4桁の数字パスワードは脆弱です。
   本番環境では8文字以上の複雑なパスワードを使用してください。

   推奨例: MySecureP@ssw0rd!2025
   ```

3. **HTTPS のみを使用**
   ```
   HTTP 経由でリセット API を呼び出さないでください。
   Vercel は自動的に HTTPS を提供します。
   ```

4. **IP 制限の追加** (オプション)
   ```typescript
   // src/app/api/admin/reset-password/route.ts に追加
   const allowedIPs = ['123.456.789.012']; // あなたの IP
   const clientIP = request.headers.get('x-forwarded-for');

   if (!allowedIPs.includes(clientIP || '')) {
     return NextResponse.json({ error: 'Unauthorized IP' }, { status: 403 });
   }
   ```

5. **使用後は API を削除** (最も安全)
   ```bash
   # パスワードリセット完了後
   rm -rf src/app/api/admin/reset-password
   git commit -m "Remove password reset API"
   git push
   ```

## 環境変数一覧

| 変数名 | 必須 | 説明 | 例 |
|--------|------|------|-----|
| `RESET_TOKEN` | はい | リセット API の認証トークン | `a1b2c3d4e5f6...` (32文字以上) |
| `ADMIN_PASSWORD` | はい | 新しい管理者パスワード | `5546` または `MySecureP@ss` |

## よくある質問

### Q: パスワードリセット後、データは消えますか？

A: いいえ。パスワードのみが更新され、診断記録などのデータは保持されます。

### Q: 複数の管理者アカウントがある場合は？

A: 現在のスクリプトは `username: 'admin'` のみを対象としています。
   他のユーザーをリセットするには、API コードを修正する必要があります。

### Q: ローカル環境でもリセット API は動作しますか？

A: はい。`.env.local` に環境変数を設定すれば動作します。

```bash
# .env.local
RESET_TOKEN=local-development-token
ADMIN_PASSWORD=5546

# ローカルサーバー起動
npm run dev

# リセット実行
curl -X POST http://localhost:3000/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken":"local-development-token"}'
```

### Q: Vercel 以外のホスティングサービスでも使えますか？

A: はい。環境変数をサポートする任意のホスティングサービス（Netlify, Railway, Render など）で動作します。

## サポート

問題が解決しない場合は、以下を確認してください:

1. Vercel のデプロイログで環境変数が読み込まれているか
2. API エンドポイントが正しくデプロイされているか (`/api/admin/reset-password`)
3. ネットワークエラーや CORS エラーがないか（ブラウザの開発者ツールで確認）

それでも解決しない場合は、エラーメッセージ全文とデプロイログを含めて問い合わせてください。
