import { Composition } from 'remotion';
import { CumhuriyetStory } from './cumhuriyet/CumhuriyetStory';
import { JobSwipePromo, jobSwipePromoSchema } from './JobSwipePromo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="JobSwipePromo"
        component={JobSwipePromo}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={jobSwipePromoSchema}
      />
      <Composition
        id="CumhuriyetStory"
        component={CumhuriyetStory}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ brand: 'JobSwipe' }}
      />
    </>
  );
};
