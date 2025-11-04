/**
 * Prisma Mock Helper for Jest Tests
 *
 * Provides a properly typed mock of PrismaClient using jest-mock-extended.
 * This resolves TypeScript errors when mocking Prisma in Jest tests.
 *
 * Usage in tests:
 * ```typescript
 * import { prismaMock } from '@/tests/helpers/prisma-mock';
 *
 * // Mock Prisma operations
 * prismaMock.diagnosisRecord.findMany.mockResolvedValue([...]);
 * ```
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

/**
 * Deep mock of PrismaClient with full type safety
 * All Prisma methods are mocked and can be configured in tests
 */
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

/**
 * Reset all mocks before each test
 * Ensures test isolation and prevents state leakage between tests
 */
beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
