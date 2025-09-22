/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ai/admin-prompt/route'
import { NextRequest } from 'next/server'
import { createMockBasicInfo, createMockMBTIResult, createMockTaihekiResult, createMockFortuneResult } from '@/__tests__/utils/test-utils'
import type { UserDiagnosisData } from '@/types'

// Mock OpenAI client
jest.mock('@/lib/ai/openai-client', () => ({
  generateAdminPrompt: jest.fn().mockResolvedValue('モックされた管理者プロンプトです。以下の特徴を持つ相談者への対応をお願いします：\n\n## 特徴\n- MBTI: INTJ\n- 体癖: 1種・3種\n- 動物占い: チーター\n\n## 推奨アプローチ\n- 論理的な説明を心がける\n- 具体的な改善案を提示する'),
}))

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

describe('/api/ai/admin-prompt', () => {
  test('should generate admin prompt successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/admin-prompt', {
      method: 'POST',
      body: JSON.stringify(mockUserData),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('prompt')
    expect(data).toHaveProperty('generated_at')
    expect(data).toHaveProperty('model_used')
    expect(data.prompt).toContain('管理者プロンプト')
    expect(data.prompt).toContain('INTJ')
    expect(data.prompt).toContain('1種')
    expect(data.model_used).toBe('gpt-4o-mini')
    expect(data.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
  })

  test('should return 400 for incomplete data', async () => {
    const incompleteData: Partial<UserDiagnosisData> = { ...mockUserData }
    delete incompleteData.basic

    const request = new NextRequest('http://localhost:3000/api/ai/admin-prompt', {
      method: 'POST',
      body: JSON.stringify(incompleteData),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('診断データが不完全です')
  })

  test('should handle OpenAI client errors gracefully', async () => {
    // Mock OpenAI client to throw error
    const { generateAdminPrompt } = require('@/lib/ai/openai-client')
    generateAdminPrompt.mockRejectedValueOnce(new Error('OpenAI API Error'))

    const request = new NextRequest('http://localhost:3000/api/ai/admin-prompt', {
      method: 'POST',
      body: JSON.stringify(mockUserData),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('管理者プロンプトの生成に失敗しました')
    expect(data.fallback_prompt).toContain('診断結果を基にした個別化された対話')
  })

  test('should validate all required fields', async () => {
    const testCases = [
      { field: 'basic', expectedError: '診断データが不完全です' },
      { field: 'mbti', expectedError: '診断データが不完全です' },
      { field: 'taiheki', expectedError: '診断データが不完全です' },
      { field: 'fortune', expectedError: '診断データが不完全です' },
    ]

    for (const testCase of testCases) {
      const incompleteData: Partial<UserDiagnosisData> = { ...mockUserData }
      delete (incompleteData as any)[testCase.field]

      const request = new NextRequest('http://localhost:3000/api/ai/admin-prompt', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(testCase.expectedError)
    }
  })

  test('should handle malformed JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/admin-prompt', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('管理者プロンプトの生成に失敗しました')
  })
})