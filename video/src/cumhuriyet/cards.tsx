import { AbsoluteFill, interpolate, interpolateColors, spring } from 'remotion';
import { Fireworks, HyperlapseSky, LightStreaks, Rays, StarRush } from './effects';
import { CrescentStar, WavingFlag } from './TurkishFlag';
import { DEEP_RED, DISPLAY, FPS, GOLD, INK, RED, SERIF, W } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type CardProps = { frame: number };

// vuruşa oturan "çarpma" girişi: büyükten yerine oturur
export const slam = (frame: number, at: number, from = 1.8) => {
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 13, mass: 0.6 } });
  return {
    opacity: interpolate(frame - at, [0, 3], [0, 1], clamp),
    transform: `scale(${interpolate(s, [0, 1], [from, 1])})`,
  };
};

export const rise = (frame: number, at: number, distance = 70) => {
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 16 } });
  return {
    opacity: interpolate(frame - at, [0, 5], [0, 1], clamp),
    transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`,
    filter: `blur(${interpolate(frame - at, [0, 6], [12, 0], clamp)}px)`,
  };
};

const center: React.CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  color: 'white',
  fontFamily: DISPLAY,
};

// 1. kart: dalgalanan bayrak + "29 EKİM"
export const FlagCard: React.FC<CardProps> = ({ frame }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 38%, #3A0B14 0%, ${INK} 70%)` }}>
    <Rays frame={frame} speed={0.4} opacity={0.05} y="34%" />
    <AbsoluteFill style={{ alignItems: 'center', top: 330 }}>
      <WavingFlag width={960} frame={frame} amplitude={0.055} />
    </AbsoluteFill>
    <AbsoluteFill style={{ ...center, top: 1110, justifyContent: 'flex-start' }}>
      <div style={{ fontSize: 230, fontWeight: 900, letterSpacing: -4, lineHeight: 1, ...slam(frame, 0) }}>
        29 EKİM
      </div>
      <div
        style={{
          marginTop: 34,
          height: 10,
          borderRadius: 10,
          background: RED,
          width: interpolate(frame, [4, 18], [0, 520], clamp),
        }}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);

// 2. kart: "CUMHURİYET ilan edildi" + ışık izleri
export const RepublicCard: React.FC<CardProps> = ({ frame }) => {
  const word = 'CUMHURİYET';
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${RED} 0%, ${DEEP_RED} 100%)` }}>
      <AbsoluteFill style={{ ...center }}>
        <div
          style={{
            fontSize: 560,
            fontWeight: 900,
            color: 'transparent',
            WebkitTextStroke: '4px rgba(255,255,255,0.16)',
            transform: `translateX(${220 - frame * 7}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          1923
        </div>
      </AbsoluteFill>
      <LightStreaks frame={frame} speed={70} seed="rep" />
      <AbsoluteFill style={{ ...center }}>
        <div style={{ display: 'flex', fontSize: 128, fontWeight: 900, letterSpacing: -3 }}>
          {word.split('').map((ch, i) => (
            <span key={i} style={{ display: 'inline-block', ...rise(frame, i * 1.5, 120) }}>
              {ch}
            </span>
          ))}
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 104, marginTop: 10, ...rise(frame, 16) }}>
          ilan edildi
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 3. kart: "Egemenlik kayıtsız şartsız milletindir."
export const SovereigntyCard: React.FC<CardProps> = ({ frame }) => {
  const lines = [['Egemenlik'], ['kayıtsız', 'şartsız'], ['milletindir.']];
  let idx = 0;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <StarRush frame={frame} speed={0.005} count={140} />
      <AbsoluteFill style={{ ...center }}>
        <svg width={1700} viewBox="0 0 1500 1000" style={{ transform: `rotate(${-8 + frame * 0.18}deg)`, opacity: 0.09 }}>
          <CrescentStar color="white" cutout={INK} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ ...center, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700 }}>
        <div style={{ fontSize: 300, color: RED, lineHeight: 0.6, height: 150, ...slam(frame, 0, 2.4) }}>“</div>
        {lines.map((line, li) => (
          <div key={li} style={{ fontSize: 112, lineHeight: 1.12 }}>
            {line.map((w) => {
              const at = 2 + idx++ * 4;
              return (
                <span key={w} style={{ display: 'inline-block', margin: '0 16px', ...rise(frame, at, 50) }}>
                  {w}
                </span>
              );
            })}
          </div>
        ))}
        <div
          style={{
            fontFamily: DISPLAY,
            fontStyle: 'normal',
            fontWeight: 800,
            fontSize: 36,
            letterSpacing: 8,
            color: RED,
            marginTop: 60,
            ...rise(frame, 22, 30),
          }}
        >
          MUSTAFA KEMAL ATATÜRK
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 4. kart: Anıtkabir üzerinde gündüzden geceye hyperlapse
const SKY_DURATION = 72;
const Anitkabir: React.FC<{ night: number }> = ({ night }) => {
  const sil = '#0D0811';
  const glow = interpolateColors(night, [0, 1], ['#2B2030', '#F0B055']);
  const columns = 10;
  return (
    <svg width={W} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <rect x={250} y={1110} width={580} height={205} fill={glow} />
      <rect x={250} y={1110} width={580} height={205} fill={glow} opacity={night * 0.8} style={{ filter: 'blur(40px)' }} />
      {new Array(columns).fill(0).map((_, i) => (
        <rect key={i} x={262 + i * ((556 - 30) / (columns - 1))} y={1110} width={30} height={205} fill={sil} />
      ))}
      <rect x={232} y={1068} width={616} height={44} fill={sil} />
      <rect x={216} y={1050} width={648} height={20} fill={sil} />
      <rect x={226} y={1312} width={628} height={40} fill={sil} />
      <rect x={186} y={1350} width={708} height={50} fill={sil} />
      <rect x={140} y={1398} width={800} height={64} fill={sil} />
      <rect x={30} y={1400} width={140} height={62} fill={sil} />
      <rect x={910} y={1400} width={140} height={62} fill={sil} />
      <rect x={0} y={1460} width={W} height={460} fill="#08050B" />
      <rect x={112} y={760} width={10} height={700} fill={sil} />
    </svg>
  );
};

