# Legacy Fortune System Archive

## アーカイブ日時
2025年9月13日

## アーカイブ理由
算命学APIをAPIv2（precision-calculator使用）に全面移行したため、以下のレガシーコンポーネントをアーカイブしました。

## アーカイブ内容

### 1. calculator.ts
- **元のパス**: `src/lib/fortune/calculator.ts`
- **説明**: 基本的な12動物計算ロジック
- **使用箇所**: 
  - `src/ui/features/diagnosis/results.tsx`
  - `src/__tests__/lib/fortune/calculator.test.ts`

### 2. CSV Database（動物占い&6星占術計算）
- **元のパス**: `References/動物占い&6星占術計算/`
- **説明**: 1960-2025年の完全なルックアップテーブル
- **ファイル**:
  - `doubutsu_rokusei_full_lookup_1960_2025.csv`
  - その他関連ファイル

## 移行完了内容

### 新システム
- **APIエンドポイント**: `/api/fortune-calc` → precision-calculator使用
- **計算エンジン**: `src/lib/fortune/precision-calculator.ts`
- **機能**: 60種動物キャラクター対応、Edge Runtime最適化

### 影響を受けるファイル
- `src/app/api/fortune-calc/route.ts` - 完全に書き換え
- テストファイル群 - 新APIに対応が必要

## 復元方法
必要に応じて、このアーカイブから元のファイルを復元可能です。

## 注意事項
- レガシーシステムに依存するテストは更新が必要
- フロントエンドコンポーネントは新APIに対応済み