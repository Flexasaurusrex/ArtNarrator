'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaveformPlayerProps {
  url: string;
  inTime: number;
  outTime: number;
  volume: number;
  onInTimeChange: (time: number) => void;
  onOutTimeChange: (time: number) => void;
}

export function WaveformPlayer({
  url,
  inTime,
  outTime,
  volume,
  onInTimeChange,
  onOutTimeChange,
}: WaveformPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Load audio and generate waveform
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) return;

    audio.src = url;
    audio.volume = volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      generateWaveform(url);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [url, volume]);

  // Generate simplified waveform data
  const generateWaveform = async (audioUrl: string) => {
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 200; // Number of samples for waveform
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];
      
      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }
      
      const multiplier = Math.max(...filteredData) ** -1;
      const normalizedData = filteredData.map(n => n * multiplier);
      
      setWaveformData(normalizedData);
    } catch (error) {
      console.error('Error generating waveform:', error);
      // Fallback: generate random waveform for demo
      const fallbackData = Array.from({ length: 200 }, () => Math.random());
      setWaveformData(fallbackData);
    }
  };

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const barWidth = width / waveformData.length;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw waveform bars
    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      
      // Color based on position relative to in/out times
      const timePercent = (index / waveformData.length) * duration;
      let color = '#64748b'; // muted
      
      if (timePercent >= inTime && timePercent <= outTime) {
        color = currentTime >= inTime && currentTime <= timePercent ? '#3b82f6' : '#e2e8f0';
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    });
    
    // Draw in/out markers
    const inX = (inTime / duration) * width;
    const outX = (outTime / duration) * width;
    
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(inX, 0);
    ctx.lineTo(inX, height);
    ctx.stroke();
    
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(outX, 0);
    ctx.lineTo(outX, height);
    ctx.stroke();
    
  }, [waveformData, currentTime, duration, inTime, outTime]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.currentTime = inTime;
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / canvas.width) * duration;
    
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = clickTime;
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="waveform-container space-y-3">
      <audio ref={audioRef} />
      
      {/* Waveform Display */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-20 bg-muted/30 rounded cursor-pointer"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            disabled={!url}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Scissors className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatTime(inTime)} - {formatTime(outTime)}
          </span>
        </div>
      </div>

      {/* Trim Controls */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs w-12">In:</span>
          <Slider
            value={[inTime]}
            onValueChange={([value]) => onInTimeChange(value)}
            max={duration}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs w-16">{formatTime(inTime)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs w-12">Out:</span>
          <Slider
            value={[outTime]}
            onValueChange={([value]) => onOutTimeChange(value)}
            max={duration}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs w-16">{formatTime(outTime)}</span>
        </div>
      </div>
    </div>
  );
}
