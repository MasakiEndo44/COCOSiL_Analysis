# COCOSiL算命学API 要件定義書 v2.0

## 【本書の目的】

本要件定義書は、COCOSiL診断システムの算命学API(fortune-calc)の高精度・高性能化を実現するための包括的な技術要件と実装方針を定義する。

**更新理由**: 現在のCSV依存実装から計算式ベース実装への移行により、精度100%・レスポンス100ms以下・同時接続50人の要件を満たす。

---

## 📋 プロジェクト概要

### 背景・現状
- **現在の実装**: CSV ファイルベースのルックアップテーブル方式
- **課題**: ファイルI/O遅延、メモリ使用量、拡張性限界
- **対象範囲**: 1960-2025年（66年間、約24,090日）

### プロジェクト目標
1. **精度保証**: 算命学計算結果の100%精度達成
2. **パフォーマンス**: API応答時間100ms以下（目標値）
3. **スケーラビリティ**: 同時50接続対応
4. **保守性**: 計算式ベースによる長期保守性確保

---

## 🎯 技術要件詳細

### 1. 出力項目要件

#### 1.1 基本出力（必須）
```typescript
interface FortuneCalcResponse {
  // 基本情報
  age: number;              // 満年齢（JST基準）
  zodiac: string;           // 十二支（子丑寅卯辰巳午未申酉戌亥）
  
  // 動物占い（60種対応）
  animal: string;           // 基本12動物名
  animal_number: number;    // 1-60の詳細分類番号
  animal_character: string; // 本質キャラクター
  animal_color: string;     // アニマルカラー
  
  // 六星占術
  six_star: string;         // 星人±（土星人+、金星人-等）
  six_star_cycle: string;   // 当年の運気サイクル
  
  // 算命学・天中殺
  tenchusatsu_years: number[];  // 天中殺年（2年連続）
  tenchusatsu_status: 'active' | 'inactive'; // 現在の天中殺状態
  
  // 性格特性
  personality_traits: string[]; // 統合された性格特性リスト
}
```

#### 1.2 詳細情報（拡張）
```typescript
interface FortuneDetailResponse extends FortuneCalcResponse {
  fortune_detail: {
    birth_date: string;        // 生年月日文字列表示
    western_zodiac: string;    // 西洋12星座
    chinese_zodiac: string;    // 干支年表示
    
    // 算命学詳細
    sanmeigaku: {
      celestial_stem: string;  // 天干
      earthly_branch: string;  // 地支
      five_elements: string;   // 五行配置
      destiny_number: number;  // 宿命数
    };
    
    // 運勢サイクル
    fortune_cycles: {
      yearly: string;          // 年運
      monthly: string;         // 月運（当月）
      daily: string;           // 日運傾向
    };
  };
}
```

### 2. パフォーマンス要件

#### 2.1 レスポンス時間
- **目標値**: 100ms以下（P95）
- **許容値**: 500ms以下（P99）
- **測定基準**: ネットワーク遅延含む エンドツーエンド

#### 2.2 スループット
- **同時接続**: 50ユーザー
- **処理能力**: 500 req/sec（ピーク時）
- **CPU使用率**: 平均50%以下

#### 2.3 メモリ使用量
- **キャッシュサイズ**: 最大500KB（ルックアップテーブル）
- **LRU キャッシュ**: 10,000エントリ保持
- **ガベージコレクション**: 25ms以下の停止時間

### 3. 技術アーキテクチャ要件

#### 3.1 ランタイム環境
```typescript
// Edge Runtime 最適化
export const runtime = 'edge';
export const preferredRegion = 'auto'; // リージョン自動選択

// レスポンスキャッシュ戦略
const cacheHeaders = {
  'Cache-Control': 's-maxage=31536000, stale-while-revalidate=86400',
  'CDN-Cache-Control': 'max-age=86400'
};
```

#### 3.2 データ構造最適化
```typescript
// TypedArray によるメモリ効率化
interface LookupTable {
  dates: Uint32Array;      // YYYYMMDD 形式
  animals: Uint8Array;     // 1-60 の動物番号
  sixStars: Uint8Array;    // 1-12 の六星番号
  tenchusatsu: Uint8Array; // ビットフラグ
}

// キャッシュキー設計
type CacheKey = `${number}-${number}-${number}`; // YYYY-MM-DD
```

