import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Mail,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import type {
  ActionDecisionBlock,
  ApprovalBlock,
  ArtifactBlock,
  ChecklistBlock,
  CommitmentsBlock,
  DrawerTab,
  EmailDraftBlock,
  EmailThreadBlock,
  EscalationActionsBlock,
  AccountPlanBlock,
  EvidenceBlock,
  EvidenceItem,
  MitigationPlanBlock,
  NextActionBlock,
  OutcomeBlock,
  OwnerAssignBlock,
  ProgressBlock,
  QualificationBlock,
  QuestionBlock,
  RecordSummaryBlock,
  RiskAssessmentBlock,
  SignalEvidenceBlock,
  TimelineBlock,
  WhySummaryBlock,
  WorkItemBlock,
  WorkItemCaseFile,
} from "../data/workItemTypes";

const TABS: { id: DrawerTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "context", label: "Context" },
  { id: "activity", label: "Activity" },
];

function statusTone(status: string): "warning" | "success" | "danger" | "neutral" {
  const s = status.toLowerCase();
  if (["needs you", "waiting on you", "stalled", "escalated", "overdue"].some((k) => s.includes(k))) return "danger";
  if (["ready", "approval", "waiting", "working", "in progress", "handed off"].some((k) => s.includes(k))) return "warning";
  if (["complete", "closed", "on track", "current", "published", "sent"].some((k) => s.includes(k))) return "success";
  return "neutral";
}

const TONE_PILL: Record<string, string> = {
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-muted text-muted-foreground",
};
const TONE_DOT: Record<string, string> = {
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-danger",
  neutral: "bg-muted-foreground/50",
};

function riskLevelTone(level: string): "warning" | "success" | "danger" | "neutral" {
  const s = level.toLowerCase();
  if (s.includes("high")) return "danger";
  if (s.includes("medium")) return "warning";
  if (s.includes("low")) return "success";
  return "neutral";
}

function dimensionTone(state: string): "warning" | "success" | "danger" | "neutral" {
  const s = state.toLowerCase();
  if (s.includes("high risk")) return "danger";
  if (s.includes("medium risk")) return "warning";
  if (s.includes("healthy") || s.includes("not detected") || s.includes("low risk")) return "success";
  return "neutral";
}

export interface WorkItemDrawerProps {
  caseFile: WorkItemCaseFile;
  overrides: Record<string, unknown>;
  setOverride: (blockId: string, value: unknown) => void;
  focusBlockId?: string | null;
  onClose: () => void;
}

