"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { PenLine } from "lucide-react";

const MIN_CHARS = 80;

export default function ProductionPage({ params }: { params: Promise<{ round: string }> }) {
  const { round: roundStr } = use(params);
  const round = parseInt(roundStr, 10);

  const router = useRouter();
  const { participantId, taskOrder } = useStore();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const startTime = useRef(Date.now());
  const taskType = taskOrder[round - 1] ?? "story";

  const canSubmit = text.trim().length >= MIN_CHARS;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    const dwell = (Date.now() - startTime.current) / 1000;
    if (participantId) {
      await api.saveArtifact(participantId, round, text.trim(), dwell);
      await api.updateProgress(participantId, `task/${round}/survey`);
    }
    router.push(`/task/${round}/survey`);
  };

  const placeholder =
    taskType === "story"
      ? "Write your story here. Feel free to use or adapt the suggested directions, or take your own path…"
      : "Complete the metaphor here. Be as creative and specific as you like…";

  const heading =
    taskType === "story" ? "Write your story" : "Complete the metaphor";

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl space-y-5"
      >
        <ProgressBar step={round === 1 ? 4 : 8} total={9} label={`Task ${round} of 2`} />

        <div className="glass-card p-7 space-y-5">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-[var(--sage)]" />
            <h2 className="text-xl font-semibold text-[var(--warm-brown)]">{heading}</h2>
          </div>

          <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
            {taskType === "story"
              ? "Write a creative story of about 4–6 sentences. Use or adapt the AI suggestions, or take your own direction entirely."
              : "Complete the metaphor as creatively as you can. There are no wrong answers — aim for something surprising and specific."}
          </p>

          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              rows={9}
              className="
                w-full rounded-2xl bg-white/60 border border-[var(--sage-light)]/40
                px-5 py-4 text-sm text-[var(--warm-brown)] leading-relaxed
                placeholder:text-[var(--warm-gray)]/50
                resize-none focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/40
                transition-all duration-200
              "
            />
            <div className="absolute bottom-3 right-4 text-xs text-[var(--warm-gray)]/60">
              {text.trim().length} / {MIN_CHARS}+ characters
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            size="md"
            className="w-full"
          >
            {loading ? "Saving…" : "Submit and continue"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
