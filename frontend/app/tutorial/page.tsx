"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  MessageSquare,
  PenLine,
  BookOpen,
  Send,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// ── Tutorial steps ──────────────────────────────────────────

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  region: "overview" | "left-panel" | "chat-input" | "right-top" | "right-bottom" | "timer";
}

const STEPS: TutorialStep[] = [
  {
    id: "overview",
    title: "Your workspace",
    description:
      "This is the interface you will use for each task. It has two main areas: a support panel on the left and your writing space on the right. Let's walk through each part.",
    region: "overview",
  },
  {
    id: "left-panel",
    title: "Support panel",
    description:
      "This panel may provide guidance or suggestions while you work. You decide what to use, adapt, or ignore — the final response is always yours.",
    region: "left-panel",
  },
  {
    id: "chat-input",
    title: "Chat input",
    description:
      "If a chatbot is available, type your message here and press the send button or Enter key to interact with it.",
    region: "chat-input",
  },
  {
    id: "task-prompt",
    title: "Task instructions",
    description:
      "This card shows the task you need to complete. Read the instructions and any provided keywords carefully before you start writing.",
    region: "right-top",
  },
  {
    id: "writing-area",
    title: "Your answer",
    description:
      "Write your response here. You need at least 80 characters. When you are satisfied with your answer, click the submit button at the bottom.",
    region: "right-bottom",
  },
  {
    id: "timer",
    title: "Time limit",
    description:
      "Each task has a 5-minute countdown. When time runs out you can still submit your current work — so don't worry if you need a moment longer.",
    region: "timer",
  },
];

// ── Page component ──────────────────────────────────────────

