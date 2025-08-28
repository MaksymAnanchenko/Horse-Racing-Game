import type { Horse, RoundSpec, RoundResult, HorseFinish } from "@/types";

export function useGameLogic() {
  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const ANIMAL_NAMES = [
    "Lucky",
    "Bella",
    "Max",
    "Rocky",
    "Daisy",
    "Shadow",
    "Ginger",
    "Coco",
    "Charlie",
    "Luna",
    "Jack",
    "Duke",
    "Molly",
    "Scout",
    "Pepper",
    "Buddy",
    "Angel",
    "Blue",
    "Star",
    "Sunny",
    "Ruby",
    "Pearl",
    "Hazel",
    "Willow",
    "Jasper",
    "Milo",
    "Finn",
    "Olive",
    "Ivy",
    "Holly",
    "Maple",
    "Amber",
    "Sage",
    "River",
    "Clover",
    "Comet",
    "Whisper",
    "Phantom",
    "Rider",
    "Bolt",
    "Spirit",
    "Falcon",
    "Rocket",
    "Echo",
    "Ranger",
    "Ace",
    "Nova",
    "Skye",
    "Copper",
    "Mocha",
    "Honey",
    "Autumn",
    "Dusty",
    "Brandy",
    "Rusty",
    "Marley",
    "Remy",
    "Nala",
    "Zoe",
    "Ollie"
  ];

  function generateAnimalNames(count: number): string[] {
    const pool = shuffle(ANIMAL_NAMES.slice());
    const names: string[] = [];
    const seen = new Set<string>();
    for (const nm of pool) {
      if (!seen.has(nm)) {
        names.push(nm);
        seen.add(nm);
        if (names.length === count) break;
      }
    }
    let i = 1;
    while (names.length < count) {
      const base = ANIMAL_NAMES[(names.length + i) % ANIMAL_NAMES.length];
      const candidate = `${base} ${i}`;
      if (!seen.has(candidate)) {
        names.push(candidate);
        seen.add(candidate);
      }
      i++;
    }
    return names;
  }

  function pickParticipants(horses: Horse[], count: number): number[] {
    return shuffle(horses.map((h) => h.id)).slice(0, count);
  }

  function buildRounds(
    participants: number[],
    distances: number[]
  ): RoundSpec[] {
    return distances.map((distance, idx) => ({
      index: idx,
      distance,
      horses: participants
    }));
  }

  function simulateRound(
    horses: Horse[],
    round: RoundSpec
  ): {
    finishes: HorseFinish[];
    maxTime: number;
    perHorseDisplayMs: Record<number, number>;
    animationDuration: number;
  } {
    const baseSpeed = 16; // m/s
    const finishes: HorseFinish[] = [];
    const perHorseTimes = round.horses.map((hid) => {
      const h = horses.find((x) => x.id === hid)!;
      const conditionFactor = 1 + (h.condition - 50) / 800;
      const roundVariance = 1 + (Math.random() - 0.5) * 0.2;
      const microVariance = 1 + (Math.random() - 0.5) * 0.04;
      const speed = baseSpeed * conditionFactor * roundVariance * microVariance;
      const timeSec = round.distance / speed;
      return { horseId: hid, timeMs: Math.round(timeSec * 1000) };
    });
    perHorseTimes.sort((a, b) => a.timeMs - b.timeMs);
    perHorseTimes.forEach((t, idx) =>
      finishes.push({ horseId: t.horseId, timeMs: t.timeMs, rank: idx + 1 })
    );

    const maxTime = Math.max(...perHorseTimes.map((t) => t.timeMs));
    const animationDuration = Math.max(3000, Math.min(maxTime, 9000));
    const scale = animationDuration / maxTime;
    const perHorseDisplayMs: Record<number, number> = {};
    perHorseTimes.forEach((t) => {
      perHorseDisplayMs[t.horseId] = Math.max(
        1200,
        Math.round(t.timeMs * scale)
      );
    });
    return { finishes, maxTime, perHorseDisplayMs, animationDuration };
  }

  function applyScoring(
    horses: Horse[],
    result: RoundResult,
    rankPoints: number[]
  ): Horse[] {
    const next = horses.map((h) => ({ ...h }));
    result.finishes.forEach((f) => {
      const base = rankPoints[f.rank - 1] ?? 0;
      const idx = next.findIndex((h) => h.id === f.horseId);
      if (idx >= 0) {
        const h = next[idx];
        const diminish = 1 - h.condition / 200;
        h.condition = clamp(h.condition + Math.round(base * diminish), 0, 100);
      }
    });
    return next;
  }

  return {
    clamp,
    shuffle,
    generateAnimalNames,
    pickParticipants,
    buildRounds,
    simulateRound,
    applyScoring
  };
}
