'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppStore } from '@/lib/store';
import { SceneCard } from './SceneCard';

export function TimelineTrack() {
  const { scenes, reorderScenes, timeline } = useAppStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = scenes.findIndex((scene) => scene.id === active.id);
      const newIndex = scenes.findIndex((scene) => scene.id === over?.id);

      reorderScenes(oldIndex, newIndex);
    }
  }

  if (scenes.length === 0) {
    return (
      <div className="timeline-track">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <p className="text-sm">No scenes yet</p>
            <p className="text-xs mt-1">Add your first scene to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-track">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={scenes.map(s => s.id!)} strategy={horizontalListSortingStrategy}>
          <div className="flex items-center space-x-2 px-4">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isSelected={timeline.selectedSceneIds.includes(scene.id!)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
