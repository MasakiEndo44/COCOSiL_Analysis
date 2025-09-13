import { generateDiagnosisSummary, generateAdminPrompt, generateQuickAnalysis } from '@/lib/ai/openai-client'
import { createMockBasicInfo, createMockMBTIResult, createMockTaihekiResult, createMockFortuneResult } from '@/__tests__/utils/test-utils'
import type { UserDiagnosisData } from '@/types'

// Mock fetch globally
global.fetch = jest.fn()

const mockUserData: UserDiagnosisData = {
  id: 'test-session-123',
  basic: createMockBasicInfo(),
  mbti: createMockMBTIResult(),
  taiheki: createMockTaihekiResult(),
  fortune: createMockFortuneResult(),
  progress: {
    step: 'integration',
    percentage: 100,
    completedSteps: ['basic_info', 'mbti', 'taiheki_test', 'integration']
  }
}

describe('OpenAI Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful OpenAI response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'テスト用のAI応答です。診断結果に基づいた詳細な分析を提供します。'
            }
          }
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      })
    })
  })

  describe('generateDiagnosisSummary', () => {
    test('should generate summary with gpt-4o', async () => {
      const summary = await generateDiagnosisSummary(mockUserData)
      
      expect(summary).toBe('テスト用のAI応答です。診断結果に基づいた詳細な分析を提供します。')
      
      // APIが正しいパラメータで呼び出されたかチェック
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('"model":"gpt-4o"')
        })
      )
    })

    test('should include user data in prompt', async () => {
      await generateDiagnosisSummary(mockUserData)
      
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
      const userMessage = callBody.messages.find((msg: any) => msg.role === 'user')
      
      expect(userMessage.content).toContain('山田太郎')
      expect(userMessage.content).toContain('INTJ')
      expect(userMessage.content).toContain('1種')
      expect(userMessage.content).toContain('チーター')
    })

    test('should handle API errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(generateDiagnosisSummary(mockUserData)).rejects.toThrow('OpenAI API error: 500 Internal Server Error')
    })

    test('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(generateDiagnosisSummary(mockUserData)).rejects.toThrow('Network error')
    })
  })

  describe('generateAdminPrompt', () => {
    test('should generate admin prompt with gpt-4o-mini', async () => {
      const prompt = await generateAdminPrompt(mockUserData)
      
      expect(prompt).toBe('テスト用のAI応答です。診断結果に基づいた詳細な分析を提供します。')
      
      // gpt-4o-miniが使用されているかチェック
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
      expect(callBody.model).toBe('gpt-4o-mini')
    })

    test('should include structured prompt request', async () => {
      await generateAdminPrompt(mockUserData)
      
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
      const userMessage = callBody.messages.find((msg: any) => msg.role === 'user')
      
      expect(userMessage.content).toContain('構造化プロンプト')
      expect(userMessage.content).toContain('管理者が相談者との対話で使用')
    })
  })

  describe('generateQuickAnalysis', () => {
    test('should generate quick analysis with gpt-4o-mini', async () => {
      const analysis = await generateQuickAnalysis('テスト用のプロンプト')
      
      expect(analysis).toBe('テスト用のAI応答です。診断結果に基づいた詳細な分析を提供します。')
      
      // gpt-4o-miniが使用されているかチェック
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
      expect(callBody.model).toBe('gpt-4o-mini')
      expect(callBody.temperature).toBe(0.2)
      expect(callBody.max_tokens).toBe(300)
    })

    test('should use appropriate system message', async () => {
      await generateQuickAnalysis('テスト用のプロンプト')
      
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
      const systemMessage = callBody.messages.find((msg: any) => msg.role === 'system')
      
      expect(systemMessage.content).toContain('診断データの分析を行う専門アシスタント')
      expect(systemMessage.content).toContain('医療的な診断は行わず')
    })
  })

  describe('Error scenarios', () => {
    test('should handle missing API key', async () => {
      // Temporarily remove API key
      const originalEnv = process.env.OPENAI_API_KEY
      delete process.env.OPENAI_API_KEY

      await expect(generateQuickAnalysis('test')).rejects.toThrow('OPENAI_API_KEY environment variable is required')
      
      // Restore API key
      process.env.OPENAI_API_KEY = originalEnv
    })

    test('should handle rate limiting', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })

      await expect(generateQuickAnalysis('test')).rejects.toThrow('OpenAI API error: 429 Too Many Requests')
    })

    test('should handle malformed JSON response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ /* malformed response */ })
      })

      await expect(generateQuickAnalysis('test')).rejects.toThrow()
    })
  })
})