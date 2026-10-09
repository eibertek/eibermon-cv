import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { readAxes } from "../../game/input";
import { dampAngle } from "../../game/math";
import { playerState } from "../../game/playerState";
import { useGame } from "../../game/store";
import { resolveCollisions } from "../../world/collision";
import { world } from "../../world/layout";
import { Asset } from "./Asset";
import { camState } from "./IsoCamera";

const SPEED = 5.5;
const RADIUS = 0.4;

export default function Player() {
  const root = useRef<Group>(null);
  const wasMoving = useRef(false);
  const [moving, setMoving] = useState(false);
  const character = useGame((s) => s.character);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = useGame.getState();

    // Fast travel
    if (state.teleport) {
      playerState.x = state.teleport.x;
      playerState.z = state.teleport.z;
      state.clearTeleport();
    }

    // Entrada (bloqueada con diálogo, CV clásico, pantalla de inicio, o un modal de medalla)
    const canMove =
      state.started &&
      !state.dialogId &&
      !state.classicOpen &&
      state.badgeQueue.length === 0 &&
      !state.infoBadge;
    const { x: ix, y: iy } = canMove ? readAxes() : { x: 0, y: 0 };
    const magnitude = Math.hypot(ix, iy);

    if (magnitude > 0.05) {
      // Movimiento relativo a la cámara: "arriba" es siempre hacia el fondo de la pantalla
      const yaw = camState.yaw;
      const forwardX = -Math.sin(yaw);
      const forwardZ = -Math.cos(yaw);
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);
      const moveX = forwardX * iy + rightX * ix;
      const moveZ = forwardZ * iy + rightZ * ix;

      const [nx, nz] = resolveCollisions(
        playerState.x + moveX * SPEED * dt,
        playerState.z + moveZ * SPEED * dt,
        RADIUS,
        world.obstacles,
      );
      const b = world.bounds;
      playerState.x = Math.min(Math.max(nx, b.minX), b.maxX);
      playerState.z = Math.min(Math.max(nz, b.minZ), b.maxZ);
      playerState.angle = dampAngle(playerState.angle, Math.atan2(moveX, moveZ), 12, dt);
    }
    playerState.moving = magnitude > 0.05;

    // Interactuable más cercano dentro de su radio
    let nearest: string | null = null;
    let nearestDist = Infinity;
    for (const it of world.interactables) {
      const dist = Math.hypot(it.pos[0] - playerState.x, it.pos[1] - playerState.z);
      if (dist < it.radius && dist < nearestDist) {
        nearest = it.id;
        nearestDist = dist;
      }
    }
    if (nearest !== state.nearbyId) state.setNearby(nearest);

    // Transformaciones visuales
    if (root.current) {
      root.current.position.set(playerState.x, 0, playerState.z);
      root.current.rotation.y = playerState.angle;
    }

    // Solo re-renderiza cuando cambia (arranca/para), no en cada frame.
    if (playerState.moving !== wasMoving.current) {
      wasMoving.current = playerState.moving;
      setMoving(playerState.moving);
    }
  });

  return (
    <group ref={root}>
      <Asset id={`player-${character}`} playing={moving} />
    </group>
  );
}
