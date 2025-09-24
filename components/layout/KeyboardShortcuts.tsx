'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useHotkeys } from 'react-hotkeys-hook';

export function KeyboardShortcuts() {
  const { 
    playback,
    timeline,
    scenes,
    setPlaying,
    selectScene,
    duplicateScene,
    deleteScene,
    setCurrentTime,
  } = useAppStore();

  // Playback controls
  useHotkeys('space', () => setPlaying(!playback.isPlaying));
  
  // Scene selection
  useHotkeys('arrowleft', () => {
    if (timeline.selectedSceneIds.length === 1) {
      const currentIndex = scenes.findIndex(s => s.id === timeline.selectedSceneIds[0]);
      if (currentIndex > 0) {
        selectScene(scenes[currentIndex - 1].id!);
      }
    }
  });

  useHotkeys('arrowright', () => {
    if (timeline.selectedSceneIds.length === 1) {
      const currentIndex = scenes.findIndex(s => s.id === timeline.selectedSceneIds[0]);
      if (currentIndex < scenes.length - 1) {
        selectScene(scenes[currentIndex + 1].id!);
      }
    }
  });

  // Scene operations
  useHotkeys('cmd+d', () => {
    if (timeline.selectedSceneIds.length === 1) {
      duplicateScene(timeline.selectedSceneIds[0]);
    }
  });

  useHotkeys('backspace', () => {
    if (timeline.selectedSceneIds.length > 0) {
      timeline.selectedSceneIds.forEach(id => deleteScene(id));
    }
  });

  // Timeline navigation
  useHotkeys('home', () => setCurrentTime(0));
  useHotkeys('end', () => {
    const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSec, 0);
    setCurrentTime(totalDuration);
  });

  return null;
}
