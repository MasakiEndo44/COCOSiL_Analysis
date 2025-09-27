/**
 * @jest-environment node
 */

import {
  ROGERS_CONDITIONS_WEIGHTS,
  SAFETY_SCORE_THRESHOLDS,
  CONVERSATION_STAGES,
  ENGAGEMENT_SCORING,
  PROMPT_ENGINE_CONFIG,
  STAGE_TRANSITION,
  ROGERS_SCORING_VALUES,
  DEFAULT_SAFETY_COMPONENTS,
  QUESTION_TYPE_THRESHOLDS,
  TAIHEKI_TYPE_RANGES,
  SCALE_QUESTION_CONFIG,
  isValidSafetyScore,
  isValidContentLength,
  getSafetyLevel,
  shouldActivateRecovery,
  getStageConfig,
  getQuestionTypeProbabilities,
} from '@/lib/ai/psychological-safety-constants';

describe('Psychological Safety Constants', () => {
  describe('Rogers Conditions Weights', () => {
    test('should have correct weight distribution totaling 1.0', () => {
      const total = 
        ROGERS_CONDITIONS_WEIGHTS.SELF_CONGRUENCE +
        ROGERS_CONDITIONS_WEIGHTS.UNCONDITIONAL_POSITIVE_REGARD +
        ROGERS_CONDITIONS_WEIGHTS.EMPATHIC_UNDERSTANDING;
      
      expect(total).toBeCloseTo(1.0, 2);
    });

    test('should prioritize unconditional positive regard', () => {
      expect(ROGERS_CONDITIONS_WEIGHTS.UNCONDITIONAL_POSITIVE_REGARD).toBeGreaterThan(
        ROGERS_CONDITIONS_WEIGHTS.SELF_CONGRUENCE
      );
      expect(ROGERS_CONDITIONS_WEIGHTS.UNCONDITIONAL_POSITIVE_REGARD).toBeGreaterThan(
        ROGERS_CONDITIONS_WEIGHTS.EMPATHIC_UNDERSTANDING
      );
    });

    test('should have reasonable weight values', () => {
      Object.values(ROGERS_CONDITIONS_WEIGHTS).forEach(weight => {
        expect(weight).toBeGreaterThan(0);
        expect(weight).toBeLessThan(1);
      });
    });
  });

  describe('Safety Score Thresholds', () => {
    test('should have ascending threshold values', () => {
      expect(SAFETY_SCORE_THRESHOLDS.LOW).toBeLessThan(SAFETY_SCORE_THRESHOLDS.MEDIUM);
      expect(SAFETY_SCORE_THRESHOLDS.MEDIUM).toBeLessThan(SAFETY_SCORE_THRESHOLDS.HIGH);
      expect(SAFETY_SCORE_THRESHOLDS.HIGH).toBeLessThan(SAFETY_SCORE_THRESHOLDS.EXCELLENT);
    });

    test('should have values within valid range', () => {
      Object.values(SAFETY_SCORE_THRESHOLDS).forEach(threshold => {
        expect(threshold).toBeGreaterThan(0);
        expect(threshold).toBeLessThan(1);
      });
    });
  });

  describe('Conversation Stages', () => {
    test('should have decreasing choice ratios as conversation deepens', () => {
      expect(CONVERSATION_STAGES.WARMUP.choice_ratio).toBeGreaterThan(
        CONVERSATION_STAGES.EXPLORATION.choice_ratio
      );
      expect(CONVERSATION_STAGES.EXPLORATION.choice_ratio).toBeGreaterThan(
        CONVERSATION_STAGES.DEEP_DIVE.choice_ratio
      );
    });

    test('should have logical question count progression', () => {
      expect(CONVERSATION_STAGES.WARMUP.max_questions).toBeLessThan(
        CONVERSATION_STAGES.EXPLORATION.max_questions
      );
      expect(CONVERSATION_STAGES.EXPLORATION.max_questions).toBeLessThan(
        CONVERSATION_STAGES.DEEP_DIVE.max_questions
      );
    });

    test('should have appropriate safety thresholds', () => {
      Object.values(CONVERSATION_STAGES).forEach(stage => {
        expect(stage.safety_threshold).toBeGreaterThan(0);
        expect(stage.safety_threshold).toBeLessThan(1);
        expect(stage.choice_ratio).toBeGreaterThan(0);
        expect(stage.choice_ratio).toBeLessThan(1);
      });
    });
  });

  describe('Engagement Scoring', () => {
    test('should have positive weight values', () => {
      expect(ENGAGEMENT_SCORING.WORD_COUNT_WEIGHT).toBeGreaterThan(0);
      expect(ENGAGEMENT_SCORING.POSITIVE_LANGUAGE_WEIGHT).toBeGreaterThan(0);
      expect(ENGAGEMENT_SCORING.ENGAGEMENT_PATTERN_BONUS).toBeGreaterThan(0);
    });

    test('should have negative resistance penalty', () => {
      expect(ENGAGEMENT_SCORING.RESISTANCE_PENALTY).toBeLessThan(0);
    });

    test('should have reasonable divisor values', () => {
      expect(ENGAGEMENT_SCORING.WORD_COUNT_DIVISOR).toBeGreaterThan(0);
      expect(ENGAGEMENT_SCORING.WORD_COUNT_DIVISOR).toBeLessThan(200); // Should be reasonable for normalization
    });
  });

  describe('Question Type Thresholds', () => {
    test('should have valid probability thresholds', () => {
      Object.values(QUESTION_TYPE_THRESHOLDS).forEach(stageThresholds => {
        Object.values(stageThresholds).forEach(threshold => {
          expect(threshold).toBeGreaterThan(0);
          expect(threshold).toBeLessThanOrEqual(1);
        });
      });
    });

    test('should have ascending thresholds within each stage', () => {
      // Warmup stage
      expect(QUESTION_TYPE_THRESHOLDS.WARMUP.SINGLE).toBeLessThan(
        QUESTION_TYPE_THRESHOLDS.WARMUP.EMOTION_SCALE
      );

      // Exploration stage
      expect(QUESTION_TYPE_THRESHOLDS.EXPLORATION.SINGLE).toBeLessThan(
        QUESTION_TYPE_THRESHOLDS.EXPLORATION.MULTIPLE
      );
      expect(QUESTION_TYPE_THRESHOLDS.EXPLORATION.MULTIPLE).toBeLessThan(
        QUESTION_TYPE_THRESHOLDS.EXPLORATION.SCALE
      );
    });
  });

  describe('Taiheki Type Ranges', () => {
    test('should have logical type ranges', () => {
      expect(TAIHEKI_TYPE_RANGES.DEFAULT_TYPE).toBe(1);
      expect(TAIHEKI_TYPE_RANGES.UPPER_LOWER_MAX).toBeGreaterThan(TAIHEKI_TYPE_RANGES.DEFAULT_TYPE);
      expect(TAIHEKI_TYPE_RANGES.FRONT_BACK_MIN).toBeGreaterThan(TAIHEKI_TYPE_RANGES.UPPER_LOWER_MAX);
      expect(TAIHEKI_TYPE_RANGES.FRONT_BACK_MAX).toBeGreaterThanOrEqual(TAIHEKI_TYPE_RANGES.FRONT_BACK_MIN);
    });
  });

  describe('Scale Question Config', () => {
    test('should have valid scale range', () => {
      expect(SCALE_QUESTION_CONFIG.MIN_VALUE).toBe(1);
      expect(SCALE_QUESTION_CONFIG.MAX_VALUE).toBe(5);
      expect(SCALE_QUESTION_CONFIG.MIDDLE_VALUE).toBe(3);
      
      expect(SCALE_QUESTION_CONFIG.MIN_VALUE).toBeLessThan(SCALE_QUESTION_CONFIG.MIDDLE_VALUE);
      expect(SCALE_QUESTION_CONFIG.MIDDLE_VALUE).toBeLessThan(SCALE_QUESTION_CONFIG.MAX_VALUE);
    });
  });

  describe('Helper Functions', () => {
    describe('isValidSafetyScore', () => {
      test('should accept valid scores', () => {
        expect(isValidSafetyScore(0.0)).toBe(true);
        expect(isValidSafetyScore(0.5)).toBe(true);
        expect(isValidSafetyScore(1.0)).toBe(true);
      });

      test('should reject invalid scores', () => {
        expect(isValidSafetyScore(-0.1)).toBe(false);
        expect(isValidSafetyScore(1.1)).toBe(false);
        expect(isValidSafetyScore(NaN)).toBe(false);
      });
    });

    describe('isValidContentLength', () => {
      test('should accept valid content lengths', () => {
        expect(isValidContentLength('a')).toBe(true);
        expect(isValidContentLength('Hello world')).toBe(true);
      });

      test('should reject invalid content lengths', () => {
        expect(isValidContentLength('')).toBe(false);
        expect(isValidContentLength('x'.repeat(5001))).toBe(false);
      });
    });

    describe('getSafetyLevel', () => {
      test('should return correct safety levels', () => {
        expect(getSafetyLevel(0.3)).toBe('low');
        expect(getSafetyLevel(0.5)).toBe('medium');
        expect(getSafetyLevel(0.65)).toBe('high');
        expect(getSafetyLevel(0.8)).toBe('excellent');
      });

      test('should handle boundary values correctly', () => {
        expect(getSafetyLevel(SAFETY_SCORE_THRESHOLDS.LOW)).toBe('medium');
        expect(getSafetyLevel(SAFETY_SCORE_THRESHOLDS.MEDIUM)).toBe('high');
        expect(getSafetyLevel(SAFETY_SCORE_THRESHOLDS.HIGH)).toBe('excellent');
      });
    });

    describe('shouldActivateRecovery', () => {
      test('should activate recovery for low scores', () => {
        expect(shouldActivateRecovery(0.3)).toBe(true);
        expect(shouldActivateRecovery(SAFETY_SCORE_THRESHOLDS.LOW - 0.01)).toBe(true);
      });

      test('should not activate recovery for acceptable scores', () => {
        expect(shouldActivateRecovery(0.5)).toBe(false);
        expect(shouldActivateRecovery(SAFETY_SCORE_THRESHOLDS.LOW)).toBe(false);
      });
    });

    describe('getStageConfig', () => {
      test('should return valid stage configurations', () => {
        const warmupConfig = getStageConfig('WARMUP');
        expect(warmupConfig).toHaveProperty('max_questions');
        expect(warmupConfig).toHaveProperty('choice_ratio');
        expect(warmupConfig).toHaveProperty('safety_threshold');
      });

      test('should return different configs for different stages', () => {
        const warmupConfig = getStageConfig('WARMUP');
        const deepDiveConfig = getStageConfig('DEEP_DIVE');
        
        expect(warmupConfig.choice_ratio).toBeGreaterThan(deepDiveConfig.choice_ratio);
      });
    });

    describe('getQuestionTypeProbabilities', () => {
      test('should return valid probability configurations', () => {
        const warmupProbs = getQuestionTypeProbabilities('WARMUP');
        expect(warmupProbs).toHaveProperty('SINGLE');
        expect(warmupProbs).toHaveProperty('EMOTION_SCALE');
      });

      test('should return different probabilities for different stages', () => {
        const warmupProbs = getQuestionTypeProbabilities('WARMUP');
        const explorationProbs = getQuestionTypeProbabilities('EXPLORATION');
        
        expect(warmupProbs.SINGLE).toBeGreaterThan(explorationProbs.SINGLE);
      });
    });
  });

  describe('Constant Integrity', () => {
    test('should have all constants properly defined', () => {
      expect(ROGERS_CONDITIONS_WEIGHTS).toBeDefined();
      expect(SAFETY_SCORE_THRESHOLDS).toBeDefined();
      expect(CONVERSATION_STAGES).toBeDefined();
      expect(ENGAGEMENT_SCORING).toBeDefined();
      expect(PROMPT_ENGINE_CONFIG).toBeDefined();
      expect(STAGE_TRANSITION).toBeDefined();
      expect(ROGERS_SCORING_VALUES).toBeDefined();
      expect(DEFAULT_SAFETY_COMPONENTS).toBeDefined();
    });

    test('should have no undefined values in constants', () => {
      const checkObject = (obj: any, path = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            checkObject(value, currentPath);
          } else {
            expect(value).toBeDefined();
            expect(value).not.toBeNaN();
          }
        });
      };

      checkObject(ROGERS_CONDITIONS_WEIGHTS);
      checkObject(SAFETY_SCORE_THRESHOLDS);
      checkObject(CONVERSATION_STAGES);
      checkObject(ENGAGEMENT_SCORING);
    });
  });
});