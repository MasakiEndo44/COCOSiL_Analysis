import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * Migration payload schema - matches localStorage diagnosis data structure
 */
const migrationPayloadSchema = z.object({
  sessionId: z.string(),
  diagnosisData: z.object({
    // Basic info
    date: z.string(),
    name: z.string(),
    birthDate: z.string(),
    age: z.number(),
    gender: z.enum(['male', 'female', 'no_answer']),

    // Fortune results
    zodiac: z.string(),
    animal: z.string(),
    orientation: z.string(),
    color: z.string(),
    sixStar: z.string(),

    // Personality results
    mbti: z.string(),
    mainTaiheki: z.number(),
    subTaiheki: z.number().nullable().optional(),

    // Session metadata
    theme: z.string().default(''),
    advice: z.string().default(''),
    satisfaction: z.number().min(1).max(5).default(5),
    duration: z.string().default(''),
    feedback: z.string().default(''),

    // Optional fields
    integratedKeywords: z.string().optional(),
    aiSummary: z.string().optional(),
    isIntegratedReport: z.boolean().default(false),
    reportVersion: z.string().optional(),
    counselingSummary: z.string().optional(),
  }),
  // Idempotency token to prevent duplicate migrations
  migrationToken: z.string().optional(),
});

/**
 * POST /api/diagnosis/migrate
 *
 * Migrates anonymous diagnosis data from localStorage to authenticated user account
 *
 * Flow:
 * 1. User completes diagnosis anonymously (data in localStorage)
 * 2. User signs up with Clerk
 * 3. Client hook detects sign-up and POSTs localStorage data here
 * 4. Server links diagnosis to clerkUserId
 * 5. Client clears localStorage
 *
 * Security:
 * - Requires authenticated Clerk session
 * - Idempotent using sessionId (prevents duplicate migrations)
 * - Validates payload structure
 * - Records migration timestamp
 *
 * Request Body:
 * {
 *   sessionId: string,  // Unique session identifier from original diagnosis
 *   diagnosisData: { ... },  // Full diagnosis data from localStorage
 *   migrationToken?: string  // Optional client-generated token for extra dedup
 * }
 *
 * Response:
 * {
 *   success: true,
 *   id: number,
 *   message: string,
 *   migrated: boolean  // True if newly migrated, false if already existed
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Please sign in to migrate diagnosis data'
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = migrationPayloadSchema.parse(body);

    const { sessionId, diagnosisData } = validatedData;

    // Check if this sessionId already exists (idempotency check)
    const existingRecord = await db.diagnosisRecord.findUnique({
      where: { sessionId },
    });

    if (existingRecord) {
      // Record already exists

      if (existingRecord.clerkUserId === userId) {
        // Already migrated to this user - idempotent success
        console.log(`[MIGRATION] SessionId ${sessionId} already migrated to user ${userId}`);
        return NextResponse.json({
          success: true,
          id: existingRecord.id,
          message: '診断データは既に移行済みです',
          migrated: false,
          duplicate: true,
        });
      } else if (existingRecord.clerkUserId === null) {
        // Exists as anonymous - update with userId
        console.log(`[MIGRATION] Updating anonymous record ${existingRecord.id} with userId ${userId}`);

        const updatedRecord = await db.diagnosisRecord.update({
          where: { id: existingRecord.id },
          data: {
            clerkUserId: userId,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          id: updatedRecord.id,
          message: '診断データを移行しました',
          migrated: true,
        });
      } else {
        // Belongs to different user - conflict
        console.warn(`[MIGRATION] Conflict: SessionId ${sessionId} belongs to different user`);
        return NextResponse.json(
          {
            success: false,
            error: 'この診断データは既に別のアカウントに紐付けられています',
          },
          { status: 409 }
        );
      }
    }

    // No existing record - create new one with clerkUserId
    console.log(`[MIGRATION] Creating new record for user ${userId} from sessionId ${sessionId}`);

    const newRecord = await db.diagnosisRecord.create({
      data: {
        sessionId,
        clerkUserId: userId,
        date: diagnosisData.date,
        name: diagnosisData.name,
        birthDate: diagnosisData.birthDate,
        age: diagnosisData.age,
        gender: diagnosisData.gender,
        zodiac: diagnosisData.zodiac,
        animal: diagnosisData.animal,
        orientation: diagnosisData.orientation,
        color: diagnosisData.color,
        mbti: diagnosisData.mbti,
        mainTaiheki: diagnosisData.mainTaiheki,
        subTaiheki: diagnosisData.subTaiheki ?? null,
        sixStar: diagnosisData.sixStar,
        theme: diagnosisData.theme,
        advice: diagnosisData.advice,
        satisfaction: diagnosisData.satisfaction,
        duration: diagnosisData.duration,
        feedback: diagnosisData.feedback,
        integratedKeywords: diagnosisData.integratedKeywords,
        aiSummary: diagnosisData.aiSummary,
        isIntegratedReport: diagnosisData.isIntegratedReport,
        reportVersion: diagnosisData.reportVersion ?? 'v2.0-migrated',
        counselingSummary: diagnosisData.counselingSummary,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      id: newRecord.id,
      message: '診断データを保存しました',
      migrated: true,
    });

  } catch (error) {
    console.error('[MIGRATION] Error migrating diagnosis data:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid migration data format',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during migration',
      },
      { status: 500 }
    );
  }
}
