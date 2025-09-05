# COCOSiL算命学API 実装ロードマップ v2.0

## 📋 実装概要

**プロジェクト期間**: 7-8日間（約1.5週間）  
**開発方式**: 精度ファースト・テスト駆動開発  
**成功定義**: 精度100%・レスポンス100ms以下・同時接続50人対応

---

## 🎯 Phase 1: 精度検証基盤構築（2日間）

### 目標
現行システムとの精度100%照合確認と自動テストフレームワーク構築

### 1.1 正解データセット作成（0.5日）

#### 実装タスク
```bash
# 新規ファイル作成
mkdir -p tests/fixtures
touch tests/fixtures/precision-test-data.ts
touch tests/fixtures/boundary-test-cases.ts
```

#### データセット構成
```typescript
// tests/fixtures/precision-test-data.ts
export const PRECISION_TEST_CASES = [
  // 境界値テスト（必須）
  {
    name: "最小年度境界値",
    input: { year: 1960, month: 1, day: 1 },
    expected: {
      animal: "子", zodiac: "子", six_star: "土星人+",
      animal_number: 1, tenchusatsu_years: [1966, 1967]
    }
  },
  {
    name: "最大年度境界値", 
    input: { year: 2025, month: 12, day: 31 },
    expected: {
      animal: "巳", zodiac: "巳", six_star: "水星人-",
      animal_number: 42, tenchusatsu_years: [2031, 2032]
    }
  },
  // うるう年テスト
  {
    name: "うるう年2月29日",
    input: { year: 2000, month: 2, day: 29 },
    expected: {
      animal: "たぬき", zodiac: "辰", six_star: "木星人+",
      animal_number: 25, tenchusatsu_years: [2006, 2007]
    }
  },
  // 代表値テスト（各年代から2セット）
  {
    name: "1990年代代表値",
    input: { year: 1990, month: 5, day: 15 },
    expected: {
      animal: "チーター", zodiac: "午", six_star: "土星人+",
      animal_number: 43, tenchusatsu_years: [1996, 1997]
    }
  },
  {
    name: "2000年代代表値",
    input: { year: 2005, month: 8, day: 20 },
    expected: {
      animal: "ペガサス", zodiac: "酉", six_star: "火星人+", 
      animal_number: 18, tenchusatsu_years: [2011, 2012]
    }
  },
  // 追加で5セット（計10セット）
  // ... 残り5セットのテストケース
] as const;
```

#### 成果物・チェックポイント
- [ ] 10セット精度テストデータ作成完了
- [ ] 境界値・代表値・エッジケースの網羅確認
- [ ] 現行APIでの期待値確認済み

### 1.2 自動テストフレームワーク構築（1日）

#### Jest設定とテストランナー
```typescript
// jest.config.js 更新
module.exports = {
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
    '**/tests/precision/**/*.test.ts'  // 精度テスト専用
  ],
  testTimeout: 30000,  // API応答時間考慮
  setupFilesAfterEnv: ['<rootDir>/tests/precision/setup.ts']
};
```

#### 精度検証テスト実装
```typescript
// tests/precision/fortune-api-precision.test.ts
import { PRECISION_TEST_CASES } from '../fixtures/precision-test-data';

describe('Fortune API - 精度検証テスト', () => {
  test.each(PRECISION_TEST_CASES)(
    '精度100%: $name',
    async ({ input, expected }) => {
      const response = await fetch('http://localhost:3000/api/fortune-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      
      // 必須項目の完全一致確認
      expect(result.animal).toBe(expected.animal);
      expect(result.zodiac).toBe(expected.zodiac);
      expect(result.six_star).toBe(expected.six_star);
      expect(result.animal_number).toBe(expected.animal_number);
      
      // 天中殺年の配列一致確認
      expect(result.tenchusatsu_years).toEqual(expected.tenchusatsu_years);
    }
  );
});
```

