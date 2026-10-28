import { AbsoluteFill, interpolate, interpolateColors, random } from 'remotion';
import { H, W } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type Burst = { at: number; x: number; y: number; color: string; size?: number };

export const Fireworks: React.FC<{ frame: number; bursts: Burst[] }> = ({ frame, bursts }) => (
  <AbsoluteFill>
    <svg width={W} height={H}>
      {bursts.map((b, bi) => {
        const t = frame - b.at;
        if (t < 0 || t > 55) {
          return null;
        }
        const size = b.size ?? 340;
        const count = 64;
        const fade = Math.pow(interpolate(t, [0, 55], [1, 0], clamp), 1.3);
        const pos = (tt: number, angle: number, speed: number) => {
          const dist = speed * (1 - Math.exp(-Math.max(tt, 0) / 9));
          return [b.x + Math.cos(angle) * dist, b.y + Math.sin(angle) * dist + 0.07 * tt * tt];
        };
        return (
          <g key={bi}>
            <circle cx={b.x} cy={b.y} r={interpolate(t, [0, 6], [10, 160], clamp)} fill={b.color} opacity={interpolate(t, [0, 8], [0.6, 0], clamp)} />
            {new Array(count).fill(0).map((_, i) => {
              const angle = (i / count) * Math.PI * 2 + random(`fw-a-${bi}-${i}`) * 0.12;
              const speed = size * (0.55 + 0.45 * random(`fw-s-${bi}-${i}`));
              const [x, y] = pos(t, angle, speed);
              const [px, py] = pos(t - 5, angle, speed);
              const flicker = 0.65 + 0.35 * Math.sin(t * 1.9 + i * 2.3);
              return (
                <g key={i} opacity={fade * flicker}>
                  <line x1={px} y1={py} x2={x} y2={y} stroke={b.color} strokeWidth={5} strokeLinecap="round" />
                  <circle cx={x} cy={y} r={4.5} fill="white" />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);

// hyperlapse trafik / ışık izleri
export const LightStreaks: React.FC<{
  frame: number;
  count?: number;
  colors?: string[];
  top?: number;
  bottom?: number;
  speed?: number;
  seed?: string;
}> = ({ frame, count = 26, colors = ['white'], top = 0, bottom = H, speed = 60, seed = 'ls' }) => (
  <AbsoluteFill>
    {new Array(count).fill(0).map((_, i) => {
      const len = 220 + 700 * random(`${seed}-l-${i}`);
      const v = speed * (0.6 + 0.8 * random(`${seed}-v-${i}`));
      const span = W + len * 2;
      const x = ((random(`${seed}-x-${i}`) * span * 4 - frame * v) % span + span) % span - len;
      const y = top + (bottom - top) * random(`${seed}-y-${i}`);
      const color = colors[i % colors.length];
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: len,
            height: 2 + 7 * random(`${seed}-h-${i}`),
            borderRadius: 8,
            background: `linear-gradient(90deg, ${color}, transparent)`,
            opacity: 0.25 + 0.6 * random(`${seed}-o-${i}`),
            boxShadow: `0 0 18px ${color}`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

// kameraya doğru akan yıldızlar (hiperuzay / hyperlapse dolly)
export const StarRush: React.FC<{ frame: number; speed?: number; count?: number; color?: string }> = ({
  frame,
  speed = 0.012,
  count = 220,
  color = 'white',
}) => {
  const project = (sx: number, sy: number, z: number) => [W / 2 + (sx / z) * 260, H / 2 + (sy / z) * 260];
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        {new Array(count).fill(0).map((_, i) => {
          const sx = random(`sr-x-${i}`) * 2 - 1;
          const sy = (random(`sr-y-${i}`) * 2 - 1) * 1.8;
          const z = ((random(`sr-z-${i}`) - frame * speed) % 1 + 1) % 1 + 0.02;
          const [x, y] = project(sx, sy, z);
          const [px, py] = project(sx, sy, z + speed * 5);
          return (
            <line
              key={i}
              x1={px}
              y1={py}
              x2={x}
              y2={y}
              stroke={color}
              strokeWidth={Math.min(6, 1.2 / z)}
              strokeLinecap="round"
              opacity={Math.min(1, (1 - z) * 1.4)}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Rays: React.FC<{ frame: number; speed?: number; opacity?: number; y?: string }> = ({
  frame,
  speed = 0.5,
  opacity = 0.12,
  y = '45%',
}) => (
  <AbsoluteFill
    style={{
      background: `repeating-conic-gradient(from ${frame * speed}deg at 50% ${y}, rgba(255,255,255,${opacity}) 0deg 7deg, transparent 7deg 20deg)`,
    }}
  />
);

// gündüzden geceye hızlandırılmış gökyüzü
export const HyperlapseSky: React.FC<{ frame: number; duration: number }> = ({ frame, duration }) => {
  const u = interpolate(frame, [0, duration], [0, 1], clamp);
  const stops = [0, 0.35, 0.6, 0.8, 1];
  const top = interpolateColors(u, stops, ['#3E8FD8', '#2F6DB5', '#6B2E7E', '#141A3D', '#060914']);
  const bottom = interpolateColors(u, stops, ['#BFE3F7', '#FFC27A', '#FF6B4A', '#5A2A5E', '#1A1430']);
  const night = interpolate(u, [0.55, 0.9], [0, 1], clamp);
  const cloudTint = interpolateColors(u, [0, 0.4, 0.65, 1], ['#FFFFFF', '#FFE2C0', '#FF9E8A', '#3B3557']);
  const sunX = 140 + 820 * u;
  const sunY = 1500 - 1050 * Math.sin(Math.PI * Math.min(u * 1.35, 1));

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 78%)` }}>
      <AbsoluteFill style={{ opacity: night }}>
        {new Array(110).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: random(`st-x-${i}`) * W,
              top: random(`st-y-${i}`) * 1350,
              width: 2 + 3 * random(`st-s-${i}`),
              height: 2 + 3 * random(`st-s-${i}`),
              borderRadius: 4,
              background: 'white',
              opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.3 + i)),
            }}
          />
        ))}
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: sunX - 70,
          top: sunY - 70,
          width: 140,
          height: 140,
          borderRadius: 70,
          background: '#FFF4D6',
          boxShadow: '0 0 120px 60px rgba(255,200,120,0.55)',
          opacity: 1 - night,
        }}
      />
      {new Array(10).fill(0).map((_, i) => {
        const speed = 22 + 26 * random(`cl-v-${i}`);
        const span = W + 900;
        const x = ((random(`cl-x-${i}`) * span * 3 - frame * speed) % span + span) % span - 450;
        const y = 120 + 1050 * random(`cl-y-${i}`);
        const s = 0.6 + 0.9 * random(`cl-s-${i}`);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `scale(${s})`, opacity: 0.85 - 0.45 * night }}>
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                style={{
                  position: 'absolute',
                  left: j * 110 - 40 * (j % 2),
                  top: -40 * (j === 1 ? 1 : 0),
                  width: 260,
                  height: 110,
                  borderRadius: 120,
                  background: cloudTint,
                  filter: 'blur(14px)',
                }}
              />
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
