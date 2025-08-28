export type GameStatus = "idle" | "generated" | "running" | "finished";

export interface Horse {
  id: number;
  name: string;
  color: string;
  condition: number; // 0-100
}

export interface RoundSpec {
  index: number; // 0..5
  distance: number; // meters
  horses: number[]; // horse ids (10)
}

export interface HorseFinish {
  horseId: number;
  timeMs: number;
  rank: number;
}

export interface RoundResult {
  roundIndex: number;
  distance: number;
  finishes: HorseFinish[]; // sorted by rank asc
}

export interface RootState {
  horses: Horse[];
  rounds: RoundSpec[];
  results: RoundResult[];
  currentRoundIndex: number;
  status: GameStatus;
  currentAnimation: UIRoundAnimation | null;
  participantCount: number;
  selectedParticipants: number[];
}

export interface UIRoundAnimation {
  roundIndex: number;
  durationMs: number;
  perHorseDisplayMs: Record<number, number>; // horseId -> display duration for transition
}
