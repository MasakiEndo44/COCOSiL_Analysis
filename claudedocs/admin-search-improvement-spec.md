# Admin 診断結果検索機能 改善仕様書

**作成日**: 2025-10-08
**ステータス**: Phase 1 実装準備完了
**担当**: Claude Code (要件探索・設計)

---

## 📋 エグゼクティブサマリー

### 現状の問題点
1. **キーワード検索が弱い**: ひらがな/カタカナ、表記揺れに非対応
   - 「タイヘキ」で検索しても「たいへき」がヒットしない
   - ローマ字入力「taiheki」が機能しない
2. **スペース区切り検索に非対応**: 複数キーワードのAND検索ができない
   - 「田中 INFP」のような検索が不可能

### 提案ソリューション
**Phase 1 (MVP - 即座に実装可能):**
- wanakanaライブラリによる日本語正規化（ひらがな/カタカナ/ローマ字対応）
- スペース区切りキーワードのAND検索
- 複数フィールド横断検索（name, mbti, animal, zodiac等）
- PostgreSQL ILIKE による大文字小文字非依存マッチング

**Phase 2 (将来的拡張):**
- MeCab統合による漢字→かな変換
- PostgreSQL全文検索インデックス（pg_trgm / pg_bigm）
- データベース正規化カラム追加

---

## 🔍 現状分析

### 現在の実装（ベースライン）

**フロントエンド** ([src/ui/components/admin/enhanced-records-view.tsx](../src/ui/components/admin/enhanced-records-view.tsx))
```typescript
// 単純なテキスト入力、300msデバウンス
const [searchQuery, setSearchQuery] = useState('');
// クエリパラメータとして /api/admin/records に送信
params.set('query', query.trim());
```

**バックエンドAPI** ([src/app/api/admin/records/route.ts](../src/app/api/admin/records/route.ts))
```typescript
// 現在: nameフィールドのみを検索
const whereCondition = query ? {
  name: { contains: query }  // ← 大文字小文字区別、単一フィールドのみ
} : {};
```

**データベーススキーマ** ([prisma/schema.prisma](../prisma/schema.prisma))
- **重要発見**: PostgreSQLを使用（APIコメントの"SQLite"は誤り）
- 検索可能フィールド: name, mbti, mainTaiheki, animal, zodiac, sixStar, theme, integratedKeywords, memo, markdownContent

### 制約と限界
- ✅ PostgreSQL使用 → 高度な検索機能利用可能
- ❌ 正規化なし → ひらがな/カタカナが別扱い
- ❌ 単一フィールド検索 → MBTIや動物で検索不可
- ❌ スペース区切り非対応 → AND検索不可
- ❌ 大文字小文字区別 → "infp"と"INFP"が別扱い

---

## 🎯 技術要件定義

### 外部専門家の推奨事項

**Gemini検索結果サマリー:**
- PostgreSQL拡張機能: `textsearch_ja` (MeCab統合), `pg_bigm` (n-gram索引), `PGroonga`
- 正規化戦略: ひらがな/カタカナ統一、NFKC正規化、大文字小文字統一
- GINインデックスによる高速全文検索

**o3-low 推奨アーキテクチャ:**
- **クライアント側正規化**: UX即時フィードバック用
- **ハイブリッドアプローチ**: クライアント＋DBトリガー
- **段階的実装**:
  1. wanakanaによる基本正規化（Phase 1）
  2. MeCab/形態素解析（Phase 2）
  3. Elasticsearch移行（Phase 3 - 必要に応じて）

### 解決戦略マッピング

| 問題 | Phase 1 解決策 | Phase 2 拡張 |
|------|---------------|------------|
| ひらがな/カタカナ非対応 | wanakana多様体生成 | DB正規化カラム |
| ローマ字検索不可 | wanakana.toKana() | - |
| 漢字→かな変換 | ⚠️ 一部対応（手動マッピング） | MeCab統合 |
| スペース区切り非対応 | split + AND logic | - |
| 単一フィールド検索 | 7フィールド横断検索 | tsvector全文検索 |
| 大文字小文字区別 | Prisma mode:'insensitive' | - |

---

## 🏗️ Phase 1 実装設計（MVP）

### アーキテクチャ概要

