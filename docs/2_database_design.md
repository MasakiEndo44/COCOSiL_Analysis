# COCOSiL データベース設計書

**バージョン**: v1.0  
**作成日**: 2025-11-05  
**DBMS**: PostgreSQL 15（Supabase）  
**設計方針**: 正規化、RLS（Row Level Security）による厳格なアクセス制御

---

## 📋 目次

1. [ER図](#1-er図)
2. [テーブル定義](#2-テーブル定義)
3. [インデックス設計](#3-インデックス設計)
4. [Row Level Security（RLS）](#4-row-level-securityrls)
5. [マイグレーション戦略](#5-マイグレーション戦略)
6. [パフォーマンス最適化](#6-パフォーマンス最適化)

---

## 1. ER図

### 1.1 エンティティ関係図（テキスト形式）

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │◀──┐
│ clerk_user_id   │   │
│ nickname        │   │
│ birth_date      │   │
│ created_at      │   │
│ updated_at      │   │
└─────────────────┘   │
                      │ 1:N
                      │
                      │
┌─────────────────────────┐
│  fortune_results        │
│─────────────────────────│
│ id (PK)                 │
│ user_id (FK)            │──┘
│ result_type             │
│ result_data (JSONB)     │
│ is_active               │
│ created_at              │
│ updated_at              │
└─────────────────────────┘

                      ┌──────────────────┐
                      │ diagnosis_settings│
                      │──────────────────│
                      │ id (PK)          │
┌─────────────────┐   │ user_id (FK)     │──┐
│     users       │◀──│ diagnosis_type   │  │ 1:N
│─────────────────│   │ is_enabled       │  │
│ id (PK)         │   │ created_at       │  │
│ ...             │   │ updated_at       │  │
└─────────────────┘   └──────────────────┘  │
        │                                    │
        │ 1:N                                │
        │                                    │
        ▼                                    │
┌─────────────────────┐                     │
│  chat_messages      │                     │
│─────────────────────│                     │
│ id (PK)             │                     │
│ user_id (FK)        │─────────────────────┘
│ role                │
│ content             │
│ token_count         │
│ created_at          │
└─────────────────────┘
        │ N:1
        │
        ▼
┌─────────────────────┐
│  chat_summaries     │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │──┐
│ summary_period_start│  │
│ summary_period_end  │  │
│ summary_content     │  │ 1:1
│ created_at          │  │
└─────────────────────┘  │
                         │
                         ▼
┌───────────────────────┐
│ learning_profiles     │
│───────────────────────│
│ id (PK)               │
│ user_id (FK) UNIQUE   │──┐
│ profile_data (JSONB)  │  │
│ communication_style   │  │
│ problem_solving       │  │ 1:1
│ values                │  │
│ emotional_patterns    │  │
│ confidence_score      │  │
│ last_updated_at       │  │
└───────────────────────┘  │
                           │
                           │
        ┌──────────────────┘
        │
┌───────▼─────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ ...             │
└─────────────────┘

┌─────────────────────┐
│ chat_usage_logs     │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │──┐
│ used_at             │  │ N:1
│ message_count       │  │
│ token_count         │  │
└─────────────────────┘  │
                         │
        ┌────────────────┘
        │
┌───────▼─────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ ...             │
└─────────────────┘
```

### 1.2 カーディナリティまとめ

| エンティティA | 関係 | エンティティB |
|-------------|------|--------------|
| users | 1:N | fortune_results |
| users | 1:N | diagnosis_settings |
| users | 1:N | chat_messages |
| users | 1:N | chat_summaries |
| users | 1:1 | learning_profiles |
| users | 1:N | chat_usage_logs |

---

## 2. テーブル定義

### 2.1 users（ユーザーマスタ）

**目的**: ユーザーの基本情報を管理

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
  nickname VARCHAR(50) NOT NULL,
  birth_date DATE NOT NULL,
  purpose VARCHAR(50),
  research_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);

-- コメント
COMMENT ON TABLE users IS 'ユーザーマスタ';
COMMENT ON COLUMN users.id IS 'ユーザーID（内部用UUID）';
COMMENT ON COLUMN users.clerk_user_id IS 'Clerk認証のユーザーID';
COMMENT ON COLUMN users.nickname IS 'ニックネーム（3-20文字）';
COMMENT ON COLUMN users.birth_date IS '生年月日（算命学系診断に使用）';
COMMENT ON COLUMN users.purpose IS '診断目的（self_understanding/relationships/career/growth/fun）';
COMMENT ON COLUMN users.research_consent IS '匿名データ研究利用への同意';
```

**制約**:
- `clerk_user_id`: UNIQUE（Clerkとの1:1対応）
- `nickname`: NOT NULL、3-50文字
- `birth_date`: NOT NULL、1930-01-01以降
- `purpose`: 任意、値: self_understanding / relationships / career / growth / fun
- `research_consent`: デフォルトFALSE

**サンプルデータ**:
```sql
INSERT INTO users (clerk_user_id, nickname, birth_date) VALUES
  ('user_2abc123xyz', '山田太郎', '1985-06-15'),
  ('user_3def456uvw', '佐藤花子', '1992-11-22');
```

---

### 2.2 fortune_results（診断結果）

**目的**: すべての診断結果を保存（算命学系・手動入力系）

```sql
CREATE TABLE fortune_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  result_type VARCHAR(50) NOT NULL,
  result_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_fortune_results_user_id ON fortune_results(user_id);
CREATE INDEX idx_fortune_results_type ON fortune_results(result_type);
CREATE INDEX idx_fortune_results_active ON fortune_results(is_active);

-- 複合インデックス（ユーザー×診断タイプの検索高速化）
CREATE INDEX idx_fortune_results_user_type 
  ON fortune_results(user_id, result_type);

-- JSONB検索用のGINインデックス
CREATE INDEX idx_fortune_results_data ON fortune_results USING GIN(result_data);

-- コメント
COMMENT ON TABLE fortune_results IS '診断結果（算命学系・手動入力系）';
COMMENT ON COLUMN fortune_results.result_type IS '診断タイプ（sanmeigaku/mbti/taiheki/big5）';
COMMENT ON COLUMN fortune_results.result_data IS '診断結果の詳細データ（JSON形式）';
COMMENT ON COLUMN fortune_results.is_active IS 'ONの場合true、OFFの場合false';
```

**result_typeの値**:
- `sanmeigaku`: 算命学系（動物占い、星座占い、六星占術）
- `mbti`: MBTI
- `taiheki`: 体癖論
- `big5`: Big5診断

> **注**: 9星気学（kyusei）は実装対象外

**result_dataのスキーマ例**:

```json
// 算命学系（sanmeigaku）
{
  "age": 39,
  "western_zodiac": "蟹座",
  "animal_character": "落ち着きのあるペガサス",
  "animal_details": {
    "baseAnimal": "ペガサス",
    "character": "落ち着きのあるペガサス",
    "color": "イエロー"
  },
  "six_star": "金星人+"
}

// MBTI
{
  "type": "INFP",
  "description": "仲介者型"
}

// 体癖論
{
  "primary": "3種",
  "secondary": "8種",
  "description": "消化器型（3種）+ 泌尿器型（8種）"
}

// Big5
{
  "openness": 75,
  "conscientiousness": 62,
  "extraversion": 45,
  "agreeableness": 80,
  "neuroticism": 38
}
```

**サンプルデータ**:
```sql
INSERT INTO fortune_results (user_id, result_type, result_data, is_active) VALUES
  (
    'user-uuid-1',
    'sanmeigaku',
    '{"age": 39, "western_zodiac": "蟹座", "animal_character": "落ち着きのあるペガサス", "six_star": "金星人+"}',
    TRUE
  ),
  (
    'user-uuid-1',
    'mbti',
    '{"type": "INFP", "description": "仲介者型"}',
    TRUE
  );
```

---

### 2.3 diagnosis_settings（診断設定）

**目的**: 各診断タイプのON/OFF状態を管理

```sql
CREATE TABLE diagnosis_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diagnosis_type VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ユーザー×診断タイプの組み合わせは一意
  CONSTRAINT unique_user_diagnosis UNIQUE(user_id, diagnosis_type)
);

-- インデックス
CREATE INDEX idx_diagnosis_settings_user_id ON diagnosis_settings(user_id);
CREATE INDEX idx_diagnosis_settings_enabled ON diagnosis_settings(is_enabled);

-- コメント
COMMENT ON TABLE diagnosis_settings IS '診断タイプのON/OFF設定';
COMMENT ON COLUMN diagnosis_settings.diagnosis_type IS '診断タイプ（fortune_resultsのresult_typeと対応）';
COMMENT ON COLUMN diagnosis_settings.is_enabled IS 'true=ON（AIの学習対象）、false=OFF（非表示）';
```

**デフォルト設定**: 新規ユーザーには算命学系のみON

```sql
-- ユーザー登録時に自動的に挿入
INSERT INTO diagnosis_settings (user_id, diagnosis_type, is_enabled) VALUES
  ('new-user-uuid', 'sanmeigaku', TRUE);
```

---

### 2.4 chat_messages（チャット履歴）

**目的**: ユーザーとAIのチャット履歴を保存

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- 複合インデックス（ユーザー×日時での効率的な取得）
CREATE INDEX idx_chat_messages_user_created 
  ON chat_messages(user_id, created_at DESC);

-- コメント
COMMENT ON TABLE chat_messages IS 'AIチャット履歴';
COMMENT ON COLUMN chat_messages.role IS 'メッセージ送信者（user/assistant/system）';
COMMENT ON COLUMN chat_messages.content IS 'メッセージ内容';
COMMENT ON COLUMN chat_messages.token_count IS 'トークン数（コスト管理用）';
```

**データ保持ポリシー**:
- 最新20件: 永続保存
- それ以前: バッチ処理で要約後、削除

**サンプルデータ**:
```sql
INSERT INTO chat_messages (user_id, role, content, token_count) VALUES
  ('user-uuid-1', 'user', 'こんにちは', 5),
  ('user-uuid-1', 'assistant', 'こんにちは！診断結果を基に、あなたの性格について話しましょう。', 25);
```

---

### 2.5 chat_summaries（チャット要約）

**目的**: 古いチャット履歴の要約を保存

```sql
CREATE TABLE chat_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_period_start DATE NOT NULL,
  summary_period_end DATE NOT NULL,
  summary_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_chat_summaries_user_id ON chat_summaries(user_id);
CREATE INDEX idx_chat_summaries_period ON chat_summaries(summary_period_start, summary_period_end);

-- コメント
COMMENT ON TABLE chat_summaries IS 'チャット履歴の要約';
COMMENT ON COLUMN chat_summaries.summary_period_start IS '要約対象期間の開始日';
COMMENT ON COLUMN chat_summaries.summary_period_end IS '要約対象期間の終了日';
COMMENT ON COLUMN chat_summaries.summary_content IS '要約内容（JSON形式）';
```

**summary_contentのスキーマ**:
```json
{
  "summary_period": "2025-11-01 to 2025-11-05",
  "topics_discussed": [
    "キャリア選択の悩み",
    "対人関係の課題"
  ],
  "key_insights": [
    "ユーザーは転職を検討中",
    "上司との関係に悩んでいる"
  ],
  "emotional_tone": "不安と希望が混在",
  "message_count": 15
}
```

---

### 2.6 learning_profiles（学習プロファイル）

**目的**: AIがチャットから学習したユーザーの性格特性を保存

```sql
CREATE TABLE learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL,
  communication_style TEXT,
  problem_solving TEXT,
  values TEXT,
  emotional_patterns TEXT,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_learning_profiles_user_id ON learning_profiles(user_id);
CREATE INDEX idx_learning_profiles_updated ON learning_profiles(last_updated_at DESC);

-- JSONB検索用のGINインデックス
CREATE INDEX idx_learning_profiles_data ON learning_profiles USING GIN(profile_data);

-- コメント
COMMENT ON TABLE learning_profiles IS 'AIが学習したユーザープロファイル';
COMMENT ON COLUMN learning_profiles.profile_data IS '完全な学習データ（JSON形式）';
COMMENT ON COLUMN learning_profiles.communication_style IS 'コミュニケーションスタイルの要約';
COMMENT ON COLUMN learning_profiles.problem_solving IS '問題解決アプローチの要約';
COMMENT ON COLUMN learning_profiles.values IS '価値観・関心事の要約';
COMMENT ON COLUMN learning_profiles.emotional_patterns IS '感情パターンの要約';
COMMENT ON COLUMN learning_profiles.confidence_score IS '学習の信頼度（0.0-1.0）';
```

**profile_dataのスキーマ**:
```json
{
  "communication": {
    "style": "内向的",
    "preferences": ["文章での表現", "深い対話"],
    "strengths": ["傾聴力", "共感力"],
    "challenges": ["初対面の緊張", "大人数の場"]
  },
  "thinking": {
    "type": "論理的・体系的",
    "decision_making": "データ重視",
    "problem_solving": "分析的アプローチ"
  },
  "relationships": {
    "style": "少数の親しい友人",
    "values": ["信頼", "誠実さ"],
    "conflict_resolution": "対話重視"
  },
  "growth_areas": [
    "自己主張",
    "ストレス管理"
  ],
  "updated_from": {
    "chat_count": 25,
    "summary_count": 2,
    "last_chat_date": "2025-11-05"
  }
}
```

---

### 2.7 chat_usage_logs（チャット利用ログ）

**目的**: チャット利用回数とコスト管理

```sql
CREATE TABLE chat_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 1,
  token_count INTEGER,
  cost_usd DECIMAL(10, 6)
);

-- インデックス
CREATE INDEX idx_chat_usage_user_id ON chat_usage_logs(user_id);
CREATE INDEX idx_chat_usage_used_at ON chat_usage_logs(used_at DESC);

-- 月次集計用の複合インデックス
CREATE INDEX idx_chat_usage_user_month 
  ON chat_usage_logs(user_id, DATE_TRUNC('month', used_at));

-- コメント
COMMENT ON TABLE chat_usage_logs IS 'チャット利用ログ（回数制限・コスト管理）';
COMMENT ON COLUMN chat_usage_logs.message_count IS '送信メッセージ数（通常1）';
COMMENT ON COLUMN chat_usage_logs.token_count IS '使用トークン数';
COMMENT ON COLUMN chat_usage_logs.cost_usd IS '推定コスト（USD）';
```

**月次利用回数の取得**:
```sql
-- ユーザーの今月の利用回数を取得
SELECT COUNT(*) as usage_count
FROM chat_usage_logs
WHERE user_id = 'user-uuid'
  AND used_at >= DATE_TRUNC('month', NOW())
  AND used_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
```

---

## 3. インデックス設計

### 3.1 主要クエリパターンとインデックス

| クエリパターン | 対象テーブル | インデックス |
|-------------|------------|------------|
| ユーザーIDでデータ取得 | すべて | `user_id` 単一インデックス |
| 診断タイプ別検索 | fortune_results | `(user_id, result_type)` 複合 |
| 最新チャット取得 | chat_messages | `(user_id, created_at DESC)` 複合 |
| 月次利用回数集計 | chat_usage_logs | `(user_id, DATE_TRUNC('month', used_at))` 複合 |
| JSONB検索 | fortune_results, learning_profiles | GINインデックス |

### 3.2 インデックス一覧

```sql
-- users
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);

-- fortune_results
CREATE INDEX idx_fortune_results_user_id ON fortune_results(user_id);
CREATE INDEX idx_fortune_results_type ON fortune_results(result_type);
CREATE INDEX idx_fortune_results_active ON fortune_results(is_active);
CREATE INDEX idx_fortune_results_user_type ON fortune_results(user_id, result_type);
CREATE INDEX idx_fortune_results_data ON fortune_results USING GIN(result_data);

-- diagnosis_settings
CREATE INDEX idx_diagnosis_settings_user_id ON diagnosis_settings(user_id);
CREATE INDEX idx_diagnosis_settings_enabled ON diagnosis_settings(is_enabled);

-- chat_messages
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_user_created ON chat_messages(user_id, created_at DESC);

-- chat_summaries
CREATE INDEX idx_chat_summaries_user_id ON chat_summaries(user_id);
CREATE INDEX idx_chat_summaries_period ON chat_summaries(summary_period_start, summary_period_end);

-- learning_profiles
CREATE INDEX idx_learning_profiles_user_id ON learning_profiles(user_id);
CREATE INDEX idx_learning_profiles_updated ON learning_profiles(last_updated_at DESC);
CREATE INDEX idx_learning_profiles_data ON learning_profiles USING GIN(profile_data);

-- chat_usage_logs
CREATE INDEX idx_chat_usage_user_id ON chat_usage_logs(user_id);
CREATE INDEX idx_chat_usage_used_at ON chat_usage_logs(used_at DESC);
CREATE INDEX idx_chat_usage_user_month ON chat_usage_logs(user_id, DATE_TRUNC('month', used_at));
```

---

## 4. Row Level Security（RLS）

### 4.1 RLS有効化

```sql
-- すべてのテーブルでRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortune_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_usage_logs ENABLE ROW LEVEL SECURITY;
```

### 4.2 RLSポリシー定義

#### 4.2.1 users テーブル

```sql
-- ユーザーは自分のレコードのみ閲覧可能
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (auth.uid()::text = clerk_user_id);

-- ユーザーは自分のレコードのみ更新可能
CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (auth.uid()::text = clerk_user_id);

-- 新規ユーザーは自分のレコードを作成可能
CREATE POLICY "Users can insert own record"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = clerk_user_id);

-- ユーザーは自分のレコードを削除可能（アカウント削除）
CREATE POLICY "Users can delete own record"
  ON users FOR DELETE
  USING (auth.uid()::text = clerk_user_id);
```

#### 4.2.2 fortune_results テーブル

```sql
-- ユーザーは自分の診断結果のみ閲覧可能
CREATE POLICY "Users can view own fortune results"
  ON fortune_results FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- ユーザーは自分の診断結果を追加可能
CREATE POLICY "Users can insert own fortune results"
  ON fortune_results FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- ユーザーは自分の診断結果を更新可能
CREATE POLICY "Users can update own fortune results"
  ON fortune_results FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );
```

#### 4.2.3 chat_messages テーブル

```sql
-- ユーザーは自分のチャット履歴のみ閲覧可能
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- ユーザーは自分のチャットメッセージを追加可能
CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );
```

#### 4.2.4 その他テーブルも同様のポリシー

```sql
-- diagnosis_settings
CREATE POLICY "Users can manage own diagnosis settings"
  ON diagnosis_settings FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- chat_summaries
CREATE POLICY "Users can view own chat summaries"
  ON chat_summaries FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- learning_profiles
CREATE POLICY "Users can view own learning profile"
  ON learning_profiles FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- chat_usage_logs
CREATE POLICY "Users can view own usage logs"
  ON chat_usage_logs FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );
