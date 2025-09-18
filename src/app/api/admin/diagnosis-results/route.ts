import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/prisma';

const diagnosisResultSchema = z.object({
  name: z.string().min(1),
  birthDate: z.string(), // YYYY/MM/DD format
  age: z.number().min(0),
  gender: z.enum(['male', 'female', 'no_answer']),
  zodiac: z.string(),
  animal: z.string(),
  orientation: z.string(),
  color: z.string(),
  mbti: z.string(),
  mainTaiheki: z.number(),
  subTaiheki: z.number().optional(),
  sixStar: z.string(),
  theme: z.string().default(''), // Topics joined by comma
  advice: z.string().default(''),
  satisfaction: z.number().min(1).max(5).default(5),
  duration: z.string().default(''),
  feedback: z.string().default(''),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = diagnosisResultSchema.parse(body);

    // Create diagnosis record
    const record = await db.diagnosisRecord.create({
      data: {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        name: validatedData.name,
        birthDate: validatedData.birthDate,
        age: validatedData.age,
        gender: validatedData.gender,
        zodiac: validatedData.zodiac,
        animal: validatedData.animal,
        orientation: validatedData.orientation,
        color: validatedData.color,
        mbti: validatedData.mbti,
        mainTaiheki: validatedData.mainTaiheki,
        subTaiheki: validatedData.subTaiheki,
        sixStar: validatedData.sixStar,
        theme: validatedData.theme,
        advice: validatedData.advice,
        satisfaction: validatedData.satisfaction,
        duration: validatedData.duration,
        feedback: validatedData.feedback,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      id: record.id,
      message: '診断結果が保存されました',
    });
  } catch (error) {
    console.error('Error saving diagnosis result:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}