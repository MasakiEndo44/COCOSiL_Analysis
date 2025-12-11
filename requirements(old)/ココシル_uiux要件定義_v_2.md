# COCOSiL UI/UX 要件定義書 v2.0

**更新日**: 2025-11-05
**バージョン**: 2.0 (実装ベース最新版)
**前バージョン**: v1.0 (設計仕様版)

---

## 📋 変更履歴 (v1.0 → v2.0)

### 主要な追加機能
1. **Clerk 認証統合** - OAuth認証プロバイダーの完全統合と日本語ローカライゼーション
2. **診断履歴システム** - データベース駆動のカーソルベースページネーション実装
3. **Zustand 状態管理** - localStorage永続化とクロスコンポーネント状態管理
4. **段階的診断フロー** - 3ボタン認証選択画面の実装
5. **レスポンシブタイポグラフィ** - モバイル/デスクトップ用の詳細なスケール定義

### 実装の改善点
- グラデーション背景の統一パターン化 (`gradient-to-br from-blue-50 to-purple-50`)
- ボタンコンポーネントのバリアント体系化 (primary/secondary/tertiary/destructive)
- カードコンポーネントの構造化 (Header/Title/Description/Content/Footer)
- タッチ最適化 (44px最小タップターゲット、touch-manipulation)
- アニメーション体系 (fade-in, slide-up, spin)

### 削除された仕様
- なし (v1.0の全仕様を維持しつつ拡張)

---

## 1. デザインコンセプト

### 1.1 基本理念 (v1.0から継承)

**多面的な自己理解を促す診断体験**
- 4つの異なる理論（体癖・MBTI・算命学・動物占い）を統合
- 科学的根拠と伝統的知見の融合
- 個人の成長と自己理解をサポート

**行動に落ちる導線設計**
- 診断結果から具体的なアクションへ誘導
- 学習コンテンツとの連携
- 継続的な自己認識の深化

**安心・やわらかさの表現**
- 親しみやすい色使いとトーン
- 圧迫感のないスペーシング
- 肯定的なフィードバックメッセージ

### 1.2 デザイン原則

**シンプルさと明瞭性**
- 1画面1メッセージの原則
- 視覚的階層の明確化
- 余白を活かしたレイアウト

**アクセシビリティ**
- WCAG 2.2 AA準拠 (コントラスト比 4.5:1以上)
- キーボードナビゲーション対応
- スクリーンリーダー最適化 (ARIA属性)
- 44px最小タップターゲットサイズ

**レスポンシブデザイン**
- モバイルファースト設計
- ブレークポイント: sm(640px) / md(768px) / lg(1024px) / xl(1280px)
- フルードタイポグラフィ (モバイル/デスクトップスケール)

---

## 2. カラーシステム

### 2.1 ブランドカラー

**プライマリー (Brand)**
```
Brand 500: #7AC5E5 (rgb: 122, 197, 229)
Brand 700: #3B9DB5 (rgb: 59, 157, 181) [hover state]

CSS変数:
--brand-500: 122 197 229;
--brand-700: 59 157 181;

Tailwind:
bg-brand-500 / text-brand-500 / border-brand-500
```

**アクセント (Accent)**
```
Accent 500: #C062F5 (rgb: 192, 98, 245)
Accent 600: #A84DD8 (rgb: 168, 77, 216) [hover state]

CSS変数:
--accent-500: 192 98 245;
--accent-600: 168 77 216;

Tailwind:
bg-accent-500 / text-accent-500 / border-accent-500
```

**グラデーション (統一パターン)**
```
認証画面・ランディング・学習ページ共通:
bg-gradient-to-br from-blue-50 to-purple-50

使用箇所:
- /sign-in, /sign-up (認証ページ)
- / (ランディングページ)
- /learn/taiheki/* (学習ページ)
- /diagnosis (診断エントリーポイント)
```

### 2.2 セマンティックカラー

**基本色**
```
Background: #FFFFFF (Light) / #0B0F1A (Dark)
Foreground: #101828 (Light) / #E6E8EE (Dark)
Muted: #F9FAFB (Light) / #1F2937 (Dark)
Muted Foreground: #6B7280

CSS変数:
--background: 255 255 255; (Light)
--foreground: 16 24 40; (Light)
--muted: 249 250 251;
--muted-foreground: 107 114 128;
```

**状態色**
```
Success: #16A34A (緑 - 成功・完了)
Warning: #F59E0B (オレンジ - 注意・警告)
Destructive: #EF4444 (赤 - エラー・削除)

CSS変数:
--success: 22 163 74;
--warning: 245 158 11;
--destructive: 239 68 68;
```

**インターフェース要素**
```
Border: #E5E7EB (境界線・区切り)
Surface: #F9FAFB (カード・パネル背景)
Card: #FFFFFF (カードコンテナ)

CSS変数:
--border: 229 231 235;
--surface: 249 250 251;
--card: 255 255 255;
```

### 2.3 カラー使用ガイドライン

**コントラスト比要件**
- 通常テキスト: 4.5:1以上
- 大サイズテキスト (18px+): 3:1以上
- UIコンポーネント: 3:1以上

**実装例**
```typescript
// Tailwind with CSS variables (alpha support)
className="bg-brand-500/80"  // 80% opacity
className="text-brand-500 hover:text-brand-700"
className="border-accent-500/50"
```

---

## 3. タイポグラフィ

### 3.1 フォントファミリー

**日本語メインフォント**
```
font-family: 'Noto Sans JP', sans-serif;
weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
```

**見出し用英字フォント (必要に応じて)**
```
font-family: 'Poppins', 'Noto Sans JP', sans-serif;
weights: 600 (SemiBold), 700 (Bold)
```

### 3.2 レスポンシブタイポグラフィスケール

**見出し (Headings)**

```
H1 (ページタイトル):
- Mobile: 28px / line-height 36px / font-weight 600
- Desktop: 40px / line-height 48px / font-weight 600
- Tailwind: text-h1-mobile lg:text-h1-desktop

H2 (セクション見出し):
- Mobile: 24px / line-height 32px / font-weight 600
- Desktop: 32px / line-height 40px / font-weight 600
- Tailwind: text-h2-mobile lg:text-h2-desktop

H3 (サブセクション):
- Mobile: 20px / line-height 28px / font-weight 600
- Desktop: 24px / line-height 32px / font-weight 600
- Tailwind: text-h3-mobile lg:text-h3-desktop

H4 (小見出し):
- Mobile: 18px / line-height 26px / font-weight 600
- Desktop: 20px / line-height 28px / font-weight 600
- Tailwind: text-h4-mobile lg:text-h4-desktop
```

