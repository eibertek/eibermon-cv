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
};

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

      start: () => set({ started: true }),
      setNearby: (id) => set({ nearbyId: id }),
      interact: () => {
        const { nearbyId, dialogId, discovered } = get();
        if (!nearbyId || dialogId || !interactableById.has(nearbyId)) return;
        const kind = interactableById.get(nearbyId)!.kind;
        set({
          dialogId: nearbyId,
          discovered:
            kind !== "skill" && !discovered.includes(nearbyId)
              ? [...discovered, nearbyId]
              : discovered,
        });
      },
      closeDialog: () => set({ dialogId: null }),
      setClassic: (open) => set({ classicOpen: open }),
      rotateCam: (dir) => set((s) => ({ camRot: s.camRot + dir })),
      requestTeleport: (x, z) => set({ teleport: { x, z } }),
      clearTeleport: () => set({ teleport: null }),
      resetProgress: () => set({ discovered: [] }),
      setCharacter: (character) => set({ character }),
      catchSkill: (id) =>
        set((s) => ({
          discovered: s.discovered.includes(id) ? s.discovered : [...s.discovered, id],
        })),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "cv-city-progress",
      version: 2,
      partialize: (s) => ({ discovered: s.discovered, character: s.character, locale: s.locale }),
    },
  ),
);
