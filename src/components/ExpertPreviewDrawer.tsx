import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Check, ArrowRight } from "lucide-react";
import type { ExpertAgent } from "../data/experts";
import type { CustomAgent } from "../data/agents";
import AnimatedAvatar from "./AnimatedAvatar";

export default function ExpertPreviewDrawer({
  expert,
  addedAgent,
  onClose,
}: {
  expert: ExpertAgent;
  addedAgent?: CustomAgent;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
      />
      <aside className="relative flex h-full w-full max-w-[480px] flex-col bg-card shadow-2xl animate-[drawer-in_0.22s_ease-out]">
        <style>{`@keyframes drawer-in { from { transform: translateX(24px); opacity: 0.4 } to { transform: translateX(0); opacity: 1 } }`}</style>

        <div className="flex items-start gap-3.5 border-b border-border px-6 pb-5 pt-6">
          <AnimatedAvatar avatar={expert.avatar} />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[17px] font-semibold tracking-tight">{expert.name}</h2>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
                Velaris Expert
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{expert.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {/* 1. The outcome it owns */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-primary">
              The outcome it owns
            </p>
            <p className="mt-1.5 text-[15px] font-semibold leading-6 tracking-tight text-foreground">
              {expert.outcome.statement}
            </p>
            {expert.outcome.supportingText && (
              <p className="mt-2 text-[12.5px] leading-5 text-muted-foreground">{expert.outcome.supportingText}</p>
            )}
            {expert.capabilityNote && (
              <div className="mt-3 space-y-1 border-t border-primary/15 pt-3">
                <p className="text-[12px] leading-5 text-foreground/80">
                  <span className="font-semibold">Current capability:</span> {expert.capabilityNote.current}
                </p>
                <p className="text-[12px] leading-5 text-muted-foreground">
                  <span className="font-semibold text-foreground/70">Planned next:</span>{" "}
                  {expert.capabilityNote.plannedNext}
                </p>
              </div>
            )}
          </div>

          {/* 2. How it works */}
          <section className="mt-6">
            <h3 className="text-[13px] font-semibold tracking-tight">How it works</h3>
            <ol className="mt-3 space-y-3.5">
              {expert.howItWorks.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground/70">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium leading-5">{step.title}</p>
                    <p className="mt-0.5 text-[12.5px] leading-5 text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 3. What it can do */}
          <section className="mt-6">
            <h3 className="text-[13px] font-semibold tracking-tight">What it can do</h3>
            <ul className="mt-3 space-y-1.5">
              {expert.doesOnItsOwn.map((item) => (
                <li key={item} className="flex gap-2 text-[12.5px] leading-5 text-foreground/80">
                  <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Where you stay in control */}
          <section className="mt-6">
            <h3 className="text-[13px] font-semibold tracking-tight">Where you stay in control</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Does on its own
                </p>
                <ul className="mt-2 space-y-1.5">
                  {expert.doesOnItsOwn.map((item) => (
                    <li key={item} className="flex gap-1.5 text-[12px] leading-[17px] text-foreground/80">
                      <Check className="mt-[2px] h-3 w-3 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Comes to you first
                </p>
                <ul className="mt-2 space-y-1.5">
                  {expert.comesToYouFirst.map((item) => (
                    <li key={item} className="flex gap-1.5 text-[12px] leading-[17px] text-foreground/80">
                      <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-warning" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Context it uses */}
          <section className="mt-6">
            <h3 className="text-[13px] font-semibold tracking-tight">Context it uses</h3>
            <ul className="mt-3 space-y-1.5">
              {expert.contextItReads.map((item) => (
                <li key={item} className="flex gap-2 text-[12.5px] leading-5 text-muted-foreground">
                  <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 6. How success is measured — KPI names only, no numbers yet */}
          <section className="mt-6">
            <h3 className="text-[13px] font-semibold tracking-tight">How success is measured</h3>
            <p className="mt-1 text-[11.5px] leading-4 text-muted-foreground">
              These metrics start tracking once this agent is activated.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {expert.successMeasures.map((metric) => (
                <span
                  key={metric}
                  className="rounded-md bg-muted px-2 py-1 text-[11.5px] font-medium text-foreground/80"
                >
                  {metric}
                </span>
              ))}
            </div>
          </section>

          {/* 7. Systems it works with */}
          <section className="mt-6">
            <h3 className="text-[13px] font-semibold tracking-tight">Systems it works with</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {expert.integrations.map((integration) => (
                <span
                  key={integration}
                  className="rounded-md border border-border px-2 py-1 text-[11.5px] text-muted-foreground"
                >
                  {integration}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="border-t border-border bg-card px-6 py-4">
          <p className="text-[11.5px] leading-[17px] text-muted-foreground">
            Activating creates an agent you own. You can pause it, narrow its scope or remove it at any
            time.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[13px] font-medium transition-colors hover:bg-muted"
            >
              Not now
            </button>
            {addedAgent ? (
              <Link
                to={`/agents/${addedAgent.slug}`}
                className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-muted px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/70"
              >
                <Check className="h-3.5 w-3.5" /> View agent
              </Link>
            ) : (
              <Link
                to={`/agents/build/${expert.slug}`}
                className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Open agent <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
