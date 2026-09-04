import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "velaris-workitem-overrides-v1";

/** Per work item, a bag of opaque per-block values (answers, approvals, edits, etc.)
 *  keyed by block id. The shape of each value is defined by the block/work item
 *  that owns it — the store itself never interprets it. */
export type WorkItemOverrides = Record<string, Record<string, unknown>>;

interface WorkItemOverridesContextValue {
  getOverrides: (workItemId: string) => Record<string, unknown>;
  setOverride: (workItemId: string, blockId: string, value: unknown) => void;
  resetOverrides: (workItemId: string) => void;
}

const WorkItemOverridesContext = createContext<WorkItemOverridesContextValue | null>(null);

function load(): WorkItemOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function WorkItemOverridesProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<WorkItemOverrides>(() => load());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // best-effort persistence only
    }
  }, [all]);

  const value = useMemo<WorkItemOverridesContextValue>(
    () => ({
      getOverrides: (workItemId) => all[workItemId] ?? {},
      setOverride: (workItemId, blockId, val) => {
        setAll((prev) => ({
          ...prev,
          [workItemId]: { ...(prev[workItemId] ?? {}), [blockId]: val },
        }));
      },
      resetOverrides: (workItemId) => {
        setAll((prev) => {
          const next = { ...prev };
          delete next[workItemId];
          return next;
        });
      },
    }),
    [all],
  );

  return <WorkItemOverridesContext.Provider value={value}>{children}</WorkItemOverridesContext.Provider>;
}

export function useWorkItemOverrides(workItemId: string | null) {
  const ctx = useContext(WorkItemOverridesContext);
  if (!ctx) throw new Error("useWorkItemOverrides must be used inside a WorkItemOverridesProvider");
  const overrides = workItemId ? ctx.getOverrides(workItemId) : {};
  const setOverride = (blockId: string, val: unknown) => {
    if (workItemId) ctx.setOverride(workItemId, blockId, val);
  };
  return { overrides, setOverride };
}
