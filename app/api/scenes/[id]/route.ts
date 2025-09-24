import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/schemas';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = params;
    const body = await request.json();

    const scene = await prisma.scene.update({
      where: { id },
      data: body,
    });

    // Update project timestamp
    await prisma.project.update({
      where: { id: scene.projectId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: scene,
    });
  } catch (error) {
    console.error('Failed to update scene:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update scene',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = params;

    const scene = await prisma.scene.delete({
      where: { id },
    });

    // Update project timestamp
    await prisma.project.update({
      where: { id: scene.projectId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Failed to delete scene:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete scene',
    }, { status: 500 });
  }
}
