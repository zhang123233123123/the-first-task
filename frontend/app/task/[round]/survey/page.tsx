"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LikertScale } from "@/components/ui/LikertScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

// ── Attention check helpers ───────────────────────────────────
// Distractor words that never appear in actual prompts
const STORY_DISTRACTORS = ["river", "castle", "shadow", "compass", "whisper", "candle", "bridge", "feather"];
const METAPHOR_DISTRACTORS = ["Love", "Fear", "Hope", "Knowledge", "Silence", "Freedom"];

function buildAttentionCheck(taskType: string, prompt: Record<string, unknown> | null): {
  question: string;
  options: string[];
  correctIndex: number;
} | null {
  if (!prompt) return null;

  if (taskType === "story") {
    const cueWords = (prompt.cue_words as string[]) ?? [];
    if (cueWords.length === 0) return null;
    // Pick one correct word at random
    const correctWord = cueWords[Math.floor(Math.random() * cueWords.length)];
    // Pick 3 distractors not in cue words
    const available = STORY_DISTRACTORS.filter((w) => !cueWords.includes(w));
    const distractors = available.sort(() => Math.random() - 0.5).slice(0, 3);
    // Shuffle all 4 options
    const options = [correctWord, ...distractors].sort(() => Math.random() - 0.5);
    return {
      question: "Which of the following words appeared in your task prompt?",
      options,
      correctIndex: options.indexOf(correctWord),
    };
  }

  if (taskType === "metaphor") {
    const metaphorPrompt = (prompt.metaphor_prompt as string) ?? "";
    // Extract concept (e.g. "Time" from "Time is a ______ because ______.")
    const match = metaphorPrompt.match(/^(\w+)\s+is/i);
    if (!match) return null;
    const correctConcept = match[1]; // e.g. "Time"
    const available = METAPHOR_DISTRACTORS.filter(
      (w) => w.toLowerCase() !== correctConcept.toLowerCase()
    );
    const distractors = available.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [correctConcept, ...distractors].sort(() => Math.random() - 0.5);
    return {
      question: "What was the topic of your metaphor prompt?",
      options,
      correctIndex: options.indexOf(correctConcept),
    };
  }

  return null;
}

// SMI – State Metacognitive Inventory (O'Neil & Abedi, 1996, CRESST Tech Report 469)
// 4-point scale: 1=Not at all, 2=Somewhat, 3=Moderately so, 4=Very much so
// "test questions" adapted to "the task" for creative writing context

const SMI_AWARENESS = [
  { key: "smi_aw1", label: "During the task, I was aware of my own thinking." },
  { key: "smi_aw5", label: "During the task, I was aware of which thinking technique or strategy to use and when to use it." },
  { key: "smi_aw9", label: "During the task, I was aware of the need to plan my course of action." },
  { key: "smi_aw13", label: "During the task, I was aware of my ongoing thinking processes." },
  { key: "smi_aw17", label: "During the task, I was aware of my trying to understand the task before I attempted to work on it." },
];

const SMI_COGNITIVE_STRATEGY = [
  { key: "smi_cs3",  label: "During the task, I attempted to discover the main ideas." },
  { key: "smi_cs7",  label: "During the task, I asked myself how the task related to what I already knew." },
  { key: "smi_cs11", label: "During the task, I thought through the meaning of the task before I began to work on it." },
  { key: "smi_cs15", label: "During the task, I used multiple thinking techniques or strategies." },
  { key: "smi_cs19", label: "During the task, I selected and organized relevant information to work on the task." },
];

const SMI_PLANNING = [
  { key: "smi_pl4",  label: "During the task, I tried to understand the goals before I attempted to work on it." },
  { key: "smi_pl8",  label: "During the task, I tried to determine what the task required." },
  { key: "smi_pl12", label: "During the task, I made sure I understood just what had to be done and how to do it." },
  { key: "smi_pl16", label: "During the task, I determined how to approach the task." },
  { key: "smi_pl20", label: "During the task, I tried to understand the task before I attempted to work on it." },
];

const SMI_SELF_CHECKING = [
  { key: "smi_sc2",  label: "During the task, I checked my work while I was doing it." },
  { key: "smi_sc6",  label: "During the task, I corrected my errors." },
  { key: "smi_sc10", label: "During the task, I almost always knew how much of the task I had left to complete." },
  { key: "smi_sc14", label: "During the task, I kept track of my progress and, if necessary, I changed my techniques or strategies." },
  { key: "smi_sc18", label: "During the task, I checked my accuracy as I progressed through the task." },
];

const CSE_ITEMS = [
  { key: "cse_capable",   label: "I felt capable of producing a creative response in this task." },
  { key: "cse_improve",   label: "I felt I could improve a weak idea into something more original during this task." },
  { key: "cse_confident", label: "I felt confident in my ability to shape the final creative outcome." },
];

