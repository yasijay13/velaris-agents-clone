export type Tone = "warning" | "success" | "danger";

export interface ExpertStep {
  title: string;
  description: string;
}

/** The outcome an Expert takes responsibility for — not a task, a job. */
export interface ExpertOutcome {
  /** One-sentence statement of the outcome this Expert owns. */
  statement: string;
  /** Optional longer paragraph explaining how it takes responsibility for that outcome. */
  supportingText?: string;
}

export interface ExpertCapabilityNote {
  current: string;
  plannedNext: string;
}

export interface ControlSplit {
  onItsOwn: string[];
  comesToYouFirst: string[];
}

/** A configurable trigger an Expert-powered agent listens for. */
export interface ExpertTrigger {
  label: string;
  description: string;
}

/** A capability the Expert can exercise, shown in Settings with a toggle. */
export interface ExpertSkill {
  name: string;
  description: string;
  enabledByDefault: boolean;
}

export interface ExpertApprovalRule {
  auto: string[];
  manual: string[];
}

export interface ExpertSuccessCriterionField {
  label: string;
  value: string;
}

/** Everything needed to render the Settings tab for an agent powered by this Expert. */
export interface ExpertConfiguration {
  baseObjective: string;
  triggers: ExpertTrigger[];
  skills: ExpertSkill[];
  context: string[];
  defaultScope: string;
  approvals: ExpertApprovalRule;
  notifications: string[];
  successCriteria: ExpertSuccessCriterionField[];
}

export interface WorkColumn {
  key: string;
  label: string;
}

export interface WorkAttentionItem {
  /** Stable id of the WorkRow this attention item is about — the drawer opens this work item. */
  workItemId: string;
  account: string;
  detail: string;
  actionLabel: string;
  tone: Tone;
  /** Block id inside that work item's case file to scroll/focus to when this action is clicked. */
  focusTarget?: string;
}

export interface WorkRow {
  /** Stable id for this work item, used to resolve its Work Item Case File. */
  id: string;
  account: string;
  segment: string;
  cells: Record<string, string>;
  statusTone: Tone | "neutral";
}

/** The Work-tab schema + mock data for an agent powered by this Expert. */
export interface ExpertWorkProfile {
  statCards: { label: string; value: string }[];
  sectionTitle: string;
  sectionSubtitle: string;
  columns: WorkColumn[];
  statusKey: string;
  rows: WorkRow[];
  attention: WorkAttentionItem[];
}

export interface ExpertAgent {
  slug: string;
  name: string;
  description: string;
  bullets: string[];
  integrations: string[];
  category: string;
  avatar:
    | { type: "video"; src: string }
    | { type: "shader"; shader: "cosmic-cloud" | "helix" | "singularity" };
  added: boolean;
  outcome: ExpertOutcome;
  capabilityNote?: ExpertCapabilityNote;
  howItWorks: ExpertStep[];
  doesOnItsOwn: string[];
  comesToYouFirst: string[];
  contextItReads: string[];
  /** KPI names only — no fabricated numbers, since the template hasn't been activated yet. */
  successMeasures: string[];
  profile: ExpertWorkProfile;
  configuration: ExpertConfiguration;
}

export const expertCategories = [
  "All",
  "Onboarding",
  "Renewals",
  "Risk",
  "Expansion",
  "Account Planning",
  "Comms",
];

