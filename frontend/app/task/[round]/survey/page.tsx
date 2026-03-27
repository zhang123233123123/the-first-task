"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LikertScale } from "@/components/ui/LikertScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

const KOC_ITEMS = [
  { key: "koc_useful", label: "During this task, I knew which AI suggestions were useful for my response." },
  { key: "koc_ways", label: "I was aware of different ways I could develop my response." },
  { key: "koc_judgment", label: "I understood which parts of the task required my own judgment." },
  { key: "koc_tell", label: "I could tell when the AI was helping me generate possibilities." },
  { key: "koc_unsuited", label: "I recognized when an AI suggestion was not well suited to my task goals." },
];

const ROC_ITEMS = [
  { key: "roc_eval", label: "I evaluated AI suggestions before deciding whether to use them." },
  { key: "roc_monitor", label: "I monitored whether the AI-supported direction matched my task goals." },
  { key: "roc_change", label: "I changed my approach when the initial direction was not strong enough." },
  { key: "roc_check", label: "I checked whether my response was becoming too generic." },
  { key: "roc_revise", label: "I actively revised or rejected ideas that did not fit well." },
  { key: "roc_original", label: "I tried to ensure that my final response remained original rather than routine." },
];

const CSE_ITEMS = [
  { key: "cse_capable", label: "I was capable of producing a creative response in this task." },
  { key: "cse_improve", label: "I could improve a weak idea into something more original during this task." },
  { key: "cse_confident", label: "I felt confident in my ability to shape the final creative outcome." },
  { key: "cse_contribute", label: "I was able to contribute creatively rather than simply follow the AI." },
];

const LOAD_ITEMS = [
  { key: "load_effort", label: "This task required substantial mental effort." },
  { key: "load_think", label: "I had to think carefully before moving forward." },
  { key: "load_demanding", label: "Completing this task was mentally demanding." },
];

const PROV_CHECK = [
  { key: "prov_challenged", label: "The AI challenged my assumptions." },
  { key: "prov_alternative", label: "The AI presented alternative perspectives rather than only helping me complete the task." },
  { key: "prov_rethink", label: "The AI prompted me to rethink my developing ideas." },
  { key: "prov_critic", label: "The AI behaved more like a challenger than a simple assistant." },
];

const FRICTION_CHECK = [
  { key: "fric_slowdown", label: "The interface made me slow down before moving on." },
  { key: "fric_reflect", label: "The system required me to reflect before using ideas." },
  { key: "fric_pause", label: "The interaction included deliberate pause points." },
  { key: "fric_justify", label: "The design made me review or justify my choices rather than proceed immediately." },
];

const OWNERSHIP_ITEMS = [
  { key: "own_mine", label: "I felt that the final response was truly mine." },
  { key: "own_direct", label: "I felt that I was directing the creative vision." },
  { key: "own_shape", label: "I shaped the final response rather than merely cleaning up AI output." },
];

const BLOCKS = [
  { id: "koc", title: "Awareness during the task", items: KOC_ITEMS },
  { id: "roc", title: "Evaluation during the task", items: ROC_ITEMS },
  { id: "cse", title: "Creative confidence", items: CSE_ITEMS },
  { id: "load", title: "Task effort", items: LOAD_ITEMS },
  { id: "prov", title: "About the AI", items: PROV_CHECK },
  { id: "friction", title: "About the interface", items: FRICTION_CHECK },
  { id: "ownership", title: "Ownership", items: OWNERSHIP_ITEMS },
];

export default function SurveyPage({ params }: { params: Promise<{ round: string }> }) {
  const { round: roundStr } = use(params);
  const round = parseInt(roundStr, 10);

  const router = useRouter();
  const { participantId } = useStore();
  const [responses, setResponses] = useState<Record<string, number | null>>({});
  const [block, setBlock] = useState(0);
  const [loading, setLoading] = useState(false);
  const startTime = useRef(Date.now());

  const currentBlock = BLOCKS[block];
  const allAnswered = currentBlock.items.every((it) => responses[it.key] != null);

  const handleNext = async () => {
    if (block < BLOCKS.length - 1) {
      setBlock((b) => b + 1);
      return;
    }
    setLoading(true);
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (participantId) {
      await api.savePostTask(participantId, round, responses as Record<string, unknown>, elapsed);
    }

    if (round === 1) {
      await api.updateProgress(participantId!, "task/2/suggestions");
      router.push("/task/2/suggestions");
    } else {
      await api.completeStudy(participantId!);
      router.push("/complete");
    }
  };

  const totalSteps = round === 1 ? 5 : 9;
  const stepOffset = round === 1 ? 5 : 9;

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        key={`${round}-${block}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl space-y-6"
      >
        <ProgressBar
          step={round === 1 ? 5 + block : 9}
          total={9}
          label={`Task ${round} questionnaire — section ${block + 1} of ${BLOCKS.length}`}
        />

        <div className="glass-card p-7 space-y-6">
          <div>
            <p className="text-xs text-[var(--warm-gray)] uppercase tracking-wide font-medium mb-1">
              Please answer based on the task you just completed
            </p>
            <h2 className="text-xl font-semibold text-[var(--warm-brown)]">{currentBlock.title}</h2>
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
            {block < BLOCKS.length - 1
              ? "Next"
              : loading
              ? "Saving…"
              : round === 1
              ? "Start task 2"
              : "Finish study"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
