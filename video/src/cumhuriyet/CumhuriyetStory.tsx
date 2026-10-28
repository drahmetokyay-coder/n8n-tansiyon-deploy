import { CameraMotionBlur } from '@remotion/motion-blur';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import './fonts';
import { CARDS, rise, slam } from './cards';
import { Burst, Fireworks, StarRush } from './effects';
import { WavingFlag } from './TurkishFlag';
import { BAR, DISPLAY, GOLD, H, INK, RED, SERIF, W } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type CumhuriyetStoryProps = { brand: string };

// 0-2 sn: zaman tüneli, "1923"e doğru hızlanan uçuş
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const travel = 0.004 * frame + 0.00028 * frame * frame;
  const zoom = interpolate(frame, [40, 60], [1, 7], { ...clamp, easing: Easing.in(Easing.exp) });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #2A0710 0%, ${INK} 60%)` }}>
      {new Array(14).fill(0).map((_, i) => {
        const phase = (((i / 14 + travel) % 1) + 1) % 1;
        const scale = 0.12 * Math.pow(2, phase * 6.5);
        return (
          <AbsoluteFill key={i} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
              style={{
                width: 360,
                height: 640,
                borderRadius: 40,
                border: `${3 / Math.sqrt(scale)}px solid ${i % 2 ? RED : 'white'}`,
                transform: `scale(${scale})`,
                opacity: Math.min(1, phase * 5) * (1 - phase) * 0.9,
              }}
            />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          transform: `scale(${zoom})`,
          opacity: interpolate(frame, [52, 60], [1, 0], clamp),
        }}
      >
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 76, ...rise(frame, 2) }}>
          103 yıl önce bugün
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 320,
            letterSpacing: -10,
            lineHeight: 1,
            opacity: frame < 12 ? 0 : frame < 22 ? (random(`flick-${Math.floor(frame)}`) > 0.4 ? 1 : 0.2) : 1,
            textShadow: `0 0 60px ${RED}`,
          }}
        >
          1923
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 2-14 sn: 3B carousel; her ölçü başında hyperlapse "whip" geçişi
const BOUNDS = [60, 120, 180, 240, 300];
const whipEase = Easing.bezier(0.8, 0, 0.2, 1);