#### パフォーマンス基準テスト
```typescript
// tests/precision/performance-benchmark.test.ts  
describe('Fortune API - パフォーマンステスト', () => {
  test('レスポンス時間 < 100ms (単発)', async () => {
    const testCase = PRECISION_TEST_CASES[0];
    const startTime = performance.now();
    
    const response = await fetch('http://localhost:3000/api/fortune-calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase.input)
    });
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    expect(response.ok).toBe(true);
    expect(responseTime).toBeLessThan(100); // 100ms以下
  });

  test('同時10接続でのレスポンス性能', async () => {
    const promises = Array(10).fill(null).map(async () => {
      const testCase = PRECISION_TEST_CASES[Math.floor(Math.random() * 3)];
      const startTime = performance.now();
      
      const response = await fetch('http://localhost:3000/api/fortune-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.input)
      });
      
      const endTime = performance.now();
      return endTime - startTime;
    });
    
    const responseTimes = await Promise.all(promises);
    const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxTime = Math.max(...responseTimes);
    
    expect(averageTime).toBeLessThan(150); // 平均150ms以下
    expect(maxTime).toBeLessThan(500);     // 最大500ms以下
  });
});
```

#### 成果物・チェックポイント
- [ ] Jest精度検証テストスイート完成
- [ ] パフォーマンステスト基盤構築
- [ ] CI/CD統合（GitHub Actions）
- [ ] 現行API基準パフォーマンス測定完了

### 1.3 現行API精度ベースライン測定（0.5日）

#### 現行システム精度測定スクリプト
```typescript
// scripts/measure-baseline-accuracy.ts
import { PRECISION_TEST_CASES } from '../tests/fixtures/precision-test-data';

async function measureCurrentAPIAccuracy() {
  console.log('🔍 現行API精度測定開始...');
  
  const results = [];
  for (const testCase of PRECISION_TEST_CASES) {
    try {
      const response = await fetch('http://localhost:3000/api/fortune-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.input)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const actual = await response.json();
      const accuracy = calculateAccuracy(testCase.expected, actual);
      
      results.push({
        testName: testCase.name,
        accuracy,
        details: {
          expected: testCase.expected,
          actual: extractRelevantFields(actual)
        }
      });
      
    } catch (error) {
      results.push({
        testName: testCase.name,
        accuracy: { overall: 0, details: `エラー: ${error.message}` }
      });
    }
  }
  
  generateAccuracyReport(results);
}

function calculateAccuracy(expected: any, actual: any) {
  const checks = {
    animal: expected.animal === actual.animal,
    zodiac: expected.zodiac === actual.zodiac,
    sixStar: expected.six_star === actual.six_star,
    // ... 他の項目
  };
  
  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  return {
    overall: passedChecks / totalChecks,
    details: checks
  };
}
```

#### 成果物・チェックポイント  
- [ ] 現行API精度レポート生成
- [ ] 不整合箇所の特定と分析
- [ ] 改善優先度の策定

---

## ⚡ Phase 2: 計算エンジン再実装（3-4日間）

### 目標
CSV脱却、高速・高精度な計算式ベース実装

### 2.1 星座計算実装（0.5日）

#### JST対応日付処理
```typescript
// src/lib/fortune/date-utils.ts
export class JSTDateProcessor {
  /**
   * 生年月日をJST基準で処理
   */
  static processDateJST(year: number, month: number, day: number): DateInfo {
    // JST固定での日付作成
    const jstDate = new Date(year, month - 1, day);
    
    return {
      year,
      month,
      day,
      dayOfYear: this.getDayOfYear(jstDate),
      isLeapYear: this.isLeapYear(year),
      zodiacYear: this.getZodiacYear(year)
    };
  }

  /**
   * Excel シリアル値変換（1900/1/1 = 1）
   */
  static dateToExcelSerial(year: number, month: number, day: number): number {
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Excelの1900年バグ補正（1900/2/29 の存在しない日付をカウント）
    return diffDays + (year > 1900 || (year === 1900 && month > 2) ? 2 : 1);
  }
}
```

