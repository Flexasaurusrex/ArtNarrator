'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { TimelineRuler } from '@/components/timeline/TimelineRuler';
import { TimelineTrack } from '@/components/timeline/TimelineTrack';
import { TimelineControls } from '@/components/timeline/TimelineControls';
import { 
  Zap, 
  Grid3X3, 
  Magnet,
  MoreHorizontal 
} from 'lucide-react';

export function Timeline() {
  const { 
    scenes, 
    timeline, 
    toggleSnap, 
    ui,
    toggleGrid 
  } = useAppStore();

  return (
    <div className="timeline-container">
      {/* Timeline Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Timeline</h3>
          <span className="text-xs text-muted-foreground">
            {scenes.length} scene{scenes.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant={timeline.snapEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={toggleSnap}
          >
            <Magnet className="w-4 h-4" />
          </Button>
          
          <Button
            variant={ui.showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={toggleGrid}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>

          <TimelineControls />

          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Grid Background */}
      {ui.showGrid && <div className="timeline-grid" />}

      {/* Timeline Ruler */}
      <TimelineRuler />

      {/* Timeline Track */}
      <div className="flex-1 overflow-hidden">
        <TimelineTrack />
      </div>
    </div>
  );
}
