'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Play, Pause, Image, Type, Palette, SkipBack, SkipForward, Clock, Zap } from 'lucide-react';

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
  transitionDuration: number; // New: control transition length
  transitionIntensity: number; // New: control effect intensity
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
      transition: 'fade',
      transitionDuration: 1.0, // 1 second default
      transitionIntensity: 100 // 100% intensity default
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
      const currentSceneData = scenes[currentPreviewIndex];
      const transitionDuration = currentSceneData.transitionDuration * 1000; // Convert to ms
      
      setIsTransitioning(true);
      setNextScenePreview(scenes[currentPreviewIndex + 1]);
      
      setTimeout(() => {
        setCurrentPreviewIndex(currentPreviewIndex + 1);
        setPreviewProgress(0);
        setIsTransitioning(false);
        setNextScenePreview(null);
      }, transitionDuration);
    } else {
      stopPreview();
    }
  };

  const prevScene = () => {
    if (currentPreviewIndex > 0) {
      const currentSceneData = scenes[currentPreviewIndex - 1];
      const transitionDuration = currentSceneData.transitionDuration * 1000;
      
      setIsTransitioning(true);
      setNextScenePreview(scenes[currentPreviewIndex - 1]);
      
      setTimeout(() => {
        setCurrentPreviewIndex(currentPreviewIndex - 1);
        setPreviewProgress(0);
        setIsTransitioning(false);
        setNextScenePreview(null);
      }, transitionDuration);
    }
  };

  // Auto-advance preview scenes with enhanced transition effects
  useEffect(() => {
    if (!isPlaying || scenes.length === 0 || isTransitioning) return;

    const currentSceneData = scenes[currentPreviewIndex];
    if (!currentSceneData) return;

    const interval = setInterval(() => {
      setPreviewProgress(prev => {
        const transitionStartPoint = 100 - (currentSceneData.transitionDuration / currentSceneData.duration * 100);
        
        // Start transition at calculated point
        if (prev >= transitionStartPoint && prev < 100 && currentPreviewIndex < scenes.length - 1) {
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
        return prev + (100 / (currentSceneData.duration * 10));
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

  // FIX: Show the right scene in preview
  const sceneToShow = isPlaying ? scenes[currentPreviewIndex] : currentScene;
  
  const getTransitionClasses = (scene: Scene, isNext = false) => {
    if (!scene) return "absolute inset-0 w-full h-full opacity-0";
    
    const baseClasses = "absolute inset-0 w-full h-full transition-all";
    const intensity = scene.transitionIntensity / 100; // Convert percentage to decimal
    const duration = scene.transitionDuration * 1000; // Convert to ms
    
    if (!isTransitioning) {
      return `${baseClasses} ${isNext ? 'opacity-0' : 'opacity-100'}`;
    }
    
    const transitionStyle = `duration-[${duration}ms]`;
    
    switch (scene.transition) {
      case 'fade':
        return `${baseClasses} ${transitionStyle} transition-opacity ${isNext ? 'opacity-100' : `opacity-${Math.round((1-intensity)*100)}`}`;
      case 'slide-left':
        return `${baseClasses} ${transitionStyle} transition-transform ${isNext ? 'translate-x-0' : `-translate-x-${Math.round(intensity*100)}`}`;
      case 'slide-right':
        return `${baseClasses} ${transitionStyle} transition-transform ${isNext ? 'translate-x-0' : `translate-x-${Math.round(intensity*100)}`}`;
      case 'zoom-in':
        const zoomInScale = isNext ? 'scale-100' : `scale-${Math.round(100 + intensity*50)}`;
        return `${baseClasses} ${transitionStyle} transition-transform ${zoomInScale} ${isNext ? 'opacity-100' : `opacity-${Math.round((1-intensity)*100)}`}`;
      case 'zoom-out':
        const zoomOutScale = isNext ? 'scale-100' : `scale-${Math.round(100 - intensity*50)}`;
        return `${baseClasses} ${transitionStyle} transition-transform ${zoomOutScale} ${isNext ? 'opacity-100' : `opacity-${Math.round((1-intensity)*100)}`}`;
      case 'dissolve':
        const blurAmount = Math.round(intensity * 4);
        return `${baseClasses} ${transitionStyle} transition-all ${isNext ? 'opacity-100 blur-0' : `opacity-${Math.round((1-intensity)*100)} blur-[${blurAmount}px]`}`;
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
                    onClick={() => {
                      setCurrentScene(scene);
                      // If not playing, update preview to show this scene
                      if (!isPlaying) {
                        setCurrentPreviewIndex(index);
                      }
                    }}
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
                
                {/* Enhanced Preview */}
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
                      {/* Current/Selected Scene */}
                      {sceneToShow?.imageUrl && (
                        <div className={getTransitionClasses(sceneToShow, false)}>
                          <img 
                            src={sceneToShow.imageUrl}
                            alt="Current Scene"
                            className="w-full h-full object-cover"
                          />
                          {/* Text Overlay */}
                          <div 
                            className={`absolute px-4 py-2 rounded max-w-[80%] transition-all duration-500 ${
                              isPlaying && !isTransitioning ? 'opacity-100' : 'opacity-80'
                            }`}
                            style={{
                              left: `${sceneToShow.textPosition.x}%`,
                              top: `${sceneToShow.textPosition.y}%`,
                              transform: 'translate(-50%, -50%)',
                              fontSize: `${sceneToShow.textStyle.fontSize}px`,
                              fontFamily: sceneToShow.textStyle.fontFamily,
                              color: sceneToShow.textStyle.color,
                              backgroundColor: sceneToShow.textStyle.backgroundColor + Math.round(sceneToShow.textStyle.backgroundOpacity * 2.55).toString(16).padStart(2, '0'),
                              fontWeight: sceneToShow.textStyle.fontWeight,
                              textAlign: sceneToShow.textStyle.textAlign as any,
                              backdropFilter: sceneToShow.textStyle.backgroundOpacity > 0 ? 'blur(4px)' : 'none'
                            }}
                          >
                            <div className="font-bold mb-1">{sceneToShow.title}</div>
                            <div className="text-sm leading-tight">{sceneToShow.description}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Next Scene (during transitions) */}
                      {nextScenePreview?.imageUrl && isTransitioning && (
                        <div className={getTransitionClasses(nextScenePreview, true)}>
                          <img 
                            src={nextScenePreview.imageUrl}
                            alt="Next Scene"
                            className="w-full h-full object-cover"
                          />
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
                      
                      {/* Fallback */}
                      {!sceneToShow?.imageUrl && (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <div className="text-center">
                            <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Upload an image to see preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Preview Progress */}
                    {isPlaying && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                          <span>Scene {currentPreviewIndex + 1} of {scenes.length}</span>
                          <span>{Math.ceil((100 - previewProgress) * (sceneToShow?.duration || 5) / 100)}s remaining</span>
                        </div>
                        <div className="flex-1 bg-gray-700 rounded h-2 mb-2">
                          <div 
                            className="bg-green-500 h-2 rounded transition-all duration-100"
                            style={{ width: `${previewProgress}%` }}
                          />
                        </div>
                        {isTransitioning && (
                          <div className="text-center text-yellow-400 text-sm">
                            Transitioning ({sceneToShow?.transition}) - {sceneToShow?.transitionDuration}s @ {sceneToShow?.transitionIntensity}% intensity
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Scene Settings with Transition Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Content Panel - Enhanced with transition controls */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-200 flex items-center">
                        <Image className="w-5 h-5 mr-2" />
                        Content & Transitions
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
