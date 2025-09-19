# ココシル 技術仕様書・実装ガイド

## 📋 MVP実装範囲

### ✅ 含まれる機能
- ユーザー基本情報入力（名前、生年月日、MBTI、体癖）
- 算命学・動物占い自動算出（Python + CSV）
- 簡易MBTIチェック（不明な場合）
- 進捗管理・状態保存（Zustand）
- フォームバリデーション（React Hook Form + Zod）
- OpenAI APIチャット（ストリーミング対応）
- .mdファイル生成・ダウンロード
- データベース送信（API実装）

### ❌ 将来実装予定
- ユーザー認証・アカウント管理
- 詳細な体癖診断システム
- 結果の永続化・履歴管理
- 管理者ダッシュボード
- 高度な分析機能

---

## 🔄 管理者ワークフロー

### データ確認・ダウンロード手順

1. **通知受信**: ユーザーがデータ送信完了
2. **管理者サイトアクセス**: `admin.cocoseal.com/download/{downloadId}`
3. **データ確認**: プレビュー表示で内容確認
4. **ダウンロード**: .mdファイルをローカル保存
5. **Claude活用**: ダウンロードしたファイルをClaude チャットに貼り付け
6. **本格分析**: 添付の占い師プロンプトで詳細分析実行

### 管理者向け機能要件

```typescript
// 管理者ダッシュボード表示データ
interface AdminDashboard {
  recentSubmissions: {
    downloadId: string;
    userName: string;
    submittedAt: string;
    categories: string[];
    status: 'new' | 'downloaded' | 'processed';
  }[];
  statistics: {
    totalSubmissions: number;
    todaySubmissions: number;
    popularCategories: string[];
  };
}
```

### Claude連携フロー

1. **管理者**: .mdファイルをダウンロード
2. **管理者**: Claudeの新しいチャットを開始
3. **管理者**: 占い師プロンプト（究極の多角的性格プロファイリング占い師）をコピペ
4. **管理者**: ダウンロードした.mdファイルを添付
5. **Claude**: 添付ファイルを解析し、本格的な性格分析レポートを生成
6. **管理者**: 必要に応じてユーザーにフィードバック

---

## 🏗️ プロジェクト構造

```
cocoseal-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # ランディングページ
│   │   ├── input/             # 基本情報入力フロー
│   │   │   ├── name/page.tsx
│   │   │   ├── birthdate/page.tsx
│   │   │   ├── mbti/page.tsx
│   │   │   └── taiheki/page.tsx
│   │   ├── chat/page.tsx      # AIチャット画面
│   │   ├── result/page.tsx    # 完了画面
│   │   └── api/               # API Routes
│   │       ├── fortune-calc/route.ts
│   │       └── submit-data/route.ts
│   ├── components/            # Reactコンポーネント
│   │   ├── forms/            # フォーム関連
│   │   ├── ui/               # 共通UIコンポーネント
│   │   ├── chat/             # チャット関連
│   │   └── progress/         # 進捗管理
│   ├── stores/               # Zustand状態管理
│   │   └── userDataStore.ts
│   ├── lib/                  # ユーティリティ
│   │   ├── validations.ts    # Zodスキーマ
│   │   ├── openai.ts         # OpenAI API設定
│   │   └── fortune-calc/     # 占い計算ロジック
│   ├── types/                # TypeScript型定義
│   └── styles/               # Tailwind CSS
├── public/
│   ├── data/
│   │   └── doubutsu_uranai_essence_lookup_1960_2025.csv
│   └── scripts/
│       └── fortune_calculator_fixed.py
├── docs/                     # ドキュメント
└── package.json
```

---

## 🔧 技術スタック詳細

