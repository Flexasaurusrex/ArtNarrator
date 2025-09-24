import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateProjectSchema, ApiResponse } from '@/lib/schemas';

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch projects',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const validatedData = CreateProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: validatedData,
    });

    // Create default text style
    await prisma.textStyle.create({
      data: {
        projectId: project.id,
        name: 'Default',
        titleFont: 'Inter',
        bodyFont: 'Inter',
        titleSize: 64,
        bodySize: 44,
        weight: '600',
        align: 'left',
        shadow: 0.4,
        outline: 2,
        color: '#ffffff',
        bgBlur: 0,
        bgOpacity: 0,
        padding: 32,
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 400 });
  }
}
