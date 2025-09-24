import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = params;

    const [project, scenes, textStyles, musicTracks] = await Promise.all([
      prisma.project.findUnique({ where: { id } }),
      prisma.scene.findMany({ 
        where: { projectId: id }, 
        orderBy: { order: 'asc' } 
      }),
      prisma.textStyle.findMany({ where: { projectId: id } }),
      prisma.musicTrack.findMany({ where: { projectId: id } }),
    ]);

    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        project,
        scenes,
        textStyles,
        musicTracks,
      },
    });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch project',
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = params;
    const body = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update project',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = params;

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete project',
    }, { status: 500 });
  }
}
