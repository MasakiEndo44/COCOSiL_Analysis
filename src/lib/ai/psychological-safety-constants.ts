/**
 * Psychological Safety System Constants
 * Centralized configuration for psychological safety thresholds and parameters
 */

// Rogers' 3 Conditions Scoring Weights
export const ROGERS_CONDITIONS_WEIGHTS = {
  SELF_CONGRUENCE: 0.25,
  UNCONDITIONAL_POSITIVE_REGARD: 0.45, // Most important for safety
  EMPATHIC_UNDERSTANDING: 0.30,
} as const;

// Safety Score Thresholds
export const SAFETY_SCORE_THRESHOLDS = {
  LOW: 0.4,         // Recovery mode activation
  MEDIUM: 0.6,      // Caution zone
  HIGH: 0.7,        // Safe for deep questions
  EXCELLENT: 0.8,   // Optimal safety level
} as const;

// Conversation Stage Configuration
export const CONVERSATION_STAGES = {
  WARMUP: {
    max_questions: 2,
    choice_ratio: 0.8,
    safety_threshold: 0.6,
  },
  EXPLORATION: {
    max_questions: 7,
    choice_ratio: 0.6,
    safety_threshold: 0.5,
  },
  DEEP_DIVE: {
    max_questions: 15,
    choice_ratio: 0.4,
    safety_threshold: 0.4,
  },
  CLOSING: {
    choice_ratio: 0.7,
    safety_threshold: 0.6,
  },
} as const;

// Engagement Level Calculation
export const ENGAGEMENT_SCORING = {
  WORD_COUNT_WEIGHT: 0.4,
  POSITIVE_LANGUAGE_WEIGHT: 0.3,
  ENGAGEMENT_PATTERN_BONUS: 0.2,
  RESISTANCE_PENALTY: -0.3,
  DETAILED_RESPONSE_BONUS: 0.1, // For responses > 30 words
  WORD_COUNT_DIVISOR: 50, // For normalization
} as const;

// Response Analysis Thresholds
export const RESPONSE_ANALYSIS = {
  SHORT_RESPONSE_THRESHOLD: 10, // words
  DETAILED_RESPONSE_THRESHOLD: 30, // words
  AVERAGE_LENGTH_DIVISOR: 100, // For engagement calculation
  CLARIFICATION_REQUEST_THRESHOLD: 10, // words
} as const;

// Rogers Conditions Component Weights
export const ROGERS_COMPONENT_WEIGHTS = {
  SELF_CONGRUENCE: {
    AUTHENTICITY: 0.4,
    TRANSPARENCY: 0.3,
    LIMITATIONS_ACKNOWLEDGED: 0.3,
  },
  POSITIVE_REGARD: {
    ACCEPTANCE_LEVEL: 0.5,
    NON_JUDGMENTAL_LANGUAGE: 0.25,
    VALIDATION_PRESENT: 0.25,
  },
  EMPATHIC_UNDERSTANDING: {
    UNDERSTANDING_LEVEL: 0.4,
    REFLECTION_ACCURACY: 0.4,
    CLARIFICATION_NOT_NEEDED: 0.2, // Bonus for not needing clarification
  },
} as const;

// Safety Recovery Actions
export const RECOVERY_ACTIONS = {
  EMPATHY_MESSAGE_THRESHOLD: 0.4,
  CHOICE_QUESTIONS_ONLY_THRESHOLD: 0.3,
  PRIVACY_REMINDER_THRESHOLD: 0.35,
  CONVERSATION_PAUSE_THRESHOLD: 0.25,
} as const;

// Trend Analysis
export const TREND_ANALYSIS = {
  RECENT_RESPONSES_COUNT: 3, // Last N responses to analyze
  TREND_IMPROVEMENT_THRESHOLD: 0.1, // Minimum improvement to be considered positive
  TREND_WEIGHT: 0.1, // How much trend affects overall score
} as const;

// Token and Performance Limits
export const PERFORMANCE_LIMITS = {
  PSYCHOLOGICAL_SAFETY_MAX_TOKENS: 1500,
  TEMPERATURE_EMPATHETIC: 0.8, // Higher for warmer responses
  TEMPERATURE_ANALYTICAL: 0.6, // Lower for more focused responses
  CONVERSATION_WINDOW_SIZE: 20,
  MAX_STORED_MESSAGES: 50,
} as const;

// Question Type Selection Probabilities
export const QUESTION_TYPE_PROBABILITIES = {
  WARMUP: {
    SINGLE: 0.6,
    EMOTION_SCALE: 0.2,
    SCALE: 0.2,
    MULTIPLE: 0.0,
  },
  EXPLORATION: {
    SINGLE: 0.4,
    MULTIPLE: 0.2,
    SCALE: 0.2,
    EMOTION_SCALE: 0.2,
  },
  DEEP_DIVE: {
    SCALE: 0.3,
    MULTIPLE: 0.2,
    EMOTION_SCALE: 0.3,
    SINGLE: 0.2,
  },
  CLOSING: {
    SCALE: 0.5,
    SINGLE: 0.3,
    EMOTION_SCALE: 0.2,
    MULTIPLE: 0.0,
  },
} as const;

// Validation Constants
export const VALIDATION_LIMITS = {
  MIN_CONTENT_LENGTH: 1,
  MAX_CONTENT_LENGTH: 5000,
  MIN_SAFETY_SCORE: 0.0,
  MAX_SAFETY_SCORE: 1.0,
  MAX_QUESTION_OPTIONS: 10,
  MIN_QUESTION_OPTIONS: 2,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_SAFETY_SCORE: 'Safety score must be between 0 and 1',
  MISSING_DIAGNOSIS_DATA: 'Diagnosis data is required',
  INVALID_MESSAGE_FORMAT: 'Invalid message format',
  CONVERSATION_TOO_LONG: 'Conversation exceeds maximum length',
  INSUFFICIENT_DATA: 'Insufficient data for analysis',
} as const;

