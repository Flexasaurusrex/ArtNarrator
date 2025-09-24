import React from 'react';
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { Scene, TextStyle } from '@/lib/schemas';
import { TextOverlayRemotaion } from './TextOverlay';

interface SceneSequenceProps {
  scene: Scene;
  textStyle: TextStyle | null;
  duration: number;
}

export const SceneSequence: React.FC<SceneSequenceProps> = ({
  scene,
  textStyle,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Apply effects based on scene.fx
  const getImageTransform = () => {
    const progress = frame / duration;
    
    switch (scene.fx) {
      case 'kenburns_slow':
        const slowScale = interpolate(progress, [0, 1], [1, 1.03]);
        return {
          transform: `scale(${slowScale})`,
        };
        
      case 'kenburns_medium':
        const mediumScale = interpolate(progress, [0, 1], [1, 1.06]);
        return {
          transform: `scale(${mediumScale})`,
        };
        
      case 'pan_right':
        const panX = interpolate(progress, [0, 1], [0, -50]);
        return {
          transform: `translateX(${panX}px) scale(1.1)`,
        };
        
      case 'pan_left':
        const panXLeft = interpolate(progress, [0, 1], [0, 50]);
        return {
          transform: `translateX(${panXLeft}px) scale(1.1)`,
        };
        
      case 'fade':
        const fadeOpacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
        return {
          opacity: fadeOpacity,
        };
        
      default:
        return {};
    }
  };

  // Text animation timing
  const textAnimationStart = 30; // Start text animation at frame 30
  const textAnimationDuration = 60; // 2 seconds
  
  const textOpacity = frame > textAnimationStart ? 
    interpolate(
      frame,
      [textAnimationStart, textAnimationStart + textAnimationDuration],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    ) : 0;

  const textTransform = frame > textAnimationStart ? 
    spring({
      frame: frame - textAnimationStart,
      fps,
      config: {
        damping: 100,
        stiffness: 200,
        mass: 0.5,
      },
    }) : 0;

  return (
    <AbsoluteFill>
      {/* Background Image */}
      {scene.imageUrl && (
        <AbsoluteFill>
          <Img
            src={scene.imageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              ...getImageTransform(),
            }}
          />
        </AbsoluteFill>
      )}
      
      {/* Text Overlay */}
      <TextOverlayRemotaion
        scene={scene}
        textStyle={textStyle}
        opacity={textOpacity}
        transform={textTransform}
      />
    </AbsoluteFill>
  );
};
