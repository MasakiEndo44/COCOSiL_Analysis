# COCOSiL Dashboard ソースコード抽出

## 概要

COCOSiL V0の管理者ダッシュボード（`/admin` ルート）に関連するソースコードを抽出したドキュメントです。  
新バージョンへの流用を目的として、過不足なくファイルを特定しています。

---

## ファイル構成（完全リスト）

### 1. ページコンポーネント（`src/app/admin/`）

| ファイルパス | サイズ | 説明 |
|-------------|--------|------|
| [layout.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/admin/layout.tsx) | 835B | 管理画面レイアウト（Suspense + AdminProvider） |
| [page.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/admin/page.tsx) | 581B | 管理画面トップページ（認証切替） |
| [monitoring/page.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/admin/monitoring/page.tsx) | 1.8KB | システム監視ダッシュボード |
| [records/[id]/edit/page.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/admin/records/%5Bid%5D/edit/page.tsx) | 2.4KB | 記録編集ページ |

---

### 2. UIコンポーネント（`src/ui/components/admin/`）

| ファイルパス | サイズ | 説明 |
|-------------|--------|------|
| [admin-dashboard.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/admin-dashboard.tsx) | 12.4KB | メインダッシュボードコンポーネント |
| [admin-header.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/admin-header.tsx) | 1.5KB | ヘッダーナビゲーション |
| [admin-sidebar.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/admin-sidebar.tsx) | 2.8KB | サイドバーメニュー |
| [admin-provider.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/admin-provider.tsx) | 1.1KB | コンテキストプロバイダー |
| [admin-markdown-modal.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/admin-markdown-modal.tsx) | 5.1KB | Markdown表示モーダル |
| [diagnosis-table.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/diagnosis-table.tsx) | 13.0KB | 診断結果一覧テーブル |
| [enhanced-records-view.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/enhanced-records-view.tsx) | 16.3KB | 拡張記録ビュー |
| [export-form.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/export-form.tsx) | 6.6KB | データエクスポートフォーム |
| [interview-modal.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/interview-modal.tsx) | 8.2KB | インタビューモーダル |
| [monitoring-dashboard.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/monitoring-dashboard.tsx) | 14.5KB | 監視ダッシュボード |
| [record-form-modal.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/record-form-modal.tsx) | 18.9KB | 記録編集モーダル |
| [stats-overview.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/components/admin/stats-overview.tsx) | 7.0KB | 統計概要コンポーネント |

---

### 3. 管理機能コンポーネント（`src/ui/features/admin/`）

| ファイルパス | サイズ | 説明 |
|-------------|--------|------|
| [admin-login.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/features/admin/admin-login.tsx) | 3.8KB | 管理者ログインフォーム（4桁PIN） |
| [record-edit-form.tsx](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/ui/features/admin/record-edit-form.tsx) | 28.3KB | 記録編集フォーム |

---

### 4. API Routes（`src/app/api/admin/`）

| ファイルパス | 説明 |
|-------------|------|
| [login/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/login/route.ts) | ログイン認証API |
| [logout/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/logout/route.ts) | ログアウトAPI |
| [reset-password/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/reset-password/route.ts) | パスワードリセットAPI |
| [records/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/records/route.ts) | 記録一覧取得API |
| [records/[id]/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/records/%5Bid%5D/route.ts) | 個別記録CRUD API |
| [records/[id]/generate-markdown/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/records/%5Bid%5D/generate-markdown/route.ts) | Markdown生成API |
| [diagnosis-results/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/diagnosis-results/route.ts) | 診断結果取得API |
| [export/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/export/route.ts) | データエクスポートAPI |
| [interviews/[id]/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/interviews/%5Bid%5D/route.ts) | インタビューAPI |
| [monitoring/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/monitoring/route.ts) | モニタリングデータAPI |
| [stats/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/stats/route.ts) | 統計情報API |
| [reports/[id]/route.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/app/api/admin/reports/%5Bid%5D/route.ts) | レポート生成API |

---

### 5. 認証・セッション管理（`src/lib/`）

| ファイルパス | サイズ | 説明 |
|-------------|--------|------|
| [jwt-session.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/jwt-session.ts) | 1.8KB | **JWT署名・検証**（jose使用、8時間有効） |
| [admin-middleware.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/admin-middleware.ts) | 1.1KB | **セッション取得・認証ミドルウェア** |
| [admin-session-server.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/admin-session-server.ts) | 631B | **サーバーサイドセッション取得** |
| [admin-auth.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/admin-auth.ts) | 4.4KB | 認証ロジック |
| [admin-db.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/admin-db.ts) | 348B | 管理者DB接続 |
| [admin-diagnosis-converter.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/admin-diagnosis-converter.ts) | 5.2KB | 診断データ変換 |
| [build-diagnosis-markdown.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/build-diagnosis-markdown.ts) | 7.7KB | Markdownビルダー |

---

### 6. ミドルウェア（ルート認証）

| ファイルパス | サイズ | 説明 |
|-------------|--------|------|
| [middleware.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/middleware.ts) | 4.0KB | **Clerk + JWT ハイブリッド認証**（admin/はJWT独立） |

---

### 7. モニタリングライブラリ（`src/lib/monitoring/`）

| ファイルパス | サイズ | 説明 |
|-------------|--------|------|
| [index.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/monitoring/index.ts) | 7.1KB | エントリポイント |
| [aggregator.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/monitoring/aggregator.ts) | 16.9KB | メトリクス集約 |
| [collector.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/monitoring/collector.ts) | 11.5KB | データ収集 |
| [hooks.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/monitoring/hooks.ts) | 10.7KB | Reactフック |
| [middleware.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/monitoring/middleware.ts) | 10.6KB | モニタリングミドルウェア |
| [queue.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/monitoring/queue.ts) | 11.4KB | メトリクスキュー |
| [schema.ts](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/src/lib/monitoring/schema.ts) | 4.2KB | データスキーマ |

---

### 8. データベース

| ファイルパス | 説明 |
|-------------|------|
| [prisma/schema.prisma](file:///Users/masaki/Downloads/COCOSiL_Analysis-0/prisma/schema.prisma) | Prismaスキーマ（管理者・診断記録テーブル） |

---

## 依存関係

### npm パッケージ
```json
{
  "jose": "JWTトークン署名・検証",
  "@clerk/nextjs": "一般ユーザー認証（管理者は別レルム）",
  "prisma": "DB ORM",
  "recharts": "グラフ表示（monitoring-dashboard）",
  "@radix-ui/react-tabs": "タブUI"
}
```

### 環境変数
```bash
ADMIN_PASSWORD=1234          # 4桁PIN
JWT_SECRET=your-secret-key   # JWT署名鍵
```

---

## アーキテクチャ特記事項

### 認証フロー
```
/admin → middleware.ts → JWT検証 → admin-dashboard.tsx or admin-login.tsx
/api/admin/* → 各route.tsで個別にJWT検証
```

### データ管理
- **管理者セッション**: Cookie (`admin-session`) + JWT (8時間有効)
- **診断記録**: SQLite (Prisma) + localStorage (クライアント)

---

## 注意事項

> [!IMPORTANT]
> - `middleware.ts`はClerk認証も使用しているため、管理者機能のみ抽出する場合はJWT部分を分離
> - `admin-dashboard.tsx`は`session`オブジェクトを受け取る設計
> - TypeScriptエラー147個存在（主にButtonコンポーネントvariant不整合）
