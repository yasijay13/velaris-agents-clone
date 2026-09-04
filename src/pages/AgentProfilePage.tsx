import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  Ellipsis,
  MessageSquare,
  Pause,
  Play,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { statusDotClass, statusPillClass, type AgentConfig, type CustomAgent } from "../data/agents";
import { getAgentDetail, type Tone } from "../data/agentDetails";
import { getAgentActivity, type ActivityTag } from "../data/agentActivity";
import { expertAgents } from "../data/experts";
import { buildGenericCaseFile, getWorkItemCaseFile } from "../data/workItemCaseFiles";
import { useAgents } from "../state/agentsStore";
import { useWorkItemOverrides } from "../state/workItemOverridesStore";
import AgentAvatar from "../components/AgentAvatar";
import PoweredByBadge from "../components/PoweredByBadge";
import WorkItemDrawer from "../components/WorkItemDrawer";

type ProfileTab = "Work" | "Activity" | "Chat" | "Settings";
const TABS: ProfileTab[] = ["Work", "Activity", "Chat", "Settings"];

const CURRENT_USER = "You";

const TONE_PILL_CLASS: Record<Tone | "neutral", string> = {
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-muted text-muted-foreground",
};

const TONE_DOT_CLASS: Record<Tone | "neutral", string> = {
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-danger",
  neutral: "bg-muted-foreground/50",
};

const TAG_LABEL_CLASS: Record<ActivityTag, string> = {
  ACTED: "bg-muted text-muted-foreground",
  UPDATED: "bg-muted text-muted-foreground",
  REVIEWED: "bg-muted text-muted-foreground",
  "REQUESTED APPROVAL": "bg-warning-soft text-warning",
  "ASKED A HUMAN": "bg-warning-soft text-warning",
  ESCALATED: "bg-danger-soft text-danger",
};

function fallbackConfig(agent: CustomAgent): AgentConfig {
  return {
    instructions: `You are ${agent.name}, a custom agent built in-house at Velaris. ${agent.description}`,
    triggers: [{ label: "Manual trigger", description: "Runs when a teammate starts it manually.", enabled: true }],
    context: ["Velaris account and customer records"],
    skills: [{ name: "Read Velaris records", description: "Read account and customer context.", enabled: true }],
    scope: "All active accounts",
    approvals: { auto: ["Reading account context"], manual: ["Any customer-facing communication"] },
    notifications: [`Notify ${agent.owner} when this agent needs attention`],
    successCriteria: [{ label: "Owner", value: agent.owner }],
  };
}

export default function AgentProfilePage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { getBySlug, updateAgent, removeAgent } = useAgents();
  const [tab, setTab] = useState<ProfileTab>("Work");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const agent = agentId ? getBySlug(agentId) : undefined;

  const [openWorkItemId, setOpenWorkItemId] = useState<string | null>(null);
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
  const { overrides: workItemOverrides, setOverride: setWorkItemOverride } = useWorkItemOverrides(openWorkItemId);

  function openWorkItem(workItemId: string, focusTarget?: string) {
    setOpenWorkItemId(workItemId);
    setFocusBlockId(focusTarget ?? null);
  }
  function closeWorkItem() {
    setOpenWorkItemId(null);
    setFocusBlockId(null);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (!agent) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-16 text-center">
        <p className="text-[14px] text-muted-foreground">Couldn't find that agent.</p>
        <Link to="/agents" className="text-[13px] font-medium text-primary hover:underline">
          Back to Agents
        </Link>
      </main>
    );
  }

  const detail = getAgentDetail(agent);
  const activity = getAgentActivity(agent);
  const config = agent.config ?? fallbackConfig(agent);
  const typeLine = agent.poweredBy ? "Custom agent · Powered by Expert" : "Custom agent · Built in-house";

  const openRow = openWorkItemId ? detail.rows.find((r) => r.id === openWorkItemId) : undefined;
  const openCaseFile = openWorkItemId
    ? getWorkItemCaseFile(agent.poweredBy?.expertSlug, openWorkItemId, workItemOverrides) ??
      (openRow ? buildGenericCaseFile(openRow, detail.tableTitle, detail.statusKey) : undefined)
    : undefined;

  return (
    <main className="min-w-0 flex-1">
      <div className="mx-auto max-w-[1280px] px-8 py-8">
        <Link
          to="/agents"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Agents
        </Link>

        <div className="mt-4 flex flex-wrap items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
            <AgentAvatar agent={agent} size={52} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-semibold tracking-tight">{agent.name}</h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {typeLine}
            </p>
            {agent.poweredBy && <PoweredByBadge poweredBy={agent.poweredBy} size={28} className="mt-2" />}
            <p className="mt-2 max-w-2xl text-[13.5px] leading-5 text-muted-foreground">
              {agent.description}
            </p>
            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${statusPillClass[agent.status]}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass[agent.status]}`} />
              {agent.status}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTab("Chat")}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-[12.5px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Chat
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12.5px] font-medium transition-colors hover:bg-muted"
            >
              <Play className="h-3.5 w-3.5" /> Run now
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="More actions"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
              >
                <Ellipsis className="h-3.5 w-3.5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-40 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      updateAgent(agent.slug, { status: agent.status === "Paused" ? "Active" : "Paused" });
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors hover:bg-muted"
                  >
                    <Pause className="h-3.5 w-3.5" /> {agent.status === "Paused" ? "Resume" : "Pause"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (window.confirm(`Delete ${agent.name}? This can't be undone.`)) {
                        removeAgent(agent.slug);
                        navigate("/agents");
                      }
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-danger transition-colors hover:bg-danger-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-6 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-0.5 pb-3 text-[14px] font-medium transition-colors ${
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Work" && (
          <section className="pt-6">
            <p className="text-[12.5px] text-muted-foreground">
              What work is this agent currently responsible for?
            </p>

            {detail.attention.length > 0 && (
              <div className="mt-3 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <p className="text-[14.5px] font-semibold tracking-tight">Needs your attention</p>
                  <span className="text-[13px] text-muted-foreground">{detail.attention.length} items</span>
                  <span className="ml-auto text-[11.5px] text-muted-foreground">Personalized to {CURRENT_USER}</span>
                </div>
                <ul>
                  {detail.attention.map((item) => (
                    <li
                      key={item.workItemId}
                      onClick={() => openWorkItem(item.workItemId)}
                      className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-muted/40"
                    >
                      <span className={`h-8 w-1 shrink-0 rounded-full ${TONE_DOT_CLASS[item.tone]}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium">{item.title}</p>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWorkItem(item.workItemId, item.focusTarget);
                        }}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-muted"
                      >
                        {item.actionLabel}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${detail.attention.length > 0 ? "mt-5" : "mt-3"}`}>
              {detail.stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-[30px] font-bold tracking-tight">{stat.value}</p>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[14.5px] font-semibold tracking-tight">{detail.tableTitle}</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">{detail.tableSubtitle}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-muted"
                >
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
                {detail.rows.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                    No activity yet — this agent hasn't run.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
                          <th className="px-4 py-2.5 font-medium">Account</th>
                          {detail.columns.map((col) => (
                            <th key={col.key} className="px-4 py-2.5 font-medium">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.rows.map((row) => (
                          <tr
                            key={row.id}
                            onClick={() => openWorkItem(row.id)}
                            className="cursor-pointer border-t border-border transition-colors hover:bg-muted/40"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium">{row.account}</p>
                              <p className="mt-0.5 text-[11.5px] text-muted-foreground">{row.segment}</p>
                            </td>
                            {detail.columns.map((col) => {
                              const value = row.cells[col.key] ?? "—";
                              if (col.key === detail.statusKey) {
                                return (
                                  <td key={col.key} className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${TONE_PILL_CLASS[row.statusTone]}`}
                                    >
                                      <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT_CLASS[row.statusTone]}`} />
                                      {value}
                                    </span>
                                  </td>
                                );
                              }
                              return (
                                <td key={col.key} className="px-4 py-3 text-muted-foreground">
                                  {value}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === "Activity" && <ActivityTab activity={activity} />}

        {tab === "Chat" && <ChatTab agent={agent} />}

        {tab === "Settings" && (
          <SettingsTab
            agent={agent}
            config={config}
            onUpdateAgent={(patch) => updateAgent(agent.slug, patch)}
            onUpdateConfig={(patch) => updateAgent(agent.slug, { config: { ...config, ...patch } })}
            onRemove={() => {
              removeAgent(agent.slug);
              navigate("/agents");
            }}
          />
        )}
      </div>

      {openCaseFile && (
        <WorkItemDrawer
          caseFile={openCaseFile}
          overrides={workItemOverrides}
          setOverride={setWorkItemOverride}
          focusBlockId={focusBlockId}
          onClose={closeWorkItem}
        />
      )}
    </main>
  );
}

function ActivityTab({ activity }: { activity: ReturnType<typeof getAgentActivity> }) {
  return (
    <section className="pt-6">
      <p className="text-[14.5px] font-semibold tracking-tight">Activity</p>
      <p className="mt-1 text-[13px] text-muted-foreground">Everything this agent has done, most recent first.</p>

      {activity.length === 0 ? (
        <p className="mt-6 text-[13px] text-muted-foreground">
          No activity recorded yet — this agent hasn't run.
        </p>
      ) : (
        <div className="mt-6 max-w-2xl">
          {activity.map((group) => (
            <div key={group.group} className="mb-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {group.group}
              </p>
              <ul className="relative space-y-5 border-l border-border pl-5">
                {group.entries.map((entry, i) => (
                  <li key={entry.title + entry.time + i} className="relative">
                    <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-border" />
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-[13.5px] font-medium">{entry.title}</p>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {entry.account}
                      </span>
                      <span className="text-[11.5px] text-muted-foreground">{entry.time}</span>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground">{entry.description}</p>
                    <span
                      className={`mt-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] ${TAG_LABEL_CLASS[entry.tag]}`}
                    >
                      {entry.tag}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface ChatBubbleMsg {
  id: string;
  role: "user" | "agent";
  text: string;
}

let chatIdCounter = 0;
const nextChatId = () => `c${++chatIdCounter}`;

function ChatTab({ agent }: { agent: CustomAgent }) {
  const detail = getAgentDetail(agent);
  const [messages, setMessages] = useState<ChatBubbleMsg[]>(() => [
    {
      id: nextChatId(),
      role: "agent",
      text: `Hi, I'm ${agent.name}. ${agent.description} Ask me what I'm working on, or tell me how to change something.`,
    },
  ]);
  const [input, setInput] = useState("");

  function reply(userText: string) {
    const lower = userText.toLowerCase();
    let text = `I've noted that. I'm currently tracking ${detail.stats[0]?.value ?? "a few"} ${detail.stats[0]?.label.toLowerCase() ?? "items"} — ask me for specifics on any account.`;
    if (lower.includes("attention") || lower.includes("waiting")) {
      const first = detail.attention[0];
      text = first
        ? `${detail.attention.length} accounts need your attention right now. The most urgent is ${first.title}: ${first.subtitle}.`
        : "Nothing needs your attention right now — everything is on track.";
    } else if (lower.includes("status") || lower.includes("how many") || lower.includes("doing")) {
      text = detail.stats.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ") + ".";
    } else if (lower.includes("change") || lower.includes("only") || lower.includes("never") || lower.includes("always")) {
      text = "Got it — I've saved that as an instruction. You can see and edit it any time under Settings > Goal & instructions.";
    }
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextChatId(), role: "agent", text }]);
    }, 350);
  }

  function send() {
    const value = input.trim();
    if (!value) return;
    setInput("");
    setMessages((prev) => [...prev, { id: nextChatId(), role: "user", text: value }]);
    reply(value);
  }

  return (
    <section className="flex h-[560px] max-w-2xl flex-col pt-6">
      <p className="text-[14.5px] font-semibold tracking-tight">Chat</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Talk to {agent.name} directly — ask what it's working on, or tell it how to behave.
      </p>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-card p-4">
        {messages.map((m) =>
          m.role === "agent" ? (
            <div key={m.id} className="flex gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <Bot className="h-4 w-4" />
              </span>
              <div className="max-w-[420px] rounded-xl rounded-tl-sm border border-border bg-background px-3.5 py-2.5 text-[13.5px] leading-5">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[420px] rounded-xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-[13.5px] leading-5 text-primary-foreground">
                {m.text}
              </div>
            </div>
          ),
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder={`Message ${agent.name}...`}
          className="h-10 flex-1 rounded-lg border border-border bg-card px-3.5 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary/40"
        />
        <button
          type="button"
          onClick={send}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function SettingsTab({
  agent,
  config,
  onUpdateAgent,
  onUpdateConfig,
  onRemove,
}: {
  agent: CustomAgent;
  config: AgentConfig;
  onUpdateAgent: (patch: Partial<CustomAgent>) => void;
  onUpdateConfig: (patch: Partial<AgentConfig>) => void;
  onRemove: () => void;
}) {
  const expert = agent.poweredBy ? expertAgents.find((e) => e.slug === agent.poweredBy!.expertSlug) : undefined;
  const [editChat, setEditChat] = useState("");
  const [editNote, setEditNote] = useState<string | null>(null);
  const [instructionsDraft, setInstructionsDraft] = useState(config.instructions);
  const [scopeDraft, setScopeDraft] = useState(config.scope);
  const [descriptionDraft, setDescriptionDraft] = useState(agent.description);

  const successCriteria = useMemo(() => config.successCriteria, [config.successCriteria]);
  const [criteriaDraft, setCriteriaDraft] = useState(successCriteria);

  function applyChatEdit() {
    const value = editChat.trim();
    if (!value) return;
    // The conversational editor writes to the same underlying config as the manual UI below.
    onUpdateConfig({ instructions: `${config.instructions}\n\n[Edit via chat] ${value}` });
    setInstructionsDraft(`${config.instructions}\n\n[Edit via chat] ${value}`);
    setEditNote(`Applied: "${value}"`);
    setEditChat("");
  }

  function toggleSkill(name: string) {
    onUpdateConfig({
      skills: config.skills.map((s) => (s.name === name ? { ...s, enabled: !s.enabled } : s)),
    });
  }

  function toggleTrigger(label: string) {
    onUpdateConfig({
      triggers: config.triggers.map((t) => (t.label === label ? { ...t, enabled: !t.enabled } : t)),
    });
  }

  return (
    <section className="max-w-3xl space-y-6 pt-6">
      {/* Edit with chat */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold tracking-tight">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Edit with chat
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Describe a change in plain language — it updates the same configuration as the settings below.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={editChat}
            onChange={(e) => setEditChat(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyChatEdit();
            }}
            placeholder='e.g. "Never email enterprise customers without approval."'
            className="h-9 flex-1 rounded-lg border border-border bg-card px-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary/40"
          />
          <button
            type="button"
            onClick={applyChatEdit}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Apply
          </button>
        </div>
        {editNote && <p className="mt-2 text-[11.5px] text-success">{editNote}</p>}
      </div>

      {/* Agent details */}
      <SettingsCard title="Agent details">
        <FieldRow label="Name">
          <span className="text-[13px]">{agent.name}</span>
        </FieldRow>
        <FieldRow label="Avatar">
          <AgentAvatar agent={agent} size={28} />
        </FieldRow>
        <FieldRow label="Description">
          <textarea
            value={descriptionDraft}
            onChange={(e) => setDescriptionDraft(e.target.value)}
            onBlur={() => onUpdateAgent({ description: descriptionDraft })}
            rows={2}
            className="w-full rounded-lg border border-border bg-background p-2 text-[13px] outline-none focus:border-primary/40"
          />
        </FieldRow>
        <FieldRow label="Owner">
          <span className="text-[13px]">{agent.owner}</span>
        </FieldRow>
        <FieldRow label="Status">
          <span className="text-[13px]">{agent.status}</span>
        </FieldRow>
        <FieldRow label="Powered by">
          <span className="text-[13px]">{expert ? expert.name : "Built in-house"}</span>
        </FieldRow>
      </SettingsCard>

      {/* Goal & instructions */}
      <SettingsCard title="Goal & instructions" subtitle="What should the agent do when it runs?">
        <textarea
          value={instructionsDraft}
          onChange={(e) => setInstructionsDraft(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-border bg-background p-3 text-[13px] leading-5 outline-none focus:border-primary/40"
        />
        <button
          type="button"
          onClick={() => onUpdateConfig({ instructions: instructionsDraft })}
          className="mt-2 inline-flex h-8 items-center rounded-lg border border-border px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
        >
          Save instructions
        </button>
      </SettingsCard>

      {/* Triggers */}
      <SettingsCard title={`Triggers · ${config.triggers.length}`} subtitle="When should this agent run?">
        <ul className="space-y-3">
          {config.triggers.map((t) => (
            <li key={t.label} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium">{t.label}</p>
                <p className="mt-0.5 text-[12px] leading-4 text-muted-foreground">{t.description}</p>
              </div>
              <ToggleSwitch checked={t.enabled} onChange={() => toggleTrigger(t.label)} />
            </li>
          ))}
        </ul>
      </SettingsCard>

      {/* Skills & tools */}
      <SettingsCard title="Skills & tools" subtitle="What can this agent do, and what needs a toggle first?">
        <ul className="space-y-3">
          {config.skills.map((s) => (
            <li key={s.name} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium">{s.name}</p>
                <p className="mt-0.5 text-[12px] leading-4 text-muted-foreground">{s.description}</p>
              </div>
              <ToggleSwitch checked={s.enabled} onChange={() => toggleSkill(s.name)} />
            </li>
          ))}
        </ul>
      </SettingsCard>

      {/* Context */}
      <SettingsCard title="Context" subtitle="Which information sources can this agent use?">
        <ul className="space-y-1.5">
          {config.context.map((c) => (
            <li key={c} className="flex items-center gap-2 text-[13px] text-foreground/80">
              <Check className="h-3.5 w-3.5 shrink-0 text-success" /> {c}
            </li>
          ))}
        </ul>
      </SettingsCard>

      {/* Scope */}
      <SettingsCard title="Scope" subtitle="Which accounts does this agent cover?">
        <input
          value={scopeDraft}
          onChange={(e) => setScopeDraft(e.target.value)}
          onBlur={() => onUpdateConfig({ scope: scopeDraft })}
          className="h-9 w-full max-w-md rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary/40"
        />
      </SettingsCard>

      {/* Autonomy & approvals */}
      <SettingsCard title="Autonomy & approvals">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Agent can do this on its own
            </p>
            <ul className="mt-2 space-y-1.5">
              {config.approvals.auto.map((item) => (
                <li key={item} className="flex gap-1.5 text-[12px] leading-[17px] text-foreground/80">
                  <Check className="mt-[2px] h-3 w-3 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Always requires approval
            </p>
            <ul className="mt-2 space-y-1.5">
              {config.approvals.manual.map((item) => (
                <li key={item} className="flex gap-1.5 text-[12px] leading-[17px] text-foreground/80">
                  <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-warning" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SettingsCard>

      {/* Notifications & escalation */}
      <SettingsCard title="Notifications & escalation">
        <ul className="space-y-1.5">
          {config.notifications.map((n) => (
            <li key={n} className="text-[13px] leading-5 text-foreground/80">
              {n}
            </li>
          ))}
        </ul>
      </SettingsCard>

      {/* Success criteria */}
      <SettingsCard title="Success criteria" subtitle="Expert-specific configuration for how this agent's job is defined.">
        <div className="space-y-3">
          {criteriaDraft.map((c, i) => (
            <div key={c.label} className="flex items-center gap-3">
              <label className="w-48 shrink-0 text-[12.5px] text-muted-foreground">{c.label}</label>
              <input
                value={c.value}
                onChange={(e) =>
                  setCriteriaDraft((prev) => prev.map((p, pi) => (pi === i ? { ...p, value: e.target.value } : p)))
                }
                className="h-8 flex-1 rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none focus:border-primary/40"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onUpdateConfig({ successCriteria: criteriaDraft })}
          className="mt-3 inline-flex h-8 items-center rounded-lg border border-border px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
        >
          Save success criteria
        </button>
      </SettingsCard>

      {/* Agent controls */}
      <SettingsCard title="Agent controls">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onUpdateAgent({ status: agent.status === "Paused" ? "Active" : "Paused" })}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-medium transition-colors hover:bg-muted"
          >
            <Pause className="h-3.5 w-3.5" /> {agent.status === "Paused" ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => onUpdateAgent({ status: "Draft" })}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-medium transition-colors hover:bg-muted"
          >
            Deactivate
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete ${agent.name}? This can't be undone.`)) onRemove();
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-danger/30 px-3 text-[13px] font-medium text-danger transition-colors hover:bg-danger-soft"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove agent
          </button>
        </div>
      </SettingsCard>
    </section>
  );
}

function SettingsCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[13.5px] font-semibold tracking-tight">{title}</p>
      {subtitle && <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <p className="w-28 shrink-0 pt-0.5 text-[12.5px] text-muted-foreground">{label}</p>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