export default function WorkItemDrawer({ caseFile, setOverride, focusBlockId, onClose }: WorkItemDrawerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");

  // A genuinely different work item resets the drawer back to Overview; switching
  // tabs on the SAME work item never remounts anything, so local interaction
  // state (edit boxes, expand/collapse toggles, etc.) survives tab switches.
  useEffect(() => {
    setActiveTab("overview");
  }, [caseFile.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (!focusBlockId) return;
    const targetBlock = caseFile.blocks.find((b) => b.id === focusBlockId);
    const targetTab = targetBlock?.tab ?? "overview";
    setActiveTab(targetTab);
    const t = setTimeout(() => {
      const el = bodyRef.current?.querySelector(`[data-block-id="${focusBlockId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("workitem-block-focus");
        setTimeout(() => el.classList.remove("workitem-block-focus"), 1800);
      }
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusBlockId, caseFile.id]);

  const tone = statusTone(caseFile.status);
  const blocksForTab = useMemo(
    () => caseFile.blocks.filter((b) => (b.tab ?? "overview") === activeTab),
    [caseFile.blocks, activeTab],
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-[94vw] flex-col bg-card shadow-2xl sm:w-[640px]">
        <div className="sticky top-0 z-10 border-b border-border bg-card">
          <div className="px-6 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[17px] font-semibold tracking-tight">{caseFile.account}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{caseFile.workType}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${TONE_PILL[tone]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
                {caseFile.status}
              </span>
              <span className="text-[12.5px] text-muted-foreground">
                {caseFile.agentName}
                {caseFile.targetDate ? ` · Target ${caseFile.targetDate}` : ""}
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-1 px-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`relative px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  activeTab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {activeTab === t.id && <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "overview" && (
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Current state</p>
              <p className="mt-1.5 text-[13.5px] leading-5">{caseFile.currentState}</p>
            </div>
          )}

          {activeTab === "context" ? (
            <div className="mt-1">
              {blocksForTab.map((block) => (
                <div key={block.id} data-block-id={block.id} className="workitem-block">
                  <BlockRenderer block={block} setOverride={setOverride} onViewContext={() => setActiveTab("context")} plain />
                </div>
              ))}
              {blocksForTab.length === 0 && <p className="py-6 text-[13px] text-muted-foreground">No additional context recorded for this case.</p>}
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {blocksForTab.map((block) => (
                <div key={block.id} data-block-id={block.id} className="workitem-block rounded-xl transition-shadow">
                  <BlockRenderer block={block} setOverride={setOverride} onViewContext={() => setActiveTab("context")} plain={activeTab === "activity"} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlockRenderer({
  block,
  setOverride,
  onViewContext,
  plain = false,
}: {
  block: WorkItemBlock;
  setOverride: (blockId: string, value: unknown) => void;
  onViewContext?: () => void;
  plain?: boolean;
}) {
  switch (block.type) {
    case "progress":
      return <ProgressView block={block} />;
    case "checklist":
      return <ChecklistView block={block} plain={plain} />;
    case "question":
      return <QuestionView block={block} setOverride={setOverride} />;
    case "approval":
      return <ApprovalView block={block} setOverride={setOverride} />;
    case "signalEvidence":
      return <SignalEvidenceView block={block} plain={plain} />;
    case "emailThread":
      return <EmailThreadView block={block} />;
    case "emailDraft":
      return <EmailDraftView block={block} setOverride={setOverride} />;
    case "artifact":
      return <ArtifactView block={block} />;
    case "recordSummary":
      return <RecordSummaryView block={block} plain={plain} />;
    case "timeline":
      return <TimelineView block={block} plain={plain} />;
    case "nextAction":
      return <NextActionView block={block} />;
    case "ownerAssign":
      return <OwnerAssignView block={block} setOverride={setOverride} />;
    case "escalationActions":
      return <EscalationActionsView block={block} setOverride={setOverride} />;
    case "outcome":
      return <OutcomeView block={block} />;
    case "mitigationPlan":
      return <MitigationPlanView block={block} />;
    case "qualification":
      return <QualificationView block={block} plain={plain} />;
    case "accountPlan":
      return <AccountPlanView block={block} plain={plain} />;
    case "commitments":
      return <CommitmentsView block={block} setOverride={setOverride} />;
    case "riskAssessment":
      return <RiskAssessmentView block={block} plain={plain} />;
    case "evidence":
      return <EvidenceView block={block} plain={plain} />;
    case "actionDecision":
      return <ActionDecisionView block={block} plain={plain} />;
    case "whySummary":
      return <WhySummaryView block={block} onViewContext={onViewContext} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>{children}</div>;
}

/** Row-styled section for the Context (audit) tab: whitespace + a divider
 *  instead of a bordered card, reserving cards for actionable/human-facing
 *  content. Falls back to SectionCard when `plain` is false. */
function Section({ children, plain = false, className = "" }: { children: React.ReactNode; plain?: boolean; className?: string }) {
  if (!plain) return <SectionCard className={className}>{children}</SectionCard>;
  return <div className={`border-b border-border py-5 first:pt-0 last:border-b-0 last:pb-0 ${className}`}>{children}</div>;
}

function WhySummaryView({ block, onViewContext }: { block: WhySummaryBlock; onViewContext?: () => void }) {
  const tone = block.levelTone ?? (block.level ? riskLevelTone(block.level) : "neutral");
  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.heading}</p>
        {block.level && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${TONE_PILL[tone]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
            {block.level}
          </span>
        )}
      </div>
      <dl className="mt-2.5 space-y-1.5">
        {block.lines.map((l) => (
          <div key={l.label} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-[13px]">
            <dt className="text-muted-foreground">{l.label}</dt>
            <dd className="font-medium">{l.value}</dd>
          </div>
        ))}
      </dl>
      {onViewContext && (
        <button type="button" onClick={onViewContext} className="mt-3 text-[12.5px] font-medium text-primary hover:underline">
          {block.contextLabel ?? "View full context"} →
        </button>
      )}
    </SectionCard>
  );
}

function ProgressView({ block }: { block: ProgressBlock }) {
  const pct = block.total > 0 ? Math.round((block.completed / block.total) * 100) : 0;
  return (
    <SectionCard>
      <div className="flex items-center justify-between text-[12.5px] font-medium">
        <span>{block.label}</span>
        <span className="text-muted-foreground">
          {block.completed}/{block.total}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </SectionCard>
  );
}

function ChecklistView({ block, plain = false }: { block: ChecklistBlock; plain?: boolean }) {
  return (
    <Section plain={plain}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.title}</p>
      <ul className="mt-2.5 space-y-2.5">
        {block.items.map((item) => (
          <li key={item.id} className="flex gap-2.5">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                item.done ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
              }`}
            >
              {item.done ? <Check className="h-2.5 w-2.5" /> : "!"}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium">{item.label}</p>
              {item.done && item.detail && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{item.detail}</p>}
              {!item.done && <p className="mt-0.5 text-[12.5px] text-warning">Needs clarification</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function InlineChat({
  placeholder,
  onSend,
  buttonLabel = "Send",
}: {
  placeholder?: string;
  onSend: (text: string) => void;
  buttonLabel?: string;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onSend(value.trim());
            setValue("");
          }
        }}
        placeholder={placeholder ?? "Type your answer…"}
        className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary/40"
      />
      <button
        type="button"
        disabled={!value.trim()}
        onClick={() => {
          if (!value.trim()) return;
          onSend(value.trim());
          setValue("");
        }}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
      >
        <Send className="h-3.5 w-3.5" /> {buttonLabel}
      </button>
    </div>
  );
}

function QuestionView({ block, setOverride }: { block: QuestionBlock; setOverride: (blockId: string, value: unknown) => void }) {
  return (
    <SectionCard className="border-warning/30 bg-warning-soft/40">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-warning">{block.heading}</p>
      <p className="mt-1.5 text-[13.5px] leading-5">{block.question}</p>
      {block.answered ? (
        <div className="mt-3 space-y-2">
          <div className="rounded-lg bg-card px-3 py-2 text-[13px]">
            <span className="font-medium">You: </span>
            {block.answerText}
          </div>
          {block.acknowledgement && (
            <div className="flex items-start gap-2 rounded-lg bg-card px-3 py-2 text-[13px] text-muted-foreground">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              {block.acknowledgement}
            </div>
          )}
        </div>
      ) : (
        <InlineChat placeholder={block.placeholder} onSend={(text) => setOverride(block.id, { answered: true, answerText: text })} />
      )}
    </SectionCard>
  );
}

function ApprovalView({ block, setOverride }: { block: ApprovalBlock; setOverride: (blockId: string, value: unknown) => void }) {
  const resolved = !!block.resolution;
  return (
    <SectionCard className={resolved ? "" : "border-primary/30 bg-primary/5"}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.heading}</p>
      <p className="mt-1.5 text-[13.5px] leading-5">{block.description}</p>
      {block.details && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-muted/50 p-3">
          {block.details.map((d) => (
            <div key={d.label}>
              <dt className="text-[11px] text-muted-foreground">{d.label}</dt>
              <dd className="text-[13px] font-medium">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {block.recommendation && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          {block.recommendation}
        </div>
      )}
      {resolved ? (
        <p className="mt-3 text-[13px] font-medium text-success">
          {block.resolution!.actionId === "approve" && "Approved."}
          {block.resolution!.actionId === "decline" && "Declined."}
          {block.resolution!.actionId === "changes" && "Changes requested."}
          {block.resolution!.actionId === "modify" && (block.resolution!.note ? `Modified: ${block.resolution!.note}` : "Modifying…")}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {block.actions.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                if (a.id === "recommend") {
                  setOverride(`${block.id}-recommend`, { shown: true });
                } else {
                  setOverride(block.id, { resolution: a.id });
                }
              }}
              className={`inline-flex h-9 items-center rounded-lg px-3 text-[12.5px] font-medium transition-colors ${
                a.tone === "primary"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : a.tone === "danger"
                    ? "border border-danger/30 text-danger hover:bg-danger-soft"
                    : "border border-border hover:bg-muted"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      {block.showFollowUpInput && (
        <InlineChat
          placeholder={block.followUpPlaceholder}
          buttonLabel="Confirm"
          onSend={(text) => setOverride(block.id, { resolution: block.resolution!.actionId, note: text })}
        />
      )}
    </SectionCard>
  );
}

function SignalEvidenceView({ block, plain = false }: { block: SignalEvidenceBlock; plain?: boolean }) {
  return (
    <Section plain={plain}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.title}</p>
      {block.trend && (
        <div className="mt-2.5 flex items-end gap-2 overflow-x-auto">
          {block.trend.map((t) => (
            <div key={t.label} className="min-w-[64px] rounded-lg bg-muted/60 px-2.5 py-2 text-center">
              <p className="text-[14px] font-semibold">{t.value}</p>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
      )}
      {block.changeLabel && <p className="mt-2 text-[13px] font-semibold text-danger">{block.changeLabel}</p>}
      {block.metrics && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {block.metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-[11px] text-muted-foreground">{m.label}</dt>
              <dd className="text-[13px] font-medium">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {block.reasoning && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.reasoningHeading ?? "AGENT REASONING"}</p>
          <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{block.reasoning}</p>
        </div>
      )}
    </Section>
  );
}

function EmailBubble({ m }: { m: EmailThreadBlock["messages"][number] }) {
  return (
    <div className={`rounded-lg border p-3 ${m.sender === "customer" ? "border-border bg-muted/40" : "border-primary/20 bg-primary/5"}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-muted-foreground">
        <span className="font-medium text-foreground">{m.from}</span>
        <span>→ {m.to}</span>
        <span>· {m.timestamp}</span>
        {m.sender === "agent" && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">{m.autoSent ? "Sent automatically" : "Agent sent"}</span>
        )}
        {m.sender === "customer" && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">Customer</span>}
      </div>
      {m.subject && <p className="mt-1.5 text-[13px] font-semibold">{m.subject}</p>}
      <p className="mt-1 text-[13px] leading-5">{m.body}</p>
    </div>
  );
}

function EmailThreadView({ block }: { block: EmailThreadBlock }) {
  const [expanded, setExpanded] = useState(false);
  const LONG_THRESHOLD = 4;
  const isLong = block.messages.length > LONG_THRESHOLD;
  const visibleMessages = isLong && !expanded ? block.messages.slice(-2) : block.messages;
  return (
    <SectionCard>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <Mail className="h-3 w-3" /> Customer conversation
      </div>
      {block.initiatedBy ? (
        <div className="mt-1.5 space-y-0.5 text-[12px] text-muted-foreground">
          <p>Initiated by {block.initiatedBy}</p>
          {block.trigger && <p>Trigger: {block.trigger}</p>}
          {block.sentInfo && <p>{block.sentInfo}</p>}
        </div>
      ) : (
        block.trigger && <p className="mt-1 text-[12px] text-muted-foreground">Trigger: {block.trigger}</p>
      )}
      {isLong && !expanded && (
        <button type="button" onClick={() => setExpanded(true)} className="mt-3 text-[12.5px] font-medium text-primary hover:underline">
          View full conversation ({block.messages.length} messages)
        </button>
      )}
      <div className="mt-3 space-y-2.5">
        {visibleMessages.map((m) => (
          <EmailBubble key={m.id} m={m} />
        ))}
      </div>
    </SectionCard>
  );
}

function RiskAssessmentView({ block, plain = false }: { block: RiskAssessmentBlock; plain?: boolean }) {
  const tone = riskLevelTone(block.level);
  return (
    <Section plain={plain}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Risk assessment</p>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${TONE_PILL[tone]}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
          {block.level} risk
        </span>
      </div>
      <p className="mt-2 text-[13.5px] leading-5">{block.summary}</p>
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
        <div>
          <dt className="text-[11px] text-muted-foreground">Primary driver</dt>
          <dd className="text-[13px] font-medium">{block.primaryDriver}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Supporting signal</dt>
          <dd className="text-[13px] font-medium">{block.supportingSignal}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Urgency</dt>
          <dd className="text-[13px] font-medium">{block.urgency}</dd>
        </div>
      </dl>
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Risk dimensions</p>
        <ul className="mt-2 space-y-1.5">
          {block.dimensions.map((d) => {
            const dTone = dimensionTone(d.state);
            return (
              <li key={d.name} className="flex items-center justify-between gap-3 text-[13px]">
                <span>{d.name}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium ${TONE_PILL[dTone]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[dTone]}`} />
                  {d.state}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

function EvidenceRoleBadge({ role }: { role: EvidenceItem["role"] }) {
  const label = role === "primary" ? "Primary driver" : role === "supporting" ? "Supporting signal" : "Context";
  const cls =
    role === "primary" ? "bg-danger-soft text-danger" : role === "supporting" ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.04em] ${cls}`}>{label}</span>;
}

function EvidenceRow({ item }: { item: EvidenceItem }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <EvidenceRoleBadge role={item.role} />
          <span className="text-[13px] font-semibold">{item.metric}</span>
        </div>
        {item.change && <span className="text-[13px] font-semibold text-danger">{item.change}</span>}
      </div>
      {item.trend && (
        <div className="mt-2 flex items-end gap-2 overflow-x-auto">
          {item.trend.map((t) => (
            <div key={t.label} className="min-w-[60px] rounded-lg bg-muted/60 px-2 py-1.5 text-center">
              <p className="text-[13px] font-semibold">{t.value}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
      )}
      {!item.trend && (item.value || item.current || item.previous) && (
        <p className="mt-1.5 text-[12.5px] font-medium">{item.value ?? `${item.previous} → ${item.current}`}</p>
      )}
      <p className="mt-1.5 text-[12.5px] leading-5 text-muted-foreground">{item.explanation}</p>
    </div>
  );
}

function EvidenceView({ block, plain = false }: { block: EvidenceBlock; plain?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Section plain={plain}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Key evidence</p>
      <div className="mt-2.5 space-y-2.5">
        {block.items.map((item, i) => (
          <EvidenceRow key={i} item={item} />
        ))}
      </div>
      {block.additionalAttributes && block.additionalAttributes.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 text-[12.5px] font-medium text-primary hover:underline"
          >
            {expanded ? "Hide additional evidence" : "View all evidence"}
          </button>
          {expanded && (
            <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-muted/40 p-3">
              {block.additionalAttributes.map((a) => (
                <div key={a.label}>
                  <dt className="text-[11px] text-muted-foreground">{a.label}</dt>
                  <dd className="text-[13px] font-medium">{a.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </Section>
  );
}

function ActionDecisionView({ block, plain = false }: { block: ActionDecisionBlock; plain?: boolean }) {
  return (
    <Section plain={plain}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Why Hermes acted now</p>
      <div className="mt-2 rounded-lg bg-muted/40 p-3">
        <p className="text-[11px] text-muted-foreground">Triggered playbook</p>
        <p className="text-[13px] font-semibold">{block.playbook}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">Condition</p>
        <p className="text-[13px]">{block.condition}</p>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {block.matchedConditions.map((c, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Autonomy policy</p>
        <p className="mt-1.5 text-[13px] leading-5">{block.autonomy.policy}</p>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div>
            <dt className="text-[11px] text-muted-foreground">Scope</dt>
            <dd className="text-[13px] font-medium">{block.autonomy.scope}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Approval</dt>
            <dd className="text-[13px] font-medium">{block.autonomy.approvalRequired ? "Required" : "Not required for this type of outreach"}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-3 rounded-lg bg-success-soft px-3 py-2 text-[13px] font-medium text-success">{block.action}</div>
    </Section>
  );
}

function EmailDraftView({ block, setOverride }: { block: EmailDraftBlock; setOverride: (blockId: string, value: unknown) => void }) {
  const [editing, setEditing] = useState(false);
  const [draftBody, setDraftBody] = useState(block.body);
  const [asking, setAsking] = useState(false);
  const [asked, setAsked] = useState(false);

  if (block.status === "sent") {
    return (
      <SectionCard>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-success">EMAIL SENT</p>
        <p className="mt-1.5 text-[13px] font-semibold">{block.subject}</p>
        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{block.body}</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="border-primary/30 bg-primary/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.heading}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">Subject</p>
      <p className="text-[13px] font-semibold">{block.subject}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">Body</p>
      {editing ? (
        <textarea
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-lg border border-border bg-background p-2.5 text-[13px] outline-none focus:border-primary/40"
        />
      ) : (
        <p className="text-[13px] leading-5">{block.body}</p>
      )}
      {asked && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          {block.askAgentAcknowledgement}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {editing ? (
          <button
            type="button"
            onClick={() => {
              setOverride(block.id, { body: draftBody });
              setEditing(false);
            }}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-[12.5px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Save edit
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setOverride(block.id, { body: block.body, approved: true })}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-[12.5px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {block.approveLabel}
            </button>
            {block.allowEdit && (
              <button
                type="button"
                onClick={() => {
                  setDraftBody(block.body);
                  setEditing(true);
                }}
                className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
              >
                Edit manually
              </button>
            )}
            {block.allowAskAgent && (
              <button
                type="button"
                onClick={() => setAsking((v) => !v)}
                className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
              >
                Ask agent to change it
              </button>
            )}
          </>
        )}
      </div>
      {asking && !editing && (
        <InlineChat
          placeholder="e.g. Make it less salesy and reference the new analytics users."
          onSend={() => {
            setOverride(block.id, { body: block.revisedBody ?? block.body });
            setAsked(true);
            setAsking(false);
          }}
        />
      )}
    </SectionCard>
  );
}

function ArtifactView({ block }: { block: ArtifactBlock }) {
  const [expanded, setExpanded] = useState(false);
  const [opened, setOpened] = useState(false);
  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.kind.toUpperCase()}</p>
          <p className="text-[13.5px] font-semibold">{block.name}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${block.state === "Published" ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}>
          {block.state}
        </span>
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">Last updated {block.lastUpdated}</p>
      {expanded && (
        <div className="mt-3 space-y-1.5 rounded-lg border border-dashed border-border bg-muted/40 p-3">
          {block.previewLines.map((line, i) => (
            <p key={i} className="text-[12.5px] leading-5 text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-[12.5px] font-medium transition-colors hover:bg-muted"
        >
          {expanded ? "Hide preview" : "Preview Canvas"}
        </button>
        <button
          type="button"
          onClick={() => setOpened(true)}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-[12.5px] font-medium transition-colors hover:bg-muted"
        >
          Open Canvas <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
      {opened && <p className="mt-2 text-[12px] text-muted-foreground">Opening "{block.name}" in Velaris Canvas…</p>}
    </SectionCard>
  );
}

function RecordSummaryView({ block, plain = false }: { block: RecordSummaryBlock; plain?: boolean }) {
  return (
    <Section plain={plain}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.title}</p>
      {block.headline && <p className="mt-1.5 text-[13.5px] font-medium leading-5">{block.headline}</p>}
      <dl className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {block.fields.map((f) => (
          <div key={f.label}>
            <dt className="text-[11px] text-muted-foreground">{f.label}</dt>
            <dd className="text-[13px] font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function TimelineView({ block, plain = false }: { block: TimelineBlock; plain?: boolean }) {
  return (
    <Section plain={plain}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Case timeline</p>
      <ul className="mt-2.5 space-y-3">
        {block.events.map((e, i) => (
          <li key={i} className="flex gap-2.5">
            <div className="flex flex-col items-center pt-1">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              {i < block.events.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-[11.5px] text-muted-foreground">{e.timestamp}</p>
              <p className="text-[13px]">{e.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function NextActionView({ block }: { block: NextActionBlock }) {
  return (
    <SectionCard className={block.blockedOnUser ? "border-warning/30 bg-warning-soft/30" : ""}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Next</p>
      <p className="mt-1.5 flex items-start gap-1.5 text-[13.5px] leading-5">
        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {block.text}
      </p>
    </SectionCard>
  );
}

function OwnerAssignView({ block, setOverride }: { block: OwnerAssignBlock; setOverride: (blockId: string, value: unknown) => void }) {
  return (
    <SectionCard className={block.assigned ? "" : "border-danger/30 bg-danger-soft/30"}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.heading}</p>
      <p className="mt-1.5 text-[13.5px] leading-5">{block.description}</p>
      {block.assigned ? (
        <p className="mt-3 text-[13px] font-medium text-success">Assigned to {block.assigned}.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {block.options.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setOverride(block.id, { assigned: name })}
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function EscalationActionsView({ block, setOverride }: { block: EscalationActionsBlock; setOverride: (blockId: string, value: unknown) => void }) {
  return (
    <SectionCard className="border-danger/30 bg-danger-soft/20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-danger">{block.heading}</p>
      <p className="mt-1.5 text-[13.5px] leading-5">{block.description}</p>
      {block.resolvedAction ? (
        <p className="mt-3 text-[13px] font-medium text-success">
          Resolved: {block.actions.find((a) => a.id === block.resolvedAction)?.label ?? block.resolvedAction}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {block.actions.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setOverride(block.id, { resolvedAction: a.id })}
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      {block.showFollowUpInput && (
        <>
          <InlineChat
            placeholder="Tell Hermes how to respond…"
            onSend={(text) => setOverride(block.id, { resolvedAction: block.resolvedAction, followUpText: text })}
          />
          {block.followUpAcknowledgement && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-card px-3 py-2 text-[13px] text-muted-foreground">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              {block.followUpAcknowledgement}
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}

function OutcomeView({ block }: { block: OutcomeBlock }) {
  return (
    <SectionCard className="border-success/30 bg-success-soft/30">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-success">OUTCOME · {block.completedAt}</p>
      <p className="mt-1.5 text-[13.5px] font-medium leading-5">{block.summary}</p>
      <ul className="mt-2.5 space-y-1.5">
        {block.whatHappened.map((line, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-5 text-muted-foreground">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            {line}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function MitigationPlanView({ block }: { block: MitigationPlanBlock }) {
  return (
    <SectionCard>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.title}</p>
      <ul className="mt-2.5 space-y-1.5">
        {block.actionsTaken.map((a, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            {a}
          </li>
        ))}
      </ul>
      {block.currentBlocker && (
        <div className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger">
          <span className="font-semibold">Current blocker: </span>
          {block.currentBlocker}
        </div>
      )}
    </SectionCard>
  );
}

function QualificationView({ block, plain = false }: { block: QualificationBlock; plain?: boolean }) {
  return (
    <Section plain={plain}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.title}</p>
      <ul className="mt-2.5 space-y-2">
        {block.items.map((item) => (
          <li key={item.id} className="flex gap-2.5">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                item.done ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
              }`}
            >
              {item.done ? <Check className="h-2.5 w-2.5" /> : "!"}
            </span>
            <div className="min-w-0">
              <p className="text-[13px]">{item.label}</p>
              {item.done && item.detail && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{item.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function AccountPlanView({ block, plain = false }: { block: AccountPlanBlock; plain?: boolean }) {
  return (
    <Section plain={plain}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">ACCOUNT OBJECTIVE</p>
      <p className="mt-1.5 text-[13.5px] leading-5">{block.objective}</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] text-muted-foreground">Goals</p>
          <ul className="mt-1 space-y-1">
            {block.goals.map((g, i) => (
              <li key={i} className="text-[13px]">
                {g}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Stakeholders</p>
          <ul className="mt-1 space-y-1">
            {block.stakeholders.map((s, i) => (
              <li key={i} className="text-[13px]">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function CommitmentsView({ block, setOverride }: { block: CommitmentsBlock; setOverride: (blockId: string, value: unknown) => void }) {
  if (block.items.length === 0) {
    return (
      <SectionCard>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.title}</p>
        <p className="mt-1.5 text-[13px] text-muted-foreground">No open commitments.</p>
      </SectionCard>
    );
  }
  return (
    <SectionCard>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.title}</p>
      <ul className="mt-2.5 space-y-2.5">
        {block.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium">{item.label}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {item.owner} · Due {item.due}
              </p>
            </div>
            {item.status === "done" ? (
              <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-[11.5px] font-medium text-success">Done</span>
            ) : (
              <button
                type="button"
                onClick={() => setOverride(`commitment-${item.id}`, { done: true })}
                className="inline-flex h-8 shrink-0 items-center rounded-lg border border-danger/30 px-2.5 text-[12px] font-medium text-danger transition-colors hover:bg-danger-soft"
              >
                Mark done
              </button>
            )}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
