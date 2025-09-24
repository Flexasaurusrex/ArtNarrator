import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ArtNarratorVideo"
      component={VideoComposition as any}
      durationInFrames={1800} // 60 seconds at 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        scenes: [],
        textStyle: null,
        musicTrack: null,
        projectSettings: {
          fps: 30,
          bgColor: '#000000',
        },
      }}
    />
  );
};
