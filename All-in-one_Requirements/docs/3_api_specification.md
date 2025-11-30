# COCOSiL API仕様書

**バージョン**: v1.0  
**作成日**: 2025-11-05  
**ベースURL**: `https://cocosil.app/api`  
**認証方式**: Clerk JWTトークン

---

## 📋 目次

1. [API概要](#1-api概要)
2. [認証](#2-認証)
3. [エンドポイント一覧](#3-エンドポイント一覧)
4. [詳細仕様](#4-詳細仕様)
5. [エラーハンドリング](#5-エラーハンドリング)
6. [レート制限](#6-レート制限)

---

## 1. API概要

### 1.1 設計原則

- **RESTful API**: リソースベースのURL設計
- **JSON形式**: すべてのリクエスト/レスポンスはJSON
- **ステートレス**: セッション状態はClerk JWTで管理
- **バージョニング**: 将来的に `/api/v2` 等でバージョン管理

### 1.2 共通レスポンス形式

**成功時**:
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2025-11-05T12:00:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**エラー時**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": { ... }
  },
  "metadata": {
    "timestamp": "2025-11-05T12:00:00.000Z",
    "requestId": "req_abc123"
  }
}
```

---

## 2. 認証

### 2.1 認証方式

すべてのAPIリクエストには、Clerk発行のJWTトークンが必要です。

**ヘッダー**:
```
Authorization: Bearer <clerk_jwt_token>
```

### 2.2 トークン取得

```typescript
// フロントエンド（Next.js）での実装例
import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();
const token = await getToken();

const response = await fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### 2.3 認証エラー

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```

---

## 3. エンドポイント一覧

### 3.1 ユーザー関連

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|-----|
| GET | `/api/users/me` | 自分のユーザー情報取得 | ✅ |
| PUT | `/api/users/me` | 自分のユーザー情報更新 | ✅ |
| DELETE | `/api/users/me` | アカウント削除 | ✅ |
| GET | `/api/users/me/export` | データエクスポート | ✅ |

### 3.2 診断関連

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|-----|
| POST | `/api/fortune/calculate` | 算命学系診断実行 | ✅ |
| GET | `/api/fortune/results` | すべての診断結果取得 | ✅ |
| GET | `/api/fortune/results/:type` | 特定診断結果取得 | ✅ |
| POST | `/api/fortune/results` | 手動診断結果追加 | ✅ |
| PUT | `/api/fortune/results/:id` | 診断結果更新 | ✅ |

### 3.3 診断設定関連

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|-----|
| GET | `/api/diagnosis/settings` | 診断設定一覧取得 | ✅ |
| PUT | `/api/diagnosis/settings/:type` | 診断ON/OFF切り替え | ✅ |

### 3.4 AIチャット関連

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|-----|
| POST | `/api/chat/messages` | メッセージ送信 | ✅ |
| GET | `/api/chat/messages` | チャット履歴取得 | ✅ |
| GET | `/api/chat/usage` | 利用回数取得 | ✅ |

### 3.5 学習プロファイル関連

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|-----|
| GET | `/api/learning/profile` | 学習プロファイル取得 | ✅ |

---

## 4. 詳細仕様

### 4.1 ユーザー関連API

#### 4.1.1 GET /api/users/me

**説明**: ログイン中のユーザー情報を取得

**リクエスト**:
```
GET /api/users/me
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "clerk_user_id": "user_2abc123xyz",
    "nickname": "山田太郎",
    "birth_date": "1985-06-15",
    "age": 39,
    "created_at": "2025-11-01T10:00:00.000Z",
    "updated_at": "2025-11-05T12:00:00.000Z"
  }
}
```

---

#### 4.1.2 PUT /api/users/me

**説明**: ユーザー情報を更新

**リクエスト**:
```json
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "山田太郎（更新）",
  "birth_date": "1985-06-16"
}
```

**バリデーション**:
- `nickname`: 3-50文字
- `birth_date`: YYYY-MM-DD形式、1930-01-01以降

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nickname": "山田太郎（更新）",
    "birth_date": "1985-06-16",
    "updated_at": "2025-11-05T13:00:00.000Z"
  },
  "metadata": {
    "recalculated_fortune": true
  }
}
```

**注**: 生年月日を変更した場合、算命学系診断が自動再実行されます。

---

#### 4.1.3 DELETE /api/users/me

**説明**: アカウントと全データを削除

**リクエスト**:
```
DELETE /api/users/me
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "message": "アカウントが削除されました",
    "deleted_at": "2025-11-05T14:00:00.000Z"
  }
}
```

**処理内容**:
1. Supabaseの全関連データ削除（CASCADE）
2. Clerkアカウント削除
3. セッション破棄

---

#### 4.1.4 GET /api/users/me/export

**説明**: ユーザーのすべてのデータをエクスポート

**リクエスト**:
```
GET /api/users/me/export?format=json
Authorization: Bearer <token>
```

**クエリパラメータ**:
- `format`: `json` or `csv`（デフォルト: `json`）

**レスポンス（JSON）**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nickname": "山田太郎",
      "birth_date": "1985-06-15"
    },
    "fortune_results": [ ... ],
    "chat_messages": [ ... ],
    "learning_profile": { ... },
    "export_date": "2025-11-05T15:00:00.000Z"
  }
}
```

**レスポンス（CSV）**:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="cocosil_export_20251105.csv"

[CSV形式のデータ]
```

