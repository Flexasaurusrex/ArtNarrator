import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

export const maxDuration = 300; // 5 minutes timeout

export async function POST(request: NextRequest) {
  try {
    const { scenes, backgroundMusic, totalDuration } = await request.json();
    
    console.log('Starting video export:', { 
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

    // Calculate video properties
    const fps = 30;
    const durationInFrames = Math.ceil(totalDuration * fps);
    const width = 1080;
    const height = 1920; // Vertical format

    console.log('Video specs:', { width, height, fps, durationInFrames });

    // Create output directory
    const outputDir = path.join(process.cwd(), 'public', 'exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `video-essay-${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputFileName);

    try {
      // Bundle the Remotion project
      console.log('Bundling Remotion project...');
      const bundleLocation = await bundle({
        entryPoint: path.join(process.cwd(), 'remotion', 'index.ts'),
        webpackOverride: (config) => {
          return {
            ...config,
            resolve: {
              ...config.resolve,
              alias: {
                ...config.resolve?.alias,
                '@': path.resolve(process.cwd()),
              },
            },
          };
        },
      });

      console.log('Bundle created at:', bundleLocation);

      // Get composition details
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'ArtNarratorVideo',
        inputProps: {
          scenes: scenes,
          backgroundMusic: backgroundMusic || null,
        },
      });

      console.log('Composition selected:', composition.id);

      // Render the video
      console.log('Starting video render...');
      await renderMedia({
        composition: {
          ...composition,
          durationInFrames,
          fps,
          width,
          height,
        },
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps: {
          scenes: scenes,
          backgroundMusic: backgroundMusic || null,
        },
        imageFormat: 'jpeg',
        pixelFormat: 'yuv420p',
        envVariables: {},
        quality: 80,
        chromiumOptions: {
          disableWebSecurity: false,
          ignoreCertificateErrors: false,
        },
        timeoutInMilliseconds: 240000, // 4 minutes
        concurrency: 1,
        muted: false,
        enforceAudioTrack: false,
      });

      console.log('Video render completed:', outputPath);

      // Read the video file and return it
      if (fs.existsSync(outputPath)) {
        const videoBuffer = fs.readFileSync(outputPath);
        const videoBase64 = videoBuffer.toString('base64');

        // Clean up the file after reading
        fs.unlinkSync(outputPath);

        return new NextResponse(videoBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Disposition': `attachment; filename="${outputFileName}"`,
            'Content-Length': videoBuffer.length.toString(),
          },
        });
      } else {
        throw new Error('Video file was not created');
      }

    } catch (renderError) {
      console.error('Render error:', renderError);
      return NextResponse.json({
        success: false,
        error: 'Video rendering failed',
        details: renderError instanceof Error ? renderError.message : 'Unknown render error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({
      success: false,
      error: 'Export failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
