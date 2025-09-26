'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Play, Pause, SkipForward, RotateCcw, Download, Monitor, Smartphone, Square, ExternalLink } from 'lucide-react';

interface Scene {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  duration: number;
  transition: 'fade' | 'slide-left' | 'slide-right' | 'zoom-in' | 'zoom-out' | 'dissolve' | 'cut';
  transitionDuration: number;
  transitionIntensity: number;
  textStyle: {
    fontSize: number;
    color: string;
    position: { x: number; y: number };
    opacity: number;
  };
}

type Orientation = 'vertical' | 'horizontal' | 'square';

const orientationConfig = {
  vertical: { width: 1080, height: 1920, ratio: '9:16', icon: Smartphone },
  horizontal: { width: 1920, height: 1080, ratio: '16:9', icon: Monitor },
  square: { width: 1080, height: 1080, ratio: '1:1', icon: Square }
};

export default function SimpleVideoCreator() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  const [orientation, setOrientation] = useState<Orientation>('vertical');
  const [showConversionHelp, setShowConversionHelp] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const createNewScene = (): Scene => ({
    id: Date.now().toString(),
    title: '',
    description: '',
    duration: 3,
    transition: 'fade',
    transitionDuration: 0.5,
    transitionIntensity: 50,
    textStyle: {
      fontSize: 48,
      color: '#ffffff',
      position: { x: 50, y: 80 },
      opacity: 100
    }
  });

  const addScene = () => {
    const newScene = createNewScene();
    setScenes(prev => [...prev, newScene]);
    setCurrentScene(newScene);
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(scene => 
      scene.id === id ? { ...scene, ...updates } : scene
    ));
    if (currentScene?.id === id) {
      setCurrentScene(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteScene = (id: string) => {
    setScenes(prev => prev.filter(scene => scene.id !== id));
    if (currentScene?.id === id) {
      setCurrentScene(null);
    }
  };

  const handleImageUpload = (sceneId: string, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    updateScene(sceneId, { imageUrl });
  };

  // Simple, reliable preview logic
  useEffect(() => {
    if (!isPlaying || scenes.length === 0) return;

    const currentSceneData = scenes[currentPreviewIndex];
    if (!currentSceneData) return;

    const interval = setInterval(() => {
      setPreviewProgress(prev => {
        if (prev >= 100) {
          // Move to next scene or stop
          if (currentPreviewIndex < scenes.length - 1) {
            setCurrentPreviewIndex(currentPreviewIndex + 1);
            setPreviewProgress(0);
          } else {
            setIsPlaying(false);
            setPreviewProgress(0);
            setCurrentPreviewIndex(0);
          }
          return 0;
        }
        return prev + (100 / (currentSceneData.duration * 10));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentPreviewIndex, scenes]);

  const resetPreview = () => {
    setIsPlaying(false);
    setCurrentPreviewIndex(0);
    setPreviewProgress(0);
  };

  const skipToScene = (index: number) => {
    setCurrentPreviewIndex(index);
    setPreviewProgress(0);
  };

  // Simplified preview scene selection
  const sceneToShow = currentScene || scenes[currentPreviewIndex] || null;

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

  const getTransitionClass = (transition: string, isActive: boolean) => {
    if (!isActive) return '';
    
    switch (transition) {
      case 'fade': return 'transition-opacity duration-500';
      case 'slide-left': return 'transform transition-transform duration-500 -translate-x-full';
      case 'slide-right': return 'transform transition-transform duration-500 translate-x-full';
      case 'zoom-in': return 'transform transition-transform duration-500 scale-150';
      case 'zoom-out': return 'transform transition-transform duration-500 scale-50';
      case 'dissolve': return 'filter transition-all duration-500 blur-sm opacity-70';
      default: return '';
    }
  };

  const exportVideo = async () => {
    if (scenes.length === 0) {
      alert('No scenes to export!');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = orientationConfig[orientation];
    canvas.width = config.width;
    canvas.height = config.height;

    try {
      // Set up MediaRecorder for WebM
      const stream = canvas.captureStream(30); // 30 FPS
      chunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-essay-${orientation}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show conversion helper
        setShowConversionHelp(true);
      };

      // Start recording
      mediaRecorderRef.current.start();

      // Render each scene
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        await renderSceneToCanvas(ctx, scene, config.width, config.height);
        
        // Wait for scene duration
        await new Promise(resolve => setTimeout(resolve, scene.duration * 1000));
      }

      // Stop recording
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  const renderSceneToCanvas = async (ctx: CanvasRenderingContext2D, scene: Scene, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Render image if available
    if (scene.imageUrl) {
      try {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = scene.imageUrl!;
        });

        // Calculate image dimensions to fit canvas while maintaining aspect ratio
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        
        let drawWidth = width;
        let drawHeight = height;
        let drawX = 0;
        let drawY = 0;

        if (imgAspect > canvasAspect) {
          // Image is wider - fit to height
          drawHeight = height;
          drawWidth = height * imgAspect;
          drawX = (width - drawWidth) / 2;
        } else {
          // Image is taller - fit to width
          drawWidth = width;
          drawHeight = width / imgAspect;
          drawY = (height - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    }

    // Render text overlay
    if (scene.title || scene.description) {
      const fontSize = Math.floor(scene.textStyle.fontSize * (width / 1080)); // Scale font size
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = scene.textStyle.color;
      ctx.globalAlpha = scene.textStyle.opacity / 100;

      const textX = (scene.textStyle.position.x / 100) * width;
      const textY = (scene.textStyle.position.y / 100) * height;

      // Add text shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      if (scene.title) {
        ctx.fillText(scene.title, textX, textY);
      }
      if (scene.description) {
        ctx.fillText(scene.description, textX, textY + fontSize + 10);
      }

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.globalAlpha = 1;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">ArtNarrator Video Creator</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Orientation:</span>
                <Select value={orientation} onValueChange={(value: Orientation) => setOrientation(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(orientationConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{config.ratio}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{scenes.length} scenes</span>
            <span>{totalDuration.toFixed(1)}s total</span>
            <span>{orientationConfig[orientation].width}×{orientationConfig[orientation].height}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenes Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Scenes
                  <Button onClick={addScene} size="sm">Add Scene</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      currentScene?.id === scene.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentScene(scene)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Scene {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScene(scene.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>{scene.title || 'Untitled'}</div>
                      <div>{scene.duration}s • {scene.transition}</div>
                      {scene.imageUrl && <div className="text-green-600">✓ Image</div>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative bg-black rounded-lg mb-4 overflow-hidden"
                  style={{
                    aspectRatio: orientation === 'vertical' ? '9/16' : 
                               orientation === 'horizontal' ? '16/9' : '1/1'
                  }}
                >
                  {sceneToShow ? (
                    <div className="relative w-full h-full">
                      {sceneToShow.imageUrl && (
                        <img
                          src={sceneToShow.imageUrl}
                          alt="Scene"
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Text Overlay */}
                      <div
                        className="absolute transition-all duration-300"
                        style={{
                          left: `${sceneToShow.textStyle.position.x}%`,
                          top: `${sceneToShow.textStyle.position.y}%`,
                          fontSize: `${Math.max(12, sceneToShow.textStyle.fontSize * 0.3)}px`,
                          color: sceneToShow.textStyle.color,
                          opacity: sceneToShow.textStyle.opacity / 100,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                          transform: 'translate(-50%, -50%)',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          maxWidth: '80%',
                          wordWrap: 'break-word'
                        }}
                      >
                        {sceneToShow.title && <div>{sceneToShow.title}</div>}
                        {sceneToShow.description && <div className="mt-1">{sceneToShow.description}</div>}
                      </div>

                      {/* Progress Bar */}
                      {isPlaying && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                          <div
                            className="h-full bg-blue-500 transition-all duration-100"
                            style={{ width: `${previewProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Select or add a scene to preview
                    </div>
                  )}
                </div>

                {/* Preview Controls */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={scenes.length === 0}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => skipToScene(Math.min(currentPreviewIndex + 1, scenes.length - 1))}
                    disabled={scenes.length === 0 || currentPreviewIndex >= scenes.length - 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetPreview}
                    disabled={scenes.length === 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Scene Navigation */}
                {scenes.length > 0 && (
                  <div className="grid grid-cols-5 gap-1">
                    {scenes.map((_, index) => (
                      <Button
                        key={index}
                        variant={currentPreviewIndex === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => skipToScene(index)}
                        className="text-xs p-1"
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-1">
            {currentScene ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Scene</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Image</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {currentScene.imageUrl ? 'Change Image' : 'Upload Image'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(currentScene.id, file);
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={currentScene.title}
                      onChange={(e) => updateScene(currentScene.id, { title: e.target.value })}
                      placeholder="Enter scene title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={currentScene.description}
                      onChange={(e) => updateScene(currentScene.id, { description: e.target.value })}
                      placeholder="Enter scene description"
                      rows={3}
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration: {currentScene.duration}s</label>
                    <Slider
                      value={[currentScene.duration]}
                      onValueChange={([value]) => updateScene(currentScene.id, { duration: value })}
                      min={1}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Text Styling */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Text Styling</h4>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Size: {currentScene.textStyle.fontSize}px</label>
                      <Slider
                        value={[currentScene.textStyle.fontSize]}
                        onValueChange={([value]) => updateScene(currentScene.id, { 
                          textStyle: { ...currentScene.textStyle, fontSize: value }
                        })}
                        min={20}
                        max={120}
                        step={2}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <input
                        type="color"
                        value={currentScene.textStyle.color}
                        onChange={(e) => updateScene(currentScene.id, {
                          textStyle: { ...currentScene.textStyle, color: e.target.value }
                        })}
                        className="w-full h-10 rounded border"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Horizontal Position: {currentScene.textStyle.position.x}%</label>
                      <Slider
                        value={[currentScene.textStyle.position.x]}
                        onValueChange={([value]) => updateScene(currentScene.id, {
                          textStyle: { 
                            ...currentScene.textStyle, 
                            position: { ...currentScene.textStyle.position, x: value }
                          }
                        })}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Vertical Position: {currentScene.textStyle.position.y}%</label>
                      <Slider
                        value={[currentScene.textStyle.position.y]}
                        onValueChange={([value]) => updateScene(currentScene.id, {
                          textStyle: { 
                            ...currentScene.textStyle, 
                            position: { ...currentScene.textStyle.position, y: value }
                          }
                        })}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Opacity: {currentScene.textStyle.opacity}%</label>
                      <Slider
                        value={[currentScene.textStyle.opacity]}
                        onValueChange={([value]) => updateScene(currentScene.id, {
                          textStyle: { ...currentScene.textStyle, opacity: value }
                        })}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Transition Settings */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Transition</h4>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Effect</label>
                      <Select
                        value={currentScene.transition}
                        onValueChange={(value: Scene['transition']) => updateScene(currentScene.id, { transition: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fade">Fade</SelectItem>
                          <SelectItem value="slide-left">Slide Left</SelectItem>
                          <SelectItem value="slide-right">Slide Right</SelectItem>
                          <SelectItem value="zoom-in">Zoom In</SelectItem>
                          <SelectItem value="zoom-out">Zoom Out</SelectItem>
                          <SelectItem value="dissolve">Dissolve</SelectItem>
                          <SelectItem value="cut">Cut</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Duration: {currentScene.transitionDuration}s</label>
                      <Slider
                        value={[currentScene.transitionDuration]}
                        onValueChange={([value]) => updateScene(currentScene.id, { transitionDuration: value })}
                        min={0.1}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Intensity: {currentScene.transitionIntensity}%</label>
                      <Slider
                        value={[currentScene.transitionIntensity]}
                        onValueChange={([value]) => updateScene(currentScene.id, { transitionIntensity: value })}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64 text-gray-500">
                  Select a scene to edit
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <div>Ready to export: {scenes.filter(s => s.imageUrl).length} scenes with images</div>
                  <div>Total duration: {totalDuration.toFixed(1)}s • Format: {orientationConfig[orientation].ratio} • Quality: WebM</div>
                </div>
                <Button 
                  onClick={exportVideo}
                  disabled={scenes.length === 0 || scenes.filter(s => s.imageUrl).length === 0}
                  className="min-w-32"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hidden Canvas for Video Rendering */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
          width={orientationConfig[orientation].width}
          height={orientationConfig[orientation].height}
        />

        {/* Conversion Helper Modal */}
        <Dialog open={showConversionHelp} onOpenChange={setShowConversionHelp}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Convert to MP4 for Social Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your WebM video has been exported! To upload to social media platforms like X, Instagram, or TikTok, 
                you'll need to convert it to MP4 format.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium">Free Conversion Services:</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open('https://cloudconvert.com/webm-to-mp4', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    CloudConvert (Recommended)
                  </Button>
                  <Button
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('https://convertio.co/webm-mp4/', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Convertio
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start" 
                    onClick={() => window.open('https://www.freeconvert.com/webm-to-mp4', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    FreeConvert
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <strong>How to convert:</strong>
                <ol className="mt-1 space-y-1 ml-4 list-decimal">
                  <li>Click one of the services above</li>
                  <li>Upload your downloaded WebM file</li>
                  <li>Convert to MP4</li>
                  <li>Download the MP4 file</li>
                  <li>Upload to social media!</li>
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