export const AtaturkCard: React.FC<CardProps> = ({ frame }) => {
  const local = frame + 10;
  const night = interpolate(local / SKY_DURATION, [0.55, 0.9], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <HyperlapseSky frame={local} duration={SKY_DURATION} />
      <Anitkabir night={night} />
      <div style={{ position: 'absolute', left: 120, top: 748 }}>
        <WavingFlag width={250} frame={frame} amplitude={0.07} speed={0.35} />
      </div>
      <LightStreaks frame={frame} top={1500} bottom={1650} count={20} speed={85} seed="road" colors={['#FF3B3B', '#FFFFFF', '#FFB347']} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 48%)' }} />
      <AbsoluteFill style={{ ...center, justifyContent: 'flex-start', top: 300 }}>
        <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: 7, ...rise(frame, 0, 30) }}>CUMHURİYETİMİZİN KURUCUSU</div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 86, marginTop: 18, ...rise(frame, 4) }}>
          Gazi Mustafa Kemal
        </div>
        <div style={{ fontSize: 168, fontWeight: 900, letterSpacing: -2, lineHeight: 1, ...slam(frame, 8, 1.5) }}>ATATÜRK</div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: 3, marginTop: 26, color: GOLD, ...rise(frame, 18, 30) }}>
          saygı ve minnetle anıyoruz
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 5. kart: hızla sayan "103. YIL"
export const YearCard: React.FC<CardProps> = ({ frame }) => {
  const count = Math.round(interpolate(frame, [0, 24], [0, 103], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${RED} 0%, ${DEEP_RED} 85%)` }}>
      <Rays frame={frame} speed={1.4} opacity={0.1} />
      <Fireworks
        frame={frame}
        bursts={[
          { at: 24, x: 250, y: 470, color: GOLD, size: 260 },
          { at: 29, x: 840, y: 560, color: 'white', size: 240 },
        ]}
      />
      <AbsoluteFill style={{ ...center }}>
        <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: 12, ...rise(frame, 0, 30) }}>1923 — 2026</div>
        <div
          style={{
            fontSize: 330,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -10,
            fontVariantNumeric: 'tabular-nums',
            transform: `scale(${interpolate(frame - 24, [0, 3, 12], [1, 1.12, 1], clamp)})`,
            textShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}
        >
          {count}.
        </div>
        <div style={{ fontSize: 150, fontWeight: 900, lineHeight: 0.9, letterSpacing: 10, ...slam(frame, 24, 2) }}>YIL</div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 70, marginTop: 50, ...rise(frame, 30) }}>
          Cumhuriyetimiz 103 yaşında!
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 6. kart: "Türkiye Cumhuriyeti ilelebet payidar kalacaktır."
export const EternalCard: React.FC<CardProps> = ({ frame }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #1B0A14 0%, ${INK} 75%)` }}>
    <StarRush frame={frame} speed={0.016} count={240} color={GOLD} />
    <AbsoluteFill style={{ ...center }}>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 88, ...rise(frame, 0) }}>
        Türkiye Cumhuriyeti
      </div>
      <div
        style={{
          fontSize: 158,
          fontWeight: 900,
          letterSpacing: -2,
          lineHeight: 1.05,
          marginTop: 20,
          background: `linear-gradient(180deg, #FFF3C4 0%, ${GOLD} 45%, #C8892B 100%)`,
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          ...slam(frame, 6),
        }}
      >
        İLELEBET
      </div>
      <div style={{ fontSize: 158, fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, ...slam(frame, 12) }}>PAYİDAR</div>
      <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 2, ...slam(frame, 18) }}>KALACAKTIR.</div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 8, color: RED, marginTop: 50, ...rise(frame, 26, 30) }}>
        MUSTAFA KEMAL ATATÜRK
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const CARDS = [FlagCard, RepublicCard, SovereigntyCard, AtaturkCard, YearCard, EternalCard];