#### 十二支・干支計算
```typescript
// src/lib/fortune/zodiac-calculator.ts
export class ZodiacCalculator {
  private static readonly ZODIAC_ANIMALS = [
    '子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'
  ] as const;
  
  private static readonly CELESTIAL_STEMS = [
    '甲','乙','丙','丁','戊','己','庚','辛','壬','癸'
  ] as const;

  static calculateZodiac(year: number): ZodiacResult {
    // 十二支: 基準年（4年=甲子）からの offset
    const zodiacIndex = (year - 4) % 12;
    const zodiac = this.ZODIAC_ANIMALS[zodiacIndex];
    
    // 十干: 60年周期の甲子から
    const stemIndex = (year - 4) % 10;
    const stem = this.CELESTIAL_STEMS[stemIndex];
    
    return {
      zodiac,
      stem,
      combination: `${stem}${zodiac}`, // 甲子、乙丑...
      sexagenaryYear: ((year - 4) % 60) + 1
    };
  }
}
```

#### 西洋12星座計算追加
```typescript
// src/lib/fortune/western-zodiac.ts
export class WesternZodiacCalculator {
  private static readonly WESTERN_SIGNS = [
    { name: '山羊座', start: [12, 22], end: [1, 19] },
    { name: '水瓶座', start: [1, 20], end: [2, 18] },
    { name: '魚座',   start: [2, 19], end: [3, 20] },
    // ... 12星座定義
  ] as const;

  static calculateWesternZodiac(month: number, day: number): string {
    for (const sign of this.WESTERN_SIGNS) {
      if (this.isInRange(month, day, sign.start, sign.end)) {
        return sign.name;
      }
    }
    return '山羊座'; // デフォルト
  }
}
```

### 2.2 動物占い計算式化（1.5日）

#### 60種動物占い算出エンジン
```typescript
// src/lib/fortune/animal-calculator.ts
export class AnimalFortuneCalculator {
  /**
   * 60種動物占い算出
   * ロジック: (Excel シリアル値 + 8) % 60 + 1
   */
  static calculate60TypeAnimal(year: number, month: number, day: number): Animal60Result {
    const serialValue = JSTDateProcessor.dateToExcelSerial(year, month, day);
    const animalNumber = ((serialValue + 8) % 60) + 1;
    
    return this.ANIMAL_60_LOOKUP[animalNumber];
  }
  
  /**
   * 60種動物マスターデータ
   */
  private static readonly ANIMAL_60_LOOKUP: Record<number, Animal60Result> = {
    1:  { name: 'チーター',     character: 'EARTH', color: 'オレンジ', traits: ['行動力', 'スピード重視'] },
    2:  { name: 'ブラックパンサー', character: 'MOON',  color: 'ブラック', traits: ['神秘的', '独立心強い'] },
    3:  { name: 'ライオン',     character: 'SUN',   color: 'ゴールド', traits: ['リーダーシップ', '堂々'] },
    // ... 60種すべてのデータ定義
    60: { name: 'こじか',       character: 'MOON',  color: 'ベージュ', traits: ['繊細', '美的センス'] }
  };

  /**
   * 基本12動物への逆引きマッピング
   */
  static getBasic12Animal(animal60Number: number): string {
    const basicMapping = {
      'チーター': 'チーター', 'ブラックパンサー': '黒ひょう', 'ライオン': 'ライオン',
      // ... 60→12の変換マッピング
    };
    
    const animal60Name = this.ANIMAL_60_LOOKUP[animal60Number].name;
    return basicMapping[animal60Name] || animal60Name;
  }
}
```

