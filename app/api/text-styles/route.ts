import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateTextStyleSchema, ApiResponse } from '@/lib/schemas';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const validatedData = CreateTextStyleSchema.parse(body);

    const textStyle = await prisma.textStyle.create({
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: textStyle,
    });
  } catch (error) {
    console.error('Failed to create text style:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create text style',
    }, { status: 400 });
  }
}