```
┌─────────────────┐
│  User Input     │  "タナカ INFP" or "tanaka infp"
└────────┬────────┘
         │
         ↓ (normalize + split)
┌─────────────────────────────────────────┐
│  Search Term Processing                 │
│  1. Split: ["タナカ", "INFP"]          │
│  2. Generate variants for each term:    │
│     - "タナカ" → ["タナカ","たなか"]   │
│     - "INFP" → ["INFP","infp"]         │
└────────┬────────────────────────────────┘
         │
         ↓ (build query)
┌─────────────────────────────────────────┐
│  Prisma WHERE Condition                 │
│  AND: [                                 │
│    OR: [variant1 in field1..7],        │
│    OR: [variant2 in field1..7]         │
│  ]                                      │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────┐
│  PostgreSQL     │  ILIKE queries with indexes
│  Query Engine   │
└─────────────────┘
```

### 実装コンポーネント

#### 1. 日本語正規化ユーティリティ

**新規ファイル**: `src/lib/search/japanese-normalizer.ts`

```typescript
import wanakana from 'wanakana';

/**
 * 検索クエリを正規化し、複数の表記バリエーションを生成
 *
 * @example
 * normalizeSearchQuery("タイヘキ INFP")
 * // => [
 * //   { original: "タイヘキ", variants: ["タイヘキ", "たいへき", "taiheki"] },
 * //   { original: "INFP", variants: ["INFP", "infp"] }
 * // ]
 */
export function normalizeSearchQuery(query: string): Array<{
  original: string;
  variants: string[];
}> {
  // スペースで分割、空文字除去
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0);

  return terms.map(term => {
    const normalized = term.normalize('NFKC'); // 全角→半角統一

    // バリエーション生成
    const variants = new Set<string>([
      normalized,                           // オリジナル
      wanakana.toHiragana(normalized),     // ひらがな
      wanakana.toKatakana(normalized),     // カタカナ
    ]);

    // 重複削除して配列化
    return {
      original: term,
      variants: Array.from(variants).filter(v => v.length > 0)
    };
  });
}

/**
 * Prisma WHERE条件を構築（複数フィールド横断AND検索）
 */
export function buildSearchCondition(query: string) {
  if (!query.trim()) {
    return {};
  }

  const normalizedTerms = normalizeSearchQuery(query);

  // 検索対象フィールド
  const searchableFields: Array<keyof DiagnosisRecord> = [
    'name',
    'mbti',
    'animal',
    'zodiac',
    'theme',
    'integratedKeywords',
    'memo',
  ];

  return {
    AND: normalizedTerms.map(({ variants }) => ({
      OR: variants.flatMap(variant =>
        searchableFields.map(field => ({
          [field]: {
            contains: variant,
            mode: 'insensitive' as const  // PostgreSQL ILIKE
          }
        }))
      )
    }))
  };
}
```

#### 2. API エンドポイント更新

**修正ファイル**: `src/app/api/admin/records/route.ts`

```typescript
import { buildSearchCondition } from '@/lib/search/japanese-normalizer';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const query = searchParams.get('query') || '';
    const skip = (page - 1) * limit;

    // ✨ 新しい検索条件構築
    const whereCondition = buildSearchCondition(query);

    const [records, total] = await Promise.all([
      adminDb.diagnosisRecord.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      adminDb.diagnosisRecord.count({
        where: whereCondition,
      }),
    ]);

    return NextResponse.json({
      success: true,
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    // ... error handling
  }
}
```

#### 3. フロントエンド（オプション改善）

**修正ファイル**: `src/ui/components/admin/enhanced-records-view.tsx`

```typescript
// プレースホルダー更新
<Input
  type="text"
  placeholder="名前、MBTI、動物、星座などで検索... (スペース区切りでAND検索)"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="pl-10"
/>

// 検索ヘルプテキスト追加
{debouncedQuery && (
  <div className="mt-3 text-sm text-gray-600">
    <div className="flex items-start gap-2">
      <span className="font-medium">検索中:</span>
      <div>
        <p>&ldquo;{debouncedQuery}&rdquo;</p>
        <p className="text-xs text-gray-500 mt-1">
          💡 ひらがな・カタカナ・ローマ字すべて対応 / スペース区切りで複数条件検索
        </p>
      </div>
    </div>
    {!loading && (
      <p className="mt-2 font-semibold text-brand-600">
        {pagination.total} 件見つかりました
      </p>
    )}
  </div>
)}
```

---

## 📊 パフォーマンス分析

