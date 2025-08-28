export const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const;
export type RoundDistance = (typeof ROUND_DISTANCES)[number];

export const HORSE_COLORS = [
  "#e6194B",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9A6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080"
] as const;

// Rank points for finishing positions 1..10 (reduced to avoid runaway leader)
export const RANK_POINTS = [12, 9, 7, 6, 5, 4, 3, 2, 1, 0] as const;
