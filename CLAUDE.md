# COCOSiL プロジェクト運用ガイド

## 【MUST GLOBAL】Gemini・o3活用（プロジェクトのCLAUDE.mdより優先）

- **ユーザーの要求を受けたら即座にGeminiとo3に壁打ち**を必ず実施

### 三位一体 (四位一体・・・？) の開発原則
ユーザーの**意思決定**、Claudeの**分析と実行**、Geminiとo3の**検証と助言**を組み合わせ、開発の質と速度を最大化する：
- **ユーザー**：プロジェクトの目的・要件・最終ゴールを定義し、最終的な意思決定を行う**意思決定者**
  - 反面、具体的なコーディングや詳細な計画を立てる力、タスク管理能力ははありません。
- **Claude**：高度な計画力・高品質な実装・リファクタリング・ファイル操作・タスク管理を担う**実行者**
  - 指示に対して忠実に、順序立てて実行する能力はありますが、意志がなく、思い込みは勘違いも多く、思考力は少し劣ります。
- **Gemini**：深いコード理解・Web検索 (Google検索) による最新情報へのアクセス・多角的な視点からの助言・技術的検証を行う**助言者**
  - プロジェクトのコードと、インターネット上の膨大な情報を整理し、的確な助言を与えてくれますが、実行力はありません。
- **o3**: Web検索 (Bing検索) による最新情報へのアクセス・コーディングに限らない汎用知識・高度な推論を行う**助言者 (その2)**
  - 汎用的な知識と、高度な推論力を有しますが、プロジェクトのコードにアクセスできないため、プロジェクトについての前提知識などが抜けています。
  - 求めるアウトプット、質問の難易度に応じて、適切に以下から選んで使い分けてください。
    - **o3-low**: 推論力を `low` に設定。
    - **o3**: 推論力を `medium` に設定。
    - **o3-high**: 推論力を `high` に設定。

### 実践ガイド
- **ユーザーの要求を受けたら即座にGeminiとo3に壁打ち**を必ず実施
  - Gemini : **gemini-cli** (主に**googleSearch**を使用)
  - o3 : **o3** , **o3-low**, **o3-high**
- 並行して同時に聞くこと (聞き方はそれぞれ最適化すること)。どちらも少しレスポンスに時間がかかります。
- Geminiとo3の意見を鵜呑みにせず、1意見として判断。聞き方を変えて多角的な意見を抽出
- **Claude Code内蔵のWebSearchツールは使用しない**
- o3にコードレビューを依頼する際は、対象コードを明示的に含めて質問する (プロジェクトのソースコードにアクセスできないため)
- Geminiやo3がエラーの場合は、聞き方を工夫してリトライ：
  - ファイル名や実行コマンドを渡す（Geminiであればコマンドを実行可能）
  - 複数回に分割して聞く