```

### 4.3 サービスロール用ポリシー

```sql
-- バッチ処理用（Supabase Edge Functions）のポリシー
-- サービスロールキーを使用する場合はRLSをバイパス可能

-- 例: バッチ処理でチャット要約を生成する際
-- サービスロールキーで実行すればRLS無視で全ユーザーにアクセス可能
```

---

## 5. マイグレーション戦略

### 5.1 初期マイグレーション

```sql
-- migration_001_initial_schema.sql

-- 1. テーブル作成
CREATE TABLE users (...);
CREATE TABLE fortune_results (...);
CREATE TABLE diagnosis_settings (...);
CREATE TABLE chat_messages (...);
CREATE TABLE chat_summaries (...);
CREATE TABLE learning_profiles (...);
CREATE TABLE chat_usage_logs (...);

-- 2. インデックス作成
CREATE INDEX ...;

-- 3. RLS有効化とポリシー作成
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...;

-- 4. トリガー作成（updated_at自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fortune_results_updated_at BEFORE UPDATE ON fortune_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diagnosis_settings_updated_at BEFORE UPDATE ON diagnosis_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 マイグレーションファイル構成

```
supabase/migrations/
├── 20251105_001_initial_schema.sql
├── 20251105_002_seed_data.sql（開発環境用）
└── 20260115_003_add_premium_features.sql（Phase 4: プレミアム機能）
```

