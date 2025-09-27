# COCOSiL アーキテクチャ概要

**プロジェクト**: COCOSiL（ココシル）統合診断分析システム
**文書バージョン**: 1.0
**最終更新**: 2025年1月27日

## システム概要

COCOSiLは、東洋思想に基づく体癖理論、西洋心理学のMBTI、東洋運命学の算命学、日本独自の動物占いという4つの異なる診断手法を統合した包括的な性格診断システムです。AI対話機能、学習システム、管理ダッシュボードを含む、エンドツーエンドのユーザーエクスペリエンスを提供します。

### 核となる価値提案
- **統合診断**: 4つの診断手法による多角的分析
- **AI カウンセリング**: GPT-4を活用したパーソナライズド対話
- **プライバシーファースト**: クライアントサイド処理による個人情報保護
- **学習システム**: 体癖理論の包括的教育コンテンツ

## アーキテクチャ概要

### 高レベルアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    COCOSiL システム                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14 App Router)                          │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ ランディング  │ 診断フロー   │ 学習システム  │ 管理画面     │ │
│  │ ページ       │            │            │            │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ 診断状態     │ 学習進捗     │ AI セッション│ UI状態      │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Edge Runtime & Server Functions)               │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ 運勢計算     │ AI チャット  │ 管理者API   │ データ処理   │ │
│  │ (Edge)      │ (Streaming) │             │            │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  External Services                                          │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ OpenAI API  │ 運勢エンジン  │ データベース  │ ファイル     │ │
│  │ (GPT-4)     │ (TypeScript)│ (SQLite)    │ ストレージ   │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 技術スタック詳細

#### フロントエンド
- **Next.js 14.2.32**: App Router、Server Components、Edge Runtime
- **TypeScript 5.0**: 厳密型チェック、型安全性
- **React 18**: サーバーコンポーネント、Suspense
- **Tailwind CSS 3.4**: ユーティリティファースト、カスタムデザインシステム
- **shadcn/ui**: 再利用可能UIコンポーネントライブラリ

#### 状態管理
- **Zustand 4.4**: 軽量状態管理、localStorage永続化
- **React Hook Form**: フォーム状態管理、バリデーション
- **Zod**: スキーマバリデーション、型安全性

#### バックエンド・API
- **Next.js API Routes**: サーバーサイド処理
- **Edge Runtime**: 高速運勢計算
- **OpenAI API**: GPT-4ストリーミングチャット
- **Prisma 6.15**: 型安全データベースORM

#### データベース・ストレージ
- **SQLite**: 管理データベース（開発・小規模運用）
- **localStorage**: クライアントサイド診断データ（暗号化）
- **MDX**: 学習コンテンツ静的管理

#### 開発・品質保証
- **Jest + Testing Library**: ユニットテスト
- **Playwright**: E2Eテスト自動化
- **ESLint + Prettier**: コード品質・フォーマット
- **TypeScript**: 型チェック、コンパイル時エラー検出

## システムアーキテクチャ詳細

### 1. フロントエンドアーキテクチャ

#### コンポーネント構成
```
src/ui/
├── features/          # 機能別コンポーネント
│   ├── forms/         # フォーム関連（基本情報入力等）
│   ├── diagnosis/     # 診断フロー（MBTI、体癖、結果表示）
│   ├── learn/         # 学習システム（チャプター、ナビゲーション）
│   ├── chat/          # AI対話インターフェース
│   └── admin/         # 管理画面機能
├── components/        # 共通UIコンポーネント
│   ├── ui/           # shadcn/ui ベースコンポーネント
│   ├── layout/       # レイアウト関連
│   ├── interactive/  # インタラクティブ要素
│   └── admin/        # 管理画面専用コンポーネント
└── hooks/            # カスタムReactフック
```

