import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, Sparkles, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Scene, CreateScene } from '@/lib/schemas';

export const SceneInspector: React.FC = () => {
  const { 
    scenes, 
    addScene, 
    updateScene, 
    deleteScene, 
    duplicateScene, 
    timeline: { selectedSceneIds },
    selectScene 
  } = useAppStore();
  
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const selectedScene = scenes.find(s => selectedSceneIds.includes(s.id!));

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      if (selectedScene?.id) {
        updateScene(selectedScene.id, { imageUrl: data.data.url });
      } else {
        // Create new scene with uploaded image
        const newScene: CreateScene = {
          projectId: '',
          order: scenes.length,
          durationSec: 5,
          imageUrl: data.data.url,
          title: 'New Scene',
          body: '',
          credit: '',
          fx: 'none',
          safeArea: 'bottom',
        };
        addScene(newScene);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSceneUpdate = (field: keyof Scene, value: any) => {
    if (selectedScene?.id) {
      updateScene(selectedScene.id, { [field]: value });
    }
  };

  const handleAddScene = () => {
    const newScene: CreateScene = {
      projectId: '',
      order: scenes.length,
      durationSec: 5,
      title: `Scene ${scenes.length + 1}`,
      body: '',
      credit: '',
      fx: 'none',
      safeArea: 'bottom',
    };
    addScene(newScene);
  };

  const effects = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'kenburns_slow', label: 'Ken Burns (Slow)' },
    { value: 'kenburns_medium', label: 'Ken Burns (Medium)' },
    { value: 'pan_right', label: 'Pan Right' },
    { value: 'pan_left', label: 'Pan Left' },
  ];

  const safeAreas = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-6">
      {/* Scene Selection */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Image className="h-5 w-5" />
              Scenes ({scenes.length})
            </CardTitle>
            <Button
              size="sm"
              onClick={handleAddScene}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Scene
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {scenes.length > 0 ? (
            <div className="space-y-2">
              {scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedSceneIds.includes(scene.id!)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                  onClick={() => scene.id && selectScene(scene.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-medium truncate">
                          {scene.title || 'Untitled Scene'}
                        </span>
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {scene.durationSec}s • {scene.fx}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {scene.imageUrl && (
                        <Eye className="h-4 w-4 opacity-60" />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          scene.id && duplicateScene(scene.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-500"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          scene.id && deleteScene(scene.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scenes created yet</p>
              <p className="text-sm">Add a scene to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scene Editor */}
      {selectedScene && (
        <>
          {/* Image Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-sm">Scene Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedScene.imageUrl ? (
                <div className="relative group">
                  <img
                    src={selectedScene.imageUrl}
                    alt="Scene image"
                    className="w-full aspect-video object-cover rounded-lg bg-gray-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSceneUpdate('imageUrl', undefined)}
                      className="border-red-600 text-red-400 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Image className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    Or generate with AI
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-gray-600 text-gray-300"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Image
                  </Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Scene Content */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-sm">Scene Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-200">Title</Label>
                <Input
                  value={selectedScene.title}
                  onChange={(e) => handleSceneUpdate('title', e.target.value)}
                  placeholder="Enter scene title..."
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">Body Text</Label>
                <textarea
                  value={selectedScene.body}
                  onChange={(e) => handleSceneUpdate('body', e.target.value)}
                  placeholder="Enter scene description..."
                  className="w-full min-h-[100px] px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={500}
                />
                <div className="text-xs text-gray-400 text-right">
                  {selectedScene.body.length}/500 characters
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">Credit (Optional)</Label>
                <Input
                  value={selectedScene.credit}
                  onChange={(e) => handleSceneUpdate('credit', e.target.value)}
                  placeholder="Photo credit, source, etc."
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Scene Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-sm">Scene Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-200">Duration</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="30"
                    step="0.1"
                    value={selectedScene.durationSec}
                    onChange={(e) => handleSceneUpdate('durationSec', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex items-center gap-1 min-w-0">
                    <Input
                      type="number"
                      value={selectedScene.durationSec}
                      onChange={(e) => handleSceneUpdate('durationSec', parseFloat(e.target.value) || 0.5)}
                      min="0.5"
                      max="30"
                      step="0.1"
                      className="w-20 bg-gray-700 border-gray-600 text-gray-100"
                    />
                    <span className="text-xs text-gray-400">sec</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">Visual Effect</Label>
                <select
                  value={selectedScene.fx}
                  onChange={(e) => handleSceneUpdate('fx', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {effects.map((effect) => (
                    <option key={effect.value} value={effect.value}>
                      {effect.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">Text Safe Area</Label>
                <select
                  value={selectedScene.safeArea}
                  onChange={(e) => handleSceneUpdate('safeArea', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {safeAreas.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400">
                  Where to position text to avoid important parts of the image
                </p>
              </div>
            </CardContent>
          </Card>
        </>
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
