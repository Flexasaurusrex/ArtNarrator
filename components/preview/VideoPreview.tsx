import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Maximize2, Settings } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const VideoPreview: React.FC = () => {
  const { 
    scenes, 
    playback, 
    currentProject,
    textStyles,
    setPlaying,
    setCurrentTime 
  } = useAppStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalDuration = scenes.reduce((total, scene) => total + scene.durationSec, 0);

  // Animation loop
  useEffect(() => {
    if (!playback.isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      setCurrentTime((prev: number) => {
        const newTime = prev + (1/30) * playback.playbackRate; // 30fps
        if (newTime >= totalDuration) {
          setPlaying(false);
          return totalDuration;
        }
        return newTime;
      });

      if (playback.isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playback.isPlaying, playback.playbackRate, totalDuration, setCurrentTime, setPlaying]);

  // Render current frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderFrame(ctx, canvas);
  }, [playback.currentTime, scenes, textStyles]);

  const getCurrentScene = () => {
    let cumulativeTime = 0;
    for (const scene of scenes) {
      if (playback.currentTime >= cumulativeTime && playback.currentTime < cumulativeTime + scene.durationSec) {
        const sceneProgress = (playback.currentTime - cumulativeTime) / scene.durationSec;
        return { scene, progress: sceneProgress, startTime: cumulativeTime };
      }
      cumulativeTime += scene.durationSec;
    }
    return null;
  };

  const renderFrame = async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const currentSceneData = getCurrentScene();
    if (!currentSceneData) {
      // Show "No content" message
      ctx.fillStyle = '#666666';
      ctx.font = '24px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No scenes to preview', width / 2, height / 2);
      return;
    }

    const { scene, progress } = currentSceneData;

    // Render background image if available
    if (scene.imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = scene.imageUrl!;
        });

        // Apply visual effects based on scene.fx
        ctx.save();
        
        switch (scene.fx) {
          case 'kenburns_slow':
          case 'kenburns_medium':
            const scale = 1 + (progress * 0.1); // Zoom from 100% to 110%
            const translateX = progress * 20;
            const translateY = progress * 15;
            ctx.translate(width/2, height/2);
            ctx.scale(scale, scale);
            ctx.translate(-width/2 - translateX, -height/2 - translateY);
            break;
            
          case 'pan_right':
            const panX = progress * 100;
            ctx.translate(-panX, 0);
            break;
            
          case 'pan_left':
            const panLeftX = -progress * 100;
            ctx.translate(-panLeftX, 0);
            break;
            
          case 'fade':
            ctx.globalAlpha = Math.min(progress * 2, 1); // Fade in first half
            break;
        }

        // Draw image to fit canvas
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          // Image is wider
          drawHeight = height;
          drawWidth = height * imgAspect;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        } else {
          // Image is taller
          drawWidth = width;
          drawHeight = width / imgAspect;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      } catch (error) {
        console.error('Failed to load image:', error);
        // Draw placeholder
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#666666';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Image failed to load', width / 2, height / 2);
      }
    } else {
      // Draw solid background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);
    }

    // Render text if available
    if (scene.title || scene.body) {
      const textStyle = textStyles.find(s => s.id === scene.textStyleId) || textStyles[0];
      if (textStyle) {
        renderText(ctx, canvas, scene, textStyle);
      }
    }

    // Draw scene progress indicator
    if (scenes.length > 1) {
      const progressBarHeight = 4;
      const progressBarY = height - 20;
      const progressBarWidth = width * 0.8;
      const progressBarX = (width - progressBarWidth) / 2;

      // Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

      // Progress
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
    }
  };

  const renderText = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    scene: typeof scenes[0], 
    textStyle: typeof textStyles[0]
  ) => {
    const width = canvas.width;
    const height = canvas.height;
    const padding = textStyle.padding;

    ctx.save();

    // Apply text effects
    if (textStyle.shadow > 0) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = textStyle.shadow * 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    // Render title
    if (scene.title) {
      ctx.fillStyle = textStyle.color;
      ctx.font = `${textStyle.weight} ${textStyle.titleSize}px ${textStyle.titleFont}`;
      ctx.textAlign = textStyle.align as CanvasTextAlign;

      let textX;
      switch (textStyle.align) {
        case 'center':
          textX = width / 2;
          break;
        case 'right':
          textX = width - padding;
          break;
        default:
          textX = padding;
      }

      const titleY = scene.safeArea === 'top' ? padding + textStyle.titleSize : height - padding - textStyle.bodySize - 20;
      
      ctx.fillText(scene.title, textX, titleY);
    }

    // Render body text
    if (scene.body) {
      ctx.fillStyle = textStyle.color;
      ctx.font = `${textStyle.weight} ${textStyle.bodySize}px ${textStyle.bodyFont}`;
      
      let textX;
      switch (textStyle.align) {
        case 'center':
          textX = width / 2;
          break;
        case 'right':
          textX = width - padding;
          break;
        default:
          textX = padding;
      }

      const bodyY = scene.safeArea === 'top' ? padding + textStyle.titleSize + 40 : height - padding;
      
      // Word wrap for body text
      const maxWidth = width - (padding * 2);
      const words = scene.body.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }

      // Draw each line
      lines.forEach((line, index) => {
        ctx.fillText(line, textX, bodyY + (index * textStyle.bodySize * 1.2));
      });
    }

    ctx.restore();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playback.isPlaying);
  };

  // Set canvas dimensions based on project aspect ratio
  const getCanvasDimensions = () => {
    if (!currentProject) return { width: 1920, height: 1080 };
    
    const [aspectWidth, aspectHeight] = currentProject.aspect.split('x').map(Number);
    const maxWidth = 800;
    const maxHeight = 450;
    
    const scale = Math.min(maxWidth / aspectWidth, maxHeight / aspectHeight);
    
    return {
      width: aspectWidth * scale,
      height: aspectHeight * scale,
      displayWidth: aspectWidth,
      displayHeight: aspectHeight,
    };
  };

  const dimensions = getCanvasDimensions();

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-100">
            {currentProject?.name || 'Untitled Project'}
          </h2>
          <div className="text-sm text-gray-400">
            {currentProject?.aspect} • {currentProject?.fps}fps
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="border-gray-600 text-gray-300"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="bg-black border-gray-700 shadow-2xl">
          <CardContent className="p-0">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={dimensions.displayWidth}
                height={dimensions.displayHeight}
                style={{
                  width: `${dimensions.width}px`,
                  height: `${dimensions.height}px`,
                  maxWidth: '100%',
                  height: 'auto',
                }}
                className="block rounded-lg"
              />
              
              {/* Play/Pause Overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handlePlayPause}
              >
                <Button
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-sm"
                >
                  {playback.isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Stats */}
      <div className="px-4 py-2 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>Scenes: {scenes.length}</span>
            <span>Duration: {totalDuration.toFixed(1)}s</span>
            {(() => {
              const currentSceneData = getCurrentScene();
              return currentSceneData ? (
                <span>
                  Scene: {scenes.indexOf(currentSceneData.scene) + 1} of {scenes.length}
                </span>
              ) : null;
            })()}
          </div>
          
          <div className="flex items-center gap-4">
            <span>
              {Math.round((playback.currentTime / totalDuration) * 100) || 0}%
            </span>
            <span>
              {playback.currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
