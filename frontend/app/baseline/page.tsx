"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LikertScale } from "@/components/ui/LikertScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

type ResponseValue = string | number | string[] | null;

type ScaleItem = {
  key: string;
  label: string;
  type: "scale";
  points?: 4 | 5 | 7;
  lowLabel?: string;
  highLabel?: string;
};

type SelectItem = {
  key: string;
  label: string;
  type: "select";
  options: string[];
};

type TextItem = {
  key: string;
  label: string;
  type: "text";
  placeholder?: string;
};

type CheckboxItem = {
  key: string;
  label: string;
  type: "checkboxes";
  options: string[];
  helperText?: string;
};

type BaselineItem = ScaleItem | SelectItem | TextItem | CheckboxItem;

type Block = {
  id: string;
  title: string;
  description: string;
  items: BaselineItem[];
};

// Order: Demographics → control variables (NFC, IE-4, AI use, writing exp) → CSE
const BLOCKS: Block[] = [
  {
    id: "demographics",
    title: "Background Information",
    description: "The following questions are for research background purposes only.",
    items: [
      {
        key: "demo_age",
        label: "What is your age?",
        type: "text",
        placeholder: "e.g. 25",
      },
      {
        key: "demo_gender",
        label: "What is your gender?",
        type: "select",
        options: ["Female", "Male"],
      },
      {
        key: "demo_education",
        label: "What is your highest level of completed education?",
        type: "select",
        options: [
          "Below High School",
          "High School",
          "College/University",
          "Graduate/Postgraduate",
        ],
      },
      {
        key: "demo_occupation",
        label: "What is your current occupation or academic status?",
        type: "text",
        placeholder: "e.g. Software engineer",
      },
      {
        key: "demo_country",
        label: "What is your country / region?",
        type: "text",
        placeholder: "e.g. United States",
      },
      {
        key: "demo_english",
        label: "What is your English proficiency level?",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced", "Native/Bilingual"],
      },
      {
        key: "demo_prior_ai_study",
        label: "Have you previously participated in studies involving generative AI?",
        type: "select",
        options: ["Yes", "No", "Not sure"],
      },
    ],
  },
  {
    id: "nfc",
    title: "Need for Cognition",
    description: "Please indicate how well each statement describes you.",
    items: [
      { key: "nfc_prefer", label: "I prefer tasks that require careful thinking.", type: "scale" },
      { key: "nfc_enjoy", label: "I enjoy working through complex problems.", type: "scale" },
      { key: "nfc_deep", label: "I would rather think deeply about an issue than rely on a quick answer.", type: "scale" },
      { key: "nfc_satisfaction", label: "I find satisfaction in effortful thinking.", type: "scale" },
      { key: "nfc_challenge", label: "I like situations that require me to evaluate alternatives carefully.", type: "scale" },
      { key: "nfc_prefer_challenge", label: "I prefer tasks that challenge the way I think.", type: "scale" },
    ],
  },
  {
    // IE-4: Internal-External Locus of Control Short Scale
    // Kovaleva, A. (2012). IE-4: A Four-Item Measure of Internal-External Locus of Control. GESIS Working Papers 2012|18.
    // 2 internal-control items + 2 external-control items (reversed).
    // Used as a stable trait measure; placed pre-task as a baseline control variable.
    id: "loc",
    title: "Locus of Control",
    description: "Please indicate how strongly you agree or disagree with the following statements.",
    items: [
      { key: "loc_ie1", label: "I can bring about positive changes by my own actions.", type: "scale", points: 5, lowLabel: "Strongly disagree", highLabel: "Strongly agree" },
      { key: "loc_ie2", label: "How my life goes is my own doing.", type: "scale", points: 5, lowLabel: "Strongly disagree", highLabel: "Strongly agree" },
      { key: "attn_baseline", label: "This is an attention check. Please select 'Agree' (4) for this item.", type: "scale", points: 5, lowLabel: "Strongly disagree", highLabel: "Strongly agree" },
      { key: "loc_ie3", label: "I have little influence on how my life turns out.", type: "scale", points: 5, lowLabel: "Strongly disagree", highLabel: "Strongly agree" },
      { key: "loc_ie4", label: "What I achieve in life is largely a matter of fate or luck.", type: "scale", points: 5, lowLabel: "Strongly disagree", highLabel: "Strongly agree" },
    ],
  },
  {
    id: "ai_use",
    title: "Prior AI Use",
    description: "Please rate your experience with generative AI tools (e.g. ChatGPT, Claude).",
    items: [
      {
        key: "ai_freq",
        label: "How often do you use generative AI tools (e.g. ChatGPT, Claude)?",
        type: "scale",
        lowLabel: "Never",
        highLabel: "Almost always",
      },
      {
        key: "ai_expertise",
        label: "How would you rate your overall expertise with generative AI tools?",
        type: "scale",
        lowLabel: "Novice",
        highLabel: "Expert",
      },
    ],
  },
  {
    id: "writing_exp",
    title: "Creative Writing Experience",
    description: "Please rate your creative writing background.",
    items: [
      {
        key: "write_exp",
        label: "How much creative writing experience do you have?",
        type: "scale",
        lowLabel: "No experience",
        highLabel: "Very experienced",
      },
      {
        key: "write_confidence",
        label: "How confident are you in your creative writing ability?",
        type: "scale",
        lowLabel: "Not at all confident",
        highLabel: "Extremely confident",
      },
    ],
  },
  {
    id: "cse",
    title: "Creative Confidence",
    description: "Please indicate how strongly you agree or disagree with each statement.",
    items: [
      { key: "cse_generate", label: "Based on my current experience, I am capable of generating creative ideas in writing tasks.", type: "scale" },
      { key: "cse_develop", label: "Based on my current experience, I can develop an ordinary idea into something more original.", type: "scale" },
      { key: "cse_confident", label: "Based on my current experience, I am confident in my ability to produce imaginative written content.", type: "scale" },
    ],
  },
];

