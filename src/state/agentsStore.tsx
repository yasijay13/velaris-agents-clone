import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { customAgents as seedAgents, type CustomAgent } from "../data/agents";

const STORAGE_KEY = "velaris-agents-added-v1";

interface AgentsContextValue {
  agents: CustomAgent[];
  addAgent: (agent: CustomAgent) => void;
  getBySlug: (slug: string) => CustomAgent | undefined;
  getByExpertSlug: (expertSlug: string) => CustomAgent | undefined;
  updateAgent: (slug: string, patch: Partial<CustomAgent>) => void;
  removeAgent: (slug: string) => void;
}

const AgentsContext = createContext<AgentsContextValue | null>(null);

function loadAdded(): CustomAgent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [added, setAdded] = useState<CustomAgent[]>(() => loadAdded());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(added));
    } catch {
      // best-effort persistence only
    }
  }, [added]);

  const [seedOverrides, setSeedOverrides] = useState<Record<string, Partial<CustomAgent>>>({});

  const agents = useMemo(
    () => [
      ...seedAgents.map((a) => (seedOverrides[a.slug] ? { ...a, ...seedOverrides[a.slug] } : a)),
      ...added,
    ],
    [added, seedOverrides],
  );

  const value = useMemo<AgentsContextValue>(
    () => ({
      agents,
      addAgent: (agent) => setAdded((prev) => [agent, ...prev]),
      getBySlug: (slug) => agents.find((a) => a.slug === slug),
      getByExpertSlug: (expertSlug) => agents.find((a) => a.poweredBy?.expertSlug === expertSlug),
      updateAgent: (slug, patch) => {
        if (seedAgents.some((a) => a.slug === slug)) {
          setSeedOverrides((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));
        } else {
          setAdded((prev) => prev.map((a) => (a.slug === slug ? { ...a, ...patch } : a)));
        }
      },
      removeAgent: (slug) => {
        if (seedAgents.some((a) => a.slug === slug)) {
          setSeedOverrides((prev) => ({ ...prev, [slug]: { ...prev[slug], status: "Paused" } }));
        } else {
          setAdded((prev) => prev.filter((a) => a.slug !== slug));
        }
      },
    }),
    [agents],
  );

  return <AgentsContext.Provider value={value}>{children}</AgentsContext.Provider>;
}

export function useAgents() {
  const ctx = useContext(AgentsContext);
  if (!ctx) throw new Error("useAgents must be used inside an AgentsProvider");
  return ctx;
}

export function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || `agent-${Math.random().toString(36).slice(2, 8)}`;
}