#### ページルーティング
```
src/app/
├── page.tsx                    # ランディングページ
├── diagnosis/
│   ├── page.tsx               # 診断開始
│   ├── basic-info/            # 基本情報入力
│   ├── mbti/                  # MBTI診断
│   ├── taiheki/               # 体癖診断
│   ├── fortune/               # 運勢診断
│   ├── chat/                  # AI対話
│   └── results/               # 統合結果
├── learn/taiheki/
│   ├── page.tsx               # 学習システムトップ
│   └── [chapter]/             # 動的チャプターページ
├── admin/
│   ├── page.tsx               # 管理ダッシュボード
│   ├── auth/                  # 認証ページ
│   ├── records/               # 診断記録管理
│   └── monitoring/            # システム監視
└── api/                       # APIエンドポイント
```

### 2. 状態管理アーキテクチャ

#### Zustandストア構成

```typescript
// 診断フロー状態管理
interface DiagnosisStore {
  // セッション管理
  sessionId: string | null;
  startTime: Date | null;

  // 診断データ
  basicInfo: BasicInfo | null;
  mbti: MBTIResult | null;
  taiheki: TaihekiResult | null;
  fortune: FortuneResult | null;

  // AI対話
  chatSession: ChatSession | null;
  messages: Message[];

  // 進捗管理
  progress: {
    currentStep: DiagnosisStep;
    completedSteps: DiagnosisStep[];
    percentComplete: number;
  };

  // UI状態
  overlayHints: OverlayHint[];
  isLoading: boolean;

  // アクション
  setBasicInfo: (info: BasicInfo) => void;
  setMBTI: (result: MBTIResult) => void;
  setTaiheki: (result: TaihekiResult) => void;
  setFortune: (result: FortuneResult) => void;
  addMessage: (message: Message) => void;
  updateProgress: (step: DiagnosisStep) => void;
  resetDiagnosis: () => void;
}

// 学習システム状態管理
interface LearningStore {
  currentChapter: number;
  completedChapters: number[];
  chapterScores: Record<number, number>;
  readingProgress: Record<number, number>;

  // アクション
  setCurrentChapter: (chapter: number) => void;
  markChapterComplete: (chapter: number, score?: number) => void;
  updateReadingProgress: (chapter: number, progress: number) => void;
}
```

#### データフロー
```
User Action → Component → Zustand Store → localStorage/API
                ↓
UI Update ← Component ← Store Subscription
```

### 3. APIアーキテクチャ

#### エンドポイント構成

**診断関連API**
```typescript
// 運勢計算エンジン (Edge Runtime)
POST /api/fortune-calc-v2
{
  birthDate: "1990-01-01",
  gender: "male"
}
→ {
  age: 35,
  westernZodiac: "capricorn",
  animalCharacter: "tiger_red",
  sixStarFortune: "taikai",
  elements: ["wood", "fire"]
}

// 診断結果統合
POST /api/diagnosis/summary
{
  basicInfo: BasicInfo,
  mbti: MBTIResult,
  taiheki: TaihekiResult,
  fortune: FortuneResult
}
→ {
  integratedProfile: IntegratedProfile,
  recommendations: string[],
  insights: string[]
}
```

**AI対話API**
```typescript
// OpenAI ストリーミングチャット
POST /api/ai/chat
{
  messages: Message[],
  diagnosisContext: DiagnosisContext
}
→ ReadableStream<ChatCompletionChunk>
```

**管理者API**
```typescript
// 認証
POST /api/admin/auth
{ pin: "1234" } → { token: "jwt_token" }

// 診断記録管理
GET /api/admin/records?page=1&limit=10
→ { records: DiagnosisRecord[], pagination: {...} }

// 統計データ
GET /api/admin/stats
→ {
  totalDiagnoses: number,
  monthlyGrowth: number,
  popularTypes: TypeStats[]
}
```

#### Edge Runtime最適化

運勢計算エンジンはEdge Runtimeで実行され、以下の特徴を持ちます：

