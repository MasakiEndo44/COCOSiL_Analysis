// OpenAI API統合クライアント
import OpenAI from 'openai';
import type { UserDiagnosisData } from '@/types';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenAIClient {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(
    model: 'gpt-4o-mini' | 'gpt-4o',
    messages: OpenAIMessage[],
    options: {
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: 'json_object' };
    } = {}
  ): Promise<OpenAIResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1500,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 性格キーワードから自然な日本語文章を生成
  async generatePersonalityText(
    type: 'catchphrase' | 'interpersonal' | 'behavioral',
    keywords: string[],
    context?: {
      name?: string;
      mbtiType?: string;
      taihekiType?: string;
    }
  ): Promise<string> {
    const typePrompts = {
      catchphrase: {
        instruction: 'キャッチフレーズとして、その人の核となる特徴を一言で表現',
        format: '「〇〇な人」という形式で、15-25文字程度',
        example: '「創造性と集中力で道を切り開く人」'
      },
      interpersonal: {
        instruction: '対人関係における特徴や振る舞いを自然に表現',
        format: '30-50文字程度の自然な文章',
        example: '深い関係性を重視し、誠実なコミュニケーションで信頼を築きます'
      },
      behavioral: {
        instruction: '思考パターンや行動特性を具体的に表現',
        format: '30-50文字程度の自然な文章',
        example: '論理的に分析してから、計画的に効率よく行動に移します'
      }
    };

    const prompt = typePrompts[type];
    const keywordList = keywords.filter(k => k).join('、');
    
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `あなたは、与えられたキーワードを元に、自然で流暢な日本語の文章を作成するアシスタントです。

【重要な指示】
- キーワードを適切に組み合わせて、${prompt.instruction}してください
- ${prompt.format}で作成してください
- 医療的な診断や断定的な表現は避け、「〜する傾向があります」「〜な面があります」などの表現を使用
- キーワード同士の関連性を考慮し、自然な接続詞や語順で文章を構成
- 日本語として自然で読みやすい文章にしてください

【出力例】
${prompt.example}`
      },
      {
        role: 'user',
        content: `以下のキーワードを使用して文章を生成してください：

キーワード: ${keywordList}

${context ? `
参考情報:
- MBTI: ${context.mbtiType || '不明'}
- 体癖: ${context.taihekiType || '不明'}種
` : ''}

上記のキーワードを自然に組み合わせた${type === 'catchphrase' ? 'キャッチフレーズ' : '特徴文'}を生成してください。`
      }
    ];

    const response = await this.makeRequest('gpt-4o-mini', messages, {
      temperature: 0.4,
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  }

  // 高速・低コストな診断分析用（gpt-4o-mini）
  async generateQuickAnalysis(prompt: string): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `あなたは診断データの分析を行う専門アシスタントです。
分析は簡潔で実用的な内容にし、100-200字程度でまとめてください。
医療的な診断は行わず、参考情報として提供します。`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.makeRequest('gpt-4o-mini', messages, {
      temperature: 0.2,
      max_tokens: 300
    });

    return response.choices[0].message.content.trim();
  }

  // 高品質な最終まとめ生成用（gpt-4o）
  async generateDetailedSummary(diagnosisData: UserDiagnosisData): Promise<string> {
    const prompt = this.createDiagnosisSummaryPrompt(diagnosisData);
    
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `あなたは統合診断システムの専門コンサルタントです。
以下の要素を含む500字程度のMarkdown形式の要約を作成してください：

## 概要
基本情報と今回の診断テーマの要約

## 診断結果の統合分析
各診断結果の特徴と相互関係の分析

## 個性と強みの解釈
診断結果から見える個性・強み・注意点

## 具体的なアドバイス
今週から試せる具体的なアクション

注意：これは娯楽・参考目的の分析であり、医療診断ではありません。`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.makeRequest('gpt-4o', messages, {
      temperature: 0.3,
      max_tokens: 1000
    });

    return response.choices[0].message.content.trim();
  }

  // プロンプト生成用（管理者向け）
  async generateAdminPrompt(diagnosisData: UserDiagnosisData): Promise<string> {
    const prompt = `以下の診断データを基に、管理者が相談者との対話で使用できる構造化プロンプトを生成してください：

診断データ：
${JSON.stringify(diagnosisData, null, 2)}

プロンプト形式：
- 相談者の特徴と背景の要約
- 対話時の注意点
- 効果的な質問例
- アドバイスのポイント

300字程度で簡潔にまとめてください。`;

    return this.generateQuickAnalysis(prompt);
  }

  private createDiagnosisSummaryPrompt(data: UserDiagnosisData): string {
    const { basic, mbti, taiheki, fortune } = data;
    
    return `診断対象者の統合分析を行ってください：

## 基本情報
- 名前: ${basic.name}
- 年齢: ${this.calculateAge(basic.birthdate)}歳
- 性別: ${basic.gender}

## MBTI診断結果
- タイプ: ${mbti?.type || '未診断'}
- 信頼度: ${mbti?.confidence || 'N/A'}
- 診断方法: ${mbti?.source === 'known' ? '既知' : '12問診断'}

## 体癖診断結果
- 主体癖: ${taiheki?.primary || '未診断'}種
- 副体癖: ${taiheki?.secondary || '未診断'}種
- 特徴: ${taiheki?.characteristics?.join('、') || '未取得'}

## 算命学・動物占い結果
- 干支: ${fortune?.zodiac || '未算出'}
- 動物: ${fortune?.animal || '未算出'}
- 五行: ${fortune?.element || '未算出'}
- 六星: ${fortune?.sixStar || '未算出'}

これらの結果を統合し、個性・強み・成長ポイント・具体的アドバイスを含む包括的な分析を作成してください。`;
  }

  private calculateAge(birthdate: { year: number; month: number; day: number }): number {
    const today = new Date();
    let age = today.getFullYear() - birthdate.year;
    const monthDiff = today.getMonth() + 1 - birthdate.month; // getMonth() is 0-indexed
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.day)) {
      age--;
    }
    
    return age;
  }
}

// シングルトンインスタンス
let openaiClient: OpenAIClient | null = null;
let openaiSDK: OpenAI | null = null;

export function getOpenAIClient(): OpenAIClient {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiClient = new OpenAIClient(apiKey);
  }
  return openaiClient;
}

// OpenAI SDK インスタンスをエクスポート（integrated-report-service.ts 用）
export function getOpenAISDK(): OpenAI {
  if (!openaiSDK) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiSDK = new OpenAI({ apiKey });
  }
  return openaiSDK;
}

// 遅延初期化されたインスタンス（下位互換性のため）
export const openai = {
  get chat() {
    return getOpenAISDK().chat;
  },
  get completions() {
    return getOpenAISDK().completions;
  }
};

// エクスポート用の便利な関数
export async function generateDiagnosisSummary(data: UserDiagnosisData): Promise<string> {
  const client = getOpenAIClient();
  return client.generateDetailedSummary(data);
}

export async function generateAdminPrompt(data: UserDiagnosisData): Promise<string> {
  const client = getOpenAIClient();
  return client.generateAdminPrompt(data);
}

export async function generateQuickAnalysis(prompt: string): Promise<string> {
  const client = getOpenAIClient();
  return client.generateQuickAnalysis(prompt);
}