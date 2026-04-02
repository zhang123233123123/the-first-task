"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

const CONDITIONS = [
  {
    id: "no_ai",
    title: "No AI",
    desc: "Control condition. No AI suggestions or interventions. Writing area only.",
  },
  {
    id: "basic_ai",
    title: "Basic AI",
    desc: "AI suggestions shown as chat bubbles. No friction reflection or challenge.",
  },
  {
    id: "provocateur",
    title: "Provocateur only",
    desc: "AI challenge chat panel with risk → alternative → question flow. No friction.",
  },
  {
    id: "friction",
    title: "Friction only",
    desc: "AI suggestions shown; inline reflection card appears at 40 chars. No challenge.",
  },
  {
    id: "prov_then_fric",
    title: "Prov → Fric (combined)",
    desc: "Provocation appears at load; inline friction card triggers at 80 chars.",
  },
  {
    id: "fric_then_prov",
    title: "Fric → Prov (combined)",
    desc: "Friction card triggers at 40 chars; provocation starts after reflection done.",
  },
] as const;

type Condition = (typeof CONDITIONS)[number]["id"];

export default function DebugConditionsPage() {
  const router = useRouter();
  const setParticipant = useStore((s) => s.setParticipant);
  const [loading, setLoading] = useState<Condition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const launchCondition = async (condition: Condition) => {
    if (loading) return;

    setLoading(condition);
    setError(null);

    try {
      const data = await api.initParticipant(condition);

      setParticipant({
        participantId: data.participant_id,
        conditionId: data.condition_id,
        provocateurFlag: data.provocateur_flag,
        frictionFlag: data.friction_flag,
        taskOrder: data.task_order,
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
          <h1 className="text-3xl font-semibold text-[var(--warm-brown)]">Condition Launcher</h1>
          <p className="text-sm text-[var(--warm-gray)]">
            Choose one condition below to create a test participant and jump directly into the first task workspace.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {CONDITIONS.map((condition) => (
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
      </motion.div>
    </div>
  );
}
