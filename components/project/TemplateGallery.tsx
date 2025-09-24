'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Template, Sparkles, Film, Type, Palette } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  aspect: string;
  category: 'cinematic' | 'educational' | 'social' | 'documentary';
  scenes: any[];
  textStyle: any;
  thumbnail?: string;
}

const templates: Template[] = [
  {
    id: 'cinematic-minimal',
    name: 'Cinematic Minimal',
    description: 'Clean, modern aesthetic with subtle animations',
    aspect: '1920x1080',
    category: 'cinematic',
    scenes: [
      {
        order: 0,
        durationSec: 6,
        title: 'Opening Title',
        body: 'Your story begins here...',
        fx: 'kenburns_slow',
        safeArea: 'bottom',
      },
      {
        order: 1,
        durationSec: 8,
        title: 'Main Content',
        body: 'Add your compelling narrative here.',
        fx: 'fade',
        safeArea: 'bottom',
      },
      {
        order: 2,
        durationSec: 5,
        title: 'Closing',
        body: 'Thank you for watching.',
        fx: 'kenburns_medium',
        safeArea: 'bottom',
      },
    ],
    textStyle: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleSize: 64,
      bodySize: 36,
      weight: '600',
      align: 'center',
      shadow: 0.3,
      outline: 1,
      color: '#ffffff',
    },
  },
  {
    id: 'archive-essay',
    name: 'Archive Essay',
    description: 'Documentary-style with serif typography',
    aspect: '1920x1080',
    category: 'documentary',
    scenes: [
      {
        order: 0,
        durationSec: 7,
        title: 'Historical Context',
        body: 'In the beginning, there was...',
        fx: 'fade',
        safeArea: 'top',
      },
      {
        order: 1,
        durationSec: 10,
        title: 'The Story Unfolds',
        body: 'Through archival footage and testimony, we discover...',
        fx: 'pan_right',
        safeArea: 'bottom',
      },
    ],
    textStyle: {
      titleFont: 'Source Serif Pro',
      bodyFont: 'Source Serif Pro',
      titleSize: 56,
      bodySize: 32,
      weight: '700',
      align: 'left',
      shadow: 0.5,
      outline: 2,
      color: '#ffffff',
    },
  },
  {
    id: 'gallery-wall',
    name: 'Gallery Wall',
    description: 'Art-focused with elegant transitions',
    aspect: '1080x1080',
    category: 'cinematic',
    scenes: [
      {
        order: 0,
        durationSec: 5,
        title: 'Featured Work',
        body: '',
        credit: 'Artist Name, Year',
        fx: 'kenburns_slow',
        safeArea: 'bottom',
      },
      {
        order: 1,
        durationSec: 6,
        title: 'Artist Statement',
        body: 'This piece explores the intersection of...',
        fx: 'fade',
        safeArea: 'top',
      },
    ],
    textStyle: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleSize: 48,
      bodySize: 28,
      weight: '500',
      align: 'left',
      shadow: 0.4,
      outline: 1,
      color: '#ffffff',
      bgOpacity: 0.1,
      bgBlur: 0.3,
    },
  },
  {
    id: 'magazine-cutout',
    name: 'Magazine Cutout',
    description: 'Bold, editorial-style layouts',
    aspect: '1080x1920',
    category: 'social',
    scenes: [
      {
        order: 0,
        durationSec: 4,
        title: 'TRENDING NOW',
        body: 'The latest in design and culture',
        fx: 'pan_left',
        safeArea: 'top',
      },
      {
        order: 1,
        durationSec: 5,
        title: 'DEEP DIVE',
        body: 'Exploring the details that matter',
        fx: 'kenburns_medium',
        safeArea: 'bottom',
      },
    ],
    textStyle: {
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleSize: 72,
      bodySize: 40,
      weight: '800',
      align: 'center',
      shadow: 0.2,
      outline: 3,
      color: '#ffffff',
    },
  },
];

export function TemplateGallery() {
  const { 
    setProject,
    setScenes, 
    setTextStyles,
    addScene,
    addTextStyle,
    currentProject 
  } = useAppStore();

  const getCategoryIcon = (category: Template['category']) => {
    switch (category) {
      case 'cinematic':
        return <Film className="w-4 h-4" />;
      case 'documentary':
        return <Sparkles className="w-4 h-4" />;
      case 'social':
        return <Type className="w-4 h-4" />;
      default:
        return <Template className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Template['category']) => {
    switch (category) {
      case 'cinematic':
        return 'bg-blue-500/10 text-blue-500';
      case 'documentary':
        return 'bg-amber-500/10 text-amber-500';
      case 'social':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const applyTemplate = async (template: Template) => {
    try {
      // Create new project with template settings
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${template.name} Project`,
          aspect: template.aspect,
          fps: 30,
          bgColor: '#000000',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const project = data.data;
        setProject(project);

        // Create text style
        const textStyleResponse = await fetch('/api/text-styles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...template.textStyle,
            projectId: project.id,
            name: `${template.name} Style`,
          }),
        });

        const textStyleData = await textStyleResponse.json();
        let textStyleId = null;

        if (textStyleData.success) {
          textStyleId = textStyleData.data.id;
          addTextStyle(textStyleData.data);
        }

        // Create scenes
        for (const sceneTemplate of template.scenes) {
          const sceneResponse = await fetch('/api/scenes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...sceneTemplate,
              projectId: project.id,
              textStyleId,
            }),
          });

          const sceneData = await sceneResponse.json();
          if (sceneData.success) {
            addScene(sceneData.data);
          }
        }
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {templates.map((template) => (
        <Card 
          key={template.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => applyTemplate(template)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {template.description}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getCategoryColor(template.category)}`}
                  >
                    {getCategoryIcon(template.category)}
                    <span className="ml-1 capitalize">{template.category}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {template.scenes.length} scenes
                  </span>
                </div>
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
