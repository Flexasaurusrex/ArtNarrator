'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Play, Pause, Image, Type, Palette, SkipBack, SkipForward, Clock, Zap, RotateCcw, Monitor, Smartphone } from 'lucide-react';

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

const ORIENTATIONS = [
  { value: 'vertical', label: 'Vertical (9:16)', width: 1080, height: 1920 },
  { value: 'horizontal', label: 'Horizontal (16:9)', width: 1920, height: 1080 },
  { value: 'square', label: 'Square (1:1)', width: 1080, height: 1080 }
];

export default function SimpleVideoCreator() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [orientation, setOrientation] = useState('vertical');
  
  // Fixed preview state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  
  // Video recording and conversion
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Export state
  const [showConversionHelper, setShowConversionHelper] = useState(false);
  
  // Overall video duration
  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

  // Get current orientation settings
  const currentOrientation = ORIENTATIONS.find(o => o.value === orientation) || ORIENTATIONS[0];

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

  // Simple preview controls
  const startPreview = () => {
    if (scenes.length === 0) return;
    setIsPlaying(true);
    setCurrentPreviewIndex(0);
    setPreviewProgress(0);
    setShowTransition(false);
  };

  const stopPreview = () => {
    setIsPlaying(false);
    setPreviewProgress(0);
    setShowTransition(false);
  };

  const resetPreview = () => {
    setIsPlaying(false);
    setCurrentPreviewIndex(0);
    setPreviewProgress(0);
    setShowTransition(false);
  };

  const nextScene = () => {
    if (currentPreviewIndex < scenes.length - 1) {
      setCurrentPreviewIndex(currentPreviewIndex + 1);
      setPreviewProgress(0);
      setShowTransition(false);
    } else {
      stopPreview();
    }
  };

  const prevScene = () => {
    if (currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
      setPreviewProgress(0);
      setShowTransition(false);
    }
  };

  // FIXED: Working preview logic with transitions
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
        
        // Show transition effect near the end
        if (newProgress > 85 && currentPreviewIndex < scenes.length - 1) {
          setShowTransition(true);
        }
        
        // Move to next scene when complete
        if (newProgress >= 100) {
          if (currentPreviewIndex < scenes.length - 1) {
            setCurrentPreviewIndex(currentPreviewIndex + 1);
            setShowTransition(false);
            return 0;
          } else {
            // End of video
            setIsPlaying(false);
            setCurrentPreviewIndex(0);
            setShowTransition(false);
            return 0;
          }
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentPreviewIndex, scenes]);

  // Function to get simple transition styles
  const getTransitionClass = (scene: Scene, isNext: boolean = false) => {
    if (!showTransition || !scene) {
      return isNext ? 'opacity-0' : 'opacity-100';
    }

    const intensity = scene.transitionIntensity / 100;

    switch (scene.transition) {
      case 'fade':
        return isNext ? 'opacity-70' : 'opacity-70';
      case 'slide-left':
        return isNext ? 'translate-x-8 opacity-80' : '-translate-x-2 opacity-90';
      case 'slide-right':
        return isNext ? '-translate-x-8 opacity-80' : 'translate-x-2 opacity-90';
      case 'zoom-in':
        return isNext ? 'scale-110 opacity-60' : 'scale-105 opacity-80';
      case 'zoom-out':
        return isNext ? 'scale-90 opacity-60' : 'scale-95 opacity-80';
      case 'dissolve':
        return isNext ? 'blur-sm opacity-60' : 'blur-sm opacity-80';
      default:
        return isNext ? 'opacity-0' : 'opacity-100';
    }
  };

  // Simple, reliable export without conversion
  const exportVideo = async () => {
  const exportVideo = async () => {
    if (scenes.length === 0) {
      alert('Add at least one scene before exporting');
      return;
    }

    const scenesWithImages = scenes.filter(scene => scene.imageUrl);
    if (scenesWithImages.length === 0) {
      alert('Add images to your scenes before exporting');
      return;
    }

    setIsExporting(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not available');
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Cannot get canvas context');
      }

      // Set up canvas with correct dimensions
      canvas.width = currentOrientation.width;
      canvas.height = currentOrientation.height;

      // Set up MediaRecorder with correct dimensions
      const stream = canvas.captureStream(30); // 30 FPS
      chunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const webmBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Download WebM file
        const url = URL.createObjectURL(webmBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-essay-${orientation}-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        setShowConversionHelper(true);
      };

      // Start recording
      mediaRecorderRef.current.start();

      // Render each scene
      for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
        const scene = scenes[sceneIndex];
        
        if (!scene.imageUrl) continue;

        // Load image
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = scene.imageUrl;
        });

        // Render scene for its duration
        const frameDuration = 1000 / 30; // 30 FPS
        const totalFrames = Math.ceil(scene.duration * 30);

        for (let frame = 0; frame < totalFrames; frame++) {
          // Clear canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image to fit canvas dimensions while maintaining aspect ratio
          const imgAspect = img.width / img.height;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspect > canvasAspect) {
            // Image is wider, fit to height
            drawHeight = canvas.height;
            drawWidth = drawHeight * imgAspect;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          } else {
            // Image is taller, fit to width
            drawWidth = canvas.width;
            drawHeight = drawWidth / imgAspect;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          // Draw text overlay
          if (scene.title || scene.description) {
            const x = (scene.textPosition.x / 100) * canvas.width;
            const y = (scene.textPosition.y / 100) * canvas.height;

            // Scale font size based on canvas size
            const scaleFactor = Math.min(canvas.width / 1080, canvas.height / 1920);
            const scaledFontSize = scene.textStyle.fontSize * scaleFactor;

            // Text background
            if (scene.textStyle.backgroundOpacity > 0) {
              const alpha = scene.textStyle.backgroundOpacity / 100;
              ctx.fillStyle = scene.textStyle.backgroundColor + Math.round(alpha * 255).toString(16).padStart(2, '0');
              
              // Measure text to size background
              ctx.font = `${scene.textStyle.fontWeight} ${scaledFontSize}px ${scene.textStyle.fontFamily}`;
              const titleWidth = scene.title ? ctx.measureText(scene.title).width : 0;
              const descWidth = scene.description ? ctx.measureText(scene.description).width : 0;
              const maxWidth = Math.max(titleWidth, descWidth);
              
              ctx.fillRect(x - maxWidth/2 - 20, y - 40 * scaleFactor, maxWidth + 40, 80 * scaleFactor);
            }

            // Draw text
            ctx.fillStyle = scene.textStyle.color;
            ctx.textAlign = scene.textStyle.textAlign as CanvasTextAlign;

            if (scene.title) {
              ctx.font = `${scene.textStyle.fontWeight} ${scaledFontSize}px ${scene.textStyle.fontFamily}`;
              ctx.fillText(scene.title, x, y - 10 * scaleFactor);
            }
            
            if (scene.description) {
              ctx.font = `normal ${scaledFontSize * 0.75}px ${scene.textStyle.fontFamily}`;
              ctx.fillText(scene.description, x, y + 25 * scaleFactor);
            }
          }

          // Wait for frame duration
          await new Promise(resolve => setTimeout(resolve, frameDuration));
        }
      }

      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExporting(false);
    }
  };

  // Show the right scene in preview
  const sceneToShow = currentScene || (isPlaying ? scenes[currentPreviewIndex] : null);
  const nextSceneToShow = isPlaying && showTransition && currentPreviewIndex < scenes.length - 1 
    ? scenes[currentPreviewIndex + 1] 
    : null;

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
              <div className="flex items-center gap-4 mt-1">
                <p className="text-gray-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Total duration: {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toFixed(0).padStart(2, '0')}
                </p>
                <p className="text-gray-400 flex items-center">
                  {orientation === 'vertical' && <Smartphone className="w-4 h-4 mr-1" />}
                  {orientation === 'horizontal' && <Monitor className="w-4 h-4 mr-1" />}
                  {orientation === 'square' && <div className="w-4 h-4 mr-1 border border-gray-400 rounded" />}
                  {currentOrientation.label}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Select value={orientation} onValueChange={setOrientation}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600">
                <SelectValue placeholder="Select orientation" />
              </SelectTrigger>
              <SelectContent>
                {ORIENTATIONS.map(orient => (
                  <SelectItem key={orient.value} value={orient.value}>
                    {orient.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isExporting ? 'Recording Video...' : 'Export Video'}
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
                
                {/* FIXED: Working Preview with Transitions */}
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
                    <div 
                      className="relative bg-black rounded overflow-hidden mx-auto"
                      style={{
                        aspectRatio: orientation === 'vertical' ? '9/16' : 
                                   orientation === 'horizontal' ? '16/9' : '1/1',
                        maxHeight: '400px'
                      }}
                    >
                      {/* Current Scene */}
                      {sceneToShow?.imageUrl && (
                        <div className={`absolute inset-0 transition-all duration-1000 ${getTransitionClass(sceneToShow, false)}`}>
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
                      
                      {/* Next Scene (transition preview) */}
                      {nextSceneToShow?.imageUrl && showTransition && (
                        <div className={`absolute inset-0 transition-all duration-1000 ${getTransitionClass(nextSceneToShow, true)}`}>
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
                        {showTransition && (
                          <div className="text-center text-yellow-400 text-sm">
                            Transitioning ({sceneToShow?.transition})...
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Scene Settings */}
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
        
        {/* Conversion Helper Modal */}
        {showConversionHelper && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg mx-4 bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-200">Video Exported Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Your video has been saved as a WebM file. To share on social media, you'll need to convert it to MP4:
                </p>
                
                <div className="bg-gray-700 p-4 rounded space-y-3">
                  <h4 className="font-medium text-gray-200">Quick Conversion Options:</h4>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => window.open('https://cloudconvert.com/webm-to-mp4', '_blank')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Convert with CloudConvert (Free)
                    </Button>
                    
                    <Button 
                      onClick={() => window.open('https://convertio.co/webm-mp4/', '_blank')}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Convert with Convertio (Free)
                    </Button>
                    
                    <Button 
                      onClick={() => window.open('https://www.freeconvert.com/webm-to-mp4', '_blank')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Convert with FreeConvert (Free)
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400">
                  <p><strong>Steps:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Click one of the conversion links above</li>
                    <li>Upload your WebM file</li>
                    <li>Convert to MP4</li>
                    <li>Download and share on social media!</li>
                  </ol>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowConversionHelper(false)}
                    className="flex-1"
                    variant="outline"
                  >
                    Got it, thanks!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
