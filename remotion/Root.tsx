import { Composition } from 'remotion';
import { VideoEssayComposition } from './VideoEssayComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ArtNarratorVideo"
        component={VideoEssayComposition}
        durationInFrames={1800} // Will be overridden by API
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: [],
          backgroundMusic: null,
        }}
      />
    </>
  );
};
