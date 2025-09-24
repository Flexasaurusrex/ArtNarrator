import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const PlaybackControls: React.FC = () => {
  const { 
    playback,
    scenes,
    setPlaying,
    setCurrentTime,
    setPlaybackRate,
    resetPlayback 
  } = useAppStore();

  const totalDuration = scenes.reduce((total, scene) => total + scene.durationSec, 0);

  const handlePlayPause = () => {
    setPlaying(!playback.isPlaying);
  };

  const handleSeek = (values: number[]) => {
    const [time] = values;
    setCurrentTime(time);
  };

  const handlePrevious = () => {
    // Find current scene and go to previous
    let cumulativeTime = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (playback.currentTime < cumulativeTime + scenes[i].durationSec) {
        const prevTime = i > 0 ? cumulativeTime - scenes[i - 1].durationSec : 0;
        setCurrentTime(prevTime);
        return;
      }
      cumulativeTime += scenes[i].durationSec;
    }
  };

  const handleNext = () => {
    // Find current scene and go to next
    let cumulativeTime = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (playback.currentTime < cumulativeTime + scenes[i].durationSec) {
        const nextTime = cumulativeTime + scenes[i].durationSec;
        setCurrentTime(Math.min(nextTime, totalDuration));
        return;
      }
      cumulativeTime += scenes[i].durationSec;
    }
  };

  const handleReset = () => {
    resetPlayback();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!totalDuration) return 0;
    return (playback.currentTime / totalDuration) * 100;
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="space-y-4">
        {/* Main Timeline Scrubber */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={totalDuration || 100}
            step="0.1"
            value={playback.currentTime}
            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(playback.currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={handlePlayPause}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {playback.isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* Playback Speed */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs text-gray-400">Speed:</span>
            <select
              value={playback.playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0.25">0.25x</option>
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
        </div>

        {/* Progress Bar Visual */}
        <div className="relative">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>

          {/* Scene markers */}
          {scenes.length > 0 && (
            <div className="absolute top-0 w-full h-1">
              {(() => {
                let cumulativeTime = 0;
                return scenes.map((scene, index) => {
                  const startPercent = (cumulativeTime / totalDuration) * 100;
                  cumulativeTime += scene.durationSec;
                  const endPercent = (cumulativeTime / totalDuration) * 100;
                  
                  return (
                    <div
                      key={scene.id}
                      className="absolute top-0 h-1 border-r border-gray-500"
                      style={{ left: `${endPercent}%` }}
                      title={`Scene ${index + 1}: ${scene.title}`}
                    />
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Scene Info */}
        {(() => {
          let cumulativeTime = 0;
          const currentScene = scenes.find((scene) => {
            const sceneStart = cumulativeTime;
            cumulativeTime += scene.durationSec;
            return playback.currentTime >= sceneStart && playback.currentTime < cumulativeTime;
          });

          return currentScene ? (
            <div className="text-center">
              <div className="text-sm text-gray-300">
                {currentScene.title || 'Untitled Scene'}
              </div>
              {currentScene.body && (
                <div className="text-xs text-gray-400 truncate max-w-md mx-auto">
                  {currentScene.body}
                </div>
              )}
            </div>
          ) : null;
        })()}

        {/* Volume Control (if needed) */}
        <div className="flex items-center justify-center gap-2">
          <VolumeX className="h-4 w-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="0.8"
            className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <Volume2 className="h-4 w-4 text-gray-400" />
        </div>
      </div>

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
