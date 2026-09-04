import type {
  CaseFileBuilder,
  CaseFileOverrides,
  ChecklistItem,
  WorkItemCaseFile,
} from "./workItemTypes";

function ov<T>(overrides: CaseFileOverrides, blockId: string): T | undefined {
  return overrides[blockId] as T | undefined;
}

// ===========================================================================
// WAYFINDER — Sales Handover
// ===========================================================================

const wayfinderAcme: CaseFileBuilder = (o) => {
  const q = ov<{ answered: boolean; answerText: string }>(o, "success-criteria-question");
  const answered = q?.answered ?? false;

  const items: ChecklistItem[] = [
    { id: "what-bought", label: "What the customer bought", done: true, detail: "Enterprise plan + Advanced Analytics" },
    { id: "why-bought", label: "Why they bought", done: true, detail: "Reduce manual portfolio reporting and improve executive visibility" },
    { id: "stakeholders", label: "Key stakeholders", done: true, detail: "Sarah Chen — VP Customer Success; Mike Hall — Operations Lead" },
    { id: "commercial", label: "Commercial commitments", done: true, detail: "Implementation expected to begin in September" },
    { id: "prerequisites", label: "Implementation prerequisites", done: true, detail: "Salesforce connection and historical usage import" },
    { id: "success-criteria", label: "Success criteria", done: answered, detail: answered ? q!.answerText : undefined },
  ];
  const completed = items.filter((i) => i.done).length;

  return {
    id: "wayfinder-acme",
    account: "Acme Corp",
    workType: "Sales Handover",
    status: answered ? "Ready to complete" : "Waiting on you",
    agentName: "Wayfinder",
    targetDate: "Sep 5",
    currentState: answered
      ? "All 6 handover topics are complete. Wayfinder is ready to create the final Sales Handover."
      : "5 of 6 handover topics are complete. Wayfinder needs your clarification on Success Criteria before it can complete the Sales Handover.",
    blocks: [
      { id: "handover-progress", type: "progress", tab: "overview", label: "Handover progress", completed, total: 6 },
      {
        id: "success-criteria-question",
        type: "question",
        tab: "overview",
        heading: "WAYFINDER NEEDS YOUR INPUT",
        question:
          "I couldn't find a clear measurable success criterion in the Sales Handover. What should the onboarding team use as the primary success criterion?",
        placeholder: "e.g. Reduce weekly reporting effort from 6 hours to under 1 hour",
        answered,
        answerText: q?.answerText,
        acknowledgement: "Got it. I've added that as the primary success criterion and updated the Sales Handover.",
      },
      {
        id: "handover-canvas",
        type: "artifact",
        tab: "overview",
        name: "Acme Corp — Sales Handover",
        kind: "Canvas",
        state: "Draft",
        lastUpdated: answered ? "Just now" : "2 hours ago",
        previewLines: [
          "Enterprise plan + Advanced Analytics · Implementation targeted for September",
          "Stakeholders: Sarah Chen (VP CS), Mike Hall (Ops Lead)",
          answered ? `Success criterion: ${q!.answerText}` : "Success criterion: pending",
        ],
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: answered
          ? "Create the final Sales Handover."
          : "Wayfinder needs your input on Success Criteria before it can complete the Sales Handover.",
        blockedOnUser: !answered,
      },
      { id: "handover-checklist", type: "checklist", tab: "context", title: "HANDOVER PROGRESS", items },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "Aug 18", description: "Handover opened from Closed Won" },
          { timestamp: "Aug 19", description: "Wayfinder captured stakeholders and commercial commitments" },
          { timestamp: "2 days ago", description: "Wayfinder flagged success criteria as missing and asked for clarification" },
          ...(answered ? [{ timestamp: "Just now", description: "You answered Wayfinder's question about success criteria" }] : []),
        ],
      },
    ],
  };
};

const wayfinderGlobex: CaseFileBuilder = (o) => {
  const approval = ov<{ resolution?: string; note?: string }>(o, "handover-approval");
  const resolution = approval?.resolution;
  const status = resolution === "approve" ? "Complete" : resolution === "changes" ? "Updating handover" : "Ready for approval";

  const items: ChecklistItem[] = [
    { id: "what-bought", label: "What the customer bought", done: true, detail: "Growth plan + API access" },
    { id: "why-bought", label: "Why they bought", done: true, detail: "Consolidate reporting across regional teams" },
    { id: "stakeholders", label: "Key stakeholders", done: true, detail: "Elena Torres — Head of CS Ops" },
    { id: "commercial", label: "Commercial commitments", done: true, detail: "Multi-year term, implementation in Q4" },
    { id: "prerequisites", label: "Implementation prerequisites", done: true, detail: "SSO setup and data migration" },
    { id: "success-criteria", label: "Success criteria", done: true, detail: "Reduce time-to-report from 5 days to 1 day" },
  ];

  return {
    id: "wayfinder-globex",
    account: "Globex",
    workType: "Sales Handover",
    status,
    agentName: "Wayfinder",
    targetDate: "Sep 3",
    currentState:
      resolution === "approve"
        ? "The Sales Handover was approved and published. Onboarding has kicked off."
        : resolution === "changes"
          ? "You requested changes. Wayfinder is updating the Sales Handover now."
          : "The Sales Handover is complete and ready to publish. Wayfinder is waiting on your approval.",
    blocks: [
      { id: "handover-progress", type: "progress", tab: "overview", label: "Handover progress", completed: 6, total: 6 },
      {
        id: "handover-approval",
        type: "approval",
        tab: "overview",
        heading: "APPROVAL REQUIRED",
        description: "Wayfinder has completed the Sales Handover and is ready to publish it.",
        actions: [
          { id: "approve", label: "Approve & publish", tone: "primary" },
          { id: "changes", label: "Request changes", tone: "neutral" },
        ],
        resolution: resolution ? { actionId: resolution } : undefined,
        showFollowUpInput: resolution === "changes",
        followUpPlaceholder: "What should Wayfinder change?",
      },
      {
        id: "handover-canvas",
        type: "artifact",
        tab: "overview",
        name: "Globex — Sales Handover",
        kind: "Canvas",
        state: resolution === "approve" ? "Published" : "Draft",
        lastUpdated: resolution === "approve" ? "Just now" : "40 minutes ago",
        previewLines: [
          "Growth plan + API access · Multi-year term, implementation in Q4",
          "Stakeholders: Elena Torres (Head of CS Ops)",
          "Success criterion: Reduce time-to-report from 5 days to 1 day",
        ],
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text:
          resolution === "approve"
            ? "Sales Handover published — onboarding kicked off."
            : resolution === "changes"
              ? "Wayfinder is updating the handover based on your feedback."
              : "Approve the Sales Handover to publish it and notify the onboarding team.",
        blockedOnUser: !resolution,
      },
      ...(resolution === "approve"
        ? [
            {
              id: "outcome" as const,
              type: "outcome" as const,
              tab: "overview" as const,
              completedAt: "Just now",
              summary: "Sales Handover completed and Canvas published.",
              whatHappened: [
                "Wayfinder assembled the handover from the closed-won opportunity",
                "All 6 handover topics were captured without escalation",
                "You approved the handover and it published to the onboarding team",
              ],
            },
          ]
        : []),
      { id: "handover-checklist", type: "checklist", tab: "context", title: "HANDOVER PROGRESS", items },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "Aug 22", description: "Handover opened from Closed Won" },
          { timestamp: "Aug 30", description: "All 6 handover topics completed" },
          { timestamp: "40 minutes ago", description: "Wayfinder marked the handover ready to publish" },
          ...(resolution === "approve" ? [{ timestamp: "Just now", description: "You approved and published the Sales Handover" }] : []),
          ...(resolution === "changes" ? [{ timestamp: "Just now", description: "You requested changes to the Sales Handover" }] : []),
        ],
      },
    ],
  };
};

