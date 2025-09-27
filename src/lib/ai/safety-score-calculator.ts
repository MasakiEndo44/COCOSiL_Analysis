/**
 * Psychological Safety Score Calculator
 * Implements real-time safety assessment for AI chat conversations
 */

import type { 
  PsychologicalSafetyScore,
  UserResponseAnalysis,
  RogersConditions,
  SafetyRecoveryAction
} from '@/types/psychological-safety';
import type { ChatMessage } from '@/types';
import {
  ROGERS_CONDITIONS_WEIGHTS,
  ENGAGEMENT_SCORING,
  RESPONSE_ANALYSIS,
  shouldActivateRecovery
} from './psychological-safety-constants';

export class SafetyScoreCalculator {
  private static readonly POSITIVE_KEYWORDS = [
    '感謝', 'ありがとう', 'うれしい', '良い', '安心', '理解', '共感', 
    'そうです', 'はい', '助かる', '納得', '安らぐ', '落ち着く'
  ];

  private static readonly NEGATIVE_KEYWORDS = [
    'いやだ', 'つらい', '無理', '嫌', '不安', 'わからない', '違う', 
    'ちがう', '怖い', '困る', '混乱', 'ストレス', 'プレッシャー'
  ];

  private static readonly RESISTANCE_PATTERNS = [
    /そんなこと|そういうこと.*ない/,
    /答えたくない|言いたくない/,
    /関係ない|どうでもいい/,
    /やめて|もういい/
  ];

  private static readonly ENGAGEMENT_PATTERNS = [
    /実は|本当は|正直/,
    /思うのですが|感じるのですが/,
    /具体的には|例えば/,
    /もう少し|詳しく/
  ];

  /**
   * Calculate comprehensive psychological safety score
   */
  public static calculateSafetyScore(
    messages: ChatMessage[],
    conversationHistory: UserResponseAnalysis[] = []
  ): PsychologicalSafetyScore {
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) {
      return this.getInitialSafetyScore();
    }

    const lastUserMessage = userMessages[userMessages.length - 1];
    const currentAnalysis = this.analyzeUserResponse(lastUserMessage.content);
    
    // Historical trend analysis
    const trendScore = this.calculateTrendScore(conversationHistory, currentAnalysis);
    
    // Rogers conditions assessment
    const rogersConditions = this.assessRogersConditions(currentAnalysis, trendScore);
    
    // Overall score calculation with weighted components
    const overall = this.calculateOverallScore(rogersConditions, trendScore);
    
    // Generate actionable recommendations
    const recommendations = this.generateRecommendations(rogersConditions, overall, currentAnalysis);
    
    // Determine if recovery mode is needed
    const recovery_needed = this.shouldActivateRecovery(overall, currentAnalysis);

