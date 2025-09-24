'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { Plus, FolderOpen, Template, Palette } from 'lucide-react';
import { ProjectList } from '@/components/project/ProjectList';
import { TemplateGallery } from '@/components/project/TemplateGallery';

export function Sidebar() {
  const { currentProject, addScene } = useAppStore();

  const handleCreateProject = () => {
    // TODO: Implement create project dialog
    console.log('Create new project');
  };

  const handleAddScene = () => {
    if (currentProject) {
      addScene({
        projectId: currentProject.id!,
        order: 0,
        durationSec: 5,
        title: 'New Scene',
        body: 'Add your narration text here...',
        credit: '',
        fx: 'none',
        safeArea: 'bottom',
      });
    }
  };

  return (
    <div className="panel">
      <header className="panel-header">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Button size="sm" onClick={handleCreateProject}>
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
      </header>

      <div className="panel-content">
        {/* Quick Actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleAddScene}
            disabled={!currentProject}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Scene
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <FolderOpen className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
        </div>

        {/* Project List */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Projects</h3>
          <ProjectList />
        </div>

        {/* Templates */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
            <Template className="w-4 h-4 mr-2" />
            Templates
          </h3>
          <TemplateGallery />
        </div>

        {/* Presets */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Style Presets
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {['Modern', 'Serif', 'Typewriter', 'Minimal'].map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-center text-xs"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded mb-1" />
                {preset}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
