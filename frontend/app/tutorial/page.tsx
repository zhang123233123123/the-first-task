"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  MessageSquare,
  PenLine,
  Clock,
  BookOpen,
  Send,
  ChevronRight,
  ChevronLeft,
  MousePointerClick,
} from "lucide-react";

// ── Tutorial steps ──────────────────────────────────────────

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  highlight: "left" | "right-top" | "right-bottom" | "timer" | "overview" | "chat-input";
}

const STEPS: TutorialStep[] = [
  {
    id: "overview",
    title: "Your workspace",
    description:
      "This is the interface you will use for each task. Take a moment to familiarise yourself with the layout before you begin.",
    highlight: "overview",
  },
  {
    id: "left-panel",
    title: "Left panel — AI Assistant",
    description:
      "This panel provides support while you work. Depending on the task, you may see suggestions, prompts for reflection, or a chatbot. You decide what to use, adapt, or ignore.",
    highlight: "left",
  },
  {
    id: "chat-input",
    title: "Chat input",
    description:
      "If a chatbot is available, type your message here and press the send button (or Enter) to interact with it.",
    highlight: "chat-input",
  },
  {
    id: "task-prompt",
    title: "Right panel — Task instructions",
    description:
      "The top of the right panel shows the task instructions. Read them carefully before you start writing.",
    highlight: "right-top",
  },
  {
    id: "writing-area",
    title: "Right panel — Your answer",
    description:
      "Write your response in the text area below the instructions. When you are satisfied, click the submit button.",
    highlight: "right-bottom",
  },
  {
    id: "timer",
    title: "Timer",
    description:
      "Each task has a 5-minute time limit shown in the bottom-left. When time runs out, you can still submit your current work.",
    highlight: "timer",
  },
];

// ── Highlight ring style helper ─────────────────────────────

function highlightClass(
  region: TutorialStep["highlight"],
  active: TutorialStep["highlight"]
) {
  const base = "transition-all duration-300 rounded-2xl";
  if (active === "overview") return base; // no ring in overview step
  if (region === active)
    return `${base} ring-2 ring-[var(--lavender)] ring-offset-2 ring-offset-[var(--cream)] z-10 relative`;
  return `${base} opacity-40 pointer-events-none`;
}

// ── Page component ──────────────────────────────────────────