### 5.3 ロールバック戦略

```sql
-- 各マイグレーションにはロールバックSQLを用意

-- migration_001_initial_schema_rollback.sql
DROP TABLE IF EXISTS chat_usage_logs CASCADE;
DROP TABLE IF EXISTS learning_profiles CASCADE;
DROP TABLE IF EXISTS chat_summaries CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS diagnosis_settings CASCADE;
DROP TABLE IF EXISTS fortune_results CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

---

## 6. パフォーマンス最適化

### 6.1 VACUUM設定

```sql
-- 定期的なVACUUM実行（Supabaseが自動実行）
-- 必要に応じて手動実行

VACUUM ANALYZE users;
VACUUM ANALYZE fortune_results;
VACUUM ANALYZE chat_messages;
```

### 6.2 パーティショニング（将来的）

```sql
-- chat_messagesが大量になった場合は月次パーティショニング

CREATE TABLE chat_messages_2025_11 PARTITION OF chat_messages
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE chat_messages_2025_12 PARTITION OF chat_messages
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
```

### 6.3 クエリ最適化

```sql
-- EXPLAINで実行計画確認

EXPLAIN ANALYZE
SELECT * FROM fortune_results
WHERE user_id = 'some-uuid'
  AND result_type = 'sanmeigaku'
  AND is_active = TRUE;