---

### 4.2 診断関連API

#### 4.2.1 POST /api/fortune/calculate

**説明**: 生年月日から算命学系診断を実行

**リクエスト**:
```json
POST /api/fortune/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "birth_date": "1985-06-15"
}
```

**バリデーション**:
- `birth_date`: YYYY-MM-DD形式、1930-01-01 ~ 2025-12-31

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "age": 39,
    "western_zodiac": "双子座",
    "animal_character": "落ち着きのあるペガサス",
    "animal_details": {
      "baseAnimal": "ペガサス",
      "character": "落ち着きのあるペガサス",
      "color": "イエロー"
    },
    "six_star": "金星人+",
    "calculated_at": "2025-11-05T16:00:00.000Z"
  }
}
```

**エラー例**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE",
    "message": "対応していない年度です",
    "details": {
      "supported_range": "1930-01-01 ~ 2025-12-31"
    }
  }
}
```

---

#### 4.2.2 GET /api/fortune/results

**説明**: すべての診断結果を取得

**リクエスト**:
```
GET /api/fortune/results
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "result-uuid-1",
      "result_type": "sanmeigaku",
      "result_data": {
        "age": 39,
        "western_zodiac": "双子座",
        "animal_character": "落ち着きのあるペガサス",
        "six_star": "金星人+"
      },
      "is_active": true,
      "created_at": "2025-11-01T10:00:00.000Z",
      "updated_at": "2025-11-05T12:00:00.000Z"
    },
    {
      "id": "result-uuid-2",
      "result_type": "mbti",
      "result_data": {
        "type": "INFP",
        "description": "仲介者型"
      },
      "is_active": true,
      "created_at": "2025-11-02T14:00:00.000Z",
      "updated_at": "2025-11-02T14:00:00.000Z"
    }
  ]
}
```

---

#### 4.2.3 GET /api/fortune/results/:type

**説明**: 特定の診断タイプの結果を取得

**リクエスト**:
```
GET /api/fortune/results/mbti
Authorization: Bearer <token>
```

**パスパラメータ**:
- `type`: `sanmeigaku` | `mbti` | `taiheki` | `big5`

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "result-uuid-2",
    "result_type": "mbti",
    "result_data": {
      "type": "INFP",
      "description": "仲介者型"
    },
    "is_active": true,
    "created_at": "2025-11-02T14:00:00.000Z",
    "updated_at": "2025-11-02T14:00:00.000Z"
  }
}
```

**エラー（結果が存在しない場合）**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "診断結果が見つかりません"
  }
}
```

---

#### 4.2.4 POST /api/fortune/results

**説明**: 手動診断結果を追加

**リクエスト例（MBTI）**:
```json
POST /api/fortune/results
Authorization: Bearer <token>
Content-Type: application/json

{
  "result_type": "mbti",
  "result_data": {
    "type": "INFP",
    "description": "仲介者型"
  }
}
```

**リクエスト例（体癖論）**:
```json
{
  "result_type": "taiheki",
  "result_data": {
    "primary": "3種",
    "secondary": "8種",
    "description": "消化器型（3種）+ 泌尿器型（8種）"
  }
}
```

**リクエスト例（Big5）**:
```json
{
  "result_type": "big5",
  "result_data": {
    "openness": 75,
    "conscientiousness": 62,
    "extraversion": 45,
    "agreeableness": 80,
    "neuroticism": 38
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "new-result-uuid",
    "result_type": "mbti",
    "result_data": { ... },
    "is_active": true,
    "created_at": "2025-11-05T17:00:00.000Z"
  }
}
```