#### 動物特性統合ロジック
```typescript
// src/lib/fortune/traits-integration.ts
export class TraitsIntegrator {
  /**
   * 動物占い + 六星占術の特性統合
   */
  static integratePersonalityTraits(
    animalTraits: string[], 
    sixStarTraits: string[]
  ): string[] {
    // 重複除去と優先度付け
    const combinedTraits = [...new Set([...animalTraits, ...sixStarTraits])];
    
    // 矛盾特性の調整
    return this.resolveConflictingTraits(combinedTraits);
  }
  
  private static resolveConflictingTraits(traits: string[]): string[] {
    const conflicts = [
      ['慎重', '行動力がある'],
      ['内向的', '社交的'],
      // ... 矛盾パターン定義
    ];
    
    // より具体的な特性を優先
    return traits.filter(trait => 
      !conflicts.some(([weaker, stronger]) => 
        traits.includes(stronger) && trait === weaker
      )
    );
  }
}
```

### 2.3 六星占術実装（1日）

#### 細木数子版準拠計算
```typescript
// src/lib/fortune/six-star-calculator.ts
export class SixStarCalculator {
  /**
   * 六星占術の基本計算（細木数子版）
   */
  static calculateSixStar(year: number, month: number, day: number): SixStarResult {
    const baseNumber = this.calculateSixStarBase(year, month, day);
    const starIndex = baseNumber % 12;
    
    return {
      star: this.SIX_STAR_TYPES[starIndex],
      cycle: this.getCurrentCycle(year, starIndex),
      yearlyFortune: this.getYearlyFortune(starIndex, new Date().getFullYear())
    };
  }
  
  private static calculateSixStarBase(year: number, month: number, day: number): number {
    // 細木数子式計算ロジック
    // 生年月日から基数を算出
    const yearBase = year % 60;
    const monthBase = month * 5;
    const dayBase = day * 3;
    
    return (yearBase + monthBase + dayBase) % 72; // 六星×12年周期
  }
  
  private static readonly SIX_STAR_TYPES = [
    '土星人+', '土星人-', '金星人+', '金星人-',
    '火星人+', '火星人-', '天王星人+', '天王星人-', 
    '木星人+', '木星人-', '水星人+', '水星人-'
  ] as const;
  
  /**
   * 現在の運気サイクル算出
   */
  private static getCurrentCycle(year: number, starIndex: number): string {
    const cycles = ['大殺界', '乱気', '再会', '財成', '安定', '清算'];
    const currentYear = new Date().getFullYear();
    const cycleYear = (currentYear - year + starIndex) % 6;
    
    return cycles[cycleYear];
  }
}
```

### 2.4 算命学・天中殺実装（1日）

#### 天中殺計算エンジン
```typescript
// src/lib/fortune/tenchusatsu-calculator.ts
export class TenchusatsuCalculator {
  /**
   * 天中殺年算出（算命学準拠）
   */
  static calculateTenchusatsu(birthYear: number): TenchusatsuResult {
    const zodiac = ZodiacCalculator.calculateZodiac(birthYear);
    const pattern = this.TENCHUSATSU_PATTERNS[zodiac.zodiac];
    
    // 生年から天中殺の2年間を算出
    const tenchusatsuYears = this.calculateTenchusatsuYears(birthYear, pattern);
    const currentStatus = this.getCurrentTenchusatsuStatus(birthYear, pattern);
    
    return {
      years: tenchusatsuYears,
      status: currentStatus,
      nextTenchusatsu: this.getNextTenchusatsu(birthYear, pattern),
      description: this.getTenchusatsuDescription(pattern)
    };
  }
  
  /**
   * 天中殺パターン（十二支別）
   */
  private static readonly TENCHUSATSU_PATTERNS = {
    '子': { offset: 10, name: '戌亥天中殺' },
    '丑': { offset: 10, name: '戌亥天中殺' },
    '寅': { offset: 0,  name: '子丑天中殺' },
    '卯': { offset: 0,  name: '子丑天中殺' },
    '辰': { offset: 2,  name: '寅卯天中殺' },
    '巳': { offset: 2,  name: '寅卯天中殺' },
    '午': { offset: 4,  name: '辰巳天中殺' },
    '未': { offset: 4,  name: '辰巳天中殺' },
    '申': { offset: 6,  name: '午未天中殺' },
    '酉': { offset: 6,  name: '午未天中殺' },
    '戌': { offset: 8,  name: '申酉天中殺' },
    '亥': { offset: 8,  name: '申酉天中殺' }
  } as const;
  
  private static calculateTenchusatsuYears(birthYear: number, pattern: any): number[] {
    const baseAge = pattern.offset;
    return [birthYear + baseAge, birthYear + baseAge + 1];
  }
}
```