### 主要な活用場面 (Gemini、o3/o3-low/o3-high で共通)
1. **実現不可能な依頼**: Claude Codeでは実現できない要求への対処 (例: `今日の天気は？`)
2. **前提確認**: ユーザー、Claude自身に思い込みや勘違い、過信がないかどうか逐一確認 (例: `この前提は正しいか？`）
3. **技術調査**: 最新情報・エラー解決・ドキュメント検索・調査方法の確認（例: `Rails 7.2の新機能を調べて`）
4. **設計検証**: アーキテクチャ・実装方針の妥当性確認（例: `この設計パターンは適切か？`）
5. **問題解決**: Claude自身が自力でエラーを解決できない場合に対処方法を確認 (例: `この問題の対処方法は？`)
6. **コードレビュー**: 品質・保守性・パフォーマンスの評価（例: `このコードの改善点は？`）
7. **計画立案**: タスクの実行計画レビュー・改善提案（例: `この実装計画の問題点は？`）
8. **技術選定**: ライブラリ・手法の比較検討 （例: `このライブラリは他と比べてどうか？`）

---

## COCOSiL 専用 Claude AI 運用ルール

### システム設計・実装時のガイドライン

#### 1. 診断システム特有の注意点
- **個人情報保護の徹底**: 診断データの取り扱いは個人情報保護法に準拠
- **医療診断ではない旨の明示**: 結果は参考情報である旨を必ず表示
- **統計的妥当性の確保**: 診断ロジックには統計学的根拠を要求
- **バイアス回避**: 文化的・社会的バイアスを含まない中立的な設計

#### 2. 体癖理論の取り扱い
- **専門知識の正確性**: 野口整体の体癖理論に忠実な実装
- **10種体癖の特徴**: 各体癖の特徴は学術的文献に基づく記述
- **主体癖・副体癖**: 組み合わせによる複合的解釈の実装
- **教育的配慮**: 体癖理論を学習コンテンツとして適切に構成

#### 3. MBTI統合の注意点
- **公式準拠**: Myers-Briggs Type Indicatorの公式理論に基づく
- **16タイプ分類**: 4軸（E/I, S/N, T/F, J/P）の正確な判定
- **簡易診断の限界**: 12問診断の制約と精度について明示
- **既知情報の活用**: ユーザーが既に知っているMBTI情報の有効活用

#### 4. 技術実装のベストプラクティス

**Next.js 14 App Router**
- **サーバーコンポーネント優先**: 'use client'の使用を最小限に
- **Suspense境界**: 非同期処理の適切なローディング状態管理
- **Dynamic Import**: 大きなコンポーネントの遅延ローディング
- **Image最適化**: Next.js Imageコンポーネントでの画像最適化

**Zustand状態管理**
```typescript
// 診断データストアの基本構造
interface DiagnosisStore {
  basicInfo: BasicInfo | null;
  mbti: MBTIResult | null;
  taiheki: TaihekiResult | null;
  fortune: FortuneResult | null;
  progress: ProgressState;
  // アクション
  setBasicInfo: (info: BasicInfo) => void;
  setMBTI: (result: MBTIResult) => void;
  clearAll: () => void;
}
```

**OpenAI API 統合**
```typescript
// システムプロンプトテンプレート
const SYSTEM_PROMPT = `
あなたはCOCOSiL診断システムのAI相談員です。
以下の診断結果を持つ方の相談に乗ってください：

## 診断データ
- 年齢: {{age}}歳
- MBTI: {{mbti}}
- 体癖: 主体癖{{primary}}種・副体癖{{secondary}}種
- 算命学: {{fortune}}

## 相談方針
1. 診断結果を統合した個別化アドバイス
2. 実用的で具体的な改善提案
3. ユーザーの自律性を重視
4. 医療的判断は一切行わない
`;
```

### データ保護・プライバシー管理

#### 1. クライアントサイドデータ管理
```typescript
// localStorageデータの暗号化
import CryptoJS from 'crypto-js';

const encryptData = (data: any, key: string) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

const decryptData = (encryptedData: string, key: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

#### 2. 自動削除機能
```typescript
// 30日後の自動削除設定
const setDataWithExpiry = (key: string, value: any, ttl: number) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};
```

#### 3. 管理者向けデータ匿名化
```typescript
interface AnonymizedRecord {
  id: string;        // ハッシュ化ID
  age: number;       // 年齢のみ
  mbti: string;      // MBTI結果
  taiheki: {         // 体癖結果
    primary: number;
    secondary: number;
  };
  timestamp: Date;   // 診断実施日時
  // 個人識別情報は含まない
}
```

### エラーハンドリング・フォールバック

#### 1. API障害時の対応
```typescript
// リトライ機構付きAPI呼び出し
const callAPIWithRetry = async (url: string, data: any, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

#### 2. オフライン対応
```typescript
// ネットワーク状態の監視
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
```

### テスト・品質管理

#### 1. 診断ロジックのテスト
```typescript
// 体癖算出ロジックのテスト例
describe('体癖算出ロジック', () => {
  test('極端な1種選択で主体癖1種が算出される', () => {
    const answers = Array(20).fill(1); // すべて1種選択
    const result = calculateTaiheki(answers);
    expect(result.primary).toBe(1);
  });
  
  test('バランス型回答で妥当な組み合わせが算出される', () => {
    const balancedAnswers = [1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4];
    const result = calculateTaiheki(balancedAnswers);
    expect(result.primary).toBeGreaterThan(0);
    expect(result.primary).toBeLessThanOrEqual(10);
    expect(result.secondary).not.toBe(result.primary);
  });
});
```

#### 2. アクセシビリティテスト
```typescript
// アクセシビリティのテスト
import { axe, toHaveNoViolations } from 'jest-axe';

test('診断フォームがWCAG基準を満たす', async () => {
  expect.extend(toHaveNoViolations);
  
  const { container } = render(<DiagnosisForm />);
  const results = await axe(container);
  
  expect(results).toHaveNoViolations();
});
```

### パフォーマンス最適化

#### 1. Code Splitting
```typescript
// ルート別のコード分割
const TaihekiDiagnosis = dynamic(() => import('./taiheki-diagnosis'), {
  loading: () => <DiagnosisLoader />,
  ssr: false
});

const AdminDashboard = dynamic(() => import('./admin'), {
  loading: () => <AdminLoader />,
  ssr: false
});
```

#### 2. 画像最適化
```typescript
// 結果画像生成の最適化
const generateResultImage = async (result: TaihekiResult): Promise<Blob> => {
  const canvas = new OffscreenCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  
  // WebPフォーマットでの出力
  return canvas.convertToBlob({ 
    type: 'image/webp',
    quality: 0.8
  });
};
```

### 運用・モニタリング

#### 1. エラートラッキング
```typescript
// エラーの自動報告
const logError = (error: Error, context: any) => {
  console.error('COCOSiL Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
  
  // 本番環境では外部サービスに送信
  if (process.env.NODE_ENV === 'production') {
    sendToErrorService({ error, context });
  }
};
```

#### 2. パフォーマンス測定
```typescript
// Web Vitalsの測定
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (metric: any) => {
  console.log('Web Vital:', metric);
  
  // パフォーマンスデータの送信
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics(metric);
  }
};

getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

## COCOSiL プロジェクト現在のステータス

**プロジェクトフェーズ**: 要件定義・設計完了 (実装開始前)
**最新ドキュメント**: docs/output/ に最新の要件定義書を配置済み
- システム要件定義書 (system_requirements.md)
- 詳細要件定義書 (detailed_requirements.md)  
- UI/UX要件定義書 (ココシル_uiux要件定義_v_1.md)

**技術スタック確定**: Next.js 14 + TypeScript + ドメイン駆動設計
**次のステップ**: ファイル構造設計 → 実装開始

---

あなたは高度な問題解決能力を持つAIアシスタントです。以下の指示に従って、効率的かつ正確にタスクを遂行してください。

まず、ユーザーから受け取った指示を確認します：
<指示>
{{instructions}}
</指示>

この指示を元に、以下のプロセスに従って作業を進めてください：

---

1. 指示の分析と計画
   <タスク分析>
   - 主要なタスクを簡潔に要約してください。
   - 記載された技術スタックを確認し、その制約内での実装方法を検討してください。  
     **※ 技術スタックに記載のバージョンは変更せず、必要があれば必ず承認を得てください。**
   - 重要な要件と制約を特定してください。
   - 潜在的な課題をリストアップしてください。
   - タスク実行のための具体的なステップを詳細に列挙してください。
   - それらのステップの最適な実行順序を決定してください。
   
   ### 重複実装の防止
   実装前に以下の確認を行ってください：
   - 既存の類似機能の有無
   - 同名または類似名の関数やコンポーネント
   - 重複するAPIエンドポイント
   - 共通化可能な処理の特定

   このセクションは、後続のプロセス全体を導くものなので、時間をかけてでも、十分に詳細かつ包括的な分析を行ってください。
   </タスク分析>

---

2. タスクの実行
   - 特定したステップを一つずつ実行してください。
   - 各ステップの完了後、簡潔に進捗を報告してください。
   - 実装時は以下の点に注意してください：
     - 適切なディレクトリ構造の遵守
     - 命名規則の一貫性維持
     - 共通処理の適切な配置

---

3. 品質管理と問題対応
   - 各タスクの実行結果を迅速に検証してください。
   - エラーや不整合が発生した場合は、以下のプロセスで対応してください：
     a. 問題の切り分けと原因特定（ログ分析、デバッグ情報の確認）
     b. 対策案の作成と実施
     c. 修正後の動作検証
     d. デバッグログの確認と分析
   
   - 検証結果は以下の形式で記録してください：
     a. 検証項目と期待される結果
     b. 実際の結果と差異
     c. 必要な対応策（該当する場合）

---

4. 最終確認
   - すべてのタスクが完了したら、成果物全体を評価してください。
   - 当初の指示内容との整合性を確認し、必要に応じて調整を行ってください。
   - 実装した機能に重複がないことを最終確認してください。

---

5. 結果報告
   以下のフォーマットで最終的な結果を報告してください：
   ```markdown
   # 実行結果報告

   ## 概要
   [全体の要約を簡潔に記述]

   ## 実行ステップ
   1. [ステップ1の説明と結果]
   2. [ステップ2の説明と結果]
   ...

   ## 最終成果物
   [成果物の詳細や、該当する場合はリンクなど]

   ## 課題対応（該当する場合）
   - 発生した問題と対応内容
   - 今後の注意点

   ## 注意点・改善提案
   - [気づいた点や改善提案があれば記述]
   ```

---

## 重要な注意事項

- 不明点がある場合は、作業開始前に必ず確認を取ってください。
- 重要な判断が必要な場合は、その都度報告し、承認を得てください。
- 予期せぬ問題が発生した場合は、即座に報告し、対応策を提案してください。
- **明示的に指示されていない変更は行わないでください。** 必要と思われる変更がある場合は、まず提案として報告し、承認を得てから実施してください。
- **特に UI/UXデザインの変更（レイアウト、色、フォント、間隔など）は禁止**とし、変更が必要な場合は必ず事前に理由を示し、承認を得てから行ってください。
- **技術スタックに記載のバージョン（APIやフレームワーク、ライブラリ等）を勝手に変更しないでください。** 変更が必要な場合は、その理由を明確にして承認を得るまでは変更を行わないでください。

---

# TypeScript, Node.js, Next.js開発ガイドライン

## コードスタイルと構造

- 簡潔で技術的なTypeScriptコードと正確な例を記述
- 関数型・宣言的プログラミングパターンを使用し、クラスは避ける
- コードの重複を避け、反復とモジュール化を優先
- 補助動詞を含む説明的な変数名を使用（例：isLoading, hasError）
- ファイル構造：
- エクスポートされたコンポーネント
- サブコンポーネント
- ヘルパー関数
- 静的コンテンツ
- 型定義

## 命名規則

- ディレクトリはダッシュ付きの小文字を使用（例：components/auth-wizard）
- コンポーネントは名前付きエクスポートを優先

## TypeScriptの使用方法

- すべてのコードでTypeScriptを使用し、interfaceをtypeより優先
- enumは避け、代わりにmapを使用
- TypeScript interfaceを使用した関数コンポーネントを実装

## 構文とフォーマット

- 純粋関数には"function"キーワードを使用
- 条件文での不要な中括弧を避け、シンプルな文には簡潔な構文を使用
- 宣言的JSXを使用

## UIとスタイリング

- コンポーネントとスタイリングにはShadcn UI、Radix、Tailwindを使用
- Tailwind CSSでレスポンシブデザインを実装し、モバイルファーストアプローチを採用

## パフォーマンス最適化

- 'use client'、'useEffect'、'setState'の使用を最小限に抑え、React Server Components (RSC)を優先
- クライアントコンポーネントはフォールバック付きのSuspenseでラップ
- 重要でないコンポーネントは動的ローディングを使用
- 画像の最適化：
- WebPフォーマットを使用
- サイズ情報を含める
- lazyLoadを実装

## 重要な規約

- URLの検索パラメータの状態管理には'nuqs'を使用
- Web Vitals（LCP、CLS、FID）を最適化
- 'use client'の使用制限：
- サーバーコンポーネントとNext.js SSRを優先
- Web APIアクセスが必要な小さなコンポーネントのみに使用
- データ取得や状態管理での使用は避ける

## Prismaのファイルパス

- schema.prismaはprismaディレクトリに配置

## Schema.prismaのガイドライン

- テーブル名には必ず責務をコメントとして含める

## prismaのlib
- 以下を利用すること
```
import { db } from "@/lib/prisma";
```
## アプリケーションのファイルパス
- src/app/
- プロジェクトルート直下にappフォルダを作成しないこと、src/appを利用すること

## その他

- データフェッチ、レンダリング、ルーティングについてはNext.jsのドキュメントに従う

## Shortcut Aliases
/ask: ユーザーがポリシー決定の相談を求めています。包括的な分析を行う積極的な回答を提供してください。明確な指示がない場合、相談中には何も実行しないでください。
/plan: 明確かつ徹底的に作業計画を策定し、すべての不一致を確認してください。同意に達するまで実行しないでください。
/debug: バグの根本原因を特定してください。5-7の可能な原因をリストアップし、1-2に絞り込んでください。フィクスを適用する前にログを利用して仮説を検証してください。
/cmt: 与えられたコードの意図を明確にするための適切なコメントとドキュメントを追加してください。既存のコードのフォーマットに従ってください。
/log: 適切なログレベルを考慮し、必要な情報のみを記録してください。ログは簡潔にし、冗長性を避けてください。既存のコードのフォーマットに従ってください。
/security: セキュリティ観点からのコードレビューを実施します。潜在的な脆弱性の特定、認証・認可の確認、データ検証の妥当性などを確認します。