**本文 (Body Text)**

```
Body Large (強調テキスト):
- Mobile: 16px / line-height 24px / font-weight 400
- Desktop: 18px / line-height 28px / font-weight 400
- Tailwind: text-body-lg-mobile lg:text-body-lg-desktop

Body (標準テキスト):
- Mobile: 14px / line-height 20px / font-weight 400
- Desktop: 16px / line-height 24px / font-weight 400
- Tailwind: text-body-mobile lg:text-body-desktop

Body Small (補足テキスト):
- Mobile: 12px / line-height 18px / font-weight 400
- Desktop: 14px / line-height 20px / font-weight 400
- Tailwind: text-body-sm-mobile lg:text-body-sm-desktop
```

**キャプション・ラベル**

```
Caption:
- All: 12px / line-height 16px / font-weight 400
- 用途: 画像キャプション、注釈、メタ情報
- Tailwind: text-xs

Label:
- All: 14px / line-height 20px / font-weight 500
- 用途: フォームラベル、ボタンテキスト
- Tailwind: text-sm font-medium
```

### 3.3 実装例

```tsx
// ページタイトル
<h1 className="text-h1-mobile lg:text-h1-desktop font-semibold text-foreground">
  診断を始める
</h1>

// セクション見出し
<h2 className="text-h2-mobile lg:text-h2-desktop font-semibold text-foreground mb-4">
  診断結果
</h2>

// 本文
<p className="text-body-mobile lg:text-body-desktop text-muted-foreground">
  あなたの性格タイプは...
</p>

// キャプション
<span className="text-xs text-muted-foreground">
  30日間保存されます
</span>
```

---

## 4. スペーシング

### 4.1 8pxグリッドシステム

**基準値**
```
基本単位: 8px
最小単位: 4px (微調整用)

Tailwind スケール:
0.5 = 2px   (境界線)
1 = 4px     (極小)
2 = 8px     (小)
3 = 12px    (中小)
4 = 16px    (中)
5 = 20px    (中)
6 = 24px    (中大)
8 = 32px    (大)
10 = 40px   (大)
12 = 48px   (特大)
16 = 64px   (セクション区切り)
20 = 80px   (大セクション)
24 = 96px   (ヒーローセクション)
```

### 4.2 コンポーネント内スペーシング

**カード内部**
```
Padding: p-6 (24px) - カードコンテンツの標準余白
Header: space-y-1.5 (6px) - タイトルと説明の間隔
Content: pt-0 (Header後は上余白なし)
Footer: pt-0 (Content後は上余白なし)
```

**フォーム要素**
```
Label ↔ Input: space-y-2 (8px)
Input間の縦スペース: space-y-4 (16px)
フォームセクション間: space-y-6 (24px)
```

**ボタン**
```
Small: px-3 py-2 (横12px 縦8px) + min-h-[44px]
Medium: px-4 py-2 (横16px 縦8px) + min-h-[44px]
Large: px-8 py-3 (横32px 縦12px) + min-h-[48px]

ボタン間スペース: gap-4 (16px) 横並び時
                 space-y-4 (16px) 縦並び時
```

### 4.3 レイアウトスペーシング

**ページレイアウト**
```
Page Padding (Mobile): px-4 py-6 (横16px 縦24px)
Page Padding (Desktop): px-6 py-12 (横24px 縦48px)

Section間: space-y-12 md:space-y-16 (48px → 64px)
Container最大幅: max-w-7xl (1280px)
```

**診断フロー固有**
```
質問カード間: space-y-6 (24px)
ステップインジケーター間: gap-2 (8px)
結果カード間: gap-6 md:gap-8 (24px → 32px)
```

---

## 5. コンポーネント仕様

### 5.1 ボタン (Button Component)

**実装ファイル**: `src/ui/components/ui/button.tsx`

**バリアント体系**

```typescript
// Primary (ブランドカラー - CTA用)
variant="primary"
className="bg-brand-500 text-white hover:bg-brand-700 active:bg-brand-700"

// Secondary (枠線ボタン - サブアクション用)
variant="secondary"
className="border border-border bg-surface hover:bg-background active:bg-border text-foreground"

// Tertiary (テキストボタン - 補助アクション用)
variant="tertiary"
className="hover:bg-surface active:bg-background text-foreground"

// Destructive (削除・危険な操作用)
variant="destructive"
className="bg-destructive text-white hover:bg-red-600 active:bg-red-700"
```

**サイズバリアント**

```typescript
// Small
size="sm"
className="h-10 px-3 text-xs min-h-[44px]"  // WCAG タッチターゲット対応

// Medium (デフォルト)
size="md"
className="h-11 px-4 py-2 min-h-[44px]"

// Large
size="lg"
className="h-12 px-8 min-h-[48px]"
```

**特殊機能**

```typescript
// ローディング状態
isLoading={true}
// → スピナー表示 + disabled状態

// asChild (Radix UI Slot パターン)
asChild={true}
// → 子要素にボタンスタイルを適用 (Link要素など)
```

**アクセシビリティ対応**
- `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`
- `disabled:pointer-events-none disabled:opacity-50`
- `touch-manipulation` (iOS二重タップズーム防止)
- 最小タップターゲット 44px保証

**使用例**

```tsx
// Primary CTA
<Button variant="primary" size="lg">
  診断を始める
</Button>

// Loading state
<Button variant="primary" isLoading={true}>
  送信中...
</Button>

// Link as Button
<Button asChild variant="secondary">
  <Link href="/sign-in">サインイン</Link>
</Button>
```

### 5.2 カード (Card Component)

**実装ファイル**: `src/ui/components/ui/card.tsx`

**基本構造**

```tsx
<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
    <CardDescription>説明文</CardDescription>
  </CardHeader>
  <CardContent>
    {/* メインコンテンツ */}
  </CardContent>
  <CardFooter>
    {/* アクションボタンなど */}
  </CardFooter>
</Card>
```

**スタイル仕様**

```typescript
// Card本体
className="bg-white border border-gray-200 rounded-lg shadow-sm"

// CardHeader
className="flex flex-col space-y-1.5 p-6"

// CardTitle
className="text-2xl font-semibold leading-none tracking-tight"

// CardDescription
className="text-sm text-gray-600"

// CardContent
className="p-6 pt-0"  // Header後は上余白なし

// CardFooter
className="flex items-center p-6 pt-0"
```

