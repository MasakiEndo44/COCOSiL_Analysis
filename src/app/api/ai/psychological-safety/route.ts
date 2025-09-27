import { NextRequest, NextResponse } from 'next/server';
import { SafetyScoreCalculator } from '@/lib/ai/safety-score-calculator';
import { ChoiceQuestionGenerator } from '@/lib/ai/choice-question-generator';
import { PsychologicalSafetyPromptEngine } from '@/lib/ai/psychological-safety-prompt-engine';
import { validateDiagnosisData } from '@/lib/ai/prompt-engine';
import type { ChatMessage } from '@/types';

/**
 * Psychological Safety API Endpoint
 * Provides safety score calculation and choice question generation
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      action,
      messages = [],
      diagnosisData,
      conversationHistory = []
    } = await request.json();

    if (!diagnosisData || !validateDiagnosisData(diagnosisData)) {
      return NextResponse.json(
        { error: '統合診断データが必要です' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'calculate_safety_score':
        return handleSafetyScoreCalculation(messages, conversationHistory);
      
      case 'generate_choice_question':
        return handleChoiceQuestionGeneration(messages, diagnosisData);
      
      case 'generate_psychological_prompt':
        return handlePsychologicalPromptGeneration(messages, diagnosisData);
      
      case 'validate_system':
        return handleSystemValidation(diagnosisData);
      
      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Psychological Safety API Error:', error);
    
    return NextResponse.json(
      { 
        error: '心理的安全性システムでエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle safety score calculation
 */
async function handleSafetyScoreCalculation(
  messages: ChatMessage[],
  conversationHistory: any[]
) {
  try {
    const safetyScore = SafetyScoreCalculator.calculateSafetyScore(
      messages,
      conversationHistory
    );

    // Generate recovery actions if needed
    const recoveryActions = safetyScore.recovery_needed
      ? SafetyScoreCalculator.generateRecoveryActions(
          safetyScore,
          SafetyScoreCalculator.analyzeUserResponse(
            messages.filter(msg => msg.role === 'user').pop()?.content || ''
          )
        )
      : [];

    return NextResponse.json({
      success: true,
      safetyScore,
      recoveryActions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Safety score calculation error:', error);
    return NextResponse.json(
      { error: '安全性スコア計算でエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * Handle choice question generation
 */
async function handleChoiceQuestionGeneration(
  messages: ChatMessage[],
  diagnosisData: any
) {
  try {
    const questionGenerator = new ChoiceQuestionGenerator(diagnosisData);
    
    // Determine current conversation stage
    const questionCount = messages.filter(msg => msg.role === 'assistant').length;
    let stage: 'warmup' | 'exploration' | 'deep_dive' | 'closing' = 'warmup';
    
    if (questionCount <= 2) stage = 'warmup';
    else if (questionCount <= 7) stage = 'exploration';
    else if (questionCount <= 15) stage = 'deep_dive';
    else stage = 'closing';

    const stageConfig = {
      stage,
      questionCount,
      choiceRatio: stage === 'warmup' ? 0.8 : stage === 'exploration' ? 0.6 : 0.4,
      safetyThreshold: 0.5
    };

    // Extract previous topics
    const previousTopics = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ')
      .match(/仕事|家族|恋愛|不安|将来/g) || [];

    const choiceQuestion = questionGenerator.generateChoiceQuestion(
      stageConfig,
      messages,
      previousTopics
    );

    return NextResponse.json({
      success: true,
      choiceQuestion,
      stage: stageConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Choice question generation error:', error);
    return NextResponse.json(
      { error: '選択式質問の生成でエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * Handle psychological prompt generation
 */
async function handlePsychologicalPromptGeneration(
  messages: ChatMessage[],
  diagnosisData: any
) {
  try {
    const psychoEngine = new PsychologicalSafetyPromptEngine(diagnosisData);
    const psychoPrompt = psychoEngine.generatePsychologicalSafetyPrompt(messages);

    return NextResponse.json({
      success: true,
      psychologicalPrompt: psychoPrompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Psychological prompt generation error:', error);
    return NextResponse.json(
      { error: '心理的安全性プロンプトの生成でエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * Handle system validation
 */
async function handleSystemValidation(diagnosisData: any) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      validation: {}
    };

    // Test SafetyScoreCalculator
    try {
      const testMessages: ChatMessage[] = [
        { 
          id: '1', 
          role: 'user', 
          content: 'こんにちは、よろしくお願いします。',
          timestamp: new Date()
        },
        { 
          id: '2', 
          role: 'assistant', 
          content: 'こんにちは。お話をお伺いさせていただきます。',
          timestamp: new Date()
        },
        { 
          id: '3', 
          role: 'user', 
          content: '最近、仕事で悩んでいることがあります。',
          timestamp: new Date()
        }
      ];
      
      const safetyScore = SafetyScoreCalculator.calculateSafetyScore(testMessages);
      results.validation.safetyScoreCalculator = {
        status: 'success',
        testScore: safetyScore.overall,
        components: Object.keys(safetyScore.components)
      };
    } catch (error) {
      results.validation.safetyScoreCalculator = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test ChoiceQuestionGenerator
    try {
      const questionGenerator = new ChoiceQuestionGenerator(diagnosisData);
      const testStage = {
        stage: 'warmup' as const,
        questionCount: 1,
        choiceRatio: 0.8,
        safetyThreshold: 0.5
      };
      
      const choiceQuestion = questionGenerator.generateChoiceQuestion(testStage, [], []);
      results.validation.choiceQuestionGenerator = {
        status: 'success',
        questionType: choiceQuestion.type,
        optionsCount: choiceQuestion.options.length
      };
    } catch (error) {
      results.validation.choiceQuestionGenerator = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test PsychologicalSafetyPromptEngine
    try {
      const psychoEngine = new PsychologicalSafetyPromptEngine(diagnosisData);
      const testMessages: ChatMessage[] = [
        { 
          id: '1', 
          role: 'user', 
          content: 'テストメッセージです。',
          timestamp: new Date()
        }
      ];
      
      const psychoPrompt = psychoEngine.generatePsychologicalSafetyPrompt(testMessages);
      results.validation.psychologicalSafetyPromptEngine = {
        status: 'success',
        stage: psychoPrompt.stage.stage,
        questionType: psychoPrompt.questionType,
        safetyScore: psychoPrompt.safetyScore.overall
      };
    } catch (error) {
      results.validation.psychologicalSafetyPromptEngine = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Overall system status
    const successCount = Object.values(results.validation)
      .filter((v: any) => v.status === 'success').length;
    const totalTests = Object.keys(results.validation).length;
    
    results.overallStatus = successCount === totalTests ? 'healthy' : 'partial';
    results.successRate = `${successCount}/${totalTests}`;

    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error) {
    console.error('System validation error:', error);
    return NextResponse.json(
      { error: 'システム検証でエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    service: 'Psychological Safety API',
    status: 'active',
    version: '1.0.0',
    features: [
      'safety_score_calculation',
      'choice_question_generation',
      'psychological_prompt_generation',
      'system_validation'
    ],
    timestamp: new Date().toISOString()
  });
}