# デプロイロードマップ - 診断履歴機能

**日付:** 2025-10-30
**デプロイ予定:** 未定
**現在のステータス:** 実装完了、デプロイ前の修正が必要

---

## 優先度の分類

### 🔴 BLOCKING（デプロイ前に必須）

本番環境デプロイを妨げる、または重大な障害を引き起こす問題。

### 🟡 PRE-DEPLOY（デプロイ前に推奨）

本番環境への準備状態を保証する重要な検証。

### 🟢 POST-DEPLOY（デプロイ後でも可）

初期リリースをブロックしない、あると良い改善項目。

---

## 🔴 BLOCKING（必須対応事項）

### 1. Jest/Prisma TypeScript エラーの修正

**優先度:** 最重要
**ステータス:** ❌ 未着手
**予想時間:** 2-3時間
**ブロック内容:** CI/CDパイプライン、型安全性の保証

**現在の問題:**
```
src/__tests__/api/diagnosis/[id].test.ts(104,40): error TS2339: Property 'mockResolvedValue' does not exist on type...
src/__tests__/api/diagnosis/history.test.ts(91,39): error TS2339: Property 'mockResolvedValue' does not exist on type...
src/__tests__/api/diagnosis/migrate.test.ts(81,41): error TS2339: Property 'mockResolvedValue' does not exist on type...
```

**根本原因:**
- Prismaクライアントのメソッドが適切にJestの型付けでモック化されていない
- jest.Mocked<PrismaClient>の適切なTypeScript定義が不足

**解決手順:**

1. **必要なパッケージのインストール:**
```bash
npm install -D jest-mock-extended @types/jest
```

2. **Prismaモックヘルパーの作成:**
```typescript
// tests/helpers/prisma-mock.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
```

3. **テスト内のJestモックの更新:**
```typescript
// 既存のモックを以下に置き換え:
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  db: prismaMock,
}));
```

4. **tsconfig.jest.jsonの更新:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "react",
    "esModuleInterop": true,
    "isolatedModules": false,
    "types": ["jest", "node"]
  }
}
```

**検証方法:**
```bash
npm run type-check  # エラー0で通過すること
npm test -- --runInBand --no-cache  # すべてのテストが通過すること
```

**修正対象ファイル:**
- `tests/helpers/prisma-mock.ts` (新規作成)
- `src/__tests__/api/diagnosis/migrate.test.ts`
- `src/__tests__/api/diagnosis/history.test.ts`
- `src/__tests__/api/diagnosis/[id].test.ts`
- `tsconfig.json` または `tsconfig.jest.json`を新規作成

---

### 2. Supabase接続エラーのデバッグ

**優先度:** 最重要（本番環境に影響する場合）
**ステータス:** ❌ 未着手
**予想時間:** 1-2時間
**ブロック内容:** 開発環境での管理者認証

**現在のエラー:**
```
Can't reach database server at `db.htcwkmlkaywglqwdxbrb.supabase.co:5432`
```

**診断手順:**

1. **ネットワーク接続の確認:**
```bash
ping db.htcwkmlkaywglqwdxbrb.supabase.co
telnet db.htcwkmlkaywglqwdxbrb.supabase.co 5432
```

2. **環境変数の確認:**
```bash
# .env.localに正しいDATABASE_URLがあるか確認
cat .env.local | grep DATABASE_URL

