/**
 * Choice Question Generator
 * Creates Rogers-compliant choice questions based on conversation context
 */

import type { 
  ChoiceQuestion, 
  ChoiceOption, 
  ConversationStage,
  DiagnosisIntegration 
} from '@/types/psychological-safety';
import {
  QUESTION_TYPE_THRESHOLDS,
  TAIHEKI_TYPE_RANGES,
  SCALE_QUESTION_CONFIG,
  MESSAGE_ANALYSIS,
} from './psychological-safety-constants';
import type { UserDiagnosisData, ChatMessage } from '@/types';

export class ChoiceQuestionGenerator {
  private diagnosisData: UserDiagnosisData;
  private diagnosisIntegration: DiagnosisIntegration;

  constructor(diagnosisData: UserDiagnosisData) {
    this.diagnosisData = diagnosisData;
    this.diagnosisIntegration = this.buildDiagnosisIntegration();
  }

  /**
   * Generate choice question based on stage and context
   */
  public generateChoiceQuestion(
    stage: ConversationStage,
    messages: ChatMessage[] = [],
    previousTopics: string[] = []
  ): ChoiceQuestion {
    const questionType = this.selectQuestionType(stage);
    const context = this.analyzeConversationContext(messages);
    
    switch (questionType) {
      case 'emotion_scale':
        return this.generateEmotionScaleQuestion(stage, context);
      case 'scale':
        return this.generateScaleQuestion(stage, context, previousTopics);
      case 'multiple':
        return this.generateMultipleChoiceQuestion(stage, context, previousTopics);
      default:
        return this.generateSingleChoiceQuestion(stage, context, previousTopics);
    }
  }

  /**
   * Generate emotion scale question
   */
  private generateEmotionScaleQuestion(
    stage: ConversationStage,
    context: ConversationContext
  ): ChoiceQuestion {
    const emotions = [
      { name: '安心', emoji: '😌', description: '落ち着いている' },
      { name: '不安', emoji: '😰', description: '心配している' },
      { name: '悲しみ', emoji: '😢', description: '沈んだ気持ち' },
      { name: '怒り', emoji: '😠', description: 'イライラしている' },
      { name: '喜び', emoji: '😊', description: 'うれしい気持ち' },
      { name: '混乱', emoji: '😵‍💫', description: 'よくわからない' }
    ];

    const options: ChoiceOption[] = emotions.map((emotion, index) => ({
      id: `emotion_${index + 1}`,
      label: `${emotion.name} (${index + 1})`,
      description: emotion.description,
      emoji: emotion.emoji
    }));

    return {
      id: `emotion_scale_${Date.now()}`,
      type: 'emotion_scale',
      question: '今のお気持ちを5段階で表すと、どちらに近いでしょうか？',
      empathyPrefix: this.getEmpathyPrefix(stage, 'emotion'),
      options,
      safetyMessage: 'どの感情も自然なものです。感じたままをお聞かせください。'
    };
  }

  /**
   * Generate scale question
   */
  private generateScaleQuestion(
    stage: ConversationStage,
    context: ConversationContext,
    previousTopics: string[]
  ): ChoiceQuestion {
    const scaleQuestions = this.getScaleQuestions(stage, context, previousTopics);
    const selectedQuestion = scaleQuestions[Math.floor(Math.random() * scaleQuestions.length)];

    const options: ChoiceOption[] = [
      { id: String(SCALE_QUESTION_CONFIG.MIN_VALUE), label: 'とてもそう思わない', description: '全くあてはまらない', emoji: '1️⃣' },
      { id: '2', label: 'そう思わない', description: 'あまりあてはまらない', emoji: '2️⃣' },
      { id: String(SCALE_QUESTION_CONFIG.MIDDLE_VALUE), label: 'どちらでもない', description: '中間的', emoji: '3️⃣' },
      { id: '4', label: 'そう思う', description: 'ある程度あてはまる', emoji: '4️⃣' },
      { id: String(SCALE_QUESTION_CONFIG.MAX_VALUE), label: 'とてもそう思う', description: 'よくあてはまる', emoji: '5️⃣' }
    ];

    return {
      id: `scale_${Date.now()}`,
      type: 'scale',
      question: selectedQuestion.question,
      empathyPrefix: selectedQuestion.empathyPrefix,
      options,
      safetyMessage: '正解はありません。直感的に感じたものを選んでください。'
    };
  }

  /**
   * Generate multiple choice question
   */
  private generateMultipleChoiceQuestion(
    stage: ConversationStage,
    context: ConversationContext,
    previousTopics: string[]
  ): ChoiceQuestion {
    const multipleQuestions = this.getMultipleChoiceQuestions(stage, context, previousTopics);
    const selectedQuestion = multipleQuestions[Math.floor(Math.random() * multipleQuestions.length)];

    return {
      id: `multiple_${Date.now()}`,
      type: 'multiple',
      question: selectedQuestion.question,
      empathyPrefix: selectedQuestion.empathyPrefix,
      options: selectedQuestion.options,
      safetyMessage: 'いくつ選んでいただいても大丈夫です。思い当たるものをお選びください。'
    };
  }

