import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Type, Palette, Plus, Trash2, Copy, Eye } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { TextStyle, CreateTextStyle, UpdateScene } from '@/lib/schemas';

export const TextInspector: React.FC = () => {
  const { 
    textStyles, 
    addTextStyle, 
    updateTextStyle, 
    deleteTextStyle,
    scenes,
    updateScene,
    timeline: { selectedSceneIds }
  } = useAppStore();

  const selectedScene = scenes.find(s => selectedSceneIds.includes(s.id!));
  const currentTextStyle = selectedScene?.textStyleId 
    ? textStyles.find(s => s.id === selectedScene.textStyleId)
    : textStyles[0];

  const handleStyleUpdate = (field: keyof TextStyle, value: any) => {
    if (currentTextStyle?.id) {
      updateTextStyle(currentTextStyle.id, { [field]: value });
    }
  };

  const handleCreateStyle = () => {
    const newStyle: CreateTextStyle = {
      projectId: '',
      name: `Style ${textStyles.length + 1}`,
      titleFont: 'Inter',
      bodyFont: 'Inter',
      titleSize: 64,
      bodySize: 36,
      weight: '600',
      align: 'left',
      shadow: 0.4,
      outline: 2,
      color: '#ffffff',
      bgBlur: 0,
      bgOpacity: 0,
      padding: 32,
    };
    addTextStyle(newStyle);
  };

  const handleApplyToScene = (styleId: string) => {
    if (selectedScene?.id) {
      const updateData: UpdateScene = { id: selectedScene.id, textStyleId: styleId };
      updateScene(selectedScene.id, updateData);
    }
  };

  const fonts = [
    'Inter',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Roboto',
    'Open Sans',
    'Lato',
  ];

  const weights = [
    { value: '400', label: 'Regular' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
  ];

  const alignments = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ];

  const previewText = {
    title: selectedScene?.title || 'Sample Title Text',
    body: selectedScene?.body || 'This is sample body text that shows how your typography will look in the final video.',
  };

  return (
    <div className="space-y-6">
      {/* Text Styles List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Type className="h-5 w-5" />
              Text Styles ({textStyles.length})
            </CardTitle>
            <Button
              size="sm"
              onClick={handleCreateStyle}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Style
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {textStyles.length > 0 ? (
            <div className="space-y-2">
              {textStyles.map((style) => (
                <div
                  key={style.id}
                  className={`p-3 rounded-md border transition-colors ${
                    currentTextStyle?.id === style.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-gray-200">
                            {style.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {style.titleFont} • {style.weight} • {style.align}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => selectedScene && style.id && handleApplyToScene(style.id)}
                        disabled={!selectedScene}
                        className="h-8 px-2 text-xs hover:bg-blue-600"
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newStyle = { ...style, name: `${style.name} Copy`, id: undefined };
                          addTextStyle(newStyle);
                        }}
                        className="h-8 w-8 p-0 hover:bg-gray-500"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => style.id && deleteTextStyle(style.id)}
                        className="h-8 w-8 p-0 hover:bg-red-600"
                        disabled={textStyles.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No text styles created yet</p>
              <p className="text-sm">Create a style to customize typography</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Style Editor */}
      {currentTextStyle && (
        <>
          {/* Preview */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative bg-gray-900 rounded-lg p-8 min-h-[200px] flex flex-col justify-center"
                style={{
                  backgroundColor: '#1a1a1a',
                  backgroundImage: selectedScene?.imageUrl 
                    ? `linear-gradient(rgba(0,0,0,${currentTextStyle.bgOpacity}), rgba(0,0,0,${currentTextStyle.bgOpacity})), url(${selectedScene.imageUrl})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backdropFilter: currentTextStyle.bgBlur > 0 ? `blur(${currentTextStyle.bgBlur * 10}px)` : undefined,
                }}
              >
                <div 
                  style={{ 
                    textAlign: currentTextStyle.align as any,
                    padding: `${currentTextStyle.padding}px`,
                  }}
                >
                  {/* Title */}
                  <div
                    style={{
                      fontFamily: currentTextStyle.titleFont,
                      fontSize: `${Math.max(24, currentTextStyle.titleSize * 0.4)}px`,
                      fontWeight: currentTextStyle.weight,
                      color: currentTextStyle.color,
                      textShadow: currentTextStyle.shadow > 0 
                        ? `0 2px ${currentTextStyle.shadow * 10}px rgba(0,0,0,0.8)`
                        : undefined,
                      WebkitTextStroke: currentTextStyle.outline > 0 
                        ? `${currentTextStyle.outline * 0.5}px rgba(0,0,0,0.5)`
                        : undefined,
                      marginBottom: '12px',
                      lineHeight: 1.2,
                    }}
                  >
                    {previewText.title}
                  </div>
                  
                  {/* Body */}
                  <div
                    style={{
                      fontFamily: currentTextStyle.bodyFont,
                      fontSize: `${Math.max(14, currentTextStyle.bodySize * 0.4)}px`,
                      fontWeight: currentTextStyle.weight,
                      color: currentTextStyle.color,
                      textShadow: currentTextStyle.shadow > 0 
                        ? `0 1px ${currentTextStyle.shadow * 6}px rgba(0,0,0,0.8)`
                        : undefined,
                      WebkitTextStroke: currentTextStyle.outline > 0 
                        ? `${currentTextStyle.outline * 0.3}px rgba(0,0,0,0.5)`
                        : undefined,
                      lineHeight: 1.4,
                      opacity: 0.9,
                    }}
                  >
                    {previewText.body}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-100 text-sm">Typography</CardTitle>
                <Input
                  value={currentTextStyle.name}
                  onChange={(e) => handleStyleUpdate('name', e.target.value)}
                  className="w-32 h-8 bg-gray-700 border-gray-600 text-gray-100 text-xs"
                  placeholder="Style name"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">Title Font</Label>
                  <select
                    value={currentTextStyle.titleFont}
                    onChange={(e) => handleStyleUpdate('titleFont', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Body Font</Label>
                  <select
                    value={currentTextStyle.bodyFont}
                    onChange={(e) => handleStyleUpdate('bodyFont', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">Title Size</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="28"
                      max="120"
                      value={currentTextStyle.titleSize}
                      onChange={(e) => handleStyleUpdate('titleSize', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <Input
                      type="number"
                      value={currentTextStyle.titleSize}
                      onChange={(e) => handleStyleUpdate('titleSize', parseInt(e.target.value) || 28)}
                      min="28"
                      max="120"
                      className="w-16 bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Body Size</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="16"
                      max="80"
                      value={currentTextStyle.bodySize}
                      onChange={(e) => handleStyleUpdate('bodySize', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <Input
                      type="number"
                      value={currentTextStyle.bodySize}
                      onChange={(e) => handleStyleUpdate('bodySize', parseInt(e.target.value) || 16)}
                      min="16"
                      max="80"
                      className="w-16 bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">Font Weight</Label>
                  <select
                    value={currentTextStyle.weight}
                    onChange={(e) => handleStyleUpdate('weight', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {weights.map((weight) => (
                      <option key={weight.value} value={weight.value}>
                        {weight.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Alignment</Label>
                  <select
                    value={currentTextStyle.align}
                    onChange={(e) => handleStyleUpdate('align', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {alignments.map((align) => (
                      <option key={align.value} value={align.value}>
                        {align.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Effects */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Visual Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-200">Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentTextStyle.color}
                    onChange={(e) => handleStyleUpdate('color', e.target.value)}
                    className="w-12 h-8 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={currentTextStyle.color}
                    onChange={(e) => handleStyleUpdate('color', e.target.value)}
                    className="flex-1 bg-gray-700 border-gray-600 text-gray-100"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">Drop Shadow</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={currentTextStyle.shadow}
                      onChange={(e) => handleStyleUpdate('shadow', parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-400 min-w-0 w-8">
                      {Math.round(currentTextStyle.shadow * 100)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Outline Width</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={currentTextStyle.outline}
                      onChange={(e) => handleStyleUpdate('outline', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-400 min-w-0 w-8">
                      {currentTextStyle.outline}px
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">Background Blur</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={currentTextStyle.bgBlur}
                      onChange={(e) => handleStyleUpdate('bgBlur', parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-400 min-w-0 w-8">
                      {Math.round(currentTextStyle.bgBlur * 100)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Background Opacity</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={currentTextStyle.bgOpacity}
                      onChange={(e) => handleStyleUpdate('bgOpacity', parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-400 min-w-0 w-8">
                      {Math.round(currentTextStyle.bgOpacity * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">Padding</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={currentTextStyle.padding}
                    onChange={(e) => handleStyleUpdate('padding', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-xs text-gray-400 min-w-0 w-12">
                    {currentTextStyle.padding}px
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* CSS for custom slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};
