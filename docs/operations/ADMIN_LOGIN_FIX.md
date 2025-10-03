# 管理者ログイン問題 - 診断と解決手順

**作成日**: 2025-10-03
**問題**: デプロイ環境で管理者ページ（/admin）にログインできない

---

## 📊 根本原因分析（Codex診断結果）

### 特定された問題
**管理者パスワードが平文で保存されている**

#### データベース状態（診断時）
```
ID: cmga88rqx0000yzs58coyxi5s
ユーザー名: admin
パスワードハッシュ: 5546  ❌ (平文、bcryptハッシュではない)
パスワード'5546'での認証: 失敗  ❌
パスワード'admin123'での認証: 失敗  ❌
```

### 原因
1. データベースに平文パスワード「5546」が直接挿入された
2. 認証処理(`lib/admin-auth.ts:22-28`)でbcrypt.compareが失敗
3. ログイン成功条件を満たせない

### 影響範囲
- 管理者ダッシュボード全体へのアクセス不可
- 診断記録の閲覧・管理機能が使用不能
- 統計データのエクスポート機能が使用不能

---

## ✅ 解決方法

### 方法1: Supabase SQL Editor（推奨）

**最も確実な方法**

#### 手順
1. [Supabaseダッシュボード](https://supabase.com/dashboard)にアクセス
2. プロジェクト `htcwkmlkaywglqwdxbrb` を開く
3. 左サイドバーの **SQL Editor** をクリック
4. 以下のSQLを実行：

```sql
-- パスワード「5546」のbcryptハッシュに更新
UPDATE admin_users
SET password = '$2b$12$KI82sfUKX4f/EizCTzfHMe7GABPWrHC1MrVuwqAmXrmm6NB3bBIpO'
WHERE username = 'admin';
```

5. **Run** ボタンをクリック
6. 結果を確認：`1 row affected` と表示されればOK

#### 検証
デプロイ環境の `/admin` ページにアクセス：
- **ユーザー名**: `admin`
- **パスワード**: `5546`

---

### 方法2: Reset Password API（デプロイ環境のみ）

**Vercelデプロイ環境で環境変数を設定済みの場合**

#### 前提条件
- Vercel環境変数に `RESET_TOKEN` が設定されている
- Vercel環境変数に `ADMIN_PASSWORD=5546` が設定されている

#### 手順
1. ターミナルで以下を実行：

```bash
curl -X POST https://your-deployment-url.vercel.app/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken": "YOUR_RESET_TOKEN_VALUE"}'
```

2. レスポンス確認：
```json
{
  "success": true,
  "message": "Admin password reset successfully",
  "username": "admin",
  "timestamp": "2025-10-03T..."
}
```

---

### 方法3: 手動bcryptハッシュ生成

**他のパスワードに変更したい場合**

#### Node.jsでハッシュ生成
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 12).then(hash => console.log(hash));"
```

#### 出力例
```
$2b$12$KI82sfUKX4f/EizCTzfHMe7GABPWrHC1MrVuwqAmXrmm6NB3bBIpO
```

#### Supabase SQL Editorで更新
```sql
UPDATE admin_users
SET password = '生成されたハッシュ値'
WHERE username = 'admin';
```

---

## 🔍 診断コマンド

### ローカル環境でadminユーザー確認
```bash
node scripts/admin/check-admin.js
```

**期待される正常な出力:**
```
管理者アカウント数: 1
ID: cmga88rqx0000yzs58coyxi5s
ユーザー名: admin
ロール: admin
パスワードハッシュ: $2b$12$KI82... (60文字のハッシュ)
パスワード'5546'での認証: 成功 ✅
```

---

## 🛠️ トラブルシューティング

### Transaction Pooler接続エラー
**エラー**: `prepared statement "s0" already exists`

**原因**: Supabase Transaction pooler (port 6543) での接続制限

**解決策**:
1. Supabase SQL Editorで直接SQL実行（推奨）
2. または `DIRECT_URL` (port 5432) を使用

### Admin User Not Found
**エラー**: `Admin user not found. Run seed script first.`

**解決策**:
```bash
# ローカル環境で実行
node scripts/admin/seed-admin.js
```

---

## 📝 予防策

### デプロイ前チェックリスト
1. ✅ Supabase SQL Editorでadmin_usersテーブル確認
2. ✅ パスワードハッシュが `$2b$12$` で始まる60文字であることを確認
3. ✅ ローカル環境で `node scripts/admin/check-admin.js` を実行
4. ✅ 認証テストが成功することを確認

### 環境変数設定（Vercel）
```env
# 必須
DATABASE_URL=postgresql://postgres.htcwkmlkaywglqwdxbrb:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.htcwkmlkaywglqwdxbrb:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
ADMIN_PASSWORD=5546
JWT_SECRET=f8d9e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9e8d7c6b5a4f3e2d1c0b9a8

# オプション（パスワードリセット用）
RESET_TOKEN=your-secure-random-token
```

---

## 🔗 関連ファイル

- 認証ロジック: [src/lib/admin-auth.ts](../../src/lib/admin-auth.ts)
- ログインAPI: [src/app/api/admin/login/route.ts](../../src/app/api/admin/login/route.ts)
- パスワードリセットAPI: [src/app/api/admin/reset-password/route.ts](../../src/app/api/admin/reset-password/route.ts)
- 診断スクリプト: [scripts/admin/check-admin.js](../../scripts/admin/check-admin.js)
- 更新スクリプト: [scripts/admin/update-admin-password.js](../../scripts/admin/update-admin-password.js)

---

## 📞 サポート情報

問題が解決しない場合は、以下の情報を含めてエスカレーション：

1. `node scripts/admin/check-admin.js` の出力
2. Supabase SQL Editorで実行した `SELECT * FROM admin_users;` の結果（パスワードハッシュは伏せ字）
3. Vercel Runtime Logsのエラーメッセージ
4. ブラウザのNetwork タブで `/api/admin/login` のレスポンス内容
