/**
 * @jest-environment node
 */

/**
 * Unit tests for /api/diagnosis/[id] endpoint
 *
 * Tests:
 * - Authentication requirement
 * - Authorization (ownership check)
 * - ID parameter validation
 * - Record not found handling
 * - Successful retrieval
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/diagnosis/[id]/route';
import { auth } from '@clerk/nextjs/server';
import { prismaMock } from '../../../../tests/helpers/prisma-mock';

// Mock dependencies
jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  get db() {
    return require('../../../../tests/helpers/prisma-mock').prismaMock;
  },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/diagnosis/[id]', () => {
  const mockRecord = {
    id: 42,
    sessionId: 'session-123',
    clerkUserId: 'user_123',
    date: '2025-10-30',
    name: '山田太郎',
    birthDate: '1990/01/01',
    age: 35,
    gender: 'male',
    zodiac: '山羊座',
    animal: '狼',
    orientation: '地',
    color: '緑',
    mbti: 'INTJ',
    mainTaiheki: 1,
    subTaiheki: 2,
    sixStar: '土星人+',
    theme: 'テスト',
    advice: 'アドバイス',
    satisfaction: 5,
    duration: '30分',
    feedback: 'フィードバック',
    reportUrl: null,
    interviewScheduled: null,
    interviewDone: null,
    memo: null,
    integratedKeywords: null,
    aiSummary: null,
    fortuneColor: null,
    reportVersion: 'v2.0',
    isIntegratedReport: false,
    markdownContent: null,
    markdownVersion: null,
    counselingSummary: null,
    createdAt: new Date('2025-10-30T10:00:00'),
    updatedAt: new Date('2025-10-30T10:00:00'),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/42');
      const params = { params: { id: '42' } };

      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Unauthorized');
    });
  });

  describe('ID Parameter Validation', () => {
    it('should return 400 for invalid ID format', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/invalid');
      const params = { params: { id: 'invalid' } };

      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid diagnosis ID');
    });

    it('should handle valid integer ID', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findFirst.mockResolvedValue(mockRecord);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/42');
      const params = { params: { id: '42' } };

      const response = await GET(request, params);

      expect(response.status).toBe(200);
      expect(prismaMock.diagnosisRecord.findFirst).toHaveBeenCalledWith({
        where: {
          id: 42,
          clerkUserId: 'user_123',
        },
      });
    });
  });

  describe('Authorization', () => {
    it('should only return record owned by authenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findFirst.mockResolvedValue(mockRecord);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/42');
      const params = { params: { id: '42' } };

      await GET(request, params);

      expect(prismaMock.diagnosisRecord.findFirst).toHaveBeenCalledWith({
        where: {
          id: 42,
          clerkUserId: 'user_123', // Authorization check
        },
      });
    });

    it('should return 404 if record belongs to different user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findFirst.mockResolvedValue(null); // No match due to userId filter

      const request = new NextRequest('http://localhost:3000/api/diagnosis/42');
      const params = { params: { id: '42' } };

      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('not found or access denied');
    });
  });

  describe('Record Not Found', () => {
    it('should return 404 if record does not exist', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/9999');
      const params = { params: { id: '9999' } };

      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('not found');
    });
  });

  describe('Successful Retrieval', () => {
    it('should return diagnosis record data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findFirst.mockResolvedValue(mockRecord);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/42');
      const params = { params: { id: '42' } };

      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body.data).toMatchObject({
        id: 42,
        name: '山田太郎',
        mbti: 'INTJ',
        clerkUserId: 'user_123',
      });
    });

    it('should include all record fields', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findFirst.mockResolvedValue(mockRecord);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/42');
      const params = { params: { id: '42' } };

      const response = await GET(request, params);
      const body = await response.json();

      expect(body.data).toHaveProperty('zodiac');
      expect(body.data).toHaveProperty('animal');
      expect(body.data).toHaveProperty('mainTaiheki');
      expect(body.data).toHaveProperty('createdAt');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findFirst.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/diagnosis/42');
      const params = { params: { id: '42' } };

      const response = await GET(request, params);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Internal server error');
    });
  });
});
