"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LikertScale } from "@/components/ui/LikertScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

// Pilot manipulation check — 2 questions only
const MC_ITEMS = [
  {
    key: "mc_friction",
    label: "The system made me pause and reflect before proceeding.",
  },
  {
    key: "mc_provocation",
    label: "The AI challenged my thinking rather than simply helping me complete the task.",
  },
];

export default function PilotCheckPage() {
  const router = useRouter();
  const { participantId } = useStore();
  const [responses, setResponses] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = Date.now();
    if (!participantId) router.replace("/pilot");
  }, [participantId, router]);

  const allAnswered = MC_ITEMS.every((it) => responses[it.key] != null);

  const handleSubmit = async () => {
    setLoading(true);
    const elapsed = (Date.now() - (startTime.current ?? Date.now())) / 1000;
    if (participantId) {
      // Save as post-task response for round 0 (pilot check)
      await api.savePostTask(participantId, 0, { ...responses, pilot_check: true } as Record<string, unknown>, elapsed);
      await api.completeStudy(participantId);
    }
    router.push("/pilot/complete");
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl space-y-6"
      >
        <ProgressBar step={5} total={5} label="Final questions" />

        <div className="glass-card p-7 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--warm-brown)]">
              About your experience
            </h2>
            <p className="text-sm text-[var(--warm-gray)] mt-1 leading-relaxed">
              Please reflect on the two tasks you just completed and indicate how strongly you agree or disagree with each statement.
            </p>
          </div>

          <div className="space-y-6">
            {MC_ITEMS.map((item) => (
              <LikertScale
                key={item.key}
                name={item.key}
                label={item.label}
                value={responses[item.key] ?? null}
                onChange={(val) => setResponses((r) => ({ ...r, [item.key]: val }))}
                lowLabel="Strongly disagree"
                highLabel="Strongly agree"
              />
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || loading}
            size="md"
            className="w-full"
          >
            {loading ? "Submitting..." : "Submit and finish"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
