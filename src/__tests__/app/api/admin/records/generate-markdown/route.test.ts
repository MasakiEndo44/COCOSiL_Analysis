/**
 * @jest-environment node
 */
import { POST } from '@/app/api/admin/records/[id]/generate-markdown/route'
import { NextRequest } from 'next/server'
import { DiagnosisRecord } from '@/types/admin'

// Mock admin middleware
jest.mock('@/lib/admin-middleware', () => ({
  requireAdminRole: jest.fn().mockResolvedValue({
    userId: 'admin123',
    username: 'admin',
    role: 'admin',
    loginTime: '2024-01-15T10:00:00Z'
  })
}))

// Mock admin database
const mockRecord: DiagnosisRecord = {
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
}

const mockAdminDb = {
  diagnosisRecord: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
}

jest.mock('@/lib/admin-db', () => ({
  adminDb: mockAdminDb
}))

// Mock markdown generation
jest.mock('@/lib/admin-diagnosis-converter', () => ({
  generateMarkdownFromRecord: jest.fn().mockReturnValue('# 診断結果\n\nテストMarkdownコンテンツ')
}))

describe('/api/admin/records/[id]/generate-markdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should generate markdown successfully for valid record', async () => {
    mockAdminDb.diagnosisRecord.findUnique.mockResolvedValue(mockRecord)
    mockAdminDb.diagnosisRecord.update.mockResolvedValue({
      ...mockRecord,
      markdownContent: '# 診断結果\n\nテストMarkdownコンテンツ',
      markdownVersion: '1.0'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/records/1/generate-markdown', {
      method: 'POST'
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Markdownが正常に生成されました')
    expect(data.record).toMatchObject({
      id: 1,
      markdownContent: '# 診断結果\n\nテストMarkdownコンテンツ',
      markdownVersion: '1.0'
    })
    expect(data.markdownLength).toBe(21) // Length of test markdown
  })

  test('should return 400 for invalid record ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/records/invalid/generate-markdown', {
      method: 'POST'
    })

    const response = await POST(request, { params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('無効なレコードIDです')
  })

  test('should return 404 for non-existent record', async () => {
    mockAdminDb.diagnosisRecord.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/admin/records/999/generate-markdown', {
      method: 'POST'
    })

    const response = await POST(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('レコードが見つかりません')
  })

  test('should return 401 for authentication errors', async () => {
    const { requireAdminRole } = require('@/lib/admin-middleware')
    requireAdminRole.mockRejectedValueOnce(new Error('認証が必要です'))

    const request = new NextRequest('http://localhost:3000/api/admin/records/1/generate-markdown', {
      method: 'POST'
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('認証が必要です')
  })

  test('should handle database find errors gracefully', async () => {
    mockAdminDb.diagnosisRecord.findUnique.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/admin/records/1/generate-markdown', {
      method: 'POST'
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Markdownの生成に失敗しました')
  })

  test('should handle database update errors gracefully', async () => {
    mockAdminDb.diagnosisRecord.findUnique.mockResolvedValue(mockRecord)
    mockAdminDb.diagnosisRecord.update.mockRejectedValue(new Error('Update failed'))

    const request = new NextRequest('http://localhost:3000/api/admin/records/1/generate-markdown', {
      method: 'POST'
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Markdownの生成に失敗しました')
  })

  test('should handle markdown generation errors gracefully', async () => {
    const { generateMarkdownFromRecord } = require('@/lib/admin-diagnosis-converter')
    generateMarkdownFromRecord.mockImplementationOnce(() => {
      throw new Error('Markdown generation failed')
    })

    mockAdminDb.diagnosisRecord.findUnique.mockResolvedValue(mockRecord)

    const request = new NextRequest('http://localhost:3000/api/admin/records/1/generate-markdown', {
      method: 'POST'
    })

    const response = await POST(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Markdownの生成に失敗しました')
  })

  test('should verify admin role is required', async () => {
    const { requireAdminRole } = require('@/lib/admin-middleware')

    const request = new NextRequest('http://localhost:3000/api/admin/records/1/generate-markdown', {
      method: 'POST'
    })

    await POST(request, { params: { id: '1' } })

    expect(requireAdminRole).toHaveBeenCalledWith(request)
  })

  test('should call database methods with correct parameters', async () => {
    mockAdminDb.diagnosisRecord.findUnique.mockResolvedValue(mockRecord)
    mockAdminDb.diagnosisRecord.update.mockResolvedValue({
      ...mockRecord,
      markdownContent: '# 診断結果\n\nテストMarkdownコンテンツ',
      markdownVersion: '1.0'
    })

    const request = new NextRequest('http://localhost:3000/api/admin/records/1/generate-markdown', {
      method: 'POST'
    })

    await POST(request, { params: { id: '1' } })

    expect(mockAdminDb.diagnosisRecord.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    })
    expect(mockAdminDb.diagnosisRecord.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        markdownContent: '# 診断結果\n\nテストMarkdownコンテンツ',
        markdownVersion: '1.0',
        updatedAt: expect.any(Date)
      }
    })
  })
})