const wayfinderInitech: CaseFileBuilder = (o) => {
  const assign = ov<{ assigned: string }>(o, "assign-owner");
  const assigned = assign?.assigned;

  const items: ChecklistItem[] = [
    { id: "what-bought", label: "What the customer bought", done: true, detail: "Starter plan" },
    { id: "why-bought", label: "Why they bought", done: true, detail: "Reduce spreadsheet-based tracking for a small ops team" },
    { id: "stakeholders", label: "Key stakeholders", done: false },
    { id: "commercial", label: "Commercial commitments", done: false },
    { id: "prerequisites", label: "Implementation prerequisites", done: !!assigned, detail: assigned ? `Confirmed by ${assigned}: standard setup, no blockers` : undefined },
    { id: "success-criteria", label: "Success criteria", done: false },
  ];
  const completed = items.filter((i) => i.done).length;

  return {
    id: "wayfinder-initech",
    account: "Initech",
    workType: "Sales Handover",
    status: assigned ? "In progress" : "Stalled",
    agentName: "Wayfinder",
    targetDate: "Tomorrow",
    currentState: assigned
      ? `${assigned} was assigned as implementation owner. Wayfinder resumed chasing the remaining handover topics.`
      : "Only 2 of 6 handover topics are complete. No implementation owner has been identified and Wayfinder has not been able to resolve this from the available account context.",
    blocks: [
      { id: "handover-progress", type: "progress", tab: "overview", label: "Handover progress", completed, total: 6 },
      {
        id: "assign-owner",
        type: "ownerAssign",
        tab: "overview",
        heading: "ASSIGN OWNER",
        description: "Wayfinder couldn't identify an implementation owner from the available account context. Choose one to unblock the handover.",
        options: ["Marcus L.", "R. Silva", "Jane D.", "Ana Reyes"],
        assigned,
      },
      {
        id: "handover-canvas",
        type: "artifact",
        tab: "overview",
        name: "Initech — Sales Handover",
        kind: "Canvas",
        state: "Draft",
        lastUpdated: "1 day ago",
        previewLines: ["Starter plan · Reduce spreadsheet-based tracking for a small ops team", "Implementation owner: " + (assigned ?? "unassigned")],
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: assigned
          ? `Reminder sent to ${assigned} for the remaining handover topics.`
          : "Wayfinder is blocked — no implementation owner identified.",
        blockedOnUser: !assigned,
      },
      { id: "handover-checklist", type: "checklist", tab: "context", title: "HANDOVER PROGRESS", items },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "Aug 10", description: "Handover opened from Closed Won" },
          { timestamp: "Aug 11", description: "Wayfinder captured what was bought and why" },
          { timestamp: "1 day ago", description: "Wayfinder could not identify an implementation owner and stalled" },
          ...(assigned ? [{ timestamp: "Just now", description: `You assigned ${assigned} as implementation owner` }] : []),
        ],
      },
    ],
  };
};

const wayfinderNorthwind: CaseFileBuilder = () => ({
  id: "wayfinder-northwind",
  account: "Northwind",
  workType: "Sales Handover",
  status: "In progress",
  agentName: "Wayfinder",
  targetDate: "Sep 12",
  currentState:
    "Wayfinder is currently waiting on the Sales owner for implementation prerequisites. It sent a reminder 4 hours ago and will follow up tomorrow if there is no response.",
  blocks: [
    { id: "handover-progress", type: "progress", tab: "overview", label: "Handover progress", completed: 3, total: 6 },
    {
      id: "handover-canvas",
      type: "artifact",
      tab: "overview",
      name: "Northwind — Sales Handover",
      kind: "Canvas",
      state: "Draft",
      lastUpdated: "Yesterday",
      previewLines: ["Team plan · Standardize reporting across a newly merged sales org", "Stakeholders: Priya Nair (RevOps Lead)"],
    },
    { id: "next-action", type: "nextAction", tab: "overview", text: "Wayfinder will follow up again tomorrow if there's no response.", blockedOnUser: false },
    {
      id: "handover-checklist",
      type: "checklist",
      tab: "context",
      title: "HANDOVER PROGRESS",
      items: [
        { id: "what-bought", label: "What the customer bought", done: true, detail: "Team plan" },
        { id: "why-bought", label: "Why they bought", done: true, detail: "Standardize reporting across a newly merged sales org" },
        { id: "stakeholders", label: "Key stakeholders", done: true, detail: "Priya Nair — RevOps Lead" },
        { id: "commercial", label: "Commercial commitments", done: false },
        { id: "prerequisites", label: "Implementation prerequisites", done: false },
        { id: "success-criteria", label: "Success criteria", done: false },
      ],
    },
    {
      id: "timeline",
      type: "timeline",
      tab: "activity",
      events: [
        { timestamp: "Aug 30", description: "Handover opened from Closed Won" },
        { timestamp: "Yesterday", description: "Wayfinder captured stakeholders and commercial context" },
        { timestamp: "4 hours ago", description: "Reminder sent to the Sales owner for implementation prerequisites" },
      ],
    },
  ],
});

const wayfinderUmbrella: CaseFileBuilder = () => ({
  id: "wayfinder-umbrella",
  account: "Umbrella Health",
  workType: "Sales Handover",
  status: "In progress",
  agentName: "Wayfinder",
  targetDate: "Sep 8",
  currentState:
    "5 of 6 handover topics are complete. Wayfinder is waiting on the customer's implementation team to confirm a go-live date.",
  blocks: [
    { id: "handover-progress", type: "progress", tab: "overview", label: "Handover progress", completed: 5, total: 6 },
    {
      id: "handover-canvas",
      type: "artifact",
      tab: "overview",
      name: "Umbrella Health — Sales Handover",
      kind: "Canvas",
      state: "Draft",
      lastUpdated: "3 hours ago",
      previewLines: ["Enterprise plan + SSO add-on · 3-year term, phased rollout", "Success criterion: all CSMs onboarded within 30 days of go-live"],
    },
    {
      id: "next-action",
      type: "nextAction",
      tab: "overview",
      text: "Waiting on the customer's implementation team to confirm a go-live date. Wayfinder will follow up if there's no response by Friday.",
      blockedOnUser: false,
    },
    {
      id: "handover-checklist",
      type: "checklist",
      tab: "context",
      title: "HANDOVER PROGRESS",
      items: [
        { id: "what-bought", label: "What the customer bought", done: true, detail: "Enterprise plan + SSO add-on" },
        { id: "why-bought", label: "Why they bought", done: true, detail: "Centralize customer health reporting for a 40-person CS org" },
        { id: "stakeholders", label: "Key stakeholders", done: true, detail: "Diane Okafor — VP Customer Success" },
        { id: "commercial", label: "Commercial commitments", done: true, detail: "3-year term, phased rollout" },
        { id: "success-criteria", label: "Success criteria", done: true, detail: "All CSMs onboarded within 30 days of go-live" },
        { id: "prerequisites", label: "Implementation prerequisites", done: false },
      ],
    },
    {
      id: "timeline",
      type: "timeline",
      tab: "activity",
      events: [
        { timestamp: "Aug 15", description: "Handover opened from Closed Won" },
        { timestamp: "3 hours ago", description: "Wayfinder confirmed success criteria and commercial commitments" },
      ],
    },
  ],
});

// ===========================================================================
// HERMES — Long-tail Communications
// ===========================================================================

const hermesAcme: CaseFileBuilder = (o) => {
  const q = ov<{ answered: boolean; answerText: string }>(o, "customer-question");
  const answered = q?.answered ?? false;

  return {
    id: "hermes-acme",
    account: "Acme Corp",
    workType: "Risk",
    status: answered ? "Waiting on customer" : "Working",
    agentName: "Hermes",
    currentState: answered
      ? "High-risk account · Hermes is managing it. Hermes replied to Sarah using your answer and is now waiting on a response."
      : "High-risk account · Hermes is managing it. Acme's engagement has deteriorated across adoption and support signals. Hermes initiated a risk-mitigation conversation and the customer has now replied with a product question that needs your input.",
    blocks: [
      {
        id: "why-flagged",
        type: "whySummary",
        tab: "overview",
        heading: "WHY THIS WAS FLAGGED",
        level: "High Risk",
        levelTone: "danger",
        lines: [
          { label: "Primary signal", value: "Weekly active users ↓38% over 3 weeks" },
          { label: "Supporting signal", value: "Support tickets 2 → 6" },
          { label: "Urgency", value: "Renewal in 74 days" },
        ],
        contextLabel: "View full context",
      },
      {
        id: "risk-assessment",
        type: "riskAssessment",
        tab: "context",
        level: "High",
        summary:
          "Acme was flagged because product adoption has declined consistently for three weeks while support activity increased. The combination suggests the customer may be struggling to get value rather than experiencing a one-off usage fluctuation.",
        primaryDriver: "Sustained adoption decline",
        supportingSignal: "Increasing support demand",
        urgency: "Renewal approaching",
        dimensions: [
          { name: "User Adoption", state: "High risk" },
          { name: "Platform Engagement", state: "Medium risk" },
          { name: "Feature Utilisation", state: "Healthy" },
          { name: "Dormancy", state: "Not detected" },
        ],
      },
      {
        id: "key-evidence",
        type: "evidence",
        tab: "context",
        items: [
          {
            role: "primary",
            metric: "Weekly active users",
            current: "51",
            previous: "82",
            change: "-38%",
            trend: [
              { label: "4 weeks ago", value: "82" },
              { label: "3 weeks ago", value: "79" },
              { label: "2 weeks ago", value: "64" },
              { label: "This week", value: "51" },
            ],
            explanation: "Usage has declined for three consecutive weeks and crossed the configured 30% decline threshold.",
          },
          {
            role: "supporting",
            metric: "Support tickets",
            current: "6",
            previous: "2",
            change: "+200%",
            explanation: "Support demand increased while usage declined, strengthening the risk signal.",
          },
          {
            role: "context",
            metric: "Renewal",
            value: "74 days away",
            explanation: "The account is inside the configured 90-day renewal window, reducing the time available to recover engagement.",
          },
        ],
        additionalAttributes: [
          { label: "AI Risk", value: "Low → Medium" },
          { label: "Health score", value: "78 → 64" },
          { label: "Feature adoption", value: "5 of 8 → 3 of 8" },
          { label: "Open support tickets", value: "4" },
        ],
      },
      {
        id: "action-decision",
        type: "actionDecision",
        tab: "context",
        playbook: "Usage decline risk",
        condition: "Sustained usage decline >30% for 3 consecutive weeks",
        matchedConditions: [
          "Usage declined 38%",
          "Decline sustained for 3 weeks",
          "Account inside 90-day renewal window",
        ],
        autonomy: {
          policy: "Long-tail risk-mitigation communication can be sent automatically.",
          scope: "Long-tail accounts below $25k ARR",
          approvalRequired: false,
        },
        action: "Hermes sent a risk-mitigation check-in 2 days ago.",
      },
      {
        id: "customer-thread",
        type: "emailThread",
        tab: "overview",
        trigger: "Usage decline risk",
        initiatedBy: "Hermes",
        sentInfo: "Sent automatically · 2 days ago",
        messages: [
          {
            id: "m1",
            sender: "agent",
            from: "Jane D.",
            to: "sarah@acme.com",
            subject: "Checking in on your team's reporting usage",
            timestamp: "2 days ago",
            autoSent: true,
            body: "Hi Sarah, I noticed your team's usage of the reporting workspace has dropped off over the last few weeks — wanted to check in and see if anything's gotten in the way, or if there's something we can help with.",
          },
          {
            id: "m2",
            sender: "customer",
            from: "Sarah Chen",
            to: "Jane D.",
            timestamp: "1 hour ago",
            body: "Thanks Jane. We've had trouble getting the new reporting workflow set up. Does the product support scheduled exports for our executive team?",
          },
          ...(answered
            ? [
                {
                  id: "m3",
                  sender: "agent" as const,
                  from: "Jane D.",
                  to: "sarah@acme.com",
                  timestamp: "Just now",
                  approvalRequired: false,
                  body: `Hi Sarah, yes — ${q!.answerText} Let me know if you'd like a hand setting it up.`,
                },
              ]
            : []),
        ],
      },
      {
        id: "customer-question",
        type: "question",
        tab: "overview",
        heading: "HERMES NEEDS YOUR INPUT",
        question:
          "I couldn't confidently answer the scheduled exports question from the approved help documentation. How would you like me to respond?",
        placeholder: "e.g. Yes, weekly scheduled exports are available under Reports > Automation",
        answered,
        answerText: q?.answerText,
        acknowledgement: "Got it. I've drafted a reply to Sarah using that answer and added it to the thread.",
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: answered
          ? "Hermes sent the reply and will follow up in 2 days if there's no response."
          : "Hermes is waiting on your input before it can reply to Sarah.",
        blockedOnUser: !answered,
      },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "3 weeks ago", description: "Weekly active usage began declining" },
          { timestamp: "2 days ago", description: "Hermes opened a risk case and sent a check-in email" },
          { timestamp: "1 hour ago", description: "Sarah replied asking about scheduled exports" },
          ...(answered ? [{ timestamp: "Just now", description: "You answered Hermes's question and it replied to Sarah" }] : []),
        ],
      },
    ],
  };
};

const hermesGlobex: CaseFileBuilder = (o) => {
  const draft = ov<{ body?: string; approved?: boolean; asked?: boolean }>(o, "email-draft-approval");
  const approved = draft?.approved ?? false;
  const body =
    draft?.body ??
    "Hi team, I noticed your Globex workspace is now at 94% seat utilisation with 16 new active users in the last 30 days — looks like the tool is really taking off with your team. Happy to talk through adding more seats whenever it's useful.";

  return {
    id: "hermes-globex",
    account: "Globex",
    workType: "Opportunity",
    status: approved ? "Waiting on customer" : "Needs you",
    agentName: "Hermes",
    currentState: approved
      ? "Hermes sent the expansion email and is waiting on a reply."
      : "Hermes identified this as a potential seat-expansion conversation because utilisation has remained above the configured 90% threshold. An expansion email is drafted and needs your approval before it can be sent.",
    blocks: [
      {
        id: "why-identified",
        type: "whySummary",
        tab: "overview",
        heading: "WHY THIS WAS IDENTIFIED",
        lines: [
          { label: "Seat utilisation", value: "94%" },
          { label: "Configured threshold", value: "90%" },
          { label: "Growth", value: "+16 active users in 30 days" },
        ],
        contextLabel: "View full context",
      },
      {
        id: "email-draft-approval",
        type: "emailDraft",
        tab: "overview",
        heading: "EMAIL DRAFT — APPROVAL REQUIRED",
        subject: "Looks like your team is growing",
        body,
        status: approved ? "sent" : "draft",
        approveLabel: "Approve & send",
        allowEdit: !approved,
        allowAskAgent: !approved,
        askAgentAcknowledgement: "Updated. I made the message more conversational and referenced the recent analytics adoption.",
        revisedBody:
          "Hi team — noticed your Globex workspace has grown a lot this month, especially on the analytics side. If it'd help to add a few more seats for the team, happy to walk through options whenever works for you.",
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: approved
          ? "Hermes will follow up in 3 days if Globex doesn't reply."
          : "Hermes is waiting on your approval to send the expansion email.",
        blockedOnUser: !approved,
      },
      {
        id: "opportunity-assessment",
        type: "recordSummary",
        tab: "context",
        title: "OPPORTUNITY ASSESSMENT",
        headline: "Potential seat expansion",
        fields: [
          { label: "Primary signal", value: "94% seat utilisation" },
          { label: "Growth", value: "+16 active users in 30 days" },
          { label: "Threshold", value: "90%" },
        ],
      },
      {
        id: "qualification-criteria",
        type: "qualification",
        tab: "context",
        title: "QUALIFICATION",
        items: [
          { id: "utilisation", label: "Utilisation above threshold", done: true },
          { id: "growth", label: "Growth sustained", done: true },
          { id: "health", label: "Account health good", done: true },
          { id: "intent", label: "Buying intent not yet known", done: false },
        ],
      },
      {
        id: "seat-evidence",
        type: "evidence",
        tab: "context",
        items: [
          {
            role: "primary",
            metric: "Seat utilisation",
            current: "94%",
            previous: "78%",
            change: "+16pts",
            trend: [
              { label: "4 weeks ago", value: "78%" },
              { label: "3 weeks ago", value: "83%" },
              { label: "2 weeks ago", value: "89%" },
              { label: "This week", value: "94%" },
            ],
            explanation: "Seat utilisation has climbed steadily for four consecutive weeks and crossed the configured 90% threshold.",
          },
          {
            role: "supporting",
            metric: "Licensed seats",
            value: "100",
            explanation: "Active users (94) now represent the large majority of licensed seats.",
          },
          {
            role: "context",
            metric: "New users",
            value: "+16 in 30 days",
            explanation: "Sustained new-user growth reinforces that this is organic expansion, not a temporary spike.",
          },
        ],
      },
      {
        id: "action-decision",
        type: "actionDecision",
        tab: "context",
        playbook: "Seat expansion",
        condition: "Seat utilisation >90% with sustained user growth",
        matchedConditions: ["Seat utilisation sustained above 90% for 4 weeks", "16 new active users in the last 30 days"],
        autonomy: {
          policy: "Expansion communication requires approval.",
          scope: "Opportunity accounts above the configured deal-size threshold",
          approvalRequired: true,
        },
        action: "Hermes drafted outreach but has NOT sent it.",
      },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "4 weeks ago", description: "Seat utilisation crossed the 90% threshold" },
          { timestamp: "3 hours ago", description: "Hermes drafted an expansion email" },
          ...(approved ? [{ timestamp: "Just now", description: "You approved the email and Hermes sent it" }] : []),
        ],
      },
    ],
  };
};

const hermesInitech: CaseFileBuilder = (o) => {
  const esc = ov<{ resolvedAction?: string; followUpText?: string }>(o, "escalation-actions");
  const resolvedAction = esc?.resolvedAction;

  return {
    id: "hermes-initech",
    account: "Initech",
    workType: "Risk",
    status: resolvedAction === "close" ? "Closed" : "Escalated",
    agentName: "Hermes",
    currentState:
      resolvedAction === "close"
        ? "You closed this situation. Hermes will not send further autonomous messages to Initech on this thread."
        : resolvedAction === "take-over"
          ? "You took over the conversation. Hermes has paused all autonomous messages on this thread."
          : resolvedAction === "tell-hermes"
            ? "You told Hermes how to respond. Hermes will use that guidance for its next reply."
            : "Hermes emailed Initech autonomously as part of its long-tail scope. The customer's reply indicated frustration, so Hermes paused and escalated to you.",
    blocks: [
      {
        id: "customer-thread",
        type: "emailThread",
        tab: "overview",
        trigger: "Champion inactive 21 days + ticket spike",
        messages: [
          {
            id: "m1",
            sender: "agent",
            from: "Hermes (as Jane D.)",
            to: "ops@initech.com",
            subject: "Quick check-in",
            timestamp: "5 days ago",
            autoSent: true,
            body: "Hi team, wanted to check in on how things are going with your reporting setup — let us know if there's anything we can help unblock.",
          },
          {
            id: "m2",
            sender: "agent",
            from: "Hermes (as Jane D.)",
            to: "ops@initech.com",
            timestamp: "2 days ago",
            autoSent: true,
            body: "Hi again — just following up in case my last note got buried.",
          },
          {
            id: "m3",
            sender: "customer",
            from: "Initech Ops",
            to: "Jane D.",
            timestamp: "20 minutes ago",
            body: "We've already raised this twice with support. Please stop sending generic check-ins.",
          },
        ],
      },
      {
        id: "escalation-actions",
        type: "escalationActions",
        tab: "overview",
        heading: "ESCALATED TO YOU",
        description: "Hermes paused autonomous communication because the reply indicates frustration and matches the configured escalation rule.",
        actions: [
          { id: "take-over", label: "Take over conversation" },
          { id: "tell-hermes", label: "Tell Hermes how to respond" },
          { id: "close", label: "Close situation" },
        ],
        resolvedAction,
        showFollowUpInput: resolvedAction === "tell-hermes",
        followUpAcknowledgement: "Got it — I'll respond directly and reference their open support tickets.",
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: resolvedAction ? "No further autonomous messages will be sent until you re-engage Hermes." : "Hermes has paused and is waiting for your decision.",
        blockedOnUser: !resolvedAction,
      },
      ...(resolvedAction === "close"
        ? [
            {
              id: "outcome" as const,
              type: "outcome" as const,
              tab: "overview" as const,
              completedAt: "Just now",
              summary: "Situation closed after escalation.",
              whatHappened: [
                "Hermes sent two autonomous check-ins over 5 days",
                "The customer replied with frustration and Hermes escalated instead of continuing on its own",
                "You reviewed the thread and closed the situation",
              ],
            },
          ]
        : []),
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "21 days ago", description: "Champion's last login" },
          { timestamp: "5 days ago", description: "Hermes sent an autonomous check-in email" },
          { timestamp: "2 days ago", description: "Hermes sent a follow-up" },
          { timestamp: "20 minutes ago", description: "Customer replied with frustration — Hermes paused and escalated" },
          ...(resolvedAction ? [{ timestamp: "Just now", description: `You resolved the escalation: ${resolvedAction.replace("-", " ")}` }] : []),
        ],
      },
    ],
  };
};

