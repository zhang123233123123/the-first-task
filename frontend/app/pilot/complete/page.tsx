"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Leaf, Heart, Mail } from "lucide-react";

export default function PilotCompletePage() {
  const participantId = useStore((s) => s.participantId);
  const reset = useStore((s) => s.reset);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      setSubmitted(true);
      reset();
      return;
    }
    setSaving(true);
    try {
      if (participantId) {
        await api.logEvent(participantId, 0, {
          type: "optional_feedback",
          feedback: feedback.trim(),
        });
      }
    } catch {
      // silently ignore — feedback is optional
    }
    setSaving(false);
    setSubmitted(true);
    reset();
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
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

        {/* Debrief */}
        <div className="glass-card p-5 space-y-2 text-left">
          <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
            <strong className="text-[var(--warm-brown)]">Study debrief:</strong> This study explored how people approach creative writing tasks when working with different types of AI support. Your participation contributes to research on human-AI collaboration and creativity.
          </p>
        </div>

        {/* Optional feedback */}
        {!submitted && (
          <div className="glass-card p-5 space-y-3 text-left">
            <label className="text-sm font-medium text-[var(--warm-brown)]">
              Any feedback? <span className="text-[var(--warm-gray)] font-normal">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Was anything unclear? Any suggestions for improving the study?"
              rows={3}
              className="
                w-full rounded-2xl bg-white/60 border border-[var(--sage-light)]/40
                px-4 py-3 text-sm text-[var(--warm-brown)] leading-relaxed
                placeholder:text-[var(--warm-gray)]/50
                resize-none focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/40
              "
            />
            <Button
              onClick={handleSubmitFeedback}
              disabled={saving}
              size="md"
              className="w-full"
            >
              {saving ? "Saving..." : feedback.trim() ? "Submit feedback and finish" : "Finish"}
            </Button>
          </div>
        )}

        {submitted && (
          <p className="text-sm text-[var(--sage-dark)]">
            Your session is complete. You may close this window.
          </p>
        )}

        {/* Contact */}
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--warm-gray)]">
            <Mail className="w-3 h-3 text-[var(--sage)]" />
            Questions or data withdrawal requests
          </div>
          <p className="text-xs text-[var(--warm-brown)] font-medium">potteryhrr@gmail.com</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--warm-gray)]">
          <Heart className="w-3 h-3 text-[var(--peach)]" />
          Your contribution matters
        </div>
      </motion.div>
    </div>
  );
}
