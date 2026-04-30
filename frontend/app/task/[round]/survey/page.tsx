"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LikertScale } from "@/components/ui/LikertScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

// ── Pilot-only: manipulation check items per condition ───────────────────────
// 7-point Likert (1=Strongly disagree, 7=Strongly agree)
const PILOT_MANIP_ITEMS: Record<string, { key: string; label: string }[]> = {
  friction: [
    { key: "mc_friction1", label: "The interface made me pause and reflect before continuing." },
    { key: "mc_friction2", label: "The reflection prompts made me reconsider my approach." },
  ],
  provocateur: [
    { key: "mc_prov1", label: "The chatbot challenged my current thinking." },
    { key: "mc_prov2", label: "The chatbot made me consider different perspectives." },
  ],
  basic_ai: [
    { key: "mc_basic1", label: "The AI suggestions were helpful for developing my ideas." },
    { key: "mc_basic2", label: "I found the AI suggestions relevant to my writing." },
  ],
};

// SMI – State Metacognitive Inventory (O'Neil & Abedi, 1996, CRESST Tech Report 469)
// 4-point scale: 1=Not at all, 2=Somewhat, 3=Moderately so, 4=Very much so
// "test questions" adapted to "the task" for creative writing context

const SMI_AWARENESS = [
  { key: "smi_aw1",  label: "During the task, I was aware of my own thinking." },
  { key: "smi_aw5",  label: "During the task, I was aware of which thinking technique or strategy to use and when to use it." },
  { key: "smi_aw9",  label: "During the task, I was aware of the need to plan my course of action." },
  { key: "smi_aw13", label: "During the task, I was aware of my ongoing thinking processes." },
  { key: "smi_aw17", label: "During the task, I was aware of trying to understand it before I attempted to work on it." },
];

const SMI_COGNITIVE_STRATEGY = [
  { key: "smi_cs3",  label: "During the task, I attempted to discover the main ideas." },
  { key: "smi_cs7",  label: "During the task, I asked myself how it related to what I already knew." },
  { key: "smi_cs11", label: "During the task, I thought through the meaning of what I needed to do before I began." },
  { key: "smi_cs15", label: "During the task, I used multiple thinking techniques or strategies." },
  { key: "smi_cs19", label: "During the task, I selected and organized relevant information." },
];

const SMI_PLANNING = [
  { key: "smi_pl4",  label: "During the task, I tried to understand the goals before I attempted to work on it." },
  { key: "smi_pl8",  label: "During the task, I tried to determine what was required." },
  { key: "smi_pl12", label: "During the task, I made sure I understood just what had to be done and how to do it." },
  { key: "smi_pl16", label: "During the task, I determined how to approach it." },
  { key: "smi_pl20", label: "During the task, I tried to understand what was required before I attempted to work on it." },
];

const SMI_SELF_CHECKING = [
  { key: "smi_sc2",  label: "During the task, I checked my work as I went." },
  { key: "smi_sc6",  label: "During the task, I corrected my errors." },
  { key: "attn_posttask", label: "This is an attention check. Please select 'Agree' (6) for this item." },
  { key: "smi_sc10", label: "During the task, I almost always knew how much I had left to complete." },
  { key: "smi_sc14", label: "During the task, I kept track of my progress and, if necessary, changed my techniques or strategies." },
  { key: "smi_sc18", label: "During the task, I checked my accuracy as I progressed." },
];

const CSE_ITEMS = [
  { key: "cse_capable",   label: "I felt capable of producing a creative response in this task." },
  { key: "cse_improve",   label: "I felt I could improve a weak idea into something more original during this task." },
  { key: "cse_confident", label: "I felt confident in my ability to shape the final creative outcome." },
];

// Cognitive Load – adapted from NASA-TLX (Hart & Staveland, 1988)
// Covers: Mental Demand, Effort, Frustration
const LOAD_ITEMS = [
  { key: "load_mental",      label: "This task required substantial mental effort." },
  { key: "load_effort",      label: "I had to work hard to accomplish what I did in this task." },
  { key: "load_frustration", label: "I felt frustrated or stressed during this task." },
];



const OWNERSHIP_ITEMS = [
  { key: "own_mine",       label: "I felt that the final response was truly mine." },
  { key: "own_direct",     label: "I felt that I was directing the creative vision." },
  { key: "own_shape",      label: "I shaped the final response rather than merely cleaning up AI output." },
  { key: "own_contribute", label: "I was able to contribute creatively rather than simply follow the AI." },
];


