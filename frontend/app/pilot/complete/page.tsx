"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { CheckCircle } from "lucide-react";

export default function PilotCompletePage() {
  const { participantId, reset } = useStore();

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 text-center space-y-5">
          <CheckCircle className="w-12 h-12 text-[var(--sage)] mx-auto" />
          <h1 className="text-2xl font-bold text-[var(--warm-brown)]">
            Pilot study complete
          </h1>
          <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
            Thank you for participating in this pilot study. Your responses have been recorded and will help us refine the experiment.
          </p>
          {participantId && (
            <p className="text-xs text-[var(--warm-gray)]/60 font-mono">
              ID: {participantId}
            </p>
          )}
          <button
            onClick={reset}
            className="text-sm text-[var(--sage)] underline underline-offset-2 hover:text-[var(--sage-dark)] transition-colors"
          >
            Start another session
          </button>
        </div>
      </motion.div>
    </div>
  );
}
