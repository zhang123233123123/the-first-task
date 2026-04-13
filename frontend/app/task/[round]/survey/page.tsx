"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LikertScale } from "@/components/ui/LikertScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

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
  { key: "smi_sc10", label: "During the task, I almost always knew how much I had left to complete." },
  { key: "smi_sc14", label: "During the task, I kept track of my progress and, if necessary, changed my techniques or strategies." },
  { key: "smi_sc18", label: "During the task, I checked my accuracy as I progressed." },
];

const CSE_ITEMS = [
  { key: "cse_capable",   label: "I was capable of producing a creative response in this task." },
  { key: "cse_improve",   label: "I could improve a weak idea into something more original during this task." },
  { key: "cse_confident", label: "I felt confident in my ability to shape the final creative outcome." },
];

const LOAD_ITEMS = [
  { key: "load_effort", label: "This task required substantial mental effort." },
  { key: "load_think", label: "I had to think carefully before moving forward." },
  { key: "load_demanding", label: "Completing this task was mentally demanding." },
];

const PROV_CHECK = [
  { key: "prov_challenged", label: "The AI challenged my assumptions." },
  { key: "prov_alternative", label: "The AI presented alternative perspectives rather than only helping me complete the task." },
  { key: "prov_rethink", label: "The AI prompted me to rethink my developing ideas." },
  { key: "prov_critic", label: "The AI behaved more like a challenger than a simple assistant." },
];

const FRICTION_CHECK = [
  { key: "fric_slowdown", label: "The interface made me slow down before moving on." },
  { key: "fric_reflect", label: "The system required me to reflect before using ideas." },
  { key: "fric_pause", label: "The interaction included deliberate pause points." },
  { key: "fric_justify", label: "The design made me review or justify my choices rather than proceed immediately." },
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
  const { participantId, conditionId } = useStore();
  const isNoAi = conditionId === "no_ai";

  // Per-round flags: combined conditions switch mode each round
  const provocateurFlag =
    conditionId === "provocateur" ||
    (conditionId === "prov_then_fric" && round === 1) ||
    (conditionId === "fric_then_prov" && round === 2);
  const frictionFlag =
    conditionId === "friction" ||
    (conditionId === "prov_then_fric" && round === 2) ||
    (conditionId === "fric_then_prov" && round === 1);

  const BLOCKS = [
    { id: "smi_aw",  title: "Awareness",         items: SMI_AWARENESS },
    { id: "smi_cs",  title: "Cognitive strategy", items: SMI_COGNITIVE_STRATEGY },
    { id: "smi_pl",  title: "Planning",           items: SMI_PLANNING },
    { id: "smi_sc",  title: "Self-checking",      items: SMI_SELF_CHECKING },
    {
      id: "cse",
      title: "Creative confidence",
      items: CSE_ITEMS,
    },
    { id: "load", title: "Task effort", items: LOAD_ITEMS },
    { id: "prov", title: "About the interaction", items: PROV_CHECK },
    { id: "friction", title: "About the interface", items: FRICTION_CHECK },
    {
      id: "ownership",
      title: "Ownership",
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

  const [responses, setResponses] = useState<Record<string, number | null>>({});
  const [block, setBlock] = useState(0);
  const [loading, setLoading] = useState(false);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const activeBlocks = BLOCKS.filter((b) => {
    if (b.id === "prov")     return provocateurFlag;
    if (b.id === "friction") return frictionFlag;
    return true;
  });

  const currentBlock = activeBlocks[block];
  const allAnswered = currentBlock.items.every((it) => responses[it.key] != null);

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
      await api.updateProgress(participantId!, "task/2/brief");
      router.push("/task/2/brief");
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
            {currentBlock.items.map((item) => (
              <LikertScale
                key={item.key}
                name={item.key}
                label={item.label}
                value={responses[item.key] ?? null}
                onChange={(val) => setResponses((r) => ({ ...r, [item.key]: val }))}
                {...(currentBlock.id.startsWith("smi_") && {
                  points: 4,
                  lowLabel: "Not at all",
                  highLabel: "Very much so",
                })}
              />
            ))}
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
