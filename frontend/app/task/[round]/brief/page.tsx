"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { BookOpen, Clock, PenLine } from "lucide-react";

export default function TaskBriefPage({ params }: { params: Promise<{ round: string }> }) {
  const { round: roundStr } = use(params);
  const round = parseInt(roundStr, 10);

  const router = useRouter();
  const { participantId, taskOrder, conditionId } = useStore();
  const [taskType, setTaskType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!participantId) {
      router.replace("/consent");
      return;
    }
    // Prefer store if available (avoids an extra API call)
    const storedType = taskOrder[round - 1];
    if (storedType) {
      setTaskType(storedType);
    } else {
      api.getTaskPrompt(participantId, round)
        .then((r) => setTaskType(r.task_type))
        .catch(() => setTaskType("story")); // fallback
    }
  }, [participantId, round, router, taskOrder]);

  const handleBegin = async () => {
    if (!participantId || loading) return;
    setLoading(true);
    await api.updateProgress(participantId, `task/${round}/suggestions`);
    router.push(`/task/${round}/suggestions`);
  };

  const isStory = taskType === "story";
  const taskLabel = isStory ? "Short Story Task" : "Creative Metaphor Task";
  const taskDesc = isStory
    ? "Write a creative short story of about 4–6 sentences using the prompt words provided."
    : "Complete a creative metaphor as imaginatively as you can.";

  // Resolve effective condition for this specific round (combined conditions switch each round)
  const effectiveCondition =
    conditionId === "prov_then_fric" ? (round === 1 ? "provocateur" : "friction")
    : conditionId === "fric_then_prov" ? (round === 1 ? "friction" : "provocateur")
    : conditionId;

  const systemDesc: Record<string, string> = {
    no_ai:       "Complete this task using your own ideas and creativity. No external suggestions will be provided.",
    basic_ai:    "AI-generated ideas will appear in the left panel. You can use them as a starting point, adapt them, or ignore them entirely. The final response is always yours.",
    provocateur: "A chatbot will appear in the left panel. It may challenge your assumptions or ask questions about your ideas. You decide how to respond and whether to incorporate any feedback.",
    friction:    "As you write, you may be asked to pause briefly and reflect on your current direction before continuing. This is a normal part of the task.",
  };
  const conditionHint = systemDesc[effectiveCondition ?? ""] ?? "The final response is always yours.";

  const progressStep = round === 1 ? 1 : 9;

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg space-y-6"
      >
        <ProgressBar step={progressStep} total={16} label={`Task ${round} of 2`} />

        <div className="glass-card p-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--sage-light)]/40 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[var(--sage-dark)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                Task {round} of 2
              </p>
              <h2 className="text-xl font-semibold text-[var(--warm-brown)]">
                {taskType ? taskLabel : "Loading…"}
              </h2>
            </div>
          </div>

          <p className="text-sm text-[var(--warm-gray)] leading-relaxed">{taskDesc}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--sage)]" />
                <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">Time limit</p>
              </div>
              <p className="text-sm font-semibold text-[var(--warm-brown)]">5 minutes</p>
              <p className="text-xs text-[var(--warm-gray)]">A timer will count down on screen.</p>
            </div>

            <div className="glass-card p-4 space-y-1">
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-[var(--lavender)]" />
                <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">Your work</p>
              </div>
              <p className="text-sm font-semibold text-[var(--warm-brown)]">At least 80 characters</p>
              <p className="text-xs text-[var(--warm-gray)]">The final response is always yours.</p>
            </div>
          </div>

          <div className="glass-card p-4">
            <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
              {conditionHint}
            </p>
          </div>

          <Button
            onClick={handleBegin}
            disabled={!taskType || loading}
            size="lg"
            className="w-full"
          >
            {loading ? "Starting…" : `Begin Task ${round}`}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