# Prismaで接続テスト
npx prisma db push --skip-generate
```

3. **Supabaseダッシュボードの確認:**
- データベースが稼働中か確認（一時停止されていないか）
- コネクションプーラーの設定を確認
- IPアロウリストが有効な場合は確認

4. **直接接続のテスト:**
```typescript
// scripts/test-db-connection.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ データベース接続成功');
    const count = await prisma.diagnosisRecord.count();
    console.log(`診断レコード数: ${count}`);
  } catch (error) {
    console.error('❌ データベース接続失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

**よくある修正方法:**
- Supabaseプロジェクトが一時停止（ダッシュボードから再起動）
- 接続文字列の誤り（タイポの確認）
- SSLモードの不一致（DATABASE_URLに`?sslmode=require`を追加）
- コネクションプーラーが必要（直接接続ではなくプーラーURLを使用）

**検証方法:**
```bash
npm run ts-node scripts/test-db-connection.ts
node scripts/admin/check-admin.js  # 正常に接続できること
```

---

### 3. /dashboard/history/[id] 詳細ページの実装

**優先度:** 高
**ステータス:** ❌ 未着手
**予想時間:** 3-4時間
**ブロック内容:** 履歴カードからのユーザーナビゲーション（404エラー）

**要件:**
- 完全な診断レコードの詳細を表示
- サーバーサイド認証チェック
- 認可（ユーザーは自分の診断のみ閲覧可能）
- アプリのスタイルに合ったレスポンシブデザイン
- 履歴リストへの戻るリンク

**実装手順:**

1. **動的ルートページの作成:**
```typescript
// src/app/dashboard/history/[id]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/prisma';
import { DiagnosisDetailView } from '@/features/dashboard/diagnosis-detail-view';

export const dynamic = 'force-dynamic';

export default async function DiagnosisDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard/history/' + params.id);
  }

  const recordId = parseInt(params.id, 10);
  if (isNaN(recordId)) {
    notFound();
  }

  const record = await db.diagnosisRecord.findFirst({
    where: {
      id: recordId,
      clerkUserId: userId,
    },
  });

  if (!record) {
    notFound();
  }

  return <DiagnosisDetailView record={record} />;
}
```

2. **詳細ビューコンポーネントの作成:**
```typescript
// src/ui/features/dashboard/diagnosis-detail-view.tsx
interface DiagnosisDetailViewProps {
  record: DiagnosisRecord;
}

export function DiagnosisDetailView({ record }: DiagnosisDetailViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 戻るボタン付きヘッダー */}
        {/* 基本情報セクション */}
        {/* MBTI結果 */}
        {/* 体癖結果 */}
        {/* 運勢結果 */}
        {/* 六星占術結果 */}
        {/* AI要約（利用可能な場合） */}
      </div>
    </div>
  );
}
```

3. **メタデータ生成の追加:**
```typescript
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `診断結果 #${params.id} | COCOSiL`,
    description: '診断結果の詳細を確認できます',
  };
}
```

**検証方法:**
```bash
npm run type-check
npm run lint
# 手動テスト: /dashboard/history → カードをクリック → 詳細ページが読み込まれることを確認
```

**作成ファイル:**
- `src/app/dashboard/history/[id]/page.tsx`
- `src/ui/features/dashboard/diagnosis-detail-view.tsx`

---

## 🟡 デプロイ前チェックリスト

### 4. 完全なLintと型チェックの実行

**コマンド:**
```bash
npm run lint
npm run type-check
npm run format  # Prettierを使用している場合
```

**期待される出力:**
```
✓ ESLintの警告やエラーなし
✓ TypeScriptエラーなし
✓ コードが適切にフォーマットされている
```

**よくある問題の修正:**
- 未使用のインポート → 削除
- `any`型 → 適切な型に置き換え
- 戻り値の型が不足 → 明示的な型を追加
- アクセシビリティの警告 → ARIA属性を修正

---

### 5. ステージング環境でのデータベースマイグレーションテスト

**手順:**

1. **ステージングデータベースの作成:**
```bash
# Supabaseを使用している場合、ステージングプロジェクトを作成
# .env.stagingにステージング用のDATABASE_URLを設定
```

2. **マイグレーションの実行:**
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

3. **マイグレーションの確認:**
```bash
npx prisma db pull  # schema.prismaと一致することを確認
npx prisma studio  # テーブルの視覚的確認
```

4. **ロールバック計画のテスト:**
```sql
-- ロールバック用SQLのドキュメント化
ALTER TABLE "diagnosis_records" DROP COLUMN "clerkUserId";
DROP INDEX "diagnosis_records_clerkUserId_createdAt_idx";
```

**検証:**
- マイグレーションがエラーなく完了
- 新しいカラムとインデックスがデータベースに存在
- 既存データが保持されている
- ロールバックSQLが独立してテストされている

---

### 6. 手動スモークテスト

**テストフロー:**

1. **匿名ユーザー → サインアップ → マイグレーション:**
   - [ ] 匿名で診断を完了
   - [ ] localStorageにデータがあることを確認
   - [ ] Clerkでサインアップ
   - [ ] マイグレーションが完了することを確認
   - [ ] localStorageがクリアされることを確認
   - [ ] データベースレコードにclerkUserIdがあることを確認

2. **履歴の閲覧:**
   - [ ] `/dashboard/history`に移動
   - [ ] 診断カードが表示されることを確認
   - [ ] 20件以上ある場合はページネーションを確認
   - [ ] 「さらに表示」ボタンが機能することを確認

3. **詳細の閲覧:**
   - [ ] 診断カードをクリック
   - [ ] 詳細ページが読み込まれることを確認
   - [ ] すべての診断データが表示されることを確認
   - [ ] 戻るボタンが機能することを確認

4. **セキュリティ:**
   - [ ] ログアウト
   - [ ] `/dashboard/history`にアクセス → サインインにリダイレクト
   - [ ] `/dashboard/history/123`にアクセス → サインインにリダイレクト
   - [ ] 別のユーザーとしてログイン
   - [ ] 他のユーザーの診断IDにアクセス → 404

**必要なテストアカウント:**
- 匿名ユーザー（アカウントなし）
- 既存の診断があるユーザーA
- 診断がないユーザーB

---

### 7. 環境変数の確認

**開発環境 (.env.local):**
```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
OPENAI_API_KEY="sk-..."
ADMIN_PASSWORD="5546"
```

**本番環境 (.env.production または Vercel):**
```bash
DATABASE_URL="postgresql://..."  # 本番用Supabase
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."  # 本番用Clerk
CLERK_SECRET_KEY="sk_live_..."
OPENAI_API_KEY="sk-..."
ADMIN_PASSWORD="[安全なパスワード]"  # 開発用パスワードから変更
```

**検証:**
```bash
# 必要な変数がすべて設定されているか確認
node -e "console.log(process.env.DATABASE_URL ? '✓ DATABASE_URL' : '✗ DATABASE_URL missing')"
node -e "console.log(process.env.CLERK_SECRET_KEY ? '✓ CLERK_SECRET_KEY' : '✗ CLERK_SECRET_KEY missing')"
```

---

### 8. 本番ビルドの検証

**コマンド:**
```bash
npm run build
npm run start  # 本番ビルドをローカルでテスト
```

**確認事項:**
- [ ] ビルドがエラーなく完了
- [ ] 大きなバンドルに関する警告なし（>244 KB）
- [ ] すべてのページが正しくプリレンダリング
- [ ] APIルートがコンパイル
- [ ] 静的アセットが最適化

**よくある問題:**
- クライアントコンポーネントがサーバー専用コードをインポート
- ビルド中に環境変数が不足
- 循環依存
- バンドルに大量のnode_modules

**修正:**
```bash
# バンドルを分析
npm run analyze

