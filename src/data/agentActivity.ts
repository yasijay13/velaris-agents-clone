import type { CustomAgent } from "./agents";

export type ActivityTag =
  | "ACTED"
  | "UPDATED"
  | "REVIEWED"
  | "REQUESTED APPROVAL"
  | "ASKED A HUMAN"
  | "ESCALATED";

export interface ActivityEntry {
  title: string;
  account: string;
  time: string;
  description: string;
  tag: ActivityTag;
}

export interface ActivityGroup {
  group: string;
  entries: ActivityEntry[];
}

const activityByExpertSlug: Record<string, ActivityGroup[]> = {
  "onboarding-expert": [
    {
      group: "Today",
      entries: [
        { title: "Prepared commitment for approval", account: "Globex", time: "10:42", description: "Assembled the onboarding commitment from six completed handover steps and routed it to R. Silva.", tag: "REQUESTED APPROVAL" },
        { title: "Sent onboarding reminder", account: "Acme Corp", time: "09:15", description: "Emailed the implementation owner about the outstanding data migration sign-off.", tag: "ACTED" },
        { title: "Updated onboarding status", account: "Initech", time: "08:03", description: "Moved the account to Stalled after four days without a response from the customer.", tag: "UPDATED" },
      ],
    },
    {
      group: "Yesterday",
      entries: [
        { title: "Requested missing implementation owner", account: "Northwind", time: "16:27", description: "No technical owner was named in the handover, so a task was created for Marcus L.", tag: "ASKED A HUMAN" },
        { title: "Reviewed sales handover", account: "Umbrella Health", time: "11:50", description: "Read the handover canvas, contract terms and kickoff notes, then drafted a six-step onboarding plan.", tag: "REVIEWED" },
        { title: "Reviewed sales handover", account: "Stark Industries", time: "09:04", description: "Handover incomplete: success criteria and go-live date were missing. Flagged to the CSM.", tag: "REVIEWED" },
      ],
    },
  ],
  "renewal-expert": [
    {
      group: "Today",
      entries: [
        { title: "Escalated pricing request", account: "Stark Industries", time: "11:20", description: "Customer asked for a discount above the configured threshold, so approval was requested from the account owner.", tag: "REQUESTED APPROVAL" },
        { title: "Sent renewal follow-up", account: "Wren Analytics", time: "09:40", description: "Followed up on the outreach sent three days ago with no response.", tag: "ACTED" },
      ],
    },
    {
      group: "Yesterday",
      entries: [
        { title: "Built renewal packet", account: "Castlemount", time: "15:10", description: "Assembled contract terms, usage trend and support history into a renewal packet ahead of the Sep 22 date.", tag: "ACTED" },
        { title: "Flagged renewal risk", account: "Castlemount", time: "14:55", description: "Procurement has not responded in 5 days — risk raised from Low to Elevated.", tag: "UPDATED" },
      ],
    },
  ],
  "risk-expert": [
    {
      group: "Today",
      entries: [
        { title: "Escalated inactive champion", account: "Initech", time: "08:45", description: "Champion has not logged in for 21 days alongside a ticket spike — escalated for review.", tag: "ESCALATED" },
      ],
    },
    {
      group: "Yesterday",
      entries: [
        { title: "Opened save play", account: "Brightfield Media", time: "13:30", description: "Usage down 42% over three weeks. Drafted a recovery play for approval.", tag: "REQUESTED APPROVAL" },
        { title: "Re-scored portfolio risk", account: "All scoped accounts", time: "06:00", description: "Ran the daily risk pass across usage, sentiment and support signals.", tag: "UPDATED" },
      ],
    },
  ],
  "expansion-expert": [
    {
      group: "Today",
      entries: [
        { title: "Escalated qualified opportunity", account: "Globex", time: "10:05", description: "Seat utilisation crossed 94% — qualified opportunity handed to the account owner.", tag: "REQUESTED APPROVAL" },
      ],
    },
    {
      group: "Yesterday",
      entries: [
        { title: "Qualified expansion signal", account: "Umbrella Health", time: "16:40", description: "12 new active users detected. Checked against buying criteria and marked qualifying.", tag: "UPDATED" },
      ],
    },
  ],
  "qbr-expert": [
    {
      group: "Today",
      entries: [
        { title: "Flagged overdue commitments", account: "Stark Industries", time: "09:00", description: "Two commitments from the last review passed their due date without resolution.", tag: "ASKED A HUMAN" },
      ],
    },
    {
      group: "Yesterday",
      entries: [
        { title: "Refreshed account plan", account: "Talus Financial", time: "12:15", description: "Updated goals and stakeholders ahead of the Oct 2 review.", tag: "UPDATED" },
      ],
    },
  ],
  "intelligence-expert": [
    {
      group: "Today",
      entries: [
        { title: "Escalated customer response", account: "Initech", time: "09:52", description: "Champion inactive and ticket volume spiking — customer reply needed human judgement.", tag: "ESCALATED" },
        { title: "Answered product question", account: "Acme Corp", time: "08:30", description: "Replied to the customer's follow-up using product usage context; flagged the pricing question for review.", tag: "ACTED" },
      ],
    },
    {
      group: "Yesterday",
      entries: [
        { title: "Sent contextual outreach", account: "Globex", time: "17:05", description: "Seats at 94% utilisation — sent outreach referencing the account's recent growth.", tag: "ACTED" },
        { title: "Opened risk case", account: "Acme Corp", time: "10:12", description: "Usage down 38% over two weeks. Opened a risk case with supporting evidence.", tag: "UPDATED" },
      ],
    },
  ],
};

export function getAgentActivity(agent: Pick<CustomAgent, "poweredBy">): ActivityGroup[] {
  if (agent.poweredBy) {
    const groups = activityByExpertSlug[agent.poweredBy.expertSlug];
    if (groups) return groups;
  }
  return [];
}
