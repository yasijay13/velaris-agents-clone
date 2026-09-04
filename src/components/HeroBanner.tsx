import { withBase } from "../lib/assetUrl";

export default function HeroBanner() {
  return (
    <div className="relative isolate overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative z-10 flex min-h-[124px] items-center px-7 py-6 pr-[36%] sm:pr-[30%]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
            Velaris AI workforce
          </p>
          <h2 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            Customer Success — without the busywork.
          </h2>
          <p className="mt-1.5 max-w-md text-[13px] leading-5 text-foreground/60">
            Agents monitor accounts, prepare the work and bring you only the moments that need a
            human.
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[54%] sm:w-[48%]">
        <video
          src={withBase("/assets/agents-banner.mp4")}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, oklch(from var(--card) l c h / 1) 0%, oklch(from var(--card) l c h / 0.8) 14%, oklch(from var(--card) l c h / 0.35) 36%, oklch(from var(--card) l c h / 0.05) 58%, transparent 72%)",
          }}
        />
      </div>
    </div>
  );
}
