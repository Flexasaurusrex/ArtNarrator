'use client';

import React, { useState } from 'react';
import { useAppStore, useTotalDuration } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Film, FileText, Settings, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function ExportInspector() {
  const { 
    currentProject, 
    scenes, 
    export: exportState,
    setCurrentRender,
    addToRenderHistory 
  } = useAppStore();

  const totalDuration = useTotalDuration();
  const [renderSettings, setRenderSettings] = useState({
    quality: 'standard',
    format: 'mp4',
    includeSubtitles: true,
  });

  const qualityOptions = {
    draft: { width: 720, height: 1280, bitrate: 8, fps: 24 },
    standard: { width: 1080, height: 1920, bitrate: 12, fps: 30 },
    high: { width: 1080, height: 1920, bitrate: 20, fps: 30 },
  };

  const currentQuality = qualityOptions[renderSettings.quality as keyof typeof qualityOptions];

  const handleStartRender = async () => {
    if (!currentProject) return;

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProject.id,
          settings: {
            ...renderSettings,
            ...currentQuality,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentRender(data.data);
        // Start polling for progress
        pollRenderProgress(data.data.id);
      }
    } catch (error) {
      console.error('Failed to start render:', error);
    }
  };

  const pollRenderProgress = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/render/${jobId}`);
        const data = await response.json();
        
        if (data.success) {
          setCurrentRender(data.data);
          
          if (data.data.status === 'done') {
            addToRenderHistory(data.data);
          } else if (data.data.status === 'error') {
            // Handle error
            console.error('Render failed:', data.data.logs);
          } else {
            // Continue polling
            setTimeout(poll, 2000);
          }
        }
      } catch (error) {
        console.error('Failed to poll render status:', error);
      }
    };
    
    poll();
  };

  const handleCancelRender = async () => {
    if (exportState.currentRender) {
      try {
        await fetch(`/api/render/${exportState.currentRender.id}`, {
          method: 'DELETE',
        });
        setCurrentRender(null);
      } catch (error) {
        console.error('Failed to cancel render:', error);
      }
    }
  };

  const getEstimatedFileSize = () => {
    const bitrateMbps = currentQuality.bitrate / 8; // Convert to MB/s
    const sizeInMB = totalDuration * bitrateMbps;
    return sizeInMB > 1000 ? `${(sizeInMB / 1000).toFixed(1)} GB` : `${Math.round(sizeInMB)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Project Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Scenes:</span>
            <span>{scenes.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Duration:</span>
            <span>{Math.round(totalDuration)}s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Aspect Ratio:</span>
            <span>{currentProject?.aspect}</span>
          </div>
        </CardContent>
      </Card>

      {/* Render Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quality</Label>
            <Select 
              value={renderSettings.quality} 
              onValueChange={(value) => setRenderSettings(prev => ({ ...prev, quality: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft (720p, 8 Mbps)</SelectItem>
                <SelectItem value="standard">Standard (1080p, 12 Mbps)</SelectItem>
                <SelectItem value="high">High (1080p, 20 Mbps)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select 
              value={renderSettings.format} 
              onValueChange={(value) => setRenderSettings(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                <SelectItem value="gif">GIF (for short videos)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Include Subtitles</Label>
            <Switch
              checked={renderSettings.includeSubtitles}
              onCheckedChange={(checked) => 
                setRenderSettings(prev => ({ ...prev, includeSubtitles: checked }))
              }
            />
          </div>

          {/* Preview specs */}
          <div className="bg-muted/50 p-3 rounded text-xs space-y-1">
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span>{currentQuality.width}×{currentQuality.height}</span>
            </div>
            <div className="flex justify-between">
              <span>Frame Rate:</span>
              <span>{currentQuality.fps} fps</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Size:</span>
              <span>{getEstimatedFileSize()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Render */}
      {exportState.currentRender ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Rendering
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={exportState.currentRender.progress * 100} />
            
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <Badge variant={
                exportState.currentRender.status === 'done' ? 'default' :
                exportState.currentRender.status === 'error' ? 'destructive' : 'secondary'
              }>
                {exportState.currentRender.status}
              </Badge>
            </div>

            <div className="flex space-x-2">
              {exportState.currentRender.status === 'done' && exportState.currentRender.outputUrl && (
                <Button asChild size="sm">
                  <a href={exportState.currentRender.outputUrl} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              )}
              
              {exportState.currentRender.status === 'rendering' && (
                <Button variant="destructive" size="sm" onClick={handleCancelRender}>
                  Cancel
                </Button>
              )}
            </div>

            {exportState.currentRender.logs && (
              <div className="text-xs bg-muted p-2 rounded max-h-20 overflow-y-auto">
                {exportState.currentRender.logs}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Start Render */
        <Card>
          <CardContent className="pt-6">
            <Button 
              className="w-full"
              onClick={handleStartRender}
              disabled={scenes.length === 0}
            >
              <Film className="w-4 h-4 mr-2" />
              Start Rendering
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Export History */}
      {exportState.renderHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Exports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {exportState.renderHistory.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center space-x-2">
                  {job.status === 'done' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <div className="text-xs">
                    <div>{job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Unknown'}</div>
                    <div className="text-muted-foreground">
                      {job.settings ? JSON.parse(job.settings).quality : 'standard'} quality
                    </div>
                  </div>
                </div>
                
                {job.status === 'done' && job.outputUrl && (
                  <Button asChild variant="ghost" size="sm">
                    <a href={job.outputUrl} download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Additional Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Additional Exports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Export SRT Subtitles
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export Project JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
