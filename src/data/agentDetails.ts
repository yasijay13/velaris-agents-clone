import { expertAgents, type Tone } from "./experts";
import type { CustomAgent } from "./agents";

export type { Tone };

export interface AttentionItem {
  workItemId: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  tone: Tone;
  focusTarget?: string;
}

export interface StatTile {
  label: string;
  value: string;
}

export interface WorkColumnView {
  key: string;
  label: string;
}

export interface WorkRowView {
  id: string;
  account: string;
  segment: string;
  cells: Record<string, string>;
  statusTone: Tone | "neutral";
}

/** Unified Work-tab view: either resolved from an Expert's profile schema
 *  (via agent.poweredBy.expertSlug) or, for agents not built from an Expert,
 *  a generic fallback keyed by the agent's own slug. */
export interface AgentDetail {
  attention: AttentionItem[];
  stats: StatTile[];
  tableTitle: string;
  tableSubtitle: string;
  columns: WorkColumnView[];
  statusKey: string;
  rows: WorkRowView[];
}

/** Generic fallback details for Custom agents that were built in-house
 *  (not powered by an Expert), keyed by the agent's own slug. */
const genericAgentDetails: Record<string, AgentDetail> = {
  "account-onboarding": {
    attention: [
      { workItemId: "account-onboarding-norwood-logistics", title: "Norwood Logistics", subtitle: "Kickoff call hasn't been scheduled — 4 days past target", actionLabel: "Review", tone: "danger" },
      { workItemId: "account-onboarding-harlan-voss", title: "Harlan & Voss", subtitle: "Security questionnaire owner hasn't been assigned", actionLabel: "Assign owner", tone: "warning" },
      { workItemId: "account-onboarding-fintrace", title: "Fintrace", subtitle: "Milestone plan drafted — waiting on your approval to send", actionLabel: "Approve", tone: "success" },
    ],
    stats: [
      { label: "Avg. handover time", value: "6.2 days" },
      { label: "Active onboardings", value: "14" },
      { label: "On-time kickoff rate", value: "92%" },
      { label: "Needs your attention", value: "3" },
    ],
    tableTitle: "Accounts being onboarded",
    tableSubtitle: "Every account this agent is currently driving to a committed handover.",
    columns: [
      { key: "csm", label: "CSM" },
      { key: "progress", label: "Handover progress" },
      { key: "status", label: "Status" },
      { key: "nextAction", label: "Next action" },
      { key: "lastActivity", label: "Last activity" },
    ],
    statusKey: "status",
    rows: [
      { id: "account-onboarding-norwood-logistics", account: "Norwood Logistics", segment: "Enterprise · $340k", cells: { csm: "AR", progress: "35%", status: "At risk", nextAction: "Schedule kickoff", lastActivity: "4 hours ago" }, statusTone: "danger" },
      { id: "account-onboarding-harlan-voss", account: "Harlan & Voss", segment: "Mid-market · $95k", cells: { csm: "JD", progress: "55%", status: "In progress", nextAction: "Assign security owner", lastActivity: "Yesterday" }, statusTone: "warning" },
      { id: "account-onboarding-fintrace", account: "Fintrace", segment: "Enterprise · $610k", cells: { csm: "RS", progress: "80%", status: "In progress", nextAction: "Approve milestone plan", lastActivity: "2 hours ago" }, statusTone: "warning" },
      { id: "account-onboarding-ridgeline-co", account: "Ridgeline Co", segment: "SMB · $22k", cells: { csm: "ML", progress: "100%", status: "Complete", nextAction: "—", lastActivity: "3 days ago" }, statusTone: "success" },
      { id: "account-onboarding-berrick-supply", account: "Berrick Supply", segment: "Mid-market · $140k", cells: { csm: "AR", progress: "20%", status: "In progress", nextAction: "Confirm success criteria", lastActivity: "6 hours ago" }, statusTone: "warning" },
    ],
  },
  "renewal-email": {
    attention: [
      { workItemId: "renewal-email-castlemount", title: "Castlemount", subtitle: "Draft reply ready — pricing question needs your sign-off", actionLabel: "Review", tone: "warning" },
      { workItemId: "renewal-email-wren-analytics", title: "Wren Analytics", subtitle: "Thread has gone quiet for 6 days ahead of renewal", actionLabel: "Investigate", tone: "danger" },
    ],
    stats: [
      { label: "Threads handled", value: "48" },
      { label: "Awaiting your review", value: "2" },
      { label: "Avg. response time", value: "3.1 hrs" },
      { label: "Renewals on track", value: "89%" },
    ],
    tableTitle: "Active renewal threads",
    tableSubtitle: "Every renewal thread this agent is actively drafting or monitoring.",
    columns: [
      { key: "csm", label: "CSM" },
      { key: "progress", label: "Thread progress" },
      { key: "status", label: "Status" },
      { key: "nextAction", label: "Next action" },
      { key: "lastActivity", label: "Last activity" },
    ],
    statusKey: "status",
    rows: [
      { id: "renewal-email-castlemount", account: "Castlemount", segment: "Enterprise · $480k", cells: { csm: "JD", progress: "70%", status: "Needs attention", nextAction: "Approve pricing reply", lastActivity: "18 minutes ago" }, statusTone: "warning" },
      { id: "renewal-email-wren-analytics", account: "Wren Analytics", segment: "Mid-market · $76k", cells: { csm: "AR", progress: "40%", status: "At risk", nextAction: "Re-engage stakeholder", lastActivity: "6 days ago" }, statusTone: "danger" },
      { id: "renewal-email-solent-group", account: "Solent Group", segment: "Enterprise · $290k", cells: { csm: "RS", progress: "90%", status: "In progress", nextAction: "—", lastActivity: "1 hour ago" }, statusTone: "warning" },
    ],
  },
  "health-digest": {
    attention: [],
    stats: [
      { label: "Accounts summarised", value: "212" },
      { label: "Digests sent", value: "9" },
      { label: "Health score movement", value: "+3.4%" },
      { label: "Needs your attention", value: "0" },
    ],
    tableTitle: "Latest digest coverage",
    tableSubtitle: "Where the latest portfolio health digest was sent.",
    columns: [
      { key: "csm", label: "CSM" },
      { key: "progress", label: "Coverage" },
      { key: "status", label: "Status" },
      { key: "nextAction", label: "Next action" },
      { key: "lastActivity", label: "Last activity" },
    ],
    statusKey: "status",
    rows: [
      { id: "health-digest-all-active-accounts", account: "All active accounts", segment: "Portfolio-wide", cells: { csm: "CS team", progress: "100%", status: "Sent", nextAction: "—", lastActivity: "1 hour ago" }, statusTone: "success" },
    ],
  },
  "ticket-escalation": {
    attention: [
      { workItemId: "ticket-escalation-amberlane-retail", title: "Amberlane Retail", subtitle: "Ticket volume up 3x this week — pattern matches past escalation", actionLabel: "Investigate", tone: "danger" },
    ],
    stats: [
      { label: "Accounts watched", value: "86" },
      { label: "Patterns flagged", value: "5" },
      { label: "Avg. detection time", value: "1.8 days" },
      { label: "Needs your attention", value: "1" },
    ],
    tableTitle: "Accounts with rising ticket volume",
    tableSubtitle: "Accounts with support volume trending toward an escalation pattern.",
    columns: [
      { key: "csm", label: "CSM" },
      { key: "progress", label: "Risk level" },
      { key: "status", label: "Status" },
      { key: "nextAction", label: "Next action" },
      { key: "lastActivity", label: "Last activity" },
    ],
    statusKey: "status",
    rows: [
      { id: "ticket-escalation-amberlane-retail", account: "Amberlane Retail", segment: "Mid-market · $110k", cells: { csm: "ML", progress: "75%", status: "Escalating", nextAction: "Open save play", lastActivity: "2 hours ago" }, statusTone: "danger" },
      { id: "ticket-escalation-cobalt-systems", account: "Cobalt Systems", segment: "SMB · $34k", cells: { csm: "AR", progress: "30%", status: "Watching", nextAction: "—", lastActivity: "Yesterday" }, statusTone: "warning" },
    ],
  },
  "exec-sponsor": {
    attention: [
      { workItemId: "exec-sponsor-meridian-health", title: "Meridian Health", subtitle: "Exec sponsor left the company — no replacement identified", actionLabel: "Review", tone: "danger" },
    ],
    stats: [
      { label: "Enterprise accounts tracked", value: "34" },
      { label: "Sponsor changes this quarter", value: "4" },
      { label: "Coverage rebuilt", value: "3" },
      { label: "Needs your attention", value: "1" },
    ],
    tableTitle: "Sponsor coverage",
    tableSubtitle: "Enterprise accounts with a sponsor change this agent is tracking.",
    columns: [
      { key: "csm", label: "CSM" },
      { key: "progress", label: "Coverage rebuilt" },
      { key: "status", label: "Status" },
      { key: "nextAction", label: "Next action" },
      { key: "lastActivity", label: "Last activity" },
    ],
    statusKey: "status",
    rows: [
      { id: "exec-sponsor-meridian-health", account: "Meridian Health", segment: "Enterprise · $520k", cells: { csm: "AR", progress: "15%", status: "Gap open", nextAction: "Identify new sponsor", lastActivity: "3 hours ago" }, statusTone: "danger" },
      { id: "exec-sponsor-talus-financial", account: "Talus Financial", segment: "Enterprise · $650k", cells: { csm: "JD", progress: "100%", status: "Covered", nextAction: "—", lastActivity: "2 days ago" }, statusTone: "success" },
    ],
  },
  "usage-drop": {
    attention: [
      { workItemId: "usage-drop-brightfield-media", title: "Brightfield Media", subtitle: "Usage down 42% over 3 weeks — recovery play drafted", actionLabel: "Approve", tone: "success" },
    ],
    stats: [
      { label: "Accounts monitored", value: "128" },
      { label: "Drops investigated", value: "11" },
      { label: "Recovery plays opened", value: "6" },
      { label: "Needs your attention", value: "1" },
    ],
    tableTitle: "Accounts under investigation",
    tableSubtitle: "Accounts with a sustained usage decline under investigation.",
    columns: [
      { key: "csm", label: "CSM" },
      { key: "progress", label: "Investigation" },
      { key: "status", label: "Status" },
      { key: "nextAction", label: "Next action" },
      { key: "lastActivity", label: "Last activity" },
    ],
    statusKey: "status",
    rows: [
      { id: "usage-drop-brightfield-media", account: "Brightfield Media", segment: "Mid-market · $88k", cells: { csm: "JD", progress: "60%", status: "Draft ready", nextAction: "Approve recovery play", lastActivity: "5 hours ago" }, statusTone: "warning" },
    ],
  },
};

