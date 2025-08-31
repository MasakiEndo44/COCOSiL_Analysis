/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ai/summary/route'
import { NextRequest } from 'next/server'
import { createMockBasicInfo, createMockMBTIResult, createMockTaihekiResult, createMockFortuneResult } from '../../../../utils/test-utils'
import type { UserDiagnosisData } from '@/types'

// Mock OpenAI client
jest.mock('@/lib/ai/openai-client', () => ({
  generateDiagnosisSummary: jest.fn().mockResolvedValue('モックされたAI要約です。統合診断の結果、バランスの取れた personality profile が確認されました。'),
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

describe('/api/ai/summary', () => {
  test('should generate summary successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/summary', {
      method: 'POST',
      body: JSON.stringify(mockUserData),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('summary')
    expect(data).toHaveProperty('generated_at')
    expect(data).toHaveProperty('model_used')
    expect(data.summary).toBe('モックされたAI要約です。統合診断の結果、バランスの取れた personality profile が確認されました。')
    expect(data.model_used).toBe('gpt-4o')
    expect(data.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/) // ISO date format
  })

  test('should return 400 for missing basic info', async () => {
    const incompleteData = { ...mockUserData }
    delete incompleteData.basic

    const request = new NextRequest('http://localhost:3000/api/ai/summary', {
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

  test('should return 400 for missing mbti data', async () => {
    const incompleteData = { ...mockUserData }
    delete incompleteData.mbti

    const request = new NextRequest('http://localhost:3000/api/ai/summary', {
      method: 'POST',
      body: JSON.stringify(incompleteData),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  test('should return 400 for missing taiheki data', async () => {
    const incompleteData = { ...mockUserData }
    delete incompleteData.taiheki

    const request = new NextRequest('http://localhost:3000/api/ai/summary', {
      method: 'POST',
      body: JSON.stringify(incompleteData),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  test('should return 400 for missing fortune data', async () => {
    const incompleteData = { ...mockUserData }
    delete incompleteData.fortune

    const request = new NextRequest('http://localhost:3000/api/ai/summary', {
      method: 'POST',
      body: JSON.stringify(incompleteData),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  test('should handle OpenAI client errors gracefully', async () => {
    // Mock OpenAI client to throw error
    const { generateDiagnosisSummary } = require('@/lib/ai/openai-client')
    generateDiagnosisSummary.mockRejectedValueOnce(new Error('OpenAI API Error'))

    const request = new NextRequest('http://localhost:3000/api/ai/summary', {
      method: 'POST',
      body: JSON.stringify(mockUserData),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('AI要約の生成に失敗しました')
    expect(data.fallback_summary).toContain('申し訳ございませんが、現在AI要約の生成ができません')
  })

  test('should handle malformed JSON request', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/summary', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('AI要約の生成に失敗しました')
  })

  test('should handle empty request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/summary', {
      method: 'POST',
      body: '',
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(500) // Will fail at JSON parsing
  })
})