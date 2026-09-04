import type { ExpertAgent } from "./experts";

export type AgentStatus = "Active" | "Needs attention" | "Paused" | "Draft";

export interface PoweredBy {
  expertSlug: string;
  expertName: string;
  avatar: ExpertAgent["avatar"];
}

export interface AgentSkillState {
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentTriggerState {
  label: string;
  description: string;
  enabled: boolean;
}

export interface AgentConfig {
  /** The Expert's base objective, plus any customer-specific instructions layered on top. */
  instructions: string;
  triggers: AgentTriggerState[];
  context: string[];
  skills: AgentSkillState[];
  scope: string;
  approvals: { auto: string[]; manual: string[] };
  notifications: string[];
  successCriteria: { label: string; value: string }[];
}

export interface CustomAgent {
  slug: string;
  initials: string;
  name: string;
  description: string;
  status: AgentStatus;
  updatedAt: string;
  assignee: string;
  /** Full display name of the account owner, shown in Settings > Agent details. */
  owner: string;
  /** legacy gradient-orb avatar id — kept for agents created before the Waveform picker */
  avatarPreset?: string;
  /** waveform category id, for agents created through the Agent Builder / Expert flow */
  avatarWaveform?: string;
  poweredBy?: PoweredBy;
  /** Populated when the agent was configured through the Agent Builder; editable in Settings. */
  config?: AgentConfig;
}

export const statusDotClass: Record<AgentStatus, string> = {
  Active: "bg-success",
  "Needs attention": "bg-warning",
  Paused: "bg-muted-foreground/50",
  Draft: "bg-border",
};

export const statusLabelClass: Record<AgentStatus, string> = {
  Active: "text-success",
  "Needs attention": "text-warning",
  Paused: "text-muted-foreground",
  Draft: "text-muted-foreground",
};

export const statusPillClass: Record<AgentStatus, string> = {
  Active: "bg-success-soft text-success",
  "Needs attention": "bg-warning-soft text-warning",
  Paused: "bg-muted text-muted-foreground",
  Draft: "bg-muted text-muted-foreground",
};

export const customAgents: CustomAgent[] = [
  {
    slug: "account-onboarding",
    initials: "AO",
    name: "Account Onboarding",
    description: "Drives every new account from sales handover to onboarding commitment.",
    status: "Active",
    updatedAt: "2 minutes ago",
    assignee: "AR",
    owner: "A. Reyes",
  },
  {
    slug: "renewal-email",
    initials: "RE",
    name: "Renewal Email Handler",
    description: "Reads renewal email threads and drafts commercially accurate replies.",
    status: "Needs attention",
    updatedAt: "18 minutes ago",
    assignee: "JD",
    owner: "Jane D.",
  },
  {
    slug: "health-digest",
    initials: "WH",
    name: "Weekly Health Digest",
    description: "Summarises portfolio health movement and posts it to the CS channel.",
    status: "Active",
    updatedAt: "1 hour ago",
    assignee: "RS",
    owner: "R. Silva",
  },
  {
    slug: "ticket-escalation",
    initials: "TE",
    name: "Ticket Escalation Watch",
    description: "Watches support volume per account and flags escalation patterns early.",
    status: "Paused",
    updatedAt: "Yesterday",
    assignee: "ML",
    owner: "M. Lopez",
  },
  {
    slug: "exec-sponsor",
    initials: "ES",
    name: "Exec Sponsor Tracker",
    description: "Detects sponsor changes across enterprise accounts and rebuilds coverage.",
    status: "Active",
    updatedAt: "3 hours ago",
    assignee: "AR",
    owner: "A. Reyes",
  },
  {
    slug: "usage-drop",
    initials: "UD",
    name: "Usage Drop Investigator",
    description: "Investigates sustained usage declines and proposes a recovery play.",
    status: "Draft",
    updatedAt: "4 days ago",
    assignee: "JD",
    owner: "Jane D.",
  },
];