const hermesUmbrella: CaseFileBuilder = (o) => {
  const draft = ov<{ approved?: boolean }>(o, "email-draft-approval");
  const approved = draft?.approved ?? false;

  return {
    id: "hermes-umbrella",
    account: "Umbrella Health",
    workType: "Opportunity",
    status: approved ? "Waiting on customer" : "Needs you",
    agentName: "Hermes",
    currentState: approved
      ? "Hermes sent the expansion email to Umbrella Health and is waiting on a reply."
      : "Hermes identified a seat-expansion opportunity above the configured deal-size threshold, so the draft email needs account-owner review before anything is sent.",
    blocks: [
      {
        id: "email-draft-approval",
        type: "emailDraft",
        tab: "overview",
        heading: "EMAIL DRAFT — APPROVAL REQUIRED",
        subject: "Room to grow with Umbrella Health",
        body: "Hi Diane, your team's usage has grown steadily this quarter and you're now at 97% seat utilisation. Would it help to talk through adding more seats ahead of your next planning cycle?",
        status: approved ? "sent" : "draft",
        approveLabel: "Approve & send",
        allowEdit: !approved,
        allowAskAgent: !approved,
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: approved ? "Hermes will follow up in 3 days if there's no reply." : "This opportunity is above the deal-size threshold — review before approving.",
        blockedOnUser: !approved,
      },
      {
        id: "utilisation-evidence",
        type: "signalEvidence",
        tab: "context",
        title: "WHY HERMES ACTED",
        metrics: [
          { label: "Licensed seats", value: "150" },
          { label: "Active users", value: "146" },
          { label: "Utilisation", value: "97%" },
        ],
        trend: [
          { label: "4 weeks ago", value: "85%" },
          { label: "3 weeks ago", value: "89%" },
          { label: "2 weeks ago", value: "93%" },
          { label: "This week", value: "97%" },
        ],
        reasoningHeading: "AGENT REASONING",
        reasoning:
          "This opportunity crosses Hermes's configured deal-size threshold, so it routes to account-owner review before any customer-facing message goes out.",
      },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "3 weeks ago", description: "Seat utilisation crossed 90%" },
          { timestamp: "35 minutes ago", description: "Hermes drafted an expansion email and routed it for account-owner review" },
          ...(approved ? [{ timestamp: "Just now", description: "You approved the email and Hermes sent it" }] : []),
        ],
      },
    ],
  };
};

// ===========================================================================
// PHOENIX — Renewals
// ===========================================================================

const phoenixStark: CaseFileBuilder = (o) => {
  const approval = ov<{ resolution?: string; note?: string }>(o, "commercial-approval");
  const recommendation = ov<{ shown: boolean }>(o, "commercial-approval-recommend");

  return {
    id: "phoenix-stark",
    account: "Stark Industries",
    workType: "Renewal",
    status: approval?.resolution ? "Terms sent" : "Needs you",
    agentName: "Phoenix",
    targetDate: "Sep 30",
    currentState: approval?.resolution
      ? `You ${approval.resolution === "decline" ? "declined" : approval.resolution === "modify" ? "modified" : "approved"} the pricing request. Phoenix will confirm the terms with David Kim.`
      : "This renewal is 26 days away. Commercial terms are agreed, but the customer has requested a pricing exception that requires your approval.",
    blocks: [
      {
        id: "customer-thread",
        type: "emailThread",
        tab: "overview",
        trigger: "Renewal approaching in 26 days",
        messages: [
          {
            id: "m1",
            sender: "agent",
            from: "Phoenix (as R. Silva)",
            to: "david.kim@stark.com",
            subject: "Stark Industries renewal — next steps",
            timestamp: "4 days ago",
            autoSent: true,
            body: "Hi David, as we approach your Sep 30 renewal I wanted to open the conversation early and get ahead of anything you need on your side.",
          },
          {
            id: "m2",
            sender: "customer",
            from: "David Kim",
            to: "R. Silva",
            timestamp: "1 hour ago",
            body: "We'd like to explore a 2-year term in exchange for a discount on the renewal.",
          },
        ],
      },
      {
        id: "commercial-approval",
        type: "approval",
        tab: "overview",
        heading: "COMMERCIAL APPROVAL REQUIRED",
        description: "Customer is committing to a 2-year term in exchange for a discount.",
        details: [
          { label: "Requested", value: "10% discount" },
          { label: "Current renewal value", value: "$610k" },
          { label: "Proposed", value: "$549k" },
          { label: "Reason", value: "Customer is committing to a 2-year term." },
        ],
        actions: [
          { id: "approve", label: "Approve", tone: "primary" },
          { id: "decline", label: "Decline", tone: "neutral" },
          { id: "modify", label: "Modify", tone: "neutral" },
          { id: "recommend", label: "Ask Phoenix for recommendation", tone: "neutral" },
        ],
        resolution: approval?.resolution && approval.resolution !== "recommend" ? { actionId: approval.resolution, note: approval.note } : undefined,
        recommendation: recommendation?.shown
          ? "Phoenix recommends approving the 2-year term at a 7% discount ($567k) rather than 10% — this preserves margin while still rewarding the multi-year commitment."
          : undefined,
        showFollowUpInput: approval?.resolution === "modify" && !approval.note,
        followUpPlaceholder: "e.g. 7% discount on a 2-year term",
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: approval?.resolution ? "Phoenix will confirm the agreed terms with David Kim." : "Approve, decline or modify the requested pricing exception.",
        blockedOnUser: !approval?.resolution,
      },
      {
        id: "renewal-context",
        type: "recordSummary",
        tab: "context",
        title: "RENEWAL CONTEXT",
        fields: [
          { label: "Current contract", value: "1-year, $610k ARR" },
          { label: "Products", value: "Enterprise plan + Advanced Analytics + API access" },
          { label: "Usage / adoption", value: "Stable, 88% seat utilisation" },
          { label: "AI Risk", value: "Elevated — pricing negotiation in progress" },
          { label: "Key stakeholders", value: "David Kim — VP Procurement; Lena Ortiz — Economic Buyer" },
        ],
      },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "6 days ago", description: "Renewal file opened, 90-day window" },
          { timestamp: "4 days ago", description: "Phoenix sent renewal outreach to David Kim" },
          { timestamp: "1 hour ago", description: "David Kim requested a pricing exception for a 2-year term" },
          ...(approval?.resolution ? [{ timestamp: "Just now", description: `You ${approval.resolution === "modify" ? "modified" : approval.resolution}d the pricing request` }] : []),
        ],
      },
    ],
  };
};

