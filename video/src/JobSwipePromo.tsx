import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type JobSwipePromoProps = {
  title: string;
  tagline: string;
  jobs: { title: string; company: string; pay: string }[];
};

export const jobSwipePromoSchema: JobSwipePromoProps = {
  title: 'JobSwipe',
  tagline: 'Part-time işini kaydırarak bul',
  jobs: [
    { title: 'Barista', company: 'Kahve Durağı', pay: '₺250/saat' },
    { title: 'Kurye', company: 'HızlıGel', pay: '₺300/saat' },
    { title: 'Mağaza Görevlisi', company: 'ModaPark', pay: '₺220/saat' },
  ],
};

const PRIMARY = '#FF4B6E';

const Intro: React.FC<{ title: string; tagline: string }> = ({ title, tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const taglineOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 24 }}>
      <div style={{ fontSize: 160, fontWeight: 800, color: 'white', transform: `scale(${scale})` }}>
        {title}
      </div>
      <div style={{ fontSize: 56, color: 'white', opacity: taglineOpacity }}>{tagline}</div>
    </AbsoluteFill>
  );
};

const JobCard: React.FC<{ job: JobSwipePromoProps['jobs'][number]; direction: 1 | -1 }> = ({
  job,
  direction,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const swipe = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = swipe * direction * 1200;
  const rotate = swipe * direction * 25;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: 820,
          height: 1100,
          borderRadius: 48,
          background: 'white',
          boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
          padding: 64,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          transform: `translateX(${x}px) rotate(${rotate}deg) scale(${enter})`,
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 800, color: '#222' }}>{job.title}</div>
        <div style={{ fontSize: 48, color: '#666', marginTop: 12 }}>{job.company}</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: PRIMARY, marginTop: 32 }}>{job.pay}</div>
      </div>
    </AbsoluteFill>
  );
};

const Match: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 8 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: 140, fontWeight: 800, color: 'white', transform: `scale(${scale})` }}>
        Eşleşme! 🎉
      </div>
    </AbsoluteFill>
  );
};

export const JobSwipePromo: React.FC<JobSwipePromoProps> = ({ title, tagline, jobs }) => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${PRIMARY}, #FF8A5B)`,
        fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      }}
    >
      <Sequence durationInFrames={45}>
        <Intro title={title} tagline={tagline} />
      </Sequence>
      {jobs.map((job, i) => (
        <Sequence key={job.title} from={45 + i * 30} durationInFrames={45}>
          <JobCard job={job} direction={i === jobs.length - 1 ? 1 : -1} />
        </Sequence>
      ))}
      <Sequence from={45 + jobs.length * 30 + 15}>
        <Match />
      </Sequence>
    </AbsoluteFill>
  );
};