### クエリ複雑度

**例**: `"田中 INFP"` の検索

```
分割: ["田中", "INFP"]
↓
バリエーション生成:
- "田中" → ["田中", "たなか", "タナカ"] (3 variants)
- "INFP" → ["INFP", "infp"] (2 variants)
↓
検索条件構築:
AND [
  OR [ 3 variants × 7 fields = 21 conditions ],
  OR [ 2 variants × 7 fields = 14 conditions ]
]
= 合計 35 ILIKE 条件
```

### 予想パフォーマンス

| データ量 | クエリ時間（推定） | 備考 |
|---------|------------------|-----|
| ~1,000件 | < 100ms | 問題なし |
| ~10,000件 | 100-300ms | 許容範囲 |
| ~100,000件 | 300-1000ms | インデックス追加推奨 |

### 最適化オプション（必要に応じて）

1. **GINインデックス追加**:
```sql
CREATE INDEX idx_diagnosis_records_name_gin ON diagnosis_records USING GIN (name gin_trgm_ops);
CREATE INDEX idx_diagnosis_records_mbti_gin ON diagnosis_records USING GIN (mbti gin_trgm_ops);
-- 他のフィールドにも同様に
```

2. **検索フィールド削減**: 7フィールド → 5フィールド（30%削減）

3. **クエリタイムアウト設定**:
```typescript
const records = await adminDb.$queryRawUnsafe(
  `SET statement_timeout = 5000; ${prismaQuery}`
);
```

---

## ✅ 実装手順

### ステップ1: 環境準備

```bash
# wanakanaライブラリをインストール
npm install wanakana
npm install --save-dev @types/wanakana

# TypeScript型チェック
npm run type-check
```

### ステップ2: ユーティリティ作成

1. `src/lib/search/` ディレクトリを作成
2. `japanese-normalizer.ts` を作成（上記コード参照）
3. 型定義を `src/types/admin.ts` に追加（必要に応じて）

### ステップ3: APIエンドポイント更新

1. `src/app/api/admin/records/route.ts` の GET handler を更新
2. `buildSearchCondition` をインポート
3. 既存の `whereCondition` ロジックを置き換え

### ステップ4: テスト

**手動テストケース:**
```
✅ "タイヘキ" → "たいへき"を含むレコードがヒット
✅ "taiheki" → カタカナ/ひらがな両方がヒット
✅ "田中 INFP" → name="田中" AND mbti="INFP" のレコードのみ
✅ "おひつじ" → zodiac="牡羊座" がヒット
✅ "ENTJ" → mbti="ENTJ" がヒット（大文字小文字非依存）
```

**ユニットテスト** (`src/__tests__/lib/search/japanese-normalizer.test.ts`):
```typescript
import { normalizeSearchQuery } from '@/lib/search/japanese-normalizer';

describe('normalizeSearchQuery', () => {
  it('should generate hiragana and katakana variants', () => {
    const result = normalizeSearchQuery('タイヘキ');
    expect(result[0].variants).toContain('たいへき');
    expect(result[0].variants).toContain('タイヘキ');
  });

  it('should split space-separated terms', () => {
    const result = normalizeSearchQuery('田中 INFP');
    expect(result).toHaveLength(2);
    expect(result[0].original).toBe('田中');
    expect(result[1].original).toBe('INFP');
  });
});
```

### ステップ5: デプロイと監視

1. Staging環境でテスト
2. パフォーマンスモニタリング（Vercel Analytics / 自前ログ）
3. スローログ閾値: 500ms超のクエリをログ
4. Production展開

---

## 🚀 Phase 2 ロードマップ（将来拡張）

### 高度な機能（優先度順）

#### 1. 漢字→かな変換対応（優先度: 高）
**要件**: 「体癖」で検索して「たいへき」がヒットする

**実装オプション:**

**Option A: MeCab統合（推奨）**
```bash
# MeCabインストール（サーバー側）
apt-get install mecab libmecab-dev mecab-ipadic-utf8
npm install mecab-async
```

```typescript
// src/lib/search/mecab-normalizer.ts
import MeCab from 'mecab-async';

const mecab = new MeCab();

export async function extractLexemes(text: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    mecab.parse(text, (err, result) => {
      if (err) return reject(err);
      // 基本形を抽出: "体癖" → ["体癖", "たいへき"]
      const lexemes = result.map(node => node.base || node.surface);
      resolve(lexemes);
    });
  });
}
```

