"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";
import { Layers } from "lucide-react";

const WEAKNESS_OPTIONS = [
  "Too generic",
  "Too predictable",
  "Emotionally flat",
  "Inconsistent",
  "Too similar to common AI output",
  "Other",
];

const STRATEGY_OPTIONS = [
  "Combine ideas",
  "Invert the assumption",
  "Add a constraint",
  "Change point of view",
  "Deepen the conflict",
  "Other",
];

interface FrictionGateProps {
  visible: boolean;
  taskType: "story" | "metaphor";
  requireIdeaSelection?: boolean;
  onComplete: (responses: {
    selected_idea: number | null;
    weakness: string;
    strategy: string;
    dwell_seconds: number;
  }) => void;
}

export function FrictionGate({
  visible,
  taskType,
  requireIdeaSelection = true,
  onComplete,
}: FrictionGateProps) {
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [weakness, setWeakness] = useState("");
  const [strategy, setStrategy] = useState("");
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (visible) startTime.current = Date.now();
  }, [visible]);

  const canSubmit = (!requireIdeaSelection || selectedIdea !== null) && weakness !== "" && strategy !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    const dwell_seconds = (Date.now() - (startTime.current ?? Date.now())) / 1000;
    onComplete({ selected_idea: selectedIdea, weakness, strategy, dwell_seconds });
  };

  const weaknessLabel = requireIdeaSelection
    ? taskType === "metaphor"
      ? "main weakness in that direction"
      : "main problem with this idea"
    : taskType === "metaphor"
    ? "main weakness in your current approach"
    : "main problem in your current direction";
  const strategyLabel = requireIdeaSelection
    ? taskType === "metaphor"
      ? "revision strategy"
      : "next step"
    : taskType === "metaphor"
    ? "revision strategy"
    : "next step";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: "rgba(255,248,242,0.55)" }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="liquid-glass rounded-3xl p-8 w-full max-w-lg space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--lavender-light)] flex items-center justify-center">
                <Layers className="w-5 h-5 text-[var(--lavender)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--warm-brown)]">Take a moment</h2>
                <p className="text-xs text-[var(--warm-gray)]">Before moving on, reflect on your current direction</p>
              </div>
            </div>

            {requireIdeaSelection && (
              <div className="space-y-2.5">
                <p className="text-sm font-medium text-[var(--warm-brown)]">
                  1. Which direction looks most promising?
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSelectedIdea(n)}
                      className={`
                        flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150
                        ${selectedIdea === n
                          ? "bg-[var(--sage)] text-white border-[var(--sage)]"
                          : "bg-white/50 text-[var(--warm-gray)] border-white/60 hover:border-[var(--sage-light)]"
                        }
                      `}
                    >
                      Direction {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-[var(--warm-brown)]">
                {requireIdeaSelection ? "2." : "1."} What is the {weaknessLabel}?
              </p>
              <div className="flex flex-wrap gap-2">
                {WEAKNESS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWeakness(opt)}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150
                      ${weakness === opt
                        ? "bg-[var(--peach)] text-[var(--warm-brown)] border-[var(--peach)]"
                        : "bg-white/50 text-[var(--warm-gray)] border-white/60 hover:border-[var(--peach-light)]"
                      }
                    `}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-[var(--warm-brown)]">
                {requireIdeaSelection ? "3." : "2."} What is your {strategyLabel}?
              </p>
              <div className="flex flex-wrap gap-2">
                {STRATEGY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStrategy(opt)}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150
                      ${strategy === opt
                        ? "bg-[var(--lavender-light)] text-[var(--warm-brown)] border-[var(--lavender)]"
                        : "bg-white/50 text-[var(--warm-gray)] border-white/60 hover:border-[var(--lavender-light)]"
                      }
                    `}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full"
              size="md"
            >
              Continue to writing
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
