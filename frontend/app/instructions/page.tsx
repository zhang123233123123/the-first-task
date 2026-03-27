"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { BookOpen, Sparkles, PenLine, CheckSquare } from "lucide-react";

const STEPS = [
  {
    icon: BookOpen,
    title: "Two creative tasks",
    desc: "You will complete two short creative writing tasks — a story and a metaphor. Each takes about 5 minutes.",
    color: "var(--sage-light)",
    iconColor: "var(--sage-dark)",
  },
  {
    icon: Sparkles,
    title: "AI suggestions",
    desc: "The system will show you a few AI-generated ideas at each task. You don't need to type any prompts — they appear automatically.",
    color: "var(--lavender-light)",
    iconColor: "var(--lavender)",
  },
  {
    icon: PenLine,
    title: "Your own voice",
    desc: "Use the suggestions as a springboard. You decide what to keep, adapt, or ignore. The final response is always yours.",
    color: "var(--peach-light)",
    iconColor: "var(--peach)",
  },
  {
    icon: CheckSquare,
    title: "Short reflection steps",
    desc: "Some steps may ask you to pause briefly before moving on. This is a normal part of the study design — just follow the prompts.",
    color: "var(--sage-light)",
    iconColor: "var(--sage-dark)",
  },
];

export default function InstructionsPage() {
  const router = useRouter();
  const participantId = useStore((s) => s.participantId);

  const handleContinue = async () => {
    if (participantId) {
      await api.updateProgress(participantId, "baseline");
    }
    router.push("/baseline");
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-[var(--warm-brown)]">How this works</h1>
          <p className="text-[var(--warm-gray)] text-sm">
            Here's what to expect before you begin.
          </p>
        </div>

        <div className="space-y-3">
          {STEPS.map(({ icon: Icon, title, desc, color, iconColor }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.15, duration: 0.4 }}
              className="glass-card p-5 flex items-start gap-4"
            >
              <div
                className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center"
                style={{ background: color }}
              >
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <div>
                <h3 className="font-medium text-[var(--warm-brown)] mb-0.5">{title}</h3>
                <p className="text-sm text-[var(--warm-gray)] leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass-card p-4 text-center">
          <p className="text-sm text-[var(--warm-gray)]">
            First, we'll ask a few quick background questions, then the tasks begin.
          </p>
        </div>

        <Button onClick={handleContinue} size="lg" className="w-full">
          Got it — let's start
        </Button>
      </motion.div>
    </div>
  );
}
