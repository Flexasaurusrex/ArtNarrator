import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Scene, TextStyle } from '@/lib/schemas';

interface TextOverlayRemotaionProps {
  scene: Scene;
  textStyle: TextStyle | null;
  opacity: number;
  transform: number;
}

export const TextOverlayRemotaion: React.FC<TextOverlayRemotaionProps> = ({
  scene,
  textStyle,
  opacity,
  transform,
}) => {
  if (!textStyle || (!scene.title && !scene.body && !scene.credit)) {
    return null;
  }

  const safeAreaStyle = scene.safeArea === 'top' ? 
    { justifyContent: 'flex-start', paddingTop: 120 } :
    { justifyContent: 'flex-end', paddingBottom: 160 };

  const containerStyle: React.CSSProperties = {
    ...safeAreaStyle,
    padding: textStyle.padding,
    maxWidth: '85%',
    alignItems: textStyle.align === 'center' ? 'center' : 
                textStyle.align === 'right' ? 'flex-end' : 'flex-start',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: textStyle.titleFont,
    fontSize: textStyle.titleSize,
    fontWeight: textStyle.weight,
    color: textStyle.color,
    textAlign: textStyle.align as any,
    textShadow: `0 ${textStyle.shadow * 8}px ${textStyle.shadow * 16}px rgba(0,0,0,0.8)`,
    WebkitTextStroke: `${textStyle.outline}px rgba(0,0,0,0.3)`,
    marginBottom: 16,
    transform: `translateY(${(1 - transform) * 30}px)`,
    opacity: opacity,
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily: textStyle.bodyFont,
    fontSize: textStyle.bodySize,
    fontWeight: '400',
    color: textStyle.color,
    textAlign: textStyle.align as any,
    textShadow: `0 ${textStyle.shadow * 6}px ${textStyle.shadow * 12}px rgba(0,0,0,0.7)`,
    WebkitTextStroke: `${textStyle.outline * 0.5}px rgba(0,0,0,0.2)`,
    lineHeight: 1.4,
    marginBottom: 12,
    transform: `translateY(${(1 - transform) * 20}px)`,
    opacity: opacity,
  };

  const creditStyle: React.CSSProperties = {
    ...bodyStyle,
    fontSize: textStyle.bodySize * 0.75,
    opacity: opacity * 0.8,
    textAlign: 'right',
  };

  const backgroundStyle: React.CSSProperties = {
    backgroundColor: textStyle.bgOpacity > 0 ? 
      `rgba(0,0,0,${textStyle.bgOpacity})` : 'transparent',
    backdropFilter: textStyle.bgBlur > 0 ? 
      `blur(${textStyle.bgBlur * 10}px)` : 'none',
    borderRadius: 12,
    padding: textStyle.bgOpacity > 0 || textStyle.bgBlur > 0 ? 24 : 0,
  };

  return (
    <AbsoluteFill style={{ display: 'flex', ...containerStyle }}>
      <div style={backgroundStyle}>
        {scene.title && (
          <h1 style={titleStyle}>
            {scene.title}
          </h1>
        )}
        
        {scene.body && (
          <p style={bodyStyle}>
            {scene.body}
          </p>
        )}
        
        {scene.credit && (
          <p style={creditStyle}>
            {scene.credit}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};
