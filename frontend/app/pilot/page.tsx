"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LikertScale } from "@/components/ui/LikertScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

type ResponseValue = string | number | string[] | null;

type BaselineItem =
  | { key: string; label: string; type: "scale"; points?: 5 | 7; lowLabel?: string; highLabel?: string }
  | { key: string; label: string; type: "select"; options: string[] };

type Block = { id: string; title: string; description: string; items: BaselineItem[] };

// Pilot baseline: consent + demographics only
const BLOCKS: Block[] = [
  {
    id: "consent",
    title: "Informed Consent",
    description:
      "You will complete two short creative writing tasks and answer a few questions (approx. 15 minutes). Your participation is voluntary — you may withdraw at any time. No audio, video, or images will be captured. All responses are anonymous and used for academic research only. You may request data withdrawal within 14 days by contacting potteryhrr@gmail.com. By continuing, you confirm you are 18+ and agree to participate.",
    items: [],
  },
  {
    id: "demographics",
    title: "Background Information",
    description: "The following questions are for research background purposes only.",
    items: [
      {
        key: "demo_age",
        label: "What is your age?",
        type: "select",
        options: ["18-24", "25-34", "35-44", "45-54", "55-64", "65 or older", "Prefer not to say"],
      },
      {
        key: "demo_gender",
        label: "What is your gender?",
        type: "select",
        options: ["Female", "Male", "Prefer not to say"],
      },
      {
        key: "demo_education",
        label: "What is your highest level of completed education?",
        type: "select",
        options: [
          "Less than high school",
          "High school or equivalent",
          "Some college",
          "Associate degree",
          "Bachelor's degree",
          "Master's degree",
          "Doctoral or professional degree",
          "Prefer not to say",
        ],
      },
      {
        key: "demo_english",
        label: "What is your English proficiency level?",
        type: "select",
        options: ["Beginner", "Proficient", "Advanced", "Native speaker", "Prefer not to say"],
      },
    ],
  },
];

function isAnswered(value: ResponseValue) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== "";
}

export default function PilotEntryPage() {
  const router = useRouter();
  const setParticipant = useStore((s) => s.setParticipant);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [block, setBlock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const currentBlock = BLOCKS[block];
  const isConsentBlock = currentBlock.id === "consent";
  const allAnswered = isConsentBlock || currentBlock.items.every((item) => isAnswered(responses[item.key] ?? null));

  const setValue = (key: string, value: ResponseValue) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (block < BLOCKS.length - 1) {
      setBlock((prev) => prev + 1);
      return;
    }

    // Submit: create participant and go to task 1
    setLoading(true);
    setError(null);
    try {
      const result = await api.initParticipant(undefined, true);
      const pid = result.participant_id;
      await api.recordConsent(pid);

      // Save demographics as baseline
      const elapsed = (Date.now() - (startTime.current ?? Date.now())) / 1000;
      const assignResult = await api.saveBaseline(pid, responses as Record<string, unknown>, elapsed, true);

      setParticipant({
        participantId: pid,
        conditionId: assignResult.condition_id ?? null,
        provocateurFlag: assignResult.provocateur_flag ?? false,
        frictionFlag: assignResult.friction_flag ?? false,
        taskOrder: assignResult.task_order ?? [],
        isPilot: true,
      });

      await api.updateProgress(pid, "task/1/brief");
      router.push("/task/1/brief");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={block}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-xl space-y-6"
        >
          <ProgressBar step={block + 1} total={BLOCKS.length} label="Study setup" />

          <div className="glass-card p-7 space-y-6">
            <div>
              <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide mb-1">
                Step {block + 1} of {BLOCKS.length}
              </p>
              <h2 className="text-xl font-semibold text-[var(--warm-brown)]">{currentBlock.title}</h2>
              <p className="text-sm text-[var(--warm-gray)] mt-1 leading-relaxed">{currentBlock.description}</p>
            </div>

            <div className="space-y-6">
              {currentBlock.items.map((item) => {
                if (item.type === "scale") {
                  return (
                    <LikertScale
                      key={item.key}
                      name={item.key}
                      label={item.label}
                      value={typeof responses[item.key] === "number" ? (responses[item.key] as number) : null}
                      onChange={(val) => setValue(item.key, val)}
                      points={item.points}
                      lowLabel={item.lowLabel}
                      highLabel={item.highLabel}
                    />
                  );
                }
                if (item.type === "select") {
                  return (
                    <div key={item.key} className="space-y-2">
                      <label className="text-sm text-[var(--warm-brown)] leading-relaxed">{item.label}</label>
                      <select
                        value={String(responses[item.key] ?? "")}
                        onChange={(e) => setValue(item.key, e.target.value === "" ? null : e.target.value)}
                        className="w-full rounded-2xl bg-white/60 border border-[var(--sage-light)]/40 px-4 py-3 text-sm text-[var(--warm-brown)] focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/40"
                      >
                        <option value="">Select an option</option>
                        {item.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50/60 rounded-xl px-4 py-2">{error}</p>
            )}

            <Button
              onClick={handleNext}
              disabled={!allAnswered || loading}
              size="md"
              className="w-full"
            >
              {isConsentBlock
                ? "I agree — continue"
                : block < BLOCKS.length - 1
                ? "Next"
                : loading
                ? "Starting..."
                : "Begin the tasks"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
