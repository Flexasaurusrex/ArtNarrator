import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2, RotateCcw, Scissors, Download } from 'lucide-react';

interface WaveformPlayerProps {
  audioUrl: string;
  duration: number;
  onInTimeChange: (time: number) => void;
  onOutTimeChange: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  inTime: number;
  outTime: number;
  volume: number;
  className?: string;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  duration,
  onInTimeChange,
  onOutTimeChange,
  onVolumeChange,
  inTime,
  outTime,
  volume,
  className = '',
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Initialize audio and load waveform data
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedData = () => {
      setIsLoaded(true);
      generateWaveform();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Auto-pause at out time
      if (outTime > 0 && audio.currentTime >= outTime) {
        audio.pause();
        setIsPlaying(false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(inTime);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.volume = volume;

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audioUrl, inTime, outTime, volume]);

  // Generate mock waveform data
  const generateWaveform = useCallback(() => {
    const points = 200;
    const data = Array.from({ length: points }, () => Math.random() * 0.8 + 0.1);
    setWaveformData(data);
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = Math.max(inTime, currentTime);
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * duration;
    
    if (audio && isLoaded) {
      audio.currentTime = Math.max(inTime, Math.min(seekTime, outTime || duration));
      setCurrentTime(audio.currentTime);
    }
  };

  const handleReset = () => {
    const audio = audioRef.current;
    if (audio && isLoaded) {
      audio.currentTime = inTime;
      setCurrentTime(inTime);
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  };

  const getInTimePercentage = () => {
    if (!duration) return 0;
    return (inTime / duration) * 100;
  };

  const getOutTimePercentage = () => {
    if (!duration || !outTime) return 100;
    return (outTime / duration) * 100;
  };

  const getSelectionWidth = () => {
    const inPercent = getInTimePercentage();
    const outPercent = getOutTimePercentage();
    return outPercent - inPercent;
  };

  const handleTrimToSelection = () => {
    // This would trigger a trim operation in the parent component
    console.log('Trim to selection:', { inTime, outTime });
  };

  const handleExportSelection = () => {
    // This would trigger an export operation in the parent component
    console.log('Export selection:', { inTime, outTime });
  };

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardContent className="p-4 space-y-4">
        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePlayPause}
              disabled={!isLoaded}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={!isLoaded}
              className="border-gray-600 text-gray-300"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="text-sm text-gray-300 font-mono min-w-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTrimToSelection}
              disabled={!isLoaded}
              className="border-gray-600 text-gray-300"
            >
              <Scissors className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportSelection}
              disabled={!isLoaded}
              className="border-gray-600 text-gray-300"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Waveform Display */}
        <div className="space-y-2">
          <div
            ref={waveformRef}
            className="relative h-20 bg-gray-900 rounded cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            {/* Waveform bars */}
            <div className="absolute inset-0 flex items-end justify-between px-1">
              {waveformData.map((height, index) => (
                <div
                  key={index}
                  className="bg-gray-600 w-px"
                  style={{
                    height: `${height * 100}%`,
                    minHeight: '2px',
                  }}
                />
              ))}
            </div>

            {/* Selection overlay */}
            <div
              className="absolute top-0 bottom-0 bg-blue-500/30 border-l-2 border-r-2 border-blue-400"
              style={{
                left: `${getInTimePercentage()}%`,
                width: `${getSelectionWidth()}%`,
              }}
            />

            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
              style={{ left: `${getProgressPercentage()}%` }}
            />

            {/* Time markers */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-400"
              style={{ left: `${getInTimePercentage()}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-400"
              style={{ left: `${getOutTimePercentage()}%` }}
            />
          </div>

          {/* Loading state */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded">
              <div className="text-sm text-gray-400">Loading waveform...</div>
            </div>
          )}
        </div>

        {/* Time Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-12">In:</span>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={inTime}
                onChange={(e) => onInTimeChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs w-12 text-gray-400">
                {formatTime(inTime)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-12">Out:</span>
              <input
                type="range"
                min={inTime}
                max={duration}
                step="0.1"
                value={outTime}
                onChange={(e) => onOutTimeChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs w-12 text-gray-400">
                {formatTime(outTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs w-12 text-gray-400">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Selection Info */}
        {outTime > inTime && (
          <div className="text-xs text-gray-400 bg-gray-700/50 p-2 rounded">
            Selection: {formatTime(inTime)} - {formatTime(outTime)} 
            ({formatTime(outTime - inTime)} duration)
          </div>
        )}
      </CardContent>

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
    </Card>
  );
};
