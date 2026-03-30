"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SuggestionCard } from "@/components/SuggestionCard";
import { FrictionGate } from "@/components/FrictionGate";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { BookOpen, MessageCircle, PenLine, Send, Sparkles } from "lucide-react";

const MIN_CHARS = 80;
const TASK_TIME_LIMIT_SECONDS = 5 * 60;

interface Suggestion {
  id: number;
  suggestion: string;
}

interface Provocation {
  risk: string;
  alternative: string;
  question: string;
}

interface SuggestionsData {
  task_type: string;
  prompt: Record<string, unknown>;
  suggestions: Suggestion[];
  provocation?: Provocation | null;
  provocateur_flag: boolean;
  friction_flag: boolean;
}

export default function SuggestionsPage({ params }: { params: Promise<{ round: string }> }) {
  const { round: roundStr } = use(params);
  const round = parseInt(roundStr, 10);

  const router = useRouter();
  const { participantId, taskOrder, setCurrentRound } = useStore();
  const [data, setData] = useState<SuggestionsData | null>(null);
  const [promptData, setPromptData] = useState<Record<string, unknown> | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [gateCompleted, setGateCompleted] = useState(false);
  const [text, setText] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [promptLoading, setPromptLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TASK_TIME_LIMIT_SECONDS);
  const [timeExpired, setTimeExpired] = useState(false);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const startedAt = startTime.current;
      if (startedAt === null) return;

      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(TASK_TIME_LIMIT_SECONDS - elapsed, 0);
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setTimeExpired(true);
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Source of truth for conditions comes from the backend API response,
  // not the local store — this ensures conditions are always correctly applied
  // even after page refresh.
  const provocateurActive = data?.provocateur_flag ?? false;
  const frictionActive = data?.friction_flag ?? false;

  useEffect(() => {
    setCurrentRound(round);
  }, [round, setCurrentRound]);

  useEffect(() => {
    if (!participantId) {
      router.replace("/consent");
      return;
    }
    api.getTaskPrompt(participantId, round)
      .then((result) => {
        setPromptData(result.prompt);
        setPromptError(null);
      })
      .catch((e: Error) => setPromptError(e.message))
      .finally(() => setPromptLoading(false));

    api.getSuggestions(participantId, round)
      .then((d) => {
        setData(d as unknown as SuggestionsData);
        setSuggestionsError(null);
      })
      .catch((e: Error) => setSuggestionsError(e.message))
      .finally(() => setSuggestionsLoading(false));
  }, [participantId, round, router]);

  const taskType = (data?.task_type ?? taskOrder[round - 1] ?? "story") as "story" | "metaphor";
  const prompt = (promptData ?? data?.prompt ?? null) as Record<string, unknown> | null;
  const canSubmit = !saving && (text.trim().length >= MIN_CHARS || timeExpired);
  const provocation = data?.provocation ?? null;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const hideDirections = provocateurActive;

  const handleSubmit = () => {
    // Friction condition: must complete the reflection gate before proceeding
    if (frictionActive && !gateCompleted) {
      setShowGate(true);
      return;
    }
    void submitArtifact();
  };

  const submitArtifact = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const dwell = (Date.now() - (startTime.current ?? Date.now())) / 1000;
    if (participantId) {
      api.logEvent(participantId, round, { type: "suggestion_selected", suggestion_id: selected });
      await api.saveArtifact(participantId, round, text.trim(), dwell);
      await api.updateProgress(participantId, `task/${round}/survey`);
    }
    router.push(`/task/${round}/survey`);
  };

  const handleChatSend = () => {
    const trimmed = chatReply.trim();
    if (!trimmed) return;
    setChatHistory((prev) => [...prev, { role: "user", text: trimmed }]);
    setChatReply("");
  };

  const handleGateComplete = async (gateResponses: Record<string, unknown>) => {
    setShowGate(false);
    setGateCompleted(true);
    if (participantId) {
      // dwell_seconds comes from FrictionGate itself (measured from gate open)
      const { dwell_seconds, ...responses } = gateResponses as Record<string, unknown> & { dwell_seconds: number };
      await api.saveGate(participantId, round, responses, dwell_seconds);
    }
    await submitArtifact();
  };
  const promptUnavailable = !promptLoading && !prompt;

  return (
    <div className="healing-bg min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-6xl space-y-6"
      >
        <ProgressBar step={round === 1 ? 1 : 8} total={16} label={`Task ${round} workspace`} />

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="glass-card p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--sage)]" />
                <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                  {hideDirections
                    ? "AI Challenge"
                    : taskType === "story"
                    ? "Story Suggestions"
                    : "Metaphor Suggestions"}
                </p>
              </div>
              <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                {hideDirections
                  ? "Use this provocation card as a challenge prompt while you write your own response."
                  : "Review the AI-generated directions on the left while you write. You may select one as your reference, adapt it, or ignore it."}
              </p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                Time Limit
              </p>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className={`text-3xl font-semibold ${timeExpired ? "text-red-600" : "text-[var(--warm-brown)]"}`}>
                    {minutes}:{seconds}
                  </p>
                  <p className="text-sm text-[var(--warm-gray)]">
                    {timeExpired ? "Time is up. Submit your current response." : "You have 5 minutes for this task."}
                  </p>
                </div>
              </div>
            </div>

            {provocateurActive && provocation && (
              <div className="glass-card p-5 space-y-3 flex flex-col">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[var(--lavender)]" />
                  <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                    AI Challenge
                  </p>
                </div>

                {/* Chat history */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {/* Initial AI provocation message */}
                  <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full bg-[var(--lavender-light)] flex-shrink-0 flex items-center justify-center mt-0.5">
                      <MessageCircle className="w-3 h-3 text-[var(--lavender)]" />
                    </div>
                    <div className="bg-[var(--lavender-light)]/40 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-[var(--warm-brown)] leading-relaxed max-w-[85%]">
                      <p className="text-xs text-[var(--warm-gray)] mb-1">{provocation.risk} Consider: {provocation.alternative}</p>
                      <p className="italic">{provocation.question}</p>
                    </div>
                  </div>

                  {/* User replies */}
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className="bg-[var(--sage-light)]/50 rounded-2xl rounded-tr-sm px-3 py-2 text-sm text-[var(--warm-brown)] leading-relaxed max-w-[85%]">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply input */}
                <div className="flex gap-2 items-end">
                  <textarea
                    value={chatReply}
                    onChange={(e) => setChatReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSend();
                      }
                    }}
                    placeholder="Reply to AI (optional)…"
                    rows={2}
                    className="
                      flex-1 rounded-2xl bg-white/60 border border-[var(--sage-light)]/40
                      px-3 py-2 text-sm text-[var(--warm-brown)]
                      placeholder:text-[var(--warm-gray)]/50
                      resize-none focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]/30
                    "
                  />
                  <button
                    type="button"
                    onClick={handleChatSend}
                    disabled={!chatReply.trim()}
                    className="
                      w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                      bg-[var(--lavender-light)] text-[var(--lavender)] transition-opacity
                      disabled:opacity-30
                    "
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {hideDirections ? (
              suggestionsError ? (
                <div className="glass-card p-5 space-y-2">
                  <p className="text-sm font-medium text-[var(--warm-brown)]">Could not load provocation support</p>
                  <p className="text-sm text-[var(--warm-gray)] break-all">{suggestionsError}</p>
                </div>
              ) : suggestionsLoading && !provocation ? (
                <div className="glass-card p-5 space-y-3">
                  <p className="text-sm font-medium text-[var(--warm-brown)]">Preparing provocation...</p>
                  <p className="text-sm text-[var(--warm-gray)]">
                    The writing area is ready. Your provocation card will appear here as soon as it is available.
                  </p>
                </div>
              ) : null
            ) : suggestionsError ? (
              <div className="glass-card p-5 space-y-2">
                <p className="text-sm font-medium text-[var(--warm-brown)]">Could not load suggestions</p>
                <p className="text-sm text-[var(--warm-gray)] break-all">{suggestionsError}</p>
              </div>
            ) : suggestionsLoading ? (
              <div className="glass-card p-5 space-y-3">
                <p className="text-sm font-medium text-[var(--warm-brown)]">Generating suggestions...</p>
                <p className="text-sm text-[var(--warm-gray)]">
                  The writing area is ready. Suggestions will appear here as soon as they are available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.suggestions ?? []).map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: s.id * 0.08 }}
                  >
                    <SuggestionCard
                      id={s.id}
                      suggestion={s.suggestion}
                      showProvocateur={false}
                      selected={selected === s.id}
                      onSelect={() => setSelected(s.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </aside>

          <section className="space-y-5">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--sage)]" />
                <div>
                  <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                    {taskType === "story" ? "Short Story Task" : "Creative Metaphor Task"}
                  </p>
                  <h2 className="text-lg font-semibold text-[var(--warm-brown)]">Task prompt</h2>
                </div>
              </div>

              {promptError ? (
                <p className="text-sm text-[var(--warm-gray)] break-all">{promptError}</p>
              ) : promptLoading ? (
                <p className="text-sm text-[var(--warm-gray)]">Loading prompt...</p>
              ) : promptUnavailable ? (
                <p className="text-sm text-[var(--warm-gray)]">Prompt data is unavailable.</p>
              ) : taskType === "story" ? (
                <>
                  <div className="flex gap-2 flex-wrap">
                    {((prompt?.cue_words as string[]) ?? []).map((word) => (
                      <span
                        key={word}
                        className="px-3 py-1 rounded-xl bg-[var(--sage-light)]/30 text-[var(--sage-dark)] text-sm font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                    {prompt?.instruction as string}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-medium text-[var(--warm-brown)]">
                    {prompt?.metaphor_prompt as string}
                  </p>
                  <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                    {prompt?.instruction as string}
                  </p>
                </>
              )}
            </div>

            <div className="glass-card p-7 space-y-5">
              <div className="flex items-center gap-2">
                <PenLine className="w-5 h-5 text-[var(--sage)]" />
                <h2 className="text-xl font-semibold text-[var(--warm-brown)]">
                  {taskType === "story" ? "Write your story" : "Complete the metaphor"}
                </h2>
              </div>

              <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                {taskType === "story"
                  ? "Write a creative story of about 4-6 sentences. You may use or adapt the AI suggestions, or take your own direction entirely."
                  : "Complete the metaphor as creatively as you can. You may use the suggestions as inspiration, but the final response should be your own."}
              </p>

              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={timeExpired || saving}
                  placeholder={
                    taskType === "story"
                      ? "Write your story here..."
                      : "Write your metaphor response here..."
                  }
                  rows={12}
                  className="
                    w-full rounded-2xl bg-white/60 border border-[var(--sage-light)]/40
                    px-5 py-4 text-sm text-[var(--warm-brown)] leading-relaxed
                    placeholder:text-[var(--warm-gray)]/50
                    resize-none focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/40
                    transition-all duration-200
                  "
                />
                <div className="absolute bottom-3 right-4 text-xs text-[var(--warm-gray)]/60">
                  {text.trim().length} / 80+ characters
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || promptUnavailable}
                size="lg"
                className="w-full"
              >
                {saving
                  ? "Saving..."
                  : timeExpired
                  ? frictionActive && !gateCompleted
                    ? "Time is up - reflect and submit"
                    : "Time is up - submit now"
                  : frictionActive && !gateCompleted
                  ? "Reflect and submit"
                  : "Submit and continue"}
              </Button>
            </div>
          </section>
        </div>
      </motion.div>

      {/* Friction gate — full-screen liquid glass overlay */}
      <FrictionGate
        visible={showGate}
        taskType={taskType}
        requireIdeaSelection={!hideDirections}
        onComplete={handleGateComplete}
      />
    </div>
  );
}
