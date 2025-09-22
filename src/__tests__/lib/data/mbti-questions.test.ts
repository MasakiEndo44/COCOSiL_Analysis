import { calculateMBTI, mbtiQuestions, mbtiDescriptions } from '@/lib/data/mbti-questions'

describe('MBTI Questions and Calculation', () => {
  describe('mbtiQuestions data structure', () => {
    test('should have 12 questions', () => {
      expect(mbtiQuestions).toHaveLength(12)
    })

    test('each question should have required properties', () => {
      mbtiQuestions.forEach((question, index) => {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('question')
        expect(question).toHaveProperty('axis')
        expect(question).toHaveProperty('choices')
        
        expect(question.id).toBe(index + 1)
        expect(typeof question.question).toBe('string')
        expect(['EI', 'SN', 'TF', 'JP']).toContain(question.axis)
        expect(question.choices).toHaveLength(2)
        
        question.choices.forEach(choice => {
          expect(choice).toHaveProperty('text')
          expect(choice).toHaveProperty('type')
          expect(choice).toHaveProperty('weight')
          expect(typeof choice.text).toBe('string')
          expect(['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']).toContain(choice.type)
          expect(typeof choice.weight).toBe('number')
        })
      })
    })

    test('should have balanced axis distribution', () => {
      const axisCounts = mbtiQuestions.reduce((acc, q) => {
        acc[q.axis] = (acc[q.axis] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // 各軸が3問ずつ
      expect(axisCounts.EI).toBe(3)
      expect(axisCounts.SN).toBe(3)
      expect(axisCounts.TF).toBe(3)
      expect(axisCounts.JP).toBe(3)
    })
  })

  describe('calculateMBTI function', () => {
    test('should calculate INTJ for specific answer pattern', () => {
      // I, N, T, J寄りの回答パターン
      const answers: (0 | 1)[] = [
        0, 0, 0, // EI: I選択
        1, 1, 1, // SN: N選択
        0, 0, 0, // TF: T選択
        0, 0, 0  // JP: J選択
      ]
      
      const result = calculateMBTI(answers)
      
      expect(result.type).toBe('INTJ')
      expect(result.scores.I).toBeGreaterThan(result.scores.E)
      expect(result.scores.N).toBeGreaterThan(result.scores.S)
      expect(result.scores.T).toBeGreaterThan(result.scores.F)
      expect(result.scores.J).toBeGreaterThan(result.scores.P)
    })

    test('should calculate ESFP for opposite pattern', () => {
      // E, S, F, P寄りの回答パターン
      const answers: (0 | 1)[] = [
        1, 1, 1, // EI: E選択
        0, 0, 0, // SN: S選択
        1, 1, 1, // TF: F選択
        1, 1, 1  // JP: P選択
      ]
      
      const result = calculateMBTI(answers)
      
      expect(result.type).toBe('ESFP')
      expect(result.scores.E).toBeGreaterThan(result.scores.I)
      expect(result.scores.S).toBeGreaterThan(result.scores.N)
      expect(result.scores.F).toBeGreaterThan(result.scores.T)
      expect(result.scores.P).toBeGreaterThan(result.scores.J)
    })

    test('should handle mixed answers correctly', () => {
      // 各軸で2:1の比率
      const answers: (0 | 1)[] = [
        1, 1, 0, // EI: E寄り (2:1)
        0, 0, 1, // SN: S寄り (2:1)
        1, 0, 1, // TF: F寄り (2:1)
        0, 0, 1  // JP: J寄り (2:1)
      ]
      
      const result = calculateMBTI(answers)
      
      expect(result.type).toBe('ESFJ')
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    test('should calculate confidence correctly', () => {
      // 極端なケース（全て同じ選択）
      const extremeAnswers: (0 | 1)[] = Array(12).fill(0) as (0 | 1)[]
      const extremeResult = calculateMBTI(extremeAnswers)
      expect(extremeResult.confidence).toBeGreaterThan(0.8)
      
      // バランスの取れたケース
      const balancedAnswers: (0 | 1)[] = [
        0, 1, 0, // EI: バランス
        1, 0, 1, // SN: バランス  
        0, 1, 0, // TF: バランス
        1, 0, 1  // JP: バランス
      ]
      const balancedResult = calculateMBTI(balancedAnswers)
      expect(balancedResult.confidence).toBeLessThan(0.8)
    })

    test('should throw error for invalid input length', () => {
      expect(() => calculateMBTI([0, 1, 0])).toThrow()
      expect(() => calculateMBTI(Array(15).fill(0) as (0 | 1)[])).toThrow()
    })

    test('should have all score properties', () => {
      const answers: (0 | 1)[] = Array(12).fill(0) as (0 | 1)[]
      const result = calculateMBTI(answers)
      
      expect(result.scores).toHaveProperty('E')
      expect(result.scores).toHaveProperty('I')
      expect(result.scores).toHaveProperty('S')
      expect(result.scores).toHaveProperty('N')
      expect(result.scores).toHaveProperty('T')
      expect(result.scores).toHaveProperty('F')
      expect(result.scores).toHaveProperty('J')
      expect(result.scores).toHaveProperty('P')
      
      // スコアの合計が各軸で一定
      expect(result.scores.E + result.scores.I).toBe(3)
      expect(result.scores.S + result.scores.N).toBe(3)
      expect(result.scores.T + result.scores.F).toBe(3)
      expect(result.scores.J + result.scores.P).toBe(3)
    })
  })

  describe('mbtiDescriptions data', () => {
    test('should have descriptions for all 16 types', () => {
      const expectedTypes = [
        'INTJ', 'INTP', 'ENTJ', 'ENTP',
        'INFJ', 'INFP', 'ENFJ', 'ENFP',
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
        'ISTP', 'ISFP', 'ESTP', 'ESFP'
      ]
      
      expectedTypes.forEach(type => {
        expect(mbtiDescriptions).toHaveProperty(type)
        expect(mbtiDescriptions[type as keyof typeof mbtiDescriptions]).toHaveProperty('name')
        expect(mbtiDescriptions[type as keyof typeof mbtiDescriptions]).toHaveProperty('description')
        expect(mbtiDescriptions[type as keyof typeof mbtiDescriptions]).toHaveProperty('traits')
        
        const desc = mbtiDescriptions[type as keyof typeof mbtiDescriptions]
        expect(typeof desc.name).toBe('string')
        expect(typeof desc.description).toBe('string')
        expect(Array.isArray(desc.traits)).toBe(true)
        expect(desc.traits.length).toBeGreaterThan(0)
      })
    })
  })
})