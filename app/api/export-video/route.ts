import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { scenes, backgroundMusic, totalDuration } = await request.json();
    
    if (!scenes || scenes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No scenes provided'
      }, { status: 400 });
    }

    // Validate scenes have images
    const scenesWithImages = scenes.filter((scene: any) => scene.imageUrl);
    if (scenesWithImages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No scenes have images uploaded'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Export prepared! ${scenes.length} scenes, ${totalDuration.toFixed(1)}s total.\n\nScenes ready:\n${scenesWithImages.map((s: any, i: number) => `• ${s.title || `Scene ${i+1}`} (${s.duration}s)`).join('\n')}\n\nTo enable MP4 export, complete Remotion integration.`,
      scenes: scenes.length,
      duration: totalDuration
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Export failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
