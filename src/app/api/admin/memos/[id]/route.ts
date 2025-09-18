import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-middleware';

const memoSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(['general', 'follow_up', 'improvement', 'concern']),
  priority: z.enum(['low', 'medium', 'high']),
  recordId: z.number(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証確認
    await requireAdminAuth(request);

    const recordId = parseInt(params.id);
    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: 'Invalid record ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = memoSchema.parse(body);

    // Verify the record exists
    const record = await db.diagnosisRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Create memo record
    const memo = await db.memo.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        category: validatedData.category,
        priority: validatedData.priority,
        recordId: recordId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      memo,
    });
  } catch (error) {
    console.error('Error creating memo:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証確認
    await requireAdminAuth(request);

    const recordId = parseInt(params.id);
    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: 'Invalid record ID' },
        { status: 400 }
      );
    }

    // Get all memos for this record
    const memos = await db.memo.findMany({
      where: { recordId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      memos,
    });
  } catch (error) {
    console.error('Error fetching memos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証確認
    await requireAdminAuth(request);

    const memoId = parseInt(params.id);
    if (isNaN(memoId)) {
      return NextResponse.json(
        { error: 'Invalid memo ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = z.object({
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      category: z.enum(['general', 'follow_up', 'improvement', 'concern']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    }).parse(body);

    // Update memo
    const memo = await db.memo.update({
      where: { id: memoId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      memo,
    });
  } catch (error) {
    console.error('Error updating memo:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証確認
    await requireAdminAuth(request);

    const memoId = parseInt(params.id);
    if (isNaN(memoId)) {
      return NextResponse.json(
        { error: 'Invalid memo ID' },
        { status: 400 }
      );
    }

    // Delete memo
    await db.memo.delete({
      where: { id: memoId },
    });

    return NextResponse.json({
      success: true,
      message: 'Memo deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting memo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}