import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/diagnosis/[id]
 *
 * Retrieves a single diagnosis record by ID
 * Only returns records owned by the authenticated user
 *
 * Path Parameters:
 * - id: number - Diagnosis record ID
 *
 * Response:
 * {
 *   data: DiagnosisRecord
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to view diagnosis' },
        { status: 401 }
      );
    }

    // Parse and validate ID
    const recordId = parseInt(params.id, 10);
    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: 'Invalid diagnosis ID' },
        { status: 400 }
      );
    }

    // Fetch diagnosis record with ownership check
    const record = await db.diagnosisRecord.findFirst({
      where: {
        id: recordId,
        clerkUserId: userId, // Authorization: user can only access their own records
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Diagnosis record not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: record,
    });
  } catch (error) {
    console.error('Error fetching diagnosis record:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
