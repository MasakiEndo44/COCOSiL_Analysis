# COCOSiL 環境変数設定ガイド

## セットアップ手順

1. プロジェクトルートに `.env.local` ファイルを作成
2. 以下のテンプレートをコピーして環境変数を設定

## 環境変数テンプレート

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# Supabase (Phase 3で設定)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI (Phase 3で設定)
OPENAI_API_KEY=sk-your_openai_key_here
```

## 各サービスのキー取得方法

### Clerk
1. https://clerk.com にアクセス
2. ダッシュボードからアプリケーションを選択
3. API Keys セクションで Publishable Key と Secret Key をコピー

### Supabase (Phase 3で設定)
1. https://supabase.com でプロジェクトを作成
2. Settings > API で URL と anon key を取得

### OpenAI (Phase 3で設定)
1. https://platform.openai.com でAPIキーを生成
