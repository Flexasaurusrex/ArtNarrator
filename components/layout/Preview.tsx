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

  const deviceFrameClass = cn(
    "preview-device-frame",
    ui.previewDevice
  );

  return (
    <div className="preview-container">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        {/* Device selector */}
        <div className="flex items-center bg-panel/90 backdrop-blur-sm rounded-lg p-1">
          <Button
            variant={ui.previewDevice === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('mobile')}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            variant={ui.previewDevice === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('tablet')}
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={ui.previewDevice === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewDevice('desktop')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
        </div>

        {/* Safe area toggle */}
        <Button
          variant={ui.showSafeAreas ? 'default' : 'outline'}
          size="sm"
          onClick={toggleSafeAreas}
        >
          {ui.showSafeAreas ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      </div>

      {/* Device Frame */}
      <div className={deviceFrameClass}>
        <VideoPreview />
        
        {/* Safe Area Overlay */}
        {ui.showSafeAreas && <div className="preview-safe-area" />}
      </div>

      {/* Playback Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <PlaybackControls />
      </div>
    </div>
  );
}