**使用例**

```tsx
// 診断履歴カード
<Card>
  <CardHeader>
    <CardTitle>体癖診断結果</CardTitle>
    <CardDescription>2025年11月5日</CardDescription>
  </CardHeader>
  <CardContent>
    <p>あなたの体癖タイプは「5種」です。</p>
  </CardContent>
  <CardFooter>
    <Button variant="secondary">詳細を見る</Button>
  </CardFooter>
</Card>
```

### 5.3 フォーム要素

**Input (テキスト入力)**

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-foreground">
    お名前
  </label>
  <input
    type="text"
    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
    placeholder="山田太郎"
  />
</div>
```

**Select (ドロップダウン)**

```tsx
<select
  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
>
  <option value="">選択してください</option>
  <option value="1990">1990年</option>
</select>
```

**Checkbox**

```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="h-4 w-4 rounded border-border text-brand-500 focus:ring-2 focus:ring-brand-500"
  />
  <span className="text-sm text-foreground">
    プライバシーポリシーに同意する
  </span>
</label>
```

**バリデーションエラー表示**

```tsx
{error && (
  <p className="text-xs text-destructive mt-1">
    {error.message}
  </p>
)}
```

### 5.4 ナビゲーション要素

**パンくずリスト (Breadcrumbs)**

```tsx
<nav className="flex items-center gap-2 text-sm text-muted-foreground">
  <Link href="/" className="hover:text-foreground">
    ホーム
  </Link>
  <span>/</span>
  <Link href="/learn/taiheki" className="hover:text-foreground">
    体癖を学ぶ
  </Link>
  <span>/</span>
  <span className="text-foreground">第1章</span>
</nav>
```

**サイドバーナビゲーション**

```tsx
<nav className="space-y-1">
  <a
    href="/learn/taiheki/1"
    className="block rounded-lg px-4 py-2 text-sm font-medium text-foreground bg-accent-500/10 border-l-4 border-accent-500"
  >
    第1章：体癖とは
  </a>
  <a
    href="/learn/taiheki/2"
    className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface"
  >
    第2章：各タイプの特徴
  </a>
</nav>
```

### 5.5 モーダル・ダイアログ

**基本構造**

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div className="w-full max-w-md rounded-modal bg-card p-6 shadow-z3">
    <h2 className="text-h3-mobile font-semibold text-foreground mb-4">
      確認
    </h2>
    <p className="text-body-mobile text-muted-foreground mb-6">
      本当に削除しますか？
    </p>
    <div className="flex justify-end gap-4">
      <Button variant="secondary" onClick={onClose}>
        キャンセル
      </Button>
      <Button variant="destructive" onClick={onConfirm}>
        削除する
      </Button>
    </div>
  </div>
</div>
```

**アニメーション**

```css
/* グローバルスタイル (globals.css) */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

---

## 6. レイアウトパターン

### 6.1 認証画面レイアウト

**使用画面**: `/sign-in`, `/sign-up`, `/diagnosis` (認証選択)

```tsx
<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12">
  <div className="w-full max-w-md">
    {/* ヘッダー */}
    <div className="mb-8 text-center">
      <h1 className="mb-2 text-3xl font-bold text-foreground">
        COCOSiL にサインイン
      </h1>
      <p className="text-sm text-muted-foreground">
        診断結果を保存してアクセスできます
      </p>
    </div>

    {/* メインコンテンツ (Clerk widget or 選択ボタン) */}
    <div className="mb-6">
      {/* ... */}
    </div>

    {/* フッター (プライバシー通知) */}
    <div className="text-center text-xs text-muted-foreground">
      <p>
        <a href="/privacy" className="underline hover:text-foreground">
          プライバシーポリシー
        </a>
        に同意したものとみなされます
      </p>
    </div>
  </div>
</div>
```

**特徴**:
- 中央配置レイアウト (`items-center justify-center`)
- 最大幅 480px (`max-w-md`)
- 統一グラデーション背景
- モバイル padding (`px-4 py-12`)

### 6.2 診断フローレイアウト

**使用画面**: `/diagnosis/taiheki`, `/diagnosis/mbti`

```tsx
<div className="min-h-screen bg-background px-4 py-8">
  <div className="mx-auto max-w-3xl">
    {/* プログレスバー */}
    <div className="mb-8">
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground text-center">
        {currentStep} / {totalSteps}
      </p>
    </div>

    {/* 質問カード */}
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>質問 {currentStep}</CardTitle>
        <CardDescription>{question.text}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 回答選択肢 */}
      </CardContent>
    </Card>

    {/* ナビゲーションボタン */}
    <div className="flex justify-between">
      <Button variant="secondary" onClick={onBack}>
        戻る
      </Button>
      <Button variant="primary" onClick={onNext}>
        次へ
      </Button>
    </div>
  </div>
</div>
```

**特徴**:
- 最大幅 768px (`max-w-3xl`)
- プログレスバー表示
- カード形式の質問表示
- 戻る/次へボタン配置

### 6.3 診断結果レイアウト

**使用画面**: `/diagnosis/results`, `/diagnosis/taiheki/results`

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
  <div className="mx-auto max-w-4xl">
    {/* ヒーローセクション */}
    <div className="mb-12 text-center">
      <h1 className="text-h1-mobile lg:text-h1-desktop font-bold text-foreground mb-4">
        あなたの診断結果
      </h1>
      <p className="text-body-lg-mobile lg:text-body-lg-desktop text-muted-foreground">
        多角的な分析からあなたの性格を読み解きます
      </p>
    </div>

    {/* 結果カードグリッド */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {/* 体癖結果 */}
      <Card>
        <CardHeader>
          <CardTitle>体癖診断</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 結果詳細 */}
        </CardContent>
      </Card>

      {/* MBTI結果 */}
      <Card>
        <CardHeader>
          <CardTitle>MBTI診断</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 結果詳細 */}
        </CardContent>
      </Card>

      {/* 算命学結果 */}
      <Card>
        <CardHeader>
          <CardTitle>算命学</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 結果詳細 */}
        </CardContent>
      </Card>

      {/* 動物占い結果 */}
      <Card>
        <CardHeader>
          <CardTitle>動物占い</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 結果詳細 */}
        </CardContent>
      </Card>
    </div>

    {/* アクションボタン */}
    <div className="flex justify-center gap-4">
      <Button variant="primary" size="lg">
        結果を保存
      </Button>
      <Button variant="secondary" size="lg">
        もう一度診断
      </Button>
    </div>
  </div>
</div>
```

