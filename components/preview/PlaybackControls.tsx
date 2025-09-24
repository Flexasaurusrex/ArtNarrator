'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAppStore, useTotalDuration } from '@/lib/store';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  RotateCcw,
  Volume2,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlaybackControls() {
  const { 
    playback, 
    setPlaying, 
    setCurrentTime,
    setPlaybackRate,
    musicTracks,
  } = useAppStore();
  
  const totalDuration = useTotalDuration();
  
  const handlePlayPause = () => {
    setPlaying(!playback.isPlaying);
  };

  const handleSeek = (values: number[]) => {
    setCurrentTime(values[0]);
  };

  const handleSkipBackward = () => {
    setCurrentTime(Math.max(0, playback.currentTime - 10));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(totalDuration, playback.currentTime + 10));
  };

  const handleReset = () => {
    setCurrentTime(0);
    setPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playbackRates = [0.5, 1, 1.5, 2];

  return (
    <div className="bg-panel/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border/50 min-w-96">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[playback.currentTime]}
            onValueChange={handleSeek}
            max={totalDuration || 100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(playback.currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipBackward}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            onClick={handlePlayPause}
            size="icon"
            className="h-12 w-12"
          >
            {playback.isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipForward}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          {/* Playback Speed */}
          <div className="flex items-center space-x-1">
            {playbackRates.map(rate => (
              <Button
                key={rate}
                variant={playback.playbackRate === rate ? "default" : "ghost"}
                size="sm"
                onClick={() => setPlaybackRate(rate)}
                className="h-8 px-2 text-xs"
              >
                {rate}x
              </Button>
            ))}
          </div>
        </div>

        {/* Volume Control (if music exists) */}
        {musicTracks.length > 0 && (
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              defaultValue={[musicTracks[0]?.volume * 100 || 50]}
              max={100}
              step={1}
              className="flex-1"
              onValueChange={(values) => {
                // TODO: Update music volume
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
