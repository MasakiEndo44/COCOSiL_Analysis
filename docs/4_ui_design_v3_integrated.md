# COCOSiL 統合版 UI/UX 要件定義書

**バージョン**: v3.0 統合版  
**作成日**: 2025-11-05  
**対象**: V0（フロントエンド開発AI）への完全コンテキスト  
**技術スタック**: Next.js 14 + Tailwind CSS + shadcn/ui + Clerk

---

## 📋 ドキュメント概要

このドキュメントは、COCOSiL統合版のUI/UX実装に必要なすべての情報を含みます：
- **デザインシステム**：カラー、タイポグラフィ、スペーシング
- **コンポーネントライブラリ**：Button, Card, Input等の詳細仕様
- **画面設計**：ワイヤーフレーム + 実装詳細
- **実装ガイドライン**：Next.js 14 + Tailwind + shadcn/ui

**V0への指示**:
- このドキュメントの仕様に完全に従ってコンポーネントを生成すること
- カラートークン、タイポグラフィスケール、スペーシングを厳密に適用
- レスポンシブデザイン、アクセシビリティを必ず実装
- Server Component優先、Client Componentは最小限

---

## 1. デザインコンセプト

### 1.1 基本理念

**多面的な自己理解を促す診断体験**
- 複数の診断（算命学・MBTI・体癖論・Big5）を統合
- 科学的根拠と伝統的知見の融合
- 個人の成長と自己理解をサポート

**安心・やわらかさの表現**
- 親しみやすい色使いとトーン
- 圧迫感のないスペーシング
- 肯定的なフィードバックメッセージ

### 1.2 デザイン原則

**シンプルさと明瞭性**
- 1画面1メッセージの原則
- 視覚的階層の明確化
- 余白を活かしたレイアウト

**アクセシビリティ（必須）**
- WCAG 2.2 AA準拠
- コントラスト比 4.5:1以上
- キーボードナビゲーション対応
- **44px最小タップターゲットサイズ**

**レスポンシブデザイン（モバイルファースト）**
- ブレークポイント: sm(640px) / md(768px) / lg(1024px) / xl(1280px)
- フルードタイポグラフィ
- タッチ最適化（`touch-manipulation`）

---

## 2. カラーシステム

### 2.1 ブランドカラー（必須使用）

```css
/* プライマリー (Brand) */
--brand-500: 122 197 229;  /* #7AC5E5 */
--brand-700: 59 157 181;   /* #3B9DB5 (hover) */

/* Tailwind使用例 */
bg-brand-500 hover:bg-brand-700
text-brand-500
border-brand-500

/* アクセント (Accent) */
--accent-500: 192 98 245;  /* #C062F5 */
--accent-600: 168 77 216;  /* #A84DD8 (hover) */

/* 統一グラデーション（全ページ共通）*/
className="bg-gradient-to-br from-blue-50 to-purple-50"
```

**適用箇所**:
- CTAボタン: `bg-brand-500`
- リンク・強調: `text-brand-500`
- アクセント要素: `text-accent-500`
- 背景グラデーション: すべての認証・診断ページ

### 2.2 セマンティックカラー

```css
/* 基本色 */
--background: 255 255 255;      /* #FFFFFF */
--foreground: 16 24 40;         /* #101828 */
--muted: 249 250 251;           /* #F9FAFB */
--muted-foreground: 107 114 128; /* #6B7280 */

/* 状態色 */
--success: 22 163 74;           /* #16A34A 緑 */
--warning: 245 158 11;          /* #F59E0B オレンジ */
--destructive: 239 68 68;       /* #EF4444 赤 */

/* UI要素 */
--border: 229 231 235;          /* #E5E7EB */
--surface: 249 250 251;         /* #F9FAFB カード背景 */
--card: 255 255 255;            /* #FFFFFF カードコンテナ */
```

### 2.3 コントラスト比要件（WCAG AA）

- 通常テキスト: **4.5:1以上**
- 大サイズテキスト (18px+): **3:1以上**
- UIコンポーネント: **3:1以上**

**V0への指示**: すべてのテキストとUIで必ずコントラスト比を確認すること

