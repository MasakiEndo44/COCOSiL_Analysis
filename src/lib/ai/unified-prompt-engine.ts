/**
 * Unified Prompt Engine for COCOSiL AI Chat
 * Combines PsychologicalSafetyPromptEngine (Rogers 3 conditions) 
 * with IntegratedPromptEngine (4-diagnosis integration)
 */

import type { ChatMessage, UserDiagnosisData } from '@/types';
import type {
    PsychologicalSafetyPrompt,
    PsychologicalSafetyScore,
    ConversationStage,
    RogersConditions,
    UserResponseAnalysis,
    DiagnosisIntegration,
    SafetyRecoveryAction
} from '@/types/psychological-safety';
import {
    ROGERS_CONDITIONS_WEIGHTS,
    SAFETY_SCORE_THRESHOLDS,
    CONVERSATION_STAGES,
    PROMPT_ENGINE_CONFIG,
    STAGE_TRANSITION,
    ROGERS_SCORING_VALUES,
    DEFAULT_SAFETY_COMPONENTS,
} from './psychological-safety-constants';

export class UnifiedPromptEngine {
    private currentStage: ConversationStage['stage'] = 'warmup';
    private questionCount = 0;
    private lastSafetyScore: number = PROMPT_ENGINE_CONFIG.INITIAL_SAFETY_SCORE;
    private conversationHistory: UserResponseAnalysis[] = [];
    private diagnosisData: UserDiagnosisData;

    constructor(diagnosisData: UserDiagnosisData) {
        this.diagnosisData = diagnosisData;
    }

    /**
     * Main entry point - generates complete prompt with safety + diagnosis
     */
    public generatePrompt(messages: ChatMessage[] = []): PsychologicalSafetyPrompt {
        // Update conversation stage
        this.updateConversationStage(messages);

        // Calculate psychological safety
        const safetyScore = this.calculateSafetyScore(messages);
        this.lastSafetyScore = safetyScore.overall;

        // Select question type
        const questionType = this.selectQuestionType(safetyScore);

        // Get stage configuration
        const stage = this.getCurrentStageConfig();

        // Build unified system prompt
        const systemPrompt = this.buildUnifiedPrompt(stage, safetyScore, questionType);

        return {
            systemPrompt,
            stage,
            safetyScore,
            questionType,
            recoveryActions: safetyScore.recovery_needed
                ? this.generateRecoveryActions(safetyScore)
                : undefined
        };
    }

    /**
     * Build unified system prompt
     * Combines Rogers 3 conditions + 4-diagnosis integration
     */
    private buildUnifiedPrompt(
        stage: ConversationStage,
        safetyScore: PsychologicalSafetyScore,
        questionType: 'choice' | 'open' | 'hybrid'
    ): string {
        const diagnosisIntegration = this.getDiagnosisIntegration();

        return `あなたは統合診断に基づく心理的安全性を重視するAIカウンセラーです。

## 基本理念（カール・ロジャーズ3条件）
1. 自己一致: AIとして誠実に、理解したい気持ちを素直に表現
2. 無条件の肯定的尊重: いかなる気持ちや選択も判断せず受容  
3. 共感的理解: 感情を要約・確認し、誤解時は即座に訂正

## 質問戦略
現在段階: ${stage.stage} (warmup/exploration/deep_dive/closing)
質問タイプ: ${questionType} (choice/open/hybrid)
心理的安全性スコア: ${safetyScore.overall.toFixed(2)}

## 応答スタイル
1. 温かい共感を自然に表現し、相手の感情や体験を受け止める
2. 相手の言葉を短く要約し、感じた気持ちに寄り添う（「〜と感じていらっしゃるのですね」）
3. 必要に応じて理解を確認するが、自然な表現で行う（「違っていたら教えてくださいね」など）
4. 選択式質問を3-4個提示し、相談者が答えやすい形で進める
5. 会話段階に応じて、自然な流れで感謝や励ましを表現する

## 診断データ活用
${diagnosisIntegration.mbti ? `- MBTI: ${diagnosisIntegration.mbti.type} - ${diagnosisIntegration.mbti.preferences.thinking_style}` : ''}
${diagnosisIntegration.taiheki ? `- 体癖: ${diagnosisIntegration.taiheki.type}型 - ${diagnosisIntegration.taiheki.characteristics.join(', ')}` : ''}
${diagnosisIntegration.fortune ? `- 運勢: ${diagnosisIntegration.fortune.current_period} - ${diagnosisIntegration.fortune.emotional_tendencies.join(', ')}` : ''}

## 今回の応答指示
段階: ${stage.stage}
安全性スコア: ${safetyScore.overall.toFixed(2)}
推奨質問タイプ: ${questionType}

${safetyScore.recovery_needed ? `
## 緊急対応: 心理的安全性回復モード
- 温かい共感メッセージを優先
- 選択式質問のみ使用
- プライバシー保護の再確認
- 会話の一時停止オプション提供
` : ''}

## 禁止言語パターン
避ける語: 正しい、間違っている、良い、悪い、べき、すべき
推奨語: 感じる、思う、考える、大切、理解、受け入れる`;
    }

