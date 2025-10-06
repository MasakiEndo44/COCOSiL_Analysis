/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/admin/records/route'
import { NextRequest } from 'next/server'
import { DiagnosisRecord } from '@/types/admin'

// Mock admin middleware
jest.mock('@/lib/admin-middleware', () => ({
  requireAdminAuth: jest.fn().mockResolvedValue({
    userId: 'admin123',
    username: 'admin',
    role: 'admin',
    loginTime: '2024-01-15T10:00:00Z'
  }),
  requireAdminRole: jest.fn().mockResolvedValue({
    userId: 'admin123',
    username: 'admin',
    role: 'admin',
    loginTime: '2024-01-15T10:00:00Z'
  })
}))

// Mock diagnosis record data
const mockRecords: DiagnosisRecord[] = [
  {
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
    markdownContent: '# 診断結果\n\nテストMarkdownコンテンツ',
    markdownVersion: '1.0'
  },
  {
    id: 2,
    date: '2024-01-16',
    name: 'テスト花子',
    birthDate: '1995/08/10',
    age: 29,
    gender: 'female',
    zodiac: '鳥（とり）',
    animal: 'ライオン',
    orientation: 'castle_oriented',
    color: '青',
    mbti: 'ENFP',
    mainTaiheki: 2,
    subTaiheki: 4,
    sixStar: '土星',
    theme: 'キャリアアップ',
    advice: '積極的にチャレンジしていきましょう。',
    satisfaction: 5,
    duration: '50分',
    feedback: '素晴らしい診断でした。',
    reportUrl: undefined,
    isIntegratedReport: false,
    reportVersion: undefined,
    interviewScheduled: undefined,
    interviewDone: undefined,
    memo: undefined,
    createdAt: new Date('2024-01-16T11:30:00Z'),
    updatedAt: new Date('2024-01-16T11:30:00Z'),
    markdownContent: undefined,
    markdownVersion: undefined
  }
]

// Mock admin database
const mockAdminDb = {
  diagnosisRecord: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}

jest.mock('@/lib/admin-db', () => ({
  adminDb: mockAdminDb
}))

// Mock markdown generation
jest.mock('@/lib/admin-diagnosis-converter', () => ({
  generateMarkdownFromRecord: jest.fn().mockReturnValue('# 診断結果\n\n新規作成Markdownコンテンツ')
}))

