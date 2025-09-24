import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateSceneSchema, ApiResponse } from '@/lib/schemas';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const validatedData = CreateSceneSchema.parse(body);

    const scene = await prisma.scene.create({
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: scene,
    });
  } catch (error) {
    console.error('Failed to create scene:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create scene',
    }, { status: 400 });
  }
}
