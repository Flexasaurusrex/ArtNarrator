import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Play, Settings, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { RenderSettings, RenderJob } from '@/lib/schemas';

export const ExportInspector: React.FC = () => {
  const { currentProject, scenes, export: exportState, setCurrentRender, addToRenderHistory } = useAppStore();
  
  const [renderSettings, setRenderSettings] = useState<RenderSettings>({
    quality: 'standard',
    format: 'mp4',
    width: 1920,
    height: 1080,
    fps: 30,
    includeSubtitles: true,
  });

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (currentProject) {
      const [width, height] = currentProject.aspect.split('x').map(Number);
      setRenderSettings(prev => ({
        ...prev,
        width,
        height,
        fps: currentProject.fps,
      }));
    }
  }, [currentProject]);

  const totalDuration = scenes.reduce((total, scene) => total + scene.durationSec, 0);
  const canRender = currentProject && scenes.length > 0 && totalDuration > 0;

  const handleStartRender = async () => {
    if (!currentProject || !canRender) return;

    setIsRendering(true);
    setRenderProgress(0);
    setRenderLogs([]);

    const renderJob: RenderJob = {
      id: `render_${Date.now()}`,
      projectId: currentProject.id || '',
      status: 'queued',
      progress: 0,
      settings: JSON.stringify(renderSettings),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCurrentRender(renderJob);

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          settings: renderSettings,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Render failed');
      }

      const jobId = data.data.jobId;
      
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/render/${jobId}`);
          const statusData = await statusResponse.json();
          
          if (statusData.success) {
            const job = statusData.data;
            setRenderProgress(job.progress * 100);
            
            if (job.logs) {
              setRenderLogs(job.logs.split('\n').filter(Boolean));
            }
            
            if (job.status === 'done') {
              clearInterval(pollInterval);
              setIsRendering(false);
              
              const completedJob = {
                ...renderJob,
                status: 'done' as const,
                progress: 1,
                outputUrl: job.outputUrl,
                updatedAt: new Date(),
              };
              
              setCurrentRender(completedJob);
              addToRenderHistory(completedJob);
            } else if (job.status === 'error') {
              clearInterval(pollInterval);
              setIsRendering(false);
              throw new Error(job.logs || 'Render failed');
            }
          }
        } catch (pollError) {
          clearInterval(pollInterval);
          setIsRendering(false);
          console.error('Poll error:', pollError);
        }
      }, 1000);

    } catch (error) {
      setIsRendering(false);
      console.error('Render error:', error);
      setRenderLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  const handleCancelRender = async () => {
    if (exportState.currentRender) {
      try {
        await fetch(`/api/render/${exportState.currentRender.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Cancel error:', error);
      }
    }
    
    setIsRendering(false);
    setCurrentRender(null);
    setRenderProgress(0);
  };

  const handleDownload = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getQualityDescription = (quality: string) => {
    switch (quality) {
      case 'draft': return 'Fast render, lower quality';
      case 'standard': return 'Balanced quality and speed';
      case 'high': return 'Best quality, slower render';
      default: return '';
    }
  };

  const getEstimatedTime = () => {
    if (!totalDuration) return 'Unknown';
    const multiplier = renderSettings.quality === 'draft' ? 2 : renderSettings.quality === 'high' ? 8 : 4;
    const estimatedSeconds = totalDuration * multiplier;
    const minutes = Math.ceil(estimatedSeconds / 60);
    return `~${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  const getFileSizeEstimate = () => {
    if (!totalDuration) return 'Unknown';
    const bitrateMbps = renderSettings.quality === 'draft' ? 2 : renderSettings.quality === 'high' ? 8 : 5;
    const sizeBytes = (totalDuration * bitrateMbps * 1024 * 1024) / 8;
    const sizeMB = Math.ceil(sizeBytes / (1024 * 1024));
    return `~${sizeMB} MB`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-200">Quality</Label>
              <select
                value={renderSettings.quality}
                onChange={(e) => setRenderSettings(prev => ({ ...prev, quality: e.target.value as RenderSettings['quality'] }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="standard">Standard</option>
                <option value="high">High</option>
              </select>
              <p className="text-xs text-gray-400">{getQualityDescription(renderSettings.quality)}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">Format</Label>
              <select
                value={renderSettings.format}
                onChange={(e) => setRenderSettings(prev => ({ ...prev, format: e.target.value as RenderSettings['format'] }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mp4">MP4 Video</option>
                <option value="gif">Animated GIF</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-gray-200">Include Subtitles</Label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={renderSettings.includeSubtitles}
                onChange={(e) => setRenderSettings(prev => ({ ...prev, includeSubtitles: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="border-gray-600 text-gray-300"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </Button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-600">
              <div className="space-y-2">
                <Label className="text-gray-200">Resolution</Label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={renderSettings.width}
                    onChange={(e) => setRenderSettings(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="360"
                    max="4096"
                  />
                  <span className="text-gray-400 py-2">×</span>
                  <input
                    type="number"
                    value={renderSettings.height}
                    onChange={(e) => setRenderSettings(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="360"
                    max="4096"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">Frame Rate</Label>
                <select
                  value={renderSettings.fps}
                  onChange={(e) => setRenderSettings(prev => ({ ...prev, fps: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24">24 FPS</option>
                  <option value="25">25 FPS</option>
                  <option value="30">30 FPS</option>
                  <option value="60">60 FPS</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{totalDuration.toFixed(1)}s</div>
              <div className="text-xs text-gray-400">Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{getEstimatedTime()}</div>
              <div className="text-xs text-gray-400">Est. Render Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{getFileSizeEstimate()}</div>
              <div className="text-xs text-gray-400">Est. File Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          {!isRendering && !exportState.currentRender ? (
            <Button
              onClick={handleStartRender}
              disabled={!canRender}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Export
            </Button>
          ) : isRendering ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-200">Rendering...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelRender}
                  className="border-red-600 text-red-400 hover:bg-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-400">
                {Math.round(renderProgress)}% complete
              </div>
            </div>
          ) : exportState.currentRender?.status === 'done' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span>Export Complete!</span>
              </div>
              {exportState.currentRender.outputUrl && (
                <Button
                  onClick={() => handleDownload(exportState.currentRender!.outputUrl!)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Video
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>Export failed. Check logs below.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {renderLogs.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 text-sm">Export Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black rounded-md p-3 max-h-40 overflow-y-auto">
              {renderLogs.map((log, index) => (
                <div key={index} className="text-xs text-gray-300 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {exportState.renderHistory.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 text-sm">Recent Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exportState.renderHistory.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                  <div className="flex-1">
                    <div className="text-sm text-gray-200">{job.createdAt?.toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">
                      {job.status === 'done' ? 'Completed' : 'Failed'}
                    </div>
                  </div>
                  {job.status === 'done' && job.outputUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(job.outputUrl!)}
                      className="border-gray-600 text-gray-300"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