---

## 3. タイポグラフィ

### 3.1 フォントファミリー

```css
font-family: 'Noto Sans JP', sans-serif;
weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
```

### 3.2 レスポンシブタイポグラフィスケール（必須）

**見出し**

```
H1 (ページタイトル):
  Mobile:  28px / line-height 36px / font-weight 600
  Desktop: 40px / line-height 48px / font-weight 600
  Tailwind: text-h1-mobile lg:text-h1-desktop font-semibold

H2 (セクション見出し):
  Mobile:  24px / line-height 32px / font-weight 600
  Desktop: 32px / line-height 40px / font-weight 600
  Tailwind: text-h2-mobile lg:text-h2-desktop font-semibold

H3 (サブセクション):
  Mobile:  20px / line-height 28px / font-weight 600
  Desktop: 24px / line-height 32px / font-weight 600
  Tailwind: text-h3-mobile lg:text-h3-desktop font-semibold

H4 (小見出し):
  Mobile:  18px / line-height 26px / font-weight 600
  Desktop: 20px / line-height 28px / font-weight 600
  Tailwind: text-h4-mobile lg:text-h4-desktop font-semibold
```

**本文**

```
Body Large (強調):
  Mobile:  16px / line-height 24px / font-weight 400
  Desktop: 18px / line-height 28px / font-weight 400
  Tailwind: text-body-lg-mobile lg:text-body-lg-desktop

Body (標準):
  Mobile:  14px / line-height 20px / font-weight 400
  Desktop: 16px / line-height 24px / font-weight 400
  Tailwind: text-body-mobile lg:text-body-desktop

Body Small (補足):
  Mobile:  12px / line-height 18px / font-weight 400
  Desktop: 14px / line-height 20px / font-weight 400
  Tailwind: text-body-sm-mobile lg:text-body-sm-desktop
```

**実装例**:
```tsx
<h1 className="text-h1-mobile lg:text-h1-desktop font-semibold text-foreground">
  診断を始める
</h1>

<p className="text-body-mobile lg:text-body-desktop text-muted-foreground">
  あなたの性格を多角的に分析します
</p>
```

### 3.3 tailwind.config.ts 設定（必須）

```typescript
theme: {
  extend: {
    fontSize: {
      'h1-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
      'h1-desktop': ['40px', { lineHeight: '48px', fontWeight: '600' }],
      'h2-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
      'h2-desktop': ['32px', { lineHeight: '40px', fontWeight: '600' }],
      'h3-mobile': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      'h3-desktop': ['24px', { lineHeight: '32px', fontWeight: '600' }],
      'h4-mobile': ['18px', { lineHeight: '26px', fontWeight: '600' }],
      'h4-desktop': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      'body-lg-mobile': ['16px', { lineHeight: '24px' }],
      'body-lg-desktop': ['18px', { lineHeight: '28px' }],
      'body-mobile': ['14px', { lineHeight: '20px' }],
      'body-desktop': ['16px', { lineHeight: '24px' }],
      'body-sm-mobile': ['12px', { lineHeight: '18px' }],
      'body-sm-desktop': ['14px', { lineHeight: '20px' }],
    },
  },
}
```

---

## 4. スペーシング（8pxグリッド）

### 4.1 基本スケール

```
基本単位: 8px
最小単位: 4px

Tailwind: 
1 = 4px    2 = 8px    3 = 12px   4 = 16px
5 = 20px   6 = 24px   8 = 32px   10 = 40px
12 = 48px  16 = 64px  20 = 80px  24 = 96px
```

### 4.2 コンポーネント内スペーシング

```
カード内部: p-6 (24px)
フォーム: space-y-4 (16px)
ボタン間: gap-4 (16px)
セクション間: space-y-12 md:space-y-16 (48px → 64px)
```

### 4.3 ページレイアウト

```
Page Padding:
  Mobile:  px-4 py-6  (横16px 縦24px)
  Desktop: px-6 py-12 (横24px 縦48px)

Container: max-w-7xl (1280px)
```

---

## 5. コンポーネント仕様（shadcn/ui準拠）

### 5.1 Button Component

