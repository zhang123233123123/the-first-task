"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database, Download, Filter, RefreshCw, Search } from "lucide-react";
import { DebugGuard } from "@/components/DebugGuard";

import { Button } from "@/components/ui/Button";
import {
  api,
  type DebugParticipantDetail,
  type DebugParticipantSummary,
} from "@/lib/api";

type StudyModeFilter = "all" | "main" | "pilot";
type CompletedFilter = "all" | "true" | "false";
type SortOption =
  | "created_at_desc"
  | "created_at_asc"
  | "participant_id_asc"
  | "participant_id_desc";

const CONDITION_OPTIONS = [
  "all",
  "no_ai",
  "basic_ai",
  "provocateur",
  "friction",
  "prov_then_fric",
  "fric_then_prov",
] as const;

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "created_at_desc", label: "Newest first" },
  { value: "created_at_asc", label: "Oldest first" },
  { value: "participant_id_asc", label: "Participant ID A-Z" },
  { value: "participant_id_desc", label: "Participant ID Z-A" },
];

export default function DebugDataPage() {
  return (
    <Suspense>
      <DebugGuard>
        <DebugDataContent />
      </DebugGuard>
    </Suspense>
  );
}

function DebugDataContent() {
  const [query, setQuery] = useState("");
  const [studyMode, setStudyMode] = useState<StudyModeFilter>("all");
  const [condition, setCondition] = useState<(typeof CONDITION_OPTIONS)[number]>("all");
  const [completed, setCompleted] = useState<CompletedFilter>("all");
  const [sort, setSort] = useState<SortOption>("created_at_desc");
  const [participants, setParticipants] = useState<DebugParticipantSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DebugParticipantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const selectedSummary =
    participants.find((item) => item.participant_id === selectedParticipantId) ?? null;

  useEffect(() => {
    let cancelled = false;

    api
      .getDebugParticipants({
        q: query || undefined,
        condition: condition === "all" ? undefined : condition,
        completed:
          completed === "all" ? undefined : completed === "true",
        study_mode: studyMode === "all" ? undefined : studyMode,
        sort,
      })
      .then((result) => {
        if (cancelled) return;
        setParticipants(result.items);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setListError(error.message);
      })
      .finally(() => {
        if (!cancelled) {
          setListLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query, studyMode, condition, completed, sort]);

  useEffect(() => {
    if (!selectedParticipantId) return;

    let cancelled = false;

    api
      .getDebugParticipantDetail(selectedParticipantId)
      .then((result) => {
        if (cancelled) return;
        setDetail(result);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setDetailError(error.message);
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedParticipantId]);

  const completedCount = participants.filter((item) => item.completed).length;

  return (
    <div className="healing-bg min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--sage-light)]/25 px-3 py-1.5 text-xs font-medium text-[var(--sage-dark)]">
                <Database className="h-3.5 w-3.5" />
                Research Data Debug
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--warm-brown)]">
                  Stored Study Data
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--warm-gray)]">
                  Browse participants, inspect task progress, and expand raw stored JSON for baseline responses, task sessions, and post-task questionnaires.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/debug/conditions" className="inline-flex">
                <Button size="md">Condition Launcher</Button>
              </Link>
              <Link href="/debug/pilot" className="inline-flex">
                <Button size="md">Pilot Launcher</Button>
              </Link>
              <ExportDropdown studyMode={studyMode} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Visible participants" value={String(participants.length)} />
            <SummaryCard label="Completed in view" value={String(completedCount)} />
            <SummaryCard
              label="Selected participant"
              value={selectedParticipantId ? selectedParticipantId.slice(0, 8) : "None"}
            />
          </div>
        </motion.div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <section className="glass-card flex min-h-[720px] flex-col overflow-hidden">
            <div className="border-b border-[var(--sage-light)]/20 px-5 py-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[var(--sage)]" />
                <h2 className="text-lg font-semibold text-[var(--warm-brown)]">
                  Participant Overview
                </h2>
              </div>
            </div>

            <div className="grid gap-3 border-b border-[var(--sage-light)]/15 px-5 py-4 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
              <label className="space-y-1 text-sm text-[var(--warm-gray)]">
                <span className="text-xs font-medium uppercase tracking-wide">Search</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--warm-gray)]/60" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setListLoading(true);
                      setListError(null);
                      setQuery(e.target.value);
                    }}
                    placeholder="Participant ID"
                    className="w-full rounded-2xl border border-[var(--sage-light)]/35 bg-white/70 py-2 pl-10 pr-3 text-sm text-[var(--warm-brown)] outline-none transition-all focus:ring-2 focus:ring-[var(--sage)]/30"
                  />
                </div>
              </label>

              <label className="space-y-1 text-sm text-[var(--warm-gray)]">
                <span className="text-xs font-medium uppercase tracking-wide">Mode</span>
                <select
                  value={studyMode}
                  onChange={(e) => {
                    setListLoading(true);
                    setListError(null);
                    setStudyMode(e.target.value as StudyModeFilter);
                  }}
                  className="w-full rounded-2xl border border-[var(--sage-light)]/35 bg-white/70 px-3 py-2 text-sm text-[var(--warm-brown)] outline-none transition-all focus:ring-2 focus:ring-[var(--sage)]/30"
                >
                  <option value="all">All modes</option>
                  <option value="main">Main study</option>
                  <option value="pilot">Pilot</option>
                </select>
              </label>

              <label className="space-y-1 text-sm text-[var(--warm-gray)]">
                <span className="text-xs font-medium uppercase tracking-wide">Condition</span>
                <select
                  value={condition}
                  onChange={(e) => {
                    setListLoading(true);
                    setListError(null);
                    setCondition(e.target.value as (typeof CONDITION_OPTIONS)[number]);
                  }}
                  className="w-full rounded-2xl border border-[var(--sage-light)]/35 bg-white/70 px-3 py-2 text-sm text-[var(--warm-brown)] outline-none transition-all focus:ring-2 focus:ring-[var(--sage)]/30"
                >
                  {CONDITION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All conditions" : option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-[var(--warm-gray)]">
                <span className="text-xs font-medium uppercase tracking-wide">Completion</span>
                <select
                  value={completed}
                  onChange={(e) => {
                    setListLoading(true);
                    setListError(null);
                    setCompleted(e.target.value as CompletedFilter);
                  }}
                  className="w-full rounded-2xl border border-[var(--sage-light)]/35 bg-white/70 px-3 py-2 text-sm text-[var(--warm-brown)] outline-none transition-all focus:ring-2 focus:ring-[var(--sage)]/30"
                >
                  <option value="all">All</option>
                  <option value="true">Completed</option>
                  <option value="false">In progress</option>
                </select>
              </label>

              <label className="space-y-1 text-sm text-[var(--warm-gray)]">
                <span className="text-xs font-medium uppercase tracking-wide">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setListLoading(true);
                    setListError(null);
                    setSort(e.target.value as SortOption);
                  }}
                  className="w-full rounded-2xl border border-[var(--sage-light)]/35 bg-white/70 px-3 py-2 text-sm text-[var(--warm-brown)] outline-none transition-all focus:ring-2 focus:ring-[var(--sage)]/30"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end">
                <Button
                  size="md"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setListLoading(true);
                    api
                      .getDebugParticipants({
                        q: query || undefined,
                        condition: condition === "all" ? undefined : condition,
                        completed:
                          completed === "all" ? undefined : completed === "true",
                        sort,
                      })
                      .then((result) => {
                        setParticipants(result.items);
                        setListError(null);
                      })
                      .catch((error: Error) => setListError(error.message))
                      .finally(() => setListLoading(false));
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {listError ? (
                <ErrorCard message={listError} />
              ) : listLoading ? (
                <EmptyState message="Loading participants…" />
              ) : participants.length === 0 ? (
                <EmptyState message="No participants match the current filters." />
              ) : (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <button
                      key={participant.participant_id}
                      type="button"
                      onClick={() => {
                        setDetailLoading(true);
                        setDetailError(null);
                        setSelectedParticipantId(participant.participant_id);
                      }}
                      className={`w-full rounded-3xl border p-4 text-left transition-all ${
                        participant.participant_id === selectedParticipantId
                          ? "border-[var(--sage)] bg-[var(--sage-light)]/18 shadow-sm"
                          : "border-white/60 bg-white/55 hover:border-[var(--sage-light)] hover:bg-white/70"
                      }`}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <p className="font-mono text-sm font-medium text-[var(--warm-brown)] break-all">
                            {participant.participant_id}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Tag>{participant.study_mode ?? "main"}</Tag>
                            <Tag>{participant.condition_id ?? "unassigned"}</Tag>
                            <Tag>{participant.completed ? "completed" : "in progress"}</Tag>
                            {participant.provocateur_flag && <Tag>provocateur</Tag>}
                            {participant.friction_flag && <Tag>friction</Tag>}
                          </div>
                        </div>

                        <div className="text-right text-xs text-[var(--warm-gray)]">
                          <p>Created {formatDate(participant.created_at)}</p>
                          <p>Current page: {participant.current_page ?? "unknown"}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <StatusRow label="Baseline" ok={participant.baseline_completed} />
                        <StatusRow label="Task 1 artifact" ok={participant.task1_artifact_saved} />
                        <StatusRow label="Task 1 post-task" ok={participant.task1_posttask_saved} />
                        <StatusRow label="Task 2 artifact" ok={participant.task2_artifact_saved} />
                        <StatusRow label="Task 2 post-task" ok={participant.task2_posttask_saved} />
                        <StatusRow label="Task order" text={formatTaskOrder(participant.task_order)} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="glass-card flex min-h-[720px] flex-col overflow-hidden">
            <div className="border-b border-[var(--sage-light)]/20 px-5 py-4">
              <h2 className="text-lg font-semibold text-[var(--warm-brown)]">
                Participant Detail
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!selectedSummary ? (
                <EmptyState message="Select a participant from the list to inspect stored data." />
              ) : detailError ? (
                <ErrorCard message={detailError} />
              ) : detailLoading || !detail ? (
                <EmptyState message="Loading participant detail…" />
              ) : (
                <ParticipantDetailView detail={detail} />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function ExportDropdown({ studyMode }: { studyMode: StudyModeFilter }) {
  const [open, setOpen] = useState(false);

  const modeParam = studyMode === "all" ? "" : `study_mode=${studyMode}`;

  const exportLinks = [
    { label: "All data (JSON)", href: `${API_BASE}/debug/data/export/json${modeParam ? `?${modeParam}` : ""}` },
    { label: "Participants (CSV)", href: `${API_BASE}/debug/data/export/csv?table=participants${modeParam ? `&${modeParam}` : ""}` },
    { label: "Baseline (CSV)", href: `${API_BASE}/debug/data/export/csv?table=baseline${modeParam ? `&${modeParam}` : ""}` },
    { label: "Task Sessions (CSV)", href: `${API_BASE}/debug/data/export/csv?table=sessions${modeParam ? `&${modeParam}` : ""}` },
    { label: "Post-task (CSV)", href: `${API_BASE}/debug/data/export/csv?table=posttask${modeParam ? `&${modeParam}` : ""}` },
  ];

  return (
    <div className="relative">
      <Button size="md" onClick={() => setOpen((v) => !v)}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-[var(--sage-light)]/40 bg-white/95 shadow-lg backdrop-blur-sm">
            <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-[var(--warm-gray)]">
              {studyMode === "all" ? "All modes" : studyMode === "main" ? "Main study only" : "Pilot only"}
            </div>
            {exportLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-[var(--warm-brown)] hover:bg-[var(--sage-light)]/15 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ParticipantDetailView({ detail }: { detail: DebugParticipantDetail }) {
  const taskOne = detail.task_sessions.find((item) => item.task_round === 1) ?? null;
  const taskTwo = detail.task_sessions.find((item) => item.task_round === 2) ?? null;
  const postOne = detail.post_task_responses.find((item) => item.task_round === 1) ?? null;
  const postTwo = detail.post_task_responses.find((item) => item.task_round === 2) ?? null;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/60 bg-white/55 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--warm-gray)]">
          Participant
        </h3>
        <div className="mt-3 grid gap-2 text-sm text-[var(--warm-brown)] sm:grid-cols-2">
          <DetailRow label="Participant ID" value={detail.participant.participant_id} mono />
          <DetailRow label="Study mode" value={detail.participant.study_mode ?? "main"} />
          <DetailRow label="Condition" value={detail.participant.condition_id ?? "unassigned"} />
          <DetailRow label="Task order" value={formatTaskOrder(detail.participant.task_order)} />
          <DetailRow label="Current page" value={detail.participant.current_page ?? "unknown"} />
          <DetailRow label="Completed" value={detail.participant.completed ? "Yes" : "No"} />
          <DetailRow label="Created at" value={formatDate(detail.participant.created_at)} />
          <DetailRow label="Consent given" value={detail.participant.consent_given ? "Yes" : "No"} />
          <DetailRow label="Completed at" value={formatDate(detail.participant.completion_timestamp)} />
        </div>
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/55 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--warm-gray)]">
          Baseline
        </h3>
        <div className="mt-3 grid gap-2 text-sm text-[var(--warm-brown)] sm:grid-cols-2">
          <DetailRow
            label="Stored"
            value={detail.baseline_response ? "Yes" : "No"}
          />
          <DetailRow
            label="Completion time"
            value={formatDuration(detail.baseline_response?.completion_time_seconds)}
          />
          <DetailRow
            label="Created at"
            value={formatDate(detail.baseline_response?.created_at ?? null)}
          />
          <DetailRow
            label="Response keys"
            value={String(Object.keys(detail.baseline_response?.responses ?? {}).length)}
          />
        </div>
        <JsonSection title="Baseline responses JSON" value={detail.baseline_response?.responses ?? null} />
      </section>

      <TaskSection title="Task 1" session={taskOne} postTask={postOne} />
      <TaskSection title="Task 2" session={taskTwo} postTask={postTwo} />
    </div>
  );
}

function TaskSection({
  title,
  session,
  postTask,
}: {
  title: string;
  session: DebugParticipantDetail["task_sessions"][number] | null;
  postTask: DebugParticipantDetail["post_task_responses"][number] | null;
}) {
  const interactionCount = Array.isArray(session?.interaction_log)
    ? session.interaction_log.length
    : 0;

  return (
    <section className="rounded-3xl border border-white/60 bg-white/55 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--warm-gray)]">
        {title}
      </h3>

      <div className="mt-3 grid gap-2 text-sm text-[var(--warm-brown)] sm:grid-cols-2">
        <DetailRow label="Task type" value={session?.task_type ?? "Not started"} />
        <DetailRow label="Task round" value={session ? String(session.task_round) : "Not started"} />
        <DetailRow label="Gate shown" value={session?.gate_shown ? "Yes" : "No"} />
        <DetailRow label="Gate completed" value={session?.gate_completed ? "Yes" : "No"} />
        <DetailRow label="Gate dwell time" value={formatDuration(session?.gate_dwell_time_seconds)} />
        <DetailRow label="Production dwell time" value={formatDuration(session?.production_dwell_time_seconds)} />
        <DetailRow label="Submission timestamp" value={formatDate(session?.submission_timestamp ?? null)} />
        <DetailRow label="Interaction log events" value={String(interactionCount)} />
        <DetailRow
          label="Suggestions stored"
          value={countJsonItems(session?.suggestions_shown)}
        />
        <DetailRow
          label="Post-task stored"
          value={postTask ? "Yes" : "No"}
        />
      </div>

      <div className="mt-4 space-y-3">
        <ArtifactPreview text={session?.final_artifact ?? null} />
        <JsonSection title="Suggestions JSON" value={session?.suggestions_shown ?? null} />
        <JsonSection title="Provocation JSON" value={session?.provocation_shown ?? null} />
        <JsonSection title="Gate responses JSON" value={session?.gate_responses ?? null} />
        <JsonSection title="Interaction log JSON" value={session?.interaction_log ?? null} />
        <JsonSection title="Post-task responses JSON" value={postTask?.responses ?? null} />
      </div>
    </section>
  );
}

function ArtifactPreview({ text }: { text: string | null }) {
  return (
    <div className="rounded-2xl border border-[var(--sage-light)]/25 bg-[var(--cream)]/65 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--warm-gray)]">
        Final artifact
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--warm-brown)]">
        {text?.trim() ? text : "No final artifact stored."}
      </p>
    </div>
  );
}

