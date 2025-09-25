'use client';
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Monitor, 
  Smartphone, 
  Tablet,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoPreview } from '@/components/preview/VideoPreview';
import { PlaybackControls } from '@/components/preview/PlaybackControls';

export function Preview() {
  const { 
    ui, 
    playback, 
    currentProject, 
    setPreviewDevice, 
    toggleSafeAreas,
    setPlaying 
  } = useAppStore();

  const getDeviceFrameClasses = () => {
    const baseClasses = "relative flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden";
    
    switch (ui.previewDevice) {
      case 'mobile':
        return cn(baseClasses, "w-80 h-[640px] mx-auto");
      case 'tablet':
        return cn(baseClasses, "w-96 h-[640px] mx-auto");
      case 'desktop':
        return cn(baseClasses, "w-full max-w-4xl h-[640px] mx-auto");
      default:
        return cn(baseClasses, "w-80 h-[640px] mx-auto");
    }
  };

  return (
    <div className="relative h-full bg-gray-900 flex flex-col items-center justify-center p-8">
      
      {/* Top Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {/* Device selector */}
        <div className="flex items-center bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 border border-gray-700">
          <Button
            variant={ui.previewDevice === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('mobile')}
            className="h-8"
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            variant={ui.previewDevice === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('tablet')}
            className="h-8"
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={ui.previewDevice === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('desktop')}
            className="h-8"
          >
            <Monitor className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Safe area toggle */}
        <Button
          variant={ui.showSafeAreas ? 'default' : 'outline'}
          size="sm"
          onClick={toggleSafeAreas}
          className="h-8"
        >
          {ui.showSafeAreas ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      </div>

      {/* Device Frame */}
      <div className={getDeviceFrameClasses()}>
        <VideoPreview />
        
        {/* Safe Area Overlay */}
        {ui.showSafeAreas && (
          <div className="absolute inset-4 border-2 border-yellow-500/50 pointer-events-none rounded" />
        )}
      </div>

      {/* Playback Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <PlaybackControls />
      </div>
    </div>
  );
}
