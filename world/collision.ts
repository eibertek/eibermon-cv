import type { Obstacle, Vec2 } from "./layout";

/**
 * Empuja un círculo (jugador) fuera de los obstáculos.
 * Resolución simple de 2 pasadas: alcanza para un mundo de este tamaño.
 */
export function resolveCollisions(
  startX: number,
  startZ: number,
  radius: number,
  obstacles: readonly Obstacle[],
): Vec2 {
  let x = startX;
  let z = startZ;

  for (let pass = 0; pass < 2; pass++) {
    for (const o of obstacles) {
      if (o.kind === "circle") {
        const dx = x - o.x;
        const dz = z - o.z;
        const min = radius + o.r;
        const d2 = dx * dx + dz * dz;
        if (d2 < min * min) {
          const d = Math.sqrt(d2) || 0.0001;
          const push = (min - d) / d;
          x += dx * push;
          z += dz * push;
        }
      } else {
        const cx = Math.max(o.x - o.hw, Math.min(x, o.x + o.hw));
        const cz = Math.max(o.z - o.hd, Math.min(z, o.z + o.hd));
        const dx = x - cx;
        const dz = z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 < radius * radius) {
          if (d2 > 1e-8) {
            const d = Math.sqrt(d2);
            const push = (radius - d) / d;
            x += dx * push;
            z += dz * push;
          } else {
            // el centro quedó dentro del rectángulo: sacarlo por el lado más cercano
            const left = x - (o.x - o.hw);
            const right = o.x + o.hw - x;
            const top = z - (o.z - o.hd);
            const bottom = o.z + o.hd - z;
            const m = Math.min(left, right, top, bottom);
            if (m === left) x = o.x - o.hw - radius;
            else if (m === right) x = o.x + o.hw + radius;
            else if (m === top) z = o.z - o.hd - radius;
            else z = o.z + o.hd + radius;
          }
        }
      }
    }
  }

  return [x, z];
}
