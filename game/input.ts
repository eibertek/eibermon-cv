export type Dir = "up" | "down" | "left" | "right";

/** Estado de entrada mutable (teclado + joystick táctil), leído en cada frame. */
export const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  joyX: 0,
  joyY: 0,
};

/** Ejes combinados, normalizados a círculo unitario. x: derecha (+), y: adelante (+). */
export function readAxes(): { x: number; y: number } {
  let x = (input.right ? 1 : 0) - (input.left ? 1 : 0) + input.joyX;
  let y = (input.up ? 1 : 0) - (input.down ? 1 : 0) + input.joyY;
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  return { x, y };
}

export function resetInput(): void {
  input.up = false;
  input.down = false;
  input.left = false;
  input.right = false;
  input.joyX = 0;
  input.joyY = 0;
}
