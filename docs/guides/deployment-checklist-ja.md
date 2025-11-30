# デプロイチェックリスト - クイックリファレンス

**最終更新日:** 2025-10-30
**機能:** 診断履歴（フェーズ2.4-2.6）

---

## 🔴 BLOCKING（デプロイ前に必須）

### 1. テストのTypeScriptエラー修正
- [ ] `jest-mock-extended` と `@types/jest` をインストール
- [ ] `tests/helpers/prisma-mock.ts` を作成
- [ ] 3つのテストファイルすべてを新しいモックを使用するよう更新
- [ ] `npm run type-check` を実行 → エラー0
- [ ] `npm test` を実行 → すべて通過

**ファイル:**
- `tests/helpers/prisma-mock.ts` (新規作成)
- `src/__tests__/api/diagnosis/migrate.test.ts`
- `src/__tests__/api/diagnosis/history.test.ts`
- `src/__tests__/api/diagnosis/[id].test.ts`

**検証:**
```bash
npm run type-check  # エラー0を表示すること
npm test -- --runInBand --no-cache  # すべてのテストが通過
```

---

### 2. Supabase接続問題の修正
- [ ] Supabaseプロジェクトのステータス確認（一時停止されていないか）
- [ ] `.env.local`の`DATABASE_URL`を確認
- [ ] 接続テスト: `npx prisma db push --skip-generate`
- [ ] 管理者チェックの実行: `node scripts/admin/check-admin.js`

**クイックテスト:**
```bash
ping db.htcwkmlkaywglqwdxbrb.supabase.co
npx prisma studio  # 正常に開くこと
```

---

### 3. 詳細ページの実装
- [ ] `/dashboard/history/[id]/page.tsx` を作成
- [ ] `diagnosis-detail-view.tsx` コンポーネントを作成
- [ ] 認証チェックを追加
- [ ] 認可チェックを追加（ユーザーがレコードを所有）
- [ ] ナビゲーションテスト: 履歴カード → 詳細ページ

**検証:**
```bash
npm run type-check
npm run lint
# 手動: /dashboard/history からカードをクリック → 詳細が読み込まれること
```

---

## 🟡 PRE-DEPLOY（強く推奨）

### 4. コード品質
- [ ] `npm run lint` → 警告0
- [ ] `npm run type-check` → エラー0
- [ ] `npm run format`（Prettierを使用している場合）

---

### 5. データベースマイグレーション
- [ ] ステージングデータベースでマイグレーションをテスト
- [ ] 新しいカラムが存在することを確認: `clerkUserId`
- [ ] 新しいインデックスが存在することを確認: `(clerkUserId, createdAt)`
- [ ] ロールバックSQLをドキュメント化

**ステージングテスト:**
```bash
npx prisma migrate deploy
npx prisma db pull  # スキーマが一致することを確認
```

---

### 6. 手動スモークテスト

#### 匿名ユーザーフロー
- [ ] サインインせずに診断を完了
- [ ] localStorageに`cocosil_diagnosis_data`があることを確認
- [ ] Clerkでサインアップ
- [ ] マイグレーショントーストが表示されることを確認
- [ ] localStorageがクリアされることを確認
- [ ] `/dashboard/history`に移動 → マイグレーションされたレコードが表示

#### 認証済みユーザーフロー
- [ ] `/dashboard/history`に移動
- [ ] カードが正しく表示されることを確認
- [ ] カードをクリック
- [ ] 詳細ページに完全な診断が表示されることを確認
- [ ] 戻るボタン → 履歴リストに戻る

#### ページネーション
- [ ] 20件以上のレコードがある場合、「さらに表示」ボタンが表示されることを確認
- [ ] 「さらに表示」をクリック
- [ ] 次のバッチが読み込まれることを確認

#### セキュリティ
- [ ] ログアウト
- [ ] `/dashboard/history`を試す → サインインにリダイレクト
- [ ] 別のユーザーとしてログイン
- [ ] 他のユーザーの診断IDにアクセス → 404

---

### 7. 環境変数
- [ ] `.env.local`（開発）に必要な変数がすべて存在
- [ ] Vercel/本番環境に必要な変数がすべて存在
- [ ] Clerkキー: 本番環境では test → live
- [ ] `ADMIN_PASSWORD`を`5546`から安全なパスワードに変更

**必要な変数:**
```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
OPENAI_API_KEY
ADMIN_PASSWORD
```

---

### 8. 本番ビルド
- [ ] `npm run build`を実行 → エラーなく完了
- [ ] バンドルサイズの警告なし（>244 KB）
- [ ] ローカルでテスト: `npm run start`
- [ ] すべてのページが正しくレンダリング

**ビルドチェック:**
```bash
npm run build 2>&1 | tee build.log
grep -i "error\|warning" build.log
```

---

## 🟢 POST-DEPLOY（ローンチ後でも可）

### 9. E2Eテストセットアップ
- [ ] `@clerk/testing`をインストール
- [ ] `tests/auth.setup.ts`を作成
- [ ] Clerk用にPlaywrightを設定
- [ ] `tests/e2e/diagnosis-history.spec.ts`のテストのスキップを解除
- [ ] `npm run test:e2e`を実行 → すべて通過

---

### 10. UX改善
- [ ] マイグレーション中のローディングスピナーを追加
- [ ] リトライロジック付きのエラー状態を追加
- [ ] マイグレーション後の成功トーストを追加
- [ ] マイグレーション進行状況インジケータを追加

---

## クイックコマンドリファレンス

```bash
# 型チェック
npm run type-check

# リント
npm run lint

# テスト
npm test -- --runInBand --no-cache

# ビルド
npm run build

# データベース
npx prisma migrate deploy
npx prisma studio

# 管理者ツール
node scripts/admin/check-admin.js
node scripts/admin/seed-admin.js
```

---

## 緊急ロールバック

デプロイ後に重大な問題が見つかった場合:

```bash
# データベースロールバック
psql $DATABASE_URL -c "ALTER TABLE diagnosis_records DROP COLUMN clerkUserId;"

# コードロールバック
git revert HEAD~1
vercel --prod

# 機能フラグで無効化
# Vercelで NEXT_PUBLIC_ENABLE_HISTORY=false に設定
```

---

## 最終Go/No-Go判断

**すべてのBLOCKING項目にチェックが入った場合にデプロイ:**
- ✅ TypeScriptエラー修正済み
- ✅ Supabase接続が機能
- ✅ 詳細ページ実装済み
- ✅ Lint通過
- ✅ テスト通過
- ✅ ビルド成功
- ✅ スモークテスト通過
- ✅ 環境変数設定済み

**ステータス:** ⏳ **未準備** - BLOCKING項目3つが残っています

---

## デプロイ後の監視

**最初の24時間:**
- [ ] 2時間ごとにエラーログを確認
- [ ] マイグレーション成功率を監視
- [ ] パフォーマンス低下がないか確認
- [ ] 詳細ページでの404エラーを監視
- [ ] データベース接続エラーを確認

**成功指標:**
- マイグレーション成功率: >95%
- 履歴ページ読み込み時間: <500ms
- 詳細ページ読み込み時間: <300ms
- 重大なエラーゼロ
- ユーザーからの苦情なし

---

**詳細ドキュメント:**
- 完全デプロイガイド: `docs/deployment-roadmap-ja.md`
- 実装サマリー: `docs/diagnosis-history-phase2-implementation-summary.md`
- 元の計画: `docs/diagnosis-history-implementation-plan.md`
