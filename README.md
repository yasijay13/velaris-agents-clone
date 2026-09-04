# Velaris Agents — Command Center clone

**Live preview:** https://yasijay13.github.io/velaris-agents-clone/

A pixel-faithful React + TypeScript + Tailwind recreation of the `/agents` page from
the `velaris-agent-spark` Lovable prototype (Custom and Experts tabs, sidebar rail,
top nav, hero banner, agent cards, expert cards) — with a custom mascot avatar
system for the Custom agents, real generative/video avatars for the Experts, and a
full Expert → Custom agent activation flow (preview drawer, chat-based Agent
Builder, and a 360 profile page for every Custom agent).

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS, using the same design tokens (oklch colors, radius, shadows) as the
  source prototype, defined in `src/index.css`
- `lucide-react` for icons (matched 1:1 to the icons used in the original markup)
- `react-router-dom` for the `/agents` route
- Raw WebGL (no library) for the three generative expert avatar shaders

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL and go to `/agents`.

## Structure

- `src/components/Sidebar.tsx` — the left icon rail
- `src/components/Header.tsx` — top nav bar (Command Center / Copilot / Agents / Cockpit / AI Command Center)
- `src/components/HeroBanner.tsx` — "Velaris AI workforce" banner with background video
- `src/components/AgentCard.tsx` / `src/components/ExpertCard.tsx` — the two card types
- `src/components/MascotAvatar.tsx` — the Custom-agent robot mascot avatars: six
  shape + color variants (case/wallet/pie/shield/calendar/cube), with cursor-tracking
  "gaze", idle blink, and a soft breathing animation
- `src/components/AnimatedAvatar.tsx` — the Expert-agent avatar dispatcher: renders
  either a `<video>` (Onboarding/Renewal/Risk) or a `WebGLAvatar` (Expansion/QBR/
  Customer Intelligence)
- `src/components/WebGLAvatar.tsx` — generic canvas + WebGL runner for the shader
  avatars
- `src/webgl/shaders.ts` — the three fragment shader sources (cosmic cloud / helix /
  singularity), taken as-is from the Velaris avatar assets provided
- `src/data/agents.ts` / `src/data/experts.ts` — the content for both tabs, including
  the mascot shape/color spec per custom agent, the avatar type per expert, and (on
  `experts.ts`) the richer Preview-drawer content (outcome metric, how it works,
  does-on-its-own / comes-to-you-first, context it reads)
- `src/data/agentDetails.ts` — mock "360" content per Custom agent (needs-your-
  attention items, stat tiles, accounts table) plus a generic empty state for any
  agent that hasn't run yet
- `src/state/agentsStore.tsx` — a small React context that holds the list of Custom
  agents (the 6 seed agents plus any created via the Agent Builder), persisted to
  `localStorage` so a newly-configured agent survives a refresh
- `src/components/WaveformAvatar.tsx` — the avatar system for agents created via
  the Agent Builder: a canvas-drawn animated equalizer/bar badge. Presets are a
  plain palette of 18 shape + color combinations (`WAVEFORM_PRESETS`) with no
  names or labels attached — picking one is a pure "choose a look" action, not
  an identity choice — styled after the "Waveform" avatars at Velaris' avatar
  reference tool
- `src/components/OrbAvatar.tsx` — the original 8-preset gradient-orb avatar
  system; kept only so any agent already saved in a browser's `localStorage`
  from before this change keeps rendering correctly
- `src/components/AgentAvatar.tsx` — dispatches to `WaveformAvatar`, `OrbAvatar`
  or `MascotAvatar` depending on which avatar field the agent has set
- `src/components/PoweredByBadge.tsx` — the "Powered by [Expert]" line (with a
  copy of the expert's own avatar, sized up to 26–30px so its video/shader
  pattern actually reads at a glance) shown under a Custom agent's name when it
  was configured from an Expert
- `src/components/ExpertPreviewDrawer.tsx` — the right-hand slide-over opened by an
  Expert card's "Preview" button