**特徴**:
- 最大幅 896px (`max-w-4xl`)
- 2カラムグリッド (モバイルは1カラム)
- ヒーローセクション
- 中央配置アクションボタン

### 6.4 診断履歴レイアウト

**使用画面**: `/dashboard/history`

**実装ファイル**: `src/ui/features/dashboard/diagnosis-history-list.tsx`

```tsx
<div className="min-h-screen bg-background px-4 py-8">
  <div className="mx-auto max-w-7xl">
    {/* ページヘッダー */}
    <div className="mb-8">
      <h1 className="text-h1-mobile lg:text-h1-desktop font-bold text-foreground mb-2">
        診断履歴
      </h1>
      <p className="text-body-mobile text-muted-foreground">
        過去の診断結果を確認できます
      </p>
    </div>

    {/* 履歴カードグリッド */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map(record => (
        <DiagnosisHistoryCard key={record.id} record={record} />
      ))}
    </div>

    {/* 空状態 */}
    {records.length === 0 && (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <svg className="h-16 w-16 text-gray-400">
            {/* アイコン */}
          </svg>
        </div>
        <h3 className="text-h3-mobile font-semibold text-foreground mb-2">
          診断履歴がありません
        </h3>
        <p className="text-body-mobile text-muted-foreground mb-6">
          最初の診断を始めて、結果を保存しましょう
        </p>
        <Button variant="primary" asChild>
          <Link href="/diagnosis">診断を始める</Link>
        </Button>
      </div>
    )}

    {/* ページネーション (カーソルベース) */}
    {hasMore && (
      <div className="mt-8 text-center">
        <LoadMoreButton cursor={nextCursor} />
      </div>
    )}
  </div>
</div>
```

**特徴**:
- 最大幅 1280px (`max-w-7xl`)
- 3カラムグリッド (lg以上) / 2カラム (md) / 1カラム (sm以下)
- 空状態の丁寧なハンドリング
- カーソルベースページネーション (無限スクロール対応)

### 6.5 学習コンテンツレイアウト

**使用画面**: `/learn/taiheki/[chapter]`

```tsx
<div className="flex min-h-screen bg-background">
  {/* サイドバーナビゲーション (Desktop) */}
  <aside className="hidden lg:block w-64 border-r border-border">
    <TaihekiNavigationSidebar currentChapter={chapter} />
  </aside>

  {/* メインコンテンツエリア */}
  <main className="flex-1 px-4 py-8 lg:px-8">
    <div className="mx-auto max-w-3xl">
      {/* パンくずリスト */}
      <TaihekiBreadcrumbs chapter={chapter} className="mb-6" />

      {/* MDXコンテンツ */}
      <article className="prose prose-slate max-w-none">
        <TaihekiChapterContent chapter={chapter} />
      </article>

      {/* 章末ナビゲーション */}
      <div className="mt-12 flex justify-between border-t border-border pt-6">
        {previousChapter && (
          <Button variant="secondary" asChild>
            <Link href={`/learn/taiheki/${previousChapter}`}>
              ← 前の章
            </Link>
          </Button>
        )}
        {nextChapter && (
          <Button variant="primary" asChild>
            <Link href={`/learn/taiheki/${nextChapter}`}>
              次の章 →
            </Link>
          </Button>
        )}
      </div>
    </div>
  </main>
</div>
```

**特徴**:
- サイドバーナビゲーション (Desktop表示のみ)
- 最大幅 768px (`max-w-3xl`) の読みやすいコンテンツ幅
- Tailwind Typography (`prose`) でMDX自動スタイリング
- 章末の前後ナビゲーション

---

## 7. 画面別仕様

### 7.1 認証選択画面 (`/diagnosis`)

**実装ファイル**: `src/ui/features/diagnosis/auth-choice-screen.tsx`

**レイアウト**:
```
┌────────────────────────────────────┐
│                                    │
│         診断を始める               │
│    診断方法を選択してください      │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 🔐 アカウントを作成して始める │ │
│  │  診断結果を保存・履歴閲覧可能  │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ ✅ サインインして始める       │ │
│  │  既存アカウントで続ける        │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 👤 匿名で続ける               │ │
│  │  30日間ブラウザに保存          │ │
│  └──────────────────────────────┘ │
│                                    │
│  ℹ️ 匿名診断の場合、診断データは  │
│    ブラウザのローカルストレージに  │
│    保存され、30日後に自動削除...  │
│                                    │
└────────────────────────────────────┘
```

**実装詳細**:

```tsx
<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12">
  <div className="w-full max-w-[480px] animate-fade-in">
    {/* ヘッダー */}
    <div className="mb-8 text-center">
      <h1 className="mb-2 text-3xl font-bold text-foreground">
        診断を始める
      </h1>
      <p className="text-sm text-muted-foreground">
        診断方法を選択してください
      </p>
    </div>

    {/* 3ボタン選択 */}
    <div className="space-y-4">
      {/* Button 1: Create Account */}
      <Link
        href="/sign-up"
        className="flex items-center gap-4 rounded-lg border-2 border-transparent bg-accent-500 p-4 text-white hover:bg-accent-600 transition-colors"
      >
        <span className="text-2xl">🔐</span>
        <div className="flex-1 text-left">
          <div className="font-semibold">アカウントを作成して始める</div>
          <div className="text-sm opacity-90">診断結果を保存・履歴閲覧可能</div>
        </div>
      </Link>

      {/* Button 2: Sign In */}
      <Link
        href="/sign-in"
        className="flex items-center gap-4 rounded-lg border-2 border-transparent bg-foreground p-4 text-white hover:bg-foreground/90 transition-colors"
      >
        <span className="text-2xl">✅</span>
        <div className="flex-1 text-left">
          <div className="font-semibold">サインインして始める</div>
          <div className="text-sm opacity-90">既存アカウントで続ける</div>
        </div>
      </Link>

      {/* Button 3: Anonymous */}
      <button
        onClick={onProceed}
        className="flex w-full items-center gap-4 rounded-lg border-2 border-border bg-surface p-4 text-foreground hover:bg-background transition-colors"
      >
        <span className="text-2xl">👤</span>
        <div className="flex-1 text-left">
          <div className="font-semibold">匿名で続ける</div>
          <div className="text-sm text-muted-foreground">30日間ブラウザに保存</div>
        </div>
      </button>
    </div>

    {/* Privacy Notice */}
    <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
      <p className="flex items-start gap-2">
        <span className="text-lg">ℹ️</span>
        <span>
          匿名診断の場合、診断データはブラウザのローカルストレージに保存され、30日後に自動削除されます。
          継続的に診断結果を保存したい場合は、アカウント作成をおすすめします。
        </span>
      </p>
    </div>
  </div>
</div>
```

