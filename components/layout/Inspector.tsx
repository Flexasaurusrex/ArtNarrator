'use client';
import React from 'react';
import { useAppStore } from '@/lib/store';
import { SceneInspector } from '@/components/inspector/SceneInspector';
import { TextInspector } from '@/components/inspector/TextInspector';
import { MusicInspector } from '@/components/inspector/MusicInspector';
import { ExportInspector } from '@/components/inspector/ExportInspector';
import { Button } from '@/components/ui/button';
import { Image, Type, Music, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Inspector() {
  const { ui, setActivePanel } = useAppStore();

  const panels = [
    { id: 'scene', icon: Image, label: 'Scene' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'export', icon: Download, label: 'Export' },
  ] as const;

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Tabs */}
      <header className="border-b border-gray-700 p-2">
        <div className="flex items-center space-x-1 w-full">
          {panels.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={ui.activePanel === id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel(id)}
              className={cn("flex-1", ui.activePanel === id && "bg-primary")}
            >
              <Icon className="w-4 h-4 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </header>

      {/* Panel Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {ui.activePanel === 'scene' && <SceneInspector />}
        {ui.activePanel === 'text' && <TextInspector />}
        {ui.activePanel === 'music' && <MusicInspector />}
        {ui.activePanel === 'export' && <ExportInspector />}
      </div>
    </div>
  );
}
