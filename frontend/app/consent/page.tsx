"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Leaf, Clock, Shield, Users } from "lucide-react";

const VALID_CONDITIONS = ["no_ai", "basic_ai", "provocateur", "friction", "prov_then_fric", "fric_then_prov"] as const;
type Condition = typeof VALID_CONDITIONS[number];

const CONDITION_LABELS: Record<Condition, string> = {
  no_ai:          "Control (No AI)",
  basic_ai:       "Basic AI",
  provocateur:    "Challenge mode",
  friction:       "Reflection mode",
  prov_then_fric: "Challenge then Reflection",
  fric_then_prov: "Reflection then Challenge",
};

export default function ConsentPage() {
  return (
    <Suspense>
      <ConsentContent />
    </Suspense>
  );
}

function ConsentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setParticipant = useStore((s) => s.setParticipant);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read condition and pilot flag from URL
  // e.g. /consent?condition=no_ai  or  /consent?pilot=true
  const rawCondition = searchParams.get("condition");
  const condition = VALID_CONDITIONS.includes(rawCondition as Condition)
    ? (rawCondition as Condition)
    : null;
  const isPilot = searchParams.get("pilot") === "true";

  const handleContinue = async () => {
    if (!agreed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.initParticipant(condition ?? undefined, isPilot);
      setParticipant({
        participantId: data.participant_id,
        conditionId: data.condition_id,
        provocateurFlag: data.provocateur_flag,
        frictionFlag: data.friction_flag,
        taskOrder: data.task_order,
        isPilot: data.is_pilot,
      });
      await api.recordConsent(data.participant_id);
      router.push("/instructions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to server. Please make sure the backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-2xl space-y-6"
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[var(--sage-light)]/30 text-[var(--sage-dark)] text-xs font-medium px-3 py-1.5 rounded-full">
            <Leaf className="w-3.5 h-3.5" />
            Research Study
            {condition && (
              <span className="ml-1 text-[var(--warm-gray)]">
                · {CONDITION_LABELS[condition]}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-semibold text-[var(--warm-brown)] tracking-tight">
            Creativity &amp; AI Study
          </h1>
          <p className="text-[var(--warm-gray)] text-base leading-relaxed max-w-lg mx-auto">
            Welcome. This study explores how people work creatively alongside AI.
            We are glad you are here.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "About 20-30 minutes", desc: "Depends on your pace" },
            { icon: Shield, label: "Anonymous", desc: "Your data is private" },
            { icon: Users, label: "2 tasks + questionnaires", desc: "Creative exercises and study measures" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="glass-card p-4 text-center space-y-1">
              <Icon className="w-5 h-5 mx-auto text-[var(--sage)]" />
              <p className="text-sm font-medium text-[var(--warm-brown)]">{label}</p>
              <p className="text-xs text-[var(--warm-gray)]">{desc}</p>
            </div>
          ))}
        </div>

        {/* Consent text */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-[var(--warm-brown)]">Informed Consent</h2>
          <div className="text-sm text-[var(--warm-gray)] space-y-2 leading-relaxed">
            <p>
              This study is conducted as part of academic research on human-AI creativity. Your participation is entirely voluntary, and you may withdraw at any time without penalty.
            </p>
            <p>
              You will interact with an AI system to complete two short creative tasks and related questionnaires about your background and experience. The study involves no deception or risk beyond everyday computer use.
            </p>
            <p>
              All responses are anonymous. No personally identifying information will be collected or shared. Data will be used solely for academic research purposes.
            </p>
            <p>
              By continuing, you confirm that you are 18 years of age or older and agree to participate.
            </p>
            <p>
              Please note that responses may be reviewed for data quality, completeness, and response patterns. Records showing incomplete or inattentive effort may be excluded from analysis and may not be eligible for compensation where compensation applies.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="mt-0.5 relative">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                ${agreed
                  ? "bg-[var(--sage)] border-[var(--sage)]"
                  : "border-[var(--sage-light)] group-hover:border-[var(--sage)]"
                }
              `}>
                {agreed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-[var(--warm-brown)] leading-relaxed">
              I have read and understood the information above, and I agree to participate voluntarily.
            </span>
          </label>
        </div>

        {error && (
          <div className="glass-card p-4 border border-red-200/50 bg-red-50/60">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={!agreed || loading}
          size="lg"
          className="w-full"
        >
          {loading ? "Starting…" : "Begin the study"}
        </Button>
      </motion.div>
    </div>
  );
}