function JsonSection({ title, value }: { title: string; value: unknown }) {
  return (
    <details className="rounded-2xl border border-[var(--sage-light)]/25 bg-[var(--cream)]/65">
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-[var(--warm-brown)]">
        {title}
      </summary>
      <div className="border-t border-[var(--sage-light)]/20 px-3 py-3">
        <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs leading-relaxed text-[var(--warm-gray)]">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </details>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--warm-gray)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--warm-brown)]">
        {value}
      </p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--peach-light)]/70 px-2.5 py-1 text-xs font-medium text-[var(--warm-brown)]">
      {children}
    </span>
  );
}

function StatusRow({
  label,
  ok,
  text,
}: {
  label: string;
  ok?: boolean;
  text?: string;
}) {
  const value = text ?? (ok ? "Yes" : "No");
  const tone = ok == null ? "text-[var(--warm-brown)]" : ok ? "text-[var(--sage-dark)]" : "text-[var(--warm-gray)]";

  return (
    <div className="rounded-2xl bg-[var(--cream)]/65 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-[var(--warm-gray)]">{label}</p>
      <p className={`mt-1 text-sm font-medium ${tone}`}>{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[var(--cream)]/65 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-[var(--warm-gray)]">{label}</p>
      <p className={`mt-1 text-sm text-[var(--warm-brown)] ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-[var(--sage-light)]/35 bg-white/35 p-6 text-center text-sm text-[var(--warm-gray)]">
      {message}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-red-200/60 bg-red-50/70 p-4 text-sm text-red-700">
      {message}
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatDuration(value: number | null | undefined) {
  if (value == null) return "Not available";
  return `${value.toFixed(1)}s`;
}

function formatTaskOrder(order: string[] | null | undefined) {
  if (!order || order.length === 0) return "Not assigned";
  return order.join(" → ");
}

function countJsonItems(value: unknown) {
  if (Array.isArray(value)) return String(value.length);
  if (value && typeof value === "object") return String(Object.keys(value as Record<string, unknown>).length);
  return "0";
}
