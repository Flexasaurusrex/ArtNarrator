import React from 'react';
import { 
  AbsoluteFill, 
  Sequence, 
  useVideoConfig, 
  interpolate, 
  useCurrentFrame,
  Audio,
  staticFile
} from 'remotion';
import { SceneSequence } from './SceneSequence';
import { Scene, TextStyle, MusicTrack } from '@/lib/schemas';

interface VideoCompositionProps {
  scenes: Scene[];
  textStyle: TextStyle | null;
  musicTrack: MusicTrack | null;
  projectSettings: {
    fps: number;
    bgColor: string;
  };
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  scenes,
  textStyle,
  musicTrack,
  projectSettings,
}) => {
  const { fps } = useVideoConfig();
  
  // Calculate cumulative scene timing
  let cumulativeFrames = 0;
  const sceneSequences = scenes.map((scene, index) => {
    const durationInFrames = Math.round(scene.durationSec * fps);
    const startFrame = cumulativeFrames;
    cumulativeFrames += durationInFrames;
    
    return (
      <Sequence
        key={scene.id || index}
        from={startFrame}
        durationInFrames={durationInFrames}
      >
        <SceneSequence
          scene={scene}
          textStyle={textStyle}
          duration={durationInFrames}
        />
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ backgroundColor: projectSettings.bgColor }}>
      {/* Background Music */}
      {musicTrack && (
        <Audio
          src={staticFile(musicTrack.url.replace('/uploads/', ''))}
          volume={musicTrack.volume}
          startFrom={Math.round(musicTrack.inSec * fps)}
          endAt={musicTrack.outSec ? Math.round(musicTrack.outSec * fps) : undefined}
        />
      )}
      
      {/* Scene Sequences */}
      {sceneSequences}
    </AbsoluteFill>
  );
};