const phoenixCastlemount: CaseFileBuilder = () => ({
  id: "phoenix-castlemount",
  account: "Castlemount",
  workType: "Renewal",
  status: "Waiting",
  agentName: "Phoenix",
  targetDate: "Sep 22",
  currentState:
    "Procurement has gone quiet for 2 days. Phoenix sent a follow-up yesterday and will check in again if there's no response by Friday.",
  blocks: [
    {
      id: "follow-up-status",
      type: "recordSummary",
      tab: "overview",
      title: "FOLLOW-UP STATUS",
      fields: [
        { label: "Last customer response", value: "2 days ago" },
        { label: "Last agent follow-up", value: "Yesterday" },
        { label: "Days silent", value: "2 days" },
        { label: "Next planned follow-up", value: "Friday, if no response" },
      ],
    },
    {
      id: "next-action",
      type: "nextAction",
      tab: "overview",
      text: "Phoenix will follow up again Friday if procurement stays quiet. Elevated risk reflects the renewal being 8 days out with no confirmed date, not an unresponsive relationship.",
      blockedOnUser: false,
    },
    {
      id: "renewal-context",
      type: "recordSummary",
      tab: "context",
      title: "RENEWAL CONTEXT",
      fields: [
        { label: "Renewal date", value: "Sep 22" },
        { label: "ARR", value: "$480k" },
        { label: "Stage", value: "Procurement" },
        { label: "Risk", value: "Elevated" },
      ],
    },
    {
      id: "procurement-timeline",
      type: "timeline",
      tab: "activity",
      events: [
        { timestamp: "6 days ago", description: "Renewal file opened, 90-day window" },
        { timestamp: "3 days ago", description: "Outreach sent to the procurement contact" },
        { timestamp: "2 days ago", description: "Last customer response — confirmed reviewing internally" },
        { timestamp: "Yesterday", description: "Phoenix sent a follow-up — no reply yet" },
      ],
    },
  ],
});

const phoenixWren: CaseFileBuilder = () => ({
  id: "phoenix-wren",
  account: "Wren Analytics",
  workType: "Renewal",
  status: "On track",
  agentName: "Phoenix",
  targetDate: "Oct 12",
  currentState:
    "This renewal is on track. Renewal risk ticked up slightly this week — usage dipped and the thread has been quiet for 5 days, but it's still within Phoenix's normal follow-up cadence.",
  blocks: [
    {
      id: "customer-thread",
      type: "emailThread",
      tab: "overview",
      trigger: "Renewal outreach sent",
      messages: [
        {
          id: "m1",
          sender: "agent",
          from: "Phoenix (as AR)",
          to: "ops@wren.com",
          subject: "Wren Analytics renewal — quick check-in",
          timestamp: "5 days ago",
          autoSent: true,
          body: "Hi team, wanted to open the conversation ahead of your Oct 12 renewal — let me know if there's anything useful to walk through before then.",
        },
      ],
    },
    { id: "next-action", type: "nextAction", tab: "overview", text: "Phoenix will follow up again in 2 days if there's still no reply.", blockedOnUser: false },
    {
      id: "risk-evidence",
      type: "signalEvidence",
      tab: "context",
      title: "WHY RISK INCREASED",
      metrics: [
        { label: "Usage trend", value: "Down 12% over 2 weeks" },
        { label: "Thread silence", value: "5 days" },
        { label: "Renewal", value: "39 days away" },
      ],
      reasoningHeading: "AGENT REASONING",
      reasoning: "Phoenix flagged a small risk increase because usage softened at the same time outreach went quiet — neither alone would have crossed the threshold.",
    },
    {
      id: "timeline",
      type: "timeline",
      tab: "activity",
      events: [
        { timestamp: "18 days ago", description: "Renewal file opened, 90-day window" },
        { timestamp: "5 days ago", description: "Phoenix sent renewal outreach" },
        { timestamp: "2 weeks ago", description: "Usage began softening" },
      ],
    },
  ],
});

// ===========================================================================
// SENTINEL — Risk
// ===========================================================================

const sentinelInitech: CaseFileBuilder = (o) => {
  const q = ov<{ answered: boolean; answerText: string }>(o, "champion-question");
  const answered = q?.answered ?? false;

  return {
    id: "sentinel-initech",
    account: "Initech",
    workType: "Risk",
    status: "Needs you",
    agentName: "Sentinel",
    currentState:
      "Initech's champion has been inactive for 21 days and ticket volume has spiked. Sentinel opened a save play but couldn't identify a next step it's confident acting on alone, so it's escalating to you.",
    blocks: [
      {
        id: "mitigation-plan",
        type: "mitigationPlan",
        tab: "overview",
        title: "MITIGATION PLAN",
        actionsTaken: ["Opened a save-play record", "Notified the account owner in Slack", "Flagged the account for weekly monitoring"],
        currentBlocker: "No response from the champion and no alternate contact identified — Sentinel needs your judgement on how to proceed.",
      },
      {
        id: "champion-question",
        type: "question",
        tab: "overview",
        heading: "SENTINEL NEEDS YOUR INPUT",
        question: "The primary champion hasn't responded in 21 days. Should I try reaching a secondary contact, or hold until you weigh in?",
        placeholder: "e.g. Try Priya in Ops as a secondary contact",
        answered,
        answerText: q?.answerText,
        acknowledgement: "Got it — I'll act on that and update this case as the situation develops.",
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: answered ? "Sentinel will act on your guidance and keep monitoring the account." : "Sentinel needs your judgement on how to re-engage this account.",
        blockedOnUser: !answered,
      },
      {
        id: "risk-signals",
        type: "signalEvidence",
        tab: "context",
        title: "SIGNAL EVIDENCE",
        metrics: [
          { label: "Champion last login", value: "21 days ago" },
          { label: "Support tickets", value: "1 → 5 this month" },
          { label: "Health score", value: "78 → 52" },
        ],
        reasoningHeading: "AGENT REASONING",
        reasoning:
          "Sentinel treats an inactive champion combined with rising ticket volume as high-confidence risk because the two signals rarely move together without an underlying account problem.",
      },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "21 days ago", description: "Champion's last login" },
          { timestamp: "This month", description: "Ticket volume rose from 1 to 5" },
          { timestamp: "20 minutes ago", description: "Sentinel opened a save play and escalated" },
          ...(answered ? [{ timestamp: "Just now", description: "You answered Sentinel's question" }] : []),
        ],
      },
    ],
  };
};