  /**
   * Generate single choice question
   */
  private generateSingleChoiceQuestion(
    stage: ConversationStage,
    context: ConversationContext,
    previousTopics: string[]
  ): ChoiceQuestion {
    const singleQuestions = this.getSingleChoiceQuestions(stage, context, previousTopics);
    const selectedQuestion = singleQuestions[Math.floor(Math.random() * singleQuestions.length)];

    return {
      id: `single_${Date.now()}`,
      type: 'single',
      question: selectedQuestion.question,
      empathyPrefix: selectedQuestion.empathyPrefix,
      options: selectedQuestion.options,
      ...(('followUp' in selectedQuestion) && { followUp: selectedQuestion.followUp as string }),
      safetyMessage: selectedQuestion.safetyMessage
    };
  }

  /**
   * Get scale questions based on context
   */
  private getScaleQuestions(
    stage: ConversationStage,
    context: ConversationContext,
    previousTopics: string[]
  ) {
    const baseQuestions = [
      {
        question: 'この状況について、どのくらい悩んでいらっしゃいますか？',
        empathyPrefix: 'お気持ちには個人差があります。'
      },
      {
        question: '今の生活について、満足度はどのくらいでしょうか？',
        empathyPrefix: '率直なお気持ちをお聞かせください。'
      },
      {
        question: 'ストレスを感じる度合いはどのくらいでしょうか？',
        empathyPrefix: 'ストレスは誰にでもあるものです。'
      }
    ];

    // Add diagnosis-specific questions
    if (this.diagnosisIntegration.mbti) {
      baseQuestions.push(...this.getMBTIScaleQuestions());
    }

    if (this.diagnosisIntegration.taiheki) {
      baseQuestions.push(...this.getTaihekiScaleQuestions());
    }

    return baseQuestions;
  }

  /**
   * Get multiple choice questions
   */
  private getMultipleChoiceQuestions(
    stage: ConversationStage,
    context: ConversationContext,
    previousTopics: string[]
  ) {
    const questions = [
      {
        question: 'どのような場面で特に感じることが多いですか？（複数選択可）',
        empathyPrefix: '様々な場面があると思います。',
        options: [
          { id: 'situation_work', label: '仕事・学校で', description: '活動中に感じる', emoji: '💼' },
          { id: 'situation_home', label: '家にいるとき', description: 'プライベート時間', emoji: '🏠' },
          { id: 'situation_social', label: '人といるとき', description: '対人場面で', emoji: '👥' },
          { id: 'situation_alone', label: '一人のとき', description: 'ひとりの時間で', emoji: '🧘' }
        ]
      },
      {
        question: 'どのようなサポートがあると助かりますか？（複数選択可）',
        empathyPrefix: 'サポートのニーズは人それぞれです。',
        options: [
          { id: 'support_listen', label: '話を聞いてもらう', description: '共感してもらう', emoji: '👂' },
          { id: 'support_advice', label: 'アドバイスをもらう', description: '具体的な助言', emoji: '💡' },
          { id: 'support_time', label: '時間をかけて考える', description: 'じっくり検討', emoji: '⏰' },
          { id: 'support_action', label: '行動のきっかけ', description: '背中を押してもらう', emoji: '🚀' }
        ]
      }
    ];

    // Add diagnosis-specific multiple choice questions
    if (this.diagnosisIntegration.mbti) {
      questions.push(...this.getMBTIMultipleQuestions());
    }

    return questions;
  }

  /**
   * Get single choice questions
   */
  private getSingleChoiceQuestions(
    stage: ConversationStage,
    context: ConversationContext,
    previousTopics: string[]
  ) {
    const warmupQuestions = [
      {
        question: '今のお気持ちを教えていただけますか？',
        empathyPrefix: 'お時間をいただき、ありがとうございます。',
        options: [
          { id: 'feeling_troubled', label: 'とても困っている', description: '深刻に悩んでいる', emoji: '😰' },
          { id: 'feeling_concerned', label: '少し悩んでいる', description: '気になることがある', emoji: '😔' },
          { id: 'feeling_confused', label: '迷っている', description: 'どうしたらいいか分からない', emoji: '🤔' },
          { id: 'feeling_other', label: 'その他', description: '上記にあてはまらない', emoji: '💭' }
        ],
        followUp: 'もう少し詳しく教えていただけますか？',
        safetyMessage: 'どの選択肢も、あなたの大切なお気持ちです。'
      }
    ];

    const explorationQuestions = [
      {
        question: 'この状況をどのように捉えていらっしゃいますか？',
        empathyPrefix: '状況の捉え方は人それぞれです。',
        options: [
          { id: 'perspective_challenge', label: '乗り越えるべき課題', description: '成長の機会として', emoji: '⛰️' },
          { id: 'perspective_burden', label: '重い負担', description: 'つらい状況として', emoji: '⚖️' },
          { id: 'perspective_temporary', label: '一時的なもの', description: 'いずれ過ぎ去るもの', emoji: '🌅' },
          { id: 'perspective_unclear', label: 'よくわからない', description: '混乱している', emoji: '❓' }
        ],
        safetyMessage: 'どの捉え方も自然なことです。'
      }
    ];

    if (stage.stage === 'warmup') {
      return warmupQuestions;
    } else if (stage.stage === 'exploration') {
      return [...warmupQuestions, ...explorationQuestions];
    }

    return [...warmupQuestions, ...explorationQuestions];
  }

