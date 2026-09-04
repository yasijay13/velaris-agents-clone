/**
 * Universal Work Item Case File schema.
 *
 * A Work Item is one row an Expert-powered agent is actively managing
 * (an account's Sales Handover, a risk case, a renewal, ...). Its Case
 * File is the detailed drawer view: header + current state + next action,
 * followed by a data-driven list of blocks. The drawer and every block
 * renderer switch only on `block.type` — never on account name or Expert
 * name — so a new work item is authored entirely in data (see
 * `workItemCaseFiles.ts`), never by adding a UI branch.
 */

export type Tone = "warning" | "success" | "danger" | "neutral";

/** Which drawer tab a block belongs to. Overview = operate (what's happening,
 *  what the agent needs from you, what happens next). Context = understand
 *  (why the agent decided what it decided — the full evidence/trigger/autonomy
 *  trail). Activity = audit (this work item's own chronological history).
 *  Defaults to "overview" when omitted so older/simple case files still render. */
export type DrawerTab = "overview" | "context" | "activity";

interface BlockBase {
  /** Unique within a case file. Attention-item `focusTarget`s point at this id. */
  id: string;
  tab?: DrawerTab;
}

export interface ProgressBlock extends BlockBase {
  type: "progress";
  label: string;
  completed: number;
  total: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  /** Shown once done — the information Wayfinder actually captured. */
  detail?: string;
}
export interface ChecklistBlock extends BlockBase {
  type: "checklist";
  title: string;
  items: ChecklistItem[];
}

export interface QuestionBlock extends BlockBase {
  type: "question";
  heading: string;
  question: string;
  placeholder?: string;
  answered: boolean;
  answerText?: string;
  acknowledgement?: string;
}

export interface ApprovalAction {
  id: string;
  label: string;
  tone?: "primary" | "neutral" | "danger";
}
export interface ApprovalBlock extends BlockBase {
  type: "approval";
  heading: string;
  description: string;
  details?: { label: string; value: string }[];
  actions: ApprovalAction[];
  /** Set once one of the non-"modify"/"recommend" style actions resolves the block. */
  resolution?: { actionId: string; note?: string };
  /** Free-text note shown after "Ask for a recommendation" — doesn't resolve the block. */
  recommendation?: string;
  /** True once "Request changes" / "Modify" has revealed its follow-up input. */
  showFollowUpInput?: boolean;
  followUpPlaceholder?: string;
}

export interface SignalPoint {
  label: string;
  value: string;
}
export interface SignalEvidenceBlock extends BlockBase {
  type: "signalEvidence";
  title: string;
  trend?: SignalPoint[];
  changeLabel?: string;
  metrics?: SignalPoint[];
  reasoningHeading?: string;
  reasoning?: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject?: string;
  timestamp: string;
  body: string;
  sender: "agent" | "human" | "customer";
  approvalRequired?: boolean;
  autoSent?: boolean;
}
export interface EmailThreadBlock extends BlockBase {
  type: "emailThread";
  trigger?: string;
  /** When set, renders a 3-line provenance strip above the thread
   *  ("Initiated by {initiatedBy}" / "Trigger: {trigger}" / {sentInfo}) so the
   *  conversation is visibly tied back to the decision that started it. */
  initiatedBy?: string;
  sentInfo?: string;
  messages: EmailMessage[];
}

/** A named risk (or opportunity) dimension the agent conceptually evaluates,
 *  e.g. "User Adoption" / "High risk" — deliberately not all alarming, so the
 *  reader can see where the risk is (and isn't) coming from. */
export interface RiskDimension {
  name: string;
  state: string;
}
export interface RiskAssessmentBlock extends BlockBase {
  type: "riskAssessment";
  level: string;
  /** Concise, product-facing explanation grounded in visible evidence —
   *  never exposed hidden chain-of-thought. */
  summary: string;
  primaryDriver: string;
  supportingSignal: string;
  urgency: string;
  dimensions: RiskDimension[];
}

/** One piece of evidence backing a risk assessment. `role` distinguishes what
 *  actually drove the classification (primary) from what strengthened it
 *  (supporting) and from commercial framing (context) — the point is to let
 *  the reader see the few signals that mattered, not every attribute the
 *  agent evaluated. */
export interface EvidenceItem {
  role: "primary" | "supporting" | "context";
  metric: string;
  current?: string;
  previous?: string;
  change?: string;
  value?: string;
  trend?: SignalPoint[];
  explanation: string;
}
export interface EvidenceAttribute {
  label: string;
  value: string;
}
export interface EvidenceBlock extends BlockBase {
  type: "evidence";
  items: EvidenceItem[];
  /** Secondary attributes shown only behind "View all evidence" — kept out of
   *  the default view so a handful of signals don't get lost in a dump. */
  additionalAttributes?: EvidenceAttribute[];
}

