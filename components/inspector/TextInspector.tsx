'use client';

import React from 'react';
import { useAppStore, useSelectedScenes } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Palette, Eye, AlertTriangle } from 'lucide-react';

export function TextInspector() {
  const { 
    textStyles, 
    addTextStyle, 
    updateTextStyle, 
    currentProject 
  } = useAppStore();
  
  const selectedScenes = useSelectedScenes();
  const scene = selectedScenes[0];
  
  // Get current text style
  const currentStyle = scene?.textStyleId 
    ? textStyles.find(ts => ts.id === scene.textStyleId)
    : textStyles[0];

  const handleUpdateStyle = (field: string, value: any) => {
    if (currentStyle) {
      updateTextStyle(currentStyle.id!, { [field]: value });
    }
  };

  const handleCreateStyle = () => {
    if (currentProject) {
      addTextStyle({
        projectId: currentProject.id!,
        name: `Style ${textStyles.length + 1}`,
        titleFont: 'Inter',
        bodyFont: 'Inter',
        titleSize: 64,
        bodySize: 44,
        weight: '600',
        align: 'left',
        shadow: 0.4,
        outline: 2,
        color: '#ffffff',
        bgBlur: 0,
        bgOpacity: 0,
        padding: 32,
      });
    }
  };

  // Contrast calculation (simplified)
  const getContrastRatio = (color: string) => {
    // This is a simplified contrast calculation
    // In production, use a proper color contrast library
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? 'AAA' : 'AA'; // Simplified rating
  };

  if (!currentStyle) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No text style selected</p>
          <Button onClick={handleCreateStyle}>
            <Palette className="w-4 h-4 mr-2" />
            Create Style
          </Button>
        </div>
      </div>
    );
  }

  const contrastRating = getContrastRatio(currentStyle.color);

  return (
    <div className="space-y-4">
      {/* Style Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Text Style</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCreateStyle}>
              <Palette className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Select 
            value={currentStyle.id} 
            onValueChange={(styleId) => {
              // Apply style to selected scene
              if (scene) {
                useAppStore.getState().updateScene(scene.id!, { textStyleId: styleId });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {textStyles.map(style => (
                <SelectItem key={style.id} value={style.id!}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title Font</Label>
              <Select value={currentStyle.titleFont} onValueChange={(value) => handleUpdateStyle('titleFont', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Source Serif Pro">Source Serif Pro</SelectItem>
                  <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select value={currentStyle.bodyFont} onValueChange={(value) => handleUpdateStyle('bodyFont', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Source Serif Pro">Source Serif Pro</SelectItem>
                  <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title Size</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[currentStyle.titleSize]}
                  onValueChange={([value]) => handleUpdateStyle('titleSize', value)}
                  min={28}
                  max={120}
                  step={4}
                  className="flex-1"
                />
                <span className="text-sm w-10">{currentStyle.titleSize}px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Body Size</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[currentStyle.bodySize]}
                  onValueChange={([value]) => handleUpdateStyle('bodySize', value)}
                  min={16}
                  max={80}
                  step={2}
                  className="flex-1"
                />
                <span className="text-sm w-10">{currentStyle.bodySize}px</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Font Weight</Label>
            <Select value={currentStyle.weight} onValueChange={(value) => handleUpdateStyle('weight', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="600">Semi Bold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
                <SelectItem value="800">Extra Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <Select value={currentStyle.align} onValueChange={(value) => handleUpdateStyle('align', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visual Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Visual Effects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={currentStyle.color}
                onChange={(e) => handleUpdateStyle('color', e.target.value)}
                className="w-12 h-10 p-1 rounded"
              />
              <Input
                value={currentStyle.color}
                onChange={(e) => handleUpdateStyle('color', e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
              <Badge variant={contrastRating === 'AAA' ? 'default' : 'secondary'}>
                {contrastRating}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Text Shadow</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[currentStyle.shadow]}
                onValueChange={([value]) => handleUpdateStyle('shadow', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm w-12">{Math.round(currentStyle.shadow * 100)}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Text Outline</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[currentStyle.outline]}
                onValueChange={([value]) => handleUpdateStyle('outline', value)}
                min={0}
                max={8}
                step={1}
                className="flex-1"
              />
              <span className="text-sm w-12">{currentStyle.outline}px</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Blur</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[currentStyle.bgBlur]}
                onValueChange={([value]) => handleUpdateStyle('bgBlur', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm w-12">{Math.round(currentStyle.bgBlur * 100)}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Opacity</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[currentStyle.bgOpacity]}
                onValueChange={([value]) => handleUpdateStyle('bgOpacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm w-12">{Math.round(currentStyle.bgOpacity * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Check */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Contrast Ratio</span>
              <Badge variant={contrastRating === 'AAA' ? 'default' : 'secondary'}>
                {contrastRating}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Minimum Font Size</span>
              <Badge variant={currentStyle.bodySize >= 28 ? 'default' : 'destructive'}>
                {currentStyle.bodySize >= 28 ? '✓' : '✗'}
              </Badge>
            </div>
            
            {(contrastRating !== 'AAA' || currentStyle.bodySize < 28) && (
              <div className="flex items-start space-x-2 p-2 bg-muted rounded">
                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  Consider improving contrast or increasing font size for better accessibility.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
