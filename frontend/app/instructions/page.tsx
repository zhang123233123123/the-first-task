"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { BookOpen, Sparkles, PenLine, CheckSquare } from "lucide-react";

export default function InstructionsPage() {
  const router = useRouter();
  const participantId = useStore((s) => s.participantId);

  const steps = [
    {
      icon: BookOpen,
      title: "Two creative tasks",
      desc: "You will complete two short creative tasks with AI support: one story task and one metaphor task.",
      color: "var(--sage-light)",
      iconColor: "var(--sage-dark)",
    },
    {
      icon: CheckSquare,
      title: "Questionnaires",
      desc: "The study also includes background questions before the tasks and short questionnaires after each task.",
      color: "var(--sage-light)",
      iconColor: "var(--sage-dark)",
    },
    {
      icon: Sparkles,
      title: "AI suggestions",
      desc: "The system will show you a few AI-generated ideas at each task. You do not need to type any prompts - they appear automatically.",
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
  ];

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
            Here is what to expect before you begin.
          </p>
        </div>

        <div className="space-y-3">
          {steps.map(({ icon: Icon, title, desc, color, iconColor }, i) => (
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
            First, you will complete the background questionnaire. After each task, you will answer a short questionnaire about your experience before continuing.
          </p>
        </div>

        <Button onClick={handleContinue} size="lg" className="w-full">
          Got it - start the study
        </Button>
      </motion.div>
    </div>
  );
}
