"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Leaf, Heart } from "lucide-react";

export default function CompletePage() {
  const reset = useStore((s) => s.reset);

  useEffect(() => {
    // Clear session after showing completion
    const timer = setTimeout(() => reset(), 5000);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md text-center space-y-6"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-[var(--sage-light)]/40 mx-auto flex items-center justify-center"
        >
          <Leaf className="w-9 h-9 text-[var(--sage)]" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[var(--warm-brown)]">
            Thank you so much
          </h1>
          <p className="text-[var(--warm-gray)] text-sm leading-relaxed">
            You have completed the study. Your responses have been saved and will help us better understand how people create alongside AI.
          </p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
            <strong className="text-[var(--warm-brown)]">Study debrief:</strong> This study examined how different types of AI support — such as generating ideas, asking reflective questions, or encouraging you to pause and reconsider — affect creative thinking and sense of ownership over your work. Your participation contributes to research on human-AI collaboration and creativity.
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--warm-gray)]">
          <Heart className="w-3 h-3 text-[var(--peach)]" />
          Your contribution matters
        </div>
      </motion.div>
    </div>
  );
}
