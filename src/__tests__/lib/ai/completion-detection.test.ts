/**
 * AIチャット終了判断機能 - Unit Tests
 * Phase 1: 基本的な動作確認テスト
 */

import { CompletionDetectionPromptEngine } from '@/lib/ai/completion-detection-prompt';
import type { UserDiagnosisData } from '@/types';

describe('CompletionDetectionPromptEngine', () => {
  // モック診断データ
  const mockDiagnosisData: UserDiagnosisData = {
    id: 'test-session-id',
    basic: {
      name: 'テストユーザー',
      age: 30,
      email: 'test@example.com',
      gender: 'no_answer',
      birthdate: { year: 1994, month: 1, day: 1 }
    },
    mbti: {
      type: 'INFP',
      source: 'diagnosed',
      confidence: 0.85
    },
    taiheki: {
      primary: 3,
      secondary: 4,
      scores: { 1: 0, 2: 0, 3: 8, 4: 6, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
      characteristics: ['感受性が高い', '他者の気持ちに敏感'],
      recommendations: ['境界線を意識する']
    },
    fortune: {
      zodiac: '水瓶座',
      animal: '鳳凰',
      sixStar: '天貴星',
      element: '水',
      fortune: '直感力が高い',
      characteristics: ['独創的', '理想主義']
    },
    progress: {
      step: 'integration',
      percentage: 100,
      completedSteps: ['basic_info', 'mbti', 'taiheki_test', 'integration']
    }
  };

  describe('extractInitialConcern', () => {
    test('INFP + 体癖3種から適切な悩みを抽出', () => {
      const concern = CompletionDetectionPromptEngine.extractInitialConcern(mockDiagnosisData);

      expect(concern).toContain('人との関わり方');
      expect(concern).toContain('感情のコントロール');
      expect(concern).toContain('感受性の高さ');
    });

    test('MBTI未診断の場合でもエラーにならない', () => {
      const dataWithoutMBTI: UserDiagnosisData = {
        ...mockDiagnosisData,
        mbti: null
      };

      const concern = CompletionDetectionPromptEngine.extractInitialConcern(dataWithoutMBTI);
      expect(concern).toBeDefined();
      expect(typeof concern).toBe('string');
    });

    test('体癖未診断でもMBTIがあれば悩みを抽出', () => {
      const dataWithoutTaiheki: UserDiagnosisData = {
        ...mockDiagnosisData,
        taiheki: null
      };

      const concern = CompletionDetectionPromptEngine.extractInitialConcern(dataWithoutTaiheki);
      expect(concern).toBeDefined();
      expect(concern).toContain('人との関わり方'); // MBTIのI型から
    });

    test('MBTIも体癖も未診断の場合はデフォルト値', () => {
      const dataWithoutDiagnosis: UserDiagnosisData = {
        ...mockDiagnosisData,
        mbti: null,
        taiheki: null
      };

      const concern = CompletionDetectionPromptEngine.extractInitialConcern(dataWithoutDiagnosis);
      expect(concern).toBe('自己理解と人生の方向性');
    });
  });

  describe('parseCompletionDetection', () => {
    test('resolved: true, high confidence → shouldShowContinueButton: true', () => {
      const gptResponse = `
これはアドバイスメッセージです。

\`\`\`json
{
  "resolved": true,
  "confidence": 0.9,
  "next_action": "お役に立てて嬉しいです！",
  "_reasoning": "明確な感謝表現"
}
\`\`\`
      `;

      const result = CompletionDetectionPromptEngine.parseCompletionDetection(gptResponse);

      expect(result).not.toBeNull();
      expect(result?.resolved).toBe(true);
      expect(result?.confidence).toBe(0.9);
      expect(result?.nextAction).toBe('お役に立てて嬉しいです！');
    });

    test('resolved: true, low confidence → false due to threshold', () => {
      const gptResponse = `
\`\`\`json
{
  "resolved": true,
  "confidence": 0.7,
  "next_action": "考えてみてください",
  "_reasoning": "曖昧な応答"
}
\`\`\`
      `;

      const result = CompletionDetectionPromptEngine.parseCompletionDetection(gptResponse);

      expect(result).not.toBeNull();
      expect(result?.resolved).toBe(false); // confidence < 0.8 でfalse
      expect(result?.confidence).toBe(0.7);
    });

    test('resolved: false → confidence関係なくfalse', () => {
      const gptResponse = `
\`\`\`json
{
  "resolved": false,
  "confidence": 0.95,
  "next_action": "もう少し詳しく教えてください",
  "_reasoning": "新しい質問が含まれている"
}
\`\`\`
      `;

      const result = CompletionDetectionPromptEngine.parseCompletionDetection(gptResponse);

      expect(result).not.toBeNull();
      expect(result?.resolved).toBe(false);
    });

    test('JSONブロックなしの直接オブジェクト形式', () => {
      const gptResponse = `
{"resolved": true, "confidence": 0.85, "next_action": "テスト", "_reasoning": "直接形式"}
      `;

      const result = CompletionDetectionPromptEngine.parseCompletionDetection(gptResponse);

      expect(result).not.toBeNull();
      expect(result?.resolved).toBe(true);
      expect(result?.confidence).toBe(0.85);
    });

    test('invalid JSON → returns null', () => {
      const gptResponse = 'これは普通のテキストです。JSONは含まれていません。';

      const result = CompletionDetectionPromptEngine.parseCompletionDetection(gptResponse);

      expect(result).toBeNull();
    });

    test('malformed JSON → returns null', () => {
      const gptResponse = `
\`\`\`json
{
  "resolved": true,
  "confidence": "not a number"
}
\`\`\`
      `;

      const result = CompletionDetectionPromptEngine.parseCompletionDetection(gptResponse);

      expect(result).toBeNull();
    });
  });

  describe('generateSystemPrompt', () => {
    test('システムプロンプトが正しく生成される', () => {
      const initialConcern = '人との関わり方、感情のコントロール';
      const engine = new CompletionDetectionPromptEngine({
        diagnosisData: mockDiagnosisData,
        initialConcern
      });

      const prompt = engine.generateSystemPrompt();

      expect(prompt).toContain('会話終了判定タスク');
      expect(prompt).toContain('明示的解決シグナル');
      expect(prompt).toContain(initialConcern);
      expect(prompt).toContain('INFP');
      expect(prompt).toContain('3種');
      expect(prompt).toContain('Few-Shot Examples');
    });

    test('MBTI Thinking型のパーソナライズロジック', () => {
      const thinkingData: UserDiagnosisData = {
        ...mockDiagnosisData,
        mbti: { type: 'INTJ', source: 'diagnosed' }
      };

      const engine = new CompletionDetectionPromptEngine({
        diagnosisData: thinkingData,
        initialConcern: 'テスト'
      });

      const prompt = engine.generateSystemPrompt();
      expect(prompt).toContain('Thinking型（T）');
      expect(prompt).toContain('論理的解決策');
    });

    test('MBTI Feeling型のパーソナライズロジック', () => {
      const feelingData: UserDiagnosisData = {
        ...mockDiagnosisData,
        mbti: { type: 'ENFP', source: 'diagnosed' }
      };

      const engine = new CompletionDetectionPromptEngine({
        diagnosisData: feelingData,
        initialConcern: 'テスト'
      });

      const prompt = engine.generateSystemPrompt();
      expect(prompt).toContain('Feeling型（F）');
      expect(prompt).toContain('感情的納得感');
    });
  });

  describe('Edge Cases', () => {
    test('confidence境界値0.8でresolvedがtrue', () => {
      const gptResponse = `
\`\`\`json
{
  "resolved": true,
  "confidence": 0.8,
  "next_action": "境界値テスト",
  "_reasoning": "confidence = 0.8"
}
\`\`\`
      `;

      const result = CompletionDetectionPromptEngine.parseCompletionDetection(gptResponse);
      expect(result?.resolved).toBe(true); // 0.8 >= 0.8
    });

    test('confidence境界値0.79でresolvedがfalse', () => {
      const gptResponse = `
\`\`\`json
{
  "resolved": true,
  "confidence": 0.79,
  "next_action": "境界値テスト",
  "_reasoning": "confidence = 0.79"
}
\`\`\`
      `;

      const result = CompletionDetectionPromptEngine.parseCompletionDetection(gptResponse);
      expect(result?.resolved).toBe(false); // 0.79 < 0.8
    });

    test('confidence = 1.0の場合', () => {
      const gptResponse = `
\`\`\`json
{
  "resolved": true,
  "confidence": 1.0,
  "next_action": "完全確信",
  "_reasoning": "100%解決"
}
\`\`\`
      `;

      const result = CompletionDetectionPromptEngine.parseCompletionDetection(gptResponse);
      expect(result?.resolved).toBe(true);
      expect(result?.confidence).toBe(1.0);
    });
  });
});