- `src/pages/AgentBuilderPage.tsx` — the chat-based "Agent Builder" configuration
  flow at `/agents/build/:expertSlug` (8-step checklist, simulated Q&A, then avatar
  + name selection); completing it creates a new Custom agent
- `src/pages/AgentProfilePage.tsx` — the Custom agent 360 profile at
  `/agents/:agentId` (Overview / Activity / Chat / Settings tabs). The header,
  needs-your-attention list, stat tiles and accounts table are styled to match
  the live product's profile page: a type line ("Custom agent · By Velaris"),
  a status pill below the description, tone-colored (amber/green/red) bars and
  pills for attention items and account status, and a two-line account cell
  (name + segment/value)
- `src/pages/AgentsPage.tsx` — the page itself (tabs, toolbar, grid, and the
  Preview-drawer state for the Experts tab)
- `public/assets/` — the banner video and the three expert avatar videos (pulse /
  orbit / particle-cube), compressed from the originals

## Avatar mapping

Custom agents (mascot shape + color):
- Account Onboarding — blue "case" (matches the reference video/screenshot)
- Renewal Email Handler — orange "wallet"
- Weekly Health Digest — green "pie"
- Ticket Escalation Watch — red/rose "shield"
- Exec Sponsor Tracker — violet "calendar"
- Usage Drop Investigator — teal "cube"

Expert agents:
- Wayfinder (Onboarding) — pulse-core video
- Phoenix (Renewal) — orbit video
- Sentinel (Risk Mitigation) — particle-cube video
- Artemis (Expansion) — cosmic-cloud WebGL shader
- Bastion (Account Planning) — helix WebGL shader
- Hermes (Low-touch Comms) — singularity WebGL shader

Agents created via the Agent Builder get one of 18 animated "Waveform" avatars
instead (a deliberately different, simpler style, since these represent a
configured instance rather than a hand-placed character) — see
`WaveformAvatar.tsx`. The picker shows plain color/shape swatches with no
names or labels attached — it's a "pick a look" choice, not an identity pick.

## Product model: Experts vs. Custom agents

Velaris has two kinds of agent:

- **Custom agents** are general-purpose, user-built via prompting — flexible,
  but with no deep workflow expertise of their own.
- **Experts** are specialised, autonomous agents Velaris builds around a
  specific post-sales outcome. An Expert is not a prompt template or an
  automation recipe — it has a specific outcome it owns, capabilities, the
  context it understands, actions it can take, a workflow/state model,
  autonomy boundaries and approvals, escalation behaviour, and its own
  performance metrics. **Experts own outcomes, not tasks.**

The six Experts and the outcome each one owns (`src/data/experts.ts` /
`EXPERTS` in the standalone HTML):

- **Wayfinder** (Onboarding) — complete every sales handover within the
  target timeframe. Ships today with one capability, Sales Handover; kickoff
  coordination and full onboarding management are called out as planned next,
  not presented as already live.
- **Phoenix** (Renewals) — drive every renewal to a decision before the
  renewal date.
- **Sentinel** (Risk) — identify and mitigate customer risk before it becomes
  churn.
- **Artemis** (Expansion) — turn customer signals into qualified expansion
  opportunities.
- **Bastion** (Account Planning) — keep strategic account plans current and
  turn account strategy into action. QBR prep is one capability, not its
  whole identity.
- **Hermes** (Comms) — the Long-tail Communications Expert. Monitors
  long-tail customers for risk and growth signals, reaches out with context,
  and manages the conversation until the outcome is reached or a human's
  judgement is needed. (Earlier drafts of this prototype had Hermes as a
  portfolio-summarisation "Customer Intelligence" agent — that identity was
  wrong and has been replaced.)

Each Expert's Preview drawer (`ExpertPreviewDrawer.tsx`) walks through seven
sections in a fixed order: the outcome it owns, how it works, what it can do,
where you stay in control (does on its own / comes to you first), the context
it uses, how success is measured, and the systems it works with. "How success
is measured" lists **KPI names only** (e.g. "Handovers completed within
target") — no invented numbers, since nothing has been activated yet.

