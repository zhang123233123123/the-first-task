"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function TransitionPage() {
  const router = useRouter();
  const participantId = useStore((s) => s.participantId);

  const handleContinue = async () => {
    if (participantId) {
      await api.updateProgress(participantId, "task/2/brief");
    }
    router.push("/task/2/brief");
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-lg text-center space-y-6"
      >
        <div className="glass-card p-8 space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--sage-light)]/40 mx-auto">
            <CheckCircle2 className="w-7 h-7 text-[var(--sage)]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[var(--warm-brown)]">
              Task 1 complete
            </h1>
            <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
              Well done! You have finished the first task. When you are ready, click the button below to start the second and final task.
            </p>
          </div>

          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full flex items-center justify-center gap-2"
          >
            Start Task 2
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
