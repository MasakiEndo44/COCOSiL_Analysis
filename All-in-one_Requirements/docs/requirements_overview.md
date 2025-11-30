# COCOSiL改良版 要件定義サマリー

**作成日**: 2025-11-05  
**目的**: 既存アプリ「COCOSiL」の改善要望を網羅しつつ、改良版の要件書を一元管理するためのハブドキュメント

---

## 1. プロジェクトゴールと対象範囲
- 生年月日ベースの算命学系診断と後天的診断（MBTI・体癖論・Big5）を統合し、AIチャット体験を最小入力で開始できるプラットフォームを構築
- Supabase + Clerk + Vercel の無料枠を前提とした運用を確立
- 旧アプリで挙がったUI/UX・診断精度・AI応答クオリティの課題をすべて改良版に反映
- 将来のプレミアム機能やiOS対応を見据えた設計（レスポンシブWebを優先し、PWA/ネイティブは後続）

---

## 2. 参照資料マップ
- **最新ドラフト**
  - `docs/0_completion_report.md`: ドキュメント完成状況レポート
  - `docs/1_system_requirements.md`: システム要件定義書
  - `docs/2_database_design.md`: DB/ER設計
  - `docs/3_api_specification.md`: API仕様
  - `docs/4_ui_design.md`, `docs/4_ui_design_v3_integrated.md`: 画面仕様
  - `docs/5_development_roadmap.md`: 10週間ロードマップ
  - `docs/6_test_cases.md`: テスト戦略
  - `docs/cocosil-requirements-confirmed.md`: 確定事項まとめ
- **旧仕様・要望**
  - `requirements(old)/20250903_COCOSiL_改善要望.md`: 最新のユーザー改善要望（UI/AI調整等）
  - `requirements(old)/detailed_requirements.md`: 旧アプリ詳細要件
  - `requirements(old)/ai-chat-redesign-requirements.md`, `requirements(old)/technical_specs.md` など: 技術・AI仕様の前提
  - `requirements(old)/frontend_flowchart.mermaid`, `requirements(old)/frontend_sequence.mermaid`: 旧UIフロー

---

## 3. 要件カバレッジ一覧
| カテゴリ | 主文書 | 補足・未決事項 |
| --- | --- | --- |
| プロダクト全体像 / 技術スタック | `docs/1_system_requirements.md`, `docs/cocosil-requirements-confirmed.md` | 9星気学の算出ロジック確定待ち。旧資料の算命学API改善要望を反映すること。 |
| データベース & RLS | `docs/2_database_design.md` | 体癖/MBTI/Big5の入力履歴要件（履歴か最新のみか）を旧仕様と揃っているか確認。 |
| API & AI連携 | `docs/3_api_specification.md`, `requirements(old)/ai-chat-redesign-requirements.md` | AI応答長（300文字）、論理的質問特化など旧要望を必ず反映。Agent Builder仕様は別途詳細化が必要。 |
| UI/UX | `docs/4_ui_design*.md`, `front_ui/` | 旧要望にあるボタン間隔・体癖カード表現・不要ボタン削除などを設計書とUIへ反映。 |
| 開発ロードマップ / 体制 | `docs/5_development_roadmap.md`, `docs/0_completion_report.md` | ロードマップは最新スプリント計画に合わせて見直しが必要（Phase 1開始時期未定）。 |
| テスト・品質保証 | `docs/6_test_cases.md` | AI応答の品質指標（300文字制限、論理性チェック）のテストケース追加が必要。 |
| 旧仕様トレーサビリティ | `docs/requirements_overview.md`（本書） | 旧資料の要望がどの文書に吸収されたかを随時更新する。 |

---

