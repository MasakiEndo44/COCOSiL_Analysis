import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import type { BasicInfo, MBTIResult, TaihekiResult, FortuneResult } from '@/types'

// Test data factories
export const createMockBasicInfo = (): BasicInfo => ({
  name: '山田太郎',
  email: 'test@example.com',
  gender: 'male',
  birthdate: {
    year: 1990,
    month: 5,
    day: 15
  },
  age: 33,
  timestamp: new Date('2023-01-01')
})

export const createMockMBTIResult = (): MBTIResult => ({
  type: 'INTJ',
  scores: {
    E: 20, I: 80,
    S: 30, N: 70,
    T: 75, F: 25,
    J: 85, P: 15
  },
  source: 'diagnosed',
  confidence: 0.85
})

export const createMockTaihekiResult = (): TaihekiResult => ({
  primary: 1,
  secondary: 3,
  scores: {
    1: 85, 2: 20, 3: 75, 4: 30, 5: 15,
    6: 25, 7: 40, 8: 10, 9: 35, 10: 20
  },
  characteristics: [
    '頭脳明晰で論理的思考を好む',
    '独立心が強く、一人の時間を大切にする',
    '完璧主義的な傾向がある'
  ],
  recommendations: [
    '定期的な運動で体のバランスを整える',
    '創造的な活動で感性を磨く',
    '他者との対話を通じて視野を広げる'
  ]
})

export const createMockFortuneResult = (): FortuneResult => ({
  zodiac: '午（うま）',
  animal: 'チーター',
  sixStar: '火星',
  element: '火',
  fortune: 'スピード感のある展開が期待できる時期。新しいチャレンジには絶好のタイミングです。 情熱とエネルギーが高まります。',
  characteristics: [
    '行動力がある',
    '独立心が強い',
    '目標達成能力が高い',
    '情熱的',
    'エネルギッシュ'
  ]
})

// Mock Zustand store
export const createMockDiagnosisStore = () => ({
  sessionId: 'test-session-123',
  basicInfo: createMockBasicInfo(),
  mbti: createMockMBTIResult(),
  taiheki: createMockTaihekiResult(),
  fortune: createMockFortuneResult(),
  currentStep: 'integration' as const,
  completedSteps: ['basic_info', 'mbti', 'taiheki_test', 'integration'] as const,
  progress: 100,
  isLoading: false,
  error: null,
  getUserData: jest.fn(() => ({
    id: 'test-session-123',
    basic: createMockBasicInfo(),
    mbti: createMockMBTIResult(),
    taiheki: createMockTaihekiResult(),
    fortune: createMockFortuneResult(),
    progress: {
      step: 'integration' as const,
      percentage: 100,
      completedSteps: ['basic_info', 'mbti', 'taiheki_test', 'integration'] as const
    }
  })),
  // Action mocks
  initializeSession: jest.fn(),
  setBasicInfo: jest.fn(),
  setMBTI: jest.fn(),
  setTaiheki: jest.fn(),
  setFortune: jest.fn(),
  setCurrentStep: jest.fn(),
  completeStep: jest.fn(),
  updateProgress: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
  clearAll: jest.fn(),
  saveToStorage: jest.fn(),
  loadFromStorage: jest.fn()
})

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, options)

// Mock fetch responses
export const mockFetch = (response: any) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
  })
}

export const mockFetchError = (error: string, status: number = 500) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error }),
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }