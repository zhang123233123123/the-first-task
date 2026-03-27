"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SuggestionCard } from "@/components/SuggestionCard";
import { FrictionGate } from "@/components/FrictionGate";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Sparkles } from "lucide-react";

interface Suggestion {
  id: number;
  suggestion: string;
  provocateur?: { risk: string; alternative: string; question: string };
}

interface SuggestionsData {
  task_type: string;
  prompt: Record<string, unknown>;
  suggestions: Suggestion[];
  provocateur_flag: boolean;
  friction_flag: boolean;
}

export default function SuggestionsPage({ params }: { params: Promise<{ round: string }> }) {
  const { round: roundStr } = use(params);
  const round = parseInt(roundStr, 10);

  const router = useRouter();
  const { participantId, taskOrder, setCurrentRound } = useStore();
  const [data, setData] = useState<SuggestionsData | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [gateCompleted, setGateCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewStart = useRef(Date.now());

  // Source of truth for conditions comes from the backend API response,
  // not the local store — this ensures conditions are always correctly applied
  // even after page refresh.
  const provocateurActive = data?.provocateur_flag ?? false;
  const frictionActive = data?.friction_flag ?? false;

  useEffect(() => {
    setCurrentRound(round);
  }, [round, setCurrentRound]);

  useEffect(() => {
    if (!participantId) return;
    setError(null);
    api.getSuggestions(participantId, round)
      .then((d) => setData(d as unknown as SuggestionsData))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [participantId, round]);

  const taskType = (data?.task_type ?? taskOrder[round - 1] ?? "story") as "story" | "metaphor";
  const prompt = data?.prompt as Record<string, unknown> | undefined;

  const handleContinue = () => {
    // Friction condition: must complete the reflection gate before proceeding
    if (frictionActive && !gateCompleted) {
      setShowGate(true);
      return;
    }
    if (participantId) {
      api.logEvent(participantId, round, { type: "suggestion_selected", suggestion_id: selected });
    }
    router.push(`/task/${round}/production`);
  };

  const handleGateComplete = async (gateResponses: Record<string, unknown>) => {
    setShowGate(false);
    setGateCompleted(true);
    if (participantId) {
      const dwell = (Date.now() - viewStart.current) / 1000;
      await api.saveGate(participantId, round, gateResponses, dwell);
    }
    router.push(`/task/${round}/production`);
  };

  if (loading) {
    return (
      <div className="healing-bg min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="flex items-center gap-2 text-[var(--warm-gray)] text-sm"
        >
          <Sparkles className="w-4 h-4 text-[var(--sage)]" />
          Generating suggestions…
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="healing-bg min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center space-y-3">
          <p className="text-[var(--warm-brown)] font-medium">Could not load suggestions</p>
          <p className="text-sm text-[var(--warm-gray)] break-all">{error}</p>
          <p className="text-xs text-[var(--warm-gray)]">
            Please make sure the backend is running and your DeepSeek API key is set in <code>backend/.env</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-2xl space-y-6"
      >
        <ProgressBar step={round === 1 ? 3 : 7} total={9} label={`Task ${round} of 2`} />

        {/* Task prompt */}
        <div className="glass-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
              {taskType === "story" ? "Short Story Task" : "Creative Metaphor Task"}
            </span>
          </div>

          {taskType === "story" && prompt && (
            <>
              <div className="flex gap-2 flex-wrap">
                {(prompt.cue_words as string[]).map((w) => (
                  <span
                    key={w}
                    className="px-3 py-1 rounded-xl bg-[var(--sage-light)]/30 text-[var(--sage-dark)] text-sm font-medium"
                  >
                    {w}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                {prompt.instruction as string}
              </p>
            </>
          )}

          {taskType === "metaphor" && prompt && (
            <>
              <p className="text-xl font-medium text-[var(--warm-brown)]">
                {prompt.metaphor_prompt as string}
              </p>
              <p className="text-sm text-[var(--warm-gray)]">{prompt.instruction as string}</p>
            </>
          )}
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <p className="text-sm text-[var(--warm-gray)] px-1">
            Here are some AI-generated directions to consider. Select one that interests you, then continue.
          </p>
          {(data?.suggestions ?? []).map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: s.id * 0.08 }}
            >
              <SuggestionCard
                id={s.id}
                suggestion={s.suggestion}
                provocateur={s.provocateur}
                showProvocateur={provocateurActive}
                selected={selected === s.id}
                onSelect={() => setSelected(s.id)}
              />
            </motion.div>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={selected === null}
          size="lg"
          className="w-full"
        >
          {frictionActive && !gateCompleted ? "Reflect & continue" : "Continue to writing"}
        </Button>
      </motion.div>

      {/* Friction gate — full-screen liquid glass overlay */}
      <FrictionGate
        visible={showGate}
        taskType={taskType}
        onComplete={handleGateComplete}
      />
    </div>
  );
}