export const emptyAgentDetail: AgentDetail = {
  attention: [],
  stats: [
    { label: "Accounts covered", value: "—" },
    { label: "Runs so far", value: "0" },
    { label: "Avg. time saved", value: "—" },
    { label: "Needs your attention", value: "0" },
  ],
  tableTitle: "Accounts",
  tableSubtitle: "Nothing to show yet — this agent hasn't run.",
  columns: [
    { key: "csm", label: "CSM" },
    { key: "progress", label: "Progress" },
    { key: "status", label: "Status" },
    { key: "nextAction", label: "Next action" },
    { key: "lastActivity", label: "Last activity" },
  ],
  statusKey: "status",
  rows: [],
};

/**
 * Resolve the Work-tab schema + mock data for a Custom agent.
 *
 * Expert-powered agents resolve generically from the Expert's own
 * `profile` schema via `agent.poweredBy.expertSlug` — the Work tab looks
 * different per Expert without any agent-slug-specific code. Agents that
 * were built in-house (no Expert behind them) fall back to a generic
 * per-slug detail, or an empty state for any brand-new agent.
 */
export function getAgentDetail(agent: Pick<CustomAgent, "slug" | "poweredBy">): AgentDetail {
  if (agent.poweredBy) {
    const expert = expertAgents.find((e) => e.slug === agent.poweredBy!.expertSlug);
    if (expert) {
      const p = expert.profile;
      return {
        attention: p.attention.map((a) => ({
          workItemId: a.workItemId,
          title: a.account,
          subtitle: a.detail,
          actionLabel: a.actionLabel,
          tone: a.tone,
          focusTarget: a.focusTarget,
        })),
        stats: p.statCards,
        tableTitle: p.sectionTitle,
        tableSubtitle: p.sectionSubtitle,
        columns: p.columns,
        statusKey: p.statusKey,
        rows: p.rows,
      };
    }
  }
  return genericAgentDetails[agent.slug] ?? emptyAgentDetail;
}
