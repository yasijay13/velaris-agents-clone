import { Lock, Ellipsis } from "lucide-react";
import { Link } from "react-router-dom";
import { statusDotClass, type CustomAgent } from "../data/agents";
import AgentAvatar from "./AgentAvatar";
import PoweredByBadge from "./PoweredByBadge";

export default function AgentCard({ agent, seedIndex = 0 }: { agent: CustomAgent; seedIndex?: number }) {
  return (
    <Link
      to={`/agents/${agent.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-colors hover:border-foreground/15"
    >
      <div className="h-[58px] bg-[var(--card-band)]" />
      <div className="-mt-7 px-4 pb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-card bg-card">
          <AgentAvatar agent={agent} size={44} seedIndex={seedIndex} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold tracking-tight">{agent.name}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Custom
          </span>
          <span className="ml-auto flex items-center gap-2 text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className={`h-2 w-2 rounded-full ${statusDotClass[agent.status]}`} />
            <span className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100">
              <Ellipsis className="h-4 w-4" />
            </span>
          </span>
        </div>
        {agent.poweredBy && <PoweredByBadge poweredBy={agent.poweredBy} className="mt-1.5" />}
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
          {agent.description}
        </p>
        <div className="mt-3.5 flex items-center gap-2 border-t border-border pt-3 text-[12px] text-muted-foreground">
          <span>{agent.status}</span>
          <span className="text-border">·</span>
          <span>{agent.updatedAt}</span>
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground/60">
            {agent.assignee}
          </span>
        </div>
      </div>
    </Link>
  );
}
