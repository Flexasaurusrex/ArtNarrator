'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scene } from '@/lib/schemas';
import { 
  GripVertical, 
  Image as ImageIcon, 
  AlertTriangle,
  Play,
  Copy,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SceneCardProps {
  scene: Scene;
  isSelected: boolean;
}

export function SceneCard({ scene, isSelected }: SceneCardProps) {
  const { 
    selectScene, 
    updateScene, 
    duplicateScene, 
    deleteScene, 
    setCurrentTime,
    timeline
  } = useAppStore();
  
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [durationValue, setDurationValue] = useState(scene.durationSec.toString());

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
  };

  // Calculate scene width based on duration (minimum 80px, scale factor 20px per second)
  const sceneWidth = Math.max(80, scene.durationSec * 20);

  const hasImage = !!scene.imageUrl;
  const hasText = !!(scene.title || scene.body);
  const hasWarning = !hasImage || (!scene.title && !scene.body);

  const handleClick = () => {
    selectScene(scene.id!);
  };

  const handleDurationSave = () => {
    const newDuration = parseFloat(durationValue);
    if (!isNaN(newDuration) && newDuration > 0 && newDuration <= 30) {
      updateScene(scene.id!, { id: scene.id!, durationSec: newDuration });
    } else {
      setDurationValue(scene.durationSec.toString());
    }
    setIsEditingDuration(false);
  };

  const handleDurationKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDurationSave();
    } else if (e.key === 'Escape') {
      setDurationValue(scene.durationSec.toString());
      setIsEditingDuration(false);
    }
  };

  const handlePlayFromHere = () => {
    // Calculate cumulative time up to this scene
    const scenes = useAppStore.getState().scenes;
    const sceneIndex = scenes.findIndex(s => s.id === scene.id);
    const startTime = scenes.slice(0, sceneIndex).reduce((sum, s) => sum + s.durationSec, 0);
    setCurrentTime(startTime);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, width: `${sceneWidth}px` }}
      className={cn(
        "timeline-scene group",
        isSelected && "selected",
        isDragging && "dragging"
      )}
      onClick={handleClick}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        className="absolute left-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...listeners}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Scene Content */}
      <div className="flex items-center justify-center h-full px-2 text-center">
        <div className="flex flex-col items-center min-w-0">
          {/* Image indicator */}
          {hasImage ? (
            <img 
              src={scene.imageUrl} 
              alt={scene.title || 'Scene'} 
              className="w-8 h-6 object-cover rounded mb-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <ImageIcon className="w-4 h-4 text-muted-foreground mb-1" />
          )}
          
          {/* Scene title/order */}
          <span className="text-xs font-medium truncate max-w-full">
            {scene.title || `Scene ${scene.order + 1}`}
          </span>

          {/* Warning indicator */}
          {hasWarning && (
            <AlertTriangle className="w-3 h-3 text-yellow-500 mt-1" />
          )}
        </div>
      </div>

      {/* Duration Display/Editor */}
      <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 rounded-tl">
        {isEditingDuration ? (
          <Input
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
            onBlur={handleDurationSave}
            onKeyDown={handleDurationKeyPress}
            className="w-12 h-5 text-xs p-0 text-center bg-transparent border-none text-white"
            autoFocus
          />
        ) : (
          <span
            className="cursor-pointer hover:bg-black/50 px-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingDuration(true);
            }}
          >
            {scene.durationSec}s
          </span>
        )}
      </div>

      {/* Effect Badge */}
      {scene.fx !== 'none' && (
        <div className="absolute bottom-0 left-0 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-tr">
          {scene.fx.replace('_', ' ')}
        </div>
      )}

      {/* Context Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handlePlayFromHere}>
            <Play className="w-4 h-4 mr-2" />
            Play from here
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => duplicateScene(scene.id!)}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => deleteScene(scene.id!)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Duration Handle */}
      <div className="timeline-scene-handle" />
    </div>
  );
}