#### 3.3 計算エンジン設計

##### 干支・十二支計算
```typescript
function calculateZodiac(year: number): string {
  const zodiacAnimals = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  return zodiacAnimals[(year - 4) % 12];
}
```

##### 動物占い計算（60種対応）
```typescript
function calculateAnimal60(year: number, month: number, day: number): AnimalResult {
  // Excel シリアル値変換
  const serialValue = dateToExcelSerial(year, month, day);
  
  // 60種動物算出: (シリアル値 + 8) % 60 + 1
  const animalNumber = ((serialValue + 8) % 60) + 1;
  
  return ANIMAL_LOOKUP_60[animalNumber];
}
```

##### 六星占術計算
```typescript
function calculateSixStar(year: number, month: number, day: number): SixStarResult {
  // 細木数子版準拠の計算ロジック
  const baseNumber = calculateSixStarBase(year, month, day);
  const starType = SIX_STAR_MAPPING[baseNumber % 12];
  
  return {
    star: starType,
    cycle: getCurrentCycle(year, starType),
    fortune: getYearlyFortune(starType, new Date().getFullYear())
  };
}
```

##### 天中殺計算
```typescript
function calculateTenchusatsu(year: number): TenchusatsuResult {
  const zodiac = calculateZodiac(year);
  const tenchusatsuPattern = TENCHUSATSU_PATTERNS[zodiac];
  
  return {
    years: calculateTenchusatsuYears(year, tenchusatsuPattern),
    status: getCurrentTenchusatsuStatus(year, tenchusatsuPattern)
  };
}
```

---

## 📊 品質保証要件

### 1. 精度検証戦略

#### 1.1 テストデータセット
```typescript
interface TestDataSet {
  // 境界値テスト
  boundaryTests: FortuneTestCase[];    // 1960/1/1, 2025/12/31等
  
  // 代表値テスト  
  representativeTests: FortuneTestCase[]; // 各年代・月の代表値
  
  // エッジケース
  edgeCases: FortuneTestCase[];        // うるう年、月末等
  
  // 回帰テスト
  regressionTests: FortuneTestCase[];  // 既知の正解データ
}

// 最低10セットの精度100%テストケース
const PRECISION_TEST_CASES: FortuneTestCase[] = [
  {
    input: { year: 1990, month: 5, day: 15 },
    expected: {
      animal: 'チーター', zodiac: '午',
      six_star: '土星人+', animal_number: 43
    }
  },
  // ... 9セット追加
];
```

#### 1.2 自動テストフレームワーク
```typescript
// Jest ベース精度検証
describe('Fortune API Precision Tests', () => {
  test('100% accuracy on precision test cases', async () => {
    for (const testCase of PRECISION_TEST_CASES) {
      const result = await fortuneApi.calculate(testCase.input);
      
      expect(result.animal).toBe(testCase.expected.animal);
      expect(result.zodiac).toBe(testCase.expected.zodiac);
      expect(result.six_star).toBe(testCase.expected.six_star);
      expect(result.animal_number).toBe(testCase.expected.animal_number);
    }
  });
  
  test('Performance: Response time < 100ms', async () => {
    const startTime = performance.now();
    await fortuneApi.calculate({ year: 1990, month: 5, day: 15 });
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

### 2. パフォーマンステスト

#### 2.1 負荷テスト設計
```bash
# k6 による負荷テスト
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // warm-up
    { duration: '60s', target: 50 },  // 50 並列負荷
    { duration: '30s', target: 0 }    // cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'],  // P95 < 100ms
    http_req_failed: ['rate<0.01']     // エラー率 < 1%
  }
};