export default function TutorialPage() {
  const router = useRouter();
  const participantId = useStore((s) => s.participantId);
  const isPilot = useStore((s) => s.isPilot);
  const [step, setStep] = useState(0);
  const [overlayRect, setOverlayRect] = useState<DOMRect | null>(null);

  // Refs for each highlightable region
  const refs = {
    "left-panel": useRef<HTMLDivElement>(null),
    "chat-input": useRef<HTMLDivElement>(null),
    "right-top": useRef<HTMLDivElement>(null),
    "right-bottom": useRef<HTMLDivElement>(null),
    timer: useRef<HTMLDivElement>(null),
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isOverview = current.region === "overview";

  // Calculate highlight rect
  const updateRect = useCallback(() => {
    if (isOverview) {
      setOverlayRect(null);
      return;
    }
    const ref = refs[current.region as keyof typeof refs];
    if (ref?.current) {
      setOverlayRect(ref.current.getBoundingClientRect());
    }
  }, [step, isOverview]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [updateRect]);

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

  // Overlay with cutout
  const pad = 8;
  const radius = 16;

  return (
    <div className="healing-bg min-h-screen flex flex-col px-4 py-6 gap-4 relative">
      {/* ── Overview dim overlay ── */}
      {isOverview && (
        <div className="fixed inset-0 z-40 bg-black/30 pointer-events-none transition-opacity duration-300" />
      )}

      {/* ── Dark overlay with cutout ── */}
      {!isOverview && overlayRect && (
        <div
          className="fixed inset-0 z-40 pointer-events-none transition-all duration-300"
          style={{
            background: `rgba(0,0,0,0.45)`,
            clipPath: `polygon(
              0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
              ${overlayRect.left - pad}px ${overlayRect.top - pad}px,
              ${overlayRect.left - pad}px ${overlayRect.bottom + pad}px,
              ${overlayRect.right + pad}px ${overlayRect.bottom + pad}px,
              ${overlayRect.right + pad}px ${overlayRect.top - pad}px,
              ${overlayRect.left - pad}px ${overlayRect.top - pad}px
            )`,
          }}
        />
      )}

      {/* ── Highlight border ring ── */}
      {!isOverview && overlayRect && (
        <motion.div
          className="fixed z-50 pointer-events-none border-2 border-[var(--lavender)] shadow-lg shadow-[var(--lavender)]/20"
          initial={false}
          animate={{
            left: overlayRect.left - pad,
            top: overlayRect.top - pad,
            width: overlayRect.width + pad * 2,
            height: overlayRect.height + pad * 2,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ borderRadius: radius }}
        />
      )}

      {/* ── Floating tooltip card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed z-50 ${isOverview || !overlayRect ? "inset-0 flex items-center justify-center pointer-events-none" : ""}`}
          style={
            isOverview || !overlayRect
              ? {}
              : (() => {
                  const tooltipH = 200;
                  const tooltipW = 336;
                  const gap = 16;
                  const vh = window.innerHeight;
                  const vw = window.innerWidth;
                  // Clamp top so tooltip stays in viewport
                  const clampTop = (t: number) => Math.min(Math.max(16, t), vh - tooltipH - 16);

                  // Prefer right side
                  if (overlayRect.right + gap + tooltipW < vw) {
                    return { left: overlayRect.right + gap, top: clampTop(overlayRect.top) };
                  }
                  // Fallback left side
                  if (overlayRect.left - gap - tooltipW > 0) {
                    return { left: overlayRect.left - gap - tooltipW, top: clampTop(overlayRect.top) };
                  }
                  // Fallback above
                  if (overlayRect.top - gap - tooltipH > 0) {
                    return { left: "50%", transform: "translateX(-50%)", top: overlayRect.top - gap - tooltipH };
                  }
                  // Fallback below
                  return { left: "50%", transform: "translateX(-50%)", top: overlayRect.bottom + gap };
                })()
          }
        >
          <div className={`glass-card p-5 space-y-3 shadow-xl pointer-events-auto ${isOverview ? "w-96" : "w-80"}`}>
            <div>
              <p className="text-xs font-medium text-[var(--lavender)] uppercase tracking-wide mb-0.5">
                Step {step + 1} of {STEPS.length}
              </p>
              <h3 className="text-base font-semibold text-[var(--warm-brown)]">
                {current.title}
              </h3>
              <p className="text-sm text-[var(--warm-gray)] leading-relaxed mt-1">
                {current.description}
              </p>
            </div>

            <div className="flex gap-2 justify-between">
            <Button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              size="sm"
              variant="secondary"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </Button>

            {isLast ? (
              <Button
                onClick={handleFinish}
                size="sm"
                className="flex items-center gap-1"
              >
                Got it
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                size="sm"
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Mock workspace layout ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex-1 flex min-h-0 flex-col gap-4 w-full max-w-[1400px] mx-auto"
      >
        {/* Progress-like header */}
        <div className="glass-card px-4 py-2.5 flex-shrink-0">
          <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
            Quick tour — preview of the task workspace
          </p>
        </div>

        {/* Two-column grid */}
        <div className="flex-1 min-h-0 grid gap-4 grid-cols-1 lg:grid-cols-[3fr_2fr] lg:h-[calc(100vh-160px)]">
          {/* ── Left column ── */}
          <div className="flex min-h-0 flex-col gap-4">
            {/* AI panel mock */}
            <div
              ref={refs["left-panel"]}
              className="glass-card flex flex-col overflow-hidden flex-1"
            >
              <div className="px-4 pt-4 pb-2 border-b border-[var(--sage-light)]/20 flex-shrink-0">
                <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                  Support Panel
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
                ref={refs["chat-input"]}
                className="flex gap-2 items-end p-3 border-t border-[var(--sage-light)]/20 flex-shrink-0"
              >
                <div className="flex-1 rounded-2xl bg-white/60 border border-[var(--sage-light)]/40 px-3 py-2 text-sm text-[var(--warm-gray)]/50">
                  Ask for creative suggestions…
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--lavender-light)] text-[var(--lavender)] opacity-30">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Timer mock */}
            <div
              ref={refs.timer}
              className="glass-card p-5 flex-shrink-0"
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
              ref={refs["right-top"]}
              className="glass-card p-5 space-y-3 flex-shrink-0"
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
              ref={refs["right-bottom"]}
              className="glass-card p-6 flex flex-col flex-1 space-y-4 min-h-0"
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
      </motion.div>
    </div>
  );
}
