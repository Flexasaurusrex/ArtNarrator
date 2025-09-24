'use client';

import React, { useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioUploader } from '@/components/music/AudioUploader';
import { WaveformPlayer } from '@/components/music/WaveformPlayer';
import { Music, Volume2, Scissors, Zap, Trash2 } from 'lucide-react';

export function MusicInspector() {
  const { 
    musicTracks, 
    addMusicTrack, 
    updateMusicTrack, 
    deleteMusicTrack,
    currentProject 
  } = useAppStore();

  const track = musicTracks[0]; // Single track for MVP

  const handleUpdateTrack = (field: string, value: any) => {
    if (track) {
      updateMusicTrack(track.id!, { [field]: value });
    }
  };

  const handleAddTrack = (url: string, duration: number) => {
    if (currentProject) {
      addMusicTrack({
        projectId: currentProject.id!,
        url,
        inSec: 0,
        outSec: duration,
        volume: 0.5,
        duckUnderText: true,
      });
    }
  };

  const handleRemoveTrack = () => {
    if (track) {
      deleteMusicTrack(track.id!);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload */}
      {!track && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Music className="w-4 h-4 mr-2" />
              Add Music
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AudioUploader onAudioSelected={handleAddTrack} />
          </CardContent>
        </Card>
      )}

      {/* Track Controls */}
      {track && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Background Music</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleRemoveTrack}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Waveform */}
              <WaveformPlayer
                url={track.url}
                inTime={track.inSec}
                outTime={track.outSec || 60}
                volume={track.volume}
                onInTimeChange={(time) => handleUpdateTrack('inSec', time)}
                onOutTimeChange={(time) => handleUpdateTrack('outSec', time)}
              />

              {/* Volume */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Volume
                </Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[track.volume]}
                    onValueChange={([value]) => handleUpdateTrack('volume', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{Math.round(track.volume * 100)}%</span>
                </div>
              </div>

              {/* Duck under text */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-duck during text
                </Label>
                <Switch
                  checked={track.duckUnderText}
                  onCheckedChange={(checked) => handleUpdateTrack('duckUnderText', checked)}
                />
              </div>

              {track.duckUnderText && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  Music will automatically reduce to 25% volume during the first 1.2s of each scene and while text animates in.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Built-in Loops */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Royalty-Free Loops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { name: 'Ambient Cinematic', url: '/audio/ambient-cinematic.mp3' },
                  { name: 'Documentary Theme', url: '/audio/documentary-theme.mp3' },
                  { name: 'Minimal Piano', url: '/audio/minimal-piano.mp3' },
                  { name: 'Modern Underscore', url: '/audio/modern-underscore.mp3' },
                ].map((loop) => (
                  <Button
                    key={loop.name}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleAddTrack(loop.url, 60)}
                  >
                    <Music className="w-4 h-4 mr-2" />
                    {loop.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
