/**
 * Tests for IntelligentSummarizer
 * Phase 2: AI-powered session summarization with quality monitoring
 */

import { IntelligentSummarizer, createIntelligentSummarizer } from '@/lib/ai/intelligent-summarizer';
import type { ChatSession } from '@/types';

// Mock OpenAI
const mockChatCompletions = {
  create: jest.fn()
};

const mockModerations = {
  create: jest.fn()
};

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: mockChatCompletions
    },
    moderations: mockModerations
  }));
});

describe('IntelligentSummarizer', () => {
  const mockSession: ChatSession = {
    sessionId: 'test-session-123',
    selectedTopic: 'relationship',
    messages: [
      {
        id: 'msg1',
        role: 'assistant',
        content: 'こんにちは。どのような人間関係の悩みがありますか？',
        timestamp: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 'msg2',
        role: 'user',
        content: '職場の上司とのコミュニケーションがうまくいかず困っています。',
        timestamp: new Date('2025-01-01T10:01:00Z')
      },
      {
        id: 'msg3',
        role: 'assistant',
        content: '具体的にどのような場面でコミュニケーションの困難を感じますか？',
        timestamp: new Date('2025-01-01T10:02:00Z')
      },
      {
        id: 'msg4',
        role: 'user',
        content: '会議で意見を言おうとすると、いつも遮られてしまいます。',
        timestamp: new Date('2025-01-01T10:03:00Z')
      }
    ],
    startTime: new Date('2025-01-01T10:00:00Z'),
    endTime: new Date('2025-01-01T10:15:00Z'),
    isCompleted: true
  };

  const mockAIResponse = {
    choices: [{
      message: {
        content: `
\`\`\`json
{
  "keyPoints": [
    "職場での上司とのコミュニケーション不全",
    "会議での発言機会の阻害",
    "意見表明に関する困難"
  ],
  "qaExchanges": [
    {
      "question": "どのような人間関係の悩みがありますか？",
      "answer": "職場の上司とのコミュニケーションがうまくいかず困っています",
      "insight": "職場の階層関係における課題が根本にある"
    },
    {
      "question": "具体的にどのような場面でコミュニケーションの困難を感じますか？",
      "answer": "会議で意見を言おうとすると、いつも遮られてしまいます",
      "insight": "発言権の確保が主要な課題となっている"
    }
  ],
  "overallInsight": "職場での階層関係と発言機会の確保が主要な課題。建設的なコミュニケーション手法の習得が必要。",
  "actionableAdvice": [
    "会議前に要点をまとめて簡潔に発言する準備をする",
    "上司と一対一での対話機会を設ける"
  ]
}
\`\`\`
        `
      }
    }]
  };

  const mockModerationResponse = {
    results: [{
      flagged: false,
      categories: {
        hate: false,
        'hate/threatening': false,
        harassment: false,
        'harassment/threatening': false,
        'self-harm': false,
        'self-harm/intent': false,
        'self-harm/instructions': false,
        sexual: false,
        'sexual/minors': false,
        violence: false,
        'violence/graphic': false
      }
    }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockChatCompletions.create.mockClear();
    mockModerations.create.mockClear();
  });

  describe('Constructor and Factory Functions', () => {
    test('should create IntelligentSummarizer instance', () => {
      const summarizer = createIntelligentSummarizer('test-api-key');
      expect(summarizer).toBeInstanceOf(IntelligentSummarizer);
    });

    test('should create with custom options', () => {
      const options = {
        useAI: false,
        qualityCheck: false,
        maxRetries: 1
      };
      const summarizer = createIntelligentSummarizer('test-api-key', options);
      const stats = summarizer.getSystemStats();
      expect(stats.options.useAI).toBe(false);
      expect(stats.options.qualityCheck).toBe(false);
      expect(stats.options.maxRetries).toBe(1);
    });
  });

  describe('Session Validation', () => {
    test('should handle invalid session data', async () => {
      const summarizer = createIntelligentSummarizer('test-api-key');

      const invalidSession: ChatSession = {
        sessionId: 'invalid',
        selectedTopic: 'relationship',
        messages: [], // Empty messages
        startTime: new Date(),
        isCompleted: false
      };

      const result = await summarizer.summarizeSession(invalidSession);

      expect(result.summary.topicId).toBe('relationship');
      expect(result.summary.topicTitle).toBe('人間関係の悩み');
      expect(result.summary.aiGenerated).toBeUndefined(); // Fallback summary
      expect(result.cached).toBe(false);
    });

    test('should handle session with insufficient messages', async () => {
      const summarizer = createIntelligentSummarizer('test-api-key');

      const shortSession: ChatSession = {
        ...mockSession,
        messages: [mockSession.messages[0]] // Only one message
      };

      const result = await summarizer.summarizeSession(shortSession);

      expect(result.summary.topicId).toBe('relationship');
      expect(result.summary.aiGenerated).toBeUndefined(); // Should use fallback
    });
  });

  describe('AI Summarization', () => {
    test('should generate AI-powered summary successfully', async () => {
      mockChatCompletions.create.mockResolvedValue(mockAIResponse);

      const summarizer = createIntelligentSummarizer('test-api-key', {
        useAI: true,
        qualityCheck: false // Disable quality check for this test
      });

      const result = await summarizer.summarizeSession(mockSession);

      expect(result.summary.aiGenerated).toBe(true);
      expect(result.summary.keyPoints).toHaveLength(3);
      expect(result.summary.qaExchanges).toHaveLength(2);
      expect(result.summary.overallInsight).toContain('職場での階層関係');
      expect(result.summary.actionableAdvice).toHaveLength(2);
      expect(result.summary.topicId).toBe('relationship');
      expect(result.summary.sessionDuration).toBe(15); // 15 minutes
    });

    test('should use legacy summarization when AI disabled', async () => {
      const summarizer = createIntelligentSummarizer('test-api-key', {
        useAI: false
      });

      const result = await summarizer.summarizeSession(mockSession);

      expect(result.summary.aiGenerated).toBeUndefined(); // Legacy summarization
      expect(result.summary.topicId).toBe('relationship');
    });
  });

  describe('Quality Monitoring', () => {
    test('should detect inappropriate content', async () => {
      const inappropriateSession: ChatSession = {
        ...mockSession,
        messages: [
          {
            id: 'bad1',
            role: 'user',
            content: '自殺を考えています',
            timestamp: new Date()
          },
          {
            id: 'bad2',
            role: 'assistant',
            content: 'それは大変ですね',
            timestamp: new Date()
          }
        ]
      };

      const summarizer = createIntelligentSummarizer('test-api-key', {
        useAI: true,
        qualityCheck: true
      });

      const result = await summarizer.summarizeSession(inappropriateSession);

      // Should fallback due to quality check failure
      expect(result.summary.aiGenerated).toBeUndefined();
    });

    test('should allow appropriate content through quality check', async () => {
      // Mock moderation response (appropriate content)
      mockModerations.create.mockResolvedValueOnce(mockModerationResponse);
      // Mock summarization response
      mockChatCompletions.create.mockResolvedValueOnce(mockAIResponse);

      const summarizer = createIntelligentSummarizer('test-api-key', {
        useAI: true,
        qualityCheck: true
      });

      const result = await summarizer.summarizeSession(mockSession);

      expect(result.summary.aiGenerated).toBe(true);
      expect(mockModerations.create).toHaveBeenCalledTimes(1); // Quality check
      expect(mockChatCompletions.create).toHaveBeenCalledTimes(1); // Summarization only
    });
  });

  describe('Topic Context Handling', () => {
    test('should handle different topic types', async () => {
      const summarizer = createIntelligentSummarizer('test-api-key', {
        useAI: false // Use fallback to test topic handling
      });

      const careerSession: ChatSession = {
        ...mockSession,
        selectedTopic: 'career'
      };

      const result = await summarizer.summarizeSession(careerSession);

      expect(result.summary.topicId).toBe('career');
      expect(result.summary.topicTitle).toBe('キャリア・仕事の悩み');
    });

    test('should handle unknown topic types', async () => {
      const summarizer = createIntelligentSummarizer('test-api-key', {
        useAI: false
      });

      const unknownSession: ChatSession = {
        ...mockSession,
        selectedTopic: 'unknown_topic'
      };

      const result = await summarizer.summarizeSession(unknownSession);

      expect(result.summary.topicId).toBe('unknown_topic');
      expect(result.summary.topicTitle).toBe('その他の相談');
    });
  });

  describe('System Management', () => {
    test('should provide cache statistics', () => {
      const summarizer = createIntelligentSummarizer('test-api-key');
      const stats = summarizer.getSystemStats();

      expect(stats).toHaveProperty('cache');
      expect(stats.cache).toHaveProperty('current');
      expect(stats.cache).toHaveProperty('max');
      expect(stats.cache).toHaveProperty('utilization');
      expect(stats).toHaveProperty('options');
    });

    test('should clear cache', () => {
      const summarizer = createIntelligentSummarizer('test-api-key');

      // Should not throw
      expect(() => summarizer.clearCache()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle JSON parsing errors', async () => {
      // Mock invalid JSON response
      mockChatCompletions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'Invalid JSON response without proper format'
          }
        }]
      });

      const summarizer = createIntelligentSummarizer('test-api-key', {
        useAI: true,
        qualityCheck: false
      });

      const result = await summarizer.summarizeSession(mockSession);

      // Should fallback to legacy summarization
      expect(result.summary.aiGenerated).toBeUndefined();
      expect(result.summary.topicId).toBe('relationship');
    });

    test('should handle empty AI responses', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{
          message: {
            content: null
          }
        }]
      });

      const summarizer = createIntelligentSummarizer('test-api-key', {
        useAI: true,
        qualityCheck: false
      });

      const result = await summarizer.summarizeSession(mockSession);

      // Should fallback to legacy summarization
      expect(result.summary.aiGenerated).toBeUndefined();
    });
  });
});