export default function TutorialPage() {
  const router = useRouter();
  const participantId = useStore((s) => s.participantId);
  const isPilot = useStore((s) => s.isPilot);
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleFinish = async () => {
    if (isPilot) {
      if (participantId) {
        await api.updateProgress(participantId, "task/1/brief");
      }
      router.push("/task/1/brief");
    } else {
      if (participantId) {
        await api.updateProgress(participantId, "baseline");
      }
      router.push("/baseline");
    }
  };

  return (
    <div className="healing-bg min-h-screen flex flex-col px-4 py-6 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex-1 flex min-h-0 flex-col gap-4 w-full max-w-[1400px] mx-auto"
      >
        {/* ── Step indicator + instruction strip ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="glass-card p-4 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-[var(--lavender-light)]">
              <MousePointerClick className="w-5 h-5 text-[var(--lavender)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide mb-0.5">
                Quick tour — step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-base font-semibold text-[var(--warm-brown)]">
                {current.title}
              </h2>
              <p className="text-sm text-[var(--warm-gray)] leading-relaxed mt-0.5">
                {current.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Mock workspace layout ── */}
        <div className="flex-1 min-h-0 grid gap-4 grid-cols-1 lg:grid-cols-[3fr_2fr] lg:h-[calc(100vh-260px)]">
          {/* ── Left column ── */}
          <div className="flex min-h-0 flex-col gap-4">
            {/* AI panel mock */}
            <div
              className={`glass-card flex flex-col overflow-hidden flex-1 ${highlightClass(
                "left",
                current.highlight
              )}`}
            >
              <div className="px-4 pt-4 pb-2 border-b border-[var(--sage-light)]/20 flex-shrink-0">
                <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                  AI Assistant
                </p>
              </div>

              <div className="px-4 py-2 bg-[var(--sage-light)]/10 border-b border-[var(--sage-light)]/20 flex-shrink-0 space-y-0.5">
                <p className="text-xs text-[var(--warm-gray)]/80 leading-relaxed">
                  <span className="font-medium text-[var(--warm-gray)]">This panel</span>
                  {" — AI suggestions. Use the box below to ask follow-up questions."}
                </p>
                <p className="text-xs text-[var(--warm-gray)]/80 leading-relaxed">
                  <span className="font-medium text-[var(--warm-gray)]">Right panel</span>
                  {" — task instructions (top) and your answer space (bottom)."}
                </p>
              </div>

              <div className="flex-1 p-4 flex flex-col items-center justify-center gap-3 text-center px-4">
                <MessageSquare className="w-8 h-8 text-[var(--sage-light)]" />
                <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                  Send a message below to get suggestions for your task.
                </p>
              </div>

              {/* Chat input mock */}
              <div
                className={`flex gap-2 items-end p-3 border-t border-[var(--sage-light)]/20 flex-shrink-0 ${
                  current.highlight === "chat-input"
                    ? "ring-2 ring-[var(--lavender)] ring-offset-1 ring-offset-[var(--cream)] rounded-b-2xl z-10 relative"
                    : ""
                }`}
              >
                <div className="flex-1 rounded-2xl bg-white/60 border border-[var(--sage-light)]/40 px-3 py-2 text-sm text-[var(--warm-gray)]/50">
                  Ask AI for creative suggestions…
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--lavender-light)] text-[var(--lavender)] opacity-30">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Timer mock */}
            <div
              className={`glass-card p-5 flex-shrink-0 ${highlightClass(
                "timer",
                current.highlight
              )}`}
            >
              <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide mb-2">
                Time Limit
              </p>
              <p className="text-4xl font-bold tabular-nums tracking-tight text-[var(--warm-brown)]">
                05:00
              </p>
              <p className="text-xs text-[var(--warm-gray)] mt-1">remaining</p>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex min-h-0 flex-col gap-4 overflow-hidden lg:h-full">
            {/* Task prompt mock */}
            <div
              className={`glass-card p-5 space-y-3 flex-shrink-0 ${highlightClass(
                "right-top",
                current.highlight
              )}`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--sage)]" />
                <div>
                  <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                    Task (demo)
                  </p>
                  <p className="text-sm font-semibold text-[var(--warm-brown)]">
                    Task instruction
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["sunshine", "bridge", "whisper"].map((word) => (
                  <span
                    key={word}
                    className="px-3 py-1 rounded-xl bg-[var(--sage-light)]/30 text-[var(--sage-dark)] text-sm font-medium"
                  >
                    {word}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                Write a short creative story (3–5 sentences) that includes all three words above.
                This is just a demo — you will not need to submit this.
              </p>
            </div>

            {/* Writing area mock */}
            <div
              className={`glass-card p-6 flex flex-col flex-1 space-y-4 min-h-0 ${highlightClass(
                "right-bottom",
                current.highlight
              )}`}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                <PenLine className="w-4 h-4 text-[var(--sage)]" />
                <h2 className="text-base font-semibold text-[var(--warm-brown)]">
                  Write your story
                </h2>
              </div>
              <div className="relative flex-1 flex flex-col">
                <div className="flex-1 w-full rounded-2xl bg-white/80 border border-[var(--sage-light)]/40 px-5 py-4 text-sm text-[var(--warm-gray)]/50 leading-relaxed">
                  Write your story here…
                </div>
                <div className="absolute bottom-3 right-4 text-xs text-[var(--warm-gray)]/60">
                  0 / 80+ characters
                </div>
              </div>
              <div className="w-full rounded-2xl bg-[var(--sage-light)]/40 text-center py-3 text-sm font-medium text-[var(--warm-gray)]/60">
                Submit and continue
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation buttons ── */}
        <div className="flex gap-3 justify-between flex-shrink-0">
          <Button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            size="md"
            variant="secondary"
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {isLast ? (
            <Button
              onClick={handleFinish}
              size="md"
              className="flex items-center gap-1"
            >
              Got it — continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              size="md"
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