-- 必要に応じてインデックス追加・調整
```

---

## 付録A: 便利なビュー

### A.1 ユーザー診断サマリービュー

```sql
CREATE OR REPLACE VIEW user_diagnosis_summary AS
SELECT 
  u.id,
  u.nickname,
  u.birth_date,
  COUNT(DISTINCT fr.result_type) as diagnosis_count,
  ARRAY_AGG(DISTINCT fr.result_type) FILTER (WHERE fr.is_active = TRUE) as active_diagnoses,
  MAX(fr.updated_at) as last_diagnosis_update
FROM users u
LEFT JOIN fortune_results fr ON u.id = fr.user_id
GROUP BY u.id, u.nickname, u.birth_date;
```

### A.2 月次チャット利用状況ビュー

```sql
CREATE OR REPLACE VIEW monthly_chat_usage AS
SELECT 
  u.id as user_id,
  u.nickname,
  DATE_TRUNC('month', cul.used_at) as month,
  COUNT(*) as usage_count,
  SUM(cul.token_count) as total_tokens,
  SUM(cul.cost_usd) as total_cost
FROM users u
LEFT JOIN chat_usage_logs cul ON u.id = cul.user_id
GROUP BY u.id, u.nickname, DATE_TRUNC('month', cul.used_at);
```

---

## 付録B: テストデータ生成

```sql
-- 開発環境用のテストデータ

-- ユーザー作成
INSERT INTO users (clerk_user_id, nickname, birth_date) VALUES
  ('test_user_001', 'テストユーザー1', '1985-06-15'),
  ('test_user_002', 'テストユーザー2', '1992-11-22'),
  ('test_user_003', 'テストユーザー3', '2000-03-10');

-- 診断結果作成
INSERT INTO fortune_results (user_id, result_type, result_data, is_active)
SELECT 
  u.id,
  'sanmeigaku',
  jsonb_build_object(
    'age', EXTRACT(YEAR FROM AGE(u.birth_date)),
    'western_zodiac', '蟹座',
    'animal_character', '落ち着きのあるペガサス',
    'six_star', '金星人+'
  ),
  TRUE
FROM users u WHERE clerk_user_id LIKE 'test_user%';

-- チャットメッセージ作成（サンプル）
INSERT INTO chat_messages (user_id, role, content)
SELECT 
  u.id,
  'user',
  'こんにちは、よろしくお願いします'
FROM users u WHERE clerk_user_id LIKE 'test_user%';
```

---

**文書バージョン**: v1.0  
**最終更新**: 2025-11-05  
**次回レビュー**: 開発開始時
