const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

// ── Participants ──────────────────────────────────────────────
export const api = {
  initParticipant: (condition?: string) =>
    request<{
      participant_id: string;
      condition_id: string;
      provocateur_flag: boolean;
      friction_flag: boolean;
      task_order: string[];
    }>("/participants/init", {
      method: "POST",
      body: JSON.stringify({ condition: condition ?? null }),
    }),

  getParticipant: (id: string) =>
    request<{
      participant_id: string;
      condition_id: string;
      provocateur_flag: boolean;
      friction_flag: boolean;
      task_order: string[];
      current_page: string;
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

  // ── Suggestions ─────────────────────────────────────────────
  getSuggestions: (id: string, round: number) =>
    request<{
      task_type: string;
      prompt: Record<string, unknown>;
      suggestions: Array<Record<string, unknown>>;
      provocateur_flag: boolean;
      friction_flag: boolean;
    }>(`/suggestions/${id}/${round}`),

  // ── Responses ───────────────────────────────────────────────
  saveBaseline: (participantId: string, responses: Record<string, unknown>, completionTimeSec: number) =>
    request("/responses/baseline", {
      method: "POST",
      body: JSON.stringify({
        participant_id: participantId,
        responses,
        completion_time_seconds: completionTimeSec,
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
};
