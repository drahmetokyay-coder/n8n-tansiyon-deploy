import { useLayoutEffect, useMemo, useRef } from 'react';
import { RED } from './theme';

// Türk Bayrağı Kanunu oranları, G (genişlik) = 1000 birim, boy = 1.5 G
const G = 1000;
const OUTER = { cx: 0.5 * G, r: 0.25 * G };
const INNER = { cx: 0.5 * G + 0.0625 * G, r: 0.2 * G };
const STAR = { cx: INNER.cx - INNER.r + G / 3, r: 0.125 * G };

const starPoints = (cx: number, cy: number, R: number) => {
  const r = R * 0.381966;
  return new Array(10)
    .fill(0)
    .map((_, i) => {
      // bir ucu hilale (gönder tarafına) bakar
      const angle = Math.PI + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? R : r;
      return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`;
    })
    .join(' ');
};

export const CrescentStar: React.FC<{ color?: string; cutout?: string }> = ({
  color = 'white',
  cutout = RED,
}) => (
  <>
    <circle cx={OUTER.cx} cy={G / 2} r={OUTER.r} fill={color} />
    <circle cx={INNER.cx} cy={G / 2} r={INNER.r} fill={cutout} />
    <polygon points={starPoints(STAR.cx, G / 2, STAR.r)} fill={color} />
  </>
);

const drawFlag = (ctx: CanvasRenderingContext2D, k: number) => {
  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, 1.5 * G * k, G * k);
  const disc = (cx: number, r: number, color: string) => {
    ctx.beginPath();
    ctx.arc(cx * k, (G / 2) * k, r * k, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };
  disc(OUTER.cx, OUTER.r, 'white');
  disc(INNER.cx, INNER.r, RED);
  ctx.beginPath();
  starPoints(STAR.cx, G / 2, STAR.r)
    .split(' ')
    .forEach((pt, i) => {
      const [x, y] = pt.split(',').map(Number);
      if (i === 0) {
        ctx.moveTo(x * k, y * k);
      } else {
        ctx.lineTo(x * k, y * k);
      }
    });
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();
};

// Bayrak her piksel sütunu ayrı kaydırılarak canvas'a çizilir (dikiş/şerit izi oluşmaz)
export const WavingFlag: React.FC<{
  width: number;
  frame: number;
  amplitude?: number;
  speed?: number;
}> = ({ width, frame, amplitude = 0.05, speed = 0.22 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const k = width / (1.5 * G);
  const flagH = Math.round(G * k);
  const pad = Math.round(0.1 * flagH);

  const art = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = flagH;
    drawFlag(c.getContext('2d') as CanvasRenderingContext2D, k);
    return c;
  }, [width, flagH, k]);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, width, flagH + 2 * pad);
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      const phase = u * Math.PI * 2.4 - frame * speed;
      // gönder tarafı sabit, uç tarafı daha çok dalgalanır
      const reach = 0.2 + 0.8 * u;
      const dy = pad + amplitude * flagH * Math.sin(phase) * reach;
      const slope = Math.cos(phase) * reach;
      ctx.drawImage(art, x, 0, 1, flagH, x, dy, 1, flagH);
      ctx.fillStyle = slope > 0 ? `rgba(255,255,255,${slope * 0.16})` : `rgba(0,0,0,${-slope * 0.26})`;
      ctx.fillRect(x, dy, 1, flagH);
    }
  }, [art, width, flagH, pad, frame, amplitude, speed]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={flagH + 2 * pad}
      style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.45))' }}
    />
  );
};