// NASA-TLX (Hart & Staveland, 1988) — 5 dimensions
const LOAD_ITEMS = [
  { key: "tlx_mental",      label: "How mentally demanding was the task?" },
  { key: "tlx_temporal",    label: "How hurried or rushed was the pace of the task?" },
  { key: "tlx_performance", label: "How successful were you in accomplishing what you were asked to do?" },
  { key: "tlx_effort",      label: "How hard did you have to work to accomplish your level of performance?" },
  { key: "tlx_frustration", label: "How insecure, discouraged, irritated, stressed, and annoyed were you?" },
];

// Manipulation check removed from main experiment — only used in pilot study.

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
  const { participantId, conditionId, taskOrder } = useStore();
  const isNoAi = conditionId === "no_ai";

  // ── Attention check state ────────────────────────────────────
  const [attentionCheck, setAttentionCheck] = useState<{
    question: string;
    options: string[];
    correctIndex: number;
  } | null>(null);
  const [attentionAnswer, setAttentionAnswer] = useState<number | null>(null);
  const [attentionLoaded, setAttentionLoaded] = useState(false);

  // Fetch task prompt to build dynamic attention check
  useEffect(() => {
    if (!participantId) return;
    api.getTaskPrompt(participantId, round).then((result) => {
      const check = buildAttentionCheck(result.task_type, result.prompt);
      setAttentionCheck(check);
      setAttentionLoaded(true);
    }).catch(() => {
      // If prompt fetch fails, skip attention check
      setAttentionLoaded(true);
    });
  }, [participantId, round]);

  // Order: attention check → control variables (NASA-TLX) → DVs (SMI, CSE, Ownership)
  const BLOCKS = [
    ...(attentionCheck ? [{ id: "attention_check", title: "Quick check", items: [] as typeof LOAD_ITEMS }] : []),
    { id: "load", title: "Cognitive load", items: LOAD_ITEMS },
    { id: "smi_aw",  title: "Awareness",         items: SMI_AWARENESS },
    { id: "smi_cs",  title: "Cognitive strategy", items: SMI_COGNITIVE_STRATEGY },
    { id: "smi_pl",  title: "Planning",           items: SMI_PLANNING },
    { id: "smi_sc",  title: "Self-checking",      items: SMI_SELF_CHECKING },
    {
      id: "cse",
      title: "Creative confidence",
      items: CSE_ITEMS,
    },
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

  const activeBlocks = BLOCKS;

  const currentBlock = activeBlocks[block];
  const isAttentionBlock = currentBlock.id === "attention_check";
  const allAnswered = isAttentionBlock
    ? attentionAnswer !== null
    : currentBlock.items.every((it) => responses[it.key] != null);

  const handleNext = async () => {
    if (block < activeBlocks.length - 1) {
      setBlock((b) => b + 1);
      return;
    }
    setLoading(true);
    const startedAt = startTime.current ?? Date.now();
    const elapsed = (Date.now() - startedAt) / 1000;

    // Include attention check result in responses
    const allResponses: Record<string, unknown> = { ...responses };
    if (attentionCheck && attentionAnswer !== null) {
      allResponses.attention_check_answer = attentionCheck.options[attentionAnswer];
      allResponses.attention_check_correct = attentionAnswer === attentionCheck.correctIndex;
    }

    if (participantId) {
      await api.savePostTask(participantId, round, allResponses, elapsed);
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
              {isAttentionBlock
                ? "Before we begin, a quick question about the task you just completed."
                : currentBlock.id.startsWith("smi_")
                ? "Answer the questions below in relation to the task you just completed."
                : "Please answer based on the task you just completed."}
            </p>
            <h2 className="text-xl font-semibold text-[var(--warm-brown)]">{currentBlock.title}</h2>
          </div>

          <div className="space-y-6">
            {isAttentionBlock && attentionCheck ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--warm-brown)] leading-relaxed">
                  {attentionCheck.question}
                </p>
                <div className="space-y-2">
                  {attentionCheck.options.map((option, idx) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAttentionAnswer(idx)}
                      className={`w-full text-left rounded-xl px-4 py-3 text-sm transition-all border ${
                        attentionAnswer === idx
                          ? "bg-[var(--sage-light)]/40 border-[var(--sage)] text-[var(--warm-brown)] font-medium"
                          : "bg-white/40 border-[var(--sage-light)]/30 text-[var(--warm-gray)] hover:bg-white/60"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              currentBlock.items.map((item) => (
                <LikertScale
                  key={item.key}
                  name={item.key}
                  label={item.label}
                  value={responses[item.key] ?? null}
                  onChange={(val) => setResponses((r) => ({ ...r, [item.key]: val }))}
                  {...(currentBlock.id.startsWith("smi_") ? {
                    points: 4,
                    lowLabel: "Not at all",
                    highLabel: "Very much so",
                  } : currentBlock.id === "load" ? {
                    points: 7,
                    ...(item.key === "tlx_performance"
                      ? { lowLabel: "Perfect", highLabel: "Failure" }
                      : { lowLabel: "Very low", highLabel: "Very high" }),
                  } : {})}
                />
              ))
            )}
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
