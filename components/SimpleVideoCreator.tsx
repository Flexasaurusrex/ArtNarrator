'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Play, Pause, Image, Type, Palette, SkipBack, SkipForward, Clock, Zap, RotateCcw } from 'lucide-react';

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
  transitionDuration: number;
  transitionIntensity: number;
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
  
  // Enhanced preview state with transition tracking
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  
  // Canvas refs for video export
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
      transitionDuration: 1.0,
      transitionIntensity: 100
    };
    setScenes([...scenes, newScene]);
    setCurrentScene(newScene);
  };

  const updateScene = (sceneId: string, updates: Partial<Scene>) => {
    const updatedScenes = scenes.map(scene => 
      scene.id === sceneId ? { ...scene, ...updates } : scene
    );
    setScenes(updatedScenes);
    
    if (currentScene?.id === sceneId) {
      setCurrentScene({ ...currentScene, ...updates });
    }
  };

  const handleImageUpload = (sceneId: string, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    updateScene(sceneId, { imageUrl });
  };

  // Preview controls
  const startPreview = () => {
    if (scenes.length === 0) return;
    setIsPlaying(true);
    setCurrentPreviewIndex(0);
    setPreviewProgress(0);
    setIsTransitioning(false);
    setTransitionProgress(0);
  };

  const stopPreview = () => {
    setIsPlaying(false);
    setPreviewProgress(0);
    setIsTransitioning(false);
    setTransitionProgress(0);
  };

  const resetPreview = () => {
    setIsPlaying(false);
    setCurrentPreviewIndex(0);
    setPreviewProgress(0);
    setIsTransitioning(false);
    setTransitionProgress(0);
  };

  const nextScene = () => {
    if (currentPreviewIndex < scenes.length - 1) {
      setCurrentPreviewIndex(currentPreviewIndex + 1);
      setPreviewProgress(0);
      setIsTransitioning(false);
      setTransitionProgress(0);
    } else {
      stopPreview();
    }
  };

  const prevScene = () => {
    if (currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
      setPreviewProgress(0);
      setIsTransitioning(false);
      setTransitionProgress(0);
    }
  };

  // Enhanced preview logic with proper transitions
  useEffect(() => {
    if (!isPlaying || scenes.length === 0) return;

    const currentSceneData = scenes[currentPreviewIndex];
    if (!currentSceneData) {
      stopPreview();
      return;
    }

    const interval = setInterval(() => {
      setPreviewProgress(prev => {
        const newProgress = prev + (100 / (currentSceneData.duration * 10));
        
        // Start transition in the last portion of the scene
        const transitionStartPoint = Math.max(70, 100 - (currentSceneData.transitionDuration / currentSceneData.duration * 100));
        
        if (newProgress >= transitionStartPoint && currentPreviewIndex < scenes.length - 1 && !isTransitioning) {
          setIsTransitioning(true);
          setTransitionProgress(0);
        }
        
        // Update transition progress
        if (isTransitioning) {
          const transitionDurationMs = currentSceneData.transitionDuration * 1000;
          const progressPerTick = 100 / (transitionDurationMs / 100);
          setTransitionProgress(prevTrans => Math.min(100, prevTrans + progressPerTick));
        }
        
        // Move to next scene when complete
        if (newProgress >= 100) {
          if (currentPreviewIndex < scenes.length - 1) {
            setCurrentPreviewIndex(currentPreviewIndex + 1);
            setIsTransitioning(false);
            setTransitionProgress(0);
            return 0;
          } else {
            stopPreview();
            return 0;
          }
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentPreviewIndex, scenes, isTransitioning]);

  // Function to get transition styles for current and next scenes
  const getTransitionStyles = (scene: Scene, isNextScene: boolean = false) => {
    if (!isTransitioning || !scene) {
      return {
        current: { opacity: 1, transform: 'scale(1) translateX(0)' },
        next: { opacity: 0, transform: 'scale(1) translateX(0)', display: 'none' }
      };
    }

    const progress = transitionProgress / 100;
    const intensity = scene.transitionIntensity / 100;

    switch (scene.transition) {
      case 'fade':
        return {
          current: { 
            opacity: isNextScene ? progress : 1 - (progress * intensity),
            transform: 'scale(1) translateX(0)',
            filter: 'blur(0px)'
          },
          next: { 
            opacity: isNextScene ? progress * intensity : 0,
            transform: 'scale(1) translateX(0)',
            filter: 'blur(0px)'
          }
        };

      case 'slide-left':
        return {
          current: { 
            opacity: 1,
            transform: isNextScene ? `translateX(0)` : `translateX(-${progress * intensity * 100}%)`,
            filter: 'blur(0px)'
          },
          next: { 
            opacity: 1,
            transform: isNextScene ? `translateX(${(1 - progress) * intensity * 100}%)` : `translateX(100%)`,
            filter: 'blur(0px)'
          }
        };

      case 'slide-right':
        return {
          current: { 
            opacity: 1,
            transform: isNextScene ? `translateX(0)` : `translateX(${progress * intensity * 100}%)`,
            filter: 'blur(0px)'
          },
          next: { 
            opacity: 1,
            transform: isNextScene ? `translateX(-${(1 - progress) * intensity * 100}%)` : `translateX(-100%)`,
            filter: 'blur(0px)'
          }
        };

      case 'zoom-in':
        const currentScale = isNextScene ? 1 : 1 + (progress * intensity * 0.5);
        const nextScale = isNextScene ? 0.5 + (progress * intensity * 0.5) : 0.5;
        return {
          current: { 
            opacity: isNextScene ? 1 : 1 - (progress * intensity * 0.7),
            transform: `scale(${currentScale})`,
            filter: 'blur(0px)'
          },
          next: { 
            opacity: isNextScene ? progress * intensity : 0,
            transform: `scale(${nextScale})`,
            filter: 'blur(0px)'
          }
        };

      case 'zoom-out':
        const currentZoomOut = isNextScene ? 1 : 1 - (progress * intensity * 0.3);
        const nextZoomOut = isNextScene ? 1.3 - (progress * intensity * 0.3) : 1.3;
        return {
          current: { 
            opacity: isNextScene ? 1 : 1 - (progress * intensity * 0.7),
            transform: `scale(${Math.max(0.1, currentZoomOut)})`,
            filter: 'blur(0px)'
          },
          next: { 
            opacity: isNextScene ? progress * intensity : 0,
            transform: `scale(${nextZoomOut})`,
            filter: 'blur(0px)'
          }
        };

      case 'dissolve':
        const blurAmount = progress * intensity * 4;
        return {
          current: { 
            opacity: isNextScene ? 1 : 1 - (progress * intensity),
            transform: 'scale(1)',
            filter: isNextScene ? 'blur(0px)' : `blur(${blurAmount}px)`
          },
          next: { 
            opacity: isNextScene ? progress * intensity : 0,
            transform: 'scale(1)',
            filter: isNextScene ? `blur(${4 - blurAmount}px)` : 'blur(4px)'
          }
        };

      default: // 'none' or cut
        return {
          current: { 
            opacity: isNextScene ? 1 : (progress > 0.5 ? 0 : 1),
            transform: 'scale(1) translateX(0)',
            filter: 'blur(0px)'
          },
          next: { 
            opacity: isNextScene ? (progress > 0.5 ? 1 : 0) : 0,
            transform: 'scale(1) translateX(0)',
            filter: 'blur(0px)'
          }
        };
    }
  };

  // Canvas-based video export function
  const exportVideoToCanvas = async () => {
    if (scenes.length === 0) {
      alert('Add at least one scene before exporting');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsExporting(true);

    try {
      // Set canvas dimensions
      canvas.width = 1080;
      canvas.height = 1920;

      const frames: string[] = [];
      const fps = 30;

      // Generate frames for each scene
      for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
        const scene = scenes[sceneIndex];
        const sceneDurationFrames = Math.ceil(scene.duration * fps);

        // Load the image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = scene.imageUrl;
        });

        // Generate frames for this scene
        for (let frame = 0; frame < sceneDurationFrames; frame++) {
          // Clear canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Draw text overlay
          if (scene.title || scene.description) {
            const x = (scene.textPosition.x / 100) * canvas.width;
            const y = (scene.textPosition.y / 100) * canvas.height;

            // Text background
            if (scene.textStyle.backgroundOpacity > 0) {
              ctx.fillStyle = scene.textStyle.backgroundColor + Math.round(scene.textStyle.backgroundOpacity * 2.55).toString(16).padStart(2, '0');
              ctx.fillRect(x - 200, y - 50, 400, 100);
            }

            // Text
            ctx.fillStyle = scene.textStyle.color;
            ctx.font = `${scene.textStyle.fontWeight} ${scene.textStyle.fontSize}px ${scene.textStyle.fontFamily}`;
            ctx.textAlign = scene.textStyle.textAlign as CanvasTextAlign;

            if (scene.title) {
              ctx.fillText(scene.title, x, y - 10);
            }
            if (scene.description) {
              ctx.font = `normal ${scene.textStyle.fontSize * 0.75}px ${scene.textStyle.fontFamily}`;
              ctx.fillText(scene.description, x, y + 30);
            }
          }

          // Capture frame
          frames.push(canvas.toDataURL('image/jpeg', 0.8));
        }
      }

      // Create a simple download of the project data for now
      // In a full implementation, you'd combine frames into video
      const projectData = {
        scenes: scenes,
        totalDuration: totalDuration,
        frames: frames.length,
        exportDate: new Date().toISOString(),
        videoSpecs: {
          width: 1080,
          height: 1920,
          fps: 30,
          format: 'MP4'
        }
      };

      // Download project JSON (frames would be too large for practical download)
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-essay-project-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      alert(`Video project exported!\n\n${frames.length} frames generated\n${scenes.length} scenes\n${totalDuration}s duration\n\nProject file downloaded. \nFor full MP4 export, integrate with video processing library.`);

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    setIsExporting(false);
  };

  // Enhanced export function that calls the API
  const exportVideo = async () => {
    if (scenes.length === 0) {
      alert('Add at least one scene before exporting');
      return;
    }

    // First try the canvas export as a fallback
    await exportVideoToCanvas();
    
    // Then try the API export
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
        console.log('API Export Analysis:', data);
      }
    } catch (error) {
      console.error('API Export failed:', error);
    }
    setIsExporting(false);
  };

  // Show the right scene in preview
  const sceneToShow = currentScene || (isPlaying ? scenes[currentPreviewIndex] : null);
  const nextSceneToShow = isPlaying && isTransitioning && currentPreviewIndex < scenes.length - 1 
    ? scenes[currentPreviewIndex + 1] 
    : null;

  const currentStyles = sceneToShow ? getTransitionStyles(sceneToShow, false) : { current: {}, next: {} };
  const nextStyles = nextSceneToShow ? getTransitionStyles(nextSceneToShow, true) : { current: {}, next: {} };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Hidden canvas for video export */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
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
                
                {/* Enhanced Preview with Working Transitions */}
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={resetPreview}
                        title="Reset Preview"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video bg-black rounded overflow-hidden">
                      {/* Current Scene with Dynamic Transitions */}
                      {sceneToShow?.imageUrl && (
                        <div 
                          className="absolute inset-0 transition-all duration-300"
                          style={{
                            ...currentStyles.current,
                            transitionDuration: isTransitioning ? `${sceneToShow.transitionDuration}s` : '0.3s'
                          }}
                        >
                          <img 
                            src={sceneToShow.imageUrl}
                            alt="Current Scene"
                            className="w-full h-full object-cover"
                          />
                          {/* Text Overlay */}
                          <div 
                            className="absolute px-4 py-2 rounded max-w-[80%] transition-all duration-300"
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
                      
                      {/* Next Scene with Transition Effects */}
                      {nextSceneToShow?.imageUrl && isTransitioning && (
                        <div 
                          className="absolute inset-0 transition-all"
                          style={{
                            ...nextStyles.next,
                            transitionDuration: `${nextSceneToShow.transitionDuration}s`
                          }}
                        >
                          <img 
                            src={nextSceneToShow.imageUrl}
                            alt="Next Scene"
                            className="w-full h-full object-cover"
                          />
                          <div 
                            className="absolute px-4 py-2 rounded max-w-[80%]"
                            style={{
                              left: `${nextSceneToShow.textPosition.x}%`,
                              top: `${nextSceneToShow.textPosition.y}%`,
                              transform: 'translate(-50%, -50%)',
                              fontSize: `${nextSceneToShow.textStyle.fontSize}px`,
                              fontFamily: nextSceneToShow.textStyle.fontFamily,
                              color: nextSceneToShow.textStyle.color,
                              backgroundColor: nextSceneToShow.textStyle.backgroundColor + Math.round(nextSceneToShow.textStyle.backgroundOpacity * 2.55).toString(16).padStart(2, '0'),
                              fontWeight: nextSceneToShow.textStyle.fontWeight,
                              textAlign: nextSceneToShow.textStyle.textAlign as any,
                              backdropFilter: nextSceneToShow.textStyle.backgroundOpacity > 0 ? 'blur(4px)' : 'none'
                            }}
                          >
                            <div className="font-bold mb-1">{nextSceneToShow.title}</div>
                            <div className="text-sm leading-tight">{nextSceneToShow.description}</div>
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
                            Transition: {sceneToShow?.transition} ({transitionProgress.toFixed(0)}% complete)
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Scene Settings - Same as before */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Content Panel */}
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

                      <div className="bg-yellow-900/20 p-3 rounded border border-yellow-600/30">
                        <div className="flex items-center mb-2">
                          <Zap className="w-4 h-4 mr-1 text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-200">Transition Settings</span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">
                              Duration: {currentScene.transitionDuration}s
                            </label>
                            <Slider
                              value={[currentScene.transitionDuration]}
                              onValueChange={([value]: number[]) => updateScene(currentScene.id, { transitionDuration: value })}
                              min={0.2}
                              max={3.0}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">
                              Intensity: {currentScene.transitionIntensity}%
                            </label>
                            <Slider
                              value={[currentScene.transitionIntensity]}
                              onValueChange={([value]: number[]) => updateScene(currentScene.id, { transitionIntensity: value })}
                              min={10}
                              max={150}
                              step={10}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Position Panel */}
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

                  {/* Text Style Panel */}
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
