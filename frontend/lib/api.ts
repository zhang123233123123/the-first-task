const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export interface DebugParticipantSummary {
  participant_id: string;
  condition_id: string | null;
  study_mode: string;
  provocateur_flag: boolean;
  friction_flag: boolean;
  task_order: string[] | null;
  current_page: string | null;
  completed: boolean;
  created_at: string | null;
  completion_timestamp: string | null;
  baseline_completed: boolean;
  task1_artifact_saved: boolean;
  task2_artifact_saved: boolean;
  task1_gate_completed: boolean;
  task2_gate_completed: boolean;
  task1_posttask_saved: boolean;
  task2_posttask_saved: boolean;
}

export interface DebugBaselineResponse {
  participant_id: string;
  responses: Record<string, unknown> | null;
  completion_time_seconds: number | null;
  created_at: string | null;
}

export interface DebugTaskSession {
  task_round: number;
  task_type: string;
  suggestions_shown: unknown;
  provocation_shown: unknown;
  gate_shown: boolean;
  gate_completed: boolean;
  gate_responses: Record<string, unknown> | null;
  gate_dwell_time_seconds: number | null;
  final_artifact: string | null;
  submission_timestamp: string | null;
  production_dwell_time_seconds: number | null;
  interaction_log: unknown;
  created_at: string | null;
}

export interface DebugPostTaskResponse {
  task_round: number;
  task_type: string;
  responses: Record<string, unknown> | null;
  completion_time_seconds: number | null;
  created_at: string | null;
}

export interface DebugParticipantDetail {
  participant: {
    participant_id: string;
    condition_id: string | null;
    study_mode: string;
    provocateur_flag: boolean;
    friction_flag: boolean;
    task_order: string[] | null;
    stratum: string | null;
    consent_given: boolean;
    consent_timestamp: string | null;
    current_page: string | null;
    completed: boolean;
    completion_timestamp: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  baseline_response: DebugBaselineResponse | null;
  task_sessions: DebugTaskSession[];
  post_task_responses: DebugPostTaskResponse[];
}

// ── Participants ──────────────────────────────────────────────
export const api = {
  initParticipant: (condition?: string, studyMode: string = "main") =>
    request<{
      participant_id: string;
      condition_id: string | null;
      provocateur_flag: boolean;
      friction_flag: boolean;
      task_order: string[] | null;
    }>("/participants/init", {
      method: "POST",
      body: JSON.stringify({ condition: condition ?? null, study_mode: studyMode }),
    }),

  getParticipant: (id: string) =>
    request<{
      participant_id: string;
      condition_id: string | null;
      provocateur_flag: boolean;
      friction_flag: boolean;
      task_order: string[] | null;
      current_page: string | null;
      completed: boolean;
    }>(`/participants/${id}`),

  recordConsent: (id: string) =>
    request(`/participants/${id}/consent`, {
      method: "POST",
      body: JSON.stringify({ consent_given: true }),
    }),

  updateProgress: (id: string, page: string) =>
    request(`/participants/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ current_page: page }),
    }),

  completeStudy: (id: string) =>
    request(`/participants/${id}/complete`, { method: "POST" }),

  getDebugParticipants: (params?: {
    q?: string;
    condition?: string;
    completed?: boolean;
    study_mode?: string;
    sort?: "created_at_desc" | "created_at_asc" | "participant_id_asc" | "participant_id_desc";
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.condition) searchParams.set("condition", params.condition);
    if (params?.completed != null) searchParams.set("completed", String(params.completed));
    if (params?.study_mode) searchParams.set("study_mode", params.study_mode);
    if (params?.sort) searchParams.set("sort", params.sort);
    const query = searchParams.toString();
    return request<{ count: number; items: DebugParticipantSummary[] }>(
      `/debug/data/participants${query ? `?${query}` : ""}`
    );
  },

  getDebugParticipantDetail: (participantId: string) =>
    request<DebugParticipantDetail>(`/debug/data/participants/${participantId}`),

  // ── Suggestions ─────────────────────────────────────────────
  getTaskPrompt: (id: string, round: number) =>
    request<{
      task_type: string;
      prompt: Record<string, unknown>;
    }>(`/suggestions/prompt/${id}/${round}`),

  getSuggestions: (id: string, round: number) =>
    request<{
      task_type: string;
      prompt: Record<string, unknown>;
      suggestions: Array<Record<string, unknown>>;
      provocateur_flag: boolean;
      friction_flag: boolean;
      combined_order?: string | null;
    }>(`/suggestions/${id}/${round}`),

  // ── Responses ───────────────────────────────────────────────
  saveBaseline: (participantId: string, responses: Record<string, unknown>, completionTimeSec: number, pilot: boolean = false) =>
    request<{
      status: string;
      condition_id?: string;
      provocateur_flag?: boolean;
      friction_flag?: boolean;
      task_order?: string[];
      combined_order?: string | null;
    }>("/responses/baseline", {
      method: "POST",
      body: JSON.stringify({
        participant_id: participantId,
        responses,
        completion_time_seconds: completionTimeSec,
        pilot,
      }),
    }),

  markGateShown: (participantId: string, round: number) =>
    request("/responses/gate-shown", {
      method: "POST",
      body: JSON.stringify({
        participant_id: participantId,
        task_round: round,
      }),
    }),

  saveGate: (participantId: string, round: number, gateResponses: Record<string, unknown>, dwellSec: number) =>
    request("/responses/gate", {
      method: "POST",
      body: JSON.stringify({
        participant_id: participantId,
        task_round: round,
        gate_responses: gateResponses,
        gate_dwell_time_seconds: dwellSec,
      }),
    }),

  saveArtifact: (participantId: string, round: number, artifact: string, dwellSec: number) =>
    request("/responses/artifact", {
      method: "POST",
      body: JSON.stringify({
        participant_id: participantId,
        task_round: round,
        final_artifact: artifact,
        production_dwell_time_seconds: dwellSec,
      }),
    }),

  savePostTask: (participantId: string, round: number, responses: Record<string, unknown>, completionTimeSec: number) =>
    request("/responses/post-task", {
      method: "POST",
      body: JSON.stringify({
        participant_id: participantId,
        task_round: round,
        responses,
        completion_time_seconds: completionTimeSec,
      }),
    }),

  logEvent: (participantId: string, round: number, event: Record<string, unknown>) =>
    request("/responses/log-event", {
      method: "POST",
      body: JSON.stringify({ participant_id: participantId, task_round: round, event }),
    }),

  chatFollowup: (participantId: string, round: number, userMessage: string, originalQuestion?: string) =>
    request<
      | { type: "suggestion"; message: string }
      | { type: "provocation"; risk: string; alternative: string; question: string }
    >("/suggestions/chat", {
      method: "POST",
      body: JSON.stringify({
        participant_id: participantId,
        task_round: round,
        user_message: userMessage,
        original_question: originalQuestion ?? null,
      }),
    }),

  getFrictionOptions: (participantId: string, round: number, userText: string) =>
    request<{ weakness_options: string[]; strategy_options: string[] }>("/suggestions/friction-options", {
      method: "POST",
      body: JSON.stringify({
        participant_id: participantId,
        task_round: round,
        user_text: userText,
      }),
    }),

  getProvFollowup: (
    participantId: string,
    round: number,
    userReply: string,
    originalQuestion: string,
  ) =>
    request<{ risk: string; alternative: string; question: string }>("/suggestions/prov-followup", {
      method: "POST",
      body: JSON.stringify({
        participant_id: participantId,
        task_round: round,
        user_reply: userReply,
        original_question: originalQuestion,
      }),
    }),
};
