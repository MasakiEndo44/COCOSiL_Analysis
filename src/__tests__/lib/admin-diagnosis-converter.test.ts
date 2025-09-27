/**
 * @jest-environment node
 */
import { convertDiagnosisRecordToData, generateMarkdownFromRecord, backfillMarkdownForRecord } from '@/lib/admin-diagnosis-converter'
import type { DiagnosisRecord } from '@/types/admin'

// Mock modules
jest.mock('@/lib/build-diagnosis-markdown')
jest.mock('@/lib/utils')

// Set up mocks after imports
const { buildDiagnosisMarkdown } = require('@/lib/build-diagnosis-markdown')
buildDiagnosisMarkdown.mockReturnValue('# 診断結果\n\n## 基本情報\n- 名前: テスト太郎\n- 年齢: 30歳\n\n## MBTI結果\n- タイプ: INTJ\n\n## 体癖結果\n- 主体癖: 1種\n- 副体癖: 3種\n\n## 算命学結果\n- 動物: チーター\n- 六星: 火星\n\n## 統合プロファイル\n- キャッチフレーズ: 情熱に満ちた芸術家')

const createMockDiagnosisRecord = (): DiagnosisRecord => ({
  id: 1,
  date: '2024-01-15',
  name: 'テスト太郎',
  birthDate: '1994/03/20',
  age: 30,
  gender: 'male',
  zodiac: '犬（いぬ）',
  animal: 'チーター',
  orientation: 'right',
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
  reportUrl: null,
  isIntegratedReport: false,
  reportVersion: null,
  interviewScheduled: null,
  interviewDone: null,
  memo: null,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z'),
  markdownContent: null,
  markdownVersion: null
})