---

## 🚀 Phase 3: 統合・最適化（2日間）

### 目標  
パフォーマンス100ms以下、50人同時接続対応

### 3.1 LRUキャッシュ戦略実装（1日）

#### メモリ効率キャッシュ設計
```typescript
// src/lib/fortune/cache-manager.ts
import LRU from 'lru-cache';

export class FortuneCacheManager {
  private static cache = new LRU<string, FortuneResult>({
    max: 10000,           // 最大10,000エントリ
    maxSize: 500 * 1024,  // 500KB上限
    sizeCalculation: (value) => JSON.stringify(value).length,
    ttl: 24 * 60 * 60 * 1000, // 24時間TTL
  });
  
  static getCacheKey(year: number, month: number, day: number): string {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
  
  static get(year: number, month: number, day: number): FortuneResult | null {
    const key = this.getCacheKey(year, month, day);
    return this.cache.get(key) || null;
  }
  
  static set(year: number, month: number, day: number, result: FortuneResult): void {
    const key = this.getCacheKey(year, month, day);
    this.cache.set(key, result);
  }
  
  static getStats() {
    return {
      size: this.cache.size,
      calculatedSize: this.cache.calculatedSize,
      hitRatio: this.cache.hits / (this.cache.hits + this.cache.misses)
    };
  }
}
```

#### TypedArray ルックアップテーブル
```typescript
// src/lib/fortune/lookup-tables.ts
export class OptimizedLookupTables {
  // コンパイル時生成される最適化テーブル
  private static readonly DATE_LOOKUP: Uint32Array = new Uint32Array([
    // 1960/1/1 から 2025/12/31 までの YYYYMMDD 値
    19600101, 19600102, /* ... */ 20251231
  ]);
  
  private static readonly ANIMAL_LOOKUP: Uint8Array = new Uint8Array([
    // 各日付に対応する動物番号（1-60）
    1, 43, 25, /* ... */ 42
  ]);
  
  private static readonly SIXSTAR_LOOKUP: Uint8Array = new Uint8Array([
    // 各日付に対応する六星番号（1-12）
    1, 7, 3, /* ... */ 11
  ]);
  
  /**
   * O(1) ルックアップ（バイナリサーチ不要）
   */
  static fastLookup(year: number, month: number, day: number): LookupResult | null {
    const targetDate = year * 10000 + month * 100 + day;
    const index = this.findDateIndex(targetDate);
    
    if (index === -1) return null;
    
    return {
      animalNumber: this.ANIMAL_LOOKUP[index],
      sixStarNumber: this.SIXSTAR_LOOKUP[index],
      dateIndex: index
    };
  }
  
  private static findDateIndex(targetDate: number): number {
    // 1960/1/1 = 19600101 からのオフセット計算
    const baseDate = 19600101;
    const yearDiff = Math.floor(targetDate / 10000) - 1960;
    const approximateIndex = yearDiff * 365;  // 概算インデックス
    
    // 近傍線形探索（±5日以内）
    for (let i = Math.max(0, approximateIndex - 5); 
         i < Math.min(this.DATE_LOOKUP.length, approximateIndex + 5); 
         i++) {
      if (this.DATE_LOOKUP[i] === targetDate) return i;
    }
    
    return -1;
  }
}
```