---

#### 4.2.5 PUT /api/fortune/results/:id

**説明**: 診断結果を更新

**リクエスト**:
```json
PUT /api/fortune/results/result-uuid-2
Authorization: Bearer <token>
Content-Type: application/json

{
  "result_data": {
    "type": "INTJ",
    "description": "建築家型"
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "result-uuid-2",
    "result_type": "mbti",
    "result_data": {
      "type": "INTJ",
      "description": "建築家型"
    },
    "is_active": true,
    "updated_at": "2025-11-05T18:00:00.000Z"
  }
}
```

---

### 4.3 診断設定関連API

#### 4.3.1 GET /api/diagnosis/settings

**説明**: 診断設定一覧を取得

**リクエスト**:
```
GET /api/diagnosis/settings
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "setting-uuid-1",
      "diagnosis_type": "sanmeigaku",
      "is_enabled": true,
      "updated_at": "2025-11-01T10:00:00.000Z"
    },
    {
      "id": "setting-uuid-2",
      "diagnosis_type": "mbti",
      "is_enabled": true,
      "updated_at": "2025-11-02T14:00:00.000Z"
    },
    {
      "id": "setting-uuid-3",
      "diagnosis_type": "taiheki",
      "is_enabled": false,
      "updated_at": "2025-11-03T09:00:00.000Z"
    }
  ]
}
```

---

#### 4.3.2 PUT /api/diagnosis/settings/:type

**説明**: 診断タイプのON/OFFを切り替え

**リクエスト**:
```json
PUT /api/diagnosis/settings/mbti
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_enabled": false
}
```

**パスパラメータ**:
- `type`: 診断タイプ（`sanmeigaku`, `mbti`, `taiheki`, `big5`）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "setting-uuid-2",
    "diagnosis_type": "mbti",
    "is_enabled": false,
    "updated_at": "2025-11-05T19:00:00.000Z"
  }
}
```

**バリデーション**:
- 最低1つの診断タイプはONが必要

**エラー（すべてOFFにしようとした場合）**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "最低1つの診断タイプを有効にする必要があります"
  }
}
```

---

### 4.4 AIチャット関連API

#### 4.4.1 POST /api/chat/messages

**説明**: メッセージを送信し、AI応答を取得

**リクエスト**:
```json
POST /api/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "こんにちは、自己紹介をしてください"
}
```

**レスポンス（ストリーミング）**:
```
Content-Type: text/event-stream

data: {"type": "start"}

data: {"type": "token", "content": "こんにちは"}

data: {"type": "token", "content": "！"}

data: {"type": "token", "content": "診断結果を基に"}

...

data: {"type": "end", "message_id": "msg-uuid"}
```

**レスポンス（非ストリーミング）**:
```json
{
  "success": true,
  "data": {
    "message_id": "msg-uuid",
    "role": "assistant",
    "content": "こんにちは！診断結果を基に、あなたの性格について話しましょう。",
    "token_count": 25,
    "created_at": "2025-11-05T20:00:00.000Z"
  },
  "metadata": {
    "remaining_usage": 7
  }
}
```

**エラー（利用上限到達）**:
```json
{
  "success": false,
  "error": {
    "code": "USAGE_LIMIT_EXCEEDED",
    "message": "今月の利用上限（10回）に達しました",
    "details": {
      "limit": 10,
      "used": 10,
      "reset_at": "2025-12-01T00:00:00.000Z"
    }
  }
}
```

---

#### 4.4.2 GET /api/chat/messages

**説明**: チャット履歴を取得

**リクエスト**:
```
GET /api/chat/messages?limit=20&offset=0
Authorization: Bearer <token>
```

**クエリパラメータ**:
- `limit`: 取得件数（デフォルト: 20、最大: 100）
- `offset`: オフセット（ページネーション用）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-uuid-1",
        "role": "user",
        "content": "こんにちは",
        "created_at": "2025-11-05T20:00:00.000Z"
      },
      {
        "id": "msg-uuid-2",
        "role": "assistant",
        "content": "こんにちは！診断結果を基に...",
        "created_at": "2025-11-05T20:00:01.000Z"
      }
    ],
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

---

#### 4.4.3 GET /api/chat/usage

**説明**: 今月のチャット利用回数を取得

