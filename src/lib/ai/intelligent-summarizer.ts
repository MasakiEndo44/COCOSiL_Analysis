/**
 * IntelligentSummarizer for COCOSiL AI Chat
 * Phase 2: AI-powered session summarization with quality monitoring
 *
 * Features:
 * - GPT-4 powered summarization with chain-of-density approach
 * - LRU caching with 50MB memory limit
 * - Quality monitoring for inappropriate content
 * - Graceful fallback to legacy summarization
 */

import OpenAI from 'openai';
import type { ChatSession, ChatSummary, QAExchange, ChatMessage } from '@/types';
import { generateFallbackSummary, validateSessionForSummary, extractQAExchanges } from '@/lib/counseling/summarizer';

interface SummarizationCache {
  summary: ChatSummary;
  timestamp: number;
  size: number; // Estimated memory size in bytes
}

interface QualityCheckResult {
  isAppropriate: boolean;
  confidence: number;
  flags: string[];
  sanitizedContent?: string;
}

interface SummarizationOptions {
  useAI: boolean;
  maxRetries: number;
  cacheTimeout: number; // in milliseconds
  qualityCheck: boolean;
}

/**
 * LRU Cache implementation with memory size tracking
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  private currentSize = 0;

  constructor(maxSizeBytes: number) {
    this.maxSize = maxSizeBytes;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V & { size: number }): void {
    // Remove existing entry if present
    if (this.cache.has(key)) {
      const oldValue = this.cache.get(key) as V & { size: number };
      this.currentSize -= oldValue.size;
      this.cache.delete(key);
    }

    // Reject oversized entries to enforce memory cap
    if (value.size > this.maxSize) {
      throw new Error(`Entry size (${value.size}) exceeds cache limit (${this.maxSize})`);
    }

    // Evict least recently used items if necessary
    while (this.currentSize + value.size > this.maxSize && this.cache.size > 0) {
      const iterator = this.cache.entries();
      const firstEntry = iterator.next();
      if (!firstEntry.done) {
        const [oldestKey, oldestValue] = firstEntry.value;
        this.currentSize -= (oldestValue as V & { size: number }).size;
        this.cache.delete(oldestKey);
      } else {
        break; // Safety break if iterator is done
      }
    }

    // Add new entry
    this.cache.set(key, value);
    this.currentSize += value.size;
  }

  delete(key: K): boolean {
    const value = this.cache.get(key);
    if (value) {
      this.currentSize -= (value as V & { size: number }).size;
      return this.cache.delete(key);
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  getMemoryUsage(): { current: number; max: number; utilization: number } {
    return {
      current: this.currentSize,
      max: this.maxSize,
      utilization: this.currentSize / this.maxSize
    };
  }
}

/**
 * IntelligentSummarizer class implementing Phase 2 requirements
 */
export class IntelligentSummarizer {
  private openai: OpenAI;
  private cache: LRUCache<string, SummarizationCache>;
  private qualityMonitor: QualityMonitor;
  private options: SummarizationOptions;

  private static readonly CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly DEFAULT_OPTIONS: SummarizationOptions = {
    useAI: false, // Disabled AI summarization to preserve full transcript
    maxRetries: 2,
    cacheTimeout: 30 * 60 * 1000, // 30 minutes
    qualityCheck: false // Disabled quality check since we're preserving full content
  };

  constructor(openaiApiKey?: string, options: Partial<SummarizationOptions> = {}) {
    this.openai = new OpenAI({
      apiKey: openaiApiKey || process.env.OPENAI_API_KEY,
    });

    this.cache = new LRUCache<string, SummarizationCache>(IntelligentSummarizer.CACHE_SIZE);
    this.qualityMonitor = new QualityMonitor(this.openai);
    this.options = { ...IntelligentSummarizer.DEFAULT_OPTIONS, ...options };
  }

