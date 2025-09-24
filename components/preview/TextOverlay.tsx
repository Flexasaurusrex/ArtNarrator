'use client';

import React from 'react';
import { Scene } from '@/lib/schemas';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface TextOverlayProps {
  scene: Scene;
}

export function TextOverlay({ scene }: TextOverlayProps) {
  const { currentProject, textStyles, ui } = useAppStore();
  
  // Get text style for this scene
  const textStyle = scene.textStyleId 
    ? textStyles.find(s => s.id === scene.textStyleId)
    : textStyles[0]; // Default to first style

  if (!scene.title && !scene.body && !scene.credit) {
    return null;
  }

  const safeAreaClass = cn(
    "text-overlay",
    scene.safeArea === 'top' && "safe-top",
    scene.safeArea === 'bottom' && "safe-bottom"
  );

  const titleStyle: React.CSSProperties = {
    fontFamily: textStyle?.titleFont || 'Inter',
    fontSize: `${(textStyle?.titleSize || 64) * 0.8}px`, // Scale down for preview
    fontWeight: textStyle?.weight || '600',
    color: textStyle?.color || '#ffffff',
    textAlign: (textStyle?.align || 'left') as 'left' | 'center' | 'right',
    textShadow: `0 2px ${(textStyle?.shadow || 0.4) * 10}px rgba(0, 0, 0, 0.8)`,
    WebkitTextStroke: `${textStyle?.outline || 2}px rgba(0, 0, 0, 0.3)`,
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily: textStyle?.bodyFont || 'Inter',
    fontSize: `${(textStyle?.bodySize || 44) * 0.8}px`, // Scale down for preview
    fontWeight: '400',
    color: textStyle?.color || '#ffffff',
    textAlign: (textStyle?.align || 'left') as 'left' | 'center' | 'right',
    textShadow: `0 2px ${(textStyle?.shadow || 0.4) * 8}px rgba(0, 0, 0, 0.7)`,
    WebkitTextStroke: `${(textStyle?.outline || 2) * 0.5}px rgba(0, 0, 0, 0.2)`,
  };

  const creditStyle: React.CSSProperties = {
    fontFamily: textStyle?.bodyFont || 'Inter',
    fontSize: `${(textStyle?.bodySize || 44) * 0.6}px`, // Even smaller for credits
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right' as const,
    textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
  };

  return (
    <div className={safeAreaClass}>
      <div 
        className="max-w-[85%]"
        style={{
          backgroundColor: textStyle?.bgOpacity 
            ? `rgba(0, 0, 0, ${textStyle.bgOpacity})` 
            : undefined,
          backdropFilter: textStyle?.bgBlur 
            ? `blur(${textStyle.bgBlur * 10}px)` 
            : undefined,
          padding: textStyle?.padding ? `${textStyle.padding * 0.5}px` : '16px',
          borderRadius: textStyle?.bgOpacity || textStyle?.bgBlur ? '8px' : undefined,
        }}
      >
        {scene.title && (
          <h1 className="text-title mb-2" style={titleStyle}>
            {scene.title}
          </h1>
        )}
        
        {scene.body && (
          <p className="text-body mb-2" style={bodyStyle}>
            {scene.body}
          </p>
        )}
        
        {scene.credit && (
          <p className="text-credit text-right" style={creditStyle}>
            {scene.credit}
          </p>
        )}
      </div>
    </div>
  );
}
