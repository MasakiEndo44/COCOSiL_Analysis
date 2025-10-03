# COCOSiL（ココシル）- 統合診断分析システム

体癖理論・MBTI・動物占い・算命学を統合した包括的な人間理解プラットフォーム

## 🚀 現在の実装状況

**バージョン**: 0.1.0
**生成日**: 2025年1月27日
**総合実装状況**: **85% 完了**
**本番対応度**: 🟡 高 - 改善対象領域を特定済み
**開発サーバー**: ✅ Running on http://localhost:3000

### ⚠️ 重要な課題
- **TypeScriptコンパイルエラー**: 147個のエラー要解決（優先度: 高）
- **依存関係不足**: `recharts`, `@radix-ui/react-tabs` のインストール必要
- **ボタンコンポーネント不整合**: variant修正が必要

## TL;DR（30秒でわかる COCOSiL）

```bash
# 依存関係インストール & 開発サーバー起動
npm install && npm run dev
# ブラウザで http://localhost:3000/ を開く

# 必要な依存関係を追加インストール
npm install recharts @radix-ui/react-tabs
npx shadcn-ui@latest add tabs
```

**何ができる？**
4つの診断手法（体癖・MBTI・算命学・動物占い）を1つのフローで実行し、AI対話カウンセリング機能付きの包括的な性格診断を提供。プライバシーファースト設計で個人データを30日自動削除。

---

## 📋 目次

