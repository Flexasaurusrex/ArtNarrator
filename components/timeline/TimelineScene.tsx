'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '@/lib/store';
import { Scene } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { Image, Zap } from 'lucide-react';

interface TimelineSceneProps {
  scene: Scene;
  startTime: number;
  widthPercent: number;
  isSelected: boolean;
}

export function TimelineScene({ scene, startTime, widthPercent, isSelected }: TimelineSceneProps) {
  const { selectScene, updateScene } = useAppStore();
  const [isResizing, setIsResizing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${Math.max(widthPercent, 5)}%`, // Minimum 5% width
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isResizing) {
      selectScene(scene.id!);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  const getFxIcon = () => {
    switch (scene.fx) {
      case 'kenburns_slow':
      case 'kenburns_medium':
        return <Zap className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "timeline-scene group relative",
        isSelected && "selected",
        isDragging && "dragging"
      )}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {/* Scene Content */}
      <div className="flex items-center justify-between h-full px-2">
        <div className="flex items-center space-x-1 min-w-0">
          {scene.imageUrl ? (
            <div className="w-4 h-4 rounded bg-muted flex items-center justify-center">
              <Image className="w-3 h-3" />
            </div>
          ) : (
            <div className="w-4 h-4 rounded bg-muted-foreground/20" />
          )}
          
          <span className="text-xs font-medium truncate">
            {scene.title || 'Untitled'}
          </span>
        </div>

        {/* Effect indicator */}
        {scene.fx !== 'none' && (
          <div className="scene-effect-badge">
            {getFxIcon()}
          </div>
        )}
      </div>

      {/* Duration display */}
      <div className="scene-duration">
        {scene.durationSec.toFixed(1)}s
      </div>

      {/* Resize handle */}
      <div
        className="timeline-scene-handle"
        onMouseDown={handleResizeStart}
        onMouseUp={handleResizeEnd}
      />

      {/* Validation indicators */}
      {!scene.imageUrl && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
      )}
    </div>
  );
}
