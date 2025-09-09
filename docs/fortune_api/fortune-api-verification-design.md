# 算命学API検証システム設計書

## 概要
NOA Group動物占いサイトからの検証データ収集とCOCOSiL算命学APIとの照合システム

## 技術アーキテクチャ

### システム構成
```
[Playwright Browser] → [Data Collection] → [Validation Engine] → [Report Generator]
        ↓                    ↓                    ↓                  ↓
   Web Scraping      → Data Normalization → API Comparison → Accuracy Report
```

### 技術スタック
- **Playwright 1.44+**: ブラウザ自動化とデータ収集
- **TypeScript**: 型安全なデータ処理
- **Zod**: スキーマ検証とデータ正規化
- **PostgreSQL**: 検証データの永続化
- **Docker**: 環境統一

## データ収集戦略

### 1. 事前調査フェーズ
```typescript
interface SiteAnalysis {
  robotsTxt: string;
  termsOfService: string;
  dataStructure: {
    formSelector: string;
    resultSelector: string;
    animalMapping: Record<string, string>;
  };
}
```

### 2. Playwright実装パターン
```typescript
class FortuneDataCollector {
  async collectAnimalFortune(birthdate: DateInfo): Promise<AnimalFortuneData> {
    // 1. サイトアクセス（適切なディレイ付き）
    await this.page.goto('https://www.noa-group.co.jp/animal-fortune');
    await this.randomDelay(500, 1500);
    
    // 2. フォーム入力
    await this.page.fill('[name="birth_year"]', birthdate.year.toString());
    await this.page.fill('[name="birth_month"]', birthdate.month.toString());
    await this.page.fill('[name="birth_day"]', birthdate.day.toString());
    
    // 3. 送信と結果取得
    await this.page.click('[type="submit"]');
    await this.page.waitForSelector('.result', { timeout: 10000 });
    
    return this.extractFortuneData();
  }
}
```

### 3. データ正規化
```typescript
const AnimalFortuneSchema = z.object({
  animal: z.string(),
  characteristics: z.array(z.string()),
  element: z.enum(['木', '火', '土', '金', '水']),
  luckyColor: z.string().optional(),
  compatibleAnimals: z.array(z.string()).optional(),
});
```

## API検証ロジック

### 1. データ照合システム
```typescript
class FortuneValidator {
  async compareResults(
    scraped: AnimalFortuneData,
    apiResult: FortuneResult
  ): Promise<ValidationReport> {
    return {
      animalMatch: this.calculateSimilarity(scraped.animal, apiResult.animal),
      characteristicsMatch: this.compareArrays(scraped.characteristics, apiResult.characteristics),
      elementMatch: scraped.element === apiResult.element,
      overallAccuracy: this.calculateOverallScore(),
    };
  }
}
```

### 2. 精度測定メトリクス
- **完全一致率**: 動物名・特徴の完全マッチ
- **類似度**: Levenshtein距離による類似度計算
- **要素一致率**: 五行要素の一致率
- **信頼性スコア**: 総合的な信頼度指標

## 実装ガイドライン

### 1. リスク軽減策
```typescript
const SAFETY_CONFIG = {
  maxConcurrentRequests: 3,
  requestDelay: { min: 1000, max: 3000 },
  maxRetries: 3,
  backoffMultiplier: 2,
  circuitBreakerThreshold: 0.5,
};
```

### 2. エラーハンドリング
```typescript
class SafeDataCollector {
  async safeExecute<T>(operation: () => Promise<T>): Promise<T | null> {
    try {
      return await this.circuitBreaker.execute(operation);
    } catch (error) {
      this.logger.error('Data collection failed', error);
      await this.notifyError(error);
      return null;
    }
  }
}
```

### 3. データベースschema
```sql
CREATE TABLE fortune_verification (
  id SERIAL PRIMARY KEY,
  birth_date DATE NOT NULL,
  scraped_data JSONB NOT NULL,
  api_result JSONB NOT NULL,
  comparison_result JSONB NOT NULL,
  accuracy_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fortune_verification_date ON fortune_verification(birth_date);
CREATE INDEX idx_fortune_verification_accuracy ON fortune_verification(accuracy_score);
```

## 監視・運用

### 1. ダッシュボード指標
- 収集成功率
- API応答時間
- 精度スコア推移
- エラー率とパターン

### 2. アラート設定
- 精度低下（<80%）: Slack通知
- サイト構造変更検知: GitHub Issue作成
- レート制限検知: 自動停止

## 法的・倫理的配慮

### 1. 必須チェック項目
- [ ] robots.txt確認
- [ ] 利用規約の法的レビュー
- [ ] 著作権・契約上の制約調査
- [ ] データ取得許可の書面取得

### 2. データ利用制限
- 検証目的のみに限定
- 第三者提供禁止
- 定期的なデータ削除
- ログの匿名化

### 3. 透明性確保
```typescript
const USER_AGENT = 'COCOSiL-Validator/1.0 (research purposes; contact: admin@cocosil.jp)';
```

## 実装フェーズ

### Phase 1: 基盤構築（1-2日）
1. Playwright基盤とサイト構造分析
2. データスキーマ設計と検証ロジック
3. エラーハンドリングとサーキットブレーカー

### Phase 2: データ収集（2-3日）
1. 安全なスクレイピング実装
2. データ正規化とストレージ
3. レート制限と監視

### Phase 3: 検証・改善（2-3日）
1. 算命学API照合ロジック
2. 精度測定とレポート生成
3. 運用監視とアラート設定

## 期待成果
- 算命学API精度の定量的測定
- データ品質改善のための具体的指標
- 継続的な精度監視システム
- 法的リスクを最小化した運用体制