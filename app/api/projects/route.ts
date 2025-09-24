import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a simple mock project
    const project = {
      id: `project-${Date.now()}`,
      title: body.title || 'My First Video Essay',
      aspect: body.aspect || '1080x1920',
      fps: body.fps || 30,
      bgColor: body.bgColor || '#000000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create project',
    }, { status: 400 });
  }
}
