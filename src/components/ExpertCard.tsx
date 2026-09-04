import { Check, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { ExpertAgent } from "../data/experts";
import AnimatedAvatar from "./AnimatedAvatar";
import { useAgents } from "../state/agentsStore";

export default function ExpertCard({
  expert,
  onPreview,
}: {
  expert: ExpertAgent;
  onPreview: () => void;
}) {
  const { getByExpertSlug } = useAgents();
  const addedAgent = getByExpertSlug(expert.slug);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-foreground/15">
      <div className="flex items-start gap-3.5">
        <AnimatedAvatar avatar={expert.avatar} />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold tracking-tight">{expert.name}</span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
              Expert
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-muted-foreground">By Velaris</p>
        </div>
      </div>

      <p className="mt-3.5 text-[13px] leading-5 text-foreground/85">{expert.description}</p>

      <ul className="mt-3 space-y-1.5">
        {expert.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2 text-[12.5px] leading-5 text-muted-foreground">
            <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-success" />
            {bullet}
          </li>
        ))}
      </ul>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {expert.integrations.map((integration) => (
          <span
            key={integration}
            className="rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {integration}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[13px] font-medium transition-colors hover:bg-muted"
        >
          Preview
        </button>
        {addedAgent ? (
          <Link
            to={`/agents/${addedAgent.slug}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-muted px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/70"
          >
            <Check className="h-3.5 w-3.5" /> Added
          </Link>
        ) : (
          <Link
            to={`/agents/build/${expert.slug}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" /> Add agent
          </Link>
        )}
      </div>
    </div>
  );
}