// Performance Monitoring
export const PERFORMANCE_METRICS = {
  SLOW_CALCULATION_THRESHOLD: 100, // milliseconds
  MEMORY_WARNING_THRESHOLD: 50, // MB
  API_TIMEOUT_WARNING: 5000, // milliseconds
} as const;

// Type guards for constants validation
export const isValidSafetyScore = (score: number): boolean => 
  score >= VALIDATION_LIMITS.MIN_SAFETY_SCORE && 
  score <= VALIDATION_LIMITS.MAX_SAFETY_SCORE;

export const isValidContentLength = (content: string): boolean =>
  content.length >= VALIDATION_LIMITS.MIN_CONTENT_LENGTH &&
  content.length <= VALIDATION_LIMITS.MAX_CONTENT_LENGTH;

// Helper functions for threshold checking
export const getSafetyLevel = (score: number): 'low' | 'medium' | 'high' | 'excellent' => {
  if (score < SAFETY_SCORE_THRESHOLDS.LOW) return 'low';
  if (score < SAFETY_SCORE_THRESHOLDS.MEDIUM) return 'medium';
  if (score < SAFETY_SCORE_THRESHOLDS.HIGH) return 'high';
  return 'excellent';
};

export const shouldActivateRecovery = (score: number): boolean =>
  score < SAFETY_SCORE_THRESHOLDS.LOW;

export const getStageConfig = (stage: keyof typeof CONVERSATION_STAGES) =>
  CONVERSATION_STAGES[stage];

export const getQuestionTypeProbabilities = (stage: keyof typeof QUESTION_TYPE_PROBABILITIES) =>
  QUESTION_TYPE_PROBABILITIES[stage];

// Prompt Engine Specific Constants
export const PROMPT_ENGINE_CONFIG = {
  INITIAL_SAFETY_SCORE: 0.8,        // Start optimistic
  DETAILED_RESPONSE_THRESHOLD: 20,   // Words for engagement bonus
  MINIMAL_RESPONSE_THRESHOLD: 5,     // Words for negative scoring
  TRANSPARENCY_THRESHOLD: 10,        // Words for transparency scoring
  RESISTANCE_THRESHOLD: 2,           // Negative words threshold
  ENGAGEMENT_BOOST: 0.2,             // Bonus for engagement
  UNDERSTANDING_BOOST: 0.2,          // Understanding level boost
  UNDERSTANDING_CAP: 0.9,            // Maximum understanding score
  CHOICE_OPTIONS_COUNT: 4,           // Number of choice options (3-4)
  CHOICE_OPTIONS_MIN: 3,             // Minimum choice options
} as const;

// Stage Transition Thresholds
export const STAGE_TRANSITION = {
  WARMUP_MAX_QUESTIONS: 2,
  EXPLORATION_MAX_QUESTIONS: 7,
  DEEP_DIVE_MAX_QUESTIONS: 15,
} as const;

// Rogers Conditions Scoring Values
export const ROGERS_SCORING_VALUES = {
  HIGH_AUTHENTICITY: 0.8,
  LOW_AUTHENTICITY: 0.6,
  HIGH_ACCEPTANCE: 0.8,
  LOW_ACCEPTANCE: 0.4,
  HIGH_UNDERSTANDING: 0.8,
  LOW_UNDERSTANDING: 0.6,
  HIGH_REFLECTION: 0.8,
  LOW_REFLECTION: 0.6,
  THRESHOLD_SCORE: 0.6,
  MINIMUM_OVERALL: 0.5,
} as const;

// Default Safety Score Components for fallback
export const DEFAULT_SAFETY_COMPONENTS = {
  OVERALL: 0.8,
  SELF_CONGRUENCE: {
    AUTHENTICITY: 0.8,
    TRANSPARENCY: 0.8,
  },
  POSITIVE_REGARD: {
    ACCEPTANCE: 0.8,
  },
  EMPATHIC_UNDERSTANDING: {
    UNDERSTANDING: 0.8,
    REFLECTION: 0.8,
  },
} as const;
// Taiheki type ranges for question adaptation
export const TAIHEKI_TYPE_RANGES = {
  UPPER_LOWER_MAX: 2,    // 上下型・左右型
  FRONT_BACK_MIN: 3,     // 前後型
  FRONT_BACK_MAX: 4,     // 前後型
  DEFAULT_TYPE: 1,       // Default fallback type
} as const;

// Scale question configuration
export const SCALE_QUESTION_CONFIG = {
  MIN_VALUE: 1,
  MAX_VALUE: 5,
  MIDDLE_VALUE: 3,
} as const;

// Message analysis constants
export const MESSAGE_ANALYSIS = {
  RECENT_MESSAGES_COUNT: 3,     // Number of recent messages to analyze
  DEFAULT_SAFETY_FALLBACK: 0.5, // Default when no messages available
  ENGAGEMENT_DIVISOR: 100,      // For engagement calculation normalization
} as const;

// Question type selection thresholds for random distribution
export const QUESTION_TYPE_THRESHOLDS = {
  WARMUP: {
    SINGLE: 0.6,
    EMOTION_SCALE: 0.8,
  },
  EXPLORATION: {
    SINGLE: 0.4,
    MULTIPLE: 0.6,
    SCALE: 0.8,
  },
  DEEP_DIVE: {
    SCALE: 0.3,
    MULTIPLE: 0.5,
    EMOTION_SCALE: 0.7,
  },
  CLOSING: {
    SCALE: 0.5,
    SINGLE: 0.8,
  },
} as const;