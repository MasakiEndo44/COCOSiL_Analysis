/**
 * 日本語検索正規化ユーティリティのユニットテスト
 *
 * @description
 * wanakanaを使用した日本語正規化機能の包括的テスト
 */

import {
  normalizeSearchQuery,
  buildSearchCondition,
  validateSearchQuery
} from '@/lib/search/japanese-normalizer';

describe('normalizeSearchQuery', () => {
  describe('基本的なバリエーション生成', () => {
    it('should generate hiragana and katakana variants for katakana input', () => {
      const result = normalizeSearchQuery('タイヘキ');

      expect(result).toHaveLength(1);
      expect(result[0].original).toBe('タイヘキ');
      expect(result[0].variants).toContain('タイヘキ');
      expect(result[0].variants).toContain('たいへき');
    });

    it('should generate katakana and romaji variants for hiragana input', () => {
      const result = normalizeSearchQuery('たいへき');

      expect(result).toHaveLength(1);
      expect(result[0].original).toBe('たいへき');
      expect(result[0].variants).toContain('たいへき');
      expect(result[0].variants).toContain('タイヘキ');
    });

    it('should generate kana variants for romaji input', () => {
      const result = normalizeSearchQuery('taiheki');

      expect(result).toHaveLength(1);
      expect(result[0].original).toBe('taiheki');
      expect(result[0].variants).toContain('taiheki');
      expect(result[0].variants).toContain('たいへき');
      expect(result[0].variants).toContain('タイヘキ');
    });

    it('should keep English text as-is with lowercase variant', () => {
      const result = normalizeSearchQuery('INFP');

      expect(result).toHaveLength(1);
      expect(result[0].original).toBe('INFP');
      expect(result[0].variants).toContain('INFP');
      expect(result[0].variants).toContain('infp');
    });
  });

  describe('スペース区切り複数キーワード', () => {
    it('should split space-separated terms', () => {
      const result = normalizeSearchQuery('田中 INFP');

      expect(result).toHaveLength(2);
      expect(result[0].original).toBe('田中');
      expect(result[1].original).toBe('INFP');
    });

    it('should handle multiple spaces and trim correctly', () => {
      const result = normalizeSearchQuery('  タイヘキ   ENTJ  ');

      expect(result).toHaveLength(2);
      expect(result[0].original).toBe('タイヘキ');
      expect(result[1].original).toBe('ENTJ');
    });

    it('should handle mixed Japanese and English terms', () => {
      const result = normalizeSearchQuery('たなか INFP おひつじ');

      expect(result).toHaveLength(3);
      expect(result[0].original).toBe('たなか');
      expect(result[1].original).toBe('INFP');
      expect(result[2].original).toBe('おひつじ');

      // 各タームがバリエーションを持つ
      expect(result[0].variants.length).toBeGreaterThan(1);
      expect(result[1].variants.length).toBeGreaterThan(1);
      expect(result[2].variants.length).toBeGreaterThan(1);
    });
  });

  describe('全角/半角正規化', () => {
    it('should normalize full-width to half-width', () => {
      const result = normalizeSearchQuery('ＡＢＣＤ');

      expect(result[0].variants).toContain('ABCD');
    });

    it('should normalize full-width katakana to standard katakana', () => {
      const result = normalizeSearchQuery('タイヘキ'); // Already half-width

      expect(result[0].variants).toContain('タイヘキ');
    });
  });

  describe('エッジケース', () => {
    it('should handle empty string', () => {
      const result = normalizeSearchQuery('');

      expect(result).toHaveLength(0);
    });

    it('should handle only whitespace', () => {
      const result = normalizeSearchQuery('   ');

      expect(result).toHaveLength(0);
    });

    it('should handle single character', () => {
      const result = normalizeSearchQuery('あ');

      expect(result).toHaveLength(1);
      expect(result[0].variants).toContain('あ');
      expect(result[0].variants).toContain('ア');
    });

    it('should deduplicate identical variants', () => {
      const result = normalizeSearchQuery('ABC');

      // "ABC" と "abc" のみ（英数字はそのまま/小文字化のみ）
      const uniqueVariants = new Set(result[0].variants);
      expect(uniqueVariants.size).toBe(result[0].variants.length);
    });
  });
});