```typescript
// src/app/api/fortune-calc-v2/route.ts
export const runtime = 'edge';

export async function POST(request: Request) {
  // 1. 高速計算（< 100ms）
  const fortune = calculateFortuneSimplified(birthDate, gender);

  // 2. LRUキャッシュ（メモリ効率）
  const cached = fortuneCache.get(cacheKey);

  // 3. 同時接続対応（50+ users）
  return new Response(JSON.stringify(fortune));
}
```

### 4. データベース設計

#### スキーマ構成

```prisma
// prisma/schema.prisma

model DiagnosisRecord {
  id          Int      @id @default(autoincrement())
  sessionId   String   @unique

  // 基本情報（匿名化）
  ageRange    String   // "20-25", "30-35" etc.
  gender      String

  // 診断結果
  mbtiType    String?
  taihekiPrimary   Int?
  taihekiSecondary Int?
  animalType  String?

  // メタデータ
  completedAt DateTime @default(now())
  duration    Int?     // 診断にかかった時間（秒）

  // 統計用
  chatMessagesCount Int? @default(0)

  @@map("diagnosis_records")
}

model AdminSession {
  id        String   @id @default(cuid())
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("admin_sessions")
}
```

### 5. セキュリティ・プライバシー設計

#### プライバシーファーストアーキテクチャ

```typescript
// クライアントサイドデータ管理
class PrivacyManager {
  // 1. 暗号化ストレージ
  encryptAndStore(key: string, data: any) {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.getEncryptionKey()
    ).toString();
    localStorage.setItem(key, encrypted);
  }

  // 2. 自動期限切れ（30日）
  checkDataExpiry() {
    const timestamp = localStorage.getItem('diagnosis_timestamp');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    if (timestamp && parseInt(timestamp) < thirtyDaysAgo) {
      this.clearAllDiagnosisData();
    }
  }

  // 3. データ匿名化
  anonymizeForAdmin(data: DiagnosisData): AnonymizedData {
    return {
      ageRange: this.calculateAgeRange(data.age),
      gender: data.gender,
      mbtiType: data.mbti?.type,
      // 個人識別情報は除外
    };
  }
}
```

#### セキュリティ層

```typescript
// JWT認証（管理者）
class AdminAuth {
  generateToken(pin: string): string {
    if (!this.verifyPin(pin)) throw new Error('Invalid PIN');

    return jwt.sign(
      { role: 'admin', exp: Math.floor(Date.now() / 1000) + (60 * 60) },
      process.env.JWT_SECRET!
    );
  }

  verifyToken(token: string): boolean {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return true;
    } catch {
      return false;
    }
  }
}

// CORS設定
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### 6. パフォーマンス最適化

#### フロントエンド最適化

```typescript
// 1. コード分割
const DiagnosisFlow = lazy(() => import('@/features/diagnosis/DiagnosisFlow'));
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard'));

// 2. 画像最適化
import Image from 'next/image';

<Image
  src="/images/taiheki-1.webp"
  alt="体癖1番の特徴"
  width={600}
  height={400}
  loading="lazy"
  placeholder="blur"
/>

// 3. Server Components優先
// デフォルトでServer Component、クライアント機能が必要な場合のみ'use client'
```

#### バックエンド最適化

```typescript
// 1. LRUキャッシュ（運勢計算）
class FortuneCache {
  private cache = new Map<string, { data: any, timestamp: number }>();
  private maxSize = 1000;
  private ttl = 7 * 24 * 60 * 60 * 1000; // 7日