    /**
     * Calculate psychological safety score based on Rogers' 3 conditions
     * From PsychologicalSafetyPromptEngine
     */
    private calculateSafetyScore(messages: ChatMessage[]): PsychologicalSafetyScore {
        if (messages.length === 0) {
            return this.getInitialSafetyScore();
        }

        const userMessages = messages.filter(msg => msg.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1];

        if (!lastUserMessage) {
            return this.getInitialSafetyScore();
        }

        const analysis = this.analyzeUserResponse(lastUserMessage.content);
        const rogersConditions = this.calculateRogersConditions(analysis);

        const overall = (
            rogersConditions.selfCongruence.authenticity * ROGERS_CONDITIONS_WEIGHTS.SELF_CONGRUENCE +
            rogersConditions.unconditionalPositiveRegard.acceptance_level * ROGERS_CONDITIONS_WEIGHTS.UNCONDITIONAL_POSITIVE_REGARD +
            rogersConditions.empathicUnderstanding.understanding_level * ROGERS_CONDITIONS_WEIGHTS.EMPATHIC_UNDERSTANDING
        );

        const recommendations = this.generateSafetyRecommendations(rogersConditions, overall);
        const recovery_needed = overall < SAFETY_SCORE_THRESHOLDS.LOW;

        return {
            overall,
            components: rogersConditions,
            recommendations,
            recovery_needed
        };
    }

