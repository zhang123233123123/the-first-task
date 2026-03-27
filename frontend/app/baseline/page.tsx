"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LikertScale } from "@/components/ui/LikertScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

// ── Question blocks ───────────────────────────────────────────

const AI_USE_ITEMS = [
  { key: "ai_freq_general", label: "How often do you use generative AI tools for any purpose?" },
  { key: "ai_freq_writing", label: "How often do you use generative AI tools for writing-related tasks?" },
  { key: "ai_familiar", label: "I am familiar with how to use generative AI tools to generate or improve written ideas." },
  { key: "ai_confident", label: "I feel confident using generative AI tools to support creative work." },
];

const WRITING_EXP_ITEMS = [
  { key: "write_freq", label: "How often do you engage in creative writing activities?" },
  { key: "write_fiction", label: "I have substantial prior experience writing short stories or fiction." },
  { key: "write_consider", label: "I consider myself an experienced creative writer." },
  { key: "write_constraint", label: "I am comfortable generating written content under time constraints." },
];

const CSE_ITEMS = [
  { key: "cse_generate", label: "I am capable of generating creative ideas in writing tasks." },
  { key: "cse_develop", label: "I can develop an ordinary idea into something more original." },
  { key: "cse_confident", label: "I am confident in my ability to produce imaginative written content." },
  { key: "cse_improve", label: "I can improve a weak creative idea into a stronger one." },
];

const NFC_ITEMS = [
  { key: "nfc_prefer", label: "I prefer tasks that require careful thinking." },
  { key: "nfc_enjoy", label: "I enjoy working through complex problems." },
  { key: "nfc_deep", label: "I would rather think deeply about an issue than rely on a quick answer." },
  { key: "nfc_challenge", label: "I like situations that require me to evaluate alternatives carefully." },
];

const LOC_ITEMS = [
  { key: "loc_effort", label: "My performance in demanding tasks usually depends on my own effort." },
  { key: "loc_welldo", label: "When I do well on a task, it is usually because of what I did." },
  { key: "loc_influence", label: "I can usually influence the quality of my outcomes through my own decisions." },
  { key: "loc_choices", label: "The choices I make usually have an important effect on the results I achieve." },
];

const BLOCKS = [
  { id: "ai_use", title: "Prior AI Use", items: AI_USE_ITEMS },
  { id: "writing_exp", title: "Creative Writing Experience", items: WRITING_EXP_ITEMS },
  { id: "cse", title: "Creative Confidence", items: CSE_ITEMS },
  { id: "nfc", title: "Thinking Style", items: NFC_ITEMS },
  { id: "loc", title: "Personal Agency", items: LOC_ITEMS },
];

export default function BaselinePage() {
  const router = useRouter();
  const participantId = useStore((s) => s.participantId);
  const [responses, setResponses] = useState<Record<string, number | null>>({});
  const [block, setBlock] = useState(0);
  const [loading, setLoading] = useState(false);
  const startTime = useRef(Date.now());

  const currentBlock = BLOCKS[block];
  const allAnswered = currentBlock.items.every((it) => responses[it.key] != null);

  const handleNext = async () => {
    if (block < BLOCKS.length - 1) {
      setBlock((b) => b + 1);
    } else {
      // Submit baseline
      setLoading(true);
      const elapsed = (Date.now() - startTime.current) / 1000;
      if (participantId) {
        await api.saveBaseline(participantId, responses as Record<string, unknown>, elapsed);
        await api.updateProgress(participantId, "task/1/suggestions");
      }
      router.push("/task/1/suggestions");
    }
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        key={block}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-xl space-y-6"
      >
        <ProgressBar step={block + 1} total={BLOCKS.length} label="Background questions" />

        <div className="glass-card p-7 space-y-6">
          <div>
            <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide mb-1">
              Section {block + 1} of {BLOCKS.length}
            </p>
            <h2 className="text-xl font-semibold text-[var(--warm-brown)]">{currentBlock.title}</h2>
            <p className="text-sm text-[var(--warm-gray)] mt-1">
              Please indicate how strongly you agree or disagree with each statement.
            </p>
          </div>

          <div className="space-y-6">
            {currentBlock.items.map((item) => (
              <LikertScale
                key={item.key}
                name={item.key}
                label={item.label}
                value={responses[item.key] ?? null}
                onChange={(val) => setResponses((r) => ({ ...r, [item.key]: val }))}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!allAnswered || loading}
            size="md"
            className="w-full"
          >
            {block < BLOCKS.length - 1 ? "Next section" : loading ? "Saving…" : "Begin the tasks"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
