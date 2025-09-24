'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function TimelineRuler() {
  const { scenes, playback } = useAppStore();
  
  // Calculate total duration and generate tick marks
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSec, 0);
  const maxDuration = Math.max(totalDuration, 60); // Minimum 60 seconds for ruler
  
  const ticks = [];
  const majorTickInterval = 10; // Major tick every 10 seconds
  const minorTickInterval = 1;  // Minor tick every 1 second
  
  for (let time = 0; time <= maxDuration; time += minorTickInterval) {
    const isMajor = time % majorTickInterval === 0;
    const position = (time / maxDuration) * 100;
    
    ticks.push(
      <div
        key={time}
        className={cn(
          "absolute top-0 border-l border-border",
          isMajor ? "h-8" : "h-4"
        )}
        style={{ left: `${position}%` }}
      >
        {isMajor && (
          <span className="absolute top-8 -translate-x-1/2 text-xs text-muted-foreground">
            {formatTime(time)}
          </span>
        )}
      </div>
    );
  }

  // Current time indicator
  const currentTimePosition = totalDuration > 0 ? (playback.currentTime / totalDuration) * 100 : 0;

  return (
    <div className="timeline-ruler relative">
      <div className="relative h-full">
        {ticks}
        
        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 pointer-events-none"
          style={{ left: `${currentTimePosition}%` }}
        >
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full" />
        </div>
      </div>
      
      {/* Current time display */}
      <div className="absolute right-2 top-1 text-xs text-muted-foreground">
        {formatTime(playback.currentTime)} / {formatTime(totalDuration)}
      </div>
    </div>
  );
}

// Helper function to format time
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