**Option B: データベース正規化カラム**
```sql
-- Prisma migration
ALTER TABLE diagnosis_records ADD COLUMN search_text_normalized TEXT;

-- トリガーで自動更新
CREATE OR REPLACE FUNCTION update_search_normalized()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_text_normalized :=
    to_tsvector('japanese', NEW.name || ' ' || NEW.mbti || ' ' || ...);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 2. PostgreSQL全文検索（優先度: 中）
```sql
-- pg_trgm拡張有効化
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GINインデックス作成
CREATE INDEX idx_records_search_gin
ON diagnosis_records
USING GIN (search_text_normalized gin_trgm_ops);
```

```typescript
// Prisma Raw Query
const records = await adminDb.$queryRaw`
  SELECT * FROM diagnosis_records
  WHERE search_text_normalized % ${searchQuery}  -- Similar to
  ORDER BY similarity(search_text_normalized, ${searchQuery}) DESC
  LIMIT 20
`;
```

#### 3. Elasticsearch移行（優先度: 低）
**条件**: データ量が100万件超 OR 複雑な分析クエリが必要な場合

**メリット:**
- Kuromoji/Sudachi analyzer による高精度日本語解析
- 類義語辞書サポート
- ファセット検索、集計分析

**デメリット:**
- インフラコスト増加
- データ同期の複雑化
- ACID保証なし

---

## 📝 成功基準

### Phase 1 完了判定基準

| 基準 | 目標 | 測定方法 |
|------|-----|---------|
| 機能性 | ひらがな/カタカナ/ローマ字相互検索が動作 | 手動テスト20ケース全Pass |
| パフォーマンス | 検索応答時間 < 500ms (P95) | APM/ログ分析 |
| 可用性 | エラーレート < 0.1% | エラーログ監視 |
| ユーザビリティ | スペース区切りAND検索が直感的 | 管理者ヒアリング |

### Phase 2 移行判断基準
以下のいずれかに該当したらPhase 2 実装を検討：
- ✅ 診断記録が10万件を超えた
- ✅ 検索応答時間が500ms超えが頻発
- ✅ 漢字検索の要望が月5件以上
- ✅ 高度な分析機能（ダッシュボード集計等）が必要

---

## 🔒 セキュリティ・プライバシー考慮事項

### データ保護
- ✅ 検索クエリはログに残さない（個人情報含む可能性）
- ✅ SQLインジェクション対策: Prismaパラメータ化クエリ使用
- ✅ 認証: `requireAdminAuth` ミドルウェアで保護済み

### 入力検証
```typescript
// クエリ長制限（DoS対策）
if (query.length > 200) {
  return NextResponse.json(
    { error: '検索キーワードは200文字以内にしてください' },
    { status: 400 }
  );
}

// 特殊文字エスケープ（Prismaが自動処理、念のため確認）
const sanitizedQuery = query.trim().replace(/[^\w\s\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '');
```

---

## 📚 参考資料

### 外部技術リソース
- **wanakana**: https://github.com/WaniKani/WanaKana
- **PostgreSQL pg_trgm**: https://www.postgresql.org/docs/current/pgtrgm.html
- **MeCab**: https://taku910.github.io/mecab/
- **Prisma Full-Text Search**: https://www.prisma.io/docs/concepts/components/prisma-client/full-text-search

### 社内ドキュメント
- [CLAUDE.md](../CLAUDE.md) - プロジェクト全体ガイドライン
- [prisma/schema.prisma](../prisma/schema.prisma) - データベーススキーマ
- [src/types/admin.ts](../src/types/admin.ts) - 型定義

---

## 🤝 実装サポート

### 次のステップ
1. ✅ 本仕様書をレビュー・承認
2. ⏳ Phase 1 実装開始（推定工数: 2-3日）
3. ⏳ Staging環境テスト
4. ⏳ Production展開

### 質問・相談
- **技術的質問**: Gemini/o3に相談（`mcp__gemini-cli__googleSearch`, `mcp__o3-low__o3-search`）
- **要件確認**: ユーザー（正樹さん）とのブレインストーミング
- **実装サポート**: Claude Code の `/sc:implement` コマンド

---

**仕様書バージョン**: 1.0
**最終更新**: 2025-10-08
**承認待ち**: ユーザー確認後、実装フェーズへ移行