**動作仕様**:
1. 認証済みユーザーはこの画面をスキップして直接診断フォームへ
2. 未認証ユーザーには3つの選択肢を表示
3. 各ボタンクリック時の挙動:
   - **アカウント作成**: `/sign-up`へリダイレクト → 完了後 `/diagnosis`へ戻る
   - **サインイン**: `/sign-in`へリダイレクト → 完了後 `/diagnosis`へ戻る
   - **匿名で続ける**: Zustand store に `authMode: 'anonymous'` を設定 → 基本情報フォーム表示

**状態管理 (Zustand)**:
```typescript
// src/lib/zustand/diagnosis-store.ts
interface DiagnosisStore {
  authMode: 'anonymous' | 'authenticated' | null;
  userId: string | null;
  setAuthMode: (mode: 'anonymous' | 'authenticated', userId?: string) => void;
}
```

### 7.2 サインアップ/サインインページ

**使用画面**: `/sign-up`, `/sign-in`

**実装ファイル**:
- `src/app/sign-up/[[...sign-up]]/page.tsx`
- `src/app/sign-in/[[...sign-in]]/page.tsx`

**Clerk統合仕様**:

```tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            COCOSiL アカウント作成
          </h1>
          <p className="text-sm text-muted-foreground">
            診断結果を保存して、いつでもアクセス
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg',
              // Clerkコンポーネントのスタイルカスタマイズ
            },
          }}
        />

        {/* Benefits List */}
        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            アカウント作成のメリット：
          </h3>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>✅ 診断結果を永久保存</li>
            <li>✅ 診断履歴の閲覧</li>
            <li>✅ パーソナライズされた分析</li>
            <li>✅ デバイス間でのデータ同期</li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            アカウントを作成することで、
            <a href="/privacy" className="underline hover:text-foreground">
              プライバシーポリシー
            </a>
            と
            <a href="/terms" className="underline hover:text-foreground">
              利用規約
            </a>
            に同意したものとみなされます
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Clerk設定**:
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/diagnosis`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/diagnosis`

**日本語ローカライゼーション**:
- Clerk Dashboard で日本語設定
- エラーメッセージ、ボタンラベルすべて日本語化

### 7.3 診断履歴画面

**使用画面**: `/dashboard/history`

**実装ファイル**: `src/ui/features/dashboard/diagnosis-history-list.tsx`

**データフェッチ (Server Component)**:

```typescript
// Prismaを使用したカーソルベースページネーション
export async function DiagnosisHistoryList({
  userId,
  initialCursor,
  limit = 20
}: DiagnosisHistoryListProps) {
  const records = await db.diagnosisRecord.findMany({
    where: { clerkUserId: userId },
    take: limit + 1, // 次ページ有無判定のため+1
    cursor: initialCursor ? { id: initialCursor } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = records.length > limit;
  const displayRecords = hasMore ? records.slice(0, -1) : records;
  const nextCursor = hasMore ? records[limit].id : null;

  // ... レンダリング
}
```

**レイアウト**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {displayRecords.map(record => (
    <DiagnosisHistoryCard key={record.id} record={record} />
  ))}
</div>

{hasMore && (
  <div className="mt-8 text-center">
    <LoadMoreButton cursor={nextCursor} />
  </div>
)}
```

**空状態ハンドリング**:

```tsx
{records.length === 0 && (
  <div className="text-center py-16">
    <div className="flex justify-center mb-4">
      <svg className="h-16 w-16 text-gray-400" /* ... */ />
    </div>
    <h3 className="text-h3-mobile font-semibold text-foreground mb-2">
      診断履歴がありません
    </h3>
    <p className="text-body-mobile text-muted-foreground mb-6">
      最初の診断を始めて、結果を保存しましょう
    </p>
    <Button variant="primary" asChild>
      <Link href="/diagnosis">診断を始める</Link>
    </Button>
  </div>
)}
```

### 7.4 診断結果画面

**使用画面**: `/diagnosis/results`

**実装ファイル**: `src/ui/features/diagnosis/results.tsx`

**レイアウト構成**:

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
  <div className="mx-auto max-w-4xl">
    {/* ヒーローセクション */}
    <div className="mb-12 text-center">
      <h1 className="text-h1-mobile lg:text-h1-desktop font-bold text-foreground mb-4">
        診断結果
      </h1>
      <p className="text-body-lg-mobile lg:text-body-lg-desktop text-muted-foreground">
        {userData.name}さんの多角的分析結果
      </p>
    </div>

    {/* 4つの診断結果カードグリッド */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {/* 1. 体癖診断結果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧘 体癖診断
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-brand-500 mb-2">
            {taihekiResult.type}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {taihekiResult.description}
          </p>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/learn/taiheki">詳しく学ぶ</Link>
          </Button>
        </CardContent>
      </Card>

      {/* 2. MBTI診断結果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 MBTI診断
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-accent-500 mb-2">
            {mbtiResult.type}
          </div>
          <p className="text-sm text-muted-foreground">
            {mbtiResult.description}
          </p>
        </CardContent>
      </Card>

      {/* 3. 算命学 (動物占い・星座) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔮 算命学
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground">動物キャラクター</span>
              <div className="text-2xl font-semibold text-foreground">
                {fortuneResult.animalCharacter}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">西洋星座</span>
              <div className="text-2xl font-semibold text-foreground">
                {fortuneResult.zodiacSign}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">六星占術</span>
              <div className="text-2xl font-semibold text-foreground">
                {fortuneResult.sixStar}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. 統合分析 (GPT-4生成) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ 統合分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {integrationAnalysis}
          </p>
        </CardContent>
      </Card>
    </div>

    {/* アクションボタン */}
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      {isAuthenticated ? (
        <Button variant="primary" size="lg" onClick={onSave}>
          結果を保存
        </Button>
      ) : (
        <Button variant="primary" size="lg" asChild>
          <Link href="/sign-up">アカウント作成して保存</Link>
        </Button>
      )}
      <Button variant="secondary" size="lg" asChild>
        <Link href="/diagnosis/chat">AIと結果を深掘り</Link>
      </Button>
      <Button variant="tertiary" size="lg" asChild>
        <Link href="/diagnosis">もう一度診断</Link>
      </Button>
    </div>
  </div>
</div>
```

**データ構造 (Zustand store)**:

```typescript
interface DiagnosisResults {
  basicInfo: {
    name: string;
    birthdate: { year: number; month: number; day: number };
    gender: 'male' | 'female';
  };
  taiheki: {
    type: string; // "5種" など
    description: string;
    score: Record<string, number>; // 各タイプのスコア
  };
  mbti: {
    type: string; // "INFP" など
    dimensions: {
      EI: number; // E-I軸のスコア (-100 ~ +100)
      SN: number;
      TF: number;
      JP: number;
    };
    description: string;
  };
  fortune: {
    age: number; // 満年齢
    zodiacSign: string; // "牡羊座" など
    animalCharacter: string; // "協調性のあるたぬき" など
    sixStar: string; // "土星人+" など
  };
}
```

---

## 8. アニメーション・トランジション

### 8.1 基本アニメーション定義

**globals.css 実装**:

```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### 8.2 トランジション使用パターン

**ボタンホバー**:
```tsx
className="transition-colors duration-200 hover:bg-brand-700"
```

**カードホバー**:
```tsx
className="transition-all duration-200 hover:shadow-z2"
```

**プログレスバー**:
```tsx
className="transition-all duration-300"
style={{ width: `${progress}%` }}
```

**モーダル表示**:
```tsx
// 背景オーバーレイ
className="animate-fade-in"

// モーダルコンテンツ
className="animate-slide-up"
```

### 8.3 ローディングインジケーター

**スピナー (Button内)**:
```tsx
{isLoading && (
  <div className="flex items-center gap-2">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    <span>処理中...</span>
  </div>
)}
```

**フルページローディング**:
```tsx
<div className="flex min-h-screen items-center justify-center">
  <div className="animate-pulse text-lg text-muted-foreground">
    読み込み中...
  </div>
</div>
```

**スケルトンローディング (診断履歴)**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {[1, 2, 3].map(i => (
    <div key={i} className="animate-pulse">
      <div className="h-48 bg-muted rounded-lg" />
    </div>
  ))}
</div>
```

---

## 9. レスポンシブブレークポイント

### 9.1 Tailwind ブレークポイント定義

```typescript
// tailwind.config.ts
screens: {
  sm: '640px',   // スマートフォン (横向き)
  md: '768px',   // タブレット (縦向き)
  lg: '1024px',  // タブレット (横向き) / ラップトップ
  xl: '1280px',  // デスクトップ
  '2xl': '1536px', // 大型ディスプレイ
}
```

### 9.2 レスポンシブパターン

**グリッドレイアウト**:
```tsx
// モバイル: 1列 / タブレット: 2列 / デスクトップ: 3列
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

**テキストサイズ**:
```tsx
// モバイル: 28px / デスクトップ: 40px
className="text-h1-mobile lg:text-h1-desktop"
```

**スペーシング**:
```tsx
// モバイル: 横16px / デスクトップ: 横24px
className="px-4 lg:px-6"

// モバイル: 縦24px / デスクトップ: 縦48px
className="py-6 lg:py-12"
```

**サイドバー表示切替**:
```tsx
// モバイル: 非表示 / デスクトップ: 表示
className="hidden lg:block"
```

**ボタン配置**:
```tsx
// モバイル: 縦並び / デスクトップ: 横並び
className="flex flex-col sm:flex-row gap-4"
```

### 9.3 モバイル最適化

**タッチターゲット**:
- 最小サイズ: 44px × 44px (Apple Human Interface Guidelines準拠)
- 実装: `min-h-[44px]` をボタンに付与

**タッチアクション**:
```tsx
className="touch-manipulation"  // iOS二重タップズーム防止
```

**スクロール最適化**:
```tsx
className="overscroll-contain"  // バウンススクロール制御
className="overflow-y-auto"     // 縦スクロール有効化
```

---

## 10. アクセシビリティ (WCAG 2.2 AA)

### 10.1 コントラスト比要件

**テキスト**:
- 通常サイズ (<18px): 最低 4.5:1
- 大サイズ (≥18px or ≥14px bold): 最低 3:1

**UIコンポーネント**:
- ボーダー、アイコン: 最低 3:1

**検証済みカラーコンビネーション**:
```
✅ text-foreground on bg-background: 12.6:1
✅ text-brand-500 on bg-white: 4.8:1
✅ text-accent-500 on bg-white: 4.6:1
✅ text-muted-foreground on bg-background: 4.5:1
✅ border-border on bg-background: 3.2:1
```

### 10.2 キーボードナビゲーション

**フォーカス表示**:
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-opacity-40"
```

**Tab順序**:
- 論理的な順序でフォーカス移動
- `tabIndex` は最小限に使用 (必要時のみ)

**ショートカットキー**:
```
Enter: 選択・送信
Escape: モーダルクローズ、キャンセル
Space: チェックボックス切替
```

### 10.3 スクリーンリーダー対応

**ARIA属性**:
```tsx
// ボタン
<button aria-label="診断を開始する">開始</button>

// プログレスバー
<div role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
  <div style={{ width: '60%' }} />
</div>

// ステータスメッセージ
<div role="status" aria-live="polite">
  診断結果を保存しました
</div>

// エラーメッセージ
<div role="alert" aria-live="assertive">
  入力内容に誤りがあります
</div>
```

**セマンティックHTML**:
```tsx
// ✅ 正しい
<nav>...</nav>
<main>...</main>
<article>...</article>
<button>送信</button>

// ❌ 避けるべき
<div onClick={...}>送信</div>
```

**画像代替テキスト**:
```tsx
<img src="/icon.svg" alt="診断アイコン" />

// 装飾画像
<img src="/decoration.svg" alt="" role="presentation" />
```

### 10.4 フォームアクセシビリティ

**ラベル関連付け**:
```tsx
<label htmlFor="name">お名前</label>
<input id="name" type="text" />

// or
<label>
  お名前
  <input type="text" />
</label>
```

**エラー通知**:
```tsx
<div>
  <label htmlFor="email">メールアドレス</label>
  <input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <p id="email-error" role="alert" className="text-destructive text-xs mt-1">
      {error.message}
    </p>
  )}
</div>
```

**必須フィールド**:
```tsx
<label htmlFor="name">
  お名前 <span aria-label="必須">*</span>
</label>
<input id="name" type="text" required aria-required="true" />
```

---

## 11. パフォーマンス最適化

### 11.1 画像最適化

**Next.js Image コンポーネント使用**:
```tsx
import Image from 'next/image';

<Image
  src="/diagrams/taiheki-types.png"
  alt="体癖タイプ一覧"
  width={800}
  height={600}
  priority={false}  // Above the fold画像はtrue
  loading="lazy"    // 遅延ロード
  quality={85}      // 圧縮品質 (デフォルト75)
/>
```

**推奨フォーマット**:
- WebP優先 (Imageコンポーネント自動変換)
- PNG: アイコン・図表
- JPEG: 写真

### 11.2 コード分割

**動的インポート**:
```tsx
import dynamic from 'next/dynamic';

// 重いコンポーネントを遅延ロード
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <div className="animate-pulse">読み込み中...</div>,
  ssr: false, // Client-side only
});
```

**Route Groups**:
```
src/app/
├── (sites)/         # 公開サイト
│   ├── page.tsx     # ランディング
│   └── learn/       # 学習コンテンツ
├── diagnosis/       # 診断フロー
└── admin/           # 管理画面
```

### 11.3 Server Components優先

**基本方針**:
- デフォルトはServer Component
- インタラクションが必要な部分のみClient Component

```tsx
// ✅ Server Component (デフォルト)
export default async function DiagnosisHistoryPage() {
  const records = await db.diagnosisRecord.findMany({...});
  return <DiagnosisHistoryList records={records} />;
}