**ファイル**: `components/ui/button.tsx`

**バリアント**:

```tsx
// Primary (CTA)
<Button variant="primary" size="lg">
  診断を始める
</Button>
// → bg-brand-500 hover:bg-brand-700 text-white

// Secondary (枠線)
<Button variant="secondary" size="md">
  キャンセル
</Button>
// → border border-border bg-surface hover:bg-background

// Tertiary (テキストボタン)
<Button variant="tertiary" size="sm">
  スキップ
</Button>
// → hover:bg-surface text-foreground

// Destructive (削除)
<Button variant="destructive">
  アカウント削除
</Button>
// → bg-destructive text-white hover:bg-red-600
```

**サイズ + タッチターゲット**:

```tsx
size="sm"  // h-10 px-3 min-h-[44px]  WCAG対応
size="md"  // h-11 px-4 min-h-[44px]  デフォルト
size="lg"  // h-12 px-8 min-h-[48px]  CTA用
```

**ローディング状態**:

```tsx
<Button isLoading={true}>
  送信中...
</Button>
// → スピナー表示 + disabled
```

### 5.2 Card Component

**構造**:

```tsx
<Card className="shadow-z1">
  <CardHeader>
    <CardTitle>診断結果</CardTitle>
    <CardDescription>あなたの性格タイプ</CardDescription>
  </CardHeader>
  <CardContent>
    {/* メインコンテンツ */}
  </CardContent>
  <CardFooter>
    <Button>詳細を見る</Button>
  </CardFooter>
</Card>
```

**スタイル**:

```
padding: p-6 (24px)
border-radius: rounded-card (8px)
shadow: shadow-z1 (軽い影)
background: bg-card (白)
```

### 5.3 Input Component

```tsx
<div className="space-y-2">
  <Label htmlFor="nickname">ニックネーム</Label>
  <Input 
    id="nickname"
    placeholder="山田太郎"
    className="min-h-[44px]"  // タッチターゲット
  />
  <p className="text-sm text-muted-foreground">
    公開されるニックネームです
  </p>
</div>
```

### 5.4 シャドウトークン

```typescript
boxShadow: {
  'z1': '0 1px 2px rgba(16, 24, 40, 0.10)',   // カード
  'z2': '0 6px 12px rgba(16, 24, 40, 0.12)',  // ホバー
  'z3': '0 12px 24px rgba(16, 24, 40, 0.16)', // モーダル
}
```

---

## 6. 画面設計（ワイヤーフレーム + 実装詳細）

### 6.1 ランディングページ（/）

**レイアウト**:

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
  <header className="py-4 px-6">
    <Logo />
    <Button variant="tertiary">ログイン</Button>
  </header>
  
  <main className="px-4 py-12 max-w-7xl mx-auto">
    {/* ヒーローセクション */}
    <section className="text-center space-y-6">
      <h1 className="text-h1-mobile lg:text-h1-desktop font-semibold">
        あなたの本質を、AIと共に見つける
      </h1>
      <p className="text-body-lg-mobile lg:text-body-lg-desktop text-muted-foreground">
        生年月日を入力するだけで、複数の診断があなたの性格を分析
      </p>
      <Button variant="primary" size="lg">
        今すぐ無料で始める
      </Button>
    </section>
    
    {/* 特徴セクション */}
    <section className="mt-16 grid md:grid-cols-3 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>複数の診断を統合</CardTitle>
        </CardHeader>
        <CardContent>
          動物占い・星座占い・六星占術・MBTI・体癖論・Big5
        </CardContent>
      </Card>
      {/* 他の特徴カード */}
    </section>
  </main>