  get(key: string) {
    const item = this.cache.get(key);
    if (!item || Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key: string, data: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// 2. ストリーミング（AI チャット）
async function* streamChatResponse(messages: Message[]) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || '';
  }
}
```

### 7. 診断アルゴリズム実装

#### MBTI診断アルゴリズム

```typescript
// src/lib/data/mbti-questions.ts
interface MBTIQuestion {
  id: string;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  weight: number;
  options: {
    text: string;
    score: number; // -2 to +2
  }[];
}

class MBTICalculator {
  calculateType(answers: Answer[]): MBTIResult {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    answers.forEach(answer => {
      const question = this.questions.find(q => q.id === answer.questionId);
      const score = answer.score * question.weight;

      switch (question.dimension) {
        case 'EI':
          if (score > 0) scores.E += score;
          else scores.I += Math.abs(score);
          break;
        // ... 他のディメンション
      }
    });

    const type =
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');

    return {
      type,
      confidence: this.calculateConfidence(scores),
      scores
    };
  }
}
```

#### 体癖診断アルゴリズム

```typescript
// src/lib/taiheki/calculator.ts
class TaihekiCalculator {
  calculate(answers: TaihekiAnswer[]): TaihekiResult {
    const typeScores = new Array(12).fill(0);

    answers.forEach(answer => {
      const question = this.questions.find(q => q.id === answer.questionId);
      question.mappings.forEach(mapping => {
        typeScores[mapping.type - 1] += answer.score * mapping.weight;
      });
    });

    // 主要・副次体癖の決定
    const sortedTypes = typeScores
      .map((score, index) => ({ type: index + 1, score }))
      .sort((a, b) => b.score - a.score);

    return {
      primary: sortedTypes[0].type,
      secondary: sortedTypes[1].type,
      scores: typeScores,
      confidence: this.calculateConfidence(sortedTypes)
    };
  }
}
```

#### 運勢計算エンジン

```typescript
// src/lib/fortune/precision-calculator.ts
export function calculateFortuneSimplified(
  birthDate: string,
  gender: string
): FortuneResult {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 1. 算命学計算
  const sanmeigaku = calculateSanmeigaku(year, month, day);

  // 2. 動物占い判定（60種類）
  const animalType = calculateAnimalType(year, month, day, gender);

  // 3. 六星占術
  const sixStar = calculateSixStar(year, month, day);

  // 4. 西洋占星術
  const westernZodiac = calculateWesternZodiac(month, day);

  return {
    age: new Date().getFullYear() - year,
    westernZodiac,
    animalCharacter: animalType,
    sixStarFortune: sixStar,
    elements: sanmeigaku.elements,
    orientation: animalType.includes('right') ? 'right' : 'left'
  };
}
```

### 8. 学習システム実装

#### MDXコンテンツ管理

```typescript
// src/app/learn/taiheki/[chapter]/page.tsx
interface ChapterPageProps {
  params: { chapter: string };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const chapter = parseInt(params.chapter);

  // 動的MDXインポート
  const MDXContent = await import(`@/content/taiheki/chapter-${chapter}.mdx`);

  return (
    <LearningLayout chapter={chapter}>
      <ChapterNavigation chapter={chapter} />
      <div className="prose prose-lg max-w-4xl mx-auto">
        <MDXContent.default />
      </div>
      <ChapterProgress chapter={chapter} />
    </LearningLayout>
  );
}

// MDX設定
const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight, rehypeSlug],
  },
});
```

#### 進捗追跡システム

```typescript
// 学習進捗の永続化
class LearningProgressManager {
  saveProgress(chapter: number, progress: number) {
    const existingProgress = this.getProgress();
    existingProgress[chapter] = {
      ...existingProgress[chapter],
      readingProgress: progress,
      lastAccessed: new Date().toISOString()
    };

    localStorage.setItem('learning_progress', JSON.stringify(existingProgress));
  }

