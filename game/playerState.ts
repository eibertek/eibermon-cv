import { world } from "../world/layout";

/** Posición del jugador, fuera de React para no re-renderizar en cada frame. */
export const playerState = {
  x: world.startSpawn[0],
  z: world.startSpawn[1],
  angle: 0,
  moving: false,
};
