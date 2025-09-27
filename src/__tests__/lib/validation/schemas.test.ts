/**
 * @jest-environment node
 */

import {
  basicInfoSchema,
  mbtiResultSchema,
  taihekiResultSchema,
  fortuneCalcRequestSchema,
  chatRequestSchema,
  validateBasicInfo,
  validateMBTIResult,
  validateTaihekiResult,
  validateFortuneCalcRequest,
  validateChatRequest,
  formatZodError
} from '@/lib/validation/schemas';

describe('Zod Validation Schemas', () => {
  describe('Basic Info Validation', () => {
    const validBasicInfo = {
      name: '山田太郎',
      email: 'yamada@example.com',
      gender: 'male' as const,
      birthdate: {
        year: 1990,
        month: 5,
        day: 15
      },
      age: 34
    };

    test('should accept valid basic info', () => {
      const result = validateBasicInfo(validBasicInfo);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('山田太郎');
        expect(result.data.email).toBe('yamada@example.com');
        expect(result.data.gender).toBe('male');
      }
    });

    test('should reject empty name', () => {
      const result = validateBasicInfo({
        ...validBasicInfo,
        name: ''
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('お名前を入力してください'))).toBe(true);
      }
    });

    test('should reject invalid email', () => {
      const result = validateBasicInfo({
        ...validBasicInfo,
        email: 'invalid-email'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('有効なメールアドレス'))).toBe(true);
      }
    });

    test('should reject invalid gender', () => {
      const result = validateBasicInfo({
        ...validBasicInfo,
        gender: 'invalid' as any
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('性別を選択してください'))).toBe(true);
      }
    });

    test('should reject invalid date', () => {
      const result = validateBasicInfo({
        ...validBasicInfo,
        birthdate: {
          year: 2024,
          month: 2,
          day: 30 // 2月30日は存在しない
        }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('存在しない日付です'))).toBe(true);
      }
    });

    test('should reject future date', () => {
      const futureYear = new Date().getFullYear() + 1;
      const result = validateBasicInfo({
        ...validBasicInfo,
        birthdate: {
          year: futureYear,
          month: 1,
          day: 1
        }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('未来の日付は入力できません'))).toBe(true);
      }
    });

    test('should reject invalid age range', () => {
      const result = validateBasicInfo({
        ...validBasicInfo,
        age: 200
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('150歳以下'))).toBe(true);
      }
    });
  });

  describe('MBTI Result Validation', () => {
    const validMBTIResult = {
      type: 'INTJ' as const,
      scores: {
        E: 30, I: 70,
        S: 40, N: 60,
        T: 80, F: 20,
        J: 65, P: 35
      },
      source: 'diagnosed' as const,
      confidence: 0.85
    };

    test('should accept valid MBTI result', () => {
      const result = validateMBTIResult(validMBTIResult);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('INTJ');
        expect(result.data.source).toBe('diagnosed');
      }
    });

    test('should reject invalid MBTI type', () => {
      const result = validateMBTIResult({
        ...validMBTIResult,
        type: 'INVALID' as any
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('有効なMBTIタイプ'))).toBe(true);
      }
    });

    test('should reject invalid scores total', () => {
      const result = validateMBTIResult({
        ...validMBTIResult,
        scores: {
          E: 60, I: 30, // 合計が100にならない
          S: 40, N: 60,
          T: 80, F: 20,
          J: 65, P: 35
        }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('スコアの合計が正しくありません'))).toBe(true);
      }
    });

    test('should reject confidence out of range', () => {
      const result = validateMBTIResult({
        ...validMBTIResult,
        confidence: 1.5
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('信頼度は1以下'))).toBe(true);
      }
    });
  });

  describe('Taiheki Result Validation', () => {
    const validTaihekiResult = {
      primary: 3 as const,
      secondary: 7 as const,
      scores: {
        '1': 10, '2': 15, '3': 85, '4': 20, '5': 25,
        '6': 30, '7': 75, '8': 35, '9': 40, '10': 45
      },
      characteristics: ['集中力が高い', '論理的思考を好む'],
      recommendations: ['定期的な運動を心がける', '創造性を活かす活動に参加する']
    };

    test('should accept valid taiheki result', () => {
      const result = validateTaihekiResult(validTaihekiResult);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.primary).toBe(3);
        expect(result.data.secondary).toBe(7);
      }
    });

    test('should reject invalid primary type', () => {
      const result = validateTaihekiResult({
        ...validTaihekiResult,
        primary: 11 as any
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('1から10の間'))).toBe(true);
      }
    });

    test('should accept secondary type 0', () => {
      const result = validateTaihekiResult({
        ...validTaihekiResult,
        secondary: 0 as const
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.secondary).toBe(0);
      }
    });

    test('should reject empty characteristics', () => {
      const result = validateTaihekiResult({
        ...validTaihekiResult,
        characteristics: []
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('特徴は最低1つ必要'))).toBe(true);
      }
    });
  });

  describe('Fortune Calc Request Validation', () => {
    const validFortuneRequest = {
      year: 1990,
      month: 5,
      day: 15
    };

    test('should accept valid fortune request', () => {
      const result = validateFortuneCalcRequest(validFortuneRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(1990);
        expect(result.data.month).toBe(5);
        expect(result.data.day).toBe(15);
      }
    });

    test('should reject invalid year range', () => {
      const result = validateFortuneCalcRequest({
        ...validFortuneRequest,
        year: 1800
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('1900年以降'))).toBe(true);
      }
    });

    test('should reject invalid month', () => {
      const result = validateFortuneCalcRequest({
        ...validFortuneRequest,
        month: 13
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('1から12の間'))).toBe(true);
      }
    });

    test('should reject invalid date combination', () => {
      const result = validateFortuneCalcRequest({
        year: 2024,
        month: 2,
        day: 30
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('存在しない日付'))).toBe(true);
      }
    });
  });

  describe('Chat Request Validation', () => {
    const validChatRequest = {
      messages: [
        {
          id: '1',
          role: 'user' as const,
          content: 'こんにちは',
          timestamp: new Date()
        },
        {
          id: '2',
          role: 'assistant' as const,
          content: 'こんにちは！お元気ですか？',
          timestamp: new Date()
        }
      ]
    };

    test('should accept valid chat request', () => {
      const result = validateChatRequest(validChatRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.messages).toHaveLength(2);
        expect(result.data.messages[0].role).toBe('user');
      }
    });

    test('should reject empty messages array', () => {
      const result = validateChatRequest({
        messages: []
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('最低1つ必要'))).toBe(true);
      }
    });

    test('should reject invalid message role', () => {
      const result = validateChatRequest({
        messages: [
          {
            id: '1',
            role: 'invalid' as any,
            content: 'test',
            timestamp: new Date()
          }
        ]
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('有効な役割'))).toBe(true);
      }
    });

    test('should reject empty message content', () => {
      const result = validateChatRequest({
        messages: [
          {
            id: '1',
            role: 'user' as const,
            content: '',
            timestamp: new Date()
          }
        ]
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('メッセージ内容は必須'))).toBe(true);
      }
    });

    test('should reject too long message content', () => {
      const longContent = 'a'.repeat(5001);
      const result = validateChatRequest({
        messages: [
          {
            id: '1',
            role: 'user' as const,
            content: longContent,
            timestamp: new Date()
          }
        ]
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('5000文字以内'))).toBe(true);
      }
    });
  });

  describe('Error Formatting', () => {
    test('should format Zod errors correctly', () => {
      const result = validateBasicInfo({
        name: '',
        email: 'invalid',
        gender: 'invalid'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted).toBeInstanceOf(Array);
        expect(formatted.length).toBeGreaterThan(0);
        expect(formatted[0]).toHaveProperty('field');
        expect(formatted[0]).toHaveProperty('message');
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined input gracefully', () => {
      const result = validateBasicInfo(undefined);
      expect(result.success).toBe(false);
    });

    test('should handle null input gracefully', () => {
      const result = validateBasicInfo(null);
      expect(result.success).toBe(false);
    });

    test('should handle non-object input gracefully', () => {
      const result = validateBasicInfo('not an object');
      expect(result.success).toBe(false);
    });

    test('should handle partial objects', () => {
      const result = validateBasicInfo({
        name: '太郎'
        // その他のフィールドが欠けている
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Japanese Text Validation', () => {
    test('should accept Japanese names', () => {
      const result = validateBasicInfo({
        name: '田中花子',
        email: 'hanako@example.com',
        gender: 'female' as const,
        birthdate: {
          year: 1985,
          month: 3,
          day: 20
        }
      });
      expect(result.success).toBe(true);
    });

    test('should accept mixed Japanese and English names', () => {
      const result = validateBasicInfo({
        name: 'Tanaka 太郎',
        email: 'taro.tanaka@example.com',
        gender: 'male' as const,
        birthdate: {
          year: 1980,
          month: 12,
          day: 31
        }
      });
      expect(result.success).toBe(true);
    });

    test('should handle very long Japanese characteristics', () => {
      const longCharacteristic = 'この人は非常に集中力が高く、論理的な思考を好み、深く物事を考える傾向があります。また、創造性も豊かで、新しいアイデアを生み出すのが得意です。';
      
      const result = validateTaihekiResult({
        primary: 1 as const,
        secondary: 0 as const,
        scores: { '1': 100, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 },
        characteristics: [longCharacteristic],
        recommendations: ['適度な休息を取る']
      });
      
      expect(result.success).toBe(true);
    });
  });
});