</div>
```

### 6.2 新規登録（/sign-up）

**Clerk + カスタムフォーム**:

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-h2-mobile lg:text-h2-desktop">
        新規登録
      </CardTitle>
      <CardDescription>
        診断を始めるにはアカウント作成が必要です
      </CardDescription>
    </CardHeader>
    
    <CardContent className="space-y-6">
      {/* Googleログインボタン */}
      <Button variant="secondary" size="lg" className="w-full">
        <GoogleIcon /> Googleで登録
      </Button>
      
      <Separator>または</Separator>
      
      {/* メール登録フォーム */}
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">ニックネーム *</Label>
          <Input 
            id="nickname"
            placeholder="山田太郎"
            className="min-h-[44px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス *</Label>
          <Input 
            id="email"
            type="email"
            placeholder="example@mail.com"
            className="min-h-[44px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">パスワード *</Label>
          <Input 
            id="password"
            type="password"
            placeholder="••••••••"
            className="min-h-[44px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label>生年月日 *</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="年" className="min-h-[44px]" />
            <Input placeholder="月" className="min-h-[44px]" />
            <Input placeholder="日" className="min-h-[44px]" />
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms" className="text-sm">
            利用規約とプライバシーポリシーに同意します
          </Label>
        </div>
        
        <Button variant="primary" size="lg" className="w-full">
          登録して診断を開始
        </Button>
      </form>
      
      <p className="text-sm text-center text-muted-foreground">
        すでにアカウントをお持ちですか？ 
        <Link href="/sign-in" className="text-brand-500 hover:underline">
          ログイン
        </Link>
      </p>
    </CardContent>
  </Card>
</div>
```

### 6.3 初期設定（/onboarding）

**診断実行中**:

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
  <Card className="w-full max-w-md text-center">
    <CardContent className="py-12 space-y-6">
      <Spinner className="mx-auto w-12 h-12 text-brand-500" />
      <h2 className="text-h2-mobile lg:text-h2-desktop font-semibold">
        診断中...
      </h2>
      <p className="text-body-mobile lg:text-body-desktop text-muted-foreground">
        生年月日から診断を実行しています
      </p>
    </CardContent>
  </Card>
</div>
```

**診断完了**:

```tsx
<Card className="w-full max-w-2xl">
  <CardHeader className="text-center">
    <div className="text-4xl mb-4">🎉</div>
    <CardTitle className="text-h1-mobile lg:text-h1-desktop">
      診断が完了しました！
    </CardTitle>
  </CardHeader>
  
  <CardContent className="space-y-6">
    <div className="bg-surface p-6 rounded-card space-y-4">
      <h3 className="text-h3-mobile lg:text-h3-desktop font-semibold">
        あなたは...
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦄</span>
          <div>
            <p className="font-medium">落ち着きのあるペガサス</p>
            <p className="text-sm text-muted-foreground">
              基本動物: ペガサス / カラー: イエロー
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-2xl">♋</span>
          <p className="font-medium">蟹座</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <p className="font-medium">金星人+</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎂</span>
          <p className="font-medium">年齢: 39歳</p>
        </div>
      </div>
    </div>
    
    <p className="text-sm text-center text-muted-foreground">
      診断精度を高めるために、MBTI・体癖論・Big5も追加できます（任意）
    </p>
  </CardContent>
  
  <CardFooter className="flex flex-col gap-3">
    <Button variant="primary" size="lg" className="w-full">
      AIチャットを始める
    </Button>
    <Button variant="tertiary" size="md" className="w-full">
      後で
    </Button>
  </CardFooter>
</Card>
```

### 6.4 ダッシュボード（/home）

**デスクトップレイアウト**:

```tsx
<div className="flex min-h-screen">
  {/* サイドバー */}
  <aside className="w-64 border-r border-border bg-surface p-6">
    <Logo />
    <nav className="mt-8 space-y-2">
      <NavItem icon={Home} href="/home" active>
        ダッシュボード
      </NavItem>
      <NavItem icon={BarChart} href="/home/diagnosis">
        診断管理
      </NavItem>
      <NavItem icon={MessageSquare} href="/home/chat">
        AIチャット
      </NavItem>
      <NavItem icon={User} href="/home/profile">
        プロファイル
      </NavItem>
      <NavItem icon={Settings} href="/home/settings">
        設定
      </NavItem>
    </nav>
  </aside>
  
  {/* メインコンテンツ */}
  <main className="flex-1 px-6 py-12">
    <h1 className="text-h1-mobile lg:text-h1-desktop font-semibold mb-8">
      こんにちは、山田太郎さん 👋
    </h1>
    
    {/* 診断サマリー */}
    <Card className="shadow-z1">
      <CardHeader>
        <CardTitle>あなたの診断サマリー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DiagnosisItem icon="🦄" label="動物占い" value="落ち着きのあるペガサス" />
        <DiagnosisItem icon="♋" label="星座占い" value="蟹座" />
        <DiagnosisItem icon="⭐" label="六星占術" value="金星人+" />
        <DiagnosisItem icon="📝" label="MBTI" value="INFP" />
      </CardContent>
    </Card>
    
    {/* AIチャット */}
    <Card className="shadow-z1 mt-6">
      <CardHeader>
        <CardTitle>💬 AIチャット</CardTitle>
        <CardDescription>今月の利用: 3/10回</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="primary" className="w-full">
          チャットを開始
        </Button>
      </CardContent>
    </Card>
    
    {/* クイックアクション */}
    <div className="mt-6 grid md:grid-cols-2 gap-4">
      <Button variant="secondary">診断を追加</Button>
      <Button variant="secondary">プロファイル表示</Button>
    </div>
  </main>