  /**
   * Main summarization method with caching and quality checks
   */
  /**
   * Main summarization method with caching and quality checks
   * Modified to preserve full transcript without AI summarization
   */
  async summarizeSession(session: ChatSession): Promise<{ summary: ChatSummary; cached: boolean }> {
    try {
      // Validate session data
      if (!validateSessionForSummary(session)) {
        return {
          summary: generateFallbackSummary(session.selectedTopic, session.messages.length),
          cached: false
        };
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(session);

      // Check cache first
      const cached = this.getCachedSummary(cacheKey);
      if (cached) {
        return {
          summary: cached.summary,
          cached: true
        };
      }

      // Generate full transcript preservation summary (no AI summarization)
      const summary = this.generateFullTranscriptSummary(session);

      // Cache the result
      this.cacheSummary(cacheKey, summary);

      return {
        summary,
        cached: false
      };

    } catch (error) {
      console.error('Summarization error:', error);
      return {
        summary: generateFallbackSummary(session.selectedTopic, session.messages.length),
        cached: false
      };
    }
  }

  /**
   * Generate summary that preserves full transcript content
   * No AI summarization - maintains complete conversation for Claude integration
   */
  private generateFullTranscriptSummary(session: ChatSession): ChatSummary {
    const { messages, selectedTopic } = session;

    // Extract all Q&A exchanges with full content preservation
    const qaExchanges = extractQAExchanges(messages, { maxExchanges: 1000 });

    // Handle both Date objects and ISO strings for endTime/startTime
    const startTime = session.startTime instanceof Date ? session.startTime : new Date(session.startTime);
    const endTime = session.endTime ?
      (session.endTime instanceof Date ? session.endTime : new Date(session.endTime)) :
      null;

    const duration = endTime
      ? Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      : Math.floor(session.messages.length * 1.5);

    // Create comprehensive summary with full content
    const keyPoints = messages
      .filter(msg => msg.role === 'user' && msg.content.trim().length > 0)
      .map(msg => msg.content); // Preserve full user messages as key points

    const overallInsight = `完全な会話記録: ${messages.length}件のメッセージ交換による${this.getTopicContext(selectedTopic).title}に関する相談セッション`;

    return {
      topicId: selectedTopic,
      topicTitle: this.getTopicContext(selectedTopic).title,
      qaExchanges,
      sessionDuration: duration,
      aiGenerated: false, // Indicates this is full transcript, not AI summary
      keyPoints,
      overallInsight,
      actionableAdvice: [], // No AI-generated advice in full transcript mode
      fullTranscript: messages // Add complete message array for Claude integration
    };
  }

  /**
   * AI-powered summarization using chain-of-density approach
   */
  private async performAISummarization(session: ChatSession): Promise<ChatSummary> {
    const { messages, selectedTopic } = session;

    // Filter and prepare conversation content
    const conversationText = this.prepareConversationText(messages);

    // Quality check if enabled
    if (this.options.qualityCheck) {
      const qualityResult = await this.qualityMonitor.checkContent(conversationText);
      if (!qualityResult.isAppropriate) {
        throw new Error(`Quality check failed: ${qualityResult.flags.join(', ')}`);
      }
    }

    // Generate AI summary using chain-of-density approach
    const summaryPrompt = this.buildSummarizationPrompt(conversationText, selectedTopic);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini', // More cost-effective than gpt-4
      messages: [
        { role: 'system', content: summaryPrompt },
        { role: 'user', content: conversationText }
      ],
      temperature: 0.3, // Lower temperature for more consistent summaries
      max_tokens: 800,
      response_format: { type: 'json_object' }, // Force JSON mode for reliable parsing
    });

    const aiSummaryText = response.choices[0]?.message?.content;
    if (!aiSummaryText) {
      throw new Error('Empty response from AI summarization');
    }

