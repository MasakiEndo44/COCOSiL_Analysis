import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messageId, rating, sessionId, userId } = body;

        // Validation
        if (!messageId || !rating) {
            return NextResponse.json(
                { error: 'messageId and rating are required' },
                { status: 400 }
            );
        }

        if (rating !== 'helpful' && rating !== 'not_helpful') {
            return NextResponse.json(
                { error: 'rating must be either "helpful" or "not_helpful"' },
                { status: 400 }
            );
        }

        // Store feedback in database
        const feedback = await db.chatMessageFeedback.create({
            data: {
                messageId,
                rating,
                sessionId: sessionId || null,
                userId: userId || null
            }
        });

        return NextResponse.json({
            success: true,
            feedbackId: feedback.id
        });
    } catch (error) {
        console.error('Error storing feedback:', error);
        return NextResponse.json(
            { error: 'Failed to store feedback' },
            { status: 500 }
        );
    }
}
