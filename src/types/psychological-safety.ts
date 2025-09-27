/**
 * Type definitions for psychological safety AI chat system
 * Based on Carl Rogers' 3 conditions for effective counseling
 */

export interface RogersConditions {
  /** 自己一致 (Self-Congruence) - AI's authentic, honest expression */
  selfCongruence: {
    authenticity: number;
    transparency: number;
    limitations_acknowledged: boolean;
  };
  
  /** 無条件の肯定的尊重 (Unconditional Positive Regard) - Non-judgmental acceptance */
  unconditionalPositiveRegard: {
    acceptance_level: number;
    non_judgmental_language: boolean;
    validation_present: boolean;
  };
  
  /** 共感的理解 (Empathetic Understanding) - Deep understanding of user's perspective */
  empathicUnderstanding: {
    understanding_level: number;
    reflection_accuracy: number;
    clarification_requested: boolean;
  };
}

export interface PsychologicalSafetyScore {
  overall: number; // 0.0-1.0
  components: RogersConditions;
  recommendations: string[];
  recovery_needed: boolean;
}

export interface ConversationStage {
  stage: 'warmup' | 'exploration' | 'deep_dive' | 'closing';
  questionCount: number;
  choiceRatio: number; // Percentage of choice questions vs open questions
  safetyThreshold: number;
}

export interface ChoiceQuestion {
  id: string;
  type: 'single' | 'multiple' | 'scale' | 'emotion_scale';
  question: string;
  empathyPrefix: string; // Rogers-compliant empathetic introduction
  options: ChoiceOption[];
  followUp?: string;
  safetyMessage: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  description?: string; // Max 20 characters
  emoji?: string;
  followUpQuestions?: string[];
}

export interface SafetyRecoveryAction {
  trigger: 'low_safety_score' | 'negative_language' | 'user_resistance';
  action: 'show_empathy' | 'offer_choice_questions' | 'privacy_reminder' | 'conversation_pause';
  message: string;
}

export interface PsychologicalSafetyPrompt {
  systemPrompt: string;
  stage: ConversationStage;
  safetyScore: PsychologicalSafetyScore;
  questionType: 'choice' | 'open' | 'hybrid';
  recoveryActions?: SafetyRecoveryAction[];
}

export interface UserResponseAnalysis {
  safetyIndicators: {
    positive_language: string[];
    negative_language: string[];
    emotional_expression: 'open' | 'guarded' | 'resistant';
    engagement_level: number;
  };
  content_analysis: {
    word_count: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    emotional_words: string[];
  };
  rogers_compliance: RogersConditions;
}

export interface DiagnosisIntegration {
  mbti?: {
    type: string;
    preferences: {
      thinking_style: 'analytical' | 'intuitive' | 'empathetic' | 'structured';
      communication_style: string[];
    };
  };
  taiheki?: {
    type: number;
    characteristics: string[];
    suggested_approach: string[];
  };
  fortune?: {
    current_period: string;
    emotional_tendencies: string[];
    recommended_timing: string;
  };
}