  /**
   * Get MBTI-specific scale questions
   */
  private getMBTIScaleQuestions() {
    const mbtiType = this.diagnosisIntegration.mbti?.type || '';
    
    const questions = [
      {
        question: '今の状況を論理的に分析できていると感じますか？',
        empathyPrefix: '分析のしかたは人それぞれです。'
      },
      {
        question: '周りの人の気持ちを考慮できていると感じますか？',
        empathyPrefix: '人への配慮の形は様々です。'
      }
    ];

    if (mbtiType.includes('E')) {
      questions.push({
        question: '人と話すことでエネルギーを得られていますか？',
        empathyPrefix: 'エネルギーの源は人それぞれです。'
      });
    }

    if (mbtiType.includes('I')) {
      questions.push({
        question: '一人の時間で心の整理ができていますか？',
        empathyPrefix: '内省の時間の取り方は人それぞれです。'
      });
    }

    return questions;
  }

  /**
   * Get Taiheki-specific scale questions
   */
  private getTaihekiScaleQuestions() {
    const taihekiType = this.diagnosisIntegration.taiheki?.type || TAIHEKI_TYPE_RANGES.DEFAULT_TYPE;
    
    const baseQuestions = [
      {
        question: '体の感覚に意識を向けることができていますか？',
        empathyPrefix: '体と心のつながりは深いものです。'
      }
    ];

    // Add type-specific questions
    if (taihekiType <= TAIHEKI_TYPE_RANGES.UPPER_LOWER_MAX) { // 上下型・左右型
      baseQuestions.push({
        question: '物事のバランスを取ることができていますか？',
        empathyPrefix: 'バランス感覚は大切な能力です。'
      });
    }

    if (taihekiType >= TAIHEKI_TYPE_RANGES.FRONT_BACK_MIN && taihekiType <= TAIHEKI_TYPE_RANGES.FRONT_BACK_MAX) { // 前後型
      baseQuestions.push({
        question: '感情を素直に表現できていますか？',
        empathyPrefix: '感情表現の形は人それぞれです。'
      });
    }

    return baseQuestions;
  }

  /**
   * Get MBTI-specific multiple choice questions
   */
  private getMBTIMultipleQuestions() {
    return [
      {
        question: 'どのような思考プロセスを好みますか？（複数選択可）',
        empathyPrefix: '思考の仕方に正解はありません。',
        options: [
          { id: 'thinking_logical', label: '論理的分析', description: '筋道立てて考える', emoji: '🧠' },
          { id: 'thinking_intuitive', label: '直感的判断', description: '感覚で判断する', emoji: '✨' },
          { id: 'thinking_emotional', label: '感情的理解', description: '気持ちを重視する', emoji: '❤️' },
          { id: 'thinking_practical', label: '実践的思考', description: '現実的に考える', emoji: '🔧' }
        ]
      }
    ];
  }

  /**
   * Select question type based on stage
   */
  private selectQuestionType(stage: ConversationStage): ChoiceQuestion['type'] {
    const random = Math.random();
    
    switch (stage.stage) {
      case 'warmup':
        return random < QUESTION_TYPE_THRESHOLDS.WARMUP.SINGLE ? 'single' : random < QUESTION_TYPE_THRESHOLDS.WARMUP.EMOTION_SCALE ? 'emotion_scale' : 'scale';
      case 'exploration':
        return random < QUESTION_TYPE_THRESHOLDS.EXPLORATION.SINGLE ? 'single' : random < QUESTION_TYPE_THRESHOLDS.EXPLORATION.MULTIPLE ? 'multiple' : random < QUESTION_TYPE_THRESHOLDS.EXPLORATION.SCALE ? 'scale' : 'emotion_scale';
      case 'deep_dive':
        return random < QUESTION_TYPE_THRESHOLDS.DEEP_DIVE.SCALE ? 'scale' : random < QUESTION_TYPE_THRESHOLDS.DEEP_DIVE.MULTIPLE ? 'multiple' : random < QUESTION_TYPE_THRESHOLDS.DEEP_DIVE.EMOTION_SCALE ? 'emotion_scale' : 'single';
      case 'closing':
        return random < QUESTION_TYPE_THRESHOLDS.CLOSING.SCALE ? 'scale' : random < QUESTION_TYPE_THRESHOLDS.CLOSING.SINGLE ? 'single' : 'emotion_scale';
      default:
        return 'single';
    }
  }

