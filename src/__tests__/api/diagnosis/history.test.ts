/**
 * @jest-environment node
 */

/**
 * Unit tests for /api/diagnosis/history endpoint
 *
 * Tests:
 * - Authentication requirement
 * - Cursor-based pagination
 * - Sort order
 * - Authorization (only user's own records)
 * - Query parameter validation
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/diagnosis/history/route';
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

describe('/api/diagnosis/history', () => {
  const mockRecords = [
    {
      id: 1,
      sessionId: 'session-1',
      date: '2025-10-30',
      name: '山田太郎',
      birthDate: '1990/01/01',
      age: 35,
      gender: 'male',
      mbti: 'INTJ',
      mainTaiheki: 1,
      subTaiheki: 2,
      zodiac: '山羊座',
      animal: '狼',
      sixStar: '土星人+',
      isIntegratedReport: false,
      createdAt: new Date('2025-10-30T10:00:00'),
      updatedAt: new Date('2025-10-30T10:00:00'),
    },
    {
      id: 2,
      sessionId: 'session-2',
      date: '2025-10-29',
      name: '佐藤花子',
      birthDate: '1992/05/15',
      age: 33,
      gender: 'female',
      mbti: 'ENFP',
      mainTaiheki: 3,
      subTaiheki: null,
      zodiac: '牡牛座',
      animal: 'ペガサス',
      sixStar: '金星人-',
      isIntegratedReport: true,
      createdAt: new Date('2025-10-29T15:30:00'),
      updatedAt: new Date('2025-10-29T15:30:00'),
    },
  ] as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history');

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Unauthorized');
    });
  });

  describe('Authorization', () => {
    it('should only return records owned by authenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findMany.mockResolvedValue(mockRecords);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history');

      await GET(request);

      expect(prismaMock.diagnosisRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            clerkUserId: 'user_123',
          },
        })
      );
    });
  });

  describe('Pagination', () => {
    it('should return default limit of 20 records', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findMany.mockResolvedValue(mockRecords);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history');

      await GET(request);

      expect(prismaMock.diagnosisRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 21, // limit + 1 for hasMore detection
        })
      );
    });

    it('should respect custom limit parameter', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findMany.mockResolvedValue(mockRecords);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history?limit=10');

      await GET(request);

      expect(prismaMock.diagnosisRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 11, // limit + 1
        })
      );
    });

    it('should use cursor for pagination', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findMany.mockResolvedValue(mockRecords);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history?cursor=50');

      await GET(request);

      expect(prismaMock.diagnosisRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: 50 },
        })
      );
    });

    it('should detect if there are more records', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      // Return 3 records when limit is 2 (means hasMore = true)
      const threeRecords = [...mockRecords, { ...mockRecords[0], id: 3 }];
      prismaMock.diagnosisRecord.findMany.mockResolvedValue(threeRecords);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history?limit=2');

      const response = await GET(request);
      const body = await response.json();

      expect(body.pagination.hasMore).toBe(true);
      expect(body.pagination.nextCursor).toBe(2); // ID of second-to-last record
      expect(body.data).toHaveLength(2); // Should trim to limit
    });

    it('should indicate no more records when at end', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findMany.mockResolvedValue(mockRecords);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history?limit=20');

      const response = await GET(request);
      const body = await response.json();

      expect(body.pagination.hasMore).toBe(false);
      expect(body.pagination.nextCursor).toBeNull();
    });
  });

  describe('Sort Order', () => {
    it('should default to descending order by createdAt', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findMany.mockResolvedValue(mockRecords);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history');

      await GET(request);

      expect(prismaMock.diagnosisRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: 'desc',
          },
        })
      );
    });

    it('should respect custom sort order', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findMany.mockResolvedValue(mockRecords);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history?sortOrder=asc');

      await GET(request);

      expect(prismaMock.diagnosisRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: 'asc',
          },
        })
      );
    });
  });

  describe('Query Parameter Validation', () => {
    it('should return 400 for invalid limit', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history?limit=200');

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid query parameters');
    });

    it('should return 400 for invalid sortOrder', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history?sortOrder=invalid');

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid query parameters');
    });
  });

  describe('Response Format', () => {
    it('should return data and pagination info', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findMany.mockResolvedValue(mockRecords);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/history');

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('pagination');
      expect(body.pagination).toHaveProperty('nextCursor');
      expect(body.pagination).toHaveProperty('hasMore');
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