const sentinelBrightfield: CaseFileBuilder = (o) => {
  const approval = ov<{ resolution?: string }>(o, "recovery-approval");

  return {
    id: "sentinel-brightfield",
    account: "Brightfield Media",
    workType: "Risk",
    status: approval?.resolution === "approve" ? "In progress" : "Save play open",
    agentName: "Sentinel",
    currentState:
      approval?.resolution === "approve"
        ? "The recovery play is approved. Sentinel will send the outreach and re-check usage in 2 weeks."
        : "Usage is down 42% over the last 3 weeks. Sentinel drafted a recovery play and is ready for your approval to proceed.",
    blocks: [
      {
        id: "recovery-plan",
        type: "mitigationPlan",
        tab: "overview",
        title: "RECOVERY PLAN",
        actionsTaken: [
          "Identified the affected workflow (reporting exports)",
          "Drafted a re-engagement outreach for the account owner to send",
          "Scheduled a health re-check in 2 weeks",
        ],
      },
      {
        id: "recovery-approval",
        type: "approval",
        tab: "overview",
        heading: "APPROVAL REQUIRED",
        description: "Sentinel is ready to open the recovery play and send the drafted outreach.",
        actions: [
          { id: "approve", label: "Approve recovery play", tone: "primary" },
          { id: "decline", label: "Decline", tone: "neutral" },
        ],
        resolution: approval?.resolution ? { actionId: approval.resolution } : undefined,
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: approval?.resolution === "approve" ? "Sentinel will send the outreach and re-check usage in 2 weeks." : "Approve the recovery play so Sentinel can proceed.",
        blockedOnUser: !approval?.resolution,
      },
      {
        id: "usage-signals",
        type: "signalEvidence",
        tab: "context",
        title: "SIGNAL EVIDENCE",
        metrics: [
          { label: "Usage", value: "Down 42% over 3 weeks" },
          { label: "Health score", value: "81 → 66" },
          { label: "Confidence", value: "Medium" },
        ],
        reasoningHeading: "AGENT REASONING",
        reasoning: "Sentinel flagged this as medium confidence because the decline is sustained but hasn't yet been accompanied by support or sentiment signals.",
      },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "3 weeks ago", description: "Usage decline began" },
          { timestamp: "1 day ago", description: "Sentinel drafted the recovery play" },
          ...(approval?.resolution ? [{ timestamp: "Just now", description: `You ${approval.resolution}d the recovery play` }] : []),
        ],
      },
    ],
  };
};

// ===========================================================================
// ARTEMIS — Expansion
// ===========================================================================

const artemisGlobex: CaseFileBuilder = (o) => {
  const q = ov<{ answered: boolean; answerText: string }>(o, "budget-question");
  const answered = q?.answered ?? false;

  const items: ChecklistItem[] = [
    { id: "utilisation", label: "Sustained utilisation above 90%", done: true },
    { id: "health", label: "Account health good", done: true },
    { id: "buyer", label: "Buying contact known", done: true },
    { id: "budget", label: "Budget / timing confirmed", done: answered, detail: answered ? q!.answerText : undefined },
  ];

  return {
    id: "artemis-globex",
    account: "Globex",
    workType: "Expansion",
    status: answered ? "Handed off" : "Needs you",
    agentName: "Artemis",
    currentState: answered
      ? "Qualification is complete. Artemis handed this off to the account owner with full evidence attached."
      : "Seat utilisation has stayed above 90% for 4 weeks and 16 new users joined in the last 30 days. This is a qualified expansion opportunity above your deal-size threshold, so Artemis is looping you in.",
    blocks: [
      {
        id: "budget-question",
        type: "question",
        tab: "overview",
        heading: "ARTEMIS NEEDS YOUR INPUT",
        question: "Do you know whether Globex has budget allocated for additional seats this quarter?",
        placeholder: "e.g. Yes, confirmed with their finance lead last week",
        answered,
        answerText: q?.answerText,
        acknowledgement: "Got it — I've recorded that and it's ready to hand off to the account owner.",
      },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: answered ? "Handed off to the account owner with full qualification evidence." : "Confirm budget/timing so this can be handed to the account owner.",
        blockedOnUser: !answered,
      },
      {
        id: "expansion-signal",
        type: "signalEvidence",
        tab: "context",
        title: "EXPANSION SIGNAL",
        metrics: [
          { label: "Seat utilisation", value: "94%" },
          { label: "Growth", value: "+16 users in 30 days" },
        ],
        trend: [
          { label: "4 weeks ago", value: "78%" },
          { label: "3 weeks ago", value: "83%" },
          { label: "2 weeks ago", value: "89%" },
          { label: "This week", value: "94%" },
        ],
      },
      { id: "qualification-checklist", type: "qualification", tab: "context", title: "QUALIFICATION CRITERIA", items },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "4 weeks ago", description: "Seat utilisation crossed 90%" },
          { timestamp: "Today", description: "Artemis qualified this as an expansion opportunity" },
          ...(answered ? [{ timestamp: "Just now", description: "You confirmed budget/timing" }] : []),
        ],
      },
    ],
  };
};

const artemisUmbrella: CaseFileBuilder = () => ({
  id: "artemis-umbrella",
  account: "Umbrella Health",
  workType: "Expansion",
  status: "In progress",
  agentName: "Artemis",
  currentState: "A new team of 12 users onboarded onto Umbrella Health in the last 30 days. Artemis is still qualifying this as a team-growth expansion signal.",
  blocks: [
    {
      id: "next-action",
      type: "nextAction",
      tab: "overview",
      text: "Artemis is continuing to qualify this signal and will surface it if it crosses the deal-size threshold.",
      blockedOnUser: false,
    },
    {
      id: "expansion-signal",
      type: "signalEvidence",
      tab: "context",
      title: "EXPANSION SIGNAL",
      metrics: [
        { label: "New active users", value: "+12 in 30 days" },
        { label: "Motion", value: "Team growth" },
      ],
    },
    {
      id: "qualification-checklist",
      type: "qualification",
      tab: "context",
      title: "QUALIFICATION CRITERIA",
      items: [
        { id: "utilisation", label: "Sustained utilisation above 90%", done: false },
        { id: "health", label: "Account health good", done: true },
        { id: "buyer", label: "Buying contact known", done: true },
        { id: "budget", label: "Budget / timing confirmed", done: false },
      ],
    },
    {
      id: "timeline",
      type: "timeline",
      tab: "activity",
      events: [{ timestamp: "30 days ago", description: "New team onboarded" }, { timestamp: "Today", description: "Artemis began qualifying the signal" }],
    },
  ],
});

// ===========================================================================
// BASTION — Account Planning
// ===========================================================================