describe('buildSearchCondition', () => {
  it('should return empty object for empty query', () => {
    const condition = buildSearchCondition('');

    expect(condition).toEqual({});
  });

  it('should return empty object for whitespace-only query', () => {
    const condition = buildSearchCondition('   ');

    expect(condition).toEqual({});
  });

  it('should build AND condition for single term', () => {
    const condition = buildSearchCondition('田中');

    expect(condition).toHaveProperty('AND');
    expect(Array.isArray(condition.AND)).toBe(true);
    expect(condition.AND).toHaveLength(1);
  });

  it('should build AND condition for multiple terms', () => {
    const condition = buildSearchCondition('田中 INFP');

    expect(condition).toHaveProperty('AND');
    if ('AND' in condition && Array.isArray(condition.AND)) {
      expect(condition.AND).toHaveLength(2);
    }
  });

  it('should include OR conditions for each variant', () => {
    const condition = buildSearchCondition('INFP');

    if ('AND' in condition && Array.isArray(condition.AND) && condition.AND.length > 0) {
      const firstTermCondition = condition.AND[0];
      expect(firstTermCondition).toHaveProperty('OR');
      expect(Array.isArray(firstTermCondition.OR)).toBe(true);

      // バリエーション数 × フィールド数の条件が生成される
      // "INFP" → variants: ["INFP", "infp", etc.]
      // 7 searchable fields
      expect(firstTermCondition.OR.length).toBeGreaterThan(10);
    }
  });

  it('should use case-insensitive mode', () => {
    const condition = buildSearchCondition('test');

    if ('AND' in condition && Array.isArray(condition.AND) && condition.AND.length > 0) {
      const firstOr = condition.AND[0].OR[0];
      expect(firstOr[Object.keys(firstOr)[0]].mode).toBe('insensitive');
    }
  });

  it('should search across all specified fields', () => {
    const condition = buildSearchCondition('キーワード');

    if ('AND' in condition && Array.isArray(condition.AND) && condition.AND.length > 0) {
      const orConditions = condition.AND[0].OR;
      const fields = orConditions.map((c: any) => Object.keys(c)[0]);

      // 7つのフィールド × バリエーション数
      expect(fields).toContain('name');
      expect(fields).toContain('mbti');
      expect(fields).toContain('animal');
      expect(fields).toContain('zodiac');
      expect(fields).toContain('theme');
      expect(fields).toContain('integratedKeywords');
      expect(fields).toContain('memo');
    }
  });
});

describe('validateSearchQuery', () => {
  it('should return error for empty query', () => {
    const error = validateSearchQuery('');

    expect(error).toBe('検索キーワードを入力してください');
  });

  it('should return error for whitespace-only query', () => {
    const error = validateSearchQuery('   ');

    expect(error).toBe('検索キーワードを入力してください');
  });

  it('should return error for query exceeding 200 characters', () => {
    const longQuery = 'あ'.repeat(201);
    const error = validateSearchQuery(longQuery);

    expect(error).toBe('検索キーワードは200文字以内にしてください');
  });

  it('should return error for query with more than 10 terms', () => {
    const manyTerms = Array(11).fill('word').join(' ');
    const error = validateSearchQuery(manyTerms);

    expect(error).toBe('検索キーワードは10個以内にしてください');
  });

  it('should return null for valid query', () => {
    const error = validateSearchQuery('田中 INFP');

    expect(error).toBeNull();
  });

  it('should return null for query at character limit', () => {
    const maxQuery = 'あ'.repeat(200);
    const error = validateSearchQuery(maxQuery);

    expect(error).toBeNull();
  });

  it('should return null for query with 10 terms', () => {
    const tenTerms = Array(10).fill('word').join(' ');
    const error = validateSearchQuery(tenTerms);

    expect(error).toBeNull();
  });
});

describe('統合シナリオテスト', () => {
  it('should handle real-world search scenario: Japanese name + MBTI', () => {
    const query = '田中太郎 INFP';
    const validation = validateSearchQuery(query);
    expect(validation).toBeNull();

    const normalized = normalizeSearchQuery(query);
    expect(normalized).toHaveLength(2);

    const condition = buildSearchCondition(query);
    expect(condition.AND).toHaveLength(2);
  });

  it('should handle real-world search scenario: Katakana + English', () => {
    const query = 'タイヘキ 1種';
    const validation = validateSearchQuery(query);
    expect(validation).toBeNull();

    const normalized = normalizeSearchQuery(query);
    expect(normalized).toHaveLength(2);

    // "タイヘキ" should have hiragana variant
    expect(normalized[0].variants).toContain('たいへき');
  });

  it('should handle real-world search scenario: Romaji input', () => {
    const query = 'tanaka infp';
    const validation = validateSearchQuery(query);
    expect(validation).toBeNull();

    const normalized = normalizeSearchQuery(query);
    expect(normalized).toHaveLength(2);

    // "tanaka" should have kana variants
    expect(normalized[0].variants).toContain('たなか');
    expect(normalized[0].variants).toContain('タナカ');
  });
});
