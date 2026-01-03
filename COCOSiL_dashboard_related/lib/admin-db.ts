import { PrismaClient } from '@prisma/client';

declare global {
  var __adminDb: PrismaClient | undefined;
}

// 管理者データベース専用のPrismaクライアント
export const adminDb = globalThis.__adminDb || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__adminDb = adminDb;
}

export default adminDb;