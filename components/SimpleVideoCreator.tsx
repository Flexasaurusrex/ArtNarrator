'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Plus, Download, Play, Image, Type } from 'lucide-react';

interface Scene {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  duration: number;
  textPosition: {
    x: number;
    y: number;
  };
  textStyle: {
    fontSize: number;
    fontWeight: string;
    textColor: string;
    backgroundColor: string;
    backgroundOpacity: number;
  };
  transition: string;
}

export default function SimpleVideoCreator() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreviewScene, setCurrentPreviewScene] = useState(0);

  const addScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      imageUrl: '',
      title: '',
      description: '',
      duration: 5,
      textPosition: { x: 50, y: 80 }, // Bottom center by default
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        textColor: '#ffffff',
        backgroundColor: '#000000',
        backgroundOpacity: 50,
      },
      transition: 'fade'
    };
    setScenes([...scenes, newScene]);
    setCurrentScene(newScene);
  };

  const updateScene = (sceneId: string, updates: Partial<Scene>) => {
    setScenes(scenes.map(scene => 
      scene.id === sceneId ? { ...scene, ...updates } : scene
    ));
    if (currentScene?.id === sceneId) {
      setCurrentScene({ ...currentScene, ...updates });
    }
  };

  const handleImageUpload = (sceneId: string, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    updateScene(sceneId, { imageUrl });
  };

  const exportVideo = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scenes: scenes,
          backgroundMusic: backgroundMusic 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Export successful! ${data.message}`);
        // TODO: Download actual video file when Remotion is integrated
      } else {
        alert('Export failed: ' + data.error);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: Network error');
    }
    setIsExporting(false);
  };

  const playPreview = () => {
    if (scenes.length === 0) return;
    
    setIsPlaying(true);
    setCurrentPreviewScene(0);
    
    let sceneIndex = 0;
    const playNextScene = () => {
      if (sceneIndex < scenes.length) {
        setCurrentPreviewScene(sceneIndex);
        const sceneDuration = scenes[sceneIndex].duration * 1000; // Convert to ms
        
        setTimeout(() => {
          sceneIndex++;
          playNextScene();
        }, sceneDuration);
      } else {
        setIsPlaying(false);
        setCurrentPreviewScene(0);
      }
    };
    
    playNextScene();
  };

  const stopPreview = () => {
    setIsPlaying(false);
    setCurrentPreviewScene(0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Video Essay Creator</h1>
          <div className="flex gap-3">
            <Button 
              onClick={isPlaying ? stopPreview : playPreview}
              disabled={scenes.length === 0}
              variant="outline"
            >
              {isPlaying ? 'Stop' : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Stop Preview' : 'Play Preview'}
            </Button>
            <Button onClick={addScene} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Scene
            </Button>
            <Button 
              onClick={exportVideo}
              disabled={scenes.length === 0 || isExporting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Video'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Scene List */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-200">Scenes ({scenes.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    onClick={() => setCurrentScene(scene)}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      currentScene?.id === scene.id 
                        ? 'bg-blue-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
                        {scene.imageUrl ? (
                          <img 
                            src={scene.imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Image className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {scene.title || `Scene ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-400">
                          {scene.duration}s
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {scenes.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No scenes yet. Add your first scene to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scene Editor */}
          <div className="lg:col-span-2">
            {currentScene ? (
              <div className="space-y-6">
                
                {/* Preview */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-200 flex items-center justify-between">
                      Preview
                      {isPlaying && (
                        <span className="text-sm font-normal text-blue-400">
                          Playing Scene {currentPreviewScene + 1} of {scenes.length}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video bg-black rounded overflow-hidden">
                      {(() => {
                        const previewScene = isPlaying && scenes[currentPreviewScene] 
                          ? scenes[currentPreviewScene] 
                          : currentScene;
                        
                        return previewScene?.imageUrl ? (
                          <>
                            <img 
                              src={previewScene.imageUrl}
                              alt="Scene"
                              className="w-full h-full object-cover"
                            />
                            {/* Text Overlay */}
                            <div 
                              className="absolute text-center px-4 py-2 backdrop-blur-sm rounded"
                              style={{
                                left: `${previewScene.textPosition.x}%`,
                                top: `${previewScene.textPosition.y}%`,
                                transform: 'translate(-50%, -50%)',
                                maxWidth: '80%',
                                color: previewScene.textStyle?.textColor || '#ffffff',
                                backgroundColor: `${previewScene.textStyle?.backgroundColor || '#000000'}${Math.round((previewScene.textStyle?.backgroundOpacity || 50) * 255 / 100).toString(16).padStart(2, '0')}`,
                                fontSize: `${previewScene.textStyle?.fontSize || 18}px`,
                                fontWeight: previewScene.textStyle?.fontWeight || 'bold'
                              }}
                            >
                              <div className="mb-1">{previewScene.title}</div>
                              <div style={{ fontSize: `${(previewScene.textStyle?.fontSize || 18) * 0.8}px` }}>
                                {previewScene.description}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                              <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                              <p>Upload an image to see preview</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Scene Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Image & Basic Info */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-200 flex items-center">
                        <Image className="w-5 h-5 mr-2" />
                        Image & Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(currentScene.id, file);
                          }}
                          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <Input
                          value={currentScene.title}
                          onChange={(e) => updateScene(currentScene.id, { title: e.target.value })}
                          placeholder="Scene title..."
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea
                          value={currentScene.description}
                          onChange={(e) => updateScene(currentScene.id, { description: e.target.value })}
                          placeholder="Scene narration text..."
                          rows={3}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Duration: {currentScene.duration}s
                        </label>
                        <Slider
                          value={[currentScene.duration]}
                          onValueChange={([value]: number[]) => updateScene(currentScene.id, { duration: value })}
                          min={1}
                          max={15}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Text Positioning & Styling */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-200 flex items-center">
                        <Type className="w-5 h-5 mr-2" />
                        Text & Effects
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Position Controls */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Horizontal: {currentScene.textPosition.x}%
                        </label>
                        <Slider
                          value={[currentScene.textPosition.x]}
                          onValueChange={([value]: number[]) => updateScene(currentScene.id, { 
                            textPosition: { ...currentScene.textPosition, x: value }
                          })}
                          min={10}
                          max={90}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Vertical: {currentScene.textPosition.y}%
                        </label>
                        <Slider
                          value={[currentScene.textPosition.y]}
                          onValueChange={([value]: number[]) => updateScene(currentScene.id, { 
                            textPosition: { ...currentScene.textPosition, y: value }
                          })}
                          min={10}
                          max={90}
                          className="w-full"
                        />
                      </div>

                      {/* Quick Position Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateScene(currentScene.id, { 
                            textPosition: { x: 50, y: 20 } 
                          })}
                        >
                          Top
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateScene(currentScene.id, { 
                            textPosition: { x: 50, y: 50 } 
                          })}
                        >
                          Center
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateScene(currentScene.id, { 
                            textPosition: { x: 50, y: 80 } 
                          })}
                        >
                          Bottom
                        </Button>
                      </div>

                      <hr className="border-gray-600" />

                      {/* Text Styling */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Font Size: {currentScene.textStyle?.fontSize || 18}px
                        </label>
                        <Slider
                          value={[currentScene.textStyle?.fontSize || 18]}
                          onValueChange={([value]: number[]) => updateScene(currentScene.id, { 
                            textStyle: { ...currentScene.textStyle, fontSize: value }
                          })}
                          min={12}
                          max={48}
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">Text Color</label>
                          <input
                            type="color"
                            value={currentScene.textStyle?.textColor || '#ffffff'}
                            onChange={(e) => updateScene(currentScene.id, {
                              textStyle: { ...currentScene.textStyle, textColor: e.target.value }
                            })}
                            className="w-full h-10 rounded border border-gray-600 bg-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Background</label>
                          <input
                            type="color"
                            value={currentScene.textStyle?.backgroundColor || '#000000'}
                            onChange={(e) => updateScene(currentScene.id, {
                              textStyle: { ...currentScene.textStyle, backgroundColor: e.target.value }
                            })}
                            className="w-full h-10 rounded border border-gray-600 bg-gray-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Background Opacity: {currentScene.textStyle?.backgroundOpacity || 50}%
                        </label>
                        <Slider
                          value={[currentScene.textStyle?.backgroundOpacity || 50]}
                          onValueChange={([value]: number[]) => updateScene(currentScene.id, { 
                            textStyle: { ...currentScene.textStyle, backgroundOpacity: value }
                          })}
                          min={0}
                          max={100}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Font Weight</label>
                        <select
                          value={currentScene.textStyle?.fontWeight || 'bold'}
                          onChange={(e) => updateScene(currentScene.id, {
                            textStyle: { ...currentScene.textStyle, fontWeight: e.target.value }
                          })}
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="600">Semi Bold</option>
                          <option value="900">Extra Bold</option>
                        </select>
                      </div>

                      <hr className="border-gray-600" />

                      {/* Transition Effects */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Scene Transition</label>
                        <select
                          value={currentScene.transition || 'fade'}
                          onChange={(e) => updateScene(currentScene.id, { transition: e.target.value })}
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        >
                          <option value="fade">Fade</option>
                          <option value="slide_left">Slide Left</option>
                          <option value="slide_right">Slide Right</option>
                          <option value="slide_up">Slide Up</option>
                          <option value="slide_down">Slide Down</option>
                          <option value="zoom_in">Zoom In</option>
                          <option value="zoom_out">Zoom Out</option>
                          <option value="cut">Cut (No Transition)</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-400">
                    <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Add a scene or select an existing one to start editing</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
