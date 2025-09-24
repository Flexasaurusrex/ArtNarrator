'use client';

import React from 'react';
import { useAppStore, useSelectedScenes } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/image/ImageUploader';
import { AIImageGenerator } from '@/components/image/AIImageGenerator';
import { Plus, Trash2, Copy } from 'lucide-react';

export function SceneInspector() {
  const { 
    scenes, 
    updateScene, 
    deleteScene, 
    duplicateScene, 
    addScene,
    currentProject 
  } = useAppStore();
  
  const selectedScenes = useSelectedScenes();
  const scene = selectedScenes[0]; // Single selection for now

  const handleUpdateField = (field: string, value: any) => {
    if (scene) {
      updateScene(scene.id!, { [field]: value });
    }
  };

  const handleAddScene = () => {
    if (currentProject) {
      addScene({
        projectId: currentProject.id!,
        order: scenes.length,
        durationSec: 5,
        title: 'New Scene',
        body: '',
        credit: '',
        fx: 'none',
        safeArea: 'bottom',
      });
    }
  };

  if (!scene) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Select a scene to edit</p>
          <Button onClick={handleAddScene}>
            <Plus className="w-4 h-4 mr-2" />
            Add Scene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scene Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Scene {scene.order + 1}</CardTitle>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => duplicateScene(scene.id!)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => deleteScene(scene.id!)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[scene.durationSec]}
                onValueChange={([value]) => handleUpdateField('durationSec', value)}
                min={0.5}
                max={15}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm w-12">{scene.durationSec.toFixed(1)}s</span>
            </div>
          </div>

          {/* Effect */}
          <div className="space-y-2">
            <Label>Effect</Label>
            <Select value={scene.fx} onValueChange={(value) => handleUpdateField('fx', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="kenburns_slow">Ken Burns Slow</SelectItem>
                <SelectItem value="kenburns_medium">Ken Burns Medium</SelectItem>
                <SelectItem value="pan_right">Pan Right</SelectItem>
                <SelectItem value="pan_left">Pan Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Safe Area */}
          <div className="space-y-2">
            <Label>Text Safe Area</Label>
            <Select value={scene.safeArea} onValueChange={(value) => handleUpdateField('safeArea', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            currentUrl={scene.imageUrl}
            onImageSelected={(url) => handleUpdateField('imageUrl', url)}
          />
          
          <div className="mt-4">
            <AIImageGenerator
              onImageGenerated={(url) => handleUpdateField('imageUrl', url)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Text Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Narration Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={scene.title}
              onChange={(e) => handleUpdateField('title', e.target.value)}
              placeholder="Scene title..."
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea
              value={scene.body}
              onChange={(e) => handleUpdateField('body', e.target.value)}
              placeholder="Main narration text..."
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label>Credit</Label>
            <Input
              value={scene.credit}
              onChange={(e) => handleUpdateField('credit', e.target.value)}
              placeholder="Image credit or attribution..."
              maxLength={200}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