  markChapterComplete(chapter: number, score?: number) {
    const progress = this.getProgress();
    progress[chapter] = {
      ...progress[chapter],
      completed: true,
      score: score || 100,
      completedAt: new Date().toISOString()
    };

    localStorage.setItem('learning_progress', JSON.stringify(progress));
  }
}
```

### 9. テスト戦略

#### ユニットテスト

```typescript
// src/__tests__/lib/taiheki/calculator.test.ts
describe('TaihekiCalculator', () => {
  const calculator = new TaihekiCalculator();

  test('正確な体癖計算', () => {
    const answers = [
      { questionId: 'q1', score: 5 },
      { questionId: 'q2', score: 3 },
      // ... テストデータ
    ];

    const result = calculator.calculate(answers);

    expect(result.primary).toBe(1);
    expect(result.secondary).toBe(5);
    expect(result.confidence).toBeGreaterThan(0.7);
  });
});
```

#### E2Eテスト

```typescript
// tests/e2e/diagnosis-flow.spec.ts
test('完全な診断フロー', async ({ page }) => {
  // 1. ランディングページ
  await page.goto('/');
  await page.click('[data-testid="start-diagnosis"]');

  // 2. 基本情報入力
  await page.fill('[name="name"]', 'テストユーザー');
  await page.fill('[name="email"]', 'test@example.com');
  await page.selectOption('[name="gender"]', 'male');
  await page.fill('[name="birthDate"]', '1990-01-01');
  await page.click('[type="submit"]');

  // 3. MBTI診断
  await page.waitForSelector('[data-testid="mbti-questions"]');
  // 質問に回答...

  // 4. 体癖診断
  await page.waitForSelector('[data-testid="taiheki-questions"]');
  // 質問に回答...

  // 5. 結果確認
  await page.waitForSelector('[data-testid="diagnosis-results"]');
  expect(page.locator('[data-testid="mbti-result"]')).toBeVisible();
  expect(page.locator('[data-testid="taiheki-result"]')).toBeVisible();
});
```

## デプロイメント・運用

### 本番環境構成

```yaml
# Vercel 推奨構成
Platform: Vercel
Runtime: Node.js 18
Build Command: npm run build
Output Directory: .next

# 環境変数
OPENAI_API_KEY: "sk-..."
ADMIN_PASSWORD: "1234"  # 4桁PIN
JWT_SECRET: "your-secret-key"
NODE_ENV: "production"

# データベース（本番）
Database: PlanetScale / Supabase
Connection: MySQL / PostgreSQL
Migrations: Prisma
```

### モニタリング・ログ

```typescript
// 包括的エラーログ
class Logger {
  error(message: string, context?: any) {
    console.error({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      context,
      stack: new Error().stack
    });

    // 本番環境では外部サービスに送信
    if (process.env.NODE_ENV === 'production') {
      this.sendToSentry(message, context);
    }
  }

  // パフォーマンス追跡
  trackDiagnosisCompletion(duration: number, type: string) {
    this.info('Diagnosis completed', {
      duration,
      type,
      timestamp: Date.now()
    });
  }
}
```

## 今後の拡張計画

### 短期的改善（Q1 2025）
1. **TypeScript エラー解決**: 147エラーの完全修正
2. **テストカバレッジ向上**: 65% → 90%
3. **パフォーマンス最適化**: Core Web Vitals改善
4. **アクセシビリティ対応**: WCAG 2.1 AA準拠

### 中期的機能拡張（Q2 2025）
1. **多言語対応**: i18n実装、英語・中国語・韓国語対応
2. **高度な分析**: 機械学習による診断精度向上
3. **モバイルアプリ**: React Native実装
4. **API公開**: 外部システム連携用API

### 長期的ビジョン（Q3-Q4 2025）
1. **マルチテナント**: 企業向けSaaS化
2. **リアルタイム機能**: WebSocket活用
3. **AI強化**: カスタムモデル訓練
4. **エンタープライズ機能**: SSO、監査ログ、コンプライアンス

---

このアーキテクチャ文書は、COCOSiLシステムの技術的基盤と設計思想を包括的に説明します。モジュラー設計、プライバシーファースト原則、スケーラブルなアーキテクチャにより、継続的な成長と機能拡張を支援します。