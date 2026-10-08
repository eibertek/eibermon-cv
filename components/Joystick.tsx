"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { input } from "../game/input";
import { useGame } from "../game/store";

/** Radio máximo del stick, en píxeles. */
const RADIUS = 48;

/** Joystick táctil: solo se muestra con `pointer: coarse` (ver .touch-only en globals.css). */
export default function Joystick() {
  const started = useGame((s) => s.started);
  const blocked = useGame((s) => Boolean(s.dialogId) || s.classicOpen);

  const baseRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });

  function moveStick(dx: number, dy: number) {
    const stick = stickRef.current;
    if (stick) stick.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function update(clientX: number, clientY: number) {
    let dx = clientX - origin.current.x;
    let dy = clientY - origin.current.y;
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    input.joyX = dx / RADIUS;
    input.joyY = -dy / RADIUS; // arriba (clientY menor) = +joyY
    moveStick(dx, dy);
  }

  function reset() {
    input.joyX = 0;
    input.joyY = 0;
    moveStick(0, 0);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const base = baseRef.current;
    if (!base) return;
    activePointer.current = e.pointerId;
    base.setPointerCapture(e.pointerId);
    const rect = base.getBoundingClientRect();
    origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    update(e.clientX, e.clientY);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (activePointer.current !== e.pointerId) return;
    update(e.clientX, e.clientY);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    reset();
  }

  if (!started || blocked) return null;

  return (
    <div
      ref={baseRef}
      className="joystick touch-only"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={stickRef} className="joystick__stick" />
    </div>
  );
}