    /**
     * Analyze user response for safety and engagement indicators
     */
    private analyzeUserResponse(content: string): UserResponseAnalysis {
        const words = content.toLowerCase().split(/\s+/);
        const wordCount = words.length;

        const positiveWords = ['感謝', 'ありがとう', 'うれしい', '良い', '安心', '理解', '共感', 'そうです', 'はい'];
        const negativeWords = ['いやだ', 'つらい', '無理', '嫌', '不安', 'わからない', '違う', 'ちがう'];

        const positive_language = positiveWords.filter(word => content.includes(word));
        const negative_language = negativeWords.filter(word => content.includes(word));

        let emotional_expression: 'open' | 'guarded' | 'resistant' = 'guarded';
        if (wordCount > PROMPT_ENGINE_CONFIG.DETAILED_RESPONSE_THRESHOLD && positive_language.length > 0) {
            emotional_expression = 'open';
        } else if (negative_language.length > positive_language.length || wordCount < PROMPT_ENGINE_CONFIG.MINIMAL_RESPONSE_THRESHOLD) {
            emotional_expression = 'resistant';
        }

        const engagement_level = Math.min(1.0, (wordCount / 100) + (positive_language.length * 0.1));

        let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
        if (positive_language.length > negative_language.length) {
            sentiment = 'positive';
        } else if (negative_language.length > positive_language.length) {
            sentiment = 'negative';
        }

        const topics = this.extractTopics(content);

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
                emotional_words: [...positive_language, ...negative_language]
            },
            rogers_compliance: this.calculateRogersConditions({
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
                    emotional_words: [...positive_language, ...negative_language]
                }
            } as UserResponseAnalysis)
        };
    }

    /**
     * Calculate Rogers' 3 conditions compliance
     */
    private calculateRogersConditions(analysis: Partial<UserResponseAnalysis>): RogersConditions {
        const safetyIndicators = analysis.safetyIndicators;
        const contentAnalysis = analysis.content_analysis;

        if (!safetyIndicators || !contentAnalysis) {
            return this.getDefaultRogersConditions();
        }

        const authenticity = safetyIndicators.engagement_level;
        const transparency = contentAnalysis.word_count > 20 ? 0.8 : 0.6;
        const limitations_acknowledged = true;

        const acceptance_level = safetyIndicators.emotional_expression === 'resistant' ? 0.6 : 0.8;
        const non_judgmental_language = safetyIndicators.negative_language.length < 3;
        const validation_present = safetyIndicators.positive_language.length > 0;

        const understanding_level = Math.min(1.0, safetyIndicators.engagement_level + 0.1);
        const reflection_accuracy = contentAnalysis.sentiment !== 'negative' ? 0.8 : 0.6;
        const clarification_requested = contentAnalysis.word_count < 20;

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
     * Update conversation stage based on progress
     */
    private updateConversationStage(messages: ChatMessage[]): void {
        this.questionCount = messages.filter(msg => msg.role === 'assistant').length;

        if (this.questionCount <= STAGE_TRANSITION.WARMUP_MAX_QUESTIONS) {
            this.currentStage = 'warmup';
        } else if (this.questionCount <= STAGE_TRANSITION.EXPLORATION_MAX_QUESTIONS) {
            this.currentStage = 'exploration';
        } else if (this.questionCount <= STAGE_TRANSITION.DEEP_DIVE_MAX_QUESTIONS) {
            this.currentStage = 'deep_dive';
        } else {
            this.currentStage = 'closing';
        }
    }

    /**
     * Select optimal question type based on safety score and stage
     */
    private selectQuestionType(safetyScore: PsychologicalSafetyScore): 'choice' | 'open' | 'hybrid' {
        if (safetyScore.overall < SAFETY_SCORE_THRESHOLDS.LOW) {
            return 'choice';
        }

        const stageRatios = {
            warmup: { choice: CONVERSATION_STAGES.WARMUP.choice_ratio, open: 1 - CONVERSATION_STAGES.WARMUP.choice_ratio },
            exploration: { choice: CONVERSATION_STAGES.EXPLORATION.choice_ratio, open: 1 - CONVERSATION_STAGES.EXPLORATION.choice_ratio },
            deep_dive: { choice: CONVERSATION_STAGES.DEEP_DIVE.choice_ratio, open: 1 - CONVERSATION_STAGES.DEEP_DIVE.choice_ratio },
            closing: { choice: CONVERSATION_STAGES.CLOSING.choice_ratio, open: 1 - CONVERSATION_STAGES.CLOSING.choice_ratio }
        };

        const ratio = stageRatios[this.currentStage];
        const random = Math.random();

        if (random < ratio.choice) {
            return 'choice';
        } else if (random < ratio.choice + ratio.open) {
            return 'open';
        } else {
            return 'hybrid';
        }
    }

    /**
     * Get current stage configuration
     */
    private getCurrentStageConfig(): ConversationStage {
        const stageConfigs = {
            warmup: { choiceRatio: CONVERSATION_STAGES.WARMUP.choice_ratio, safetyThreshold: CONVERSATION_STAGES.WARMUP.safety_threshold },
            exploration: { choiceRatio: CONVERSATION_STAGES.EXPLORATION.choice_ratio, safetyThreshold: CONVERSATION_STAGES.EXPLORATION.safety_threshold },
            deep_dive: { choiceRatio: CONVERSATION_STAGES.DEEP_DIVE.choice_ratio, safetyThreshold: CONVERSATION_STAGES.DEEP_DIVE.safety_threshold },
            closing: { choiceRatio: CONVERSATION_STAGES.CLOSING.choice_ratio, safetyThreshold: CONVERSATION_STAGES.CLOSING.safety_threshold }
        };

        const config = stageConfigs[this.currentStage];

        return {
            stage: this.currentStage,
            questionCount: this.questionCount,
            choiceRatio: config.choiceRatio,
            safetyThreshold: config.safetyThreshold
        };
    }

    /**
     * Get diagnosis integration data
     * From IntegratedPromptEngine
     */
    private getDiagnosisIntegration(): DiagnosisIntegration {
        const result: DiagnosisIntegration = {};

        if (this.diagnosisData.mbti) {
            result.mbti = {
                type: this.diagnosisData.mbti.type,
                preferences: {
                    thinking_style: this.getMBTIThinkingStyle(this.diagnosisData.mbti.type),
                    communication_style: this.getMBTICommunicationStyle(this.diagnosisData.mbti.type)
                }
            };
        }

        if (this.diagnosisData.taiheki) {
            result.taiheki = {
                type: this.diagnosisData.taiheki.primary,
                characteristics: this.diagnosisData.taiheki.characteristics || [],
                suggested_approach: this.getTaihekiApproach(this.diagnosisData.taiheki.primary)
            };
        }

        if (this.diagnosisData.fortune) {
            result.fortune = {
                current_period: this.diagnosisData.fortune.fortune || '現在',
                emotional_tendencies: this.diagnosisData.fortune.characteristics || [],
                recommended_timing: '適切なタイミング'
            };
        }

        return result;
    }

    // Helper methods
    private getInitialSafetyScore(): PsychologicalSafetyScore {
        return {
            overall: DEFAULT_SAFETY_COMPONENTS.OVERALL,
            components: this.getDefaultRogersConditions(),
            recommendations: ['温かい共感から始める', '選択式質問を多用する'],
            recovery_needed: false
        };
    }

    private getDefaultRogersConditions(): RogersConditions {
        return {
            selfCongruence: {
                authenticity: DEFAULT_SAFETY_COMPONENTS.SELF_CONGRUENCE.AUTHENTICITY,
                transparency: DEFAULT_SAFETY_COMPONENTS.SELF_CONGRUENCE.TRANSPARENCY,
                limitations_acknowledged: true
            },
            unconditionalPositiveRegard: {
                acceptance_level: DEFAULT_SAFETY_COMPONENTS.POSITIVE_REGARD.ACCEPTANCE,
                non_judgmental_language: true,
                validation_present: true
            },
            empathicUnderstanding: {
                understanding_level: DEFAULT_SAFETY_COMPONENTS.EMPATHIC_UNDERSTANDING.UNDERSTANDING,
                reflection_accuracy: DEFAULT_SAFETY_COMPONENTS.EMPATHIC_UNDERSTANDING.REFLECTION,
                clarification_requested: false
            }
        };
    }

    private generateSafetyRecommendations(conditions: RogersConditions, overall: number): string[] {
        const recommendations: string[] = [];

        if (conditions.selfCongruence.authenticity < ROGERS_SCORING_VALUES.THRESHOLD_SCORE) {
            recommendations.push('より誠実で親しみやすい表現を使用する');
        }

        if (conditions.unconditionalPositiveRegard.acceptance_level < ROGERS_SCORING_VALUES.THRESHOLD_SCORE) {
            recommendations.push('判断的な言葉を避け、受容的な表現を増やす');
        }

        if (conditions.empathicUnderstanding.understanding_level < ROGERS_SCORING_VALUES.THRESHOLD_SCORE) {
            recommendations.push('相手の感情をより深く反映し、理解確認を行う');
        }

        if (overall < ROGERS_SCORING_VALUES.MINIMUM_OVERALL) {
            recommendations.push('選択式質問を優先し、プレッシャーを軽減する');
        }

        return recommendations;
    }

    private generateRecoveryActions(safetyScore: PsychologicalSafetyScore): SafetyRecoveryAction[] {
        const actions: SafetyRecoveryAction[] = [];

        if (safetyScore.overall < SAFETY_SCORE_THRESHOLDS.LOW) {
            actions.push({
                trigger: 'low_safety_score' as const,
                action: 'show_empathy' as const,
                message: 'お話しくださり、本当にありがとうございます。あなたのお気持ちを大切に受け止めています。'
            });

            actions.push({
                trigger: 'low_safety_score' as const,
                action: 'offer_choice_questions' as const,
                message: '答えやすい形で、以下の中からお選びいただけますでしょうか？'
            });
        }

        return actions;
    }

    private extractTopics(content: string): string[] {
        const topics = [];
        if (content.includes('仕事') || content.includes('職場')) topics.push('仕事');
        if (content.includes('家族') || content.includes('親')) topics.push('家族');
        if (content.includes('恋愛') || content.includes('パートナー')) topics.push('人間関係');
        if (content.includes('不安') || content.includes('心配')) topics.push('不安');
        if (content.includes('将来') || content.includes('未来')) topics.push('将来');
        return topics;
    }

    private getMBTIThinkingStyle(mbtiType: string): 'analytical' | 'intuitive' | 'empathetic' | 'structured' {
        if (mbtiType.includes('NT')) return 'analytical';
        if (mbtiType.includes('NF')) return 'empathetic';
        if (mbtiType.includes('ST')) return 'structured';
        if (mbtiType.includes('SF')) return 'empathetic';
        return 'intuitive';
    }

    private getMBTICommunicationStyle(mbtiType: string): string[] {
        const styles = [];
        if (mbtiType.includes('E')) styles.push('外向的な対話を好む');
        if (mbtiType.includes('I')) styles.push('内省的な時間を必要とする');
        if (mbtiType.includes('N')) styles.push('可能性や概念について話したい');
        if (mbtiType.includes('S')) styles.push('具体的で実践的な話題を好む');
        if (mbtiType.includes('T')) styles.push('論理的な分析を重視する');
        if (mbtiType.includes('F')) styles.push('感情や価値観を大切にする');
        return styles;
    }

    private getTaihekiApproach(type: number): string[] {
        const approaches = {
            1: ['目標設定を明確にする', '責任感に訴える'],
            2: ['バランスの取れた選択肢を提示', '調和を重視する'],
            3: ['感情的な共感を大切にする', '直感を尊重する'],
            4: ['論理的な説明を重視', '分析的なアプローチ'],
            5: ['変化と刺激を提供', '柔軟性を保つ'],
            6: ['安定性と継続性を重視', '段階的な進歩'],
            7: ['創造性と表現を尊重', '個性を認める'],
            8: ['実用性と効率を重視', '具体的な成果'],
            9: ['精神性と深さを大切に', '内面的な探求'],
            10: ['社会性と協調を重視', '集団での調和']
        };
        return approaches[type as keyof typeof approaches] || ['個別的なアプローチ'];
    }
}
