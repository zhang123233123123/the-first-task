"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChatBubble } from "@/components/ChatBubble";
import { InlineFrictionCard } from "@/components/InlineFrictionCard";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { BookOpen, PenLine, Send } from "lucide-react";

const MIN_CHARS = 80;
const FRICTION_EARLY_CHARS = 40;
const TASK_TIME_LIMIT_SECONDS = 5 * 60;

// ── Types ────────────────────────────────────────────────────

type MsgType =
  | "suggestion"
  | "prov_risk"
  | "prov_alt"
  | "prov_question"
  | "user_reply"
  | "friction_card"
  | "friction_done";

interface ChatMessage {
  id: string;
  type: MsgType;
  role: "ai" | "user";
  content: string;
  provRoundIndex?: number;
  frictionDone?: boolean;
  /** prov_risk / prov_alt: show "Continue →" to reveal next step */
  pendingReveal?: boolean;
}

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
  combined_order?: string | null;
}

// ── Page ─────────────────────────────────────────────────────

export default function SuggestionsPage({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round: roundStr } = use(params);
  const round = parseInt(roundStr, 10);

  const router = useRouter();
  const { participantId, taskOrder, setCurrentRound } = useStore();

  const [data, setData] = useState<SuggestionsData | null>(null);
  const [promptData, setPromptData] = useState<Record<string, unknown> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesInitialized, setMessagesInitialized] = useState(false);

  const [text, setText] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [followupLoading, setFollowupLoading] = useState(false);
  const [frictionTriggered, setFrictionTriggered] = useState(false);

  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [promptLoading, setPromptLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(TASK_TIME_LIMIT_SECONDS);
  const [timeExpired, setTimeExpired] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | undefined>();

  const startTime = useRef<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  // Store full Provocation objects by round index so we can reveal alt/question on demand
  const provRoundsRef = useRef<Map<number, Provocation>>(new Map());

  // ── Init ──────────────────────────────────────────────────

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

  useEffect(() => {
    setCurrentRound(round);
  }, [round, setCurrentRound]);

  useEffect(() => {
    if (!participantId) {
      router.replace("/consent");
      return;
    }
    api
      .getTaskPrompt(participantId, round)
      .then((result) => {
        setPromptData(result.prompt);
        setPromptError(null);
      })
      .catch((e: Error) => setPromptError(e.message))
      .finally(() => setPromptLoading(false));

    api
      .getSuggestions(participantId, round)
      .then((d) => {
        setData(d as unknown as SuggestionsData);
        setSuggestionsError(null);
      })
      .catch((e: Error) => setSuggestionsError(e.message))
      .finally(() => setSuggestionsLoading(false));
  }, [participantId, round, router]);

  // ── Derived flags from backend response ──────────────────

  const provocateurActive = data?.provocateur_flag ?? false;
  const frictionActive = data?.friction_flag ?? false;
  const combinedOrder = data?.combined_order ?? null;
  const frictionTriggerChars =
    combinedOrder === "fric_first" ? FRICTION_EARLY_CHARS : MIN_CHARS;
  const provocation = data?.provocation ?? null;
  const taskType = (data?.task_type ?? taskOrder[round - 1] ?? "story") as
    | "story"
    | "metaphor";
  const prompt = (promptData ?? data?.prompt ?? null) as Record<
    string,
    unknown
  > | null;

  // ── Initialize message stream once data loads ────────────

  useEffect(() => {
    if (suggestionsLoading || messagesInitialized || !data) return;
    setMessagesInitialized(true);

    if (!data.provocateur_flag) {
      // basic_ai / friction / no_ai → show suggestions as chat bubbles
      const suggMessages: ChatMessage[] = (data.suggestions ?? []).map((s) => ({
        id: `suggestion-${s.id}`,
        type: "suggestion",
        role: "ai",
        content: s.suggestion,
      }));
      setMessages(suggMessages);
    } else {
      // provocateur / combined → start prov flow (unless fric_first: wait for gate)
      if (data.combined_order !== "fric_first" && data.provocation) {
        provRoundsRef.current.set(0, data.provocation);
        setMessages([
          {
            id: "prov_risk-0",
            type: "prov_risk",
            role: "ai",
            content: data.provocation.risk,
            provRoundIndex: 0,
            pendingReveal: true,
          },
        ]);
      }
      // fric_first: provocation will be started after the friction card is completed
    }
  }, [suggestionsLoading, data, messagesInitialized]);

  // ── Friction inline trigger ───────────────────────────────

  useEffect(() => {
    if (
      frictionActive &&
      !frictionTriggered &&
      text.trim().length >= frictionTriggerChars
    ) {
      setFrictionTriggered(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `friction-${Date.now()}`,
          type: "friction_card",
          role: "ai",
          content: "",
          frictionDone: false,
        },
      ]);
    }
  }, [text, frictionActive, frictionTriggered, frictionTriggerChars]);

  // ── Auto-scroll chat to bottom ────────────────────────────

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Derived state ─────────────────────────────────────────

  const frictionBlocking = messages.some(
    (m) => m.type === "friction_card" && !m.frictionDone
  );
  const showReplyInput =
    messages[messages.length - 1]?.type === "prov_question" &&
    !followupLoading;
  const canSubmit = !saving && (text.trim().length >= MIN_CHARS || timeExpired);
  const promptUnavailable = !promptLoading && !prompt;

  const noAiMode =
    messagesInitialized &&
    !provocateurActive &&
    !frictionActive &&
    (data?.suggestions?.length ?? 0) === 0;

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  // ── Handlers ──────────────────────────────────────────────

  const handleRevealNext = (msgId: string) => {
    setMessages((prev) => {
      const msgIdx = prev.findIndex((m) => m.id === msgId);
      if (msgIdx === -1) return prev;
      const msg = prev[msgIdx];
      const roundIdx = msg.provRoundIndex ?? 0;
      const prov = provRoundsRef.current.get(roundIdx);
      if (!prov) return prev;

      const updated = prev.map((m) =>
        m.id === msgId ? { ...m, pendingReveal: false } : m
      );

      if (msg.type === "prov_risk") {
        return [
          ...updated,
          {
            id: `prov_alt-${roundIdx}-${Date.now()}`,
            type: "prov_alt" as MsgType,
            role: "ai" as const,
            content: prov.alternative,
            provRoundIndex: roundIdx,
            pendingReveal: true,
          },
        ];
      }
      if (msg.type === "prov_alt") {
        return [
          ...updated,
          {
            id: `prov_question-${roundIdx}-${Date.now()}`,
            type: "prov_question" as MsgType,
            role: "ai" as const,
            content: prov.question,
            provRoundIndex: roundIdx,
          },
        ];
      }
      return prev;
    });
  };

  const handleChatSend = async () => {
    const trimmed = chatReply.trim();
    if (!trimmed || followupLoading) return;

    const lastQuestion = [...messages]
      .reverse()
      .find((m) => m.type === "prov_question");
    const originalQuestion = lastQuestion?.content ?? "";

    const replyMsg: ChatMessage = {
      id: `user_reply-${Date.now()}`,
      type: "user_reply",
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, replyMsg]);
    setChatReply("");

    if (participantId) {
      api.logEvent(participantId, round, {
        type: "prov_reply",
        reply: trimmed,
      });
    }

    if (participantId) {
      setFollowupLoading(true);
      try {
        const followup = await api.getProvFollowup(
          participantId,
          round,
          trimmed,
          originalQuestion
        );
        const nextRoundIdx = provRoundsRef.current.size;
        provRoundsRef.current.set(nextRoundIdx, followup);
        setMessages((prev) => [
          ...prev,
          {
            id: `prov_risk-${nextRoundIdx}-${Date.now()}`,
            type: "prov_risk",
            role: "ai",
            content: followup.risk,
            provRoundIndex: nextRoundIdx,
            pendingReveal: true,
          },
        ]);
      } catch {
        // silently skip follow-up on error
      } finally {
        setFollowupLoading(false);
      }
    }
  };

  const handleFrictionComplete = async (
    gateResponses: Record<string, unknown>
  ) => {
    const { dwell_seconds, ...responses } = gateResponses as Record<
      string,
      unknown
    > & { dwell_seconds: number };

    setMessages((prev) => [
      ...prev.map((m) =>
        m.type === "friction_card" ? { ...m, frictionDone: true } : m
      ),
      {
        id: `friction_done-${Date.now()}`,
        type: "friction_done",
        role: "ai",
        content: "Thanks for reflecting. Continue writing!",
      },
    ]);

    if (participantId) {
      await api.saveGate(participantId, round, responses, dwell_seconds);
    }

    // fric_first: start provocation after friction completes
    if (combinedOrder === "fric_first" && provocation) {
      const nextRoundIdx = provRoundsRef.current.size;
      provRoundsRef.current.set(nextRoundIdx, provocation);
      setMessages((prev) => [
        ...prev,
        {
          id: `prov_risk-${nextRoundIdx}-${Date.now()}`,
          type: "prov_risk",
          role: "ai",
          content: provocation.risk,
          provRoundIndex: nextRoundIdx,
          pendingReveal: true,
        },
      ]);
    }
  };

  const handleSubmit = () => {
    void submitArtifact();
  };

  const submitArtifact = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const dwell = (Date.now() - (startTime.current ?? Date.now())) / 1000;
    if (participantId) {
      await api.saveArtifact(participantId, round, text.trim(), dwell);
      await api.updateProgress(participantId, `task/${round}/survey`);
    }
    router.push(`/task/${round}/survey`);
  };

  // ── Render a single chat message ─────────────────────────

  const renderMessage = (msg: ChatMessage) => {
    if (msg.type === "friction_card") {
      if (msg.frictionDone) {
        return (
          <div
            key={msg.id}
            id={msg.id}
            className="text-xs text-[var(--warm-gray)]/60 text-center py-1 italic"
          >
            Reflection completed
          </div>
        );
      }
      return (
        <div key={msg.id} id={msg.id}>
          <InlineFrictionCard
            taskType={taskType}
            requireIdeaSelection={!provocateurActive}
            onComplete={(r) => void handleFrictionComplete(r)}
          />
        </div>
      );
    }

    if (msg.type === "prov_question") {
      return (
        <div key={msg.id}>
          <ChatBubble
            role="ai"
            id={msg.id}
            highlight={highlightedId === msg.id}
          >
            <span className="font-medium italic">{msg.content}</span>
          </ChatBubble>
        </div>
      );
    }

    const bubbleContent = (
      <ChatBubble role={msg.role} id={msg.id} highlight={highlightedId === msg.id}>
        <span>{msg.content}</span>
      </ChatBubble>
    );

    if (msg.pendingReveal && (msg.type === "prov_risk" || msg.type === "prov_alt")) {
      return (
        <div key={msg.id} className="space-y-1">
          {bubbleContent}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleRevealNext(msg.id)}
              className="text-xs text-[var(--sage)] hover:text-[var(--sage-dark)] font-medium px-2 py-1 rounded-lg transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      );
    }

    return <div key={msg.id}>{bubbleContent}</div>;
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="healing-bg min-h-screen flex flex-col px-4 py-6 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex-1 flex flex-col gap-4 w-full max-w-[1400px] mx-auto"
      >
        <ProgressBar
          step={round === 1 ? 1 : 8}
          total={16}
          label={`Task ${round} workspace`}
        />

        {/* Two-column grid: stacks on narrow screens, 2-col on lg+ */}
        <div className="flex-1 grid gap-4 grid-cols-1 lg:grid-cols-[320px_1fr] lg:h-[calc(100vh-130px)]">

          {/* ── Left: AI Panel + Timer ── */}
          <div className="flex flex-col gap-4">

            {/* AI content card */}
            <aside className="glass-card flex flex-col flex-1 overflow-hidden" style={{ minHeight: "240px" }}>
              <div className="px-4 pt-4 pb-2 border-b border-[var(--sage-light)]/20 flex-shrink-0">
                <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                  {provocateurActive ? "AI Challenge" : noAiMode ? "No AI" : "AI Suggestions"}
                </p>
              </div>

              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {noAiMode ? (
                  <p className="text-sm text-[var(--warm-gray)] text-center pt-4 leading-relaxed">
                    No AI assistance in this condition.
                    <br />
                    Write freely in the area to the right.
                  </p>
                ) : suggestionsLoading && !messagesInitialized ? (
                  <div className="flex flex-col items-center gap-2 pt-6">
                    <div className="w-5 h-5 rounded-full border-2 border-[var(--sage-light)]/40 border-t-[var(--sage)] animate-spin" />
                    <p className="text-xs text-[var(--warm-gray)]">
                      {provocateurActive ? "Preparing challenge…" : "Generating suggestions…"}
                    </p>
                  </div>
                ) : suggestionsError ? (
                  <p className="text-xs text-red-500 break-all">{suggestionsError}</p>
                ) : (
                  messages.map((msg) => renderMessage(msg))
                )}

                {followupLoading && (
                  <div className="flex items-center gap-2 px-1 py-1">
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--lavender)]/40 border-t-[var(--lavender)] animate-spin" />
                    <span className="text-xs text-[var(--warm-gray)]">Thinking…</span>
                  </div>
                )}
              </div>

              {/* Reply input — only visible for provocateur, but card structure is always present */}
              {showReplyInput && (
                <div className="flex gap-2 items-end p-3 border-t border-[var(--sage-light)]/20 flex-shrink-0">
                  <textarea
                    value={chatReply}
                    onChange={(e) => setChatReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleChatSend();
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
                    onClick={() => void handleChatSend()}
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
              )}
            </aside>

            {/* Timer card */}
            <div className="glass-card p-5 flex-shrink-0">
              <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide mb-2">
                Time Limit
              </p>
              <p
                className={`text-4xl font-bold tabular-nums tracking-tight ${
                  timeExpired ? "text-red-600" : "text-[var(--warm-brown)]"
                }`}
              >
                {minutes}:{seconds}
              </p>
              <p className="text-xs text-[var(--warm-gray)] mt-1">
                {timeExpired ? "Time is up. Submit your current response." : "remaining"}
              </p>
            </div>
          </div>

          {/* ── Right: Writing Area ── */}
          <section className="flex flex-col gap-4 lg:h-full overflow-hidden">
            {/* Task prompt card */}
            <div className="glass-card p-5 space-y-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--sage)]" />
                <div>
                  <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
                    {taskType === "story" ? "Short Story Task" : "Creative Metaphor Task"}
                  </p>
                  <p className="text-sm font-semibold text-[var(--warm-brown)]">Task prompt</p>
                </div>
              </div>
              {promptError ? (
                <p className="text-sm text-[var(--warm-gray)] break-all">{promptError}</p>
              ) : promptLoading ? (
                <p className="text-sm text-[var(--warm-gray)]">Loading prompt…</p>
              ) : !prompt ? (
                <p className="text-sm text-[var(--warm-gray)]">Prompt data unavailable.</p>
              ) : taskType === "story" ? (
                <>
                  <div className="flex gap-2 flex-wrap">
                    {((prompt.cue_words as string[]) ?? []).map((word) => (
                      <span
                        key={word}
                        className="px-3 py-1 rounded-xl bg-[var(--sage-light)]/30 text-[var(--sage-dark)] text-sm font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                    {prompt.instruction as string}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-[var(--warm-brown)]">
                    {prompt.metaphor_prompt as string}
                  </p>
                  <p className="text-sm text-[var(--warm-gray)] leading-relaxed">
                    {prompt.instruction as string}
                  </p>
                </>
              )}
            </div>

            {/* Writing card */}
            <div className="glass-card p-6 flex flex-col flex-1 space-y-4 min-h-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <PenLine className="w-4 h-4 text-[var(--sage)]" />
                <h2 className="text-base font-semibold text-[var(--warm-brown)]">
                  {taskType === "story" ? "Write your story" : "Complete the metaphor"}
                </h2>
              </div>

              {frictionBlocking && (
                <p className="text-xs text-[var(--lavender)] bg-[var(--lavender-light)]/20 rounded-xl px-3 py-2 flex-shrink-0">
                  Complete the reflection in the left panel to continue writing.
                </p>
              )}

              <div className="relative flex-1 flex flex-col">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={timeExpired || saving || frictionBlocking}
                  placeholder={
                    taskType === "story"
                      ? "Write your story here…"
                      : "Write your metaphor response here…"
                  }
                  className="
                    flex-1 w-full rounded-2xl bg-white/80 border border-[var(--sage-light)]/40
                    px-5 py-4 text-sm text-[var(--warm-brown)] leading-relaxed
                    placeholder:text-[var(--warm-gray)]/50
                    resize-none focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/40
                    transition-all duration-200
                    disabled:opacity-60 disabled:cursor-not-allowed
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
                className="w-full flex-shrink-0"
              >
                {saving
                  ? "Saving…"
                  : timeExpired
                  ? "Time is up — submit now"
                  : "Submit and continue"}
              </Button>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
}
