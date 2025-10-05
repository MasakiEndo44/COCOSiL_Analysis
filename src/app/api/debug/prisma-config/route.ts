/**
 * Diagnostic API endpoint to inspect Prisma Client configuration at runtime
 * This helps identify why SQLite errors occur despite PostgreSQL configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(_request: NextRequest) {
  try {
    // Collect diagnostic information
    const diagnostics: Record<string, any> = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
      },
      databaseConfig: {
        DATABASE_URL_exists: !!process.env.DATABASE_URL,
        DATABASE_URL_prefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
        DIRECT_URL_exists: !!process.env.DIRECT_URL,
        DIRECT_URL_prefix: process.env.DIRECT_URL?.substring(0, 20) + '...',
        PRISMA_SKIP_POSTINSTALL_GENERATE: process.env.PRISMA_SKIP_POSTINSTALL_GENERATE,
      },
      prismaClient: {},
      runtimePath: {
        // Show where the code is running (should be /var/task on Vercel)
        cwd: process.cwd(),
        __dirname: typeof __dirname !== 'undefined' ? __dirname : 'not available',
      },
    };

    // Try to create a Prisma Client instance and catch any initialization errors
    try {
      const prisma = new PrismaClient();
      // Try to execute a simple query
      await prisma.$queryRaw`SELECT 1`;
      diagnostics.prismaClient.status = 'initialized_successfully';
      diagnostics.prismaClient.queryTest = 'passed';
      await prisma.$disconnect();
    } catch (error: any) {
      diagnostics.prismaClient.status = 'initialization_failed';
      diagnostics.prismaClient.error = {
        name: error.name,
        message: error.message,
        code: error.code,
        errorCode: error.errorCode,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      };
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Diagnostic endpoint failed',
        details: {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 10).join('\n'),
        },
      },
      { status: 500 }
    );
  }
}