function isAnswered(value: ResponseValue) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== "";
}

export default function BaselinePage() {
  const router = useRouter();
  const participantId = useStore((s) => s.participantId);
  const setParticipant = useStore((s) => s.setParticipant);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [block, setBlock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const currentBlock = BLOCKS[block];
  const allAnswered = currentBlock.items.every((item) => isAnswered(responses[item.key] ?? null));

  const setValue = (key: string, value: ResponseValue) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCheckbox = (key: string, option: string) => {
    const current = Array.isArray(responses[key]) ? (responses[key] as string[]) : [];
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    setValue(key, next);
  };

  const handleNext = async () => {
    if (block < BLOCKS.length - 1) {
      setBlock((prev) => prev + 1);
      return;
    }

    setLoading(true);
    setError(null);
    const startedAt = startTime.current ?? Date.now();
    const elapsed = (Date.now() - startedAt) / 1000;

    try {
      if (participantId) {
        const result = await api.saveBaseline(participantId, responses as Record<string, unknown>, elapsed);
        // Real study mode: backend returns condition assignment after CSE scoring
        if (result.condition_id) {
          setParticipant({
            participantId: participantId,
            conditionId: result.condition_id,
            provocateurFlag: result.provocateur_flag ?? false,
            frictionFlag: result.friction_flag ?? false,
            taskOrder: result.task_order ?? [],
          });
        }
        await api.updateProgress(participantId, "task/1/brief");
      }
      router.push("/task/1/brief");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <AnimatePresence mode="wait">
      <motion.div
        key={block}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-xl space-y-6"
      >
        <ProgressBar step={block + 1} total={BLOCKS.length} label="Background questions" />

        <div className="glass-card p-7 space-y-6">
          <div>
            <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide mb-1">
              Section {block + 1} of {BLOCKS.length}
            </p>
            <h2 className="text-xl font-semibold text-[var(--warm-brown)]">{currentBlock.title}</h2>
            <p className="text-sm text-[var(--warm-gray)] mt-1">{currentBlock.description}</p>
          </div>

          <div className="space-y-6">
            {currentBlock.items.map((item) => {
              if (item.type === "scale") {
                return (
                  <LikertScale
                    key={item.key}
                    name={item.key}
                    label={item.label}
                    value={typeof responses[item.key] === "number" ? (responses[item.key] as number) : null}
                    onChange={(val) => setValue(item.key, val)}
                    points={item.points}
                    lowLabel={item.lowLabel}
                    highLabel={item.highLabel}
                  />
                );
              }

              if (item.type === "text") {
                return (
                  <div key={item.key} className="space-y-2">
                    <label className="text-sm text-[var(--warm-brown)] leading-relaxed">{item.label}</label>
                    <input
                      type="text"
                      value={String(responses[item.key] ?? "")}
                      onChange={(e) => setValue(item.key, e.target.value === "" ? null : e.target.value)}
                      placeholder={item.placeholder}
                      className="
                        w-full rounded-2xl bg-white/60 border border-[var(--sage-light)]/40
                        px-4 py-3 text-sm text-[var(--warm-brown)]
                        placeholder:text-[var(--warm-gray)]/50
                        focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/40
                      "
                    />
                  </div>
                );
              }

              if (item.type === "select") {
                return (
                  <div key={item.key} className="space-y-2">
                    <label className="text-sm text-[var(--warm-brown)] leading-relaxed">{item.label}</label>
                    <select
                      value={String(responses[item.key] ?? "")}
                      onChange={(e) => setValue(item.key, e.target.value === "" ? null : e.target.value)}
                      className="
                        w-full rounded-2xl bg-white/60 border border-[var(--sage-light)]/40
                        px-4 py-3 text-sm text-[var(--warm-brown)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/40
                      "
                    >
                      <option value="">Select an option</option>
                      {item.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={item.key} className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-[var(--warm-brown)] leading-relaxed">{item.label}</p>
                    {item.helperText && (
                      <p className="text-xs text-[var(--warm-gray)]">{item.helperText}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {item.options.map((option) => {
                      const selected = Array.isArray(responses[item.key]) && (responses[item.key] as string[]).includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleCheckbox(item.key, option)}
                          className={`
                            rounded-2xl border px-4 py-3 text-left text-sm transition-all
                            ${selected
                              ? "bg-[var(--sage)] text-white border-[var(--sage)]"
                              : "bg-white/60 text-[var(--warm-brown)] border-[var(--sage-light)]/40 hover:border-[var(--sage)]"
                            }
                          `}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50/60 rounded-xl px-4 py-2">{error}</p>
          )}

          <Button
            onClick={handleNext}
            disabled={!allAnswered || loading}
            size="md"
            className="w-full"
          >
            {block < BLOCKS.length - 1 ? "Next section" : loading ? "Saving..." : "Begin the tasks"}
          </Button>
        </div>
      </motion.div>
      </AnimatePresence>
    </div>
  );
}
