# COCOSiL セッション管理

このディレクトリには、COCOSiLプロジェクトの開発セッションのスナップショットが保存されています。

## セッション復旧方法

### 1. 最新セッション確認
```bash
ls -la .claude/sessions/ | head -5
```

### 2. セッション読み込み  
```bash
cat .claude/sessions/jissou-mae2_20250830_232651.json | jq '.recovery_instructions'
```

### 3. SuperClaude コマンド確認
```bash
ls ~/.claude/commands/sc*.md | wc -l  # 22個のコマンドが利用可能
```

### 4. 開発環境復旧（完了済み）
```bash  
# 依存関係インストール（既に完了）
npm install

# 型チェック確認
npm run type-check

# 開発サーバー起動
npm run dev
```

### 5. 実装状況確認
- **完了**: SuperClaude Framework セットアップ（22コマンド作成）
- **完了**: 基本情報収集フォーム実装
- **次のタスク**: 体癖診断システム実装（subagent活用）

## SuperClaude コマンド群（新規作成完了）

### 主要コマンド
- `/sc:implement` - 包括的機能実装
- `/sc:design` - システム設計・アーキテクチャ計画
- `/sc:improve` - コード改善・リファクタリング
- `/sc:troubleshoot` - 高度なトラブルシューティング
- `/sc:spawn` - 複雑ワークフローの自動化
- `/sc:task` - プロジェクト管理・タスク追跡
- `/sc:workflow` - 実装ワークフロー作成
- `/sc:index` - コマンド検索・推奨

### 利用可能な全22コマンド
```bash
ls ~/.claude/commands/sc*.md | sed 's|.*/||' | sed 's|\.md||'
# sc:analyze, sc:build, sc:checkpoint, sc:cleanup, sc:debug, sc:deploy,
# sc:design, sc:document, sc:estimate, sc:explain, sc:git, sc:implement,
# sc:improve, sc:index, sc:load, sc:review, sc:save, sc:spawn, sc:task,
# sc:test, sc:troubleshoot, sc:workflow
```

## 次のセッション開始方法

### Option 1: 直接実装開始
```bash
/sc:implement taiheki-diagnosis  # 体癖診断システム実装
```

### Option 2: 計画から開始
```bash
/sc:task feature                 # タスク管理・計画立案
/sc:workflow feature            # ワークフロー作成
/sc:implement taiheki-diagnosis # 実装実行
```

### Option 3: 設計から開始
```bash
/sc:design api                  # API設計
/sc:implement taiheki-diagnosis # 実装実行
```

## 重要な実装ファイル（変更なし）

### コアファイル
- `src/types/index.ts` - 型定義
- `src/lib/validations.ts` - バリデーション  
- `src/lib/zustand/diagnosis-store.ts` - 状態管理

### UIコンポーネント
- `src/ui/components/ui/` - 基本UIコンポーネント
- `src/ui/features/forms/basic-info-form.tsx` - 基本情報フォーム

### 設定ファイル  
- `package.json` - 依存関係
- `tsconfig.json` - TypeScript設定
- `tailwind.config.ts` - デザインシステム

## セッション継続時の注意点

1. **SuperClaude コマンドの活用**: 22個の新しいコマンドを積極的に使用
2. **SubAgent並行処理**: Task agentを使った効率的開発
3. **Git状態の確認**: 未コミット変更の確認
4. **型エラーの確認**: `npm run type-check`
5. **References/ファイルの分析継続**

## アーキテクチャ概要（変更なし）

```
src/
├── app/           # Next.js App Router
├── domain/        # ドメインロジック（理論別）  
├── application/   # ユースケース層
├── ui/           # プレゼンテーション層
├── infrastructure/# インフラストラクチャ層
├── lib/          # ユーティリティ・設定
└── types/        # TypeScript型定義
```

## 開発フェーズ

- **Phase 1**: 要件定義・設計 ✅
- **Phase 2**: 基盤実装・SuperClaudeセットアップ ✅
- **Phase 3**: 診断システム実装 🔄 (次のフェーズ)
- **Phase 4**: 統合・テスト ⏳

## SuperClaude Framework の効果

- **開発効率**: 包括的ワークフローによる効率化
- **品質保証**: 各段階での品質ゲートとバリデーション  
- **コード品質**: 自動化されたレビューと改善プロセス
- **プロジェクト管理**: 体系的なタスク管理とプランニング
- **トラブルシューティング**: 高度なデバッグと問題解決支援