    return {
      overall,
      components: rogersConditions,
      recommendations,
      recovery_needed
    };
  }

  /**
   * Analyze individual user response for safety indicators
   */
  public static analyzeUserResponse(content: string): UserResponseAnalysis {
    const normalizedContent = content.toLowerCase().trim();
    const words = normalizedContent.split(/\s+/);
    const wordCount = words.length;

    // Language analysis
    const positive_language = this.POSITIVE_KEYWORDS.filter(word => 
      normalizedContent.includes(word)
    );
    const negative_language = this.NEGATIVE_KEYWORDS.filter(word => 
      normalizedContent.includes(word)
    );

    // Pattern detection
    const hasResistancePatterns = this.RESISTANCE_PATTERNS.some(pattern => 
      pattern.test(normalizedContent)
    );
    const hasEngagementPatterns = this.ENGAGEMENT_PATTERNS.some(pattern => 
      pattern.test(normalizedContent)
    );

    // Emotional expression assessment
    const emotional_expression = this.assessEmotionalExpression(
      wordCount,
      positive_language.length,
      negative_language.length,
      hasResistancePatterns,
      hasEngagementPatterns
    );

    // Engagement level calculation (0-1)
    const engagement_level = this.calculateEngagementLevel(
      wordCount,
      positive_language.length,
      hasEngagementPatterns,
      hasResistancePatterns
    );

    // Sentiment analysis
    const sentiment = this.analyzeSentiment(
      positive_language.length,
      negative_language.length,
      hasResistancePatterns
    );

    // Topic and emotional word extraction
    const topics = this.extractTopics(normalizedContent);
    const emotional_words = [...positive_language, ...negative_language];

    return {
      safetyIndicators: {
        positive_language,
        negative_language,
        emotional_expression,
        engagement_level
      },
      content_analysis: {
        word_count: wordCount,
        sentiment,
        topics,
        emotional_words
      },
      rogers_compliance: this.getDefaultRogersConditions() // Will be calculated separately
    };
  }

  /**
   * Calculate engagement level based on multiple factors
   */
  private static calculateEngagementLevel(
    wordCount: number,
    positiveCount: number,
    hasEngagement: boolean,
    hasResistance: boolean
  ): number {
    let score = 0;

    // Word count contribution
    score += Math.min(ENGAGEMENT_SCORING.WORD_COUNT_WEIGHT, wordCount / ENGAGEMENT_SCORING.WORD_COUNT_DIVISOR);

    // Positive language contribution
    score += Math.min(ENGAGEMENT_SCORING.POSITIVE_LANGUAGE_WEIGHT, positiveCount * 0.1);

    // Engagement patterns bonus
    if (hasEngagement) score += ENGAGEMENT_SCORING.ENGAGEMENT_PATTERN_BONUS;

    // Resistance penalty
    if (hasResistance) score += ENGAGEMENT_SCORING.RESISTANCE_PENALTY;

    // Additional length bonus for very detailed responses
    if (wordCount > RESPONSE_ANALYSIS.DETAILED_RESPONSE_THRESHOLD) score += ENGAGEMENT_SCORING.DETAILED_RESPONSE_BONUS;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Assess emotional expression level
   */
  private static assessEmotionalExpression(
    wordCount: number,
    positiveCount: number,
    negativeCount: number,
    hasResistance: boolean,
    hasEngagement: boolean
  ): 'open' | 'guarded' | 'resistant' {
    if (hasResistance || (negativeCount > positiveCount && wordCount < 10)) {
      return 'resistant';
    }
    
    if (hasEngagement || (wordCount > 20 && positiveCount > 0)) {
      return 'open';
    }
    
    return 'guarded';
  }

  /**
   * Analyze sentiment with context
   */
  private static analyzeSentiment(
    positiveCount: number,
    negativeCount: number,
    hasResistance: boolean
  ): 'positive' | 'neutral' | 'negative' {
    if (hasResistance || negativeCount > positiveCount + 1) {
      return 'negative';
    }
    
    if (positiveCount > negativeCount) {
      return 'positive';
    }
    
    return 'neutral';
  }

  /**
   * Calculate trend score based on conversation history
   */
  private static calculateTrendScore(
    history: UserResponseAnalysis[],
    current: UserResponseAnalysis
  ): number {
    if (history.length === 0) return 0.7; // Neutral starting point

    const recent = history.slice(-3); // Last 3 responses
    const engagementTrend = recent.map(h => h.safetyIndicators.engagement_level);
    
    // Calculate trend direction
    const avgPrevious = engagementTrend.reduce((a, b) => a + b, 0) / engagementTrend.length;
    const currentEngagement = current.safetyIndicators.engagement_level;
    
    // Trend score (0.5 = no change, 1.0 = improving, 0.0 = declining)
    const trendDirection = currentEngagement >= avgPrevious ? 1 : 0;
    const trendMagnitude = Math.abs(currentEngagement - avgPrevious);
    
    return 0.5 + (trendDirection * trendMagnitude * 0.5);
  }

  /**
   * Assess Rogers' 3 conditions compliance
   */
  private static assessRogersConditions(
    analysis: UserResponseAnalysis,
    trendScore: number
  ): RogersConditions {
    const { safetyIndicators, content_analysis } = analysis;

    // 1. Self-Congruence (AI authenticity perception)
    const authenticity = Math.min(0.9, safetyIndicators.engagement_level + 0.1);
    const transparency = content_analysis.word_count > 15 ? 0.8 : 0.6;
    const limitations_acknowledged = true; // AI should always acknowledge limitations

    // 2. Unconditional Positive Regard (acceptance perception)
    const acceptance_level = this.calculateAcceptanceLevel(safetyIndicators, content_analysis);
    const non_judgmental_language = safetyIndicators.negative_language.length < 2;
    const validation_present = safetyIndicators.positive_language.length > 0 || 
                               content_analysis.sentiment === 'positive';

    // 3. Empathic Understanding (comprehension perception)
    const understanding_level = Math.min(0.95, safetyIndicators.engagement_level + 0.15);
    const reflection_accuracy = this.calculateReflectionAccuracy(content_analysis, trendScore);
    const clarification_requested = content_analysis.word_count < 10 || 
                                    safetyIndicators.emotional_expression === 'resistant';

    return {
      selfCongruence: {
        authenticity,
        transparency,
        limitations_acknowledged
      },
      unconditionalPositiveRegard: {
        acceptance_level,
        non_judgmental_language,
        validation_present
      },
      empathicUnderstanding: {
        understanding_level,
        reflection_accuracy,
        clarification_requested
      }
    };
  }

  /**
   * Calculate acceptance level
   */
  private static calculateAcceptanceLevel(
    safetyIndicators: UserResponseAnalysis['safetyIndicators'],
    contentAnalysis: UserResponseAnalysis['content_analysis']
  ): number {
    let score = 0.5; // Neutral base

    // Positive indicators
    if (safetyIndicators.emotional_expression === 'open') score += 0.3;
    if (safetyIndicators.positive_language.length > 0) score += 0.2;
    if (contentAnalysis.sentiment === 'positive') score += 0.2;

    // Negative indicators
    if (safetyIndicators.emotional_expression === 'resistant') score -= 0.4;
    if (contentAnalysis.sentiment === 'negative') score -= 0.2;
    if (safetyIndicators.negative_language.length > 2) score -= 0.2;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate reflection accuracy
   */
  private static calculateReflectionAccuracy(
    contentAnalysis: UserResponseAnalysis['content_analysis'],
    trendScore: number
  ): number {
    let score = 0.6; // Base accuracy

    // Content quality indicators
    if (contentAnalysis.word_count > 20) score += 0.1;
    if (contentAnalysis.topics.length > 0) score += 0.1;
    if (contentAnalysis.sentiment !== 'negative') score += 0.1;

    // Trend contribution
    score += (trendScore - 0.5) * 0.2;

    return Math.max(0.3, Math.min(0.95, score));
  }

  /**
   * Calculate overall psychological safety score
   */
  private static calculateOverallScore(
    conditions: RogersConditions,
    trendScore: number
  ): number {
    // Weighted combination of Rogers conditions
    const selfCongruenceScore = (
      conditions.selfCongruence.authenticity * 0.4 +
      conditions.selfCongruence.transparency * 0.3 +
      (conditions.selfCongruence.limitations_acknowledged ? 0.3 : 0)
    );

    const positiveRegardScore = (
      conditions.unconditionalPositiveRegard.acceptance_level * 0.5 +
      (conditions.unconditionalPositiveRegard.non_judgmental_language ? 0.25 : 0) +
      (conditions.unconditionalPositiveRegard.validation_present ? 0.25 : 0)
    );

    const empathicUnderstandingScore = (
      conditions.empathicUnderstanding.understanding_level * 0.4 +
      conditions.empathicUnderstanding.reflection_accuracy * 0.4 +
      (conditions.empathicUnderstanding.clarification_requested ? 0 : 0.2)
    );

    // Overall weighted score
    const baseScore = (
      selfCongruenceScore * ROGERS_CONDITIONS_WEIGHTS.SELF_CONGRUENCE +
      positiveRegardScore * ROGERS_CONDITIONS_WEIGHTS.UNCONDITIONAL_POSITIVE_REGARD +  // Most important for safety
      empathicUnderstandingScore * ROGERS_CONDITIONS_WEIGHTS.EMPATHIC_UNDERSTANDING
    );

    // Trend adjustment
    const trendAdjustment = (trendScore - 0.5) * 0.1;
    
    return Math.max(0, Math.min(1, baseScore + trendAdjustment));
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(
    conditions: RogersConditions,
    overall: number,
    analysis: UserResponseAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // Self-congruence recommendations
    if (conditions.selfCongruence.authenticity < 0.6) {
      recommendations.push('より親しみやすく誠実な表現を使用する');
    }

    // Positive regard recommendations
    if (conditions.unconditionalPositiveRegard.acceptance_level < 0.6) {
      recommendations.push('判断的な言葉を避け、受容的な姿勢を示す');
    }
    if (!conditions.unconditionalPositiveRegard.validation_present) {
      recommendations.push('ユーザーの気持ちをより積極的に認める');
    }

    // Empathic understanding recommendations
    if (conditions.empathicUnderstanding.understanding_level < 0.7) {
      recommendations.push('感情をより深く反映し、理解確認を行う');
    }
    if (conditions.empathicUnderstanding.clarification_requested) {
      recommendations.push('明確化を求める質問を丁寧に行う');
    }

    // Overall safety recommendations
    if (overall < 0.5) {
      recommendations.push('選択式質問を優先し、回答のプレッシャーを軽減');
      recommendations.push('温かい共感メッセージを増やす');
    }

    // Response-specific recommendations
    if (analysis.safetyIndicators.emotional_expression === 'resistant') {
      recommendations.push('ペースを落とし、プライバシー保護を再確認');
    }

    return recommendations;
  }

  /**
   * Determine if recovery mode should be activated
   */
  private static shouldActivateRecovery(
    overall: number,
    analysis: UserResponseAnalysis
  ): boolean {
    return shouldActivateRecovery(overall) || 
           analysis.safetyIndicators.emotional_expression === 'resistant' ||
           analysis.content_analysis.sentiment === 'negative';
  }

  /**
   * Extract topics from content
   */
  private static extractTopics(content: string): string[] {
    const topicPatterns = [
      { pattern: /仕事|職場|会社|働く/, topic: '仕事' },
      { pattern: /家族|親|子供|夫|妻/, topic: '家族' },
      { pattern: /恋愛|パートナー|恋人|結婚/, topic: '人間関係' },
      { pattern: /不安|心配|悩み|ストレス/, topic: '不安・心配' },
      { pattern: /将来|未来|目標|夢/, topic: '将来・目標' },
      { pattern: /健康|体調|病気/, topic: '健康' },
      { pattern: /お金|経済|金銭/, topic: '経済' },
      { pattern: /学校|勉強|試験/, topic: '学習' }
    ];

    return topicPatterns
      .filter(({ pattern }) => pattern.test(content))
      .map(({ topic }) => topic);
  }

  /**
   * Get initial safety score for new conversations
   */
  private static getInitialSafetyScore(): PsychologicalSafetyScore {
    return {
      overall: 0.8, // Start optimistic
      components: this.getDefaultRogersConditions(),
      recommendations: [
        '温かい共感から始める',
        '選択式質問を多用する',
        'プライバシー保護を明示する'
      ],
      recovery_needed: false
    };
  }

  /**
   * Get default Rogers conditions
   */
  private static getDefaultRogersConditions(): RogersConditions {
    return {
      selfCongruence: {
        authenticity: 0.8,
        transparency: 0.8,
        limitations_acknowledged: true
      },
      unconditionalPositiveRegard: {
        acceptance_level: 0.8,
        non_judgmental_language: true,
        validation_present: true
      },
      empathicUnderstanding: {
        understanding_level: 0.8,
        reflection_accuracy: 0.8,
        clarification_requested: false
      }
    };
  }

  /**
   * Generate recovery actions for low safety situations
   */
  public static generateRecoveryActions(
    safetyScore: PsychologicalSafetyScore,
    analysis: UserResponseAnalysis
  ): SafetyRecoveryAction[] {
    const actions: SafetyRecoveryAction[] = [];

    if (safetyScore.overall < 0.4) {
      actions.push({
        trigger: 'low_safety_score',
        action: 'show_empathy',
        message: 'お話しくださり、本当にありがとうございます。あなたのお気持ちを大切に受け止めています。'
      });

      actions.push({
        trigger: 'low_safety_score',
        action: 'offer_choice_questions',
        message: '答えやすい形で、以下の中からお選びいただけますでしょうか？'
      });
    }

    if (analysis.safetyIndicators.emotional_expression === 'resistant') {
      actions.push({
        trigger: 'user_resistance',
        action: 'conversation_pause',
        message: 'お疲れのようですね。少し休憩されますか？いつでも再開できます。'
      });
    }

    if (analysis.content_analysis.sentiment === 'negative') {
      actions.push({
        trigger: 'negative_language',
        action: 'privacy_reminder',
        message: 'このお話は完全に秘密が守られます。安心してお聞かせください。'
      });
    }

    return actions;
  }
}