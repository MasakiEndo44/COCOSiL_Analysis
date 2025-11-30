# COCOSiL ドキュメント索引

## 📋 プロジェクト概要
COCOSiL（ココシル）は、体癖理論・MBTI・算命学・動物占いを統合した包括的な性格診断システムです。

**技術スタック**: Next.js 14, TypeScript, Zustand, OpenAI API, Tailwind CSS

## 🗂️ ドキュメント構成

### 📖 概要・ステータス
- [プロジェクト概要](./Overview.md) - プロジェクトの全体像と主要機能
- [実装状況](./Status.md) - 各機能の実装進捗とステータス
- [実装サマリー](./implementation/IMPLEMENTATION_SUMMARY.md) - 完了機能の詳細まとめ

### 🏗️ アーキテクチャ・設計
- [アーキテクチャ分析](./reports/architecture-analysis-report.md) - システム全体の設計分析
- [AIチャットシステム設計](./design/ai-chat-system-design.md) - AI統合分析チャットの設計
- [Phase2アーキテクチャ決定事項](./design/phase2-architecture-decisions.md) - 主要な設計判断の記録
- [コードベース接続冗長性分析](./reports/codebase-connectivity-redundancy-analysis.md) - 接続冗長性の分析

### 🔧 運用ガイド
- [Vercelデプロイメントガイド](./guides/VERCEL_DEPLOYMENT_GUIDE.md) - Vercel環境への配置手順
- [Supabaseデプロイメント](./operations/SUPABASE_DEPLOYMENT.md) - Supabase統合設定
- [パスワードリセット手順](./operations/PASSWORD_RESET_GUIDE.md) - 管理者パスワードのリセット方法
- [デプロイメント修正手順](./operations/DEPLOYMENT_FIX.md) - デプロイ問題のトラブルシューティング
- [Vercelログイン修正](./operations/VERCEL_LOGIN_FIX_URGENT.md) - ログイン問題の緊急対応
- [Clerk Phase1 デプロイガイド](./guides/clerk-phase1-deployment-guide.md)
- [Clerk Phase1 手動テストガイド](./guides/clerk-phase1-manual-testing-guide.md)
- [デプロイチェックリスト (JA)](./guides/deployment-checklist-ja.md)
- [デプロイチェックリスト (EN)](./guides/deployment-checklist.md)
- [SC Codex統合](./guides/sc-codex-integration.md)
- [SC Codexテストガイド](./guides/sc-codex-testing-guide.md)
- [算命学計算ガイド](./guides/sanmeigaku-calculation-guide.md)
- [バックフィルスクリプトノート](./guides/backfill-script-notes.md)

### 📊 API・実装
- [Fortune API v2要件](./api/fortune-api-requirements-v2.md) - 算命学計算APIの仕様
- [Fortune API検証設計](./api/fortune-api-verification-design.md) - APIテスト戦略
- [実装ロードマップv2](./api/implementation-roadmap-v2.md) - API実装計画
- [AIチャット完了検出実装計画](./implementation/ai-chat-completion-implementation-plan.md)
- [診断履歴実装計画](./implementation/diagnosis-history-implementation-plan.md)
- [診断履歴Phase2実装サマリー](./implementation/diagnosis-history-phase2-implementation-summary.md)

### 📝 要件定義
- [詳細要件仕様](./requirements/detailed_requirements.md) - システム要件の詳細
- [技術仕様](./requirements/technical_specs.md) - 技術的制約と仕様
- [ビジネス分析](./requirements/cocosil_comprehensive_business_analysis.md) - 事業分析
- [AIチャット再設計要件](./requirements/ai-chat-redesign-requirements.md) - チャット機能の要件
- [UI/UX要件定義](./requirements/ココシル_uiux要件定義_v_1.md) - デザイン要件
- [管理者検索改善仕様](./requirements/admin-search-improvement-spec.md)
- [AIチャット完了検出仕様](./requirements/ai-chat-completion-detection-spec.md)

### 🔬 分析・リサーチ
- [AIチャットフェーズ遷移戦略](./analysis/ai-chat-phase-transition-strategy.md) - 段階的実装戦略
- [依存関係分析Phase2](./analysis/dependency-analysis-phase2.md) - 依存性の分析
- [QA条件付きフロー図](./analysis/qa-conditional-flow-diagram.md) - QAフローの可視化
- [QAリスト設計仕様](./analysis/qa-list-design-specification.md) - Q&Aシステム設計
- [体癖タイプリサーチ](./research/taiheki-types-research.md) - 体癖理論の調査