## 4. front_uiレビュー結果（2025-11-05時点）
### 4.1 実装済み画面のサマリー
- `/` ランディング: グラデーション背景、診断カードグリッド、CTAボタン2種、サービス/ヘルプ/法務/フォローの4カラムフッター
- `/sign-in`, `/sign-up`: Googleボタン + メールフォーム（ニックネーム/メール/パスワード/生年月日）構成
- `/onboarding`: 3ステップ（基本情報→目的→プライバシー）式のマルチステップフォーム、トグル/チェックボックス完備
- `/home`: 「おかえり」ヒーロー + クイックアクションカード（新しい診断/AIチャット/学習プロファイル）+ 最近の診断カード + AIインサイトカード + 固定ボトムナビ
- `/home/diagnosis`: 診断カード一覧（結果/日付/ステータス/アクション）と「新しい診断を追加」コンテナ
- `/home/chat`: バッジで利用回数を表示し、左右吹き出し + 入力フィールド + 送信ボタン
- `/home/results`: カテゴリ別カードリスト + サマリー数値 + PDF/CSVダウンロードボタン
- `/home/settings`: プロフィール編集、通知スイッチ、プライバシーリンク、データダウンロード、危険操作（アカウント削除）
- `/diagnosis/sanmeigaku`: タブ切替（概要/強み弱み/相性/アドバイス）、チャート表示、AIチャット誘導CTA

### 4.2 ドキュメント反映状況
- `docs/4_ui_design.md` において、主要導線のパス（`/home`, `/home/diagnosis` 等）、ボトムナビ、マルチステップオンボーディングの仕様を最新版に更新する必要あり（本タスクで対応中）
- `docs/3_api_specification.md` / `docs/6_test_cases.md` には AIチャット利用回数表示や診断再実行ボタン等のUIトリガーに紐づくエンドポイント・テストを追記予定
- `docs/cocosil-requirements-confirmed.md` に「診断結果のPDFダウンロード」「診断削除ボタンの扱い」などUIで新規発生した要素を確認事項として追記する必要がある

### 4.3 front_uiから判明した追加課題
- `/home/page.tsx` からリンクされる `/home/profile` 導線は、スクリーン未実装のため一旦削除する（学習プロファイルは今後改めて定義）
- 診断管理画面の「削除」ボタンは非表示とし、ON/OFFでの無効化のみに統一
- 診断結果エクスポートは **PDF + CSV** とし、AIチャットが自動生成する診断レポートも PDF ビューアから参照できるようにする
- Onboarding で「診断目的」「匿名データ利用」を取得しているが、DB/API側の保存項目が未定義

---

## 5. ギャップ & TODO
1. **算命学API整合性**  
   - 旧資料で指摘された星座・動物占い・六星占術の計算誤差を再検証し、API仕様＆テストケースに追記。
2. **9星気学ロジック確定**  
   - 算出方法・参照テーブル・暦補正の定義が未確定。決定後は DB設計・API・UIに一括反映。
3. **UI改善反映**  
   - 診断結果画面のボタン間隔、体癖タイプのタグ表示、不要ボタン削除、ボトムナビのIAなどを `docs/4_ui_design*.md` と `front_ui` の双方で同期。
4. **AIチャット要件の厳密化**  
   - 最大300文字、深掘り質問特化などを API仕様とテストケースに反映し、プロンプト/モデル設定の詳細ドキュメントを新規作成予定。
5. **トレーサビリティ表の整備**  
   - 旧要件→新要件の対応表を作成し、レビュープロセスで欠落がないかを確認。
6. **front_ui固有課題の仕様決定**  
   - `/home/profile` の導線を当面外す → セクション/ナビの整理を実施  
   - 診断削除ボタンは廃止し、ON/OFFのみ許容  
   - エクスポート形式は PDF + CSV に固定し、AIチャット自動レポートも PDF で閲覧可能にする  
   - Onboarding の「診断目的」「匿名データ利用」フィールドの保存先（DB/API）を設計

---

## 6. ドキュメント整備ロードマップ
1. **資料突合フェーズ**（担当: 要件定義者）  
   - 旧資料から改善項目を抽出し、本書「ギャップ & TODO」を更新。
2. **章別アップデート**（担当: 各領域オーナー）  
   - システム・DB・API・UI・テストへ並行反映。更新履歴は各ファイル冒頭に追記。
3. **UIプロト検証**（担当: フロントエンド）  
   - `front_ui` で主要画面を再現し、差分を `docs/4_ui_design*.md` にフィードバック。
4. **レビュー & 承認**  
   - `docs/cocosil-requirements-confirmed.md` に確定事項を追記し、未解決課題は次スプリントに持ち越し。
5. **最終要件書の固定**  
   - すべてのギャップが解消された後、PDF/共有用に最終バージョンをエクスポート。

---

本書は要件定義ワークのハブとして常に最新状態を保ち、変更が発生した際は参照資料マップとカバレッジ表を更新してください。
