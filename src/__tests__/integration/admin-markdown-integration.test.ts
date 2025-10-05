/**
 * @jest-environment node
 */
import { convertDiagnosisRecordToData, generateMarkdownFromRecord } from '@/lib/admin-diagnosis-converter'
import type { DiagnosisRecord } from '@/types/admin'

// Simple integration test focusing on the core markdown conversion workflow
describe('Admin Markdown Integration', () => {
  const mockRecord: DiagnosisRecord = {
    id: 1,
    date: '2024-01-15',
    name: 'テスト太郎',
    birthDate: '1994/03/20',
    age: 30,
    gender: 'male',
    zodiac: '犬（いぬ）',
    animal: 'チーター',
    orientation: 'people_oriented',
    color: '赤',
    mbti: 'INTJ',
    mainTaiheki: 1,
    subTaiheki: 3,
    sixStar: '火星',
    theme: '仕事とプライベートのバランス',
    advice: '自分のペースを大切にしながら、周囲との協調性も意識していきましょう。',
    satisfaction: 4,
    duration: '45分',
    feedback: '非常に的確な診断でした。',
    reportUrl: undefined,
    isIntegratedReport: false,
    reportVersion: undefined,
    interviewScheduled: undefined,
    interviewDone: undefined,
    memo: undefined,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    markdownContent: undefined,
    markdownVersion: undefined
  }

  test('should convert DiagnosisRecord to DiagnosisData format', () => {
    const result = convertDiagnosisRecordToData(mockRecord)

    // Verify basic info conversion
    expect(result.basicInfo).toEqual({
      name: 'テスト太郎',
      birthdate: { year: 1994, month: 3, day: 20 },
      gender: 'male'
    })

    // Verify MBTI conversion
    expect(result.mbti).toEqual({
      type: 'INTJ',
      source: 'known',
      confidence: 1.0,
      description: 'INTJタイプ'
    })

    // Verify taiheki conversion
    expect(result.taiheki.primary).toBe(1)
    expect(result.taiheki.secondary).toBe(3)

    // Verify fortune conversion
    expect(result.fortune.animal).toBe('チーター')
    expect(result.fortune.sixStar).toBe('火星')

    // Verify integrated profile exists
    expect(result.integratedProfile).toBeDefined()
    expect(result.integratedProfile.catchphrase).toBe('仕事とプライベートのバランス')

    // Verify chat summary when advice exists
    expect(result.chatSummary).toBeDefined()
    expect(result.chatSummary?.topicTitle).toBe('仕事とプライベートのバランス')
    expect(result.chatSummary?.overallInsight).toBe('自分のペースを大切にしながら、周囲との協調性も意識していきましょう。')
  })

  test('should generate markdown content from DiagnosisRecord', () => {
    const markdown = generateMarkdownFromRecord(mockRecord)

    // Verify markdown is generated (non-empty string)
    expect(typeof markdown).toBe('string')
    expect(markdown.length).toBeGreaterThan(0)

    // Verify markdown contains basic elements
    expect(markdown).toContain('テスト太郎')
    expect(markdown).toContain('INTJ')
    expect(markdown).toContain('チーター')
    expect(markdown).toContain('火星')
  })

  test('should handle records with missing optional fields', () => {
    const incompleteRecord: DiagnosisRecord = {
      ...mockRecord,
      subTaiheki: null,
      theme: '',
      advice: '',
      feedback: ''
    }

    const result = convertDiagnosisRecordToData(incompleteRecord)

    // Should handle null subTaiheki
    expect(result.taiheki.secondary).toBe(0)

    // Should use default catchphrase when theme is null
    expect(result.integratedProfile.catchphrase).toBe('情熱に満ちた芸術家')

    // Should not have chat summary when advice is null
    expect(result.chatSummary).toBeUndefined()

    // Should still generate markdown without errors
    const markdown = generateMarkdownFromRecord(incompleteRecord)
    expect(typeof markdown).toBe('string')
    expect(markdown.length).toBeGreaterThan(0)
  })

  test('should parse different birthdate formats correctly', () => {
    const testCases = [
      { birthDate: '1990/01/01', expected: { year: 1990, month: 1, day: 1 } },
      { birthDate: '2000/12/31', expected: { year: 2000, month: 12, day: 31 } },
      { birthDate: '1985/06/15', expected: { year: 1985, month: 6, day: 15 } }
    ]

    testCases.forEach(({ birthDate, expected }) => {
      const record = { ...mockRecord, birthDate }
      const result = convertDiagnosisRecordToData(record)
      expect(result.basicInfo.birthdate).toEqual(expected)
    })
  })

  test('should maintain data consistency through conversion pipeline', () => {
    // Test the complete conversion pipeline
    const result = convertDiagnosisRecordToData(mockRecord)
    const markdown = generateMarkdownFromRecord(mockRecord)

    // Verify that all key data points are preserved
    expect(result.basicInfo.name).toBe(mockRecord.name)
    expect(result.mbti.type).toBe(mockRecord.mbti)
    expect(result.taiheki.primary).toBe(mockRecord.mainTaiheki)
    expect(result.fortune.animal).toBe(mockRecord.animal)
    expect(result.zodiacSign).toBe(mockRecord.zodiac)

    // Verify markdown contains the converted data
    expect(markdown).toContain(result.basicInfo.name)
    expect(markdown).toContain(result.mbti.type)
    expect(markdown).toContain(result.fortune.animal)
  })
})