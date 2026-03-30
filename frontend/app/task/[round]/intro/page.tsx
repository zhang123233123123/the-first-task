"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { BookOpen, Sparkles, PenLine } from "lucide-react";

export default function TaskIntroPage({ params }: { params: Promise<{ round: string }> }) {
  const { round: roundStr } = use(params);
  const round = parseInt(roundStr, 10);

  const router = useRouter();
  const { participantId, taskOrder, setCurrentRound } = useStore();

  useEffect(() => {
    setCurrentRound(round);
  }, [round, setCurrentRound]);

  useEffect(() => {
    if (!participantId) {
      router.replace("/consent");
    }
  }, [participantId, router]);

  const taskType = (taskOrder[round - 1] ?? "story") as "story" | "metaphor";
  const taskLabel = taskType === "story" ? "short story" : "creative metaphor";

  const handleContinue = async () => {
    if (participantId) {
      await api.updateProgress(participantId, `task/${round}/suggestions`);
    }
    router.push(`/task/${round}/suggestions`);
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--warm-gray)]">
            Task {round} of 2
          </p>
          <h1 className="text-2xl font-semibold text-[var(--warm-brown)]">
            Next, you will complete a {taskLabel} task
          </h1>
          <p className="text-sm text-[var(--warm-gray)] max-w-xl mx-auto leading-relaxed">
            The next screen will introduce the task prompt and show a few AI-generated directions.
            Read them, choose one that interests you, and then write your own response.
          </p>
        </div>

        <div className="space-y-3">
          <div className="glass-card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[var(--sage-light)] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[var(--sage-dark)]" />
            </div>
            <div>
              <h2 className="font-medium text-[var(--warm-brown)] mb-1">What you will do</h2>
              <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                Complete one short creative response using the prompt on screen. The final answer should reflect your own judgment and writing.
              </p>
            </div>
          </div>

          <div className="glass-card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[var(--lavender-light)] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[var(--lavender)]" />
            </div>
            <div>
              <h2 className="font-medium text-[var(--warm-brown)] mb-1">How the AI appears</h2>
              <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                The system will automatically show a few AI-generated ideas. You do not need to write prompts yourself.
              </p>
            </div>
          </div>

          <div className="glass-card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[var(--peach-light)] flex items-center justify-center flex-shrink-0">
              <PenLine className="w-5 h-5 text-[var(--peach)]" />
            </div>
            <div>
              <h2 className="font-medium text-[var(--warm-brown)] mb-1">Before the next task</h2>
              <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                After you submit your response, you will answer a short questionnaire about your experience in that task.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleContinue} size="lg" className="w-full">
          Continue to task {round}
        </Button>
      </motion.div>
    </div>
  );
}
