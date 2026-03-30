"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  points?: 5 | 7;
  lowLabel?: string;
  highLabel?: string;
};

type SelectItem = {
  key: string;
  label: string;
  type: "select";
  options: string[];
};

type NumberItem = {
  key: string;
  label: string;
  type: "number";
  min?: number;
  max?: number;
  placeholder?: string;
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

type BaselineItem = ScaleItem | SelectItem | NumberItem | TextItem | CheckboxItem;

type Block = {
  id: string;
  title: string;
  description: string;
  items: BaselineItem[];
};

const BLOCKS: Block[] = [
  {
    id: "nfc",
    title: "Need for Cognition",
    description: "Please indicate how strongly you agree or disagree with the following statements.",
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
    id: "loc",
    title: "Locus of Control",
    description: "Please indicate how strongly you agree or disagree with the following statements.",
    items: [
      { key: "loc_effort", label: "My performance in demanding tasks usually depends on my own effort.", type: "scale" },
      { key: "loc_welldo", label: "When I do well on a task, it is usually because of what I did.", type: "scale" },
      { key: "loc_influence", label: "I can usually influence the quality of my outcomes through my own decisions.", type: "scale" },
      { key: "loc_outside_control", label: "Success in difficult tasks is often outside my control.", type: "scale" },
      { key: "loc_choices", label: "The choices I make usually have an important effect on the results I achieve.", type: "scale" },
      { key: "loc_change_approach", label: "I can usually improve an outcome if I change my approach.", type: "scale" },
    ],
  },
  {
    id: "ai_use",
    title: "Prior AI Use",
    description: "The following questions ask about your prior experience with generative AI tools.",
    items: [
      {
        key: "ai_freq_general",
        label: "How often do you use generative AI tools for any purpose?",
        type: "scale",
        points: 5,
        lowLabel: "Never",
        highLabel: "Almost always",
      },
      {
        key: "ai_freq_writing",
        label: "How often do you use generative AI tools for writing-related tasks?",
        type: "scale",
        points: 5,
        lowLabel: "Never",
        highLabel: "Almost always",
      },
      {
        key: "ai_use_months",
        label: "For about how long have you been using generative AI tools?",
        type: "select",
        options: [
          "Less than 1 month",
          "1-3 months",
          "4-6 months",
          "7-12 months",
          "1-2 years",
          "More than 2 years",
        ],
      },
      {
        key: "ai_familiar",
        label: "I am familiar with how to use generative AI tools to generate or improve written ideas.",
        type: "scale",
      },
      {
        key: "ai_prompt_confident",
        label: "I feel confident writing prompts or instructions for generative AI tools when I want a specific kind of output.",
        type: "scale",
      },
      {
        key: "ai_confident_creative",
        label: "I feel confident using generative AI tools to support creative work.",
        type: "scale",
      },
      {
        key: "ai_brainstorm_before",
        label: "I have used generative AI tools for brainstorming or idea generation before.",
        type: "scale",
      },
      {
        key: "ai_revise_before",
        label: "I have used generative AI tools for revising or improving written content before.",
        type: "scale",
      },
      {
        key: "ai_writing_task_types",
        label: "Which writing-related uses have you used generative AI for before?",
        type: "checkboxes",
        helperText: "Select all that apply.",
        options: [
          "Brainstorming ideas",
          "Outlining",
          "Drafting text",
          "Revising or editing",
          "Style polishing",
          "Story or fiction writing",
          "Metaphor or figurative writing",
          "Summarizing",
          "Translation",
          "Other writing-related use",
        ],
      },
    ],
  },
  {
    id: "writing_exp",
    title: "Creative Writing Experience",
    description: "The following questions ask about your previous experience with creative writing.",
    items: [
      {
        key: "write_freq",
        label: "How often do you engage in creative writing activities?",
        type: "scale",
        points: 5,
        lowLabel: "Never",
        highLabel: "Almost always",
      },
      {
        key: "write_years",
        label: "For about how many years have you engaged in creative writing?",
        type: "select",
        options: [
          "Less than 1 year",
          "1-2 years",
          "3-5 years",
          "6-10 years",
          "More than 10 years",
        ],
      },
      {
        key: "write_fiction",
        label: "I have substantial prior experience writing short stories or fiction.",
        type: "scale",
      },
      {
        key: "write_shared",
        label: "Have you previously shared or published creative writing?",
        type: "select",
        options: [
          "No, never",
          "Yes, shared informally (for example, with friends, online forums, or blogs)",
          "Yes, formally published",
        ],
      },
      {
        key: "write_metaphor_familiar",
        label: "I am comfortable using metaphor or figurative language in writing.",
        type: "scale",
      },
      {
        key: "write_course",
        label: "What kind of formal writing instruction have you had?",
        type: "select",
        options: [
          "No formal course or workshop",
          "One short course or workshop",
          "Multiple courses or workshops",
          "Academic training in writing or literature",
        ],
      },
      {
        key: "write_consider",
        label: "I consider myself an experienced creative writer.",
        type: "scale",
      },
      {
        key: "write_constraint",
        label: "I am comfortable generating written content under time constraints.",
        type: "scale",
      },
    ],
  },
  {
    id: "cse",
    title: "Creative Confidence",
    description: "Please indicate how strongly you agree or disagree with the following statements about your current creative ability.",
    items: [
      { key: "cse_generate", label: "I am capable of generating creative ideas in writing tasks.", type: "scale" },
      { key: "cse_develop", label: "I can develop an ordinary idea into something more original.", type: "scale" },
      { key: "cse_confident", label: "I am confident in my ability to produce imaginative written content.", type: "scale" },
      { key: "cse_improve", label: "I can improve a weak creative idea into a stronger one.", type: "scale" },
    ],
  },
  {
    id: "demographics",
    title: "Background Information",
    description: "The following questions are for research background purposes only.",
    items: [
      {
        key: "demo_age",
        label: "What is your age?",
        type: "number",
        min: 18,
        max: 120,
        placeholder: "Enter your age in years",
      },
      {
        key: "demo_gender",
        label: "What is your gender identity?",
        type: "select",
        options: [
          "Woman",
          "Man",
          "Non-binary",
          "Prefer to self-describe",
          "Prefer not to say",
        ],
      },
      {
        key: "demo_education",
        label: "What is your highest level of completed education?",
        type: "select",
        options: [
          "Less than high school",
          "High school or equivalent",
          "Some college",
          "Associate degree",
          "Bachelor's degree",
          "Master's degree",
          "Doctoral or professional degree",
          "Prefer not to say",
        ],
      },
      {
        key: "demo_income",
        label: "What is your annual personal income?",
        type: "select",
        options: [
          "Less than $25,000",
          "$25,000-$49,999",
          "$50,000-$74,999",
          "$75,000-$99,999",
          "$100,000-$149,999",
          "$150,000 or more",
          "Prefer not to say",
        ],
      },
      {
        key: "demo_occupation",
        label: "What is your current occupation or academic status?",
        type: "select",
        options: [
          "Full-time employed",
          "Part-time employed",
          "Self-employed",
          "Undergraduate student",
          "Graduate student",
          "Unemployed or seeking work",
          "Homemaker or caregiver",
          "Retired",
          "Other",
          "Prefer not to say",
        ],
      },
      {
        key: "demo_language",
        label: "What is your primary language?",
        type: "text",
        placeholder: "Enter your primary language",
      },
      {
        key: "demo_prior_ai_study",
        label: "Have you previously participated in studies involving generative AI?",
        type: "select",
        options: ["Yes", "No", "Not sure"],
      },
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
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [block, setBlock] = useState(0);
  const [loading, setLoading] = useState(false);
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
    const startedAt = startTime.current ?? Date.now();
    const elapsed = (Date.now() - startedAt) / 1000;

    if (participantId) {
      await api.saveBaseline(participantId, responses as Record<string, unknown>, elapsed);
      await api.updateProgress(participantId, "task/1/suggestions");
    }

    router.push("/task/1/suggestions");
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

              if (item.type === "number") {
                return (
                  <div key={item.key} className="space-y-2">
                    <label className="text-sm text-[var(--warm-brown)] leading-relaxed">{item.label}</label>
                    <input
                      type="number"
                      min={item.min}
                      max={item.max}
                      inputMode="numeric"
                      value={typeof responses[item.key] === "number" ? responses[item.key] : ""}
                      onChange={(e) => setValue(item.key, e.target.value === "" ? null : Number(e.target.value))}
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

              if (item.type === "text") {
                return (
                  <div key={item.key} className="space-y-2">
                    <label className="text-sm text-[var(--warm-brown)] leading-relaxed">{item.label}</label>
                    <input
                      type="text"
                      value={typeof responses[item.key] === "string" ? responses[item.key] : ""}
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
                      value={typeof responses[item.key] === "string" ? responses[item.key] : ""}
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
    </div>
  );
}
