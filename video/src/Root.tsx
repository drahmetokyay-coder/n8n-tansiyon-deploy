import { Composition } from 'remotion';
import { JobSwipePromo, jobSwipePromoSchema } from './JobSwipePromo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="JobSwipePromo"
      component={JobSwipePromo}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={jobSwipePromoSchema}
    />
  );
};
