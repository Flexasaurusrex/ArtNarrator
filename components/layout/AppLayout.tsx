import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Timeline } from './Timeline';
import { Preview } from './Preview';
import { Inspector } from './Inspector';

export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'templates' | 'styles'>('projects');

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Main Content Row */}
      <div className="flex flex-1 min-h-0">
        
        {/* Left Sidebar - Fixed width */}
        <aside className="w-72 bg-gray-900 border-r border-gray-700 flex-shrink-0">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        {/* Center Preview - Takes remaining space */}
        <main className="flex-1 bg-gray-800 min-w-0">
          <Preview />
        </main>

        {/* Right Inspector - Fixed width */}
        <aside className="w-80 bg-gray-900 border-l border-gray-700 flex-shrink-0">
          <Inspector />
        </aside>
      </div>

      {/* Bottom Timeline - Fixed height */}
      <footer className="h-52 bg-gray-800 border-t border-gray-700 flex-shrink-0">
        <Timeline />
      </footer>
    </div>
  );
};
