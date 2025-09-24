import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = params;

    const renderJob = await prisma.renderJob.findUnique({
      where: { id },
    });

    if (!renderJob) {
      return NextResponse.json({
        success: false,
        error: 'Render job not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: renderJob,
    });
  } catch (error) {
    console.error('Failed to get render job:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get render job',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = params;

    await prisma.renderJob.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Failed to cancel render job:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel render job',
    }, { status: 500 });
  }
}
