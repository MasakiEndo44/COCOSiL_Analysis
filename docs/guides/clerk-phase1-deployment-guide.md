# Clerk Phase 1 - 本番デプロイガイド

## 概要
このガイドは、Clerk認証統合（Phase 1）をVercel本番環境にデプロイする手順を説明します。

---

## 前提条件

### 1. 開発環境での動作確認完了
- ✅ [手動テストガイド](./clerk-phase1-manual-testing-guide.md) のすべてのシナリオをクリア
- ✅ `npm run build` が成功する
- ✅ Clerk APIキーが `.env.local` に正しく設定されている

### 2. Clerk本番環境の準備
- ✅ Clerk Dashboard で本番用API Keyを取得済み
- ✅ 本番用ドメインを Clerk に登録済み

---

## デプロイ手順

### Step 1: Clerk本番環境セットアップ

#### 1.1 Clerk Dashboard設定

1. **Clerk Dashboard** (https://dashboard.clerk.com) にアクセス
2. プロジェクトを選択
3. **Settings → API Keys** で本番環境に切り替え
   - 右上のドロップダウンで「Production」を選択
4. **Production API Keys** を取得：
   ```
   Publishable key: pk_live_xxxxxxxxxxxxx
   Secret key: sk_live_xxxxxxxxxxxxx
   ```

#### 1.2 本番ドメインの登録

1. Clerk Dashboard → **Domains**
2. 「Add Domain」をクリック
3. Vercel本番ドメインを追加：
   ```
   https://your-app.vercel.app
   ```
4. 「Development」モードを無効化し、「Production」を有効化

#### 1.3 リダイレクトURL設定

Clerk Dashboard → **Paths**:
```
Sign-in URL: /sign-in
Sign-up URL: /sign-up
After sign-in URL: /diagnosis
After sign-up URL: /diagnosis
```

※環境変数で設定済みのため、Dashboard設定は参考値

---

### Step 2: Vercel環境変数設定

#### 2.1 Vercel Dashboardにアクセス

1. https://vercel.com/dashboard にログイン
2. COCOSiLプロジェクトを選択
3. **Settings → Environment Variables** を開く

#### 2.2 Clerk環境変数を追加

**Production環境用の環境変数:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_xxxxx` | Production |
| `CLERK_SECRET_KEY` | `sk_live_xxxxx` | Production |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Production |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Production |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/diagnosis` | Production |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/diagnosis` | Production |

**Preview環境用（任意）:**

開発・テスト用に、Preview環境でも同じ環境変数を設定可能：
- Environment: **Preview** を選択
- 開発用APIキー (`pk_test_xxxxx`, `sk_test_xxxxx`) を使用

#### 2.3 既存環境変数の確認

以下の既存環境変数が正しく設定されていることを確認：

| Variable Name | Required | Description |
|---------------|----------|-------------|
| `DATABASE_URL` | ✅ | Prisma Database接続 |
| `OPENAI_API_KEY` | ✅ | OpenAI GPT-4統合 |
| `ADMIN_PASSWORD` | ✅ | 管理画面JWT認証 |
| `CRON_SECRET` | ⚠️ | Cron Job認証（Phase 2で使用） |

---

### Step 3: Git Push & デプロイ

#### 3.1 変更をコミット

```bash
# 変更をステージング
git add .

# コミットメッセージ
git commit -m "feat: Implement Clerk Phase 1 authentication integration

- Add Clerk authentication choice screen
- Integrate ClerkProvider with Japanese localization
- Implement anonymous and authenticated diagnosis flows
- Add sign-in/sign-up pages
- Extend Zustand store with authMode tracking
- Preserve existing JWT admin authentication
- Add E2E tests and manual testing guide

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 3.2 本番ブランチにプッシュ

```bash
# mainブランチにプッシュ
git push origin main
```

Vercelは自動的に：
1. 変更を検知
2. ビルドを開始
3. 本番環境にデプロイ

#### 3.3 デプロイ状況の確認

1. Vercel Dashboard → **Deployments**
2. 最新のデプロイを確認
3. ステータスが「Ready」になるまで待機（通常2-5分）

---

### Step 4: 本番環境での動作確認

#### 4.1 基本動作チェック

デプロイ完了後、以下のURLにアクセス：

1. **ランディングページ**: `https://your-app.vercel.app/`
2. **診断開始ページ**: `https://your-app.vercel.app/diagnosis`
3. **サインアップ**: `https://your-app.vercel.app/sign-up`
4. **サインイン**: `https://your-app.vercel.app/sign-in`

#### 4.2 認証フローテスト

[手動テストガイド](./clerk-phase1-manual-testing-guide.md) のシナリオ1-8を本番環境で再実行：

**最重要チェック項目:**
- ✅ 認証選択画面が表示される
- ✅ 匿名診断フローが動作する
- ✅ Clerkサインアップが完了する
- ✅ Clerkサインインが完了する
- ✅ 認証済みユーザーの自動スキップが動作する
- ✅ 日本語ローカライゼーションが適用される

#### 4.3 管理画面の確認

1. `https://your-app.vercel.app/admin` にアクセス
2. 既存のJWT認証が動作することを確認
3. Clerkサインインにリダイレクトされないことを確認

---

### Step 5: 本番環境トラブルシューティング

#### 問題: Clerkフォームが表示されない

**原因:**
- 環境変数が正しく設定されていない
- Clerk本番環境が有効化されていない

**解決策:**
```bash
# Vercel環境変数を再確認
Vercel Dashboard → Settings → Environment Variables

# Clerk Dashboardでドメイン登録確認
Clerk Dashboard → Domains → Production: enabled
```

#### 問題: リダイレクトループが発生

**原因:**
- Clerk Dashboard の Paths 設定が間違っている
- 環境変数のリダイレクトURLが間違っている

**解決策:**
```bash
# 環境変数を確認
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/diagnosis
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/diagnosis

# Clerk Dashboard Paths設定を確認
After sign-in URL: /diagnosis
After sign-up URL: /diagnosis
```

#### 問題: CORS エラー

**原因:**
- Clerk Dashboard にドメインが登録されていない

**解決策:**
```bash
# Clerk Dashboard → Domains
# 本番ドメインを追加:
https://your-app.vercel.app

# wwwサブドメインも必要な場合:
https://www.your-app.vercel.app
```

---

## デプロイ後の確認事項

### ✅ 機能確認チェックリスト

- [ ] ランディングページが正常に表示される
- [ ] 認証選択画面が正しく表示される
- [ ] 匿名診断フローが完了する
- [ ] Clerkサインアップが完了する
- [ ] Clerkサインインが完了する
- [ ] 認証済みユーザーの自動スキップが動作する
- [ ] 基本情報の自動入力が動作する
- [ ] 診断フロー全体が完了する
- [ ] 管理画面のJWT認証が動作する
- [ ] 日本語ローカライゼーションが適用される

### ✅ パフォーマンス確認

- [ ] ページ読み込み速度が許容範囲内（<3秒）
- [ ] Lighthouseスコアが良好（Performance >80）
- [ ] モバイル表示が正常

### ✅ セキュリティ確認

- [ ] HTTPS接続が有効
- [ ] Clerk環境変数が正しく隠蔽されている
- [ ] 管理画面のJWT認証が独立して動作
- [ ] セッションCookieが正しく設定される

---

## ロールバック手順

問題が発生した場合、以前のバージョンにロールバック可能：

### Vercelでのロールバック

1. Vercel Dashboard → **Deployments**
2. 以前の成功したデプロイを選択
3. **⋮ メニュー → Promote to Production**
4. 確認して実行

---

## 次のステップ：Phase 2 実装

Phase 1デプロイが成功したら、Phase 2の実装に進みます：

### Phase 2: データベース統合とWebhook（予定）

**実装内容:**
- Clerkユーザーデータのデータベース同期
- Webhook実装 (user.created, user.deleted)
- 診断履歴の永続化
- ユーザーダッシュボード機能

**推定期間:** 2週間

---

## サポート情報

### Clerk公式ドキュメント
- Next.js統合: https://clerk.com/docs/quickstarts/nextjs
- 本番環境デプロイ: https://clerk.com/docs/deployments/overview

### Vercel公式ドキュメント
- 環境変数設定: https://vercel.com/docs/projects/environment-variables
- デプロイメント: https://vercel.com/docs/deployments/overview

### トラブルシューティング
1. Clerk Dashboard のログを確認
2. Vercel Deployment Logsを確認
3. ブラウザDevToolsのConsoleを確認

---

## デプロイ完了報告テンプレート

```markdown
## Clerk Phase 1 デプロイ完了報告

**デプロイ日時:** 2025-XX-XX XX:XX JST
**デプロイ環境:** Production (Vercel)
**本番URL:** https://your-app.vercel.app

### ✅ 完了項目
- [x] Clerk本番環境セットアップ
- [x] Vercel環境変数設定
- [x] Git Push & デプロイ
- [x] 本番環境動作確認
- [x] 全機能チェック完了

### 📊 動作確認結果
- 認証選択画面: ✅ 正常動作
- 匿名診断: ✅ 正常動作
- Clerkサインアップ: ✅ 正常動作
- Clerkサインイン: ✅ 正常動作
- 自動入力: ✅ 正常動作
- 管理画面JWT認証: ✅ 正常動作

### 🚀 次のアクション
Phase 2実装の準備を開始
```