# 問題を確認
npm run build 2>&1 | tee build.log
```

---

## 🟢 デプロイ後の改善

### 9. Clerkテスト環境のセットアップ

**目標:** E2Eテストを実際のClerk認証で実行できるようにする

**手順:**

1. **Clerkテストパッケージのインストール:**
```bash
npm install -D @clerk/testing
```

2. **PlaywrightとClerkの設定:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    storageState: 'tests/fixtures/auth.json',  // Clerkセッション
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
```

3. **認証セットアップスクリプトの作成:**
```typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/sign-in');
  await page.fill('input[name="identifier"]', process.env.TEST_USER_EMAIL);
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'tests/fixtures/auth.json' });
});
```

4. **E2Eテストのスキップを解除:**
```typescript
// tests/e2e/diagnosis-history.spec.ts
// test.skip()呼び出しを削除
test('should display history page when authenticated', async ({ page }) => {
  await page.goto('/dashboard/history');
  await expect(page.locator('h1')).toContainText('診断履歴');
});
```

**検証:**
```bash
npm run test:e2e  # すべてのテストが正常に実行されること
```

---

### 10. マイグレーションUXの改善

**改善項目:**

1. **ローディング状態の追加:**
```typescript
// src/ui/components/diagnosis/diagnosis-migration-wrapper.tsx
export function DiagnosisMigrationWrapper() {
  const { migrationStatus, isMigrating } = useMigrateAnonymousDiagnosis();

  if (isMigrating) {
    return (
      <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Spinner />
          <span>診断データを移行中...</span>
        </div>
      </div>
    );
  }

  return null;
}
```

