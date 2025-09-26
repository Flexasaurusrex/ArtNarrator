'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Play, Pause, Image, Type, Palette, SkipBack, SkipForward, Clock } from 'lucide-react';

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
    fontFamily: string;
    color: string;
    backgroundColor: string;
    backgroundOpacity: number;
    fontWeight: string;
    textAlign: string;
  };
  transition: string;
}

const TRANSITIONS = [
  { value: 'fade', label: 'Fade In/Out' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'zoom-out', label: 'Zoom Out' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'none', label: 'Cut' }
];

const FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times' },
  { value: 'Helvetica', label: 'Helvetica' }
];

export default function SimpleVideoCreator() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Enhanced preview state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextScenePreview, setNextScenePreview] = useState<Scene | null>(null);
  
  // Overall video duration
  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

  const addScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      imageUrl: '',
      title: '',
      description: '',
      duration: 5,
      textPosition: { x: 50, y: 80 },
      textStyle: {
        fontSize: 24,
        fontFamily: 'Inter',
        color: '#ffffff',
        backgroundColor: '#000000',
        backgroundOpacity: 50,
        fontWeight: 'bold',
        textAlign: 'center'
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

  // Enhanced preview functionality with transitions
  const startPreview = () => {
    if (scenes.length === 0) return;
    setIsPlaying(true);
    setCurrentPreviewIndex(0);
    setPreviewProgress(0);
    setIsTransitioning(false);
  };

  const stopPreview = () => {
    setIsPlaying(false);
    setPreviewProgress(0);
    setIsTransitioning(false);
    setNextScenePreview(null);
  };

  const nextScene = () => {
    if (currentPreviewIndex < scenes.length - 1) {
      // Start transition effect
      setIsTransitioning(true);
      setNextScenePreview(scenes[currentPreviewIndex + 1]);
      
      // Complete transition after 800ms
      setTimeout(() => {
        setCurrentPreviewIndex(currentPreviewIndex + 1);
        setPreviewProgress(0);
        setIsTransitioning(false);
        setNextScenePreview(null);
      }, 800);
    } else {
      stopPreview();
    }
  };

  const prevScene = () => {
    if (currentPreviewIndex > 0) {
      setIsTransitioning(true);
      setNextScenePreview(scenes[currentPreviewIndex - 1]);
      
      setTimeout(() => {
        setCurrentPreviewIndex(currentPreviewIndex - 1);
        setPreviewProgress(0);
        setIsTransitioning(false);
        setNextScenePreview(null);
      }, 800);
    }
  };

  // Auto-advance preview scenes with transition effects
  useEffect(() => {
    if (!isPlaying || scenes.length === 0 || isTransitioning) return;

    const currentSceneDuration = scenes[currentPreviewIndex]?.duration || 5;
    const interval = setInterval(() => {
      setPreviewProgress(prev => {
        // Start transition at 90% progress
        if (prev >= 90 && prev < 100 && currentPreviewIndex < scenes.length - 1) {
          setIsTransitioning(true);
          setNextScenePreview(scenes[currentPreviewIndex + 1]);
        }
        
        if (prev >= 100) {
          if (currentPreviewIndex < scenes.length - 1) {
            setCurrentPreviewIndex(currentPreviewIndex + 1);
            setPreviewProgress(0);
            setIsTransitioning(false);
            setNextScenePreview(null);
          } else {
            stopPreview();
          }
          return 0;
        }
        return prev + (100 / (currentSceneDuration * 10));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentPreviewIndex, scenes, isTransitioning]);

  const exportVideo = async () => {
    if (scenes.length === 0) {
      alert('Add at least one scene before exporting');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/export-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scenes: scenes,
          backgroundMusic: backgroundMusic,
          totalDuration: totalDuration
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.videoUrl) {
          // Download the actual video
          const a = document.createElement('a');
          a.href = data.videoUrl;
          a.download = 'video-essay.mp4';
          a.click();
        } else {
          alert(data.message || 'Export completed successfully!');
        }
      } else {
        alert('Export failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: Network error');
    }
    setIsExporting(false);
  };

  const currentSceneForPreview = scenes[currentPreviewIndex];
  
  const getTransitionClasses = (scene: Scene, isNext = false) => {
    const baseClasses = "absolute inset-0 w-full h-full";
    
    if (!isTransitioning) {
      return `${baseClasses} transition-all duration-1000 ${isNext ? 'opacity-0' : 'opacity-100'}`;
    }
    
    switch (scene.transition) {
      case 'fade':
        return `${baseClasses} transition-opacity duration-800 ${isNext ? 'opacity-100' : 'opacity-0'}`;
      case 'slide-left':
        return `${baseClasses} transition-transform duration-800 ${isNext ? 'translate-x-0' : '-translate-x-full'}`;
      case 'slide-right':
        return `${baseClasses} transition-transform duration-800 ${isNext ? 'translate-x-0' : 'translate-x-full'}`;
      case 'zoom-in':
        return `${baseClasses} transition-transform duration-800 ${isNext ? 'scale-100' : 'scale-150 opacity-0'}`;
      case 'zoom-out':
        return `${baseClasses} transition-transform duration-800 ${isNext ? 'scale-100' : 'scale-50 opacity-0'}`;
      case 'dissolve':
        return `${baseClasses} transition-all duration-1000 ${isNext ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`;
      default:
        return `${baseClasses} ${isNext ? '' : 'hidden'}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Video Essay Creator</h1>
            {totalDuration > 0 && (
              <p className="text-gray-400 mt-1 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Total duration: {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toFixed(0).padStart(2, '0')}
              </p>
            )}
          </div>
          <div className="flex gap-3">
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
                    className={`p-3 rounded cursor-pointer transition-colors relative ${
                      currentScene?.id === scene.id 
                        ? 'bg-blue-600' 
                        : currentPreviewIndex === index && isPlaying
                        ? 'bg-green-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {currentPreviewIndex === index && isPlaying && (
                      <div 
                        className="absolute bottom-0 left-0 h-1 bg-green-300 transition-all duration-100"
                        style={{ width: `${previewProgress}%` }}
                      />
                    )}
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
                          {scene.duration}s • {scene.transition}
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
                
                {/* Enhanced Preview with Transitions */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-gray-200">Preview</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={prevScene}
                        disabled={currentPreviewIndex === 0 && !isPlaying}
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={isPlaying ? stopPreview : startPreview}
                        disabled={scenes.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={nextScene}
                        disabled={currentPreviewIndex === scenes.length - 1 && !isPlaying}
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video bg-black rounded overflow-hidden">
                      {/* Current Scene */}
                      {currentSceneForPreview?.imageUrl && (
                        <div className={getTransitionClasses(currentSceneForPreview, false)}>
                          <img 
                            src={currentSceneForPreview.imageUrl}
                            alt="Current Scene"
                            className="w-full h-full object-cover"
                          />
                          {/* Text Overlay for Current Scene */}
                          <div 
                            className={`absolute px-4 py-2 rounded max-w-[80%] transition-all duration-500 ${
                              isPlaying && !isTransitioning ? 'opacity-100' : 'opacity-80'
                            }`}
                            style={{
                              left: `${currentSceneForPreview.textPosition.x}%`,
                              top: `${currentSceneForPreview.textPosition.y}%`,
                              transform: 'translate(-50%, -50%)',
                              fontSize: `${currentSceneForPreview.textStyle.fontSize}px`,
                              fontFamily: currentSceneForPreview.textStyle.fontFamily,
                              color: currentSceneForPreview.textStyle.color,
                              backgroundColor: currentSceneForPreview.textStyle.backgroundColor + Math.round(currentSceneForPreview.textStyle.backgroundOpacity * 2.55).toString(16).padStart(2, '0'),
                              fontWeight: currentSceneForPreview.textStyle.fontWeight,
                              textAlign: currentSceneForPreview.textStyle.textAlign as any,
                              backdropFilter: currentSceneForPreview.textStyle.backgroundOpacity > 0 ? 'blur(4px)' : 'none'
                            }}
                          >
                            <div className="font-bold mb-1">{currentSceneForPreview.title}</div>
                            <div className="text-sm leading-tight">{currentSceneForPreview.description}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Next Scene (for transitions) */}
                      {nextScenePreview?.imageUrl && isTransitioning && (
                        <div className={getTransitionClasses(nextScenePreview, true)}>
                          <img 
                            src={nextScenePreview.imageUrl}
                            alt="Next Scene"
                            className="w-full h-full object-cover"
                          />
                          {/* Text Overlay for Next Scene */}
                          <div 
                            className="absolute px-4 py-2 rounded max-w-[80%] opacity-100"
                            style={{
                              left: `${nextScenePreview.textPosition.x}%`,
                              top: `${nextScenePreview.textPosition.y}%`,
                              transform: 'translate(-50%, -50%)',
                              fontSize: `${nextScenePreview.textStyle.fontSize}px`,
                              fontFamily: nextScenePreview.textStyle.fontFamily,
                              color: nextScenePreview.textStyle.color,
                              backgroundColor: nextScenePreview.textStyle.backgroundColor + Math.round(nextScenePreview.textStyle.backgroundOpacity * 2.55).toString(16).padStart(2, '0'),
                              fontWeight: nextScenePreview.textStyle.fontWeight,
                              textAlign: nextScenePreview.textStyle.textAlign as any,
                              backdropFilter: nextScenePreview.textStyle.backgroundOpacity > 0 ? 'blur(4px)' : 'none'
                            }}
                          >
                            <div className="font-bold mb-1">{nextScenePreview.title}</div>
                            <div className="text-sm leading-tight">{nextScenePreview.description}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Fallback for no image */}
                      {!currentSceneForPreview?.imageUrl && (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <div className="text-center">
                            <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Upload an image to see preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced Preview Progress */}
                    {isPlaying && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                          <span>Scene {currentPreviewIndex + 1} of {scenes.length}</span>
                          <span>{Math.ceil((100 - previewProgress) * (currentSceneForPreview?.duration || 5) / 100)}s remaining</span>
                        </div>
                        <div className="flex-1 bg-gray-700 rounded h-2 mb-2">
                          <div 
                            className="bg-green-500 h-2 rounded transition-all duration-100"
                            style={{ width: `${previewProgress}%` }}
                          />
                        </div>
                        {isTransitioning && (
                          <div className="text-center text-yellow-400 text-sm">
                            Transitioning ({currentSceneForPreview?.transition})...
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Scene Settings - Same as before but with enhanced duration display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Image & Basic Info */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-200 flex items-center">
                        <Image className="w-5 h-5 mr-2" />
                        Content
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

                      <div className="bg-gray-700/50 p-3 rounded">
                        <label className="block text-sm font-medium mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Scene Duration: {currentScene.duration}s
                        </label>
                        <Slider
                          value={[currentScene.duration]}
                          onValueChange={([value]: number[]) => updateScene(currentScene.id, { duration: value })}
                          min={1}
                          max={30}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1s</span>
                          <span>30s</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Transition Effect</label>
                        <Select 
                          value={currentScene.transition} 
                          onValueChange={(value) => updateScene(currentScene.id, { transition: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Select transition" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSITIONS.map(transition => (
                              <SelectItem key={transition.value} value={transition.value}>
                                {transition.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Text Position - Same as before */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-200 flex items-center">
                        <Type className="w-5 h-5 mr-2" />
                        Position
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  </Card>

                  {/* Text Style - Same as before */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-200 flex items-center">
                        <Palette className="w-5 h-5 mr-2" />
                        Text Style
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">Font</label>
                          <Select 
                            value={currentScene.textStyle.fontFamily} 
                            onValueChange={(value) => updateScene(currentScene.id, { 
                              textStyle: { ...currentScene.textStyle, fontFamily: value }
                            })}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONTS.map(font => (
                                <SelectItem key={font.value} value={font.value}>
                                  {font.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Size: {currentScene.textStyle.fontSize}px
                          </label>
                          <Slider
                            value={[currentScene.textStyle.fontSize]}
                            onValueChange={([value]: number[]) => updateScene(currentScene.id, { 
                              textStyle: { ...currentScene.textStyle, fontSize: value }
                            })}
                            min={12}
                            max={48}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">Text Color</label>
                          <input
                            type="color"
                            value={currentScene.textStyle.color}
                            onChange={(e) => updateScene(currentScene.id, { 
                              textStyle: { ...currentScene.textStyle, color: e.target.value }
                            })}
                            className="w-full h-8 rounded border border-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Background</label>
                          <input
                            type="color"
                            value={currentScene.textStyle.backgroundColor}
                            onChange={(e) => updateScene(currentScene.id, { 
                              textStyle: { ...currentScene.textStyle, backgroundColor: e.target.value }
                            })}
                            className="w-full h-8 rounded border border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Background Opacity: {currentScene.textStyle.backgroundOpacity}%
                        </label>
                        <Slider
                          value={[currentScene.textStyle.backgroundOpacity]}
                          onValueChange={([value]: number[]) => updateScene(currentScene.id, { 
                            textStyle: { ...currentScene.textStyle, backgroundOpacity: value }
                          })}
                          min={0}
                          max={100}
                          className="w-full"
                        />
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