**リクエスト**:
```
GET /api/chat/usage
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "current_month": "2025-11",
    "usage_count": 3,
    "limit": 10,
    "remaining": 7,
    "reset_at": "2025-12-01T00:00:00.000Z"
  }
}
```

---

### 4.5 学習プロファイル関連API

#### 4.5.1 GET /api/learning/profile

**説明**: AIが学習したユーザープロファイルを取得

**リクエスト**:
```
GET /api/learning/profile
Authorization: Bearer <token>
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "profile-uuid",
    "user_id": "user-uuid",
    "profile_data": {
      "communication": {
        "style": "内向的",
        "preferences": ["文章での表現", "深い対話"],
        "strengths": ["傾聴力", "共感力"]
      },
      "thinking": {
        "type": "論理的・体系的",
        "decision_making": "データ重視"
      },
      "relationships": {
        "style": "少数の親しい友人",
        "values": ["信頼", "誠実さ"]
      }
    },
    "communication_style": "内向的で深い対話を好む",
    "problem_solving": "論理的・体系的に分析",
    "values": "信頼と誠実さを重視",
    "emotional_patterns": "感情の起伏は穏やか",
    "confidence_score": 0.75,
    "last_updated_at": "2025-11-05T03:00:00.000Z"
  }
}
```

**エラー（プロファイル未生成）**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "学習プロファイルがまだ生成されていません",
    "details": {
      "required_messages": 5,
      "current_messages": 2
    }
  }
}
```

---

## 5. エラーハンドリング

### 5.1 標準エラーコード

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| `UNAUTHORIZED` | 401 | 認証が必要 |
| `FORBIDDEN` | 403 | アクセス権限なし |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `VALIDATION_ERROR` | 400 | バリデーションエラー |
| `USAGE_LIMIT_EXCEEDED` | 429 | 利用上限超過 |
| `INVALID_DATE` | 400 | 日付フォーマット不正 |
| `DATABASE_ERROR` | 500 | データベースエラー |
| `EXTERNAL_API_ERROR` | 502 | 外部API（OpenAI等）エラー |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

### 5.2 エラーレスポンス形式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": {
      "field": "birth_date",
      "issue": "対応年度範囲外",
      "supported_range": "1930-01-01 ~ 2025-12-31"
    }
  },
  "metadata": {
    "timestamp": "2025-11-05T21:00:00.000Z",
    "requestId": "req_abc123"
  }
}
```

### 5.3 バリデーションエラー詳細

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": {
      "errors": [
        {
          "field": "nickname",
          "message": "3-50文字で入力してください",
          "value": "ab"
        },
        {
          "field": "birth_date",
          "message": "YYYY-MM-DD形式で入力してください",
          "value": "1985/06/15"
        }
      ]
    }
  }
}
```

---

## 6. レート制限

### 6.1 一般APIのレート制限

```yaml
制限:
  - 100リクエスト/分/ユーザー

レスポンスヘッダー:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1699200000
```

**超過時のレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエスト制限を超過しました",
    "details": {
      "limit": 100,
      "reset_at": "2025-11-05T21:01:00.000Z"
    }
  }
}
```

### 6.2 AIチャットのレート制限

```yaml
制限:
  - 10回/月/ユーザー（送信ボタン押下時にカウント）

確認方法:
  GET /api/chat/usage
```

---

## 付録A: Next.js実装例

### A.1 APIルートの基本構造

```typescript
// app/api/users/me/route.ts

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // 認証確認
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    // Supabaseクライアント作成
    const supabase = createClient();

    // データ取得
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'サーバーエラーが発生しました',
        },
      },
      { status: 500 }
    );
  }
}
```

### A.2 フロントエンドからの呼び出し

```typescript
// lib/api/users.ts

export async function fetchUserProfile() {
  const response = await fetch('/api/users/me');
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}

export async function updateUserProfile(updates: { nickname?: string; birth_date?: string }) {
  const response = await fetch('/api/users/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}
```

---

## 付録B: テストケース例

```typescript
// __tests__/api/users.test.ts

import { describe, it, expect } from '@jest/globals';

describe('GET /api/users/me', () => {
  it('認証済みユーザーの情報を取得できる', async () => {
    const response = await fetch('/api/users/me', {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('nickname');
  });

  it('未認証の場合は401エラー', async () => {
    const response = await fetch('/api/users/me');

    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });
});
```

---

**文書バージョン**: v1.0  
**最終更新**: 2025-11-05  
**次回レビュー**: 開発開始時