</div>
```

**モバイルレイアウト**:

```tsx
<div className="min-h-screen">
  {/* ヘッダー */}
  <header className="sticky top-0 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
    <Button variant="tertiary" size="sm">
      <Menu className="w-5 h-5" />
    </Button>
    <Logo />
    <Button variant="tertiary" size="sm">
      <Bell className="w-5 h-5" />
    </Button>
  </header>
  
  {/* メインコンテンツ（スクロール）*/}
  <main className="px-4 py-6 space-y-6">
    {/* 同様のカード配置、縦並び */}
  </main>
  
  {/* ボトムナビゲーション（5アイテム） */}
  <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-2 flex justify-around">
    <NavButton icon={BarChart} label="診断管理" href="/home/diagnosis" />
    <NavButton icon={MessageSquare} label="チャット" href="/home/chat" />
    <NavButton icon={Home} label="ホーム" href="/home" active isFab />
    <NavButton icon={FileText} label="結果" href="/home/results" />
    <NavButton icon={User} label="設定" href="/home/settings" />
  </nav>
</div>
```

### 6.5 AIチャット（/home/chat）

```tsx
<div className="flex flex-col h-screen">
  {/* ヘッダー */}
  <header className="border-b border-border px-6 py-4">
    <div className="flex items-center justify-between">
      <h1 className="text-h2-mobile lg:text-h2-desktop font-semibold">
        AIチャット
      </h1>
      <Badge variant="secondary">
        今月の利用: 3/10回
      </Badge>
    </div>
  </header>
  
  {/* チャット履歴 */}
  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
    <ChatMessage 
      role="assistant"
      content="こんにちは！診断結果を基に、あなたの性格について話しましょう。"
      timestamp="2025-11-05 14:30"
    />
    
    <ChatMessage 
      role="user"
      content="こんにちは、よろしくお願いします"
      timestamp="2025-11-05 14:31"
    />
    
    <ChatMessage 
      role="assistant"
      content="よろしくお願いします！INFPタイプのあなたは..."
      timestamp="2025-11-05 14:31"
    />
  </div>
  
  {/* 入力欄 */}
  <div className="border-t border-border px-6 py-4">
    <div className="flex gap-2">
      <Input 
        placeholder="メッセージを入力..."
        className="flex-1 min-h-[44px]"
      />
      <Button variant="primary" size="lg">
        送信
      </Button>
    </div>
  </div>