### Frontend Core
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0"
}
```

### 状態管理・フォーム
```json
{
  "zustand": "^4.4.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

### API・ストリーミング
```json
{
  "openai": "^4.24.0",
  "@ai-sdk/openai": "^0.0.0",
  "ai": "^3.0.0"
}
```

---

## 🎨 Zustand Store設計

### userDataStore.ts
```typescript
interface UserDataState {
  // 基本情報
  name: string;
  birthDate: {
    year: number;
    month: number;
    day: number;
  };
  
  // 占い結果
  fortuneData: {
    age: number;
    zodiac: string;
    animal: string;
    animalDetail: AnimalDetail;
    sixStar: string;
  };
  
  // 性格診断
  mbti: string;
  taiheki: number | null;
  
  // チャット履歴
  chatHistory: ChatMessage[];
  
  // UI状態
  progress: number;
  currentStep: string;
  isLoading: boolean;
  
  // アクション
  updateName: (name: string) => void;
  updateBirthDate: (date: BirthDate) => void;
  setFortuneData: (data: FortuneData) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateProgress: (progress: number) => void;
  reset: () => void;
}
```

---

## 📝 フォームバリデーション（Zod）

### validations.ts
```typescript
import { z } from 'zod';

export const nameSchema = z.object({
  name: z.string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください')
    .regex(/^[ぁ-んァ-ヶ一-龠a-zA-Z\s]+$/, '名前は日本語またはアルファベットで入力してください')
});

export const birthDateSchema = z.object({
  year: z.number()
    .min(1900, '1900年以降を入力してください')
    .max(new Date().getFullYear(), '未来の日付は入力できません'),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31)
}).refine((date) => {
  const { year, month, day } = date;
  const inputDate = new Date(year, month - 1, day);
  return inputDate.getFullYear() === year &&
         inputDate.getMonth() === month - 1 &&
         inputDate.getDate() === day;
}, {
  message: '正しい日付を入力してください'
});

export const mbtiSchema = z.object({
  mbti: z.string()
    .length(4, 'MBTIは4文字で入力してください')
    .regex(/^[EIJFNPST]{4}$/, '正しいMBTI形式で入力してください')
});
```

---

## 🚀 API Routes実装

### /api/admin-submit/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mdContent, metadata, userInfo, chatHistory } = body;
    
    // ダウンロードID生成
    const downloadId = nanoid(12);
    const timestamp = new Date().toISOString();
    
    // 管理者用データ構造
    const adminData = {
      downloadId,
      timestamp,
      userInfo: {
        name: userInfo.name,
        birthDate: userInfo.birthDate,
        fortuneData: userInfo.fortuneData,
        mbti: userInfo.mbti,
        taiheki: userInfo.taiheki
      },
      mdContent,
      chatHistory,
      metadata: {
        sessionId: metadata.sessionId,
        completionTime: timestamp,
        totalMessages: chatHistory.length,
        categories: metadata.categories || []
      }
    };
    
    // データベース専用サイトに送信
    // TODO: 実際のデータベース保存処理
    // await saveToAdminDatabase(adminData);
    
    // 管理者用URL生成
    const adminUrl = `${process.env.ADMIN_SITE_URL}/download/${downloadId}`;
    
    return NextResponse.json({
      success: true,
      downloadId,
      adminUrl,
      message: 'データが正常に送信されました'
    });
    
  } catch (error) {
    console.error('Admin submission error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'データ送信中にエラーが発生しました'
    }, { status: 500 });
  }
}
```

---

## 📄 .mdファイル生成・プレビュー機能

### mdFileGenerator.ts
```typescript
import { UserDataState } from '@/stores/userDataStore';
import { ChatMessage } from '@/types';

export interface GeneratedMdData {
  content: string;
  metadata: {
    sessionId: string;
    generatedAt: string;
    totalMessages: number;
    categories: string[];
  };
}

