import type { Object3D } from "three";

/**
 * Objetos 3D que pueden tapar al jugador o a un NPC (por ahora, los edificios).
 * `OcclusionFade` los recorre cada frame y atenúa los que están en la línea de visión.
 */
export const occluders = new Set<Object3D>();

export function registerOccluder(object: Object3D): () => void {
  occluders.add(object);
  return () => {
    occluders.delete(object);
  };
}