## Expert → Custom agent flow

Experts are templates, not standalone agents — they don't get their own 360
page. Instead:

1. **Preview** on an Expert card opens the seven-section drawer above.
2. **Add agent** (on the card, or "Open agent" in the drawer) opens the
   **Agent Builder** — a full-page, chat-style configuration flow at
   `/agents/build/:expertSlug`. It confirms the agent's name/purpose, then
   walks through 7 more steps (Instructions, Trigger, Context, Skills, Scope,
   Approvals, Delivery) via a short scripted Q&A with suggested-reply chips.
   The answers are captured and, together with the Expert's own
   `configuration` (base objective, triggers, skills, context, default scope,
   approvals, notifications, success criteria), become the new agent's
   `config` object — the same object Settings reads and edits later.
3. The last step asks for a **name and an avatar** (one of 18 plain Waveform
   swatches). Activating creates a new Custom agent — added to the Custom
   tab, with its own 360 page, "Powered by [Expert Name]" under its name, and
   a populated `config`.

Custom agents this session creates are kept in `localStorage`
(`velaris-agents-added-v1`) so they survive a page refresh; there's no
backend, so this is per-browser only. Edits made to the six seed agents in
Settings (status, description, config) are kept in memory for the session
only, matching how newly-created agents' edits are handled before a refresh.

## Agent profile: Work / Activity / Chat / Settings

The former "Overview" tab is now **Work** — "What work is this agent
currently responsible for?" It keeps the three areas from before (Needs your
attention, Performance, Work being managed) but the schema is now resolved
generically:

- `getAgentDetail(agent)` (`src/data/agentDetails.ts`) checks
  `agent.poweredBy?.expertSlug` first and, if set, renders straight from that
  Expert's own `profile` schema (`statCards`, `sectionTitle`,
  `sectionSubtitle`, `columns`, `statusKey`, `rows`, `attention`) — so the
  Work tab looks different per Expert (Wayfinder's handover columns vs.
  Hermes's risk/opportunity columns vs. Phoenix's renewal columns, etc.)
  without any agent-slug-specific code. Nothing is hard-coded to a
  particular custom-agent slug any more.
  Agents that were **built in-house** (no Expert behind them) fall back to a
  generic per-slug detail, or an empty state for a brand-new agent.
- "Needs your attention" is labelled "Personalized to You" and each item
  states why it needs attention and how long it's been waiting, with a
  contextual action verb (Review / Approve / Assign owner / Respond /
  Investigate) rather than a generic alert feed.

**Activity** is a real date-grouped timeline (`src/data/agentActivity.ts`) —
dot-and-line markers, an inline account tag, a timestamp, a description, and
a small uppercase status tag (ACTED / UPDATED / REVIEWED / REQUESTED
APPROVAL / ASKED A HUMAN / ESCALATED). Each of the six Experts has its own
mock activity log; in-house agents show an empty state until they've run.

**Chat** is a working bubble UI — ask the agent what it's doing (it answers
from its own Work-tab stats/attention) or tell it how to behave (it
acknowledges and points at Settings > Goal & instructions, where that note
actually lives).

