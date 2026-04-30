"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ParticipantState {
  participantId: string | null;
  conditionId: string | null;
  provocateurFlag: boolean;
  frictionFlag: boolean;
  taskOrder: string[];       // e.g. ["story", "metaphor"]
  currentRound: number;      // 1 or 2
  isPilot: boolean;

  setParticipant: (data: {
    participantId: string;
    conditionId: string | null;
    provocateurFlag: boolean;
    frictionFlag: boolean;
    taskOrder: string[] | null;
    isPilot?: boolean;
  }) => void;
  setCurrentRound: (round: number) => void;
  reset: () => void;
}

const initial = {
  participantId: null,
  conditionId: null,
  provocateurFlag: false,
  frictionFlag: false,
  taskOrder: [],
  currentRound: 1,
  isPilot: false,
};

export const useStore = create<ParticipantState>()(
  persist(
    (set) => ({
      ...initial,
      setParticipant: (data) =>
        set({
          participantId: data.participantId,
          conditionId: data.conditionId,
          provocateurFlag: data.provocateurFlag,
          frictionFlag: data.frictionFlag,
          taskOrder: data.taskOrder ?? [],
          isPilot: data.isPilot ?? false,
        }),
      setCurrentRound: (round) => set({ currentRound: round }),
      reset: () => set(initial),
    }),
    { name: "chi-experiment" }
  )
);
