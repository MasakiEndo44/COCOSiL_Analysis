# COCOSiL 改良版 要件定義プロジェクト

COCOSiL（ココシル）の既存アプリを刷新するための要件定義・設計用リポジトリです。`/requirements(old)` に保管された従来資料と、`/docs` 配下の最新ドラフト、`/front_ui` のV0プロトタイプをつなぎ合わせ、ユーザー要望を余さず反映した改良版要件を確定させることを目的としています。

## ディレクトリ概要
- `docs/` — 改良版アプリ向けの要件定義一式（システム要件、DB設計、API仕様、UI設計、テスト計画、確定済み要件サマリーなど）
- `requirements(old)/` — 既存アプリの仕様・改善要望・ビジネス分析資料。ユーザー要望の出典として必ず参照
- `front_ui/` — V0で生成したNext.js（App Router）プロトタイプ。要件ドキュメントに準拠しているかを検証するためのUI作業領域
- `README.md` — プロジェクトの進め方と資料ナビゲーション

## ドキュメントセットと読み順
1. `docs/requirements_overview.md`（本日作成）でゴール、参照資料、ギャップ、今後の整備計画を把握
2. `docs/cocosil-requirements-confirmed.md` で確定済み領域と未決事項を確認
3. 詳細検討は `docs/1_system_requirements.md` → `docs/2_database_design.md` → `docs/3_api_specification.md` → `docs/4_ui_design*.md` → `docs/5_development_roadmap.md` → `docs/6_test_cases.md` の順に参照
4. 旧仕様や改善リクエストは `requirements(old)/20250903_COCOSiL_改善要望.md` や `requirements(old)/detailed_requirements.md` など該当資料を参照し、差分を吸い上げる

## 作業フロー（推奨）
1. `requirements(old)` の要望と `docs` の現行案を突き合わせ、`docs/requirements_overview.md` のギャップ一覧を更新
2. ギャップ解消のために各ドキュメントへ反映（例: 設計変更は `docs/2_database_design.md`、UI調整は `docs/4_ui_design*.md`）
3. UI変更が必要な場合は `front_ui` で検証し、スクリーンショットや検証結果を該当ドキュメントへフィードバック
4. 変更内容は Pull Request または変更ログで追跡し、確定済み事項は `docs/cocosil-requirements-confirmed.md` に反映

## front_ui のセットアップ
開発には Node.js 18+ と pnpm を推奨します。

```bash
cd front_ui
pnpm install
pnpm dev
```

Lint/型チェック:

```bash
pnpm lint
pnpm typecheck # tsconfigの設定に合わせて npm-run-script を追加してください
```

## 今後の主なタスク
- 9星気学の算出ロジック確定とドキュメント反映（`docs/cocosil-requirements-confirmed.md` の未決事項）
- `requirements(old)` で挙がったUI/UX改善要望（例: ボタン間隔調整、体癖タイプ表現）を `docs/4_ui_design*.md` および `front_ui` に反映
- AIチャット仕様の再検証（最大300文字出力・論理的質問特化など）と `docs/3_api_specification.md` への反映

このREADMEは、要件定義作業を円滑に進めるためのナビゲーションとして適宜更新してください。
