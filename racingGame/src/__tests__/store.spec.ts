import { describe, it, expect, vi } from "vitest";
import store from "@/store";

describe("store generation", () => {
  it("generates 20 horses and 6 rounds with 10 horses each and correct distances", async () => {
    await store.dispatch("generate");
    expect(store.state.horses.length).toBe(20);
    expect(store.state.rounds.length).toBe(6);
    const distances = [1200, 1400, 1600, 1800, 2000, 2200];
    store.state.rounds.forEach((r: any, idx: number) => {
      expect(r.horses.length).toBe(10);
      expect(new Set(r.horses).size).toBe(10);
      expect(r.distance).toBe(distances[idx]);
    });
  });

  it("runs one round per start click and finishes after 6", async () => {
    store.commit("RESET");
    await store.dispatch("generate");
    expect(store.state.currentRoundIndex).toBe(-1);
    expect(store.state.results.length).toBe(0);

    vi.useFakeTimers();
    try {
      // click start repeatedly 6 times
      for (let i = 0; i < 6; i++) {
        const p = store.dispatch("start");
        await vi.runAllTimersAsync();
        await p;
        expect(store.state.results.length).toBe(i + 1);
        // After each run except last, status should return to generated
        if (i < 5) {
          expect(store.state.status).toBe("generated");
        }
      }
    } finally {
      vi.useRealTimers();
    }
    expect(store.state.status).toBe("finished");
    expect(store.state.currentRoundIndex).toBe(6);
  }, 30000);
});