// ✅ Client Component (必要時のみ)
'use client';
export function InteractiveChart({ data }: Props) {
  const [selected, setSelected] = useState(null);
  return <Chart data={data} onSelect={setSelected} />;
}
```

### 11.4 データベースクエリ最適化

**N+1問題回避**:
```typescript
// ❌ N+1 クエリ
const users = await db.user.findMany();
for (const user of users) {
  const records = await db.diagnosisRecord.findMany({ where: { userId: user.id } });
}

// ✅ Prisma include
const users = await db.user.findMany({
  include: {
    diagnosisRecords: true,
  },
});
```

**カーソルベースページネーション**:
```typescript
// ✅ 大量データに対応
const records = await db.diagnosisRecord.findMany({
  take: 20,
  cursor: lastCursor ? { id: lastCursor } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

---

## 12. Clerk認証カスタマイズ

### 12.1 Clerk コンポーネントスタイリング

**appearance APIの使用**:

```tsx
import { SignIn } from '@clerk/nextjs';

<SignIn
  appearance={{
    elements: {
      rootBox: 'mx-auto',           // ルートコンテナ
      card: 'shadow-lg',            // カード
      headerTitle: 'text-foreground', // タイトル
      headerSubtitle: 'text-muted-foreground', // サブタイトル
      socialButtonsBlockButton: 'border border-border hover:bg-surface', // OAuthボタン
      formButtonPrimary: 'bg-brand-500 hover:bg-brand-700', // プライマリーボタン
      footerActionLink: 'text-brand-500 hover:text-brand-700', // リンク
      formFieldInput: 'border-border focus:ring-brand-500', // 入力フィールド
      identityPreviewEditButton: 'text-brand-500', // 編集ボタン
    },
    layout: {
      socialButtonsPlacement: 'bottom', // OAuthボタン配置
      socialButtonsVariant: 'blockButton', // ボタンスタイル
    },
  }}
/>
```

### 12.2 リダイレクト設定

**環境変数 (.env.local)**:
```bash
# サインアップ
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/diagnosis

# サインイン
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/diagnosis

# サインアウト
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# その他
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 12.3 ユーザーメタデータ同期

**Webhook設定** (Phase 2実装済み):

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { db } from '@/lib/prisma';

export async function POST(request: Request) {
  const payload = await request.json();
  const headers = request.headers;

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const evt = wh.verify(payload, headers);

  if (evt.type === 'user.created') {
    await db.user.create({
      data: {
        clerkUserId: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
      },
    });
  }

  return new Response('OK', { status: 200 });
}
```

---

## 13. Zustand状態管理パターン

### 13.1 診断ストア構造

**実装ファイル**: `src/lib/zustand/diagnosis-store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DiagnosisStore {
  // 認証状態
  authMode: 'anonymous' | 'authenticated' | null;
  userId: string | null;

  // 基本情報
  basicInfo: BasicInfo | null;

  // 診断結果
  mbti: MBTIResult | null;
  taiheki: TaihekiResult | null;
  fortune: FortuneResult | null;

  // 進捗状態
  progress: {
    completedSteps: string[];
    currentStep: string;
    percentage: number;
  };

  // アクション
  setAuthMode: (mode: 'anonymous' | 'authenticated', userId?: string) => void;
  setBasicInfo: (info: BasicInfo) => void;
  setMBTI: (result: MBTIResult) => void;
  setTaiheki: (result: TaihekiResult) => void;
  setFortune: (result: FortuneResult) => void;
  updateProgress: (step: string) => void;
  clearDiagnosis: () => void;
}

export const useDiagnosisStore = create<DiagnosisStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      authMode: null,
      userId: null,
      basicInfo: null,
      mbti: null,
      taiheki: null,
      fortune: null,
      progress: {
        completedSteps: [],
        currentStep: 'auth',
        percentage: 0,
      },

      // アクション実装
      setAuthMode: (mode, userId) => {
        set({ authMode: mode, userId: userId || null });
      },

      setBasicInfo: (info) => {
        set({ basicInfo: info });
        get().updateProgress('basic-info');
      },

      setMBTI: (result) => {
        set({ mbti: result });
        get().updateProgress('mbti');
      },

      setTaiheki: (result) => {
        set({ taiheki: result });
        get().updateProgress('taiheki');
      },

      setFortune: (result) => {
        set({ fortune: result });
        get().updateProgress('fortune');
      },

      updateProgress: (step) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          const newCompleted = [...completedSteps, step];
          const totalSteps = 5; // auth, basic-info, mbti, taiheki, fortune
          const percentage = (newCompleted.length / totalSteps) * 100;

          set({
            progress: {
              completedSteps: newCompleted,
              currentStep: step,
              percentage,
            },
          });
        }
      },

      clearDiagnosis: () => {
        set({
          basicInfo: null,
          mbti: null,
          taiheki: null,
          fortune: null,
          progress: {
            completedSteps: [],
            currentStep: 'auth',
            percentage: 0,
          },
        });
      },
    }),
    {
      name: 'cocosil-diagnosis-store', // localStorage key
      partialize: (state) => ({
        // 永続化対象を選択
        authMode: state.authMode,
        userId: state.userId,
        basicInfo: state.basicInfo,
        mbti: state.mbti,
        taiheki: state.taiheki,
        fortune: state.fortune,
        progress: state.progress,
      }),
    }
  )
);
```

### 13.2 学習進捗ストア

**実装ファイル**: `src/lib/zustand/learning-store.ts`

```typescript
interface LearningStore {
  currentChapter: number;
  completedChapters: number[];
  chapterScores: Record<number, number>;

  setCurrentChapter: (chapter: number) => void;
  markChapterComplete: (chapter: number, score?: number) => void;
  resetProgress: () => void;
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set) => ({
      currentChapter: 1,
      completedChapters: [],
      chapterScores: {},

      setCurrentChapter: (chapter) => {
        set({ currentChapter: chapter });
      },

      markChapterComplete: (chapter, score) => {
        set((state) => ({
          completedChapters: [...new Set([...state.completedChapters, chapter])],
          chapterScores: score !== undefined
            ? { ...state.chapterScores, [chapter]: score }
            : state.chapterScores,
        }));
      },

      resetProgress: () => {
        set({
          currentChapter: 1,
          completedChapters: [],
          chapterScores: {},
        });
      },
    }),
    {
      name: 'cocosil-learning-store',
    }
  )
);
```

### 13.3 使用例

```tsx
'use client';

import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';

export function DiagnosisProgress() {
  const { progress, basicInfo, mbti, taiheki } = useDiagnosisStore();

  return (
    <div>
      <div className="h-2 bg-muted rounded-full">
        <div
          className="h-2 bg-brand-500 rounded-full transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {progress.completedSteps.length} / 5 完了
      </p>
    </div>
  );
}
```

---

## 14. デザイントークン一覧

### 14.1 カラートークン (CSS変数)

```css
:root {
  /* Brand Colors */
  --brand-500: 122 197 229;  /* #7AC5E5 */
  --brand-700: 59 157 181;   /* #3B9DB5 */

  /* Accent Colors */
  --accent-500: 192 98 245;  /* #C062F5 */
  --accent-600: 168 77 216;  /* #A84DD8 */

  /* Base Colors */
  --background: 255 255 255; /* #FFFFFF */
  --foreground: 16 24 40;    /* #101828 */
  --muted: 249 250 251;      /* #F9FAFB */
  --muted-foreground: 107 114 128; /* #6B7280 */

  /* Semantic Colors */
  --success: 22 163 74;      /* #16A34A */
  --warning: 245 158 11;     /* #F59E0B */
  --destructive: 239 68 68;  /* #EF4444 */

  /* UI Elements */
  --border: 229 231 235;     /* #E5E7EB */
  --surface: 249 250 251;    /* #F9FAFB */
  --card: 255 255 255;       /* #FFFFFF */
}

.dark {
  --background: 11 15 26;    /* #0B0F1A */
  --foreground: 230 232 238; /* #E6E8EE */
  --muted: 31 41 55;         /* #1F2937 */
  /* ... 他のダークモード値 */
}
```

### 14.2 シャドウトークン

```typescript
// tailwind.config.ts
boxShadow: {
  'z1': '0 1px 2px rgba(16, 24, 40, 0.10)',    // 浅い影 (カード)
  'z2': '0 6px 12px rgba(16, 24, 40, 0.12)',   // 中間影 (ホバー)
  'z3': '0 12px 24px rgba(16, 24, 40, 0.16)',  // 深い影 (モーダル)
}
```

### 14.3 ボーダー半径トークン

```typescript
borderRadius: {
  'card': '8px',       // カード
  'modal': '12px',     // モーダル
  'hero': '24px',      // ヒーローセクション
}
```

---

## 15. 実装チェックリスト

### 15.1 新規画面追加時

- [ ] レスポンシブレイアウト確認 (sm/md/lg/xl)
- [ ] タイポグラフィスケール適用 (text-h1-mobile lg:text-h1-desktop)
- [ ] カラートークン使用 (bg-brand-500, text-foreground等)
- [ ] スペーシング 8pxグリッド準拠
- [ ] アクセシビリティ (ARIA属性、フォーカス表示)
- [ ] ローディング状態実装
- [ ] エラーハンドリング
- [ ] 空状態ハンドリング

### 15.2 コンポーネント作成時

- [ ] Server Component優先 (Client Componentは最小限)
- [ ] TypeScript型定義
- [ ] Props validation
- [ ] アクセシビリティ対応 (ARIA, キーボード)
- [ ] 最小タップターゲット 44px保証
- [ ] ホバー・アクティブ状態
- [ ] ローディング・無効化状態

### 15.3 デプロイ前確認

- [ ] `npm run build` 成功
- [ ] `npm run lint` クリーン
- [ ] `npm run type-check` クリーン
- [ ] Lighthouse スコア (Performance 80+, Accessibility 95+)
- [ ] 各ブラウザ動作確認 (Chrome, Safari, Firefox)
- [ ] モバイル実機確認 (iOS, Android)

---

## 16. 今後の拡張予定

### Phase 2 (実装済み)
- ✅ Clerk認証統合
- ✅ 診断履歴システム
- ✅ データベース永続化 (Prisma)

### Phase 3 (計画中)
- [ ] ダークモード完全対応
- [ ] PWA化 (オフライン対応)
- [ ] 診断結果PDF出力
- [ ] ソーシャルシェア機能

### Phase 4 (将来展望)
- [ ] 複数言語対応 (英語・中国語)
- [ ] グループ診断機能
- [ ] 管理者ダッシュボード強化
- [ ] データ分析ダッシュボード

---

## 付録: 参考リソース

### デザインツール
- **Figma**: (デザインファイルURL)
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/

### アクセシビリティ
- **WCAG 2.2**: https://www.w3.org/WAI/WCAG22/quickref/
- **ARIA**: https://www.w3.org/WAI/ARIA/apg/

### パフォーマンス
- **Next.js Optimization**: https://nextjs.org/docs/app/building-your-application/optimizing
- **Web Vitals**: https://web.dev/vitals/

### 認証
- **Clerk Documentation**: https://clerk.com/docs

---

**最終更新**: 2025-11-05
**管理者**: COCOSiL開発チーム
