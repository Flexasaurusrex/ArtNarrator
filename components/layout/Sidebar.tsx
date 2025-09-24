import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Palette, Plus, Layout } from 'lucide-react';
import { TemplateGallery } from '@/components/project/TemplateGallery';

interface SidebarProps {
  activeTab: 'projects' | 'templates' | 'styles';
  onTabChange: (tab: 'projects' | 'templates' | 'styles') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'styles', label: 'Styles', icon: Palette },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">Recent Projects</h2>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
            <div className="space-y-3">
              <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-100 text-sm">Sample Project</CardTitle>
                  <CardDescription className="text-gray-400 text-xs">
                    Created 2 hours ago
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-gray-500">
                    3 scenes • 15s duration
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'templates':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">Templates</h2>
            </div>
            <TemplateGallery />
          </div>
        );
      case 'styles':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">Text Styles</h2>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                <Plus className="h-4 w-4 mr-2" />
                New Style
              </Button>
            </div>
            <div className="space-y-3">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-100 text-sm">Default Style</CardTitle>
                  <CardDescription className="text-gray-400 text-xs">
                    Inter • 600 weight • Center aligned
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-gray-500">
                    Title: 64px • Body: 36px
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