const bastionStark: CaseFileBuilder = (o) => {
  const c1 = ov<{ done: boolean }>(o, "commitment-c1");
  const c2 = ov<{ done: boolean }>(o, "commitment-c2");
  const items = [
    { id: "c1", label: "Share updated implementation timeline", owner: "R. Silva", due: "Aug 25", status: (c1?.done ? "done" : "overdue") as "done" | "overdue" },
    { id: "c2", label: "Introduce Stark to the new analytics module", owner: "R. Silva", due: "Aug 29", status: (c2?.done ? "done" : "overdue") as "done" | "overdue" },
  ];
  const overdueCount = items.filter((i) => i.status === "overdue").length;

  return {
    id: "bastion-stark",
    account: "Stark Industries",
    workType: "Account Plan",
    status: overdueCount > 0 ? "Overdue" : "Current",
    agentName: "Bastion",
    currentState:
      overdueCount > 0
        ? `${overdueCount} commitment${overdueCount > 1 ? "s" : ""} from Stark Industries' last QBR ${overdueCount > 1 ? "are" : "is"} overdue. Bastion has flagged ${overdueCount > 1 ? "them" : "it"} and is waiting on you to follow up.`
        : "All commitments from Stark Industries' last QBR are resolved. Bastion is keeping the plan current for the next review.",
    blocks: [
      { id: "commitments", type: "commitments", tab: "overview", title: "OPEN COMMITMENTS", items },
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text:
          overdueCount > 0
            ? `Follow up on the ${overdueCount} overdue commitment${overdueCount > 1 ? "s" : ""} before the next review on Sep 18.`
            : "Nothing overdue — next review is Sep 18.",
        blockedOnUser: overdueCount > 0,
      },
      {
        id: "account-plan",
        type: "accountPlan",
        tab: "context",
        objective: "Expand Stark Industries to 3 new teams and increase reporting-suite adoption.",
        goals: ["Expand to 3 new teams by Q4", "Increase reporting suite adoption to 80%"],
        stakeholders: ["David Kim — VP Procurement", "Lena Ortiz — Economic Buyer"],
      },
      {
        id: "qbr-canvas",
        type: "artifact",
        tab: "context",
        name: "Stark Industries — QBR Deck",
        kind: "Canvas",
        state: "Published",
        lastUpdated: "3 weeks ago",
        previewLines: ["Q2 review: adoption up 14%, 2 open commitments carried forward"],
      },
      {
        id: "timeline",
        type: "timeline",
        tab: "activity",
        events: [
          { timestamp: "3 weeks ago", description: "QBR held — 2 commitments logged" },
          { timestamp: "Aug 25", description: "First commitment became overdue" },
          { timestamp: "Aug 29", description: "Second commitment became overdue" },
          ...(c1?.done ? [{ timestamp: "Just now", description: "You marked the implementation timeline commitment done" }] : []),
          ...(c2?.done ? [{ timestamp: "Just now", description: "You marked the analytics module commitment done" }] : []),
        ],
      },
    ],
  };
};

const bastionTalus: CaseFileBuilder = () => ({
  id: "bastion-talus",
  account: "Talus Financial",
  workType: "Account Plan",
  status: "Current",
  agentName: "Bastion",
  currentState: "Talus Financial's account plan is current. No commitments are overdue and the next review is scheduled for Oct 2.",
  blocks: [
    { id: "commitments", type: "commitments", tab: "overview", title: "OPEN COMMITMENTS", items: [] },
    { id: "next-action", type: "nextAction", tab: "overview", text: "Next review scheduled for Oct 2 — nothing needs your attention.", blockedOnUser: false },
    {
      id: "account-plan",
      type: "accountPlan",
      tab: "context",
      objective: "Improve adoption of the reporting suite across Talus's finance team.",
      goals: ["Increase reporting suite adoption to 75%"],
      stakeholders: ["Priya Nair — RevOps Lead"],
    },
    {
      id: "qbr-canvas",
      type: "artifact",
      tab: "context",
      name: "Talus Financial — QBR Deck",
      kind: "Canvas",
      state: "Published",
      lastUpdated: "6 weeks ago",
      previewLines: ["Q2 review: adoption steady, no open commitments"],
    },
    { id: "timeline", type: "timeline", tab: "activity", events: [{ timestamp: "6 weeks ago", description: "QBR held — no new commitments" }] },
  ],
});

// ===========================================================================
// Registry + resolver
// ===========================================================================

const buildersByExpertSlug: Record<string, Record<string, CaseFileBuilder>> = {
  "onboarding-expert": {
    "wayfinder-acme": wayfinderAcme,
    "wayfinder-globex": wayfinderGlobex,
    "wayfinder-initech": wayfinderInitech,
    "wayfinder-northwind": wayfinderNorthwind,
    "wayfinder-umbrella": wayfinderUmbrella,
  },
  "intelligence-expert": {
    "hermes-acme": hermesAcme,
    "hermes-globex": hermesGlobex,
    "hermes-initech": hermesInitech,
    "hermes-umbrella": hermesUmbrella,
  },
  "renewal-expert": {
    "phoenix-stark": phoenixStark,
    "phoenix-castlemount": phoenixCastlemount,
    "phoenix-wren": phoenixWren,
  },
  "risk-expert": {
    "sentinel-initech": sentinelInitech,
    "sentinel-brightfield": sentinelBrightfield,
  },
  "expansion-expert": {
    "artemis-globex": artemisGlobex,
    "artemis-umbrella": artemisUmbrella,
  },
  "qbr-expert": {
    "bastion-stark": bastionStark,
    "bastion-talus": bastionTalus,
  },
};

/** Generic fallback case file for in-house (non-Expert) agent rows, built directly
 *  from their existing Work-tab row data — every row must still be openable. */
export function buildGenericCaseFile(row: {
  id: string;
  account: string;
  segment: string;
  cells: Record<string, string>;
  statusTone: string;
}, tableTitle: string, statusKey: string): WorkItemCaseFile {
  const status = row.cells[statusKey] ?? "In progress";
  const fields = Object.entries(row.cells)
    .filter(([k]) => k !== statusKey)
    .map(([k, v]) => ({ label: k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()), value: v }));

  return {
    id: row.id,
    account: row.account,
    workType: tableTitle,
    status,
    agentName: "This agent",
    currentState: `${row.account} (${row.segment}) is currently "${status}".`,
    blocks: [
      {
        id: "next-action",
        type: "nextAction",
        tab: "overview",
        text: row.cells.nextAction && row.cells.nextAction !== "—" ? row.cells.nextAction : "No action needed right now.",
        blockedOnUser: row.statusTone === "danger" || row.statusTone === "warning",
      },
      { id: "record-summary", type: "recordSummary", tab: "context", title: "RECORD SUMMARY", fields },
      { id: "timeline", type: "timeline", tab: "activity", events: [{ timestamp: row.cells.lastActivity ?? "Recently", description: `Status set to "${status}"` }] },
    ],
  };
}

export function getWorkItemCaseFile(
  expertSlug: string | undefined,
  workItemId: string,
  overrides: CaseFileOverrides,
): WorkItemCaseFile | undefined {
  if (!expertSlug) return undefined;
  const builder = buildersByExpertSlug[expertSlug]?.[workItemId];
  return builder ? builder(overrides) : undefined;
}
