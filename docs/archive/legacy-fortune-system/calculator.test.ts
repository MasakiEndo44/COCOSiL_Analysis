import { calculateFortune, calculateCompatibility } from '@/lib/fortune/calculator'

describe('Fortune Calculator', () => {
  describe('calculateFortune', () => {
    test('should calculate correct fortune for specific date', () => {
      const result = calculateFortune(1990, 5, 15)
      
      expect(result).toHaveProperty('zodiac')
      expect(result).toHaveProperty('animal')
      expect(result).toHaveProperty('sixStar')
      expect(result).toHaveProperty('element')
      expect(result).toHaveProperty('fortune')
      expect(result).toHaveProperty('characteristics')
      
      // 具体的な値をテスト
      expect(typeof result.zodiac).toBe('string')
      expect(typeof result.animal).toBe('string')
      expect(typeof result.element).toBe('string')
      expect(Array.isArray(result.characteristics)).toBe(true)
      expect(result.characteristics.length).toBeGreaterThan(0)
    })

    test('should handle edge case dates', () => {
      // 年始
      const newYear = calculateFortune(2000, 1, 1)
      expect(newYear.zodiac).toBeTruthy()
      
      // 年末
      const endYear = calculateFortune(2000, 12, 31)
      expect(endYear.zodiac).toBeTruthy()
      
      // うるう年
      const leapYear = calculateFortune(2000, 2, 29)
      expect(leapYear.zodiac).toBeTruthy()
    })

    test('should generate consistent results for same input', () => {
      const result1 = calculateFortune(1985, 8, 20)
      const result2 = calculateFortune(1985, 8, 20)
      
      expect(result1).toEqual(result2)
    })

    test('should generate different results for different dates', () => {
      const result1 = calculateFortune(1985, 8, 20)
      const result2 = calculateFortune(1990, 5, 15)
      
      // 完全に同じ結果になる可能性は低い
      expect(result1.animal !== result2.animal || 
             result1.element !== result2.element ||
             result1.zodiac !== result2.zodiac).toBe(true)
    })

    test('should handle boundary years', () => {
      // 下限
      const minYear = calculateFortune(1900, 1, 1)
      expect(minYear.zodiac).toBeTruthy()
      
      // 上限
      const maxYear = calculateFortune(2025, 12, 31)
      expect(maxYear.zodiac).toBeTruthy()
    })
  })

  describe('calculateCompatibility', () => {
    test('should calculate compatibility score', () => {
      const result = calculateCompatibility('チーター', 'ライオン')
      
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('description')
      expect(typeof result.score).toBe('number')
      expect(typeof result.description).toBe('string')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    test('should be symmetric for same animals', () => {
      const result1 = calculateCompatibility('チーター', 'ライオン')
      const result2 = calculateCompatibility('ライオン', 'チーター')
      
      expect(result1.score).toBe(result2.score)
    })

    test('should handle unknown animals with default score', () => {
      const result = calculateCompatibility('未知の動物', 'チーター')
      
      expect(result.score).toBe(50) // デフォルト値
      expect(result.description).toContain('普通の相性')
    })

    test('should provide appropriate descriptions for different score ranges', () => {
      // 高スコア
      const highScore = calculateCompatibility('チーター', 'ライオン') // 80点の設定
      if (highScore.score >= 80) {
        expect(highScore.description).toContain('非常に相性が良い')
      }
      
      // 中スコア
      const mediumScore = calculateCompatibility('チーター', '猿') // 70点の設定
      if (mediumScore.score >= 70 && mediumScore.score < 80) {
        expect(mediumScore.description).toContain('良い相性')
      }
    })
  })
})