  /**
   * Get empathy prefix based on stage and type
   */
  private getEmpathyPrefix(stage: ConversationStage, type: string): string {
    const prefixes = {
      warmup: [
        'お時間をいただき、ありがとうございます。',
        'お話しくださり、感謝しています。',
        'ゆっくりで大丈夫です。'
      ],
      exploration: [
        'お気持ちをお聞かせくださり、ありがとうございます。',
        'より詳しく教えていただけると嬉しいです。',
        'あなたの視点を大切にしたいと思います。'
      ],
      deep_dive: [
        '深いお話をありがとうございます。',
        'ご自身の内面と向き合ってくださり、ありがとうございます。',
        '率直なお気持ちを教えてください。'
      ],
      closing: [
        'これまでお話しくださり、ありがとうございました。',
        '最後に確認させてください。',
        'お疲れさまでした。'
      ]
    };

    const stagePrefixes = prefixes[stage.stage] || prefixes.warmup;
    return stagePrefixes[Math.floor(Math.random() * stagePrefixes.length)];
  }

  /**
   * Analyze conversation context
   */
  private analyzeConversationContext(messages: ChatMessage[]) {
    const userMessages = messages.filter(msg => msg.role === 'user');
    const recentContent = userMessages.slice(-MESSAGE_ANALYSIS.RECENT_MESSAGES_COUNT).map(msg => msg.content).join(' ');
    
    return {
      messageCount: userMessages.length,
      recentTopics: this.extractTopics(recentContent),
      emotionalTone: this.detectEmotionalTone(recentContent),
      engagementLevel: this.estimateEngagement(userMessages)
    };
  }

  /**
   * Extract topics from content
   */
  private extractTopics(content: string): string[] {
    const topicPatterns = [
      { pattern: /仕事|職場|会社/, topic: '仕事' },
      { pattern: /家族|親|子供/, topic: '家族' },
      { pattern: /恋愛|パートナー/, topic: '人間関係' },
      { pattern: /不安|心配/, topic: '不安' },
      { pattern: /将来|未来/, topic: '将来' }
    ];

    return topicPatterns
      .filter(({ pattern }) => pattern.test(content))
      .map(({ topic }) => topic);
  }

  /**
   * Detect emotional tone
   */
  private detectEmotionalTone(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = /良い|嬉しい|ありがとう|安心/;
    const negativeWords = /つらい|不安|困る|悩む/;

    if (positiveWords.test(content)) return 'positive';
    if (negativeWords.test(content)) return 'negative';
    return 'neutral';
  }

  /**
   * Estimate engagement level
   */
  private estimateEngagement(messages: ChatMessage[]): number {
    if (messages.length === 0) return MESSAGE_ANALYSIS.DEFAULT_SAFETY_FALLBACK;

    const avgLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
    return Math.min(1, avgLength / MESSAGE_ANALYSIS.ENGAGEMENT_DIVISOR);
  }

  /**
   * Build diagnosis integration data
   */
  private buildDiagnosisIntegration(): DiagnosisIntegration {
    const result: DiagnosisIntegration = {};

    if (this.diagnosisData.mbti) {
      result.mbti = {
        type: this.diagnosisData.mbti.type,
        preferences: {
          thinking_style: this.getMBTIThinkingStyle(this.diagnosisData.mbti.type),
          communication_style: []
        }
      };
    }

    if (this.diagnosisData.taiheki) {
      result.taiheki = {
        type: this.diagnosisData.taiheki.primary,
        characteristics: this.diagnosisData.taiheki.characteristics || [],
        suggested_approach: []
      };
    }

    return result;
  }

  /**
   * Get MBTI thinking style
   */
  private getMBTIThinkingStyle(mbtiType: string): 'analytical' | 'intuitive' | 'empathetic' | 'structured' {
    if (mbtiType.includes('NT')) return 'analytical';
    if (mbtiType.includes('NF')) return 'empathetic';
    if (mbtiType.includes('ST')) return 'structured';
    return 'intuitive';
  }
}

interface ConversationContext {
  messageCount: number;
  recentTopics: string[];
  emotionalTone: 'positive' | 'neutral' | 'negative';
  engagementLevel: number;
}