</div>
```

**ChatMessageコンポーネント**:

```tsx
function ChatMessage({ role, content, timestamp }) {
  const isAssistant = role === 'assistant';
  
  return (
    <div className={cn(
      "flex gap-3",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      {isAssistant && (
        <Avatar className="w-10 h-10">
          <AvatarImage src="/ai-avatar.png" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[70%] rounded-lg p-3",
        isAssistant 
          ? "bg-surface border border-border" 
          : "bg-brand-500 text-white"
      )}>
        <p className="text-body-mobile lg:text-body-desktop">
          {content}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {timestamp}
        </p>
      </div>
      
      {!isAssistant && (
        <Avatar className="w-10 h-10">
          <AvatarFallback>山</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
```

---

## 7. Clerk認証統合（実装詳細）

### 7.1 環境変数

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# リダイレクトURL
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/
```

### 7.2 ミドルウェア設定

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up', '/learn/*'],
  ignoredRoutes: ['/api/webhooks/clerk'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 7.3 認証状態の取得

```tsx
// Server Component
import { auth } from '@clerk/nextjs';

export default async function Dashboard() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // ユーザー情報取得
  return <div>Dashboard</div>;
}

// Client Component
'use client';
import { useUser } from '@clerk/nextjs';

export function UserProfile() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <Spinner />;
  
  return <div>{user.firstName}</div>;
}
```

---

## 8. Zustand状態管理

### 8.1 診断ストア

```typescript
// lib/zustand/diagnosis-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DiagnosisStore {
  // 基本情報
  basicInfo: { nickname: string; birthDate: string } | null;
  
  // 診断結果
  fortune: FortuneResult | null;
  mbti: MBTIResult | null;
  taiheki: TaihekiResult | null;
  big5: Big5Result | null;
  
  // アクション
  setBasicInfo: (info: BasicInfo) => void;
  setFortune: (result: FortuneResult) => void;
  // ...
}

export const useDiagnosisStore = create<DiagnosisStore>()(
  persist(
    (set) => ({
      basicInfo: null,
      fortune: null,
      mbti: null,
      taiheki: null,
      big5: null,
      
      setBasicInfo: (info) => set({ basicInfo: info }),
      setFortune: (result) => set({ fortune: result }),
      // ...
    }),
    {
      name: 'cocosil-diagnosis-store',
    }
  )
);
```

### 8.2 使用例

```tsx
'use client';

import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';

export function DiagnosisProgress() {
  const { fortune, mbti, taiheki } = useDiagnosisStore();
  
  const completed = [fortune, mbti, taiheki].filter(Boolean).length;
  const total = 3;
  const percentage = (completed / total) * 100;
  
  return (
    <div>
      <div className="h-2 bg-muted rounded-full">
        <div 
          className="h-2 bg-brand-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {completed} / {total} 完了
      </p>
    </div>
  );
}
```

---

## 9. アクセシビリティ要件（必須）

### 9.1 WCAG 2.2 AA チェックリスト

**視覚的アクセシビリティ**:
- [ ] コントラスト比 4.5:1以上（通常テキスト）
- [ ] コントラスト比 3:1以上（大テキスト・UI）
- [ ] 44px最小タップターゲット
- [ ] フォーカス表示の明確化

**キーボードナビゲーション**:
- [ ] すべてのインタラクティブ要素にTabでアクセス可能
- [ ] Enter/Spaceでボタン・リンク操作
- [ ] Escapeでモーダル・ドロップダウンクローズ

**スクリーンリーダー対応**:
- [ ] すべての画像に`alt`属性
- [ ] フォームラベルの正しい関連付け
- [ ] ARIA属性の適切な使用
- [ ] ランドマーク（`<nav>`, `<main>`, `<aside>`）の使用

### 9.2 実装例

```tsx
// フォーム
<Label htmlFor="nickname">ニックネーム *</Label>
<Input 
  id="nickname"
  aria-describedby="nickname-help"
  aria-required="true"
/>
<p id="nickname-help" className="text-sm text-muted-foreground">
  公開されるニックネームです
</p>

// ボタン（アイコンのみ）
<Button aria-label="メニューを開く">
  <Menu className="w-5 h-5" />
</Button>

// ローディング状態
<Button aria-busy="true" disabled>
  送信中...
</Button>
```

---

## 10. レスポンシブデザイン実装

### 10.1 ブレークポイント戦略

```typescript
// tailwind.config.ts
screens: {
  'sm': '640px',   // スマートフォン（横向き）
  'md': '768px',   // タブレット
  'lg': '1024px',  // デスクトップ
  'xl': '1280px',  // ワイドデスクトップ
}
```

### 10.2 モバイルファースト実装例

```tsx
<div className="
  px-4 py-6           /* モバイル: 小さめ余白 */
  md:px-6 md:py-8     /* タブレット: 中程度 */
  lg:px-12 lg:py-12   /* デスクトップ: 広めに */
">
  <h1 className="
    text-h1-mobile           /* モバイル: 28px */
    lg:text-h1-desktop       /* デスクトップ: 40px */
    font-semibold
  ">
    タイトル
  </h1>
  
  <div className="
    grid grid-cols-1         /* モバイル: 1カラム */
    md:grid-cols-2           /* タブレット: 2カラム */
    lg:grid-cols-3           /* デスクトップ: 3カラム */
    gap-4 md:gap-6 lg:gap-8  /* ギャップも段階的に */
  ">
    <Card />
    <Card />
    <Card />
  </div>
</div>
```

---

## 11. パフォーマンス要件

### 11.1 Core Web Vitals目標

```
LCP (Largest Contentful Paint): < 2.5秒
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
```

### 11.2 Next.js最適化

```tsx
// 画像最適化
import Image from 'next/image';

<Image 
  src="/diagnosis-hero.png"
  alt="診断のイメージ"
  width={600}
  height={400}
  priority  // LCP対象
/>

// 動的インポート
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});

// Server Component優先
// 'use client'は本当に必要な場合のみ
```

---

## 12. 実装チェックリスト（V0向け）

### 12.1 コンポーネント生成時

- [ ] **カラートークン使用**：`bg-brand-500`, `text-foreground`等
- [ ] **レスポンシブタイポグラフィ**：`text-h1-mobile lg:text-h1-desktop`
- [ ] **8pxグリッド準拠**：`p-6`, `space-y-4`等
- [ ] **44px最小タップターゲット**：`min-h-[44px]`
- [ ] **アクセシビリティ**：ARIA属性、キーボード対応
- [ ] **ローディング状態**：スピナー、スケルトン
- [ ] **エラー状態**：バリデーション、エラーメッセージ
- [ ] **空状態**：データなし時の表示

### 12.2 ページ作成時

- [ ] **Server Component優先**
- [ ] **メタデータ設定**（SEO）
- [ ] **レイアウト構造**：header, main, footer
- [ ] **グラデーション背景**：`bg-gradient-to-br from-blue-50 to-purple-50`
- [ ] **最大幅制限**：`max-w-7xl`
- [ ] **レスポンシブパディング**：`px-4 py-6 md:px-6 md:py-12`

### 12.3 デプロイ前

- [ ] **`npm run build`成功**
- [ ] **`npm run lint`クリーン**
- [ ] **Lighthouse スコア**：Performance 80+, Accessibility 95+
- [ ] **各ブラウザ確認**：Chrome, Safari, Firefox
- [ ] **モバイル実機確認**

---

## 13. V0への最終指示

### コード生成時の必須事項

1. **このドキュメントの仕様に完全準拠する**
2. **shadcn/uiコンポーネントを活用する**
3. **Tailwind CSSクラスのみを使用（インラインCSSは不可）**
4. **Server Componentをデフォルトとし、'use client'は最小限**
5. **TypeScriptの型を厳密に定義**
6. **コメントは日本語で記述**

### スタイリングの原則

- カラー：CSS変数経由のTailwindクラス（`bg-brand-500`）
- タイポグラフィ：レスポンシブスケール必須（`text-h1-mobile lg:text-h1-desktop`）
- スペーシング：8pxグリッド（`p-6`, `gap-4`）
- レスポンシブ：モバイルファースト（`md:`, `lg:`）

### 生成してはいけないコード

- ❌ インラインスタイル（`style={{...}}`）
- ❌ 固定ピクセル値（Tailwindクラスを使用）
- ❌ アクセシビリティ属性の欠如
- ❌ 44px未満のタップターゲット

---

**ドキュメントバージョン**: v3.0 統合版  
**最終更新**: 2025-11-05  
**対象フレームワーク**: Next.js 14 + Tailwind CSS + shadcn/ui + Clerk  
**V0対応**: 完全

このドキュメントは、V0（フロントエンド開発AI）が正確にCOCOSiLのUI/UXを実装するための完全な仕様書です。
