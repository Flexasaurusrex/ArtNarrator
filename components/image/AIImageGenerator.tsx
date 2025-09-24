'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Download } from 'lucide-react';
import Image from 'next/image';

interface AIImageGeneratorProps {
  onImageGenerated: (url: string) => void;
}

interface GenerationResult {
  id: string;
  url: string;
  prompt: string;
  status: 'generating' | 'completed' | 'failed';
}

export function AIImageGenerator({ onImageGenerated }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);

  const isAIEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true';

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const generationId = Date.now().toString();

    // Add pending result
    const pendingResult: GenerationResult = {
      id: generationId,
      url: '',
      prompt,
      status: 'generating',
    };
    setResults(prev => [pendingResult, ...prev]);

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update result with completed image
        setResults(prev => prev.map(result => 
          result.id === generationId 
            ? { ...result, url: data.data.url, status: 'completed' }
            : result
        ));
      } else {
        setResults(prev => prev.map(result => 
          result.id === generationId 
            ? { ...result, status: 'failed' }
            : result
        ));
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      setResults(prev => prev.map(result => 
        result.id === generationId 
          ? { ...result, status: 'failed' }
          : result
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAIEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Image Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              AI image generation is disabled
            </p>
            <p className="text-xs text-muted-foreground">
              Enable ENABLE_AI_FEATURES in your environment variables
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Image Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generation Form */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground">
              {prompt.length}/500 characters
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photographic">Photographic</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="artistic">Artistic</SelectItem>
                  <SelectItem value="vintage">Vintage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Image
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <Label>Generated Images</Label>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {results.map((result) => (
                <div key={result.id} className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    {result.status === 'generating' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : result.status === 'completed' ? (
                      <Image
                        src={result.url}
                        alt={result.prompt}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-destructive">
                        ✗
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {result.prompt}
                    </p>
                    <Badge 
                      variant={
                        result.status === 'completed' ? 'default' :
                        result.status === 'generating' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {result.status}
                    </Badge>
                  </div>

                  {result.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onImageGenerated(result.url)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