export default function SurveyPage({ params }: { params: Promise<{ round: string }> }) {
  const { round: roundStr } = use(params);
  const round = parseInt(roundStr, 10);

  const router = useRouter();
  const { participantId, conditionId, isPilot } = useStore();
  const isNoAi = conditionId === "no_ai";

  // ── Pilot survey: demographics + condition-specific manipulation check ──────
  const pilotManipItems = PILOT_MANIP_ITEMS[conditionId ?? "basic_ai"] ?? PILOT_MANIP_ITEMS.basic_ai;

  // Pilot round 1: manipulation check only
  // Pilot round 2: manipulation check + demographics (collected once at end)
  const PILOT_BLOCKS = [
    {
      id: "pilot_manip",
      title: "About your experience",
      items: pilotManipItems.map((it) => ({ ...it, type: "scale" as const })),
    },
    ...(round === 2 ? [{
      id: "pilot_demo",
      title: "Background",
      items: [
        { key: "demo_age",     label: "What is your age?",                    type: "select" as const, options: ["18-24","25-34","35-44","45-54","55-64","65 or older","Prefer not to say"] },
        { key: "demo_gender",  label: "What is your gender?",                 type: "select" as const, options: ["Female","Male","Non-binary","Prefer not to say"] },
        { key: "demo_english", label: "What is your English proficiency?",    type: "select" as const, options: ["Beginner","Proficient","Advanced","Native speaker","Prefer not to say"] },
      ],
    }] : []),
  ];

  // Manipulation checks (PROV_CHECK / FRICTION_CHECK) are pilot-study only.
  // They are NOT included in the main experiment survey per supervisor feedback.
  const BLOCKS = [
    { id: "smi_aw",  title: "Your thinking process",  items: SMI_AWARENESS },
    { id: "smi_cs",  title: "Your approach",          items: SMI_COGNITIVE_STRATEGY },
    { id: "smi_pl",  title: "Getting started",        items: SMI_PLANNING },
    { id: "smi_sc",  title: "Reviewing your work",    items: SMI_SELF_CHECKING },
    {
      id: "cse",
      title: "Creative confidence",
      items: CSE_ITEMS,
    },
    { id: "load", title: "Task effort", items: LOAD_ITEMS },
    {
      id: "ownership",
      title: "Your experience",
      items: OWNERSHIP_ITEMS.map((it) => {
        if (!isNoAi) return it;
        if (it.key === "own_shape")
          return { ...it, label: "I shaped the final response rather than merely cleaning up the suggestions." };
        if (it.key === "own_contribute")
          return { ...it, label: "I was able to contribute creatively rather than simply following the instructions." };
        return it;
      }),
    },
  ];

  const [responses, setResponses] = useState<Record<string, number | string | null>>({});
  const [block, setBlock] = useState(0);
  const [loading, setLoading] = useState(false);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const activeBlocks = isPilot ? PILOT_BLOCKS : BLOCKS;

  const currentBlock = activeBlocks[block];
  const allAnswered = currentBlock.items.every((it) => {
    const v = responses[it.key];
    return v !== null && v !== undefined && v !== "";
  });

  const handleNext = async () => {
    if (block < activeBlocks.length - 1) {
      setBlock((b) => b + 1);
      return;
    }
    setLoading(true);
    const startedAt = startTime.current ?? Date.now();
    const elapsed = (Date.now() - startedAt) / 1000;

    if (participantId) {
      await api.savePostTask(participantId, round, responses as Record<string, unknown>, elapsed);
    }

    if (round === 1) {
      await api.updateProgress(participantId!, "transition");
      router.push("/transition");
    } else {
      await api.completeStudy(participantId!);
      router.push("/complete");
    }
  };

  // Two task workspaces plus N survey blocks per round (N varies by condition).
  const TOTAL_STEPS = 2 * (1 + activeBlocks.length);
  const progressStep =
    round === 1
      ? 2 + block
      : activeBlocks.length + 3 + block;

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        key={`${round}-${block}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl space-y-6"
      >
        <ProgressBar
          step={progressStep}
          total={TOTAL_STEPS}
          label={`Task ${round} questionnaire — section ${block + 1} of ${activeBlocks.length}`}
        />

        <div className="glass-card p-7 space-y-6">
          <div>
            <p className="text-xs text-[var(--warm-gray)] uppercase tracking-wide font-medium mb-1">
              Answer the questions below in relation to the task you just completed
            </p>
            <h2 className="text-xl font-semibold text-[var(--warm-brown)]">{currentBlock.title}</h2>
          </div>

          <div className="space-y-6">
            {currentBlock.items.map((item) => {
              if ("type" in item && item.type === "select") {
                return (
                  <div key={item.key} className="space-y-2">
                    <label className="text-sm text-[var(--warm-brown)] leading-relaxed">{item.label}</label>
                    <select
                      value={String(responses[item.key] ?? "")}
                      onChange={(e) => setResponses((r) => ({ ...r, [item.key]: e.target.value || null }))}
                      className="w-full rounded-2xl bg-white/60 border border-[var(--sage-light)]/40 px-4 py-3 text-sm text-[var(--warm-brown)] focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/40"
                    >
                      <option value="">Select an option</option>
                      {"options" in item && (item.options as string[]).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return (
                <LikertScale
                  key={item.key}
                  name={item.key}
                  label={item.label}
                  value={(responses[item.key] as number | null) ?? null}
                  onChange={(val) => setResponses((r) => ({ ...r, [item.key]: val }))}
                  {...(currentBlock.id.startsWith("smi_") && {
                    points: 7,
                    lowLabel: "Strongly disagree",
                    highLabel: "Strongly agree",
                  })}
                  {...(currentBlock.id === "pilot_manip" && {
                    points: 7,
                    lowLabel: "Strongly disagree",
                    highLabel: "Strongly agree",
                  })}
                />
              );
            })}
          </div>

          <Button
            onClick={handleNext}
            disabled={!allAnswered || loading}
            size="md"
            className="w-full"
          >
            {block < activeBlocks.length - 1
              ? "Next"
              : loading
              ? "Saving…"
              : round === 1
              ? "Start task 2"
              : "Finish study"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