describe('/api/admin/records', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    test('should return paginated records successfully', async () => {
      mockAdminDb.diagnosisRecord.findMany.mockResolvedValue(mockRecords)
      mockAdminDb.diagnosisRecord.count.mockResolvedValue(50)

      const request = new NextRequest('http://localhost:3000/api/admin/records?page=1&limit=50')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.records).toEqual(mockRecords)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 50,
        pages: 1
      })
    })

    test('should handle pagination parameters correctly', async () => {
      mockAdminDb.diagnosisRecord.findMany.mockResolvedValue([mockRecords[0]])
      mockAdminDb.diagnosisRecord.count.mockResolvedValue(100)

      const request = new NextRequest('http://localhost:3000/api/admin/records?page=2&limit=25')

      const response = await GET(request)
      const data = await response.json()

      expect(mockAdminDb.diagnosisRecord.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        skip: 25, // (page - 1) * limit = (2 - 1) * 25
        take: 25
      })

      expect(data.pagination).toEqual({
        page: 2,
        limit: 25,
        total: 100,
        pages: 4 // Math.ceil(100 / 25)
      })
    })

    test('should use default pagination when parameters not provided', async () => {
      mockAdminDb.diagnosisRecord.findMany.mockResolvedValue(mockRecords)
      mockAdminDb.diagnosisRecord.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/admin/records')

      const _response = await GET(request)

      expect(mockAdminDb.diagnosisRecord.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        skip: 0, // (1 - 1) * 50
        take: 50
      })
    })

    test('should require admin authentication', async () => {
      const { requireAdminAuth } = require('@/lib/admin-middleware')
      requireAdminAuth.mockRejectedValueOnce(new Error('認証が必要です'))

      const request = new NextRequest('http://localhost:3000/api/admin/records')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証が必要です')
    })

    test('should handle database errors gracefully', async () => {
      mockAdminDb.diagnosisRecord.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/admin/records')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('診断記録の取得に失敗しました')
    })
  })

  describe('POST', () => {
    const newRecordData = {
      date: '2024-01-17',
      name: 'テスト三郎',
      birthDate: '1993/12/25',
      age: 31,
      gender: 'male',
      zodiac: '虎（とら）',
      animal: 'ペガサス',
      orientation: 'center',
      color: '緑',
      mbti: 'ISFJ',
      mainTaiheki: 5,
      subTaiheki: 2,
      sixStar: '木星',
      theme: 'スキルアップ',
      advice: '継続的な学習を心がけましょう。',
      satisfaction: 4,
      duration: '40分',
      feedback: '参考になりました。',
      reportUrl: undefined,
      interviewScheduled: undefined,
      interviewDone: undefined,
      memo: undefined
    }

    test('should create new record with markdown generation successfully', async () => {
      const createdRecord = { id: 3, ...newRecordData, createdAt: new Date(), updatedAt: new Date() }
      const updatedRecord = {
        ...createdRecord,
        markdownContent: '# 診断結果\n\n新規作成Markdownコンテンツ',
        markdownVersion: '1.0'
      }

      mockAdminDb.diagnosisRecord.create.mockResolvedValue(createdRecord)
      mockAdminDb.diagnosisRecord.update.mockResolvedValue(updatedRecord)

      const request = new NextRequest('http://localhost:3000/api/admin/records', {
        method: 'POST',
        body: JSON.stringify(newRecordData),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.record).toEqual(createdRecord)

      // Verify markdown generation was attempted
      expect(mockAdminDb.diagnosisRecord.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: {
          markdownContent: '# 診断結果\n\n新規作成Markdownコンテンツ',
          markdownVersion: '1.0'
        }
      })
    })

    test('should continue successfully even if markdown generation fails', async () => {
      const { generateMarkdownFromRecord } = require('@/lib/admin-diagnosis-converter')
      generateMarkdownFromRecord.mockImplementationOnce(() => {
        throw new Error('Markdown generation failed')
      })

      const createdRecord = { id: 3, ...newRecordData, createdAt: new Date(), updatedAt: new Date() }
      mockAdminDb.diagnosisRecord.create.mockResolvedValue(createdRecord)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/admin/records', {
        method: 'POST',
        body: JSON.stringify(newRecordData),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      // Should still succeed
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.record).toEqual(createdRecord)

      // Should log the error
      expect(consoleSpy).toHaveBeenCalledWith('Failed to generate markdown for new record:', expect.any(Error))

      // Should not call update if markdown generation fails
      expect(mockAdminDb.diagnosisRecord.update).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    test('should continue successfully even if markdown update fails', async () => {
      const createdRecord = { id: 3, ...newRecordData, createdAt: new Date(), updatedAt: new Date() }
      mockAdminDb.diagnosisRecord.create.mockResolvedValue(createdRecord)
      mockAdminDb.diagnosisRecord.update.mockRejectedValue(new Error('Update failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const request = new NextRequest('http://localhost:3000/api/admin/records', {
        method: 'POST',
        body: JSON.stringify(newRecordData),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      // Should still succeed
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.record).toEqual(createdRecord)

      // Should log the error
      expect(consoleSpy).toHaveBeenCalledWith('Failed to generate markdown for new record:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    test('should require admin role for creation', async () => {
      const { requireAdminRole } = require('@/lib/admin-middleware')
      requireAdminRole.mockRejectedValueOnce(new Error('管理者権限が必要です'))

      const request = new NextRequest('http://localhost:3000/api/admin/records', {
        method: 'POST',
        body: JSON.stringify(newRecordData),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('管理者権限が必要です')
    })

    test('should handle database creation errors gracefully', async () => {
      mockAdminDb.diagnosisRecord.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/admin/records', {
        method: 'POST',
        body: JSON.stringify(newRecordData),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('診断記録の作成に失敗しました')
    })

    test('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/records', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('診断記録の作成に失敗しました')
    })

    test('should call database create with correct data structure', async () => {
      const createdRecord = { id: 3, ...newRecordData, createdAt: new Date(), updatedAt: new Date() }
      mockAdminDb.diagnosisRecord.create.mockResolvedValue(createdRecord)
      mockAdminDb.diagnosisRecord.update.mockResolvedValue(createdRecord)

      const request = new NextRequest('http://localhost:3000/api/admin/records', {
        method: 'POST',
        body: JSON.stringify(newRecordData),
        headers: {
          'content-type': 'application/json'
        }
      })

      await POST(request)

      expect(mockAdminDb.diagnosisRecord.create).toHaveBeenCalledWith({
        data: newRecordData
      })
    })
  })
})