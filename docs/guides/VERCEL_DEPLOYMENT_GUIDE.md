# COCOSiL Vercelデプロイガイド

> **Codex推奨**: 本ガイドはCodex AIの助言に基づき、COCOSiLプロジェクトの包括的なVercelデプロイ戦略を提供します。

## 📋 目次

1. [デプロイ前の準備](#デプロイ前の準備)
2. [Vercelプロジェクト設定](#vercelプロジェクト設定)
3. [環境変数の構成](#環境変数の構成)
4. [データベース移行戦略](#データベース移行戦略)
5. [ビルド最適化](#ビルド最適化)
6. [Edge Runtime設定](#edge-runtime設定)
7. [デプロイ実行](#デプロイ実行)
8. [本番環境チェックリスト](#本番環境チェックリスト)
9. [トラブルシューティング](#トラブルシューティング)

---

## デプロイ前の準備

### 🔴 重要: TypeScriptエラー解決（必須）

**現在の状況**: 147個のTypeScriptエラーが存在
**影響**: Vercelビルドが失敗する可能性

```bash
# 1. 不足依存関係のインストール
npm install recharts @radix-ui/react-tabs
npx shadcn-ui@latest add tabs

# 2. ボタンvariantの一括修正
find src -name "*.tsx" -exec sed -i '' 's/variant="outline"/variant="secondary"/g' {} \;

# 3. 型チェック実行
npm run type-check

# 4. ビルドテスト
npm run build
```

### 依存関係の最終確認

```bash
# package.jsonとlockfileの整合性チェック
npm ci

# 全テスト実行
npm test
npm run lint
npm run type-check
```

### `.env.example`の更新

現在のファイルには2つの変数しかないため、本番環境用に拡張します：

```bash
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# 管理者認証（4桁PIN）
ADMIN_PASSWORD=1234

# JWT秘密鍵（本番環境では必ず変更）
JWT_SECRET=your-secure-jwt-secret-key-minimum-32-characters

# データベース接続（本番環境）
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# Next.js設定
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_VERCEL_URL=${VERCEL_URL}

# 機能フラグ（オプション）
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_LEARNING_SYSTEM=true
```

---

## Vercelプロジェクト設定

### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

### 2. プロジェクトのリンク

```bash
# Vercelにログイン
vercel login

# プロジェクトをリンク（初回のみ）
vercel link
```

**対話式プロンプト**:
- Set up and deploy "COCOSiL"? → **Yes**
- Which scope? → 自分のアカウントまたはチームを選択
- Link to existing project? → **No**（初回）
- What's your project's name? → **cocosil-analysis**
- In which directory is your code located? → **./（デフォルト）**

### 3. プロジェクト設定（Vercelダッシュボード）

1. **Framework Preset**: Next.js
2. **Root Directory**: `./`（デフォルト）
3. **Build Command**: `npm run build`（デフォルト）
4. **Output Directory**: `.next`（デフォルト）
5. **Install Command**: `npm install`（デフォルト）

### 4. Node.jsバージョン設定

プロジェクトルートに`.node-version`ファイルを作成（推奨）:

```bash
echo "18.17.0" > .node-version
```

または`package.json`で既に指定済み:
```json
"engines": {
  "node": ">=18.0.0"
}
```

---

## 環境変数の構成

### Vercelダッシュボードでの設定

**Settings → Environment Variables** で以下を追加：

#### 1. OpenAI API設定

| 変数名 | 値 | 環境 |
|--------|---|------|
| `OPENAI_API_KEY` | `sk-proj-...` | Production, Preview, Development |

**セキュリティ**: Secret として設定（暗号化）

#### 2. 管理者認証

| 変数名 | 値 | 環境 |
|--------|---|------|
| `ADMIN_PASSWORD` | `1234`（本番では変更） | Production |
| `JWT_SECRET` | ランダムな32文字以上の文字列 | Production, Preview |

**JWT_SECRET生成方法**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3. データベース接続

| 変数名 | 値 | 環境 |
|--------|---|------|
| `DATABASE_URL` | PostgreSQL接続文字列 | Production, Preview |

**接続文字列の形式**:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**推奨データベースプロバイダー**:
- **Vercel Postgres** (統合が容易)
- **Supabase** (無料枠が充実)
- **PlanetScale** (スケーラビリティ重視)

#### 4. Next.js設定

| 変数名 | 値 | 環境 |
|--------|---|------|
| `NEXT_PUBLIC_APP_URL` | `https://cocosil.vercel.app` | Production |
| `NEXT_PUBLIC_VERCEL_URL` | 自動設定（変更不要） | All |

### 環境変数CLIでの一括設定

```bash
# Production環境
vercel env add OPENAI_API_KEY production
vercel env add ADMIN_PASSWORD production
vercel env add JWT_SECRET production
vercel env add DATABASE_URL production

# Preview環境
vercel env add JWT_SECRET preview
vercel env add DATABASE_URL preview
```

---

## データベース移行戦略

### 現在の構成: SQLite → PostgreSQL

**開発環境**: SQLite (`file:./admin.db`)
**本番環境**: PostgreSQL（Vercel Postgres推奨）

### 1. Prisma Schemaの更新

`prisma/schema.prisma`を本番環境対応に修正:

```prisma
// 環境変数でプロバイダーを切り替え
datasource db {
  provider = "postgresql"  // SQLite から変更
  url      = env("DATABASE_URL")
}
```

### 2. マイグレーションファイルの生成

```bash
# ローカルでマイグレーション生成（SQLiteで開発中）
npx prisma migrate dev --name init_production

# マイグレーションファイルの確認
ls prisma/migrations/
```

### 3. Vercel Postgresのセットアップ

#### オプションA: Vercelダッシュボード
1. **Storage → Create Database** → **Postgres**
2. データベース名: `cocosil-production`
3. リージョン: 自動選択（アプリと同じリージョン）
4. 自動的に`DATABASE_URL`が環境変数に追加される

#### オプションB: Supabaseを使用
1. [Supabase](https://supabase.com)でプロジェクト作成
2. **Settings → Database** で接続文字列取得
3. Vercelに`DATABASE_URL`を手動設定

### 4. `package.json`にビルドスクリプト追加

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

**Codex推奨**: `postinstall`と`build`スクリプトでPrisma操作を自動化

### 5. 本番環境へのマイグレーション実行

```bash
# Vercel CLIでマイグレーション実行
vercel env pull .env.production  # 本番環境変数取得
npx prisma migrate deploy --preview-feature
```

### 6. データベースシーディング（オプション）

本番環境用のマスターデータ投入:

```bash
# prisma/seed.tsを作成
# package.jsonに追加
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}

# 実行
npx prisma db seed
```

---

## ビルド最適化

### 1. 画像最適化設定

`next.config.mjs`に追加:

```javascript
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30日
  },
}
```

### 2. バンドルサイズ分析

```bash
# 依存関係分析
npm run analyze

# 結果を確認
# .next/analyze/ ディレクトリに生成される
```

**最適化ターゲット**:
- 不要な依存関係の削除
- 動的インポートの活用
- Tree-shakingの最大化

### 3. Zustand最適化

```typescript
// 推奨パターン: セレクタのメモ化
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';

const Component = () => {
  // ❌ 非推奨: 全体のストアを取得
  const store = useDiagnosisStore();

  // ✅ 推奨: 必要なデータのみ取得
  const basicInfo = useDiagnosisStore((state) => state.basicInfo);
  const mbti = useDiagnosisStore((state) => state.mbti);
};
```

### 4. コンポーネントの遅延ロード

```typescript
// 重いコンポーネントの動的インポート
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(
  () => import('@/ui/components/admin/monitoring-dashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // クライアントサイドのみ
  }
);
```

### 5. MDXコンテンツの最適化

```javascript
// next.config.mjs - MDX設定
const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight, rehypeSlug],
  },
  // 本番環境での最適化
  experimental: {
    mdxRs: true, // Rust-based MDXコンパイラ（高速）
  },
});
```

---

## Edge Runtime設定

### 1. Edge-compatible API Routes

**推奨Edge Runtime使用ケース**:
- ✅ 運勢計算API (`/api/fortune-calc-v2`)
- ✅ AIチャットストリーミング（fetch-based OpenAI SDK）
- ❌ Prisma使用API（Node.js Runtime必須）
- ❌ JWT認証処理（Node.js crypto依存）

### 2. 運勢計算APIのEdge化（既存実装の確認）

`src/app/api/fortune-calc-v2/route.ts`:

```typescript
// Edge Runtime宣言（既に実装済み）
export const runtime = 'edge';

export async function POST(request: Request) {
  // 高速計算（P95: 38.7ms）
  const fortune = calculateFortuneSimplified(birthDate, gender);

  // LRUキャッシュ（メモリ内）
  const cached = fortuneCache.get(cacheKey);

  return new Response(JSON.stringify(fortune), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 3. AIチャットAPIのEdge化

`src/app/api/ai/chat/route.ts`:

```typescript
export const runtime = 'edge';

export async function POST(request: Request) {
  // fetch-based OpenAI SDKは Edge互換
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages: [...],
  });

  // Server-Sent Eventsストリーミング
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    }
  );
}
```

### 4. 管理者APIはNode.js Runtimeを維持

`src/app/api/admin/*/route.ts`:

```typescript
// Prisma使用のため Node.js Runtime
export const runtime = 'nodejs';

import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  const records = await db.diagnosisRecord.findMany();
  return Response.json(records);
}
```

---

## デプロイ実行

### 1. ステージング環境へのデプロイ（Preview）

```bash
# 現在のブランチをPreview環境にデプロイ
vercel

# 出力例:
# 🔍 Inspect: https://vercel.com/your-username/cocosil/abc123
# ✅ Preview: https://cocosil-abc123.vercel.app
```

**確認項目**:
- [ ] ページが正常に表示される
- [ ] 診断フローが完動する
- [ ] AI対話が機能する
- [ ] 管理画面ログインが成功する
- [ ] データベース接続が正常

### 2. 本番環境へのデプロイ（Production）

```bash
# Productionにデプロイ
vercel --prod

# または mainブランチへのマージで自動デプロイ
git checkout main
git merge feature-branch
git push origin main
```

**自動デプロイ設定（推奨）**:
- **Settings → Git** で設定
- **Production Branch**: `main`
- **Preview Branches**: すべてのブランチ

### 3. デプロイ後の動作確認

```bash
# デプロイ済みURLを取得
vercel ls

# 本番環境の動作確認
curl https://cocosil.vercel.app/api/health
```

---

## 本番環境チェックリスト

### 🔴 デプロイ前（必須）

- [ ] TypeScriptエラー147個をすべて解決
- [ ] `npm run build`がローカルで成功
- [ ] `npm run type-check`がエラーなし
- [ ] `npm test`が全テスト合格
- [ ] `.env.example`に必要な変数をすべて記載
- [ ] `recharts`, `@radix-ui/react-tabs`をインストール

### 🟡 セキュリティ（重要）

- [ ] `ADMIN_PASSWORD`を4桁から強力なパスワードに変更
- [ ] `JWT_SECRET`を32文字以上のランダム文字列に設定
- [ ] `OPENAI_API_KEY`をVercel環境変数でSecret指定
- [ ] データベース接続文字列を暗号化
- [ ] CORS設定の確認（必要に応じて）

### 🟢 パフォーマンス（推奨）

- [ ] 画像を`next/image`で最適化
- [ ] 重いコンポーネントを動的インポート
- [ ] Edge Runtimeを適切に活用
- [ ] LRUキャッシュの有効化確認
- [ ] バンドルサイズ分析の実施

### データベース

- [ ] Prismaマイグレーションが本番DBで実行済み
- [ ] マスターデータのシーディング完了
- [ ] バックアップ戦略の確立
- [ ] 接続プールの設定確認

### モニタリング

- [ ] Vercel Analyticsの有効化
- [ ] エラートラッキング（Sentry等）の設定
- [ ] ログ収集の確認
- [ ] アラート設定（ダウンタイム検知）

---

## トラブルシューティング

### 問題1: ビルドエラー「TypeScript: 147 errors」

**原因**: TypeScript型エラーが未解決

**解決策**:
```bash
# 1. 不足依存関係をインストール
npm install recharts @radix-ui/react-tabs

# 2. ボタンvariantを修正
find src -name "*.tsx" -exec sed -i '' 's/variant="outline"/variant="secondary"/g' {} \;

# 3. 型チェック再実行
npm run type-check

# 4. エラーが残る場合は個別に修正
# 特に以下のファイルを重点確認:
# - src/ui/components/admin/enhanced-records-view.tsx
# - src/ui/components/admin/monitoring-dashboard.tsx
# - src/ui/components/error/ErrorBoundary.tsx
```

### 問題2: デプロイ後に「Internal Server Error」

**原因**: 環境変数の設定漏れ

**解決策**:
```bash
# 環境変数の確認
vercel env ls

# 不足している変数を追加
vercel env add OPENAI_API_KEY production
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production

# 再デプロイ
vercel --prod
```

### 問題3: データベース接続エラー

**原因**: Prismaクライアントが生成されていない

**解決策**:
```bash
# package.jsonにpostinstallスクリプト追加
"postinstall": "prisma generate"

# Vercelで再ビルド
vercel --prod --force
```

### 問題4: AIチャットが動作しない

**原因**: OpenAI APIキーの設定ミスまたはEdge Runtime非互換

**確認事項**:
1. `OPENAI_API_KEY`が正しく設定されているか
2. APIキーに残高があるか
3. `openai`パッケージのバージョンがfetch-basedか（v4以降）

**解決策**:
```typescript
// src/lib/ai/openai-client.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Edge Runtimeではfetch-basedクライアントを使用
});
```

### 問題5: MDXページが表示されない

**原因**: MDXローダーの設定不備

**解決策**:
```bash
# MDX関連の依存関係を再インストール
npm install @next/mdx @mdx-js/loader @mdx-js/react

# next.config.mjsの設定確認
# pageExtensionsに'mdx'が含まれていることを確認
```

### 問題6: 管理画面にログインできない

**原因**: JWT秘密鍵の不一致またはデータベース未初期化

**解決策**:
```bash
# 1. 管理者アカウントの初期化
node scripts/seed-admin.js

# 2. JWT_SECRETの確認
vercel env pull .env.production
cat .env.production | grep JWT_SECRET

# 3. 再デプロイ
vercel --prod
```

---

## 継続的デプロイ設定

### GitHub Actionsでの自動テスト（推奨）

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### Vercel自動デプロイフロー

1. **開発ブランチ**: 自動的にPreview環境にデプロイ
2. **mainブランチ**: 自動的にProduction環境にデプロイ
3. **プルリクエスト**: 各PRにPreview URLが自動生成

---

## まとめ

### デプロイ成功のための重要ポイント

1. **TypeScriptエラーの完全解決**（最優先）
2. **環境変数の完全設定**（セキュリティ）
3. **データベース移行の正確な実行**（データ整合性）
4. **Edge Runtimeの適切な活用**（パフォーマンス）
5. **継続的モニタリング**（運用保守）

### 推奨デプロイフロー

```
ローカル開発
  ↓
TypeScriptエラー解決 + テスト
  ↓
Preview環境デプロイ（vercel）
  ↓
動作確認 + 負荷テスト
  ↓
Production環境デプロイ（vercel --prod）
  ↓
本番環境モニタリング
```

### サポート

- **Vercel公式ドキュメント**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma on Vercel**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

---

**最終更新**: 2025-01-27
**バージョン**: 1.0.0
**Codex推奨**: 本ガイドはCodex AIの助言に基づき、最新のベストプラクティスを反映しています。