### 🚀 計画・ワークフロー
- [AIチャット実装計画](./implementation/ai-chat-implementation-plan.md) - チャット機能の実装手順
- [Phase2実装ワークフロー](./implementation/phase2-implementation-workflow.md) - フェーズ2の実装計画
- [即時実行プラン](./workflows/immediate-action-plan.md) - 優先タスクの実行計画
- [体癖精度改善ワークフロー](./workflows/taiheki-accuracy-improvement-workflow.md) - 診断精度向上施策
- [デプロイロードマップ (JA)](./planning/deployment-roadmap-ja.md)
- [デプロイロードマップ (EN)](./planning/deployment-roadmap.md)
- [パフォーマンステスト戦略](./planning/performance-test-strategy.md)

### 📈 テスト・パフォーマンス
- [パフォーマンス分析](./reports/performance-analysis-report.md) - システム全体のパフォーマンス
- [オーバーレイパフォーマンス分析](./reports/overlay-performance-analysis-report.md) - UI要素の最適化
- [TypeScriptエラー解決レポート](./reports/TYPESCRIPT_ERROR_RESOLUTION_REPORT.md) - 型エラーの修正記録
- [Playwright実装結果](./reports/playwright-implementation-results.md)
- [Playwrightテスト結果 (2025-11-04)](./reports/playwright-test-results-2025-11-04.md)

### 📚 レポート
- [404トラブルシューティング](./reports/404-troubleshooting-report.md) - ページ表示問題の調査
- [管理UI テストカバレッジ](./reports/admin-ui-test-coverage-report.md) - 管理画面のテスト状況
- [AIチャット品質分析](./reports/ai-chat-quality-analysis-report.md) - チャット機能の品質評価
- [選択式質問システム設計](./reports/choice-question-system-design.md) - 質問形式の設計
- [包括的実装ワークフロー](./reports/comprehensive-implementation-workflow.md) - 全体実装計画
- [実装仕様書](./reports/implementation-specifications.md) - 詳細実装ドキュメント
- [統合テストカバレッジ](./reports/integration-test-coverage-report.md) - E2Eテスト状況
- [ランディングページUIトラブルシューティング](./reports/landing-page-ui-troubleshooting-report.md) - トップページ問題調査
- [心理的安全性プロンプト設計](./reports/psychological-safety-prompt-design.md) - AIプロンプト設計
- [心理的安全性UI/UX設計](./reports/psychological-safety-ui-ux-design.md) - UX配慮設計
- [クリーンアップレポート (2025-10-08)](./reports/cleanup-report-2025-10-08.md)
- [Epic1 UXフィードバック](./reports/epic1-ux-feedback-points.md)

### 🛠️ トラブルシューティング
- [Vercelビルドエラー修正](./troubleshooting/VERCEL_BUILD_ERROR_FIX.md)

### 🔍 リファレンス
- [データベース資料](./reference/Database/) - 診断データベース定義
  - [動物占い12種](./reference/Database/animal_12.md)
  - [動物占い60種](./reference/Database/animal_60.md)
  - [MBTI 16種](./reference/Database/mbti_16.md)
  - [体癖10種](./reference/Database/taiheki_10.md)
  - [星座12種](./reference/Database/zodiac_12.md)
- [コンプライアンスガイドライン](./guides/compliance-guidelines.md) - 倫理規定
- [ページ識別ガイド](./guides/page-identification-guide.md) - ページ構成の説明

### 📦 アーカイブ
- [旧Fortune計算システム](./archive/legacy-fortune-system/) - 廃止された算命学計算実装
- [動物ナンバー対応表](./archive/20250824_どうぶつナンバー_対応表.md) - 旧データ形式
- [HTML モックアップ](./archive/) - 初期プロトタイプファイル群

## 🚀 クイックスタート

### 開発環境セットアップ
```bash
npm install
npm run dev
```

### ドキュメント参照の推奨順序
1. [プロジェクト概要](./Overview.md) → システム全体像の把握
2. [実装状況](./Status.md) → 現在の開発ステータス確認
3. [アーキテクチャ分析](./reports/architecture-analysis-report.md) → 設計思想の理解
4. 各機能別ドキュメント → 詳細実装の理解

## 📝 ドキュメント更新ルール
- **運用ガイド**: `docs/operations/`, `docs/guides/` - デプロイ・トラブルシューティング
- **分析レポート**: `docs/reports/` - 分析・設計ドキュメント
- **要件定義**: `docs/requirements/` - プロダクト仕様書
- **アーキテクチャ**: `docs/design/`, `docs/reports/architecture-analysis-report.md` - 設計判断記録
- **実装計画**: `docs/implementation/`, `docs/planning/` - 実装計画とロードマップ
- **アーカイブ**: `docs/archive/` - 廃止済み・参考資料

## 🔗 関連リソース
- [README.md](../README.md) - プロジェクトルートの基本情報
- [CLAUDE.md](../CLAUDE.md) - Claude Code向け開発ガイド
- [src/app/](../src/app/) - Next.js App Router実装
- [tests/](../tests/) - E2Eテストスイート

---

**最終更新**: 2025-11-30
**ドキュメント整理**: ドキュメントリファクタリングタスクによる更新