export const generateMdFile = (
  userData: UserDataState, 
  chatHistory: ChatMessage[]
): GeneratedMdData => {
  const timestamp = new Date().toISOString();
  const sessionId = `session_${Date.now()}`;
  
  const content = `# ココシル 性格分析レポート

## 📊 基本情報
- **お名前**: ${userData.name}
- **生年月日**: ${userData.birthDate.year}年${userData.birthDate.month}月${userData.birthDate.day}日
- **年齢**: ${userData.fortuneData.age}歳
- **星座**: ${userData.fortuneData.zodiac}
- **動物占い**: ${userData.fortuneData.animal}
- **算命学**: ${userData.fortuneData.sixStar}
- **MBTI**: ${userData.mbti}
- **体癖**: ${userData.taiheki || '未回答'}

## 🎯 相談内容・対話履歴

${chatHistory.map((message, index) => {
  const role = message.role === 'user' ? '👤 ユーザー' : '🤖 AI占い師';
  return `### ${role} (${index + 1})
${message.content}
`;
}).join('\n')}

## 📋 セッション情報
- **セッションID**: ${sessionId}
- **生成日時**: ${timestamp}
- **総メッセージ数**: ${chatHistory.length}
- **完了ステータス**: 完了

---
*本レポートは「ココシル」にて生成されました*
`;

  return {
    content,
    metadata: {
      sessionId,
      generatedAt: timestamp,
      totalMessages: chatHistory.length,
      categories: extractCategories(chatHistory)
    }
  };
};

const extractCategories = (chatHistory: ChatMessage[]): string[] => {
  const categories = new Set<string>();
  
  chatHistory.forEach(message => {
    if (message.content.includes('悩み')) categories.add('悩み相談');
    if (message.content.includes('性格')) categories.add('性格分析');
    if (message.content.includes('恋愛')) categories.add('恋愛');
    if (message.content.includes('仕事')) categories.add('仕事');
    if (message.content.includes('人間関係')) categories.add('人間関係');
  });
  
  return Array.from(categories);
};
```

---

## 🔍 プレビュー画面コンポーネント

### PreviewModal.tsx
```typescript
'use client';

import { useState } from 'react';
import { useUserDataStore } from '@/stores/userDataStore';
import { generateMdFile } from '@/lib/mdFileGenerator';
import ReactMarkdown from 'react-markdown';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mdData: GeneratedMdData) => void;
}

