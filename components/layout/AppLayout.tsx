'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { Preview } from './Preview';
import { Inspector } from './Inspector';
import { Timeline } from './Timeline';
import { KeyboardShortcuts } from './KeyboardShortcuts';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { ui, currentProject } = useAppStore();
  
  return (
    <div className={cn("app-layout", ui.theme)}>
      <KeyboardShortcuts />
      
      {/* Sidebar - Project library & presets */}
      <aside className="app-sidebar">
        <Sidebar />
      </aside>

      {/* Main Preview Area */}
      <main className="app-preview">
        <Preview />
      </main>

      {/* Inspector - Scene, Text, FX, Music, Export panels */}
      <aside className="app-inspector">
        <Inspector />
      </aside>

      {/* Timeline - Bottom panel with draggable scenes */}
      <section className="app-timeline">
        <Timeline />
      </section>

      {children}
    </div>
  );
}
