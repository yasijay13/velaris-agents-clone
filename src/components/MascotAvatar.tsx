import { useEffect, useRef } from "react";

export type MascotShape = "case" | "wallet" | "pie" | "shield" | "calendar" | "cube";

export interface MascotSpec {
  shape: MascotShape;
  light: string;
  base: string;
  dark: string;
  eyeCenter: [number, number]; // viewBox 0-64 coords
  eyeGap: number;
}

const SHAPE_PATHS: Record<MascotShape, (id: string) => JSX.Element> = {
  case: (id) => (
    <>
      <rect x="9" y="16" width="14" height="10" rx="4" fill={`url(#${id}-dark)`} />
      <rect x="6" y="20" width="52" height="38" rx="14" fill={`url(#${id}-fill)`} />
    </>
  ),
  wallet: (id) => (
    <>
      <rect x="6" y="14" width="46" height="42" rx="13" fill={`url(#${id}-fill)`} />
      <rect x="46" y="26" width="14" height="18" rx="7" fill={`url(#${id}-dark)`} />
    </>
  ),
  pie: (id) => (
    <path
      d="M32 6 A26 26 0 1 1 8.4 20.2 L32 32 Z"
      fill={`url(#${id}-fill)`}
      stroke="none"
    />
  ),
  shield: (id) => (
    <path
      d="M32 4 L56 12 V30 C56 46 46 56 32 61 C18 56 8 46 8 30 V12 Z"
      fill={`url(#${id}-fill)`}
    />
  ),
  calendar: (id) => (
    <>
      <rect x="22" y="2" width="8" height="12" rx="4" fill={`url(#${id}-dark)`} />
      <rect x="34" y="2" width="8" height="12" rx="4" fill={`url(#${id}-dark)`} />
      <rect x="6" y="10" width="52" height="48" rx="12" fill={`url(#${id}-fill)`} />
    </>
  ),
  cube: (id) => (
    <>
      <path d="M32 4 L58 18 V46 L32 60 L6 46 V18 Z" fill={`url(#${id}-fill)`} />
      <path d="M32 4 L58 18 L32 32 L6 18 Z" fill={`url(#${id}-light)`} />
    </>
  ),
};

const EYE_CENTERS: Record<MascotShape, [number, number]> = {
  case: [32, 39],
  wallet: [27, 36],
  pie: [30, 26],
  shield: [32, 30],
  calendar: [32, 36],
  cube: [32, 40],
};

export const MASCOTS: Record<string, MascotSpec> = {
  "account-onboarding": { shape: "case", light: "#AFC1F5", base: "#7C93EA", dark: "#5A72C8", eyeCenter: EYE_CENTERS.case, eyeGap: 11 },
  "renewal-email": { shape: "wallet", light: "#F3C4A8", base: "#E29A72", dark: "#C1754E", eyeCenter: EYE_CENTERS.wallet, eyeGap: 10 },
  "health-digest": { shape: "pie", light: "#B7E3C2", base: "#7FC397", dark: "#519B6C", eyeCenter: EYE_CENTERS.pie, eyeGap: 10 },
  "ticket-escalation": { shape: "shield", light: "#F0B4B4", base: "#DE7F7F", dark: "#B95555", eyeCenter: EYE_CENTERS.shield, eyeGap: 10 },
  "exec-sponsor": { shape: "calendar", light: "#D2C1F0", base: "#A78BE0", dark: "#7E60BE", eyeCenter: EYE_CENTERS.calendar, eyeGap: 11 },
  "usage-drop": { shape: "cube", light: "#A9E4E8", base: "#69BFC6", dark: "#3F959D", eyeCenter: EYE_CENTERS.cube, eyeGap: 12 },
};

let listenerCount = 0;
const pointer = { x: 0, y: 0, active: false };

function usePointerTracking() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    listenerCount += 1;
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      listenerCount -= 1;
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
}

export default function MascotAvatar({
  slug,
  size = 56,
  seedIndex = 0,
}: {
  slug: string;
  size?: number;
  seedIndex?: number;
}) {
  usePointerTracking();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const spec = MASCOTS[slug] ?? MASCOTS["account-onboarding"];
  const id = `mascot-${slug}`;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const wrap = wrapRef.current;
      const pupils = pupilsRef.current;
      if (wrap && pupils) {
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = 0;
        let dy = 0;
        if (pointer.active) {
          const angle = Math.atan2(pointer.y - cy, pointer.x - cx);
          const dist = Math.min(1, Math.hypot(pointer.x - cx, pointer.y - cy) / 260);
          dx = Math.cos(angle) * dist * 2.6;
          dy = Math.sin(angle) * dist * 2.6;
        }
        pupils.setAttribute("transform", `translate(${dx.toFixed(2)},${dy.toFixed(2)})`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const [ex, ey] = spec.eyeCenter;
  const gap = spec.eyeGap;
  const blinkDelay = (seedIndex * 1.7) % 5;
  const breatheDelay = (seedIndex * 0.6) % 3;

  return (
    <div
      ref={wrapRef}
      className="mascot-avatar"
      style={{
        width: size,
        height: size,
        animationDelay: `${breatheDelay}s`,
      }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={spec.light} />
            <stop offset="100%" stopColor={spec.base} />
          </linearGradient>
          <linearGradient id={`${id}-dark`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={spec.base} />
            <stop offset="100%" stopColor={spec.dark} />
          </linearGradient>
          <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={spec.light} />
            <stop offset="100%" stopColor={spec.light} stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {SHAPE_PATHS[spec.shape](id)}

        <g
          className="mascot-blink"
          style={{ animationDelay: `${blinkDelay}s`, transformOrigin: `${ex}px ${ey}px` }}
        >
          <ellipse cx={ex - gap / 2} cy={ey} rx="5.4" ry="6.4" fill="#161616" />
          <ellipse cx={ex + gap / 2} cy={ey} rx="5.4" ry="6.4" fill="#161616" />
          <g ref={pupilsRef}>
            <circle cx={ex - gap / 2 + 1.6} cy={ey - 1.6} r="1.6" fill="#fff" opacity="0.95" />
            <circle cx={ex + gap / 2 + 1.6} cy={ey - 1.6} r="1.6" fill="#fff" opacity="0.95" />
          </g>
        </g>
      </svg>
    </div>
  );
}
