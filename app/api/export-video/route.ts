// app/api/export-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { scenes, backgroundMusic, totalDuration } = await request.json();
    
    console.log('Export request:', { 
      sceneCount: scenes?.length, 
      hasMusic: !!backgroundMusic,
      totalDuration 
    });

    if (!scenes || scenes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No scenes provided'
      }, { status: 400 });
    }

    // For now, return a mock response since full Remotion setup requires more configuration
    // Uncomment and modify the code below when you're ready to set up full Remotion rendering
    
    /*
    // Calculate total duration in frames (30 fps)
    const fps = 30;
    const durationInFrames = Math.ceil(totalDuration * fps);
    
    // Bundle the Remotion composition
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'index.ts'),
      webpackOverride: (config) => config,
    });
    
    // Get composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'VideoEssayComposition',
      inputProps: {
        scenes: scenes,
        backgroundMusic: backgroundMusic,
      },
    });
    
    // Output file path
    const outputPath = path.join(process.cwd(), 'public', 'renders', `video-${Date.now()}.mp4`);
    
    // Ensure renders directory exists
    const rendersDir = path.dirname(outputPath);
    if (!fs.existsSync(rendersDir)) {
      fs.mkdirSync(rendersDir, { recursive: true });
    }
    
    // Render the video
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        scenes: scenes,
        backgroundMusic: backgroundMusic,
      },
    });
    
    // Return the video file
    const videoFile = fs.readFileSync(outputPath);
    
    return new NextResponse(videoFile, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="video-essay.mp4"',
      },
    });
    */
    
    // Mock response for now
    return NextResponse.json({
      success: true,
      message: `Video export ready! ${scenes.length} scenes, ${totalDuration}s total duration. 
                To complete the export functionality:
                1. Set up Remotion project structure
                2. Create remotion/index.ts entry point  
                3. Uncomment the rendering code above
                4. Configure webpack and dependencies`,
      videoUrl: null,
      scenes: scenes.length,
      duration: totalDuration
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
