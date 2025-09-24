import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Sparkles, Layout, Type } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { ProjectExport } from '@/lib/schemas';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'video-essay' | 'social-media' | 'presentation' | 'documentary';
  preview: string;
  icon: React.ComponentType<any>;
  data: ProjectExport;
}

const templates: Template[] = [
  {
    id: 'modern-essay',
    name: 'Modern Video Essay',
    description: 'Clean typography with cinematic transitions',
    category: 'video-essay',
    preview: '/templates/modern-essay.jpg',
    icon: Film,
    data: {
      project: {
        title: 'Modern Video Essay',
        aspect: '1920x1080',
        fps: 30,
        bgColor: '#000000'
      },
      scenes: [
        {
          projectId: '',
          order: 0,
          durationSec: 5,
          title: 'Introduction',
          body: 'Welcome to the modern age of storytelling.',
          credit: '',
          fx: 'kenburns_slow',
          safeArea: 'bottom',
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176'
        }
      ],
      textStyles: [
        {
          projectId: '',
          name: 'Modern Clean',
          titleFont: 'Inter',
          bodyFont: 'Inter',
          titleSize: 64,
          bodySize: 36,
          weight: '600',
          align: 'left',
          shadow: 0.3,
          outline: 2,
          color: '#ffffff',
          bgBlur: 0,
          bgOpacity: 0,
          padding: 32
        }
      ],
      musicTracks: []
    }
  },
  {
    id: 'social-portrait',
    name: 'Social Media Portrait',
    description: 'Vertical format optimized for mobile',
    category: 'social-media',
    preview: '/templates/social-portrait.jpg',
    icon: Sparkles,
    data: {
      project: {
        title: 'Social Media Portrait',
        aspect: '1080x1920',
        fps: 30,
        bgColor: '#1a1a1a'
      },
      scenes: [
        {
          projectId: '',
          order: 0,
          durationSec: 3,
          title: 'Quick Hook',
          body: 'Grab attention in the first 3 seconds',
          credit: '',
          fx: 'fade',
          safeArea: 'top',
          imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71'
        }
      ],
      textStyles: [
        {
          projectId: '',
          name: 'Bold Mobile',
          titleFont: 'Inter',
          bodyFont: 'Inter',
          titleSize: 72,
          bodySize: 44,
          weight: '700',
          align: 'center',
          shadow: 0.5,
          outline: 3,
          color: '#ffffff',
          bgBlur: 0.2,
          bgOpacity: 0.3,
          padding: 24
        }
      ],
      musicTracks: []
    }
  },
  {
    id: 'presentation-deck',
    name: 'Presentation Deck',
    description: 'Professional slides with consistent branding',
    category: 'presentation',
    preview: '/templates/presentation.jpg',
    icon: Layout,
    data: {
      project: {
        title: 'Presentation Deck',
        aspect: '1920x1080',
        fps: 24,
        bgColor: '#ffffff'
      },
      scenes: [
        {
          projectId: '',
          order: 0,
          durationSec: 4,
          title: 'Title Slide',
          body: 'Professional presentation template',
          credit: '',
          fx: 'none',
          safeArea: 'bottom',
          imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0'
        }
      ],
      textStyles: [
        {
          projectId: '',
          name: 'Corporate',
          titleFont: 'Inter',
          bodyFont: 'Inter',
          titleSize: 56,
          bodySize: 32,
          weight: '600',
          align: 'left',
          shadow: 0,
          outline: 0,
          color: '#1a1a1a',
          bgBlur: 0,
          bgOpacity: 0.8,
          padding: 40
        }
      ],
      musicTracks: []
    }
  },
  {
    id: 'documentary',
    name: 'Documentary Style',
    description: 'Cinematic storytelling with rich typography',
    category: 'documentary',
    preview: '/templates/documentary.jpg',
    icon: Type,
    data: {
      project: {
        title: 'Documentary Style',
        aspect: '1920x1080',
        fps: 24,
        bgColor: '#0a0a0a'
      },
      scenes: [
        {
          projectId: '',
          order: 0,
          durationSec: 6,
          title: 'Chapter One',
          body: 'Every story has a beginning...',
          credit: 'Archive Photos',
          fx: 'kenburns_medium',
          safeArea: 'bottom',
          imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06'
        }
      ],
      textStyles: [
        {
          projectId: '',
          name: 'Cinematic',
          titleFont: 'Inter',
          bodyFont: 'Inter',
          titleSize: 48,
          bodySize: 28,
          weight: '400',
          align: 'center',
          shadow: 0.6,
          outline: 1,
          color: '#f5f5f5',
          bgBlur: 0.1,
          bgOpacity: 0.2,
          padding: 48
        }
      ],
      musicTracks: []
    }
  }
];

export const TemplateGallery: React.FC = () => {
  const { setProject, setScenes, setTextStyles, setMusicTracks } = useAppStore();

  const handleUseTemplate = (template: Template) => {
    const { project, scenes, textStyles, musicTracks } = template.data;
    
    setProject({ ...project, id: undefined });
    setScenes(scenes.map(scene => ({ ...scene, id: undefined, projectId: '' })));
    setTextStyles(textStyles.map(style => ({ ...style, id: undefined, projectId: '' })));
    setMusicTracks(musicTracks.map(track => ({ ...track, id: undefined, projectId: '' })));
  };

  const categories = {
    'video-essay': 'Video Essays',
    'social-media': 'Social Media',
    'presentation': 'Presentations',
    'documentary': 'Documentary'
  };

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([category, label]) => {
        const categoryTemplates = templates.filter(t => t.category === category);
        
        return (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-200">{label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryTemplates.map((template) => (
                <Card key={template.id} className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <template.icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-100 text-base">{template.name}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {template.data.scenes.length} scene{template.data.scenes.length !== 1 ? 's' : ''}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
