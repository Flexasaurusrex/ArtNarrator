import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Download } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { AIImagePrompt } from '@/lib/schemas';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  createdAt: Date;
}

export const AIImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<AIImagePrompt['style']>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<AIImagePrompt['aspectRatio']>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { addScene } = useAppStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const newImage: GeneratedImage = {
        id: `gen_${Date.now()}`,
        url: data.data.url,
        prompt: prompt.trim(),
        style,
        createdAt: new Date(),
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt('');
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToProject = (image: GeneratedImage) => {
    addScene({
      projectId: '',
      order: 0,
      durationSec: 5,
      imageUrl: image.url,
      title: 'AI Generated Scene',
      body: image.prompt,
      credit: `AI Generated (${image.style})`,
      fx: 'kenburns_slow',
      safeArea: 'bottom',
    });
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const styles = [
    { value: 'photographic', label: 'Photographic' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'artistic', label: 'Artistic' },
    { value: 'vintage', label: 'Vintage' },
  ];

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:5', label: 'Social (4:5)' },
  ];

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            AI Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-gray-200">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 min-h-[100px]"
              maxLength={500}
            />
            <div className="text-xs text-gray-400 text-right">
              {prompt.length}/500 characters
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-200">Style</Label>
              <Select value={style} onValueChange={(value: AIImagePrompt['style']) => setStyle(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((styleOption) => (
                    <SelectItem key={styleOption.value} value={styleOption.value}>
                      {styleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(value: AIImagePrompt['aspectRatio']) => setAspectRatio(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value}>
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-3">
              {error}
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Generated Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="space-y-3">
                  <div className="relative group">
                    <img 
                      src={image.url} 
                      alt={image.prompt}
                      className="w-full aspect-video object-cover rounded-lg bg-gray-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(image)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToProject(image)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add to Project
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-300 text-sm line-clamp-2">{image.prompt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">{image.style}</span>
                      <span>{image.createdAt.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Images State */}
      {generatedImages.length === 0 && !isGenerating && (
        <div className="text-center py-12 text-gray-500">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No images generated yet</p>
          <p className="text-sm">Enter a prompt above to get started</p>
        </div>
      )}
    </div>
  );
};
