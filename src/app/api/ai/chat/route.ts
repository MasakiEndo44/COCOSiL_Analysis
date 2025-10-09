import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { IntegratedPromptEngine } from '@/lib/ai/prompt-engine';
import { PsychologicalSafetyPromptEngine } from '@/lib/ai/psychological-safety-prompt-engine';
import { SafetyScoreCalculator } from '@/lib/ai/safety-score-calculator';
import { ChoiceQuestionGenerator } from '@/lib/ai/choice-question-generator';
import { CompletionDetectionPromptEngine } from '@/lib/ai/completion-detection-prompt';
import { applyConversationWindowing, generateContextSummary } from '@/lib/chat/conversation-utils';
import {
  chatRequestSchema,
  userDiagnosisDataSchema
} from '@/lib/validation/schemas';
import { validateDiagnosisCompleteness } from '@/lib/validation/utils';
import type { ChatMessage, UserDiagnosisData } from '@/types';

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// プロンプトエンジンのインスタンス
const promptEngine = new IntegratedPromptEngine();

export async function POST(request: NextRequest) {
  try {
    console.log('=== AI Chat API Request Start ===');

    // Log raw request body for debugging
    const requestBodyText = await request.text();
    console.log('🔍 Raw request body:', requestBodyText);
    
    // Re-create request for validation (reserved for future use)
    const _requestForValidation = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: requestBodyText
    });

    // Parse and validate request body manually to capture raw errors
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBodyText);
    } catch (error) {
      console.log('❌ JSON Parse failed:', error);
      return NextResponse.json({
        success: false,
        error: 'リクエストボディの解析に失敗しました',
        code: 'INVALID_JSON'
      }, { status: 400 });
    }

    // Direct schema validation to see raw errors
    const directValidation = chatRequestSchema.safeParse(parsedBody);

    if (!directValidation.success) {
      console.log('❌ Direct validation failed - raw Zod errors:');
      console.log('🔍 Validation errors (first 10):', directValidation.error.errors.slice(0, 10));
      console.log('🔍 Error paths and messages:', directValidation.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
        received: 'received' in err ? err.received : 'N/A'
      })));

      return NextResponse.json({
        success: false,
        error: 'バリデーションエラーが発生しました',
        details: directValidation.error.errors.slice(0, 5),
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    console.log('✅ Validation successful');

    const {
      messages,
      systemPrompt: _clientSystemPrompt, // Reserved for custom system prompts
      userData: diagnosisData,
      stream = false
    } = directValidation.data;

    console.log('🔄 Processing request data...');
    console.log('📝 Messages count:', messages.length);
    console.log('👤 Diagnosis data present:', !!diagnosisData);
    console.log('🔍 Raw diagnosisData received from frontend:', diagnosisData);
    console.log('🔍 diagnosisData type:', typeof diagnosisData);
    console.log('🔍 diagnosisData is null:', diagnosisData === null);
    console.log('🔍 diagnosisData is undefined:', diagnosisData === undefined);

    // Deep diagnosis data validation as per Codex recommendations
    if (diagnosisData) {
      console.log('🔬 Deep diagnosis data analysis:');
      console.log('  📋 Basic info:', {
        hasName: !!diagnosisData.basic?.name,
        hasAge: !!diagnosisData.basic?.age,
        hasEmail: !!diagnosisData.basic?.email,
        hasGender: !!diagnosisData.basic?.gender,
        hasBirthdate: !!diagnosisData.basic?.birthdate
      });
      console.log('  🧠 MBTI:', {
        hasType: !!diagnosisData.mbti?.type,
        hasSource: !!diagnosisData.mbti?.source
      });
      console.log('  🏃 Taiheki:', {
        hasPrimary: !!diagnosisData.taiheki?.primary,
        hasScores: !!diagnosisData.taiheki?.scores,
        hasCharacteristics: !!diagnosisData.taiheki?.characteristics
      });
      console.log('  🔮 Fortune:', {
        hasZodiac: !!diagnosisData.fortune?.zodiac,
        hasAnimal: !!diagnosisData.fortune?.animal,
        hasSixStar: !!diagnosisData.fortune?.sixStar
      });
      console.log('  📊 Progress:', {
        hasProgress: !!diagnosisData.progress,
        step: diagnosisData.progress?.step
      });

      // Test userDiagnosisDataSchema validation directly
      const userSchemaTest = userDiagnosisDataSchema.safeParse(diagnosisData);
      console.log('🧪 UserDiagnosisDataSchema test:', {
        success: userSchemaTest.success,
        errorCount: userSchemaTest.success ? 0 : userSchemaTest.error.errors.length
      });

      if (!userSchemaTest.success) {
        console.log('❌ Schema validation errors:', userSchemaTest.error.errors.slice(0, 5));
      }
    }

    // Default values for missing variables
    const usePsychologicalSafety = true; // Enable psychological safety by default
    const topic = '心理診断相談'; // Default topic for diagnosis consultation
    const priority = 'quality'; // Default to quality over speed

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません' },
        { status: 500 }
      );
    }

    // 診断データが提供されている場合の詳細検証
    if (diagnosisData) {
      console.log('📊 Diagnosis data provided, checking completeness...');

      const completenessData = {
        mbti: !!diagnosisData.mbti?.type,
        taiheki: !!diagnosisData.taiheki?.primary,
        fortune: !!diagnosisData.fortune?.animal,
        age: diagnosisData.basic?.age || 0,
        name: diagnosisData.basic?.name || ''
      };

      console.log('🔍 Completeness data:', completenessData);

      // 診断データの完整性をチェック
      const completenessCheck = validateDiagnosisCompleteness(completenessData);

      console.log('🔍 Completeness check result:', completenessCheck);

      if (!completenessCheck.canProceedToChat) {
        console.log('❌ Incomplete diagnosis data, returning 400');
        return NextResponse.json({
          success: false,
          error: '診断データが不完全です。チャットを利用するには以下の診断を完了してください。',
          details: {
            missingFields: completenessCheck.missingFields,
            canProceed: completenessCheck.canProceedToChat,
            suggestions: [
              'MBTI診断を完了してください',
              '体癖診断を完了してください', 
              '基本情報（お名前・年齢）を入力してください'
            ]
          },
          code: 'INCOMPLETE_DIAGNOSIS_DATA'
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: '統合診断データが必要です。診断を完了してからチャットをご利用ください。',
        code: 'MISSING_DIAGNOSIS_DATA'
      }, { status: 400 });
    }

    // Performance: Apply conversation windowing to prevent unlimited growth
    const { windowedMessages, droppedCount, contextInfo } = applyConversationWindowing(messages as ChatMessage[]);
    const contextSummary = generateContextSummary(windowedMessages);

    let systemPrompt: string;
    let maxTokens: number;
    let temperature: number;
    let safetyData: any = null;
    let choiceQuestion: any = null;

    // Phase 2: 終了判定エンジンの初期化
    let completionEngine: CompletionDetectionPromptEngine | null = null;
    if (diagnosisData) {
      const initialConcern = CompletionDetectionPromptEngine.extractInitialConcern(
        diagnosisData as UserDiagnosisData
      );

      completionEngine = new CompletionDetectionPromptEngine({
        diagnosisData: diagnosisData as UserDiagnosisData,
        initialConcern
      });
    }

    if (usePsychologicalSafety) {
      // === 心理的安全性システムを使用 ===

      // 1. 心理的安全性スコア計算 (reserved for future safety metrics)
      const _safetyScore = SafetyScoreCalculator.calculateSafetyScore(windowedMessages);

      // 2. 心理的安全性プロンプトエンジン初期化
      const psychoEngine = new PsychologicalSafetyPromptEngine(diagnosisData as import('@/types').UserDiagnosisData);
      const psychoPrompt = psychoEngine.generatePsychologicalSafetyPrompt(windowedMessages);

      // 3. 選択式質問生成（必要に応じて）
      const questionGenerator = new ChoiceQuestionGenerator(diagnosisData as import('@/types').UserDiagnosisData);
      
      // 質問タイプに基づいて選択式質問を生成
      if (psychoPrompt.questionType === 'choice' || psychoPrompt.questionType === 'hybrid') {
        const _extractedTopics = windowedMessages
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content)
          .join(' '); // Reserved for topic extraction feature
        
        choiceQuestion = questionGenerator.generateChoiceQuestion(
          psychoPrompt.stage,
          windowedMessages,
          [] // previous topics - could be extracted from conversation history
        );
      }
      
      // Rogers 3条件に基づくシステムプロンプト使用
      systemPrompt = psychoPrompt.systemPrompt;

      // Phase 2: 終了判定プロンプトを追加
      if (completionEngine) {
        systemPrompt += '\n\n' + completionEngine.generateSystemPrompt();
      }

      maxTokens = Math.floor(Number(1500)); // 心理的安全性重視で適度な長さ
      temperature = 0.8; // 温かい共感的な応答のため少し高め
      
      safetyData = {
        safetyScore: psychoPrompt.safetyScore,
        stage: psychoPrompt.stage,
        questionType: psychoPrompt.questionType,
        recoveryActions: psychoPrompt.recoveryActions
      };
      
    } else {
      // === 従来のシステムを使用 ===

      // Filter out system messages and transform to PromptContext format
      const filteredMessages = windowedMessages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));

      const promptContext = {
        topic,
        conversationHistory: filteredMessages,
        complexity: promptEngine.assessComplexity(topic, windowedMessages),
        priority: priority as 'speed' | 'quality'
      };

      // Transform UserDiagnosisData to simplified DiagnosisData format for prompt engine
      const simplifiedDiagnosisData = {
        mbti: diagnosisData.mbti?.type || 'INFP',
        taiheki: {
          primary: diagnosisData.taiheki?.primary || 1,
          secondary: diagnosisData.taiheki?.secondary || 0
        },
        fortune: {
          animal: diagnosisData.fortune?.animal || '未知',
          sixStar: diagnosisData.fortune?.sixStar || '未知'
        },
        basic: {
          age: diagnosisData.basic?.age || 0,
          name: diagnosisData.basic?.name || 'ユーザー'
        }
      };

      const promptResult = promptEngine.generateContextualPrompt(
        simplifiedDiagnosisData,
        promptContext
      );

      systemPrompt = promptResult.systemPrompt;
      maxTokens = Math.floor(Number(promptResult.maxTokens));
      temperature = promptResult.temperature;
    }

    // Performance monitoring logs
    console.log('Performance Metrics:', {
      originalMessages: messages.length,
      windowedMessages: windowedMessages.length,
      droppedCount,
      compressionRatio: contextInfo.compressionRatio,
      estimatedTokens: contextSummary.estimatedTokens,
      dynamicTokenLimit: maxTokens,
      usePsychologicalSafety,
      safetyScore: safetyData?.safetyScore?.overall || 'N/A'
    });

    // ストリーミング対応
    if (stream) {
      const enhancedMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...windowedMessages
      ];
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: enhancedMessages,
        stream: true,
        temperature,
        max_tokens: maxTokens,
      });

      // ReadableStreamを作成（心理的安全性データも含む）
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // 最初に心理的安全性データとメタデータを送信
            if (safetyData || choiceQuestion) {
              const metaData = {
                type: 'metadata',
                safetyData,
                choiceQuestion,
                windowingInfo: {
                  droppedCount,
                  compressionRatio: contextInfo.compressionRatio
                }
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(metaData)}

`));
            }

            for await (const chunk of response) {
              const delta = chunk.choices[0]?.delta;
              if (delta?.content) {
                const data = {
                  type: 'content',
                  choices: [{
                    delta: {
                      content: delta.content
                    }
                  }]
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}

`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('ストリーミングエラー:', error);
            controller.error(error);
          }
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 通常のレスポンス（非ストリーミング）
    const enhancedMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...windowedMessages
    ];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: enhancedMessages,
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content || '';

    // Phase 2: 終了判定結果を解析
    let completionDetection: any = null;
    if (completionEngine) {
      const parsed = CompletionDetectionPromptEngine.parseCompletionDetection(content);
      if (parsed) {
        completionDetection = {
          resolved: parsed.resolved,
          confidence: parsed.confidence,
          nextAction: parsed.nextAction,
          shouldShowContinueButton: parsed.resolved && parsed.confidence >= 0.8
        };
        console.log('[CompletionDetection] Parsed result:', completionDetection);
      }
    }

    return NextResponse.json({
      message: content,
      usage: response.usage,
      metadata: {
        maxTokens,
        temperature,
        usePsychologicalSafety,
        windowingInfo: {
          droppedCount,
          compressionRatio: contextInfo.compressionRatio
        }
      },
      safetyData,
      choiceQuestion,
      completionDetection // Phase 2: 新規フィールド追加
    });

  } catch (error) {
    console.error('OpenAI API エラー:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `AI応答の生成中にエラーが発生しました: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'AI応答の生成中に予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}