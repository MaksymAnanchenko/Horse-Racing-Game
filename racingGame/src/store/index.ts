import { createStore } from "vuex";
import type {
  RootState,
  Horse,
  RoundSpec,
  RoundResult,
  UIRoundAnimation
} from "../types";
import { useGameLogic } from "@/composables/useGameLogic";
import { ROUND_DISTANCES, HORSE_COLORS, RANK_POINTS } from "@/constants";

type Ctx = {
  state: RootState;
  commit: (type: string, payload?: any) => void;
  dispatch: (type: string, payload?: any) => Promise<any>;
};

const {
  generateAnimalNames,
  pickParticipants,
  buildRounds,
  simulateRound: simRound,
  clamp
} = useGameLogic();

export const store = createStore({
  state: {
    horses: [],
    rounds: [],
    results: [],
    currentRoundIndex: -1,
    status: "idle",
    currentAnimation: null,
    participantCount: 10,
    selectedParticipants: []
  },
  getters: {
    currentRound(state: RootState): RoundSpec | null {
      if (
        state.currentRoundIndex < 0 ||
        state.currentRoundIndex >= state.rounds.length
      )
        return null;
      return state.rounds[state.currentRoundIndex];
    },
    isRunning: (s: RootState) => s.status === "running"
  },
  mutations: {
    RESET(state: RootState) {
      state.horses = [];
      state.rounds = [];
      state.results = [];
      state.currentRoundIndex = -1;
      state.status = "idle";
      state.currentAnimation = null;
    },
    SET_HORSES(state: RootState, horses: Horse[]) {
      state.horses = horses;
    },
    SET_ROUNDS(state: RootState, rounds: RoundSpec[]) {
      state.rounds = rounds;
      state.currentRoundIndex = -1;
      state.results = [];
      state.status = "generated";
      state.currentAnimation = null;
    },
    SET_STATUS(state: RootState, status: RootState["status"]) {
      state.status = status;
    },
    SET_PARTICIPANT_COUNT(state: RootState, n: number) {
      // clamp between 1 and 20
      const clamped = Math.max(1, Math.min(20, Math.floor(n)));
      state.participantCount = clamped;
    },
    SET_SELECTED_PARTICIPANTS(state: RootState, ids: number[]) {
      state.selectedParticipants = ids;
    },
    START_RACE(state: RootState) {
      // Begin a single round run. On first start jump to round 0, otherwise keep current index.
      state.status = "running";
      if (state.currentRoundIndex === -1) {
        state.currentRoundIndex = 0;
      }
    },
    APPEND_RESULT(state: RootState, result: RoundResult) {
      state.results.push(result);
    },
    NEXT_ROUND(state: RootState) {
      state.currentRoundIndex += 1;
      if (state.currentRoundIndex >= state.rounds.length) {
        state.status = "finished";
      }
    },
    SET_ANIMATION(state: RootState, payload: UIRoundAnimation | null) {
      state.currentAnimation = payload;
    },
    APPLY_SCORING(
      state: RootState,
      payload: { round: RoundSpec; result: RoundResult }
    ) {
      // Increase horse condition based on finishing rank; clamp to 0..100
      payload.result.finishes.forEach((f) => {
        // apply diminishing returns as condition grows
        const base = RANK_POINTS[f.rank - 1] ?? 0;
        const idx = state.horses.findIndex((h) => h.id === f.horseId);
        if (idx >= 0) {
          const h = state.horses[idx];
          const diminish = 1 - h.condition / 200; // at 100 cond -> 0.5x gain
          h.condition = clamp(
            h.condition + Math.round(base * diminish),
            0,
            100
          );
        }
      });
    }
  },
  actions: {
    generate({ commit, state }: Ctx) {
      // Generate 20 horses with unique colors; initial condition = 0
      const names = generateAnimalNames(20);
      const horses: Horse[] = Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        name: names[i],
        color: HORSE_COLORS[i % HORSE_COLORS.length],
        condition: 0
      }));
      commit("SET_HORSES", horses);

      // Choose a fixed participant set for all 6 rounds based on participantCount
      const participants = pickParticipants(horses, state.participantCount);
      commit("SET_SELECTED_PARTICIPANTS", participants);

      // Create 6 rounds using the same participants each time
      const rounds: RoundSpec[] = buildRounds(participants, [
        ...ROUND_DISTANCES
      ]);
      commit("SET_ROUNDS", rounds);
    },

    async start({ state, commit, dispatch }: Ctx) {
      // Run only one round per click
      if (!state.rounds.length) return;
      if (state.status === "running" || state.status === "finished") return;
      commit("START_RACE");
      const idx = state.currentRoundIndex === -1 ? 0 : state.currentRoundIndex;
      const round = state.rounds[idx];
      const result = await dispatch("simulateRound", round);
      commit("APPEND_RESULT", result);
      // apply condition scoring per result
      commit("APPLY_SCORING", { round, result });
      // advance pointer to the next round
      commit("NEXT_ROUND");
      // if not finished, return to generated state to allow next manual start
      if (state.currentRoundIndex < state.rounds.length) {
        commit("SET_STATUS", "generated");
      }
    },

    // Simulate a round by computing time per horse and expose an animation payload for the UI
    async simulateRound(
      { state, commit }: Ctx,
      round: RoundSpec
    ): Promise<RoundResult> {
      // Physics-ish model: base speed with randomness and condition influence.
      // timeMs = distance / speed; speed ~ base(16 m/s) +/- randomness + condition factor.
      const { finishes, maxTime, perHorseDisplayMs, animationDuration } =
        simRound(state.horses as Horse[], round);
      const animPayload: UIRoundAnimation = {
        roundIndex: round.index,
        durationMs: animationDuration,
        perHorseDisplayMs
      };
      commit("SET_ANIMATION", animPayload);

      // Wait for the animation duration to let UI animate
      await new Promise((res) => setTimeout(res, animationDuration));

      // Clear animation payload after round completes
      commit("SET_ANIMATION", null);

      return { roundIndex: round.index, distance: round.distance, finishes };
    }
  }
});

export default store;
