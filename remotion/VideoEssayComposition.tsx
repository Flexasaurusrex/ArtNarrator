import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig, Audio } from 'remotion';

interface Scene {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  duration: number;
  textPosition: {
    x: number;
    y: number;
  };
  textStyle: {
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    backgroundOpacity: number;
    fontWeight: string;
    textAlign: string;
  };
  transition: string;
  transitionDuration: number;
  transitionIntensity: number;
}

interface VideoEssayCompositionProps {
  scenes: Scene[];
  backgroundMusic?: string | null;
}

export const VideoEssayComposition: React.FC<VideoEssayCompositionProps> = ({ 
  scenes, 
  backgroundMusic 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  if (!scenes || scenes.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: 48, fontFamily: 'Arial' }}>
          No scenes provided
        </div>
      </AbsoluteFill>
    );
  }

  // Calculate which scene should be showing
  let currentSceneIndex = 0;
  let sceneStartFrame = 0;
  let accumulatedFrames = 0;
  
  for (let i = 0; i < scenes.length; i++) {
    const sceneDurationInFrames = scenes[i].duration * fps;
    if (frame >= accumulatedFrames && frame < accumulatedFrames + sceneDurationInFrames) {
      currentSceneIndex = i;
      sceneStartFrame = accumulatedFrames;
      break;
    }
    accumulatedFrames += sceneDurationInFrames;
  }
  
  const currentScene = scenes[currentSceneIndex];
  const nextScene = scenes[currentSceneIndex + 1];
  
  if (!currentScene) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000000' }}>
        <div style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: 32,
          fontFamily: 'Arial',
          textAlign: 'center'
        }}>
          End of Video
        </div>
      </AbsoluteFill>
    );
  }
  
  const sceneDurationInFrames = currentScene.duration * fps;
  const sceneProgress = (frame - sceneStartFrame) / sceneDurationInFrames;
  const transitionDurationInFrames = currentScene.transitionDuration * fps;
  
  // Check if we're in transition phase
  const isInTransition = nextScene && (frame - sceneStartFrame) >= (sceneDurationInFrames - transitionDurationInFrames);
  const transitionProgress = isInTransition ? 
    ((frame - sceneStartFrame) - (sceneDurationInFrames - transitionDurationInFrames)) / transitionDurationInFrames : 0;
  
  // Transition animations with intensity control
  const getTransitionStyle = (scene: Scene, isNext: boolean, progress: number): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: '100%',
      height: '100%',
    };
    
    if (!isInTransition && !isNext) {
      return baseStyle;
    }

    const intensity = scene.transitionIntensity / 100;
    
    switch (scene.transition) {
      case 'fade':
        return {
          ...baseStyle,
          opacity: isNext ? progress * intensity : Math.max(0, 1 - (progress * intensity)),
        };
      case 'slide-left':
        return {
          ...baseStyle,
          transform: `translateX(${isNext ? (1 - progress) * 100 * intensity : -(progress * 100 * intensity)}%)`,
        };
      case 'slide-right':
        return {
          ...baseStyle,
          transform: `translateX(${isNext ? (progress - 1) * 100 * intensity : progress * 100 * intensity}%)`,
        };
      case 'zoom-in':
        const zoomInScale = isNext ? 
          0.5 + (progress * intensity * 0.5) : 
          1 + (progress * intensity * 0.5);
        return {
          ...baseStyle,
          transform: `scale(${zoomInScale})`,
          opacity: isNext ? progress * intensity : Math.max(0, 1 - (progress * intensity * 0.5)),
        };
      case 'zoom-out':
        const zoomOutScale = isNext ? 
          (1 - intensity * 0.5) + (progress * intensity * 0.5) : 
          1 - (progress * intensity * 0.5);
        return {
          ...baseStyle,
          transform: `scale(${Math.max(0.1, zoomOutScale)})`,
          opacity: isNext ? progress * intensity : Math.max(0, 1 - (progress * intensity * 0.5)),
        };
      case 'dissolve':
        return {
          ...baseStyle,
          opacity: isNext ? progress * intensity : Math.max(0, 1 - (progress * intensity)),
          filter: `blur(${isNext ? (1 - progress) * intensity * 4 : progress * intensity * 4}px)`,
        };
      default: // 'none' or cut
        return {
          ...baseStyle,
          opacity: isNext && progress > 0.5 ? 1 : (!isNext ? 1 : 0),
        };
    }
  };
  
  // Text animation
  const textSpring = spring({
    frame: frame - sceneStartFrame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.5,
    },
  });
  
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);
  const textTransform = interpolate(textSpring, [0, 1], [20, 0]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Background Music */}
      {backgroundMusic && (
        <Audio src={backgroundMusic} volume={0.3} />
      )}
      
      {/* Current Scene */}
      <div style={getTransitionStyle(currentScene, false, transitionProgress)}>
        <Img
          src={currentScene.imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Text Overlay */}
        <div
          style={{
            position: 'absolute',
            left: `${currentScene.textPosition.x}%`,
            top: `${currentScene.textPosition.y}%`,
            transform: `translate(-50%, -50%) translateY(${textTransform}px)`,
            maxWidth: '80%',
            padding: '16px 24px',
            borderRadius: '8px',
            fontFamily: currentScene.textStyle.fontFamily || 'Arial',
            fontSize: `${currentScene.textStyle.fontSize}px`,
            fontWeight: currentScene.textStyle.fontWeight || 'bold',
            color: currentScene.textStyle.color,
            backgroundColor: `${currentScene.textStyle.backgroundColor}${Math.round(currentScene.textStyle.backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`,
            textAlign: currentScene.textStyle.textAlign as any,
            backdropFilter: currentScene.textStyle.backgroundOpacity > 0 ? 'blur(4px)' : 'none',
            opacity: textOpacity,
            lineHeight: 1.4,
            boxSizing: 'border-box',
          }}
        >
          {currentScene.title && (
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              {currentScene.title}
            </div>
          )}
          {currentScene.description && (
            <div style={{ fontSize: `${currentScene.textStyle.fontSize * 0.75}px` }}>
              {currentScene.description}
            </div>
          )}
        </div>
      </div>
      
      {/* Next Scene (during transition) */}
      {isInTransition && nextScene && (
        <div style={getTransitionStyle(nextScene, true, transitionProgress)}>
          <Img
            src={nextScene.imageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          
          {/* Next Scene Text */}
          <div
            style={{
              position: 'absolute',
              left: `${nextScene.textPosition.x}%`,
              top: `${nextScene.textPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              maxWidth: '80%',
              padding: '16px 24px',
              borderRadius: '8px',
              fontFamily: nextScene.textStyle.fontFamily || 'Arial',
              fontSize: `${nextScene.textStyle.fontSize}px`,
              fontWeight: nextScene.textStyle.fontWeight || 'bold',
              color: nextScene.textStyle.color,
              backgroundColor: `${nextScene.textStyle.backgroundColor}${Math.round(nextScene.textStyle.backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`,
              textAlign: nextScene.textStyle.textAlign as any,
              backdropFilter: nextScene.textStyle.backgroundOpacity > 0 ? 'blur(4px)' : 'none',
              opacity: transitionProgress,
              lineHeight: 1.4,
              boxSizing: 'border-box',
            }}
          >
            {nextScene.title && (
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {nextScene.title}
              </div>
            )}
            {nextScene.description && (
              <div style={{ fontSize: `${nextScene.textStyle.fontSize * 0.75}px` }}>
                {nextScene.description}
              </div>
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
