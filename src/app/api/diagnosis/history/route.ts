import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Query parameter validation schema
const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.coerce.number().optional(), // Cursor-based pagination using record ID
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/diagnosis/history
 *
 * Retrieves diagnosis history for authenticated user
 *
 * Query Parameters:
 * - limit: number (1-100, default 20) - Number of records to return
 * - cursor: number (optional) - Record ID for pagination
 * - sortOrder: 'asc' | 'desc' (default 'desc') - Sort order by createdAt
 *
 * Response:
 * {
 *   data: DiagnosisRecord[],
 *   pagination: {
 *     nextCursor: number | null,
 *     hasMore: boolean
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to view diagnosis history' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const { limit, cursor, sortOrder } = querySchema.parse({
      limit: searchParams.get('limit') ?? undefined,
      cursor: searchParams.get('cursor') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
    });

    // Fetch diagnosis records for authenticated user
    const records = await db.diagnosisRecord.findMany({
      where: {
        clerkUserId: userId,
      },
      take: limit + 1, // Fetch one extra to detect if there are more records
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: sortOrder,
      },
      select: {
        id: true,
        sessionId: true,
        date: true,
        name: true,
        birthDate: true,
        age: true,
        gender: true,
        mbti: true,
        mainTaiheki: true,
        subTaiheki: true,
        zodiac: true,
        animal: true,
        sixStar: true,
        isIntegratedReport: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Determine if there are more records
    const hasMore = records.length > limit;
    const data = hasMore ? records.slice(0, -1) : records;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return NextResponse.json({
      data,
      pagination: {
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching diagnosis history:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
