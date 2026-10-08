"use client";

import { useEffect } from "react";
import { input, resetInput, type Dir } from "./input";
import { useGame } from "./store";

const MOVE_KEYS: Record<string, Dir> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

function isInteractKey(code: string): boolean {
  return code === "KeyE" || code === "Space" || code === "Enter";
}

export function useKeyboard(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = useGame.getState();

      if (e.code === "Escape") {
        if (s.dialogId) s.closeDialog();
        else if (s.classicOpen) s.setClassic(false);
        return;
      }
      if (s.classicOpen || !s.started) return;

      if (s.dialogId) {
        if (isInteractKey(e.code)) {
          e.preventDefault();
          s.closeDialog();
        }
        return;
      }

      const dir = MOVE_KEYS[e.code];
      if (dir) {
        input[dir] = true;
        e.preventDefault();
        return;
      }

      if (isInteractKey(e.code)) {
        // No secuestrar Espacio/Enter si el foco está en un botón o link
        const el = e.target as HTMLElement | null;
        if (e.code !== "KeyE" && el && (el.tagName === "BUTTON" || el.tagName === "A")) return;
        e.preventDefault();
        s.interact();
        return;
      }

      if (e.code === "KeyQ") s.rotateCam(-1);
      if (e.code === "KeyR") s.rotateCam(1);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const dir = MOVE_KEYS[e.code];
      if (dir) input[dir] = false;
    };

    const onBlur = () => resetInput();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);
}
