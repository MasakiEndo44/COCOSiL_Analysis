// 体癖ペルソナテスト用型定義

export type TaihekiType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TaihekiPersona {
  id: string;
  type: TaihekiType;
  name: string;
  description: string;
  demographics: {
    age: number;
    occupation: string;
    background: string;
  };
  coreTraits: {
    physicalTendencies: string[];
    mentalPatterns: string[];
    behavioralStyles: string[];
    stressResponses: string[];
  };
  responsePatterns: {
    questionId: number;
    mostLikelyChoice: number;
    alternativeChoices: number[];
    reasoning: string;
    confidence: number; // 1-10
  }[];
}

export interface TestResult {
  personaId: string;
  expectedType: TaihekiType;
  actualPrimary: TaihekiType;
  actualSecondary: TaihekiType;
  confidence: number;
  accuracy: boolean;
  scores: Record<TaihekiType, number>;
  timestamp: Date;
}

export interface TestSuite {
  id: string;
  timestamp: Date;
  totalPersonas: number;
  results: TestResult[];
  metrics: {
    overallAccuracy: number;
    perTypeAccuracy: Record<TaihekiType, number>;
    averageConfidence: number;
    confusionMatrix: number[][];
  };
}

export interface QuestionAnalysis {
  questionId: number;
  discriminationPower: number;
  correctPredictions: number;
  incorrectPredictions: number;
  problemTypes: TaihekiType[];
  suggestedImprovements: string[];
}

export interface OptimizationSuggestion {
  type: 'weight_adjustment' | 'choice_rewrite' | 'new_question' | 'remove_choice';
  targetQuestion: number;
  targetChoice?: number;
  currentValue: string | number;
  suggestedValue: string | number;
  reasoning: string;
  expectedImprovement: number; // percentage
}