import { useState } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import HeroBanner from "../components/HeroBanner";
import AgentCard from "../components/AgentCard";
import ExpertCard from "../components/ExpertCard";
import ExpertPreviewDrawer from "../components/ExpertPreviewDrawer";
import { expertAgents, expertCategories } from "../data/experts";
import { useAgents } from "../state/agentsStore";

type Tab = "Custom" | "Experts";

export default function AgentsPage() {
  const [tab, setTab] = useState<Tab>("Custom");
  const [category, setCategory] = useState("All");
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const { agents, getByExpertSlug } = useAgents();
  const previewExpert = previewSlug ? expertAgents.find((e) => e.slug === previewSlug) : undefined;

  return (
    <main className="min-w-0 flex-1">
      <div className="mx-auto max-w-[1280px] px-8 py-8">
        <header>
          <h1 className="text-[26px] font-semibold tracking-tight">Agents</h1>
          <p className="mt-1.5 max-w-2xl text-[14px] text-muted-foreground">
            AI teammates that monitor, reason and act across your customer workflows.
          </p>
          <div className="mt-5">
            <HeroBanner />
          </div>
        </header>

        <div className="mt-7 flex items-center gap-6 border-b border-border">
          <TabButton label="Custom" active={tab === "Custom"} onClick={() => setTab("Custom")} />
          <TabButton label="Experts" active={tab === "Experts"} onClick={() => setTab("Experts")} />
        </div>

        {tab === "Custom" ? (
          <section className="pt-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="mr-auto text-[13px] text-muted-foreground">
                Build agents around the workflows unique to your team.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search agents"
                  className="h-9 w-64 rounded-lg border border-border bg-card pl-8 pr-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
                />
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground/80 transition-colors hover:bg-muted"
              >
                Status
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground/80 transition-colors hover:bg-muted"
              >
                Created by
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                type="button"
                className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Create agent
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent, i) => (
                <AgentCard key={agent.slug} agent={agent} seedIndex={i} />
              ))}
            </div>
          </section>
        ) : (
          <section className="pt-6">
            <p className="text-[13px] text-muted-foreground">
              Activate specialists built for the most important Customer Success workflows.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {expertCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`h-8 rounded-full border px-3 text-[12.5px] font-medium transition-colors ${
                    category === c
                      ? "border-foreground/15 bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {expertAgents
                .filter((e) => category === "All" || e.category === category)
                .map((expert) => (
                  <ExpertCard
                    key={expert.slug}
                    expert={expert}
                    onPreview={() => setPreviewSlug(expert.slug)}
                  />
                ))}
            </div>
          </section>
        )}
      </div>

      {previewExpert && (
        <ExpertPreviewDrawer
          expert={previewExpert}
          addedAgent={getByExpertSlug(previewExpert.slug)}
          onClose={() => setPreviewSlug(null)}
        />
      )}
    </main>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-0.5 pb-3 text-[14px] font-medium transition-colors ${
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