2. **リトライ機能付きエラーハンドリング:**
```typescript
const [retryCount, setRetryCount] = useState(0);

const migrateDiagnosisData = async () => {
  try {
    // ... マイグレーションロジック
  } catch (error) {
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        migrateDiagnosisData();
      }, 2000 * (retryCount + 1));  // 指数バックオフ
    } else {
      setMigrationStatus('error');
    }
  }
};
```

3. **成功トーストの追加:**
```typescript
import { toast } from 'sonner';  // または使用しているトーストライブラリ

// マイグレーション成功時
toast.success('診断データを移行しました！', {
  description: '診断履歴から確認できます',
  action: {
    label: '履歴を見る',
    onClick: () => router.push('/dashboard/history'),
  },
});
```

---

## デプロイタイムライン

### フェーズ1: 重要な修正（1-2日目）
- Jest/Prisma TypeScriptエラーの修正
- Supabase接続のデバッグ
- 詳細ページの実装

### フェーズ2: デプロイ前検証（3日目）
- 完全なlint/型チェックの実行
- ステージングでのマイグレーションテスト
- 手動スモークテスト
- 環境変数の確認
- 本番ビルドの検証

### フェーズ3: デプロイ（4日目）
- 本番環境へのデプロイ
- エラーログの監視
- 実ユーザーでの検証

### フェーズ4: デプロイ後（2週目）
- Clerkテスト環境のセットアップ
- マイグレーションUXの改善
- E2Eテストスイートの有効化

---

## ロールバック計画

デプロイが失敗した場合、または重大なバグが発見された場合:

1. **データベースのロールバック:**
```sql
BEGIN;
ALTER TABLE "diagnosis_records" DROP COLUMN "clerkUserId";
DROP INDEX "diagnosis_records_clerkUserId_createdAt_idx";
COMMIT;
```

2. **コードのロールバック:**
```bash
# 前回のデプロイに戻す
git revert HEAD~1
vercel --prod  # またはデプロイコマンド
```

3. **機能フラグ:**
```typescript
// 履歴機能を一時的に無効化
const HISTORY_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_HISTORY === 'true';

if (!HISTORY_FEATURE_ENABLED) {
  redirect('/dashboard');
}
```

---

## 成功基準

**以下の条件を満たせばデプロイ成功:**
- ✅ すべてのブロック問題が解決
- ✅ 型チェックがエラー0で通過
- ✅ すべてのユニットテストが通過
- ✅ 本番ビルドが完了
- ✅ 手動スモークテストが通過
- ✅ 本番ログにエラーなし（最初の24時間）
- ✅ 新規サインアップでマイグレーションが機能
- ✅ 既存ユーザーが履歴を閲覧可能
- ✅ パフォーマンスが許容範囲（<500msページロード）

---

## 連絡先とエスカレーション

**問題が発生した場合:**
1. エラーログを確認（Vercel/Sentry）
2. このデプロイガイドを確認
3. 実装サマリーを参照: `diagnosis-history-phase2-implementation-summary.md`
4. 重大な場合はロールバック（上記のロールバック計画を参照）

**重要なファイル:**
- 実装: `docs/diagnosis-history-phase2-implementation-summary.md`
- 計画: `docs/diagnosis-history-implementation-plan.md`
- このガイド: `docs/deployment-roadmap.md`
