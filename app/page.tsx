'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Sparkles, 
  Zap, 
  Image as ImageIcon,
  Type,
  Music,
  Download
} from 'lucide-react';

export default function HomePage() {
  const { currentProject, setProject, addScene } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load any existing project from localStorage or create starter project
    const initializeApp = async () => {
      try {
        // Check for existing projects
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Load the most recent project
          const projectResponse = await fetch(`/api/projects/${data.data[0].id}`);
          const projectData = await projectResponse.json();
          
          if (projectData.success) {
            const { project, scenes, textStyles, musicTracks } = projectData.data;
            setProject(project);
            useAppStore.getState().setScenes(scenes);
            useAppStore.getState().setTextStyles(textStyles);
            useAppStore.getState().setMusicTracks(musicTracks);
          }
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [setProject]);

  const handleCreateStarterProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'My First Video Essay',
          aspect: '1080x1920',
          fps: 30,
          bgColor: '#000000',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProject(data.data);
        
        // Add a sample scene
        addScene({
          projectId: data.data.id,
          order: 0,
          durationSec: 5,
          title: 'Welcome to ArtNarrator',
          body: 'Start creating your video essay by adding images and narration text.',
          credit: '',
          fx: 'kenburns_slow',
          safeArea: 'bottom',
        });
      }
    } catch (error) {
      console.error('Failed to create starter project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ArtNarrator...</p>
        </div>
      </div>
    );
  }

  if (currentProject) {
    return <AppLayout />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            ArtNarrator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create stunning video essays with on-screen narration, elegant typography, and cinematic effects
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <FeatureCard
            icon={<ImageIcon className="w-8 h-8" />}
            title="Visual Storytelling"
            description="Upload images or generate them with AI to create compelling narratives"
          />
          <FeatureCard
            icon={<Type className="w-8 h-8" />}
            title="Elegant Typography"
            description="Customize fonts, sizes, and effects with real-time accessibility checks"
          />
          <FeatureCard
            icon={<Music className="w-8 h-8" />}
            title="Cinematic Audio"
            description="Add background music with automatic ducking and waveform editing"
          />
          <FeatureCard
            icon={<Download className="w-8 h-8" />}
            title="Export Ready"
            description="Export to MP4, generate subtitles, and share your creations"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleCreateStarterProject}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-6 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Creating
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            No account required • Start creating in seconds
          </p>
        </div>

        {/* Quick Demo */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                See ArtNarrator in Action
              </CardTitle>
              <CardDescription>
                Watch how easy it is to create professional video essays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Demo video coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <Card className="text-center hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="mx-auto mb-2 text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