#### Edge Runtime 最適化
```typescript
// src/app/api/fortune-calc/route.ts (v2.0)
export const runtime = 'edge';
export const preferredRegion = 'auto';

// モジュールスコープキャッシュ（Edge インスタンス間共有）
const moduleCache = new Map<string, FortuneResult>();

export async function POST(request: NextRequest): Promise<Response> {
  const startTime = performance.now();
  
  try {
    const { year, month, day } = await request.json();
    
    // 高速バリデーション
    if (!isValidDate(year, month, day)) {
      return new Response(
        JSON.stringify({ error: '無効な日付です' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // モジュールキャッシュ確認
    const cacheKey = `${year}-${month}-${day}`;
    let result = moduleCache.get(cacheKey);
    
    if (!result) {
      // 高速計算エンジン実行
      result = await FastFortuneEngine.calculate(year, month, day);
      moduleCache.set(cacheKey, result);
      
      // LRU キャッシュサイズ管理
      if (moduleCache.size > 1000) {
        const firstKey = moduleCache.keys().next().value;
        moduleCache.delete(firstKey);
      }
    }
    
    // レスポンス時間測定
    const responseTime = performance.now() - startTime;
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 's-maxage=31536000, stale-while-revalidate=86400',
          'X-Response-Time': `${responseTime.toFixed(2)}ms`,
          'X-Cache-Status': moduleCache.has(cacheKey) ? 'HIT' : 'MISS'
        }
      }
    );
    
  } catch (error) {
    console.error('Fortune calculation error:', error);
    return new Response(
      JSON.stringify({ error: '算命学計算エラー' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### 3.2 パフォーマンステスト（1日）

#### k6 による負荷テスト
```javascript
// tests/load/k6-fortune-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },   // warm-up
    { duration: '60s', target: 50 },   // 50並列負荷
    { duration: '60s', target: 100 },  // 100並列（ストレステスト）
    { duration: '30s', target: 0 }     // cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'],     // P95 < 100ms
    http_req_duration: ['p(99)<500'],     // P99 < 500ms  
    http_req_failed: ['rate<0.01'],       // エラー率 < 1%
    http_reqs: ['rate>200']               // 200 RPS 以上
  }
};

const testCases = [
  { year: 1990, month: 5, day: 15 },
  { year: 2000, month: 2, day: 29 }, // うるう年
  { year: 1960, month: 1, day: 1 },  // 境界値
  { year: 2025, month: 12, day: 31 }, // 境界値
  { year: 1985, month: 8, day: 20 }
];

export default function() {
  const testCase = testCases[Math.floor(Math.random() * testCases.length)];
  
  const response = http.post('http://localhost:3000/api/fortune-calc', 
    JSON.stringify(testCase), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
    'has animal': (r) => JSON.parse(r.body).animal !== undefined,
    'has zodiac': (r) => JSON.parse(r.body).zodiac !== undefined,
  });
  
  sleep(0.1); // 100ms間隔
}
```

#### 継続監視スクリプト  
```typescript
// scripts/performance-monitor.ts
export class PerformanceMonitor {
  static async runContinuousTest(durationMinutes: number = 5) {
    console.log(`🚀 ${durationMinutes}分間の継続性能テスト開始...`);
    
    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      responseTimes: [] as number[],
      errors: [] as string[]
    };
    
    const startTime = Date.now();
    const endTime = startTime + (durationMinutes * 60 * 1000);
    
