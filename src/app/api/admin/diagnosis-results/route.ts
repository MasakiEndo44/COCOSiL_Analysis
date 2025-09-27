import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/prisma';
import { generateMarkdownFromRecord } from '@/lib/admin-diagnosis-converter';

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
  subTaiheki: z.number().nullable(),
  sixStar: z.string(),
  theme: z.string().default(''), // Topics joined by comma
  advice: z.string().default(''),
  satisfaction: z.number().min(1).max(5).default(5),
  duration: z.string().default(''),
  feedback: z.string().default(''),
  // 統合診断専用フィールド
  integratedKeywords: z.string().optional(), // JSON配列形式
  aiSummary: z.string().optional(),
  isIntegratedReport: z.boolean().default(false),
  reportVersion: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = diagnosisResultSchema.parse(body);

    // Create diagnosis record with integrated fields
    const createData = {
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
      // 統合診断専用フィールド
      integratedKeywords: validatedData.integratedKeywords,
      aiSummary: validatedData.aiSummary,
      isIntegratedReport: validatedData.isIntegratedReport,
      reportVersion: validatedData.reportVersion || 'v2.0-integrated',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const record = await db.diagnosisRecord.create({
      data: createData,
    });

    // Generate and save markdown content
    const markdownContent = generateMarkdownFromRecord(record);
    const updatedRecord = await db.diagnosisRecord.update({
      where: { id: record.id },
      data: {
        markdownContent,
        markdownVersion: '1.0',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      id: record.id,
      message: '診断結果が保存されました',
      markdownGenerated: !!markdownContent,
      markdownLength: markdownContent?.length || 0,
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