export const PreviewModal = ({ isOpen, onClose, onSubmit }: PreviewModalProps) => {
  const userData = useUserDataStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const mdData = generateMdFile(userData, userData.chatHistory);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(mdData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDownload = () => {
    const blob = new Blob([mdData.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cocoseal_report_${userData.name}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📄 生成されたレポートのプレビュー
          </h2>
          <p className="text-gray-600">
            内容をご確認ください。問題なければ送信ボタンを押してください。
          </p>
        </div>
        
        {/* プレビューコンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{mdData.content}</ReactMarkdown>
          </div>
        </div>
        
        {/* フッター */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              📥 ダウンロード
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ✏️ 修正する
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '送信中...' : '✅ 送信する'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 管理者向けダウンロードシステム

### 管理者専用サイト構成案
```
admin.cocoseal.com/
├── /download/{downloadId}     # ダウンロードページ
├── /list                      # データ一覧
└── /analytics                 # 統計情報
```

### 管理者用API設計
```typescript
// GET /admin/download/{downloadId}
export async function GET(
  request: NextRequest,
  { params }: { params: { downloadId: string } }
) {
  try {
    const { downloadId } = params;
    
    // 認証チェック（簡易版）
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // データ取得
    const data = await getAdminData(downloadId);
    
    if (!data) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }
    
    // .mdファイルとしてダウンロード
    return new NextResponse(data.mdContent, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="cocoseal_${downloadId}.md"`
      }
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## 💬 OpenAI APIストリーミング実装

### /api/chat/route.ts
```typescript
import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, userData } = await req.json();
  
  const systemPrompt = `あなたは究極の多角的性格プロファイリング占い師です。
以下のユーザー情報を基に分析してください：
- 名前: ${userData.name}
- 生年月日: ${userData.birthDate}
- 動物占い: ${userData.fortuneData.animal}
- MBTI: ${userData.mbti}
- 体癖: ${userData.taiheki}

温かく親しみやすい口調で、具体的な行動パターンを提示してください。`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

---

## 📱 レスポンシブUI実装例

### Progress Component
```typescript
'use client';

import { useUserDataStore } from '@/stores/userDataStore';

export const ProgressBar = () => {
  const progress = useUserDataStore((state) => state.progress);
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
      <p className="text-sm text-center mt-2 text-gray-600">
        {progress}% 完了
      </p>
    </div>
  );
};
```

### Chat Streaming Component
```typescript
'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { useUserDataStore } from '@/stores/userDataStore';

export const StreamingChat = () => {
  const userData = useUserDataStore();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { userData },
    onFinish: (message) => {
      userData.addChatMessage({
        role: 'assistant',
        content: message.content
      });
    }
  });
  
  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="animate-pulse">入力中...</div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
};
```

---

## 🔒 環境変数設定

### .env.local (開発環境)
```bash
OPENAI_API_KEY=sk-xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SITE_URL=http://localhost:3001
ADMIN_SECRET_KEY=admin_secret_key_dev
DATABASE_URL=postgresql://localhost:5432/cocoseal_dev
```

### Vercelデプロイ時環境変数
- `OPENAI_API_KEY`: OpenAI APIキー
- `ADMIN_SITE_URL`: 管理者専用サイトURL (https://admin.cocoseal.com)
- `ADMIN_SECRET_KEY`: 管理者認証用シークレットキー
- `DATABASE_URL`: データベース接続URL（将来）
- `NEXT_PUBLIC_APP_URL`: 本番URL

---

## 🚀 デプロイ手順

### 1. Vercelプロジェクト作成
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. 環境変数設定
Vercelダッシュボード → Settings → Environment Variables

### 3. 自動デプロイ設定
- GitHub連携
- mainブランチプッシュで自動デプロイ
- Preview環境は全ブランチ

---

## 📊 エラーハンドリング戦略

### フロントエンド
- React Error Boundary
- API エラーのToast表示
- ネットワークエラーのリトライ機能
- フォームバリデーションエラーのリアルタイム表示

### バックエンド
- try-catch による例外処理
- 適切なHTTPステータスコード
- エラーログの出力
- レスポンス型の統一

---

## 🎯 パフォーマンス最適化

### コード分割
```typescript
// 動的インポートによる遅延ロード
const ChatComponent = lazy(() => import('@/components/chat/StreamingChat'));
```

### 画像最適化
```typescript
import Image from 'next/image';

// Next.js Image コンポーネント使用
<Image 
  src="/images/logo.png" 
  alt="ココシル" 
  width={200} 
  height={100}
  priority
/>
```

---

## 📈 実装順序（推奨）

### Phase 1: 基本フロー (1-2週間)
1. プロジェクトセットアップ
2. Zustand Store実装
3. 基本情報入力フォーム
4. 算命学計算API
5. 進捗管理

### Phase 2: チャット機能 (1-2週間)
1. OpenAI API連携
2. ストリーミングチャット
3. 対話フロー実装
4. エラーハンドリング

### Phase 3: データ管理・プレビュー機能 (1-2週間)
1. .mdファイル生成ロジック
2. プレビューモーダル実装
3. ReactMarkdown統合
4. 管理者向け送信API (/api/admin-submit)
5. ダウンロードID生成・管理
6. 完了画面

### Phase 4: 管理者システム (1週間)
1. 管理者専用サイト設計
2. 認証機能（簡易版）
3. ダウンロードAPI実装
4. データ一覧・統計機能
5. エラーハンドリング

### Phase 5: 最適化・テスト (1週間)
1. レスポンシブ対応
2. パフォーマンス最適化
3. テスト実装
4. デプロイ・運用設定

---

## 🧪 テスト戦略

### 単体テスト
- Zustand Store
- フォームバリデーション
- ユーティリティ関数

### 統合テスト
- API Routes
- フォーム送信フロー
- OpenAI API連携

### E2Eテスト
- ユーザージャーニー全体
- 主要フロー動作確認