    while (Date.now() < endTime) {
      try {
        const testStart = performance.now();
        
        const response = await fetch('http://localhost:3000/api/fortune-calc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: 1980 + Math.floor(Math.random() * 45),
            month: Math.floor(Math.random() * 12) + 1,
            day: Math.floor(Math.random() * 28) + 1
          })
        });
        
        const testEnd = performance.now();
        const responseTime = testEnd - testStart;
        
        results.totalRequests++;
        
        if (response.ok) {
          results.successfulRequests++;
          results.responseTimes.push(responseTime);
        } else {
          results.errors.push(`HTTP ${response.status}`);
        }
        
        // 10 RPS ペース
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.errors.push(error.message);
      }
    }
    
    this.generatePerformanceReport(results);
  }
  
  private static generatePerformanceReport(results: any) {
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    const p95ResponseTime = this.calculatePercentile(results.responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(results.responseTimes, 99);
    const successRate = (results.successfulRequests / results.totalRequests) * 100;
    
    console.log(`
📊 パフォーマンステスト結果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 総リクエスト数: ${results.totalRequests}
✅ 成功リクエスト数: ${results.successfulRequests}
🎯 成功率: ${successRate.toFixed(2)}%

⏱️  レスポンス時間統計:
   平均: ${avgResponseTime.toFixed(2)}ms
   P95:  ${p95ResponseTime.toFixed(2)}ms
   P99:  ${p99ResponseTime.toFixed(2)}ms

🚨 目標値との比較:
   P95 < 100ms: ${p95ResponseTime < 100 ? '✅ 達成' : '❌ 未達成'}
   P99 < 500ms: ${p99ResponseTime < 500 ? '✅ 達成' : '❌ 未達成'}
   成功率 > 99%: ${successRate > 99 ? '✅ 達成' : '❌ 未達成'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
}
```

---

## ✅ Phase 4: 品質保証・本番対応（1日間）

### 目標
本番運用準備完了、監視・ログ体制構築

### 4.1 総合精度検証（0.5日）

#### 最終精度確認テスト
```typescript
// tests/final/comprehensive-accuracy-test.ts
describe('最終精度検証テスト', () => {
  test('精度検証: 全10セットで100%精度', async () => {
    console.log('🎯 最終精度検証開始...');
    
    let totalTests = 0;
    let passedTests = 0;
    const detailedResults = [];
    
    for (const testCase of PRECISION_TEST_CASES) {
      const response = await fetch('http://localhost:3000/api/fortune-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.input)
      });
      
      const result = await response.json();
      totalTests++;
      
      const isAccurate = (
        result.animal === testCase.expected.animal &&
        result.zodiac === testCase.expected.zodiac &&
        result.six_star === testCase.expected.six_star &&
        result.animal_number === testCase.expected.animal_number
      );
      
      if (isAccurate) passedTests++;
      
      detailedResults.push({
        testName: testCase.name,
        passed: isAccurate,
        expected: testCase.expected,
        actual: {
          animal: result.animal,
          zodiac: result.zodiac,
          six_star: result.six_star,
          animal_number: result.animal_number
        }
      });
    }
    
    // 最終レポート生成
    console.log(`
🏆 最終精度検証結果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 合格テスト: ${passedTests}/${totalTests}
🎯 精度: ${((passedTests/totalTests)*100).toFixed(1)}%
    `);
    
    // 100%精度を要求
    expect(passedTests).toBe(totalTests);
  });
});
```

### 4.2 監視・ログ設定（0.5日）

#### 本番監視ダッシュボード設定
```typescript
// src/lib/monitoring/api-monitor.ts
export class APIMonitor {
  private static metrics = {
    requestCount: 0,
    errorCount: 0,
    responseTimes: [] as number[],
    cacheHitRatio: 0
  };
  
  static recordRequest(responseTime: number, isError: boolean = false) {
    this.metrics.requestCount++;
    this.metrics.responseTimes.push(responseTime);
    
    if (isError) this.metrics.errorCount++;
    
    // メトリクス配列サイズ管理（最新1000件保持）
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
  }
  
  static getHealthStatus() {
    const now = Date.now();
    const recentResponseTimes = this.metrics.responseTimes.slice(-100);
    const avgResponseTime = recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length;
    const errorRate = this.metrics.errorCount / this.metrics.requestCount;
    
    return {
      status: avgResponseTime < 100 && errorRate < 0.01 ? 'healthy' : 'degraded',
      metrics: {
        totalRequests: this.metrics.requestCount,
        errorRate: errorRate,
        avgResponseTime: avgResponseTime,
        p95ResponseTime: this.calculateP95(recentResponseTimes)
      },
      timestamp: now
    };
  }
}
```

#### アラート設定
```typescript
// src/lib/monitoring/alerts.ts
export class AlertManager {
  static checkThresholds(metrics: any) {
    const alerts = [];
    
    // レスポンス時間アラート
    if (metrics.p95ResponseTime > 100) {
      alerts.push({
        type: 'performance',
        severity: 'warning',
        message: `P95レスポンス時間が閾値超過: ${metrics.p95ResponseTime}ms > 100ms`
      });
    }
    
    // エラー率アラート
    if (metrics.errorRate > 0.05) {
      alerts.push({
        type: 'error_rate',
        severity: 'critical',
        message: `エラー率が閾値超過: ${(metrics.errorRate*100).toFixed(2)}% > 5%`
      });
    }
    
    // キャッシュ効率アラート
    if (metrics.cacheHitRatio < 0.8) {
      alerts.push({
        type: 'cache_efficiency',
        severity: 'info', 
        message: `キャッシュヒット率低下: ${(metrics.cacheHitRatio*100).toFixed(1)}% < 80%`
      });
    }
    
    return alerts;
  }
}
```

---

## 📊 成功指標・最終チェックリスト

### 精度指標（必須）
- [ ] 10セット精度テストで100%精度達成
- [ ] 境界値テスト（1960/1/1, 2025/12/31）合格
- [ ] うるう年処理（2000/2/29, 2024/2/29）合格
- [ ] 現行システムとの後方互換性確認

### パフォーマンス指標（必須）  
- [ ] 単発APIコール: < 100ms (P95)
- [ ] 50並列負荷テスト: < 150ms (平均)
- [ ] スループット: > 200 RPS
- [ ] エラー率: < 1%

### 機能完全性（必須）
- [ ] 年齢算出（JST基準）
- [ ] 十二支・干支算出
- [ ] 60種動物占い算出
- [ ] 六星占術（星人±）算出
- [ ] 天中殺年・状態算出
- [ ] 性格特性統合

### 技術品質（推奨）
- [ ] TypeScript型安全性（strict mode）
- [ ] Jest単体テストカバレッジ > 90%
- [ ] ESLint・Prettier適用
- [ ] Edge Runtime対応
- [ ] LRUキャッシュ実装

### 運用準備（推奨）
- [ ] ヘルスチェックエンドポイント
- [ ] 監視ダッシュボード
- [ ] エラーアラート設定
- [ ] パフォーマンス監視
- [ ] ログ構造化

---

## 🎯 マイルストーン・デリバリー

### Milestone 1: 精度検証基盤完成（2日後）
**成果物**:
- 10セット精度テストデータ
- 自動テストフレームワーク（Jest）
- 現行API精度ベースラインレポート

### Milestone 2: 計算エンジン完成（6日後）
**成果物**: 
- 新算命学APIエンドポイント（v2.0）
- 全計算ロジック実装完了
- 精度100%達成確認

### Milestone 3: 性能最適化完成（8日後）
**成果物**:
- Edge Runtime対応
- LRUキャッシュシステム
- 50並列・100ms以下性能達成

### Milestone 4: 本番リリース準備完了（9日後）
**成果物**:
- 本番監視体制構築  
- 総合品質保証完了
- ドキュメント整備完了

---

**最終更新**: 2025-01-05  
**文書バージョン**: 2.0  
**想定工数**: 7-9日間（1.5-2週間）  
**成功定義**: 精度100% + 性能100ms + 50人同時接続対応