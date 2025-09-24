import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Play, Pause, Volume2, Trash2, Music, Settings } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { MusicTrack } from '@/lib/schemas';

export const MusicInspector: React.FC = () => {
  const { musicTracks, addMusicTrack, updateMusicTrack, deleteMusicTrack } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Maximum size is 50MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Create audio element to get duration
      const audio = new Audio(data.data.url);
      await new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', resolve);
        audio.addEventListener('error', reject);
      });

      const newTrack: Omit<MusicTrack, 'id'> = {
        projectId: '',
        url: data.data.url,
        inSec: 0,
        outSec: audio.duration,
        volume: 0.5,
        duckUnderText: false,
      };

      addMusicTrack(newTrack);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload audio file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateTrack = (trackId: string, field: keyof MusicTrack, value: any) => {
    updateMusicTrack(trackId, { [field]: value });
  };

  const handlePlayPause = (track: MusicTrack) => {
    if (!track.id) return;

    const audio = audioRefs.current[track.id];
    
    if (!audio) {
      // Create new audio element
      const newAudio = new Audio(track.url);
      newAudio.volume = track.volume;
      newAudio.currentTime = track.inSec;
      audioRefs.current[track.id] = newAudio;
      
      newAudio.addEventListener('ended', () => {
        setPlayingTrack(null);
      });
      
      newAudio.play();
      setPlayingTrack(track.id);
      return;
    }

    if (playingTrack === track.id) {
      audio.pause();
      setPlayingTrack(null);
    } else {
      // Stop other playing tracks
      Object.values(audioRefs.current).forEach(a => a.pause());
      
      audio.currentTime = track.inSec;
      audio.volume = track.volume;
      audio.play();
      setPlayingTrack(track.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDuration = (track: MusicTrack) => {
    const duration = (track.outSec || 0) - track.inSec;
    return Math.max(0, duration);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <Music className="h-5 w-5" />
            Background Music
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Audio File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-400 text-center">
              Supported formats: MP3, WAV, OGG, AAC (Max 50MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Music Tracks */}
      {musicTracks.length > 0 && (
        <div className="space-y-4">
          {musicTracks.map((track) => (
            <Card key={track.id} className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Track Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlayPause(track)}
                        className="border-gray-600 text-gray-300"
                      >
                        {playingTrack === track.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <div className="text-sm font-medium text-gray-200">
                          Audio Track
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTime(getDuration(track))} duration
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => track.id && deleteMusicTrack(track.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Volume Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-200 flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Volume
                      </Label>
                      <span className="text-xs text-gray-400">
                        {Math.round(track.volume * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={track.volume}
                        onChange={(e) => track.id && handleUpdateTrack(track.id, 'volume', parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  {/* Timing Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200">Start Time</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={track.inSec}
                          onChange={(e) => track.id && handleUpdateTrack(track.id, 'inSec', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                          className="bg-gray-700 border-gray-600 text-gray-100"
                        />
                        <span className="text-xs text-gray-400">sec</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-200">End Time</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={track.outSec || 0}
                          onChange={(e) => track.id && handleUpdateTrack(track.id, 'outSec', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                          className="bg-gray-700 border-gray-600 text-gray-100"
                        />
                        <span className="text-xs text-gray-400">sec</span>
                      </div>
                    </div>
                  </div>

                  {/* Audio Ducking */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-200">Auto-duck under text</Label>
                      <p className="text-xs text-gray-400">
                        Automatically lower volume during text scenes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={track.duckUnderText}
                        onChange={(e) => track.id && handleUpdateTrack(track.id, 'duckUnderText', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Advanced Settings */}
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 hover:text-gray-100">
                      <Settings className="h-4 w-4" />
                      Advanced Settings
                    </summary>
                    <div className="mt-4 p-4 bg-gray-700/50 rounded-md space-y-3">
                      <div className="text-xs text-gray-400">
                        Fine-tune audio behavior and mixing options
                      </div>
                      
                      {/* Fade Controls */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200 text-xs">Fade In (sec)</Label>
                          <Input
                            type="number"
                            defaultValue="0.5"
                            min="0"
                            max="5"
                            step="0.1"
                            className="bg-gray-600 border-gray-500 text-gray-100 text-xs h-8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200 text-xs">Fade Out (sec)</Label>
                          <Input
                            type="number"
                            defaultValue="0.5"
                            min="0"
                            max="5"
                            step="0.1"
                            className="bg-gray-600 border-gray-500 text-gray-100 text-xs h-8"
                          />
                        </div>
                      </div>

                      {/* Loop Option */}
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-200 text-xs">Loop track</Label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={false}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {musicTracks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No background music added</p>
          <p className="text-sm">Upload an audio file to get started</p>
        </div>
      )}

      {/* CSS for custom slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};
