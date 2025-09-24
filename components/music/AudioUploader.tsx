'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Link, Music, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioUploaderProps {
  onAudioSelected: (url: string, duration: number) => void;
}

export function AudioUploader({ onAudioSelected }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);

    try {
      const duration = await getAudioDuration(file);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onAudioSelected(data.data.url, duration);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      // For URL inputs, we'll assume a default duration or fetch metadata
      onAudioSelected(urlInput.trim(), 60); // Default 60 seconds
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
            
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isUploading ? 'Uploading...' : 'Drop audio file here'}
              </p>
              <p className="text-xs text-muted-foreground">
                MP3, WAV, M4A (max 50MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileInput}
        disabled={isUploading}
      />

      {/* URL Input */}
      <form onSubmit={handleUrlSubmit} className="flex space-x-2">
        <Input
          placeholder="Or paste audio URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={isUploading}
        />
        <Button type="submit" variant="outline" disabled={!urlInput.trim() || isUploading}>
          <Link className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
