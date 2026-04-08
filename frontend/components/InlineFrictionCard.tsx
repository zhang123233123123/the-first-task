"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { Button } from "./ui/Button";

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

interface InlineFrictionCardProps {
  taskType: "story" | "metaphor";
  requireIdeaSelection: boolean;
  suggestionCount?: number;
  weaknessOptions?: string[];
  strategyOptions?: string[];
  loading?: boolean;
  onComplete: (responses: {
    selected_idea: number | null;
    weakness: string;
    strategy: string;
    dwell_seconds: number;
  }) => void;
}

export function InlineFrictionCard({
  taskType,
  requireIdeaSelection,
  suggestionCount = 3,
  weaknessOptions,
  strategyOptions,
  loading = false,
  onComplete,
}: InlineFrictionCardProps) {
  const resolvedWeaknessOptions = weaknessOptions ?? WEAKNESS_OPTIONS;
  const resolvedStrategyOptions = strategyOptions ?? STRATEGY_OPTIONS;
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [weakness, setWeakness] = useState("");
  const [strategy, setStrategy] = useState("");
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const canSubmit =
    (!requireIdeaSelection || selectedIdea !== null) &&
    weakness !== "" &&
    strategy !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    const dwell_seconds = (Date.now() - startTime.current) / 1000;
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-[var(--lavender)]/30 bg-[var(--lavender-light)]/25 p-4 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[var(--lavender-light)] flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4 text-[var(--lavender)]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--warm-brown)]">Take a moment</h3>
          <p className="text-xs text-[var(--warm-gray)]">
            Reflect on your current direction before continuing
          </p>
        </div>
      </div>

      {requireIdeaSelection && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--warm-brown)]">
            1. Which direction looks most promising?
          </p>
          <div className="flex gap-2">
            {Array.from({ length: suggestionCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedIdea(n)}
                className={`
                  flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-150
                  ${
                    selectedIdea === n
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

      <div className="space-y-2">
        <p className="text-xs font-medium text-[var(--warm-brown)]">
          {requireIdeaSelection ? "2." : "1."} What is the {weaknessLabel}?
        </p>
        {loading ? (
          <div className="flex flex-wrap gap-1.5">
            {[80, 64, 96, 72, 48].map((w) => (
              <div key={w} className="h-6 rounded-xl bg-white/40 animate-pulse" style={{ width: `${w}px` }} />
            ))}
          </div>
        ) : (
        <div className="flex flex-wrap gap-1.5">
          {resolvedWeaknessOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWeakness(opt)}
              className={`
                px-2.5 py-1 rounded-xl text-xs font-medium border transition-all duration-150
                ${
                  weakness === opt
                    ? "bg-[var(--peach)] text-[var(--warm-brown)] border-[var(--peach)]"
                    : "bg-white/50 text-[var(--warm-gray)] border-white/60 hover:border-[var(--peach-light)]"
                }
              `}
            >
              {opt}
            </button>
          ))}
        </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-[var(--warm-brown)]">
          {requireIdeaSelection ? "3." : "2."} What is your {strategyLabel}?
        </p>
        {loading ? (
          <div className="flex flex-wrap gap-1.5">
            {[72, 88, 60, 96, 56].map((w) => (
              <div key={w} className="h-6 rounded-xl bg-white/40 animate-pulse" style={{ width: `${w}px` }} />
            ))}
          </div>
        ) : (
        <div className="flex flex-wrap gap-1.5">
          {resolvedStrategyOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setStrategy(opt)}
              className={`
                px-2.5 py-1 rounded-xl text-xs font-medium border transition-all duration-150
                ${
                  strategy === opt
                    ? "bg-[var(--lavender-light)] text-[var(--warm-brown)] border-[var(--lavender)]"
                    : "bg-white/50 text-[var(--warm-gray)] border-white/60 hover:border-[var(--lavender-light)]"
                }
              `}
            >
              {opt}
            </button>
          ))}
        </div>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full" size="sm">
        Continue writing
      </Button>
    </motion.div>
  );
}
