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

export type TimingTier = "perfect" | "good" | "ok";

/**
 * Puntaje por precisión: un marcador recorre una barra (0% → 100% → 0%) cada
 * `TIMING_CYCLE_SECONDS`, y clickear Rayo cerca de la punta (100%) da más puntos.
 * Pura y determinística (recibe el tiempo transcurrido, no lee el reloj) para
 * poder testearla sin simular `performance.now()`.
 */
export const TIMING_CYCLE_SECONDS = 2;

export function timingTierAt(elapsedSeconds: number): { tier: TimingTier; points: number } {
  const cycle = TIMING_CYCLE_SECONDS;
  const t = ((elapsedSeconds % cycle) + cycle) % cycle; // siempre positivo
  const tNorm = t / cycle;
  // 0 -> 1 en la primera mitad del ciclo, 1 -> 0 en la segunda (misma onda
  // triangular que dibuja el marcador animado en CSS).
  const position = tNorm < 0.5 ? tNorm * 2 : (1 - tNorm) * 2;
  if (position >= 0.85) return { tier: "perfect", points: 50 };
  if (position >= 0.6) return { tier: "good", points: 20 };
  return { tier: "ok", points: 5 };
}
