'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Link, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploaderProps {
  currentUrl?: string;
  onImageSelected: (url: string) => void;
  className?: string;
}

export function ImageUploader({ currentUrl, onImageSelected, className }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageSelected(data.data.url);
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

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onImageSelected(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleRemove = () => {
    onImageSelected('');
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Current Image Preview */}
      {currentUrl && (
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <Image
              src={currentUrl}
              alt="Scene image"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

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
                {isUploading ? 'Uploading...' : 'Drop image here'}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse (max 10MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
        disabled={isUploading}
      />

      {/* URL Input */}
      <form onSubmit={handleUrlSubmit} className="flex space-x-2">
        <Input
          placeholder="Or paste image URL..."
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
