'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useAppStore, useCurrentScene } from '@/lib/store';
import { cn } from '@/lib/utils';
import { TextOverlay } from './TextOverlay';

export function VideoPreview() {
  const {
    scenes,
    playback,
    currentProject,
    ui,
    setDuration,
    setCurrentTime,
    setPlaying,
  } = useAppStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const currentScene = useCurrentScene();
  
  // Calculate total duration
  const totalDuration = useMemo(() => 
    scenes.reduce((sum, scene) => sum + scene.durationSec, 0)
  , [scenes]);
  
  // Update store duration when calculated
  useEffect(() => {
    if (totalDuration !== playback.duration) {
      setDuration(totalDuration);
    }
  }, [totalDuration, playback.duration, setDuration]);

  // Animation loop for playback
  useEffect(() => {
    if (!playback.isPlaying) return;

    const animate = () => {
      setCurrentTime(prev => {
        const newTime = prev + (1/30) * playback.playbackRate; // 30fps
        if (newTime >= totalDuration) {
          setPlaying(false);
          return totalDuration;
        }
        return newTime;
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playback.isPlaying, playback.playbackRate, totalDuration, setCurrentTime, setPlaying]);

  // Render current frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on project aspect ratio
    const aspectRatio = getAspectRatioFromString(currentProject?.aspect || '1080x1920');
    const containerWidth = canvas.offsetWidth;
    const containerHeight = canvas.offsetHeight;
    
    let canvasWidth, canvasHeight;
    
    if (aspectRatio > containerWidth / containerHeight) {
      canvasWidth = containerWidth;
      canvasHeight = containerWidth / aspectRatio;
    } else {
      canvasWidth = containerHeight * aspectRatio;
      canvasHeight = containerHeight;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.fillStyle = currentProject?.bgColor || '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render scene image
    if (currentScene.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        renderImageWithEffect(ctx, img, currentScene, canvasWidth, canvasHeight);
      };
      img.src = currentScene.imageUrl;
    }
  }, [currentScene, currentProject, playback.currentTime]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    // Calculate time from click position (simple timeline scrubbing)
    if (y > 0.9) { // Bottom 10% acts as scrub bar
      const newTime = x * totalDuration;
      setCurrentTime(Math.max(0, Math.min(newTime, totalDuration)));
    }
  };

  if (scenes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-lg mb-4 mx-auto" />
          <p className="text-sm">No scenes to preview</p>
          <p className="text-xs mt-1">Add your first scene to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain bg-black cursor-pointer"
        onClick={handleCanvasClick}
      />
      
      {/* Text overlay */}
      {currentScene && (
        <TextOverlay scene={currentScene} />
      )}
      
      {/* Progress bar overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-full h-1">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-100"
            style={{ width: `${totalDuration > 0 ? (playback.currentTime / totalDuration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Scene indicator */}
      {currentScene && (
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
          Scene {currentScene.order + 1} of {scenes.length}
        </div>
      )}
    </div>
  );
}

// Utility functions
function getAspectRatioFromString(aspectString: string): number {
  const [width, height] = aspectString.split('x').map(Number);
  return width / height;
}

function renderImageWithEffect(
  ctx: CanvasRenderingContext2D, 
  img: HTMLImageElement, 
  scene: any, 
  canvasWidth: number, 
  canvasHeight: number
) {
  ctx.save();
  
  // Calculate image dimensions to fill canvas while maintaining aspect ratio
  const imgAspect = img.width / img.height;
  const canvasAspect = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, offsetX, offsetY;
  
  if (imgAspect > canvasAspect) {
    // Image is wider than canvas
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imgAspect;
    offsetX = -(drawWidth - canvasWidth) / 2;
    offsetY = 0;
  } else {
    // Image is taller than canvas
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imgAspect;
    offsetX = 0;
    offsetY = -(drawHeight - canvasHeight) / 2;
  }

  // Apply effect based on scene.fx
  switch (scene.fx) {
    case 'kenburns_slow':
    case 'kenburns_medium':
      const scale = scene.fx === 'kenburns_slow' ? 1.03 : 1.06;
      const scaledWidth = drawWidth * scale;
      const scaledHeight = drawHeight * scale;
      const scaleOffsetX = -(scaledWidth - drawWidth) / 2;
      const scaleOffsetY = -(scaledHeight - drawHeight) / 2;
      
      ctx.drawImage(
        img, 
        offsetX + scaleOffsetX, 
        offsetY + scaleOffsetY, 
        scaledWidth, 
        scaledHeight
      );
      break;
      
    case 'pan_right':
      const panOffset = -20; // Simple pan effect
      ctx.drawImage(img, offsetX + panOffset, offsetY, drawWidth, drawHeight);
      break;
      
    case 'pan_left':
      const leftPanOffset = 20;
      ctx.drawImage(img, offsetX + leftPanOffset, offsetY, drawWidth, drawHeight);
      break;
      
    case 'fade':
      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
      break;
      
    default:
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }
  
  ctx.restore();
}
