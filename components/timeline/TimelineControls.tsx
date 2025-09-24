'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { 
  Zap, 
  Clock, 
  Wand2,
  RotateCcw
} from 'lucide-react';

export function TimelineControls() {
  const { 
    scenes,
    distributeScenesDuration,
    applyEffectToAll,
    matchScenesToBeatGrid,
    musicTracks
  } = useAppStore();

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSec, 0);
  const musicDuration = musicTracks[0]?.outSec || 60;

  const handleDistributeEvenly = () => {
    distributeScenesDuration(musicDuration);
  };

  const handleMatchToBeatGrid = () => {
    const bpm = 120; // Default BPM, could be auto-detected from music
    matchScenesToBeatGrid(bpm);
  };

  const handleApplyKenBurns = () => {
    applyEffectToAll('kenburns_medium');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Zap className="w-4 h-4 mr-2" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDistributeEvenly}>
          <Clock className="w-4 h-4 mr-2" />
          Distribute evenly ({formatTime(musicDuration)})
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleMatchToBeatGrid}>
          <Wand2 className="w-4 h-4 mr-2" />
          Match to beat grid (120 BPM)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleApplyKenBurns}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Ken Burns on all scenes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
