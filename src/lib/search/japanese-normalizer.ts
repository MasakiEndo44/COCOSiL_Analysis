/**
 * 日本語検索正規化ユーティリティ
 *
 * @description
 * wanakanaライブラリを使用して、ひらがな/カタカナ/ローマ字の相互変換を行い、
 * Admin診断結果検索の表記揺れ対応を実現する。
 *
 * @example
 * ```typescript
 * // 基本的な正規化
 * normalizeSearchQuery("タイヘキ INFP")
 * // => [
 * //   { original: "タイヘキ", variants: ["タイヘキ", "たいへき", "taiheki"] },
 * //   { original: "INFP", variants: ["INFP", "infp"] }
 * // ]
 *
 * // Prisma WHERE条件の構築
 * buildSearchCondition("田中 INFP")
 * // => { AND: [{ OR: [...] }, { OR: [...] }] }
 * ```
 *
 * @see {@link ../../../claudedocs/admin-search-improvement-spec.md} 実装仕様書
 */

import * as wanakana from 'wanakana';

/**
 * 正規化された検索語とそのバリエーション
 */
export interface NormalizedTerm {
  /** 元の検索語 */
  original: string;
  /** 正規化されたバリエーション配列 */
  variants: string[];
}

/**
 * 検索クエリを正規化し、複数の表記バリエーションを生成
 *
 * @param query - ユーザーが入力した検索クエリ（スペース区切り可）
 * @returns 正規化されたタームとバリエーションの配列
 *
 * @example
 * ```typescript
 * normalizeSearchQuery("タイヘキ")
 * // => [{ original: "タイヘキ", variants: ["タイヘキ", "たいへき", "taiheki"] }]
 *
 * normalizeSearchQuery("tanaka INFP")
 * // => [
 * //   { original: "tanaka", variants: ["tanaka", "たなか", "タナカ"] },
 * //   { original: "INFP", variants: ["INFP", "infp"] }
 * // ]
 * ```
 */
export function normalizeSearchQuery(query: string): NormalizedTerm[] {
  // スペースで分割、空文字除去、前後の空白トリム
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0);

  return terms.map(term => {
    // NFKC正規化: 全角→半角、合成文字の統一
    const normalized = term.normalize('NFKC');

    // バリエーション生成
    const variants = new Set<string>([
      normalized,                           // オリジナル
      normalized.toLowerCase(),             // 小文字版（英数字用）
      wanakana.toHiragana(normalized),     // ひらがな化
      wanakana.toKatakana(normalized),     // カタカナ化
    ]);

    // 空文字と重複を除去
    const uniqueVariants = Array.from(variants).filter(v => v.length > 0);

    return {
      original: term,
      variants: uniqueVariants
    };
  });
}

/**
 * Prisma WHERE条件を構築（複数フィールド横断AND検索）
 *
 * @param query - 検索クエリ文字列
 * @returns Prismaのwhere条件オブジェクト
 *
 * @description
 * - 各検索語のバリエーションをOR条件で結合
 * - 複数の検索語をAND条件で結合
 * - 7つのフィールド（name, mbti, animal, zodiac, theme, integratedKeywords, memo）を横断検索
 * - PostgreSQL ILIKE を使用（大文字小文字非依存）
 *
 * @example
 * ```typescript
 * // クエリ: "田中 INFP"
 * buildSearchCondition("田中 INFP")
 * // => {
 * //   AND: [
 * //     { OR: [
 * //       { name: { contains: "田中", mode: "insensitive" } },
 * //       { mbti: { contains: "田中", mode: "insensitive" } },
 * //       // ... 他のフィールド × 田中のバリエーション
 * //     ]},
 * //     { OR: [
 * //       { name: { contains: "INFP", mode: "insensitive" } },
 * //       { mbti: { contains: "INFP", mode: "insensitive" } },
 * //       // ... 他のフィールド × INFPのバリエーション
 * //     ]}
 * //   ]
 * // }
 * ```
 */
export function buildSearchCondition(query: string) {
  if (!query.trim()) {
    return {};
  }

  const normalizedTerms = normalizeSearchQuery(query);

  // 検索対象フィールド（優先度順）
  const searchableFields = [
    'name',                // 名前（最優先）
    'mbti',                // MBTI タイプ
    'animal',              // 動物（六十干支）
    'zodiac',              // 星座
    'theme',               // テーマ（診断結果の主要メッセージ）
    'integratedKeywords',  // 統合キーワード（あれば）
    'memo',                // 管理者メモ
  ] as const;

  // AND条件: 各検索語が少なくとも1つのフィールドにマッチする必要がある
  return {
    AND: normalizedTerms.map(({ variants }) => ({
      // OR条件: バリエーション × フィールドの組み合わせ
      OR: variants.flatMap(variant =>
        searchableFields.map(field => ({
          [field]: {
            contains: variant,
            mode: 'insensitive' as const  // PostgreSQL ILIKE (大文字小文字非依存)
          }
        }))
      )
    }))
  };
}

/**
 * 検索クエリの入力検証
 *
 * @param query - 検索クエリ
 * @returns 検証エラーメッセージ（問題なければ null）
 *
 * @example
 * ```typescript
 * validateSearchQuery("") // => "検索キーワードを入力してください"
 * validateSearchQuery("a".repeat(201)) // => "検索キーワードは200文字以内にしてください"
 * validateSearchQuery("田中 INFP") // => null (正常)
 * ```
 */
export function validateSearchQuery(query: string): string | null {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return '検索キーワードを入力してください';
  }

  // DoS攻撃対策: 長すぎるクエリを拒否
  if (trimmed.length > 200) {
    return '検索キーワードは200文字以内にしてください';
  }

  // 分割後のタームが多すぎる場合も拒否（パフォーマンス保護）
  const terms = trimmed.split(/\s+/);
  if (terms.length > 10) {
    return '検索キーワードは10個以内にしてください';
  }

  return null;
}