**Settings** is a full ClickUp-inspired configuration surface, all reading
from and writing to the same `agent.config` object: Agent details, Goal &
instructions (editable), Triggers (toggleable, Expert-specific), Skills &
tools (toggleable), Context, Scope, Autonomy & approvals (does-on-its-own vs.
always-requires-approval), Notifications & escalation, Success criteria
(Expert-specific, editable key/value fields), and Agent controls (Pause /
Deactivate / Remove). An **Edit with chat** box at the top accepts a
plain-language instruction (e.g. "Never email enterprise customers without
approval.") and appends it to the same `instructions` field the manual editor
below shows — the conversational and manual paths modify one underlying
config, never two.

Agents with no Expert behind them get a small generic fallback config
(`fallbackConfig()` in both `AgentProfilePage.tsx` and the standalone HTML)
so Settings always has something real to show.

### Profile header: Chat / Run now / ⋯

The header actions are sized down from the app's default `h-9`/36px buttons
to `h-8`/32px, scoped to just this header (the standalone HTML does this with
`.profile-actions .primary-btn` / `.btn-outline` / `.btn-icon-outline`
overrides rather than touching the shared classes, so the toolbar and Experts
tab buttons elsewhere are unaffected).

The `⋯` button now opens a small dropdown with **Pause/Resume** and
**Delete**, closing on an outside click or Escape:

- **Pause** toggles `agent.status` between `Active` and `Paused` — the same
  `updateAgent` call the Settings tab's "Agent controls" card uses.
- **Delete** asks for confirmation, then calls `removeAgent` and navigates
  back to the Agents list — for a custom-built agent this removes it for
  good; for a seed/Expert-powered agent (which can't be truly deleted from
  static seed data) it's marked `Paused` instead, same as the Settings tab's
  "Remove agent" behaved before. The Settings tab's own "Remove agent" button
  now asks the same confirmation and also navigates back to the list, so both
  entry points behave identically.

### Work Item Case File drawer

Every account row in the Work table, every "Needs your attention" row, and
every attention action button (Review / Approve / Investigate / Respond /
Assign owner / Follow up) opens the same right-side drawer — a **Work Item
Case File** — regardless of status, including completed items. The
hierarchy is:

```
Expert → configured Agent → Work Item → Work Item Case File
```

**One generic shell, never a per-account or per-Expert branch.** The drawer
component (`src/components/WorkItemDrawer.tsx`, mirrored line-for-line in the
standalone HTML's inline `WorkItemDrawer`/`wi*Html` functions) renders a
universal information architecture — HEADER (account, work type, status,
agent, target date) → CURRENT STATE → a list of typed blocks — and switches
**only on `block.type`**, never on `account === "Acme Corp"` or
`expert.slug === "onboarding-expert"`. All of the account- and
Expert-specific content lives in data, not in the rendering layer.

**Schema** (`src/data/workItemTypes.ts`): `WorkItemCaseFile` is
`{ id, account, workType, status, agentName, targetDate?, currentState,
blocks[] }`. Each block is one of 22 reusable types — `progress`,
`checklist`, `question`, `approval`, `signalEvidence`, `emailThread`,
`emailDraft`, `artifact`, `recordSummary`, `timeline`, `nextAction`,
`ownerAssign`, `escalationActions`, `outcome`, `mitigationPlan`,
`qualification`, `accountPlan`, `commitments`, `riskAssessment`, `evidence`,
`actionDecision`, `whySummary` — each with a stable `id` (used to
scroll-to-and-highlight a block when an attention action names a
`focusTarget`) and an optional `tab` (`"overview" | "context" | "activity"`,
defaulting to `"overview"`) that places it in the right tab (see below).

**Business logic lives in pure builder functions**, one per work item
(`src/data/workItemCaseFiles.ts` — `wayfinderAcme`, `hermesGlobex`,
`phoenixStark`, etc., ~18 in total across the six Experts, registered in
`buildersByExpertSlug[expertSlug][workItemId]`). Each builder is a pure
function of the current overrides (`CaseFileBuilder = (overrides) =>
WorkItemCaseFile`) that decides what the case file looks like right now —
e.g. Wayfinder/Acme's builder returns a `question` block until answered, then
a `progress` block that reads 6/6 and a `nextAction` block that reflects
completion. Non-Expert agents fall back to `buildGenericCaseFile()`, built
directly from the agent's own Work-tab row data, so every row stays
openable even without an Expert behind it.

**Interaction state** is a second, separate localStorage store
(`velaris-workitem-overrides-v1` — `WorkItemOverridesProvider`/
`useWorkItemOverrides` in React, a matching `WORKITEM_OVERRIDES` +
`getOverridesFor`/`setWorkItemOverride` pair in the standalone HTML) keyed by
`workItemId` → `blockId` → override value. Answering a question, approving or
editing an email draft, assigning an owner, resolving an escalation, or
marking a commitment done all write one override and the whole case file
recomputes from it — the same way the React version re-renders off new
props. Purely visual, session-only toggles (an email draft in edit mode, an
artifact's preview expanded) live in an in-memory ephemeral map instead,
reset whenever the drawer reopens.

**Per-Expert scenarios**, each demonstrating a different interaction
pattern:

- **Wayfinder (Sales Handover)** — Acme Corp (a blocked question that
  completes a 5/6 → 6/6 progress bar once answered), Globex (a ready-to-commit
  handover with Approve/Decline/Request changes, publishing a Sales Handover
  Canvas artifact and an OUTCOME block on approve), Initech (an unassigned
  owner that must be picked before the handover can proceed), Northwind and
  Umbrella Health (steady in-progress states with no user action needed).
- **Hermes (Communications)** — Acme Corp (a usage-decline risk with signal
  evidence, an email thread, and a customer question), Globex (a seat-growth
  opportunity with an editable email draft — edit manually, ask the agent to
  revise, or approve & send), Initech (an escalated risk: two autonomous
  emails, a frustrated reply, and Take over / Tell Hermes how to respond /
  Close situation, the last producing an OUTCOME block).
- **Phoenix (Renewals)** — Stark Industries (a commercial approval with
  Approve / Decline / Modify / Ask Phoenix for a recommendation), Castlemount
  (an autonomous procurement follow-up), Wren Analytics (renewal risk
  evidence).
- **Sentinel (Risk)**, **Artemis (Expansion)**, **Bastion (Account
  Planning)** — lighter-weight but built on the same block types (risk
  evidence + mitigation plans, qualification checklists, account plans and
  commitment tracking).

The drawer is ~640px wide (responsive down to 94vw on small screens), opens
as a right-side overlay with a sticky header and independently scrolling
body, and closes on Escape, a backdrop click, or its own close button — all
without touching the existing Work / Activity / Chat / Settings tabs, the
Agent Profile header, or any other previously-shipped behavior.

#### Overview / Context / Activity tabs

Every Work Item drawer — for all six Experts and the generic fallback — is
organized into three tabs directly under the header, defaulting to Overview
every time a work item opens:

- **Overview = operate.** What's happening, does the agent need anything from
  me, what's it doing right now, what happens next. Order: current state → a
  compact "why" summary (see below) → any blocked-on-user input/approval →
  the primary work (a customer thread, an email draft, a Canvas artifact, an
  owner assignment, ...) → Next. This is deliberately *not* the full
  evidence/trigger/autonomy trail — that's one tap away.
- **Context = understand.** The full explainability/audit trail: risk or
  opportunity assessment, key evidence, qualification criteria, the matched
  playbook and autonomy policy, account-plan detail — everything that
  answers "why did the agent do this," reserved off Overview so a live piece
  of work doesn't read like an audit report.
- **Activity = audit.** This work item's own chronological case history
  (distinct from the Agent Profile's agent-wide Activity tab).

The classification is pure data: `BlockBase` in `workItemTypes.ts` carries an
optional `tab?: "overview" | "context" | "activity"` (defaulting to
`"overview"`), set per block in each work item's builder function — the
drawer and every block renderer still switch only on `block.type`, and now
additionally filter by `block.tab`, never on account or Expert identity.
Switching tabs never unmounts the drawer or resets in-flight interaction
state (an open edit box, an expanded evidence list); only opening a
*different* work item resets back to Overview.

For the two Hermes cases this replaces, a new generic `whySummary` block
renders a compact, scannable explanation on Overview (e.g. "WHY THIS WAS
FLAGGED · High Risk · Primary signal: Weekly active users ↓38% over 3 weeks
· ... · View full context →"), with a "View full context →" action that
switches to the Context tab — so the reader is never asked to infer the risk
logic themselves, without the Overview tab turning into a dashboard.

Context-tab content is rendered as rows with dividers and typography
hierarchy rather than bordered cards — bordered/highlighted cards are
reserved for Overview's human-action-required, approval, warning, draft, and
artifact content, so Context reads as a clean audit trail instead of a stack
of AI-generated-looking cards.

#### Hermes risk case: an auditable decision chain

The Hermes / Acme Corp risk work item makes the agent's reasoning explicit
instead of leaving the user to infer it from raw metrics. The old single
"Why Hermes acted" evidence tile is split into a decision chain — evidence →
risk assessment → action trigger → autonomy rule → agent action — rendered
as three sections on the Context tab (with a compact summary and a "View
full context →" link on Overview, per the tab model above):

- **Risk assessment** — a risk-level pill (High/Medium/Low), a concise,
  product-facing explanation grounded in visible evidence (never exposed
  chain-of-thought), a primary driver / supporting signal / urgency summary,
  and a compact per-dimension breakdown (User Adoption, Platform Engagement,
  Feature Utilisation, Dormancy) so the reader can see where the risk is —
  and isn't — coming from.
- **Key evidence** — each signal is tagged by role (`primary` / `supporting`
  / `context`) rather than shown as an undifferentiated metric dump. A "View
  all evidence" toggle reveals secondary attributes (AI Risk, health score,
  feature adoption, open tickets) that don't drive the classification but
  are available on demand — progressive disclosure instead of an analytics
  dump.
- **Why Hermes acted now** — the matched playbook and its condition, a
  checklist of which specific conditions were satisfied, the autonomy policy
  that let Hermes act without approval (with its scope), and the action it
  actually took.

The customer conversation itself now carries a provenance strip ("Initiated
by Hermes · Trigger: Usage decline risk · Sent automatically · 2 days ago")
so the thread visibly traces back to the decision that started it.

This is implemented as three new generic block types —
`riskAssessment`, `evidence`, `actionDecision` — in the same schema as every
other block (`src/data/workItemTypes.ts`), rendered by three new generic
components in `WorkItemDrawer.tsx` (and their `wiRiskAssessmentHtml` /
`wiEvidenceHtml` / `wiActionDecisionHtml` counterparts in the standalone
HTML). They aren't Hermes-specific in the rendering layer — `hermesAcme` uses
`riskAssessment` + `evidence` + `actionDecision` for its risk case, and
`hermesGlobex` separately uses `evidence` + `actionDecision` (plus
`recordSummary` and `qualification`) for its opportunity case; any other
work item could adopt the same blocks without touching the drawer.

## Known gaps

- "Status", "Created by", and the card `⋯` menu are visual-only in the source
  prototype (they don't open anything there either), so they're inert here too.
- The Agent Builder's chat is a scripted simulation (fixed questions and
  suggested-reply chips per Expert) rather than a real model — typing free text
  into the input just advances the same script. The Chat tab on the profile
  page is a similar lightweight simulation, not a real model connection.
- The mascot shapes are original vector recreations of the reference icon set's
  general style (rounded toy-like forms + dot eyes), not traced copies of the
  exact reference PNGs — only 6 of the 12 reference shapes were needed, and vector
  source for the reference icons wasn't available.
- The Waveform avatar's bar shapes and colors are an original implementation
  styled after the referenced avatar tool, not a byte-for-byte port of its
  source — the visual language (rounded bars, six distinct silhouettes, a
  curated color palette) matches, but the exact easing/timing curves weren't
  copied, and the presets are static (they no longer recolor by agent status).
- The profile header's type line now reads "Custom agent · Powered by Expert"
  or "Custom agent · Built in-house" (matched to a reference screenshot of the
  live prototype showing "CUSTOM AGENT · BUILT IN-HOUSE"), replacing the
  earlier "Custom agent · By Velaris" / "Expert-built agent · By Velaris"
  wording from before this pass.
- The stat-card labels and sample data on each Expert's Work tab are
  original mock content written to match the shapes described in the product
  spec (and, for Wayfinder, a reference screenshot of the live prototype) —
  they are not pulled from a real backend, since this remains a static
  front-end prototype with mock data throughout.
