import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bot, Check, Circle, Send } from "lucide-react";
import { expertAgents, type ExpertAgent } from "../data/experts";
import { useAgents, slugify } from "../state/agentsStore";
import WaveformAvatar, { WAVEFORM_PRESETS } from "../components/WaveformAvatar";

interface BuilderStepDef {
  key: string;
  label: string;
  hint: string;
}

const BUILDER_STEPS: BuilderStepDef[] = [
  { key: "identity", label: "Identity", hint: "Name and purpose confirmed" },
  { key: "instructions", label: "Instructions", hint: "Playbook it should follow" },
  { key: "trigger", label: "Trigger", hint: "What starts a run" },
  { key: "context", label: "Context", hint: "What it's allowed to read" },
  { key: "skills", label: "Skills", hint: "Actions it can take on its own" },
  { key: "scope", label: "Scope", hint: "Accounts or segments it covers" },
  { key: "approvals", label: "Approvals", hint: "What needs your sign-off first" },
  { key: "delivery", label: "Delivery", hint: "Where updates show up" },
];

interface QuestionDef {
  key: string;
  question: string;
  chips: string[];
}

function buildQuestions(expert: ExpertAgent): QuestionDef[] {
  return [
    {
      key: "instructions",
      question: `Should it follow your standard playbook for ${expert.category.toLowerCase()} workflows, or would you like to adjust anything first?`,
      chips: ["Use the standard playbook", "I'll want to tweak a few things later"],
    },
    {
      key: "trigger",
      question: "What should start a run?",
      chips: ["On a daily schedule", "When a relevant record changes", "I'll trigger it manually"],
    },
    {
      key: "context",
      question: `It'll read ${expert.contextItReads[0].toLowerCase()} and a few related sources — sound right?`,
      chips: ["Yes, that's the right context", "Limit it to a subset of accounts"],
    },
    {
      key: "skills",
      question: `Here's what it can do on its own: ${expert.doesOnItsOwn[0].toLowerCase()}, and more like it. Anything to hold back?`,
      chips: ["Looks right, keep going", "Keep everything as a draft for now"],
    },
    {
      key: "scope",
      question: "Which accounts should it cover?",
      chips: ["All active accounts", "Only enterprise accounts", "A specific segment"],
    },
    {
      key: "approvals",
      question: "What should always come to you first before it goes out?",
      chips: expert.comesToYouFirst.slice(0, 2),
    },
    {
      key: "delivery",
      question: "Where should its updates show up?",
      chips: ["Slack + email", "Just in the Activity tab", "Slack only"],
    },
  ];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  understanding?: { purpose: string; confirmed: boolean };
  chips?: string[];
}

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