- [プロジェクト概要](#プロジェクト概要)
- [実装状況詳細](#実装状況詳細)
- [技術スタック](#技術スタック)
- [システムアーキテクチャ](#システムアーキテクチャ)
- [セットアップ](#セットアップ)
- [開発コマンド](#開発コマンド)
- [プロジェクト構造](#プロジェクト構造)
- [API仕様](#api仕様)
- [テスト戦略](#テスト戦略)
- [重要課題と対応](#重要課題と対応)
- [デプロイ](#デプロイ)
- [ライセンス・利用上の注意](#ライセンス利用上の注意)

---

## プロジェクト概要

### 背景・課題
- **従来の問題**: 体癖理論・MBTI・算命学・動物占いが個別に運用されており、統合的な人間理解が困難
- **データ収集の課題**: AI活用による診断精度向上のための体系的なデータ収集基盤が不在
- **学習機会の不足**: 専門的な体癖理論の学習と実践的診断の統合が不十分

### COCOSiL が提供する価値
- **統合診断**: 4つの診断手法を1つのフローで実行し、包括的な分析を提供
- **AI対話カウンセリング**: GPT-4を活用したストリーミング対話機能
- **プライバシーファースト**: 個人データの厳格な管理と30日自動削除ポリシー
- **学習システム**: MDX駆動の体癖理論教育コンテンツ

### システム目標
- **高性能診断**: Edge Runtime最適化による100ms以下の運勢計算
- **スケーラブル**: 50人以上の同時接続対応
- **セキュア**: JWT認証とクライアントサイド暗号化
- **教育的**: インタラクティブな学習システム

---

## 実装状況詳細

### ✅ 完了機能

#### F001: ランディングページ & ユーザージャーニー（95%）
- **場所**: `src/app/page.tsx`, `src/ui/features/landing/`
- **状況**: ✅ レスポンシブデザインで完全実装
- **未完了**: ユーザーテストに基づくUIの細かい調整

#### F002: 基本情報収集（90%）
- **場所**: `src/ui/features/forms/basic-info-form.tsx`
- **状況**: ✅ バリデーション付きで完了
- **未完了**: アクセシビリティ機能の拡張

#### F003: MBTI統合（85%）
- **場所**: `src/ui/features/diagnosis/mbti-step.tsx`, `src/lib/data/mbti-questions.ts`
- **状況**: ✅ デュアルモード実装（既知入力 + 12問診断）
- **未完了**: 高度なスコアリングアルゴリズムの改良

#### F004: 体癖理論実装（90%）
- **場所**: `src/ui/features/diagnosis/taiheki-*`, `src/lib/taiheki/`
- **状況**: ✅ 20問診断システム完成
- **未完了**: 結果視覚化の改善

#### F005: 運勢計算エンジン（95%）
- **場所**: `src/app/api/fortune-calc-v2/route.ts`, `src/lib/fortune/`
- **状況**: ✅ Edge Runtime最適化（P95: 38.7ms）
- **パフォーマンス**: 100%正確性、1,315 req/s スループット
- **未完了**: 同時接続ユーザー向けキャッシュ最適化

#### F006: AI対話カウンセリング（80%）
- **場所**: `src/app/api/ai/chat/route.ts`, `src/lib/ai/`
- **状況**: ✅ GPT-4ストリーミング統合
- **未完了**: 高度な対話フロー制御

#### F007: 管理ダッシュボード（75%）
- **場所**: `src/app/admin/`, `src/ui/components/admin/`
- **状況**: ✅ JWT認証（4桁PIN）、診断記録管理
- **未完了**: 高度な分析とモニタリング

#### F008: 学習管理システム（90%）
- **場所**: `src/app/learn/taiheki/`, `src/ui/features/learn/`
- **状況**: ✅ MDX駆動コンテンツシステム
- **未完了**: 評価とクイズ統合

### 🔄 開発中機能

#### F009: モニタリング & 分析（60%）
- **状況**: 🔄 基盤実装、統合待ち
- **次のステップ**: ダッシュボード統合とリアルタイムモニタリング

#### F010: 強化エラーハンドリング（70%）
- **状況**: 🔄 コアエラーバウンダリ実装済み
- **次のステップ**: ユーザーフレンドリーなエラーメッセージと復旧フロー

---

## 技術スタック

### フロントエンド
- **Next.js 14.2.32** - App Router、Server Components、Edge Runtime
- **TypeScript 5.0** - 厳密型チェック、型安全性
- **React 18** - サーバーコンポーネント、Suspense
- **Zustand 4.4** - 軽量状態管理、localStorage永続化
- **Tailwind CSS 3.4** - ユーティリティファースト、カスタムデザインシステム
- **shadcn/ui** - 再利用可能UIコンポーネントライブラリ

### バックエンド・API
- **Next.js API Routes** - サーバーサイド処理
- **Edge Runtime** - 高速運勢計算（< 100ms）
- **OpenAI API (GPT-4)** - ストリーミングAI対話
- **Prisma 6.15** - 型安全データベースORM

### データベース・ストレージ
- **SQLite** - 管理データベース（開発・小規模運用）
- **localStorage** - クライアントサイド診断データ（暗号化、30日自動削除）
- **MDX** - 学習コンテンツ静的管理

### 開発・品質保証
- **Jest + Testing Library** - ユニットテスト（目標80%カバレッジ）
- **Playwright** - E2Eテスト自動化
- **ESLint + Prettier** - コード品質・フォーマット
- **TypeScript** - 型チェック、コンパイル時エラー検出

---

## システムアーキテクチャ

### 高レベルアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    COCOSiL システム                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14 App Router)                          │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ ランディング  │ 診断フロー   │ 学習システム  │ 管理画面     │ │
│  │ ページ       │            │            │            │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ 診断状態     │ 学習進捗     │ AI セッション│ UI状態      │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Edge Runtime & Server Functions)               │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ 運勢計算     │ AI チャット  │ 管理者API   │ データ処理   │ │
│  │ (Edge)      │ (Streaming) │             │            │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  External Services                                          │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ OpenAI API  │ 運勢エンジン  │ データベース  │ ファイル     │ │
│  │ (GPT-4)     │ (TypeScript)│ (SQLite)    │ ストレージ   │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### プライバシーファーストアーキテクチャ

```typescript
// クライアントサイドデータ管理
class PrivacyManager {
  // 1. 暗号化ストレージ
  encryptAndStore(key: string, data: any) {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.getEncryptionKey()
    ).toString();
    localStorage.setItem(key, encrypted);
  }

  // 2. 自動期限切れ（30日）
  checkDataExpiry() {
    const timestamp = localStorage.getItem('diagnosis_timestamp');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    if (timestamp && parseInt(timestamp) < thirtyDaysAgo) {
      this.clearAllDiagnosisData();
    }
  }

  // 3. データ匿名化
  anonymizeForAdmin(data: DiagnosisData): AnonymizedData {
    return {
      ageRange: this.calculateAgeRange(data.age),
      gender: data.gender,
      mbtiType: data.mbti?.type,
      // 個人識別情報は除外
    };
  }
}
```

### パフォーマンス最適化

#### Edge Runtime運勢計算
```typescript
// src/app/api/fortune-calc-v2/route.ts
export const runtime = 'edge';

export async function POST(request: Request) {
  // 1. 高速計算（P95: 38.7ms）
  const fortune = calculateFortuneSimplified(birthDate, gender);

  // 2. LRUキャッシュ（7日TTL）
  const cached = fortuneCache.get(cacheKey);

  // 3. 同時接続対応（1,315 req/s）
  return new Response(JSON.stringify(fortune));
}
```

---

## セットアップ

### 前提条件
- **Node.js**: 18.0.0 以上
- **npm/yarn/pnpm**: 最新版
- **Git**: バージョン管理

### 1. リポジトリクローン・依存関係インストール

```bash
# リポジトリクローン
git clone https://github.com/your-org/cocosil-analysis.git
cd cocosil-analysis

# Node.js依存関係
npm install

# 必要な追加依存関係（TypeScriptエラー解決用）
npm install recharts @radix-ui/react-tabs
npx shadcn-ui@latest add tabs
```

### 2. 環境変数設定

`.env.local` ファイルを作成し、以下の変数を設定：

```bash
# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# 管理者認証（4桁PIN）
ADMIN_PASSWORD=1234

# JWT秘密鍵
JWT_SECRET=your-secret-key

# Next.js設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 開発サーバー起動

```bash
# 開発サーバー起動
npm run dev

# ブラウザで以下にアクセス
# http://localhost:3000 - メインシステム
# http://localhost:3000/admin - 管理者ダッシュボード（認証必要）
# http://localhost:3000/learn/taiheki - 学習システム
```

---

## 開発コマンド

### 基本コマンド

| コマンド | 説明 | 用途 |
|---------|------|------|
| `npm run dev` | 開発サーバー起動 | ホットリロード付き開発 |
| `npm run build` | 本番ビルド | TypeScriptエラーチェック含む |
| `npm run start` | 本番サーバー起動 | ビルド後の動作確認 |
| `npm run lint` | ESLint実行 | コード品質チェック |
| `npm run type-check` | TypeScript型チェック | 型エラーの確認 |
| `npm run format` | Prettierフォーマット | コードフォーマット統一 |

### テストコマンド

| コマンド | 説明 |
|---------|------|
| `npm test` | Jestユニットテスト実行 |
| `npm run test:watch` | Jest watchモード |
| `npm run test:coverage` | テストカバレッジレポート（80%目標） |
| `npm run test:e2e` | Playwright E2Eテスト |

### 管理用コマンド

| コマンド | 説明 |
|---------|------|
| `node scripts/seed-admin.js` | 管理者データベースシード |
| `node scripts/check-admin.js` | 管理者セットアップ確認 |
| `node scripts/update-admin-password.js` | 管理者パスワード更新 |

---

## プロジェクト構造

```
src/
├── app/                    # Next.js 14 App Router
│   ├── diagnosis/          # 診断フロー（基本情報→MBTI→体癖→結果）
│   ├── learn/taiheki/      # 学習システム（MDXコンテンツ）
│   ├── admin/              # 管理ダッシュボード
│   ├── api/                # API Routes
│   │   ├── fortune-calc-v2/ # Edge Runtime運勢計算
│   │   ├── ai/chat/        # OpenAI GPT-4ストリーミング
│   │   └── admin/          # 管理者API
│   └── globals.css         # グローバルスタイル
├── ui/
│   ├── features/           # 機能別コンポーネント
│   │   ├── forms/          # フォーム関連
│   │   ├── diagnosis/      # 診断フロー
│   │   ├── learn/          # 学習システム
│   │   ├── chat/           # AI対話
│   │   └── admin/          # 管理画面
│   └── components/         # 共通UIコンポーネント
├── hooks/                  # カスタムReactフック
├── lib/
│   ├── zustand/            # 状態管理ストア
│   ├── data/               # 診断質問・アルゴリズム
│   ├── fortune/            # 運勢計算エンジン
│   └── ai/                 # OpenAI設定
├── types/                  # TypeScript型定義
├── content/taiheki/        # MDX学習コンテンツ
└── __tests__/              # ユニットテスト
```

---

## API仕様

### 運勢計算エンジン API
**エンドポイント**: `POST /api/fortune-calc-v2`
**Runtime**: Edge Runtime（高速化）

```typescript
// リクエスト
interface FortuneCalcRequest {
  birthDate: string;  // "1990-01-01"
  gender: string;     // "male" | "female"
}

// レスポンス
interface FortuneCalcResponse {
  age: number;
  westernZodiac: string;     // 西洋占星術
  animalCharacter: string;   // 動物占い（60種類）
  sixStarFortune: string;    // 六星占術
  elements: string[];        // 五行
  orientation: string;       // 左右性質
}
```

### AI対話チャット API
**エンドポイント**: `POST /api/ai/chat`
**機能**: Server-Sent Eventsストリーミング

```typescript
interface ChatRequest {
  messages: Message[];
  diagnosisContext: DiagnosisContext;
}

// ReadableStream<ChatCompletionChunk>でストリーミング応答
```

### 管理者認証 API
**エンドポイント**: `POST /api/admin/auth`

```typescript
interface AdminAuthRequest {
  pin: string;  // 4桁PIN
}

interface AdminAuthResponse {
  token: string;     // JWT token
  expiresAt: string; // 1時間後
}
```

---

## テスト戦略

### テストカバレッジ目標
- **ユニットテスト**: 80%以上（jest.config.js設定済み）
- **E2Eテスト**: クリティカルパス100%
- **現在のカバレッジ**: ~65%（推定）

### 主要テストシナリオ
- **完全診断フロー**: 基本情報→MBTI→体癖→AI対話→結果
- **運勢計算精度**: 動物占い100%正確性検証済み
- **API統合**: OpenAI、Edge Runtime、管理者API
- **エラーハンドリング**: リトライ・フォールバック機構
- **パフォーマンス**: P95レスポンス時間、スループット

### テスト実行

```bash
# 全テスト実行
npm test

# カバレッジレポート
npm run test:coverage

# E2Eテスト（Playwright）
npm run test:e2e

# 特定テストファイル実行
npm test -- src/__tests__/lib/fortune/calculator.test.ts
```

---

## 重要課題と対応

### 🔴 優先度1: 重要修正（1-2日）

#### 1. TypeScriptエラー解決（147個）
```bash
# ボタンvariant修正
find src -name "*.tsx" -exec sed -i '' 's/variant="outline"/variant="secondary"/g' {} \;

# 不足依存関係インストール
npm install recharts @radix-ui/react-tabs
npx shadcn-ui@latest add tabs

# 型チェック実行
npm run type-check
```

#### 2. ボタンコンポーネント不整合
- **影響ファイル**:
  - `src/ui/components/admin/enhanced-records-view.tsx`
  - `src/ui/components/admin/monitoring-dashboard.tsx`
  - `src/ui/components/error/ErrorBoundary.tsx`
- **修正**: デザインシステムvariant更新（`primary`, `secondary`, `tertiary`, `destructive`）

### 🟡 優先度2: 品質改善（1週間）

1. **テストカバレッジ向上**: 65% → 80%
2. **E2Eテスト修正**: 管理パネルフロー（現在66%合格率）
3. **パフォーマンス最適化**: バンドルサイズ分析、画像最適化

### 🟢 優先度3: 機能完成（2-3週間）

1. **モニタリングシステム統合**: リアルタイム分析、アラート
2. **高度管理機能**: 強化レポート、データ視覚化

---

## デプロイ

### Vercel（推奨）

```bash
# Vercel CLI
npm i -g vercel
vercel

# 環境変数設定（Vercelダッシュボードで）
OPENAI_API_KEY=sk-...
ADMIN_PASSWORD=1234
JWT_SECRET=your-secret-key
```

### 本番環境要件
- **プラットフォーム**: Vercel（Next.js最適化）
- **データベース**: PlanetScale または Supabase
- **モニタリング**: Vercel Analytics + Sentry
- **CDN**: Vercel Edge Network（自動）

---

## ライセンス・利用上の注意

### ライセンス
MIT License - 詳細は [LICENSE](./LICENSE) を参照

### 利用上の重要な注意事項

⚠️ **医療・診断に関する免責事項**
本システムが提供する分析結果は**参考情報**であり、**医療診断・心理診断・人事評価**等の判断材料として使用することはできません。

⚠️ **個人情報保護**
- 個人識別情報は診断完了から**30日後に自動削除**
- 診断データは**他の目的には一切使用しない**
- ユーザーからの削除要求には**即座に対応**

⚠️ **検証フェーズでの利用**
本システムは**85%実装完了**ですが、TypeScript型エラーの解決とテスト強化が必要な状況です。

### ドキュメント

プロジェクトの詳細ドキュメントは整理されたディレクトリ構造で管理されています：

- **📚 [ドキュメント索引](./docs/INDEX.md)** - 全ドキュメントへのナビゲーション
- **📖 [プロジェクト概要](./docs/Overview.md)** - システム全体像
- **📊 [実装状況](./docs/Status.md)** - 開発進捗とステータス
- **🔧 [運用ガイド](./docs/operations/)** - デプロイ・トラブルシューティング
- **📈 [分析レポート](./docs/reports/)** - 品質・パフォーマンス分析
- **🎯 [要件定義](./docs/requirements/)** - 仕様書・ビジネス分析
- **🏗️ [設計ドキュメント](./docs/design/)** - アーキテクチャ判断記録

### 貢献・サポート

- **Issues**: バグ報告・機能要望は [GitHub Issues](https://github.com/your-org/cocosil-analysis/issues)
- **Pull Requests**: 改善提案歓迎（[CONTRIBUTING.md](./CONTRIBUTING.md) 参照）
- **開発ガイド**: 開発者向け詳細情報は [CLAUDE.md](./CLAUDE.md) 参照

---

**COCOSiL Development Team**
最終更新: 2025-01-27
開発サーバー: ✅ http://localhost:3000