export default function() {
  const payload = {
    year: 1990,
    month: Math.floor(Math.random() * 12) + 1,
    day: Math.floor(Math.random() * 28) + 1
  };
  
  http.post('http://localhost:3000/api/fortune-calc', JSON.stringify(payload));
}
```

---

## 🚀 実装ロードマップ

### Phase 1: 精度検証基盤（2日）
**目標**: 現行システムとの精度100%照合確認

#### タスク詳細
- [ ] **1.1 正解データセット作成**（0.5日）
  - 境界値: 1960/1/1, 2025/12/31, うるう年2/29
  - 代表値: 各年代から2-3セット選択
  - 合計10セットの高精度テストケース作成

- [ ] **1.2 自動テストフレームワーク構築**（1日）  
  - Jest設定とテストランナー構築
  - API精度検証テスト実装
  - パフォーマンス基準テスト実装

- [ ] **1.3 現行API精度ベースライン測定**（0.5日）
  - 10セットでの現行API精度測定
  - 不整合箇所の洗い出しと原因分析

### Phase 2: 計算エンジン再実装（3-4日）  
**目標**: CSV脱却、計算式ベース実装

#### タスク詳細
- [ ] **2.1 星座計算実装**（0.5日）
  - JST対応の日付処理実装
  - 十二支・干支計算ロジック
  - 西洋12星座計算追加

- [ ] **2.2 動物占い計算式化**（1.5日）
  - Excel シリアル値変換関数
  - 60種動物占い算出式: `(シリアル値 + 8) % 60 + 1`
  - 動物マスターデータの配列化

- [ ] **2.3 六星占術実装**（1日）
  - 細木数子版準拠計算ロジック
  - 運気サイクル計算（年運・月運）
  - 星人±判定アルゴリズム

- [ ] **2.4 算命学・天中殺実装**（1日）
  - 天中殺年算出ロジック
  - 現在の天中殺状態判定
  - 十干・十二支組み合わせ計算

### Phase 3: 統合・最適化（2日）
**目標**: パフォーマンス100ms以下、50人同時接続対応

#### タスク詳細  
- [ ] **3.1 LRUキャッシュ戦略実装**（1日）
  - メモリ効率的なキャッシュ設計
  - TypedArray によるルックアップテーブル
  - Edge Runtime 最適化

- [ ] **3.2 パフォーマンステスト**（1日）
  - k6による50人同時接続テスト
  - P95 < 100ms目標達成確認
  - メモリ使用量監視とチューニング

### Phase 4: 品質保証・本番対応（1日）
**目標**: 本番運用準備完了

#### タスク詳細
- [ ] **4.1 総合精度検証**（0.5日）
  - 10セット精度100%最終確認
  - 回帰テスト実行
  - エッジケース追加検証

- [ ] **4.2 監視・ログ設定**（0.5日）
  - レスポンス時間監視
  - エラー率アラート設定
  - 本番デプロイ準備

---

## 📈 成功指標・KPI

### 1. 精度指標
- **算命学計算精度**: 100%（10テストケースすべて）
- **動物占い精度**: 100%（60種分類対応）
- **六星占術精度**: 100%（星人±含む）
- **天中殺判定精度**: 100%

### 2. パフォーマンス指標
- **API応答時間**: P95 < 100ms, P99 < 500ms
- **同時接続処理**: 50ユーザー安定稼働
- **処理スループット**: 500 req/sec
- **システム可用性**: 99.9%以上

### 3. 運用指標  
- **メモリ使用量**: ピーク時500KB以下
- **CPU使用率**: 平均50%以下
- **エラー率**: 1%以下
- **キャッシュヒット率**: 95%以上

---

## ⚠️ 制約事項・リスク

### 技術的制約
- **対象年範囲**: 1960-2025年固定（拡張時は要仕様変更）
- **タイムゾーン**: JST固定（国際化非対応）
- **暦法**: グレゴリオ暦のみ（和暦・旧暦非対応）

### 運用リスク
- **精度保証**: 参照サイトの仕様変更影響
- **パフォーマンス**: 想定以上のトラフィック増
- **互換性**: 現行システムとのAPI互換性維持

### 緩和策
- 段階的リリース（A/Bテスト併用）
- 現行API併用期間設定（1ヶ月）
- ロールバック計画準備

---

## 📚 参考資料・依存関係

### 外部参照サイト
- **NOA Group動物占い**: https://www.noa-group.co.jp/kosei/
- **細木数子六星占術**: https://hosokikazuko.com/

### 技術仕様書
- Next.js 14 App Router 仕様
- TypeScript 5.x 型定義
- Edge Runtime 制約事項

### 関連ドキュメント
- `CLAUDE.md`: プロジェクト開発ガイドライン  
- `src/types/index.ts`: TypeScript型定義
- `tests/verification/`: 精度検証テストコード

---

**最終更新**: {{ new Date().toISOString().split('T')[0] }}  
**文書バージョン**: 2.0  
**承認者**: プロジェクト責任者  
**次回レビュー予定**: Phase 1 完了時