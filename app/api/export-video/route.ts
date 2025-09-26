import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes timeout

interface SceneTransition {
  scene: number;
  title: string;
  duration: number;
  transition: string;
  transitionDuration: number;
  transitionIntensity: number;
  hasImage: boolean;
  hasText: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { scenes, backgroundMusic, totalDuration } = await request.json();
    
    console.log('Export request received:', { 
      sceneCount: scenes?.length, 
      totalDuration: totalDuration?.toFixed(1) + 's'
    });

    // Validation
    if (!scenes || scenes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No scenes provided'
      }, { status: 400 });
    }

    const scenesWithImages = scenes.filter((scene: any) => scene.imageUrl);
    if (scenesWithImages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No scenes have images uploaded'
      }, { status: 400 });
    }

    // Create transitions array with proper typing
    const transitions: SceneTransition[] = scenes.map((scene: any, index: number) => ({
      scene: index + 1,
      title: scene.title || `Scene ${index + 1}`,
      duration: scene.duration,
      transition: scene.transition,
      transitionDuration: scene.transitionDuration,
      transitionIntensity: scene.transitionIntensity,
      hasImage: !!scene.imageUrl,
      hasText: !!(scene.title || scene.description)
    }));

    const exportSummary = {
      totalScenes: scenes.length,
      scenesWithImages: scenesWithImages.length,
      totalDuration: totalDuration,
      exportFormat: 'MP4 (1080x1920)',
      fps: 30,
      transitions: transitions
    };

    console.log('Export summary prepared:', exportSummary);

    // Create scene list for display
    const readyScenes = transitions
      .filter((transition: SceneTransition) => transition.hasImage)
      .map((transition: SceneTransition) => `Scene: ${transition.title} - ${transition.duration}s - ${transition.transition}`)
      .join('\n');

    const message = `Export Analysis Complete!\n\n` +
      `Video Specs:\n` +
      `Scenes: ${scenes.length} total, ${scenesWithImages.length} with images\n` +
      `Duration: ${totalDuration.toFixed(1)} seconds\n` +
      `Format: 1080x1920 vertical MP4\n` +
      `Frame Rate: 30fps with transitions\n\n` +
      `Ready Scenes:\n${readyScenes}\n\n` +
      `Status: Ready for video generation`;

    return NextResponse.json({
      success: true,
      message: message,
      exportSummary,
      readyForRemotion: true,
      videoSpecs: {
        width: 1080,
        height: 1920,
        fps: 30,
        format: 'MP4',
        codec: 'H.264'
      }
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({
      success: false,
      error: 'Export failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