export default function AgentBuilderPage() {
  const { expertSlug } = useParams();
  const navigate = useNavigate();
  const { addAgent, getBySlug } = useAgents();
  const foundExpert = expertAgents.find((e) => e.slug === expertSlug);
  const expert = foundExpert as ExpertAgent;

  const questions = useMemo(() => (expert ? buildQuestions(expert) : []), [expert]);

  const [draftName, setDraftName] = useState(expert?.name ?? "New agent");
  const [purposeDraft, setPurposeDraft] = useState(expert?.description ?? "");
  const [editingPurpose, setEditingPurpose] = useState(false);
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    expert
      ? [{ id: nextId(), role: "user", text: `Set up the ${expert.name} for our team.` }]
      : [],
  );
  const [selectedWaveform, setSelectedWaveform] = useState(WAVEFORM_PRESETS[0].id);
  const [finalName, setFinalName] = useState(expert?.name ?? "New agent");
  const finalNameRef = useRef<HTMLInputElement>(null);
  const identityConfirmed = completedKeys.includes("identity");
  const finished = completedKeys.length === BUILDER_STEPS.length;

  if (!foundExpert) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-16 text-center">
        <p className="text-[14px] text-muted-foreground">That expert couldn't be found.</p>
        <Link to="/agents" className="text-[13px] font-medium text-primary hover:underline">
          Back to Agents
        </Link>
      </main>
    );
  }

  function confirmIdentity(purpose: string, replyText: string) {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text: replyText },
      { id: nextId(), role: "assistant", understanding: { purpose, confirmed: true } },
    ]);
    setCompletedKeys(["identity"]);
    setEditingPurpose(false);
    // ask the first question
    const first = questions[0];
    if (first) {
      window.setTimeout(() => {
        setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text: first.question, chips: first.chips }]);
      }, 150);
    }
  }

  function answerCurrentQuestion(replyText: string) {
    const current = questions[questionIndex];
    if (!current) return;
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: replyText }]);
    setCompletedKeys((prev) => [...prev, current.key]);
    setAnswers((prev) => ({ ...prev, [current.key]: replyText }));
    const next = questions[questionIndex + 1];
    setQuestionIndex((i) => i + 1);
    if (next) {
      window.setTimeout(() => {
        setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text: next.question, chips: next.chips }]);
      }, 150);
    } else {
      window.setTimeout(() => {
        finalNameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    }
  }

  function handleSend() {
    const value = inputValue.trim();
    if (!value) return;
    setInputValue("");
    if (!identityConfirmed) {
      confirmIdentity(purposeDraft, value);
    } else if (!finished) {
      answerCurrentQuestion(value);
    }
  }

  function activate() {
    const name = finalName.trim() || expert.name;
    let slug = slugify(name);
    if (getBySlug(slug)) {
      let n = 2;
      while (getBySlug(`${slug}-${n}`)) n += 1;
      slug = `${slug}-${n}`;
    }
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "AG";

    const instructionsNote = answers.instructions ? ` Customer-specific note: ${answers.instructions}` : "";
    addAgent({
      slug,
      initials,
      name,
      description: purposeDraft || expert.description,
      status: "Active",
      updatedAt: "Just now",
      assignee: "You",
      owner: "You",
      avatarWaveform: selectedWaveform,
      poweredBy: { expertSlug: expert.slug, expertName: expert.name, avatar: expert.avatar },
      config: {
        instructions: `${expert.configuration.baseObjective}${instructionsNote}`,
        triggers: expert.configuration.triggers.map((t) => ({ ...t, enabled: true })),
        context: expert.configuration.context,
        skills: expert.configuration.skills.map((s) => ({
          name: s.name,
          description: s.description,
          enabled: s.enabledByDefault,
        })),
        scope: answers.scope || expert.configuration.defaultScope,
        approvals: expert.configuration.approvals,
        notifications: expert.configuration.notifications,
        successCriteria: expert.configuration.successCriteria,
      },
    });
    navigate(`/agents/${slug}`);
  }

  const currentQuestion = !finished ? questions[questionIndex] : undefined;
  const lastMessage = messages[messages.length - 1];

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <div className="sticky top-14 z-20 flex items-center gap-4 border-b border-border bg-background px-8 py-4">
        <Link
          to="/agents"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[16px] font-semibold tracking-tight">{draftName}</h1>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Draft
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Not running · nothing is sent while you build
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-[12.5px] text-muted-foreground">
            {completedKeys.length} of {BUILDER_STEPS.length} essentials set
          </span>
          <button
            type="button"
            disabled={!finished}
            onClick={() => finalNameRef.current?.focus()}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors ${
              finished
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed border border-border bg-muted text-muted-foreground"
            }`}
          >
            Review & activate
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-start">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-4 px-8 py-6">
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} expert={expert} onEditPurpose={() => setEditingPurpose(true)} />
            ))}

            {!identityConfirmed && (
              <IdentityCard
                expertName={expert.name}
                purpose={editingPurpose ? purposeDraft : expert.description}
                editing={editingPurpose}
                onEdit={() => setEditingPurpose(true)}
                onChangePurpose={setPurposeDraft}
                onConfirm={(purpose) =>
                  confirmIdentity(purpose, editingPurpose ? "Updated the purpose — that's right." : "That's right.")
                }
              />
            )}

            {identityConfirmed && currentQuestion && lastMessage?.role === "assistant" && lastMessage.chips && (
              <div className="flex flex-wrap gap-2 pl-9">
                {lastMessage.chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => answerCurrentQuestion(chip)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {finished && (
              <div className="mt-2 rounded-xl border border-border bg-card p-5">
                <p className="text-[13.5px] font-semibold tracking-tight">
                  Last step — give it a name and a face
                </p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  This becomes a standalone agent in your Custom tab, powered by {expert.name}.
                </p>

                <label className="mt-4 block text-[12px] font-medium text-foreground/70">Agent name</label>
                <input
                  ref={finalNameRef}
                  value={finalName}
                  onChange={(e) => {
                    setFinalName(e.target.value);
                    setDraftName(e.target.value || expert.name);
                  }}
                  className="mt-1.5 h-9 w-full max-w-sm rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-primary/40"
                />

                <p className="mt-4 text-[12px] font-medium text-foreground/70">Avatar</p>
                <div className="mt-2 flex max-w-md flex-wrap gap-2.5">
                  {WAVEFORM_PRESETS.map((preset, i) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedWaveform(preset.id)}
                      aria-label={`Avatar option ${i + 1}`}
                      className={`rounded-full p-0.5 transition-shadow ${
                        selectedWaveform === preset.id ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                      }`}
                    >
                      <WaveformAvatar presetId={preset.id} size={40} />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={activate}
                  disabled={!finalName.trim()}
                  className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Activate agent <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {!finished && (
            <div className="border-t border-border px-8 py-4">
              <div className="mx-auto flex w-full max-w-[720px] items-center gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Reply, or pick a suggestion above"
                  className="h-10 flex-1 rounded-lg border border-border bg-card px-3.5 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary/40"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="sticky top-[130px] hidden w-[300px] shrink-0 self-start border-l border-border px-6 py-6 lg:block">
          <div className="flex items-center gap-3">
            <ProgressRing completed={completedKeys.length} total={BUILDER_STEPS.length} />
            <div>
              <p className="text-[13px] font-semibold tracking-tight">The agent so far</p>
              <p className="text-[12px] text-muted-foreground">
                {completedKeys.length}/{BUILDER_STEPS.length} steps set
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-3.5">
            {BUILDER_STEPS.map((step) => {
              const done = completedKeys.includes(step.key);
              const isCurrent =
                !done && BUILDER_STEPS.findIndex((s) => !completedKeys.includes(s.key)) === BUILDER_STEPS.indexOf(step);
              return (
                <li key={step.key} className={`flex gap-2.5 rounded-lg ${isCurrent ? "bg-muted/60 -mx-2 px-2 py-1.5" : ""}`}>
                  {done ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-border" />
                  )}
                  <div>
                    <p className={`text-[13px] font-medium ${done ? "text-foreground" : "text-foreground/80"}`}>
                      {step.label}
                    </p>
                    <p className="text-[11.5px] leading-[16px] text-muted-foreground">{step.hint}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-[12px] leading-[17px] text-foreground/80">
              {finished
                ? "Ready to activate — give it a name and an avatar to finish."
                : `Next: ${BUILDER_STEPS[completedKeys.length]?.label ?? ""}`}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ChatBubble({
  message,
  expert,
  onEditPurpose,
}: {
  message: ChatMessage;
  expert: ExpertAgent;
  onEditPurpose: () => void;
}) {
  if (message.understanding) {
    return (
      <div className="flex gap-2.5">
        <BotIcon />
        <div className="max-w-[520px] rounded-xl rounded-tl-sm border border-border bg-card p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            What I understood
          </p>
          <dl className="mt-2 space-y-2 text-[13px]">
            <div>
              <dt className="text-[11px] font-medium text-muted-foreground">Name</dt>
              <dd>{expert.name}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-muted-foreground">Purpose</dt>
              <dd>{message.understanding.purpose}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-muted-foreground">Not in scope</dt>
              <dd>Won't send anything to a customer until you turn on auto-send.</dd>
            </div>
          </dl>
          {message.understanding.confirmed && (
            <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-success">
              <Check className="h-3.5 w-3.5" /> Confirmed
            </span>
          )}
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <div className="flex gap-2.5">
        <BotIcon />
        <div className="max-w-[520px] rounded-xl rounded-tl-sm border border-border bg-card px-4 py-3 text-[13.5px] leading-5">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-[520px] rounded-xl rounded-tr-sm bg-primary px-4 py-3 text-[13.5px] leading-5 text-primary-foreground">
        {message.text}
      </div>
    </div>
  );
}

function BotIcon() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
      <Bot className="h-4 w-4" />
    </span>
  );
}

function IdentityCard({
  expertName,
  purpose,
  editing,
  onEdit,
  onChangePurpose,
  onConfirm,
}: {
  expertName: string;
  purpose: string;
  editing: boolean;
  onEdit: () => void;
  onChangePurpose: (v: string) => void;
  onConfirm: (purpose: string) => void;
}) {
  return (
    <div className="flex gap-2.5">
      <BotIcon />
      <div className="max-w-[520px] rounded-xl rounded-tl-sm border border-border bg-card p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          What I understood
        </p>
        <dl className="mt-2 space-y-2 text-[13px]">
          <div>
            <dt className="text-[11px] font-medium text-muted-foreground">Name</dt>
            <dd>{expertName}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-muted-foreground">Purpose</dt>
            {editing ? (
              <textarea
                value={purpose}
                onChange={(e) => onChangePurpose(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-[13px] outline-none focus:border-primary/40"
              />
            ) : (
              <dd>{purpose}</dd>
            )}
          </div>
          <div>
            <dt className="text-[11px] font-medium text-muted-foreground">Not in scope</dt>
            <dd>Won't send anything to a customer until you turn on auto-send.</dd>
          </div>
        </dl>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onConfirm(purpose)}
            className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-[12.5px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            That's right
          </button>
          {!editing && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
            >
              Edit purpose
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const size = 40;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = total === 0 ? 0 : completed / total;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - frac)}
      />
    </svg>
  );
}