describe('admin-diagnosis-converter', () => {
  describe('convertDiagnosisRecordToData', () => {
    test('should convert DiagnosisRecord to DiagnosisData format correctly', () => {
      const record = createMockDiagnosisRecord()
      const result = convertDiagnosisRecordToData(record)

      // Basic info conversion
      expect(result.basicInfo).toEqual({
        name: 'テスト太郎',
        birthdate: { year: 1994, month: 3, day: 20 },
        gender: 'male'
      })

      // MBTI conversion
      expect(result.mbti).toEqual({
        type: 'INTJ',
        source: 'known',
        confidence: 1.0,
        description: 'INTJタイプ'
      })

      // Taiheki conversion
      expect(result.taiheki).toEqual({
        primary: 1,
        secondary: 3,
        characteristics: ['主体癖1種（感情豊かな芸術家）', '副体癖3種（忍耐強い支援者）']
      })

      // Fortune conversion
      expect(result.fortune).toMatchObject({
        animal: 'チーター',
        sixStar: '火星',
        element: '赤',
        animalDetails: {
          character: 'チーター',
          color: '赤',
          orientation: 'right'
        }
      })

      // Integrated profile
      expect(result.integratedProfile).toEqual({
        catchphrase: '仕事とプライベートのバランス',
        interpersonal: '初対面の人とは積極的にコミュニケーションを取り、相手の気持ちを大切にしながら関係を築くタイプです。社交的な面が周りから信頼されています。',
        cognition: '直感的に判断し、状況に応じて柔軟に行動するタイプです。感情豊かで自由奔放な特徴があり、独自のペースで物事を進めます。'
      })

      // Zodiac sign
      expect(result.zodiacSign).toBe('犬（いぬ）')

      // Chat summary
      expect(result.chatSummary).toMatchObject({
        topicTitle: '仕事とプライベートのバランス',
        overallInsight: '自分のペースを大切にしながら、周囲との協調性も意識していきましょう。',
        keyPoints: ['非常に的確な診断でした。'],
        fullTranscript: expect.arrayContaining([
          expect.objectContaining({
            role: 'assistant',
            content: 'こんにちは、テスト太郎さん！診断結果を基にご相談をお受けします。'
          }),
          expect.objectContaining({
            role: 'user',
            content: '「仕事とプライベートのバランス」について相談したいです。'
          }),
          expect.objectContaining({
            role: 'assistant',
            content: '自分のペースを大切にしながら、周囲との協調性も意識していきましょう。'
          })
        ])
      })
    })

    test('should handle missing optional fields gracefully', () => {
      const record: DiagnosisRecord = {
        ...createMockDiagnosisRecord(),
        subTaiheki: null,
        theme: null,
        advice: null,
        feedback: null
      }

      const result = convertDiagnosisRecordToData(record)

      expect(result.taiheki.secondary).toBe(0)
      expect(result.integratedProfile.catchphrase).toBe('情熱に満ちた芸術家')
      expect(result.chatSummary).toBeUndefined()
    })

    test('should parse birthdate correctly for different formats', () => {
      const record = createMockDiagnosisRecord()
      record.birthDate = '1990/12/05'

      const result = convertDiagnosisRecordToData(record)

      expect(result.basicInfo.birthdate).toEqual({
        year: 1990,
        month: 12,
        day: 5
      })
    })
  })

  describe('generateMarkdownFromRecord', () => {
    test('should generate markdown from DiagnosisRecord', () => {
      const record = createMockDiagnosisRecord()
      const markdown = generateMarkdownFromRecord(record)

      expect(markdown).toBe('# 診断結果\n\n## 基本情報\n- 名前: テスト太郎\n- 年齢: 30歳\n\n## MBTI結果\n- タイプ: INTJ\n\n## 体癖結果\n- 主体癖: 1種\n- 副体癖: 3種\n\n## 算命学結果\n- 動物: チーター\n- 六星: 火星\n\n## 統合プロファイル\n- キャッチフレーズ: 情熱に満ちた芸術家')
    })

    test('should call buildDiagnosisMarkdown with converted data', () => {
      const { buildDiagnosisMarkdown } = require('@/lib/build-diagnosis-markdown')
      const record = createMockDiagnosisRecord()

      generateMarkdownFromRecord(record)

      expect(buildDiagnosisMarkdown).toHaveBeenCalledWith(
        expect.objectContaining({
          basicInfo: expect.objectContaining({
            name: 'テスト太郎',
            birthdate: { year: 1994, month: 3, day: 20 }
          }),
          mbti: expect.objectContaining({
            type: 'INTJ'
          }),
          taiheki: expect.objectContaining({
            primary: 1,
            secondary: 3
          })
        })
      )
    })
  })

  describe('backfillMarkdownForRecord', () => {
    const mockDb = {
      diagnosisRecord: {
        findUnique: jest.fn(),
        update: jest.fn()
      }
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    test('should successfully backfill markdown for existing record', async () => {
      const record = createMockDiagnosisRecord()
      mockDb.diagnosisRecord.findUnique.mockResolvedValue(record)
      mockDb.diagnosisRecord.update.mockResolvedValue({ ...record, markdownContent: 'generated markdown' })

      const result = await backfillMarkdownForRecord(1, mockDb)

      expect(result).toBe(true)
      expect(mockDb.diagnosisRecord.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      })
      expect(mockDb.diagnosisRecord.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          markdownContent: expect.any(String),
          markdownVersion: '1.0'
        }
      })
    })

    test('should return false if record not found', async () => {
      mockDb.diagnosisRecord.findUnique.mockResolvedValue(null)

      const result = await backfillMarkdownForRecord(999, mockDb)

      expect(result).toBe(false)
      expect(mockDb.diagnosisRecord.update).not.toHaveBeenCalled()
    })

    test('should handle database errors gracefully', async () => {
      mockDb.diagnosisRecord.findUnique.mockRejectedValue(new Error('Database error'))

      const result = await backfillMarkdownForRecord(1, mockDb)

      expect(result).toBe(false)
      expect(mockDb.diagnosisRecord.update).not.toHaveBeenCalled()
    })

    test('should handle update errors gracefully', async () => {
      const record = createMockDiagnosisRecord()
      mockDb.diagnosisRecord.findUnique.mockResolvedValue(record)
      mockDb.diagnosisRecord.update.mockRejectedValue(new Error('Update failed'))

      const result = await backfillMarkdownForRecord(1, mockDb)

      expect(result).toBe(false)
    })
  })
})