export const expertAgents: ExpertAgent[] = [
  // ---------------------------------------------------------------------
  // Wayfinder — Onboarding Expert
  // ---------------------------------------------------------------------
  {
    slug: "onboarding-expert",
    name: "Wayfinder",
    description:
      "Owns the transition from Closed Won to a complete, actionable sales handover, gathering context and chasing missing information before onboarding stalls.",
    bullets: [
      "Builds the handover from the closed-won deal",
      "Chases missing owners, dates and prerequisites",
      "Escalates before the target date is at risk",
    ],
    integrations: ["Gmail", "Slack", "Salesforce"],
    category: "Onboarding",
    avatar: { type: "video", src: "/assets/avatar-pulse.webm" },
    added: true,
    outcome: {
      statement: "Complete every sales handover within the target timeframe.",
      supportingText:
        "Wayfinder takes responsibility for getting each new customer from Closed Won to a complete handover. It gathers the customer context, identifies what is missing, chases the right people and escalates blockers before the target date is missed.",
    },
    capabilityNote: {
      current: "Sales Handover",
      plannedNext: "kickoff coordination, onboarding plans and end-to-end onboarding management.",
    },
    howItWorks: [
      {
        title: "Detects a new onboarding",
        description: "Starts when a deal reaches the configured Closed Won or onboarding stage.",
      },
      {
        title: "Builds the handover",
        description:
          "Pulls together what was bought, why the customer bought, expected outcomes, stakeholders, commitments and relevant commercial context.",
      },
      {
        title: "Finds what's missing",
        description: "Identifies missing owners, success criteria, dates, prerequisites or unanswered questions.",
      },
      {
        title: "Drives it to completion",
        description:
          "Follows up with the right internal people, keeps the handover current and escalates anything that could cause the target date to be missed.",
      },
    ],
    doesOnItsOwn: [
      "Creates the Sales Handover",
      "Gathers context from connected customer data",
      "Identifies missing handover information",
      "Sends internal reminders for missing actions",
      "Updates the handover as new information becomes available",
      "Tracks progress against the target date",
    ],
    comesToYouFirst: [
      "Conflicting or unclear customer commitments",
      "Missing information it cannot resolve",
      "Decisions requiring CSM judgement",
      "A handover expected to miss its target",
      "Customer-facing communication when approval is enabled",
    ],
    contextItReads: [
      "Closed-won opportunity and CRM data",
      "Sales call transcripts and notes",
      "Customer email history",
      "Contracts and commercial terms",
      "Customer goals and success criteria",
      "Stakeholders and account ownership",
      "Existing Velaris notes, tasks and customer context",
    ],
    successMeasures: [
      "Active handovers",
      "Handovers completed",
      "Handovers completed within target",
      "On-time completion rate",
      "Average handover time",
      "Handovers needing human attention",
    ],
    profile: {
      statCards: [
        { label: "Active handovers", value: "18" },
        { label: "Completed on time", value: "42" },
        { label: "On-time completion rate", value: "92%" },
        { label: "Need your attention", value: "3" },
      ],
      sectionTitle: "Sales handovers being managed",
      sectionSubtitle: "Every account this agent is currently driving to a committed handover.",
      columns: [
        { key: "owner", label: "Owner" },
        { key: "started", label: "Started" },
        { key: "progress", label: "Handover progress" },
        { key: "target", label: "Target" },
        { key: "status", label: "Status" },
        { key: "nextAction", label: "Next action" },
        { key: "lastActivity", label: "Last activity" },
      ],
      statusKey: "status",
      rows: [
        {
          id: "wayfinder-acme",
          account: "Acme Corp",
          segment: "Enterprise · $500k",
          cells: { owner: "Jane D.", started: "Aug 18", progress: "4/6", target: "Sep 5", status: "Waiting on CSM", nextAction: "Reminder in 1d", lastActivity: "2h ago" },
          statusTone: "warning",
        },
        {
          id: "wayfinder-globex",
          account: "Globex",
          segment: "Mid-market · $120k",
          cells: { owner: "R. Silva", started: "Aug 22", progress: "6/6", target: "Sep 3", status: "Ready to commit", nextAction: "Awaiting approval", lastActivity: "40m ago" },
          statusTone: "success",
        },
        {
          id: "wayfinder-initech",
          account: "Initech",
          segment: "SMB · $28k",
          cells: { owner: "Jane D.", started: "Aug 10", progress: "2/6", target: "Tomorrow", status: "Stalled", nextAction: "Reminder Fri 10am", lastActivity: "1d ago" },
          statusTone: "danger",
        },
        {
          id: "wayfinder-northwind",
          account: "Northwind",
          segment: "Mid-market · $84k",
          cells: { owner: "Marcus L.", started: "Aug 30", progress: "3/6", target: "Sep 12", status: "In progress", nextAction: "Awaiting implementation owner", lastActivity: "Yesterday" },
          statusTone: "warning",
        },
        {
          id: "wayfinder-umbrella",
          account: "Umbrella Health",
          segment: "Enterprise · $410k",
          cells: { owner: "R. Silva", started: "Aug 15", progress: "5/6", target: "Sep 8", status: "In progress", nextAction: "Confirm go-live date", lastActivity: "3h ago" },
          statusTone: "warning",
        },
      ],
      attention: [
        { workItemId: "wayfinder-acme", account: "Acme Corp", detail: "Success criteria missing — waiting on you for 2 days", actionLabel: "Review", tone: "warning", focusTarget: "success-criteria-question" },
        { workItemId: "wayfinder-globex", account: "Globex", detail: "Handover complete and ready to commit", actionLabel: "Approve", tone: "success", focusTarget: "handover-approval" },
        { workItemId: "wayfinder-initech", account: "Initech", detail: "Implementation owner still unassigned and handover target is tomorrow", actionLabel: "Assign owner", tone: "danger", focusTarget: "assign-owner" },
      ],
    },
    configuration: {
      baseObjective:
        "You are Wayfinder, Velaris' Onboarding Expert. Your job is to own the transition from Closed Won to a complete, actionable sales handover — gather the customer context, identify what's missing, chase the right people, and escalate before a handover's target date is at risk.",
      triggers: [
        { label: "When Opportunity becomes Closed Won", description: "Starts building a handover the moment a deal is marked Closed Won in Salesforce." },
        { label: "When Account enters Onboarding", description: "Starts if an account moves into the Onboarding lifecycle stage directly." },
        { label: "Handover missing information", description: "Re-evaluates a handover whenever new CRM, email or call data arrives for that account." },
      ],
      skills: [
        { name: "Read sales conversations", description: "Read call transcripts, notes and email threads on the account.", enabledByDefault: true },
        { name: "Create Sales Handover", description: "Create the initial Sales Handover record.", enabledByDefault: true },
        { name: "Create/update Velaris records", description: "Update handover fields as information becomes available.", enabledByDefault: true },
        { name: "Create tasks", description: "Create internal tasks for missing owners or prerequisites.", enabledByDefault: true },
        { name: "Send Slack reminders", description: "Send reminders to internal owners in Slack.", enabledByDefault: true },
        { name: "Send emails", description: "Send internal reminder emails.", enabledByDefault: true },
        { name: "Schedule meetings", description: "Propose and schedule kickoff meetings.", enabledByDefault: false },
      ],
      context: [
        "Closed-won opportunity and CRM data",
        "Sales call transcripts and notes",
        "Customer email history",
        "Contracts and commercial terms",
        "Customer goals and success criteria",
        "Stakeholders and account ownership",
      ],
      defaultScope: "All accounts entering onboarding",
      approvals: {
        auto: ["Creating and updating the Sales Handover", "Internal reminders to Velaris teammates", "Marking handover steps complete"],
        manual: ["Any message sent to the customer", "Pushing a target date out", "Marking a handover as at risk"],
      },
      notifications: [
        "Notify the account owner in Slack when a handover is created",
        "Notify the account owner by email if a handover is 2+ days behind target",
        "Escalate to the CS lead if a handover will miss its target",
      ],
      successCriteria: [
        { label: "Sales handover target", value: "7 days" },
        { label: "Required handover components", value: "Stakeholders, success criteria, commitments, go-live date" },
        { label: "Definition of complete", value: "All required components confirmed and owner assigned" },
      ],
    },
  },

  // ---------------------------------------------------------------------
  // Phoenix — Renewal Expert
  // ---------------------------------------------------------------------
  {
    slug: "renewal-expert",
    name: "Phoenix",
    description:
      "Owns the renewal journey from early preparation through decision, keeping context, outreach and follow-up moving before the renewal date.",
    bullets: [
      "Builds renewal context from contracts and usage",
      "Prepares and manages renewal outreach",
      "Escalates pricing and negotiation decisions",
    ],
    integrations: ["Salesforce", "Gmail", "Velaris Contracts"],
    category: "Renewals",
    avatar: { type: "video", src: "/assets/avatar-orbit.webm" },
    added: false,
    outcome: {
      statement: "Drive every renewal to a decision before the renewal date.",
      supportingText:
        "Phoenix takes responsibility for a renewal from the moment it enters the renewal window. It keeps the context current, prepares outreach, follows up, and makes sure nothing sits idle in the final weeks before the contract date.",
    },
    howItWorks: [
      { title: "Detects the renewal window", description: "Starts when an account enters the configured renewal window ahead of its contract date." },
      { title: "Builds renewal context", description: "Assembles contracts, usage, health and customer conversations into a renewal packet." },
      { title: "Identifies risks and blockers", description: "Flags usage, sentiment or stakeholder signals that put the renewal in doubt." },
      { title: "Prepares and initiates outreach", description: "Drafts and, once approved, sends renewal communication grounded in that context." },
      { title: "Manages follow-ups", description: "Handles routine responses and keeps the renewal moving toward a decision." },
      { title: "Escalates commercial decisions", description: "Brings in the account owner for pricing, negotiation or contract changes." },
    ],
    doesOnItsOwn: [
      "Opens the renewal file on schedule",
      "Assembles the usage and contract packet",
      "Identifies renewal risk signals",
      "Drafts renewal outreach",
      "Sends approved follow-up reminders",
      "Tracks the renewal until completion",
    ],
    comesToYouFirst: [
      "Sending any renewal or pricing email",
      "Offering a discount or contract change",
      "Marking a renewal as at risk",
      "Procurement or legal negotiation",
    ],
    contextItReads: [
      "Contract terms and renewal date",
      "Product usage and adoption trend",
      "Health, AI Pulse and AI Risk context",
      "Support tickets and recent sentiment",
      "Prior renewal history and pricing",
    ],
    successMeasures: [
      "Renewals being managed",
      "Renewals on track",
      "Renewals completed",
      "Renewals requiring attention",
      "On-time renewal completion rate",
    ],
    profile: {
      statCards: [
        { label: "Renewals being managed", value: "24" },
        { label: "On track", value: "19" },
        { label: "Completed", value: "8" },
        { label: "Need your attention", value: "3" },
      ],
      sectionTitle: "Renewals being managed",
      sectionSubtitle: "Every renewal this agent is currently preparing, tracking or following up on.",
      columns: [
        { key: "renewalDate", label: "Renewal date" },
        { key: "arr", label: "ARR" },
        { key: "stage", label: "Stage" },
        { key: "risk", label: "Risk" },
        { key: "status", label: "Status" },
        { key: "nextAction", label: "Next action" },
        { key: "lastActivity", label: "Last activity" },
      ],
      statusKey: "status",
      rows: [
        {
          id: "phoenix-stark",
          account: "Stark Industries",
          segment: "Enterprise · $610k",
          cells: { renewalDate: "Sep 30", arr: "$610k", stage: "Negotiation", risk: "Elevated", status: "Needs you", nextAction: "Approve pricing request", lastActivity: "1h ago" },
          statusTone: "danger",
        },
        {
          id: "phoenix-wren",
          account: "Wren Analytics",
          segment: "Mid-market · $95k",
          cells: { renewalDate: "Oct 12", arr: "$95k", stage: "Outreach sent", risk: "Low", status: "On track", nextAction: "Awaiting response", lastActivity: "5h ago" },
          statusTone: "success",
        },
        {
          id: "phoenix-castlemount",
          account: "Castlemount",
          segment: "Enterprise · $480k",
          cells: { renewalDate: "Sep 22", arr: "$480k", stage: "Procurement", risk: "Elevated", status: "Waiting", nextAction: "Follow up with procurement", lastActivity: "2d ago" },
          statusTone: "warning",
        },
      ],
      attention: [
        { workItemId: "phoenix-stark", account: "Stark Industries", detail: "Pricing request requires approval", actionLabel: "Review", tone: "danger", focusTarget: "commercial-approval" },
        { workItemId: "phoenix-castlemount", account: "Castlemount", detail: "Procurement has not responded", actionLabel: "Follow up", tone: "warning", focusTarget: "procurement-timeline" },
        { workItemId: "phoenix-wren", account: "Wren Analytics", detail: "Renewal risk increased", actionLabel: "Investigate", tone: "warning", focusTarget: "risk-evidence" },
      ],
    },
    configuration: {
      baseObjective:
        "You are Phoenix, Velaris' Renewal Expert. Your job is to own the renewal journey from early preparation through decision — build context, prepare outreach, chase follow-up and escalate pricing or negotiation decisions before the renewal date.",
      triggers: [
        { label: "When account enters X days before renewal", description: "Opens a renewal file a configurable number of days before the contract date." },
        { label: "Incoming renewal reply", description: "Re-evaluates the renewal whenever the customer responds." },
        { label: "Usage or health change", description: "Re-checks renewal risk when usage, health or sentiment shifts." },
      ],
      skills: [
        { name: "Read contracts and usage", description: "Read contract terms, usage and health data for the account.", enabledByDefault: true },
        { name: "Build renewal packet", description: "Assemble a renewal context packet.", enabledByDefault: true },
        { name: "Draft email", description: "Draft renewal outreach.", enabledByDefault: true },
        { name: "Send email", description: "Send approved renewal communication.", enabledByDefault: false },
        { name: "Create tasks", description: "Create follow-up tasks for the account owner.", enabledByDefault: true },
        { name: "Escalate to owner", description: "Escalate pricing or negotiation decisions.", enabledByDefault: true },
      ],
      context: [
        "Contract terms and renewal date",
        "Product usage and adoption trend",
        "Health, AI Pulse and AI Risk context",
        "Support tickets and recent sentiment",
      ],
      defaultScope: "All accounts within 90 days of renewal",
      approvals: {
        auto: ["Opening the renewal file", "Assembling the renewal packet", "Internal follow-up reminders"],
        manual: ["Sending any renewal or pricing email", "Offering a discount or contract change", "Marking a renewal as at risk"],
      },
      notifications: [
        "Notify the account owner when a renewal file opens",
        "Escalate to the account owner if procurement goes quiet for 5+ days",
        "Notify the CS lead on any pricing exception request",
      ],
      successCriteria: [
        { label: "Renewal window", value: "90 days before contract date" },
        { label: "Desired completion date", value: "14 days before contract date" },
        { label: "Commercial approval threshold", value: "Any discount above 10%" },
      ],
    },
  },

  // ---------------------------------------------------------------------
  // Sentinel — Risk Expert
  // ---------------------------------------------------------------------
  {
    slug: "risk-expert",
    name: "Sentinel",
    description:
      "Watches the portfolio for churn risk, correlating usage, sentiment and support signals and opening a save play while there's still time to act.",
    bullets: [
      "Correlates usage, sentiment and support signals",
      "Explains why an account is deteriorating",
      "Opens a save play with a recommended next action",
    ],
    integrations: ["Zendesk", "Product analytics", "Slack"],
    category: "Risk",
    avatar: { type: "video", src: "/assets/avatar-cube.webm" },
    added: false,
    outcome: {
      statement: "Identify and mitigate customer risk before it becomes churn.",
    },
    howItWorks: [
      { title: "Monitors the signals", description: "Watches usage, ticket volume and sentiment together, not in isolation." },
      { title: "Correlates the pattern", description: "Connects a drop in one signal to related movement across the others." },
      { title: "Explains the risk", description: "Writes a plain-language summary of why the account is deteriorating." },
      { title: "Opens a save play", description: "Recommends a next action and assigns it to the account owner." },
    ],
    doesOnItsOwn: [
      "Scores and re-scores portfolio risk daily",
      "Writes the risk explanation and evidence",
      "Opens a save-play task for the owner",
    ],
    comesToYouFirst: [
      "Any outreach sent to the customer",
      "Marking an account as churn-imminent",
      "Involving an executive sponsor",
    ],
    contextItReads: [
      "Product usage and adoption trend",
      "Support ticket volume and tone",
      "Health, AI Pulse and AI Risk context",
      "Prior save plays and their outcomes",
    ],
    successMeasures: [
      "Active risks",
      "New risks identified",
      "Risks mitigated",
      "Accounts needing your attention",
    ],
    profile: {
      statCards: [
        { label: "Active risks", value: "21" },
        { label: "New risks identified", value: "6" },
        { label: "Risks mitigated", value: "11" },
        { label: "Need your attention", value: "4" },
      ],
      sectionTitle: "Customer risks being managed",
      sectionSubtitle: "Every account risk this agent is currently tracking or mitigating.",
      columns: [
        { key: "risk", label: "Risk" },
        { key: "severity", label: "Severity" },
        { key: "evidence", label: "Evidence" },
        { key: "confidence", label: "Confidence" },
        { key: "status", label: "Mitigation status" },
        { key: "nextAction", label: "Next action" },
      ],
      statusKey: "status",
      rows: [
        {
          id: "sentinel-initech",
          account: "Initech",
          segment: "SMB · $28k",
          cells: { risk: "Champion inactive", severity: "High", evidence: "No login 21 days, ticket spike", confidence: "High", status: "Needs you", nextAction: "Review escalation" },
          statusTone: "danger",
        },
        {
          id: "sentinel-brightfield",
          account: "Brightfield Media",
          segment: "Mid-market · $88k",
          cells: { risk: "Usage decline", severity: "Medium", evidence: "Usage down 42% over 3 weeks", confidence: "Medium", status: "Save play open", nextAction: "Approve recovery play" },
          statusTone: "warning",
        },
      ],
      attention: [
        { workItemId: "sentinel-initech", account: "Initech", detail: "Champion inactive and ticket volume spiking", actionLabel: "Review", tone: "danger", focusTarget: "mitigation-plan" },
        { workItemId: "sentinel-brightfield", account: "Brightfield Media", detail: "Recovery play drafted, ready for approval", actionLabel: "Approve", tone: "success", focusTarget: "recovery-approval" },
      ],
    },
    configuration: {
      baseObjective:
        "You are Sentinel, Velaris' Risk Expert. Your job is to identify and mitigate customer risk before it becomes churn — correlate usage, sentiment and support signals, explain what's happening, and open a save play while there's time to act.",
      triggers: [
        { label: "Daily risk evaluation", description: "Re-scores portfolio risk once a day across usage, sentiment and support signals." },
        { label: "Support ticket spike", description: "Re-evaluates an account when ticket volume or tone changes sharply." },
        { label: "Health score movement", description: "Re-evaluates when Health, AI Pulse or AI Risk moves meaningfully." },
      ],
      skills: [
        { name: "Analyse usage", description: "Read product usage and adoption trend data.", enabledByDefault: true },
        { name: "Read support tickets", description: "Read Zendesk ticket volume and tone.", enabledByDefault: true },
        { name: "Create risk", description: "Open a risk record with evidence.", enabledByDefault: true },
        { name: "Create tasks", description: "Open a save-play task for the account owner.", enabledByDefault: true },
        { name: "Escalate to owner", description: "Escalate churn-imminent accounts.", enabledByDefault: true },
      ],
      context: [
        "Product usage and adoption trend",
        "Support ticket volume and tone",
        "Health, AI Pulse and AI Risk context",
        "Prior save plays and their outcomes",
      ],
      defaultScope: "All accounts below Healthy status",
      approvals: {
        auto: ["Scoring and re-scoring risk", "Opening a save-play task"],
        manual: ["Any outreach sent to the customer", "Marking an account as churn-imminent", "Involving an executive sponsor"],
      },
      notifications: [
        "Notify the account owner when a new risk is opened",
        "Escalate to the CS lead when an account is marked churn-imminent",
      ],
      successCriteria: [
        { label: "Risk qualification threshold", value: "Health score drop of 15+ points or ticket volume 2x baseline" },
        { label: "Save play SLA", value: "Reviewed within 2 business days" },
      ],
    },
  },

  // ---------------------------------------------------------------------
  // Artemis — Expansion Expert
  // ---------------------------------------------------------------------
  {
    slug: "expansion-expert",
    name: "Artemis",
    description:
      "Hunts down seat, usage and team-growth signals hiding inside healthy accounts and turns them into qualified expansion opportunities.",
    bullets: [
      "Detects seat, usage and team expansion triggers",
      "Qualifies opportunities against buying criteria",
      "Hands qualified expansion to the account team",
    ],
    integrations: ["Salesforce", "Product analytics"],
    category: "Expansion",
    avatar: { type: "shader", shader: "cosmic-cloud" },
    added: false,
    outcome: {
      statement: "Turn customer signals into qualified expansion opportunities.",
    },
    howItWorks: [
      { title: "Watches for triggers", description: "Tracks seat count, usage depth and team growth for expansion signals." },
      { title: "Qualifies the signal", description: "Checks it against your buying criteria before treating it as an opportunity." },
      { title: "Builds the case", description: "Puts together the usage evidence that supports the expansion conversation." },
      { title: "Hands it off", description: "Routes qualified expansion to the right account owner with context attached." },
    ],
    doesOnItsOwn: [
      "Scores expansion signals across the portfolio",
      "Qualifies signals against buying criteria",
      "Prepares the usage evidence for each opportunity",
    ],
    comesToYouFirst: [
      "Any outreach proposing an upgrade",
      "Opportunities above your deal-size threshold",
      "Looping in sales or an AE",
    ],
    contextItReads: [
      "Seat count and license utilisation",
      "Product usage and feature adoption",
      "Account plan and buying criteria",
    ],
    successMeasures: [
      "Signals detected",
      "Qualified opportunities",
      "Opportunities progressed",
      "Accounts needing your attention",
    ],
    profile: {
      statCards: [
        { label: "Signals detected", value: "37" },
        { label: "Qualified opportunities", value: "12" },
        { label: "Opportunities progressed", value: "8" },
        { label: "Need your attention", value: "2" },
      ],
      sectionTitle: "Expansion opportunities being managed",
      sectionSubtitle: "Every expansion signal this agent has qualified or is progressing.",
      columns: [
        { key: "signal", label: "Signal" },
        { key: "motion", label: "Expansion motion" },
        { key: "evidence", label: "Evidence" },
        { key: "qualification", label: "Qualification" },
        { key: "status", label: "Status" },
        { key: "nextAction", label: "Next action" },
      ],
      statusKey: "status",
      rows: [
        {
          id: "artemis-globex",
          account: "Globex",
          segment: "Mid-market · $120k",
          cells: { signal: "Seats at 94%", motion: "Seat expansion", evidence: "License utilisation trend", qualification: "Qualified", status: "Needs you", nextAction: "Loop in account owner" },
          statusTone: "danger",
        },
        {
          id: "artemis-umbrella",
          account: "Umbrella Health",
          segment: "Enterprise · $410k",
          cells: { signal: "New team onboarded", motion: "Team growth", evidence: "12 new active users", qualification: "Qualifying", status: "In progress", nextAction: "Confirm buying criteria" },
          statusTone: "warning",
        },
      ],
      attention: [
        { workItemId: "artemis-globex", account: "Globex", detail: "Qualified expansion opportunity above deal-size threshold", actionLabel: "Review", tone: "danger", focusTarget: "budget-question" },
        { workItemId: "artemis-umbrella", account: "Umbrella Health", detail: "Evidence ready, awaiting qualification confirmation", actionLabel: "Approve", tone: "warning", focusTarget: "qualification-checklist" },
      ],
    },
    configuration: {
      baseObjective:
        "You are Artemis, Velaris' Expansion Expert. Your job is to turn customer signals into qualified expansion opportunities — watch for seat, usage and team-growth triggers, qualify them against buying criteria, and hand off qualified expansion to the account team.",
      triggers: [
        { label: "Seat utilisation threshold", description: "Fires when license utilisation crosses a configured threshold." },
        { label: "New team detected", description: "Fires when a meaningful number of new active users appear on an account." },
        { label: "Weekly signal scan", description: "Re-scans the portfolio for expansion signals weekly." },
      ],
      skills: [
        { name: "Analyse usage", description: "Read seat count, usage depth and feature adoption.", enabledByDefault: true },
        { name: "Create opportunity", description: "Open a qualified expansion opportunity.", enabledByDefault: true },
        { name: "Draft email", description: "Draft an expansion outreach email.", enabledByDefault: true },
        { name: "Escalate to owner", description: "Hand qualified expansion to the account owner.", enabledByDefault: true },
      ],
      context: [
        "Seat count and license utilisation",
        "Product usage and feature adoption",
        "Account plan and buying criteria",
      ],
      defaultScope: "All accounts above Healthy status",
      approvals: {
        auto: ["Scoring expansion signals", "Qualifying against buying criteria", "Preparing usage evidence"],
        manual: ["Any outreach proposing an upgrade", "Opportunities above the deal-size threshold", "Looping in sales or an AE"],
      },
      notifications: [
        "Notify the account owner when a signal is qualified",
        "Escalate to sales when an opportunity crosses the deal-size threshold",
      ],
      successCriteria: [
        { label: "Qualification criteria", value: "Seat utilisation above 90% or 3+ new active users" },
        { label: "Deal-size threshold", value: "$25k ARR uplift" },
      ],
    },
  },

  // ---------------------------------------------------------------------
  // Bastion — Account Planning Expert
  // ---------------------------------------------------------------------
  {
    slug: "qbr-expert",
    name: "Bastion",
    description:
      "Keeps strategic account plans current and turns account strategy into action — QBR preparation is one capability, not its entire identity.",
    bullets: [
      "Keeps account plans current with real outcomes",
      "Tracks goals, commitments and open actions",
      "Prepares QBRs as one part of ongoing planning",
    ],
    integrations: ["Google Slides", "Gmail", "Velaris Canvases"],
    category: "Account Planning",
    avatar: { type: "shader", shader: "helix" },
    added: false,
    outcome: {
      statement: "Keep strategic account plans current and turn account strategy into action.",
    },
    howItWorks: [
      { title: "Tracks the plan", description: "Keeps each account's goals, stakeholders and commitments up to date." },
      { title: "Gathers the outcomes", description: "Pulls value delivered, adoption movement and open commitments as they happen." },
      { title: "Prepares reviews", description: "Drafts the QBR narrative and materials from that evidence when a review is due." },
      { title: "Tracks follow-through", description: "Checks which commitments were kept and flags what's overdue." },
    ],
    doesOnItsOwn: [
      "Keeps the account plan's goals and stakeholders current",
      "Assembles the value and adoption evidence",
      "Drafts the QBR deck and talking points",
      "Flags overdue commitments",
    ],
    comesToYouFirst: [
      "Any recap or follow-up sent to the customer",
      "Scheduling a review on the customer's calendar",
      "New commitments proposed for next quarter",
    ],
    contextItReads: [
      "Prior QBR notes and commitments",
      "Usage and value-delivered metrics",
      "Account plan and stakeholder map",
    ],
    successMeasures: [
      "Accounts under management",
      "Account plans current",
      "Upcoming reviews",
      "Commitments overdue",
    ],
    profile: {
      statCards: [
        { label: "Accounts under management", value: "34" },
        { label: "Account plans current", value: "29" },
        { label: "Upcoming reviews", value: "6" },
        { label: "Commitments overdue", value: "2" },
      ],
      sectionTitle: "Account plans being managed",
      sectionSubtitle: "Every strategic account plan this agent is keeping current.",
      columns: [
        { key: "status", label: "Plan status" },
        { key: "goals", label: "Goals" },
        { key: "nextReview", label: "Next review" },
        { key: "commitments", label: "Open commitments" },
        { key: "nextAction", label: "Next action" },
      ],
      statusKey: "status",
      rows: [
        {
          id: "bastion-stark",
          account: "Stark Industries",
          segment: "Enterprise · $610k",
          cells: { status: "Overdue", goals: "Expand to 3 new teams", nextReview: "Sep 18", commitments: "2 overdue", nextAction: "Follow up on commitments" },
          statusTone: "danger",
        },
        {
          id: "bastion-talus",
          account: "Talus Financial",
          segment: "Enterprise · $650k",
          cells: { status: "Current", goals: "Improve adoption of reporting suite", nextReview: "Oct 2", commitments: "0 overdue", nextAction: "—" },
          statusTone: "success",
        },
      ],
      attention: [
        { workItemId: "bastion-stark", account: "Stark Industries", detail: "Two commitments from the last review are overdue", actionLabel: "Review", tone: "danger", focusTarget: "commitments" },
      ],
    },
    configuration: {
      baseObjective:
        "You are Bastion, Velaris' Account Planning Expert. Your job is to keep strategic account plans current and turn account strategy into action — QBR preparation is one capability you have, not your whole job.",
      triggers: [
        { label: "Weekly plan refresh", description: "Refreshes each account plan's goals, stakeholders and commitments weekly." },
        { label: "Review scheduled", description: "Begins preparing evidence and a narrative when a QBR is scheduled." },
        { label: "Commitment due date reached", description: "Flags a commitment as overdue if it passes its due date unresolved." },
      ],
      skills: [
        { name: "Read account plan", description: "Read goals, stakeholders and commitments.", enabledByDefault: true },
        { name: "Update account plan", description: "Keep the plan's fields current.", enabledByDefault: true },
        { name: "Draft QBR deck", description: "Draft the QBR narrative and materials.", enabledByDefault: true },
        { name: "Create tasks", description: "Open follow-up tasks for overdue commitments.", enabledByDefault: true },
      ],
      context: [
        "Prior QBR notes and commitments",
        "Usage and value-delivered metrics",
        "Account plan and stakeholder map",
      ],
      defaultScope: "All strategic and enterprise accounts",
      approvals: {
        auto: ["Updating the account plan", "Assembling evidence", "Drafting QBR materials"],
        manual: ["Any recap sent to the customer", "Scheduling a review on the customer's calendar", "New commitments for next quarter"],
      },
      notifications: [
        "Notify the account owner when a plan falls out of date",
        "Notify the account owner when a commitment becomes overdue",
      ],
      successCriteria: [
        { label: "Plan freshness target", value: "Updated within 30 days" },
        { label: "Review cadence", value: "Quarterly for Enterprise" },
      ],
    },
  },

  // ---------------------------------------------------------------------
  // Hermes — Long-tail Communications Expert
  // ---------------------------------------------------------------------
  {
    slug: "intelligence-expert",
    name: "Hermes",
    description:
      "Monitors long-tail customers for risk and growth signals, reaches out using customer context and manages the conversation until the outcome is reached or human judgement is required.",
    bullets: [
      "Monitors long-tail customers for risk and growth signals",
      "Starts and manages contextual customer conversations",
      "Escalates when judgement or commercial decisions are needed",
    ],
    integrations: ["Gmail", "Zendesk", "Slack"],
    category: "Comms",
    avatar: { type: "shader", shader: "singularity" },
    added: false,
    outcome: {
      statement: "Give long-tail customers proactive, contextual coverage without requiring a CSM to manually manage every account.",
    },
    howItWorks: [
      { title: "Monitors the portfolio", description: "Evaluates usage, health, sentiment, support activity, conversations and other signals across the customers it owns." },
      { title: "Identifies situations worth acting on", description: "Detects emerging risk, disengagement, growth opportunities or customer situations requiring intervention." },
      { title: "Builds the context", description: "Understands what is happening, why it matters and what should be communicated to this specific customer." },
      { title: "Starts the conversation", description: "Sends contextual outreach from the appropriate user identity, subject to configured approval rules." },
      { title: "Manages the conversation", description: "Reads replies, answers questions using available context, follows up and continues working toward the desired outcome." },
      { title: "Escalates when judgement is required", description: "Brings in the appropriate human for uncertainty, sensitive situations or commercial decisions." },
    ],
    doesOnItsOwn: [
      "Monitors scoped customers for risk and growth signals",
      "Investigates signals using Velaris customer context",
      "Creates risk or opportunity cases",
      "Drafts contextual outreach",
      "Sends approved classes of communication",
      "Handles routine replies",
      "Follows up when customers do not respond",
      "Updates risk/opportunity state as conversations evolve",
    ],
    comesToYouFirst: [
      "Pricing, discounts or commercial negotiation",
      "Contract changes or commitments",
      "Angry or escalated customer responses",
      "High-value opportunities above configured thresholds",
      "Conflicting evidence or low-confidence situations",
      "Communication categories configured for review",
    ],
    contextItReads: [
      "Product usage and feature adoption",
      "Health, AI Pulse and AI Risk context",
      "Support tickets",
      "Calls and meeting notes",
      "Email history",
      "Customer notes and tasks",
      "Contracts and pricing",
      "Help documentation",
      "Account segment, ARR, renewal date and stakeholders",
    ],
    successMeasures: [
      "Risks identified",
      "Risks mitigated",
      "Opportunities identified",
      "Opportunities progressed",
      "Cases requiring human attention",
      "Cases currently being managed",
    ],
    profile: {
      statCards: [
        { label: "Risks identified", value: "14" },
        { label: "Risks mitigated", value: "9" },
        { label: "Opportunities identified", value: "6" },
        { label: "Need your attention", value: "4" },
      ],
      sectionTitle: "Customer situations being managed",
      sectionSubtitle: "Every risk or opportunity conversation this agent is currently working.",
      columns: [
        { key: "type", label: "Type" },
        { key: "signal", label: "Signal" },
        { key: "conversation", label: "Conversation" },
        { key: "status", label: "Status" },
        { key: "nextAction", label: "Next action" },
        { key: "lastActivity", label: "Last activity" },
      ],
      statusKey: "status",
      rows: [
        {
          id: "hermes-acme",
          account: "Acme Corp",
          segment: "Long-tail · $18k",
          cells: { type: "Risk", signal: "Usage down 38%", conversation: "Customer replied", status: "Working", nextAction: "Answer product question", lastActivity: "1h ago" },
          statusTone: "warning",
        },
        {
          id: "hermes-globex",
          account: "Globex",
          segment: "Long-tail · $22k",
          cells: { type: "Opportunity", signal: "Seats at 94%", conversation: "Outreach sent", status: "Waiting on customer", nextAction: "Follow up in 2 days", lastActivity: "3h ago" },
          statusTone: "neutral",
        },
        {
          id: "hermes-initech",
          account: "Initech",
          segment: "Long-tail · $15k",
          cells: { type: "Risk", signal: "Champion inactive + ticket spike", conversation: "Escalated", status: "Needs you", nextAction: "Review escalation", lastActivity: "20m ago" },
          statusTone: "danger",
        },
        {
          id: "hermes-umbrella",
          account: "Umbrella Health",
          segment: "Long-tail · $27k",
          cells: { type: "Opportunity", signal: "Seats at 97%", conversation: "Outreach drafted", status: "Needs you", nextAction: "Review before sending", lastActivity: "35m ago" },
          statusTone: "warning",
        },
      ],
      attention: [
        { workItemId: "hermes-acme", account: "Acme Corp", detail: "Customer asked a product question Hermes can't confidently answer", actionLabel: "Review", tone: "warning", focusTarget: "customer-question" },
        { workItemId: "hermes-globex", account: "Globex", detail: "Expansion email drafted — needs your approval to send", actionLabel: "Respond", tone: "warning", focusTarget: "email-draft-approval" },
        { workItemId: "hermes-umbrella", account: "Umbrella Health", detail: "High-value opportunity requires account owner involvement", actionLabel: "Review", tone: "warning", focusTarget: "email-draft-approval" },
        { workItemId: "hermes-initech", account: "Initech", detail: "Escalated customer response needs human judgement", actionLabel: "Review escalation", tone: "danger", focusTarget: "escalation-actions" },
      ],
    },
    configuration: {
      baseObjective:
        "You are Hermes, Velaris' Long-tail Communications Expert. Your job is to monitor long-tail customers for risk and growth signals, reach out using customer context, and manage the conversation until the outcome is reached or human judgement is required.",
      triggers: [
        { label: "Continuous monitoring of scoped accounts", description: "Continuously evaluates usage, health, sentiment and support activity across the accounts it owns." },
        { label: "Incoming customer reply", description: "Reads and responds to a customer's reply as soon as it arrives." },
        { label: "Daily signal evaluation", description: "Runs a daily pass to catch emerging risk or growth signals." },
      ],
      skills: [
        { name: "Analyse usage", description: "Read product usage and adoption trend data.", enabledByDefault: true },
        { name: "Create risk", description: "Open a risk case with evidence.", enabledByDefault: true },
        { name: "Create opportunity", description: "Open an opportunity case with evidence.", enabledByDefault: true },
        { name: "Draft email", description: "Draft contextual outreach.", enabledByDefault: true },
        { name: "Send email", description: "Send approved classes of communication.", enabledByDefault: false },
        { name: "Read email replies", description: "Read and interpret customer replies.", enabledByDefault: true },
        { name: "Update customer context", description: "Keep risk/opportunity state current as conversations evolve.", enabledByDefault: true },
        { name: "Create tasks", description: "Create follow-up tasks when needed.", enabledByDefault: true },
        { name: "Escalate to owner", description: "Escalate to the appropriate human for judgement calls.", enabledByDefault: true },
      ],
      context: [
        "Product usage and feature adoption",
        "Health, AI Pulse and AI Risk context",
        "Support tickets",
        "Calls and meeting notes",
        "Email history",
        "Contracts and pricing",
      ],
      defaultScope: "Long-tail accounts below $30k ARR",
      approvals: {
        auto: ["Monitoring scoped accounts", "Drafting outreach", "Handling routine replies", "Following up when a customer doesn't respond"],
        manual: ["Pricing, discounts or commercial negotiation", "Contract changes or commitments", "Angry or escalated customer responses", "High-value opportunities above configured thresholds"],
      },
      notifications: [
        "Notify the CSM when a case is created",
        "Escalate to the CSM immediately on an angry or escalated reply",
        "Notify the CS lead on any opportunity above the configured threshold",
      ],
      successCriteria: [
        { label: "Signals that qualify as risks", value: "Usage decline 25%+, champion inactive, ticket spike" },
        { label: "Signals that qualify as opportunities", value: "Seat utilisation 90%+, new team onboarded" },
        { label: "Follow-up cadence", value: "Every 2 days while a conversation is open" },
        { label: "Maximum autonomous conversation duration", value: "5 exchanges before escalation" },
      ],
    },
  },
];
