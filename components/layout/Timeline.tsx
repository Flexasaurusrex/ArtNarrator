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
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Timeline Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-200">Timeline</h3>
          <span className="text-xs text-gray-400">
            {scenes.length} scene{scenes.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant={timeline.snapEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={toggleSnap}
            className="h-8"
          >
            <Magnet className="w-4 h-4" />
          </Button>
          
          <Button
            variant={ui.showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={toggleGrid}
            className="h-8"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          
          <TimelineControls />
          
          <Button variant="ghost" size="sm" className="h-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Grid Background */}
      {ui.showGrid && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-600 to-transparent bg-repeat-x" 
               style={{ backgroundSize: '20px 1px' }} />
        </div>
      )}

      {/* Timeline Ruler */}
      <TimelineRuler />

      {/* Timeline Track */}
      <div className="flex-1 overflow-hidden bg-gray-900">
        <TimelineTrack />
      </div>
    </div>
  );
}
