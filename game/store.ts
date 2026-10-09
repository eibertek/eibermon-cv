import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "../data/i18n";
import { interactableById } from "../world/layout";

type Teleport = { x: number; z: number };

export type Character = "female" | "male";

type GameState = {
  started: boolean;
  /** ids de interactuables ya vistos (se guardan en localStorage) */
  discovered: string[];
  nearbyId: string | null;
  dialogId: string | null;
  classicOpen: boolean;
  /** pasos de 90° acumulados de la cámara */
  camRot: number;
  teleport: Teleport | null;
  /** personaje elegido en la pantalla de inicio (se guarda en localStorage) */
  character: Character;
  /** idioma activo (se guarda en localStorage), inglés por defecto */
  locale: Locale;
  /** puntos acumulados en el recorrido actual (se guarda en localStorage) */
  score: number;
  /** mejor tiempo de punta a punta, en segundos (se guarda en localStorage) */
  bestTimeSeconds: number | null;
  /** Date.now() de cuando arrancó el recorrido actual; null si todavía no empezó
   *  o si ya se completó. No se persiste: solo cuenta el tiempo de esta sesión. */
  runStartedAt: number | null;

  start: () => void;
  setNearby: (id: string | null) => void;
  interact: () => void;
  closeDialog: () => void;
  setClassic: (open: boolean) => void;
  rotateCam: (dir: 1 | -1) => void;
  requestTeleport: (x: number, z: number) => void;
  clearTeleport: () => void;
  resetProgress: () => void;
  setCharacter: (character: Character) => void;
  catchSkill: (id: string) => void;
  setLocale: (locale: Locale) => void;
  addScore: (points: number) => void;
};

/** Si ya se descubrió todo y el recorrido seguía "abierto", lo cierra y liquida el bonus de tiempo. */
function finishRunIfComplete(
  s: Pick<GameState, "discovered" | "runStartedAt" | "score" | "bestTimeSeconds">,
): Partial<GameState> {
  if (s.runStartedAt === null) return {};
  if (s.discovered.length < interactableById.size) return {};
  const elapsedSeconds = (Date.now() - s.runStartedAt) / 1000;
  const timeBonus = Math.max(0, 1000 - Math.floor(elapsedSeconds));
  return {
    score: s.score + timeBonus,
    bestTimeSeconds: s.bestTimeSeconds === null ? elapsedSeconds : Math.min(s.bestTimeSeconds, elapsedSeconds),
    runStartedAt: null,
  };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      started: false,
      discovered: [],
      nearbyId: null,
      dialogId: null,
      classicOpen: false,
      camRot: 0,
      teleport: null,
      character: "female",
      locale: "en",
      score: 0,
      bestTimeSeconds: null,
      runStartedAt: null,

      start: () =>
        set((s) => ({ started: true, runStartedAt: s.runStartedAt ?? Date.now() })),
      setNearby: (id) => set({ nearbyId: id }),
      interact: () => {
        const { nearbyId, dialogId, discovered } = get();
        if (!nearbyId || dialogId || !interactableById.has(nearbyId)) return;
        const kind = interactableById.get(nearbyId)!.kind;
        const nextDiscovered =
          kind !== "skill" && !discovered.includes(nearbyId) ? [...discovered, nearbyId] : discovered;
        set((s) => ({
          dialogId: nearbyId,
          discovered: nextDiscovered,
          ...finishRunIfComplete({ ...s, discovered: nextDiscovered }),
        }));
      },
      closeDialog: () => set({ dialogId: null }),
      setClassic: (open) => set({ classicOpen: open }),
      rotateCam: (dir) => set((s) => ({ camRot: s.camRot + dir })),
      requestTeleport: (x, z) => set({ teleport: { x, z } }),
      clearTeleport: () => set({ teleport: null }),
      resetProgress: () => set({ discovered: [], score: 0, runStartedAt: null }),
      setCharacter: (character) => set({ character }),
      catchSkill: (id) =>
        set((s) => {
          const nextDiscovered = s.discovered.includes(id) ? s.discovered : [...s.discovered, id];
          return { discovered: nextDiscovered, ...finishRunIfComplete({ ...s, discovered: nextDiscovered }) };
        }),
      setLocale: (locale) => set({ locale }),
      addScore: (points) => set((s) => ({ score: s.score + points })),
    }),
    {
      name: "cv-city-progress",
      version: 3,
      partialize: (s) => ({
        discovered: s.discovered,
        character: s.character,
        locale: s.locale,
        score: s.score,
        bestTimeSeconds: s.bestTimeSeconds,
      }),
    },
  ),
);
