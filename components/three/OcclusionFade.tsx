import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Raycaster, Vector3, type Material, type Mesh, type Object3D } from "three";
import { occluders } from "../../game/occluders";
import { playerState } from "../../game/playerState";
import { useGame } from "../../game/store";
import { interactableById } from "../../world/layout";

const FADE_OPACITY = 0.25;
const LERP = 0.18;
/** Altura aproximada a la que apuntamos (torso), no al piso. */
const AIM_HEIGHT = 1.1;
/** Margen antes del objetivo para no contarlo a él mismo como obstáculo. */
const NEAR_MARGIN = 0.6;

/**
 * Atenúa (no oculta del todo) los edificios que se interponen entre la cámara y el
 * jugador, o entre la cámara y el interactuable más cercano (para poder ver al NPC
 * aunque el edificio de otro trabajo quede en el medio).
 */
export default function OcclusionFade() {
  const raycaster = useRef(new Raycaster());
  const origin = useRef(new Vector3());
  const dir = useRef(new Vector3());
  const targets = useRef([new Vector3(), new Vector3()]);
  const blocked = useRef(new Set<Object3D>());

  useFrame(({ camera }) => {
    if (occluders.size === 0) return;

    const list: Vector3[] = [targets.current[0].set(playerState.x, AIM_HEIGHT, playerState.z)];
    const nearbyId = useGame.getState().nearbyId;
    if (nearbyId) {
      const it = interactableById.get(nearbyId);
      if (it) list.push(targets.current[1].set(it.pos[0], AIM_HEIGHT, it.pos[1]));
    }

    blocked.current.clear();
    origin.current.copy(camera.position);

    for (const target of list) {
      dir.current.copy(target).sub(origin.current);
      const distance = dir.current.length();
      if (distance < 0.01) continue;
      dir.current.normalize();
      raycaster.current.set(origin.current, dir.current);
      raycaster.current.far = Math.max(0, distance - NEAR_MARGIN);

      for (const root of occluders) {
        if (blocked.current.has(root)) continue;
        if (raycaster.current.intersectObject(root, true).length > 0) {
          blocked.current.add(root);
        }
      }
    }

    for (const root of occluders) {
      setOpacity(root, blocked.current.has(root) ? FADE_OPACITY : 1);
    }
  });

  return null;
}

function setOpacity(root: Object3D, target: number): void {
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as Material[];
    for (const mat of materials) {
      if (!mat.transparent) {
        mat.transparent = true;
        mat.depthWrite = false;
      }
      mat.opacity += (target - mat.opacity) * LERP;
    }
  });
}
