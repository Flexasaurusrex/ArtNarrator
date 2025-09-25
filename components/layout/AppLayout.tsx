import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Timeline } from './Timeline';
import { Preview } from './Preview';
import { Inspector } from './Inspector';

export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'templates' | 'styles'>('projects');

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {/* Main Application Layout */}
      <div className="flex h-full">
        
        {/* Sidebar - Project library & presets */}
        <aside className="w-80 flex-shrink-0">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex">
            {/* Preview Panel */}
            <div className="flex-1 flex flex-col min-w-0">
              <Preview />
            </div>

            {/* Inspector Panel */}
            <aside className="w-80 border-l border-gray-700 flex-shrink-0">
              <Inspector />
            </aside>
          </div>

          {/* Timeline at bottom */}
          <footer className="h-48 border-t border-gray-700 flex-shrink-0">
            <Timeline />
          </footer>
        </main>
      </div>
    </div>
  );
};