const Carousel: React.FC = () => {
  const frame = useCurrentFrame();
  const progs = BOUNDS.map((b) => interpolate(frame, [b - 10, b + 2], [0, 1], { ...clamp, easing: whipEase }));
  const p = progs.reduce((a, b) => a + b, 0);
  const intensity = Math.max(...progs.map((x) => Math.sin(Math.PI * x)));
  const exit = interpolate(frame, [344, 360], [1, 4], { ...clamp, easing: Easing.in(Easing.exp) });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #2A0710 0%, ${INK} 70%)` }}>
      <AbsoluteFill
        style={{
          perspective: 2600,
          transform: `scale(${(1 - 0.2 * intensity) * exit})`,
          opacity: interpolate(frame, [352, 360], [1, 0], clamp),
        }}
      >
        {CARDS.map((Card, i) => {
          const d = i - p;
          if (Math.abs(d) > 1.4) {
            return null;
          }
          const local = frame - i * BAR;
          return (
            <AbsoluteFill
              key={i}
              style={{
                overflow: 'hidden',
                borderRadius: 70 * intensity,
                boxShadow: `0 40px 120px rgba(0,0,0,${0.6 * intensity})`,
                transform: `translateX(${d * W * 1.04}px) rotateY(${-d * 32}deg) scale(${1 - 0.12 * Math.min(1, Math.abs(d))})`,
              }}
            >
              <AbsoluteFill style={{ transform: `scale(${1 + 0.0016 * Math.max(0, local + 10)})` }}>
                <Card frame={local} />
              </AbsoluteFill>
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 1590,
          width: W,
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          opacity: interpolate(frame, [340, 350], [1, 0], clamp),
        }}
      >
        {CARDS.map((_, i) => {
          const active = Math.max(0, 1 - Math.abs(i - p));
          return (
            <div
              key={i}
              style={{
                height: 14,
                width: 14 + 34 * active,
                borderRadius: 10,
                background: 'white',
                opacity: 0.4 + 0.6 * active,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 14-20 sn: doruk — bayrak, havai fişekler, "Ne mutlu Türk'üm diyene!"
const BURSTS: Burst[] = [
  { at: 0, x: 240, y: 380, color: RED },
  { at: 8, x: 840, y: 300, color: 'white' },
  { at: 30, x: 540, y: 250, color: GOLD },
  { at: 60, x: 210, y: 300, color: 'white' },
  { at: 68, x: 880, y: 420, color: RED },
  { at: 90, x: 540, y: 330, color: GOLD, size: 420 },
  { at: 120, x: 290, y: 380, color: RED },
  { at: 128, x: 800, y: 270, color: 'white' },
  { at: 150, x: 540, y: 320, color: GOLD },
  { at: 165, x: 220, y: 430, color: 'white', size: 320 },
  { at: 165, x: 860, y: 400, color: RED, size: 320 },
  { at: 167, x: 540, y: 260, color: GOLD, size: 480 },
];

const Finale: React.FC<CumhuriyetStoryProps> = ({ brand }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 14], [0.7, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const punch = interpolate(frame, [165, 168, 180], [0, 0.07, 0.03], clamp);
  const flagScale = enter * (1 + 0.0004 * frame + punch);
  const swap = interpolate(frame, [116, 124], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const word: React.CSSProperties = { fontSize: 116, fontWeight: 900, letterSpacing: -2, lineHeight: 1.1 };

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #060914 0%, #12081A 55%, #3A0710 100%)', color: 'white' }}>
      <AbsoluteFill style={{ opacity: 0.45 }}>
        <StarRush frame={frame} speed={0.004} count={120} />
      </AbsoluteFill>
      <Fireworks frame={frame} bursts={BURSTS} />
      <AbsoluteFill style={{ alignItems: 'center', top: 450, transform: `scale(${flagScale})` }}>
        <WavingFlag width={920} frame={frame} amplitude={0.06} speed={0.26} />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 300,
          width: W,
          display: 'flex',
          justifyContent: 'center',
          opacity: 1 - swap,
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 48,
            letterSpacing: 6,
            padding: '14px 36px',
            borderRadius: 60,
            background: RED,
            ...slam(frame, 90, 2.2),
          }}
        >
          103. YIL
        </div>
      </div>
      <AbsoluteFill
        style={{
          top: 1200,
          alignItems: 'center',
          fontFamily: DISPLAY,
          textAlign: 'center',
          opacity: 1 - swap,
          transform: `translateY(${-260 * swap}px)`,
          filter: `blur(${12 * swap}px)`,
        }}
      >
        <div style={{ ...word, ...slam(frame, 0) }}>CUMHURİYET</div>
        <div style={{ ...word, ...slam(frame, 30) }}>BAYRAMIMIZ</div>
        <div style={{ ...word, fontSize: 104, color: GOLD, ...slam(frame, 60) }}>KUTLU OLSUN!</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1210, alignItems: 'center', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700 }}>
        <div style={{ fontSize: 118, lineHeight: 1.05, ...rise(frame, 120, 140) }}>Ne mutlu</div>
        <div style={{ fontSize: 124, lineHeight: 1.1, color: GOLD, ...rise(frame, 124, 140) }}>Türk&apos;üm diyene!</div>
        <div style={{ fontFamily: DISPLAY, fontStyle: 'normal', fontWeight: 800, fontSize: 32, letterSpacing: 8, color: RED, marginTop: 26, ...rise(frame, 134, 30) }}>
          MUSTAFA KEMAL ATATÜRK
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1610, alignItems: 'center', fontFamily: DISPLAY, ...rise(frame, 166, 30) }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 10 }}>29 EKİM 2026</div>
        {brand ? <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, opacity: 0.6, marginTop: 12 }}>{brand}</div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ at: number; peak?: number }> = ({ at, peak = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: 'white',
        opacity: interpolate(frame, [at - 3, at, at + 9], [0, peak, 0], clamp),
        pointerEvents: 'none',
      }}
    />
  );
};

export const CumhuriyetStory: React.FC<CumhuriyetStoryProps> = ({ brand }) => (
  <AbsoluteFill style={{ background: INK, width: W, height: H }}>
    <CameraMotionBlur samples={6} shutterAngle={200}>
      <Sequence durationInFrames={62}>
        <Intro />
      </Sequence>
      <Sequence from={60} durationInFrames={360}>
        <Carousel />
      </Sequence>
      <Sequence from={420}>
        <Finale brand={brand} />
      </Sequence>
    </CameraMotionBlur>
    <Flash at={60} />
    <Flash at={420} />
    <Flash at={585} peak={0.75} />
    <Audio src={staticFile('cumhuriyet-marsi.wav')} />
  </AbsoluteFill>
);
