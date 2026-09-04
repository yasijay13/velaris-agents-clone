import { useEffect, useRef } from "react";

/**
 * "Waveform" avatar style — a colored animated equalizer/bar-graph badge.
 * Presets are a plain palette of shape + color combinations (no names) so the
 * picker in the Agent Builder reads as "pick a look", not "pick an identity".
 */

type WaveformShape =
  | "comms"
  | "onboarding"
  | "renewal"
  | "account_planning"
  | "expansion"
  | "risk";

export interface WaveformPreset {
  id: string;
  shape: WaveformShape;
  color: string;
}

// A curated shape x color palette — six bar silhouettes, each offered in a
// few different colors, purely as a visual choice.
export const WAVEFORM_PRESETS: WaveformPreset[] = [
  { id: "w1", shape: "onboarding", color: "#5358F8" },
  { id: "w2", shape: "onboarding", color: "#0ABBB6" },
  { id: "w3", shape: "onboarding", color: "#E8497A" },
  { id: "w4", shape: "renewal", color: "#F5911E" },
  { id: "w5", shape: "renewal", color: "#2A82D6" },
  { id: "w6", shape: "renewal", color: "#12A16B" },
  { id: "w7", shape: "risk", color: "#E8497A" },
  { id: "w8", shape: "risk", color: "#5358F8" },
  { id: "w9", shape: "risk", color: "#F5911E" },
  { id: "w10", shape: "account_planning", color: "#0ABBB6" },
  { id: "w11", shape: "account_planning", color: "#2A82D6" },
  { id: "w12", shape: "account_planning", color: "#8B5CF6" },
  { id: "w13", shape: "expansion", color: "#12A16B" },
  { id: "w14", shape: "expansion", color: "#E8497A" },
  { id: "w15", shape: "expansion", color: "#0ABBB6" },
  { id: "w16", shape: "comms", color: "#2A82D6" },
  { id: "w17", shape: "comms", color: "#F5911E" },
  { id: "w18", shape: "comms", color: "#12A16B" },
];

export function getWaveformPreset(id?: string): WaveformPreset {
  return WAVEFORM_PRESETS.find((p) => p.id === id) ?? WAVEFORM_PRESETS[0];
}

// Per-shape baseline "envelope" — relative bar heights (0..1), left to right.
const SHAPE_ENVELOPE: Record<WaveformShape, number[]> = {
  comms: [0.35, 0.55, 0.8, 0.5, 0.95, 0.5, 0.8, 0.55, 0.35],
  onboarding: [0.25, 0.35, 0.48, 0.6, 0.72, 0.84, 0.94, 1.0, 0.7],
  renewal: [0.55, 0.8, 0.95, 0.7, 0.45, 0.7, 0.95, 0.8, 0.55],
  account_planning: [0.4, 0.4, 0.65, 0.65, 0.9, 0.9, 0.65, 0.65, 0.4],
  expansion: [0.3, 0.45, 0.65, 0.85, 1.0, 0.85, 0.65, 0.45, 0.3],
  risk: [0.4, 0.3, 0.5, 0.35, 1.0, 0.3, 0.55, 0.3, 0.45],
};

function hexToRgb(hex: string) {
  const v = hex.replace("#", "");
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawWaveformFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  bars: number[],
  envelope: number[],
  color: string,
  t: number,
  animated: boolean,
) {
  const { r, g, b } = hexToRgb(color);
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = `rgba(${r},${g},${b},0.1)`;
  ctx.fillRect(0, 0, size, size);

  const barCount = envelope.length;
  const gap = size * 0.045;
  const totalGap = gap * (barCount - 1);
  const barWidth = (size * 0.72 - totalGap) / barCount;
  const areaHeight = size * 0.56;
  const baseY = size * 0.78;
  const startX = (size - (barWidth * barCount + totalGap)) / 2;

  for (let i = 0; i < barCount; i++) {
    const wobble = animated ? Math.sin(t * (1.4 + i * 0.18) + i * 1.1) * 0.16 : 0;
    const target = Math.max(0.08, Math.min(1, envelope[i] + wobble));
    bars[i] += (target - bars[i]) * (animated ? 0.12 : 1);
    const h = Math.max(size * 0.06, bars[i] * areaHeight);
    const x = startX + i * (barWidth + gap);
    const y = baseY - h;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(${r},${g},${b},0.35)`;
    roundRect(ctx, x - barWidth * 0.25, y - barWidth * 0.25, barWidth * 1.5, h + barWidth * 0.5, barWidth * 0.5);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    roundRect(ctx, x, y, barWidth, h, barWidth * 0.45);
    ctx.fill();
  }

  ctx.restore();
}

export default function WaveformAvatar({
  presetId,
  size = 56,
  animated = true,
}: {
  presetId?: string;
  size?: number;
  animated?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>(new Array(9).fill(0.3));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const preset = getWaveformPreset(presetId);
    const envelope = SHAPE_ENVELOPE[preset.shape];
    barsRef.current = envelope.map((v) => v * 0.4);
    const start = performance.now();
    let raf = 0;

    function frame(now: number) {
      const t = (now - start) / 1000;
      drawWaveformFrame(ctx!, size, barsRef.current, envelope, preset.color, t, animated);
      if (animated) raf = requestAnimationFrame(frame);
    }

    if (animated) {
      raf = requestAnimationFrame(frame);
    } else {
      frame(start);
    }

    return () => cancelAnimationFrame(raf);
  }, [presetId, size, animated]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: "block", borderRadius: "9999px" }}
      aria-hidden="true"
    />
  );
}
