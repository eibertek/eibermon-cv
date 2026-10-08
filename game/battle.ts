export type BattlePhase = "intro" | "fighting" | "catching" | "caught";

export type BattleState = {
  phase: BattlePhase;
  energy: number;
  maxEnergy: number;
};

/** El nivel de la skill (1-5) es tanto la energía inicial como los golpes necesarios. */
export function createBattleState(level: 1 | 2 | 3 | 4 | 5): BattleState {
  return { phase: "intro", energy: level, maxEnergy: level };
}

export function beginFight(state: BattleState): BattleState {
  if (state.phase !== "intro") return state;
  return { ...state, phase: "fighting" };
}

export function throwRay(state: BattleState): BattleState {
  if (state.phase !== "fighting" || state.energy <= 0) return state;
  const energy = state.energy - 1;
  return { ...state, energy, phase: energy <= 0 ? "catching" : "fighting" };
}

export function throwBall(state: BattleState): BattleState {
  if (state.phase !== "catching") return state;
  return { ...state, phase: "caught" };
}
