"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

const PILOT_CONDITIONS = [
  {
    id: "basic_ai",
    title: "Basic AI",
    desc: "AI suggestions shown as chat bubbles. No friction or challenge.",
  },
  {
    id: "friction",
    title: "Friction",
    desc: "AI suggestions shown; inline reflection card appears at 40 chars. No challenge.",
  },
  {
    id: "provocateur",
    title: "Provocateur",
    desc: "AI challenge panel with risk → alternative → question flow. No friction.",
  },
] as const;

type PilotCondition = (typeof PILOT_CONDITIONS)[number]["id"];

export default function DebugPilotPage() {
  const router = useRouter();
  const setParticipant = useStore((s) => s.setParticipant);
  const [loading, setLoading] = useState<PilotCondition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const launchCondition = async (condition: PilotCondition) => {
    if (loading) return;

    setLoading(condition);
    setError(null);

    try {
      const data = await api.initParticipant(condition, true);

      setParticipant({
        participantId: data.participant_id,
        conditionId: data.condition_id,
        provocateurFlag: data.provocateur_flag,
        frictionFlag: data.friction_flag,
        taskOrder: data.task_order,
        isPilot: true,
      });

      await api.recordConsent(data.participant_id);
      await api.updateProgress(data.participant_id, "task/1/brief");
      router.push("/task/1/brief");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create a test participant.");
      setLoading(null);
    }
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-3xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-[var(--warm-brown)]">Pilot Condition Launcher</h1>
          <p className="text-sm text-[var(--warm-gray)]">
            Choose a pilot condition below to create a test participant and jump directly into the first task.
            Pilot mode: no post-task surveys, ends with a 2-question manipulation check.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PILOT_CONDITIONS.map((condition) => (
            <div key={condition.id} className="glass-card p-5 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-[var(--warm-brown)]">{condition.title}</h2>
                <p className="text-sm text-[var(--warm-gray)] leading-relaxed">{condition.desc}</p>
              </div>

              <Button
                onClick={() => launchCondition(condition.id)}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === condition.id ? "Launching..." : `Open ${condition.title}`}
              </Button>
            </div>
          ))}
        </div>

        {error && (
          <div className="glass-card p-4 border border-red-200/60 bg-red-50/60">
            <p className="text-sm text-red-700 break-all">{error}</p>
          </div>
        )}

        <div className="text-center">
          <a href="/debug/conditions" className="text-xs text-[var(--warm-gray)] underline underline-offset-2 hover:text-[var(--warm-brown)] transition-colors">
            Switch to full experiment conditions
          </a>
        </div>
      </motion.div>
    </div>
  );
}
