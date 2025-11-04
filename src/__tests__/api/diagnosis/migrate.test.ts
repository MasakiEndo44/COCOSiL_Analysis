/**
 * @jest-environment node
 */

/**
 * Unit tests for /api/diagnosis/migrate endpoint
 *
 * Tests:
 * - Authentication requirement
 * - Idempotency (sessionId deduplication)
 * - Data validation
 * - Successful migration
 * - Conflict handling (different user owns sessionId)
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/diagnosis/migrate/route';
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

describe('/api/diagnosis/migrate', () => {
  const validMigrationPayload = {
    sessionId: 'test-session-123',
    diagnosisData: {
      date: '2025-10-30',
      name: '山田太郎',
      birthDate: '1990/01/01',
      age: 35,
      gender: 'male' as const,
      zodiac: '山羊座',
      animal: '狼',
      orientation: '地',
      color: '緑',
      sixStar: '土星人+',
      mbti: 'INTJ',
      mainTaiheki: 1,
      subTaiheki: 2,
      theme: 'テストテーマ',
      advice: 'テストアドバイス',
      satisfaction: 5,
      duration: '30分',
      feedback: 'テストフィードバック',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated state
      mockAuth.mockResolvedValue({ userId: null } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/migrate', {
        method: 'POST',
        body: JSON.stringify(validMigrationPayload),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Unauthorized');
    });

    it('should proceed if user is authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findUnique.mockResolvedValue(null);
      prismaMock.diagnosisRecord.create.mockResolvedValue({
        id: 1,
        ...validMigrationPayload.diagnosisData,
        sessionId: validMigrationPayload.sessionId,
        clerkUserId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/migrate', {
        method: 'POST',
        body: JSON.stringify(validMigrationPayload),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Idempotency', () => {
    it('should return existing record if sessionId already migrated to same user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findUnique.mockResolvedValue({
        id: 100,
        sessionId: 'test-session-123',
        clerkUserId: 'user_123',
        ...validMigrationPayload.diagnosisData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/migrate', {
        method: 'POST',
        body: JSON.stringify(validMigrationPayload),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.migrated).toBe(false);
      expect(body.duplicate).toBe(true);
      expect(body.id).toBe(100);
      expect(prismaMock.diagnosisRecord.create).not.toHaveBeenCalled();
    });

    it('should update record if sessionId exists as anonymous', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findUnique.mockResolvedValue({
        id: 100,
        sessionId: 'test-session-123',
        clerkUserId: null, // Anonymous
        ...validMigrationPayload.diagnosisData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      prismaMock.diagnosisRecord.update.mockResolvedValue({
        id: 100,
        sessionId: 'test-session-123',
        clerkUserId: 'user_123',
        ...validMigrationPayload.diagnosisData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/migrate', {
        method: 'POST',
        body: JSON.stringify(validMigrationPayload),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.migrated).toBe(true);
      expect(prismaMock.diagnosisRecord.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: expect.objectContaining({
          clerkUserId: 'user_123',
        }),
      });
    });

    it('should return 409 if sessionId belongs to different user', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findUnique.mockResolvedValue({
        id: 100,
        sessionId: 'test-session-123',
        clerkUserId: 'different_user', // Different user
        ...validMigrationPayload.diagnosisData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/migrate', {
        method: 'POST',
        body: JSON.stringify(validMigrationPayload),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.error).toContain('別のアカウント');
    });
  });

  describe('Data Validation', () => {
    it('should return 400 if payload is invalid', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      const invalidPayload = {
        sessionId: 'test-session-123',
        diagnosisData: {
          // Missing required fields
          name: '山田太郎',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/diagnosis/migrate', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid migration data');
    });
  });

  describe('Successful Migration', () => {
    it('should create new record with clerkUserId', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
      prismaMock.diagnosisRecord.findUnique.mockResolvedValue(null);
      prismaMock.diagnosisRecord.create.mockResolvedValue({
        id: 200,
        ...validMigrationPayload.diagnosisData,
        sessionId: validMigrationPayload.sessionId,
        clerkUserId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/diagnosis/migrate', {
        method: 'POST',
        body: JSON.stringify(validMigrationPayload),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.migrated).toBe(true);
      expect(body.id).toBe(200);
      expect(prismaMock.diagnosisRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sessionId: 'test-session-123',
          clerkUserId: 'user_123',
          name: '山田太郎',
          mbti: 'INTJ',
        }),
      });
    });
  });
});