    // Parse structured summary from AI response
    return this.parseAISummary(aiSummaryText, session);
  }

  /**
   * Build sophisticated summarization prompt using chain-of-density approach
   */
  private buildSummarizationPrompt(conversationText: string, topicId: string): string {
    const topicContext = this.getTopicContext(topicId);

    return `あなたはCOCOSiLカウンセリングセッションの専門要約者です。

## 要約指示
以下のカウンセリング会話を分析し、構造化された要約を生成してください。

### 話題コンテキスト
- 相談分野: ${topicContext.title}
- 重要観点: ${topicContext.keyAspects}

### 要約要件（Chain-of-Density方式）
1. **初回要約**: 主要なポイントを特定
2. **密度向上**: 重要な詳細を追加
3. **最終精緻化**: 簡潔性と情報量のバランス

### 出力形式（JSON形式で回答）
{
  "keyPoints": ["重要ポイント1", "重要ポイント2", "重要ポイント3"],
  "qaExchanges": [
    {
      "question": "カウンセラーの質問（100文字以内）",
      "answer": "ユーザーの回答要約（150文字以内）",
      "insight": "この交換から得られた洞察（80文字以内）"
    }
  ],
  "overallInsight": "セッション全体の洞察と方向性（200文字以内）",
  "actionableAdvice": ["具体的アドバイス1", "具体的アドバイス2"]
}

### 品質基準
- 機密性: 個人情報は一般化
- 簡潔性: 要点を明確に
- 有用性: 実用的な洞察を含む`;
  }

  /**
   * Parse AI-generated summary into structured format
   */
  private parseAISummary(aiText: string, session: ChatSession): ChatSummary {
    try {
      let parsedSummary: any;

      // Try to extract JSON from fenced code block first
      const jsonMatch = aiText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        parsedSummary = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback: try to find first JSON object in the text
        const jsonObjectMatch = aiText.match(/\{[\s\S]*?\}/);
        if (jsonObjectMatch) {
          parsedSummary = JSON.parse(jsonObjectMatch[0]);
        } else {
          // Final fallback: assume the entire response is JSON (JSON mode)
          parsedSummary = JSON.parse(aiText);
        }
      }

      // Convert to ChatSummary format
      const qaExchanges: QAExchange[] = (parsedSummary.qaExchanges || []).map((qa: any) => ({
        question: qa.question || '',
        answer: qa.answer || '',
        timestamp: new Date(),
        insight: qa.insight
      }));

      // Handle both Date objects and ISO strings for endTime/startTime
      const startTime = session.startTime instanceof Date ? session.startTime : new Date(session.startTime);
      const endTime = session.endTime ?
        (session.endTime instanceof Date ? session.endTime : new Date(session.endTime)) :
        null;

      const duration = endTime
        ? Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
        : Math.floor(session.messages.length * 1.5);

      return {
        topicId: session.selectedTopic,
        topicTitle: this.getTopicContext(session.selectedTopic).title,
        qaExchanges,
        sessionDuration: duration,
        aiGenerated: true,
        keyPoints: parsedSummary.keyPoints || [],
        overallInsight: parsedSummary.overallInsight,
        actionableAdvice: parsedSummary.actionableAdvice || []
      };

    } catch (error) {
      console.error('Failed to parse AI summary:', error);
      throw new Error('Failed to parse AI-generated summary');
    }
  }

  /**
   * Prepare conversation text for AI processing
   */
  private prepareConversationText(messages: ChatMessage[]): string {
    return messages
      .filter(msg => msg.content.trim().length > 0)
      .map(msg => `${msg.role === 'assistant' ? 'カウンセラー' : 'ユーザー'}: ${msg.content}`)
      .join('\n\n');
  }

  /**
   * Generate cache key for session with proper content hashing
   */
  private generateCacheKey(session: ChatSession): string {
    // Create a proper hash of message content
    const messageContent = session.messages
      .map(m => `${m.role}:${m.content}`)
      .join('|');

    // Simple hash function for content (better than substring)
    let hash = 0;
    for (let i = 0; i < messageContent.length; i++) {
      const char = messageContent.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const contentHash = Math.abs(hash).toString(36);
    const messageCount = session.messages.length;

    return `${session.sessionId}-${session.selectedTopic}-${messageCount}-${contentHash}`;
  }

  /**
   * Get cached summary if valid, with automatic cleanup of expired entries
   */
  private getCachedSummary(cacheKey: string): SummarizationCache | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    // Check cache timeout
    const now = Date.now();
    if (now - cached.timestamp > this.options.cacheTimeout) {
      // Remove expired entry to free memory and maintain accurate utilization
      this.cache.delete(cacheKey);
      return null;
    }

    return cached;
  }

  /**
   * Cache summary result
   */
  private cacheSummary(cacheKey: string, summary: ChatSummary): void {
    const summaryText = JSON.stringify(summary);
    const cacheEntry: SummarizationCache = {
      summary,
      timestamp: Date.now(),
      size: summaryText.length * 2 // Approximate memory size (UTF-16)
    };

    this.cache.set(cacheKey, cacheEntry);
  }

  /**
   * Get topic-specific context for summarization
   */
  private getTopicContext(topicId: string): { title: string; keyAspects: string } {
    const contexts: Record<string, { title: string; keyAspects: string }> = {
      'relationship': {
        title: '人間関係の悩み',
        keyAspects: 'コミュニケーション、対人関係、職場関係、恋愛関係'
      },
      'career': {
        title: 'キャリア・仕事の悩み',
        keyAspects: '転職、昇進、働き方、スキル開発、職場環境'
      },
      'personality': {
        title: '自分の性格・特性理解',
        keyAspects: '強み発見、弱み改善、自己理解、成長方向'
      },
      'future': {
        title: '将来・目標設定',
        keyAspects: '人生設計、目標達成、方向性決定、優先順位'
      }
    };

    return contexts[topicId] || { title: 'その他の相談', keyAspects: '一般的な悩み相談' };
  }

  /**
   * Get cache statistics
   */
  getSystemStats(): {
    cache: { current: number; max: number; utilization: number };
    options: SummarizationOptions;
  } {
    return {
      cache: this.cache.getMemoryUsage(),
      options: this.options
    };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * QualityMonitor class for content validation
 */
class QualityMonitor {
  private openai: OpenAI;
  private readonly inappropriateKeywords = [
    // Add keywords that should trigger quality flags
    '自殺', '自傷', '違法', '暴力', '差別'
  ];

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  /**
   * Check content quality and appropriateness
   */
  async checkContent(content: string): Promise<QualityCheckResult> {
    try {
      // Fast keyword check first
      const keywordFlags = this.checkKeywords(content);
      if (keywordFlags.length > 0) {
        return {
          isAppropriate: false,
          confidence: 0.9,
          flags: keywordFlags
        };
      }

      // Use OpenAI's dedicated moderation API (faster and cheaper)
      const moderationResponse = await this.openai.moderations.create({
        input: content.slice(0, 2000), // Limit content length
      });

      const moderationResult = moderationResponse.results[0];
      if (!moderationResult) {
        throw new Error('Empty moderation response');
      }

      // Convert OpenAI moderation flags to our format
      const flags: string[] = [];
      if (moderationResult.flagged) {
        Object.entries(moderationResult.categories).forEach(([category, flagged]) => {
          if (flagged) {
            flags.push(`moderation_${category}`);
          }
        });
      }

      return {
        isAppropriate: !moderationResult.flagged,
        confidence: moderationResult.flagged ? 0.9 : 0.8,
        flags
      };

    } catch (error) {
      console.error('Quality check error:', error);
      // SECURITY: Fail safe - block content when quality check fails
      return {
        isAppropriate: false,
        confidence: 0.1,
        flags: ['quality_check_failed', 'safety_blocking_failure']
      };
    }
  }

  /**
   * Fast keyword-based quality check
   */
  private checkKeywords(content: string): string[] {
    const flags: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const keyword of this.inappropriateKeywords) {
      if (lowerContent.includes(keyword)) {
        flags.push(`inappropriate_keyword_${keyword}`);
      }
    }

    return flags;
  }
}

/**
 * Factory function for creating IntelligentSummarizer instances
 */
export function createIntelligentSummarizer(
  apiKey?: string,
  options?: Partial<SummarizationOptions>
): IntelligentSummarizer {
  return new IntelligentSummarizer(apiKey, options);
}

/**
 * Singleton instance for application-wide use
 */
let summarizerInstance: IntelligentSummarizer | null = null;

export function getIntelligentSummarizer(): IntelligentSummarizer {
  if (!summarizerInstance) {
    summarizerInstance = createIntelligentSummarizer();
  }
  return summarizerInstance;
}