/** Makes the trigger → autonomy → action chain auditable: which configured
 *  playbook matched, which of its conditions were met, and whether Hermes was
 *  allowed to act without approval. */
export interface ActionDecisionBlock extends BlockBase {
  type: "actionDecision";
  playbook: string;
  condition: string;
  matchedConditions: string[];
  autonomy: {
    policy: string;
    scope: string;
    approvalRequired: boolean;
  };
  action: string;
}

export interface EmailDraftBlock extends BlockBase {
  type: "emailDraft";
  heading: string;
  subject: string;
  body: string;
  status: "draft" | "sent";
  approveLabel: string;
  allowEdit: boolean;
  allowAskAgent: boolean;
  askAgentAcknowledgement?: string;
  revisedBody?: string;
}

export interface ArtifactBlock extends BlockBase {
  type: "artifact";
  name: string;
  kind: string;
  state: "Draft" | "Published";
  lastUpdated: string;
  previewLines: string[];
}

export interface RecordSummaryBlock extends BlockBase {
  type: "recordSummary";
  title: string;
  /** Optional one-line lede shown above the fields, e.g. "Potential seat expansion". */
  headline?: string;
  fields: { label: string; value: string }[];
}

/** Compact, scannable explanation shown on the Overview tab so the reader never
 *  has to infer why a case exists — without repeating the full evidence/trigger/
 *  autonomy trail that lives on the Context tab. `contextLabel` drives a
 *  "View full context →" action that switches the drawer to the Context tab. */
export interface WhySummaryLine {
  label: string;
  value: string;
}
export interface WhySummaryBlock extends BlockBase {
  type: "whySummary";
  heading: string;
  level?: string;
  levelTone?: Tone;
  lines: WhySummaryLine[];
  contextLabel?: string;
}

export interface TimelineEvent {
  timestamp: string;
  description: string;
}
export interface TimelineBlock extends BlockBase {
  type: "timeline";
  events: TimelineEvent[];
}

export interface NextActionBlock extends BlockBase {
  type: "nextAction";
  text: string;
  blockedOnUser: boolean;
}

export interface OwnerAssignBlock extends BlockBase {
  type: "ownerAssign";
  heading: string;
  description: string;
  options: string[];
  assigned?: string;
}

export interface EscalationAction {
  id: string;
  label: string;
}
export interface EscalationActionsBlock extends BlockBase {
  type: "escalationActions";
  heading: string;
  description: string;
  actions: EscalationAction[];
  resolvedAction?: string;
  showFollowUpInput?: boolean;
  followUpAcknowledgement?: string;
}

export interface OutcomeBlock extends BlockBase {
  type: "outcome";
  completedAt: string;
  summary: string;
  whatHappened: string[];
}

export interface MitigationPlanBlock extends BlockBase {
  type: "mitigationPlan";
  title: string;
  actionsTaken: string[];
  currentBlocker?: string;
}

export interface QualificationBlock extends BlockBase {
  type: "qualification";
  title: string;
  items: ChecklistItem[];
}

export interface AccountPlanBlock extends BlockBase {
  type: "accountPlan";
  objective: string;
  goals: string[];
  stakeholders: string[];
}

export interface CommitmentItem {
  id: string;
  label: string;
  owner: string;
  due: string;
  status: "overdue" | "done" | "open";
}
export interface CommitmentsBlock extends BlockBase {
  type: "commitments";
  title: string;
  items: CommitmentItem[];
}

export type WorkItemBlock =
  | ProgressBlock
  | ChecklistBlock
  | QuestionBlock
  | ApprovalBlock
  | SignalEvidenceBlock
  | EmailThreadBlock
  | EmailDraftBlock
  | ArtifactBlock
  | RecordSummaryBlock
  | TimelineBlock
  | NextActionBlock
  | OwnerAssignBlock
  | EscalationActionsBlock
  | OutcomeBlock
  | MitigationPlanBlock
  | QualificationBlock
  | AccountPlanBlock
  | CommitmentsBlock
  | RiskAssessmentBlock
  | EvidenceBlock
  | ActionDecisionBlock
  | WhySummaryBlock;

export interface WorkItemCaseFile {
  id: string;
  account: string;
  workType: string;
  status: string;
  agentName: string;
  targetDate?: string;
  currentState: string;
  blocks: WorkItemBlock[];
}

/** Opaque per-block state captured by the drawer (answers, approvals, edits, ...).
 *  Each work item's builder function is the only thing that interprets it. */
export type CaseFileOverrides = Record<string, unknown>;

export type CaseFileBuilder = (overrides: CaseFileOverrides) => WorkItemCaseFile;
