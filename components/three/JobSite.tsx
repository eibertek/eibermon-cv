import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { buildingTypeIds } from "../../assets/manifest";
import { registerOccluder } from "../../game/occluders";
import { dampAngle } from "../../game/math";
import { playerState } from "../../game/playerState";
import { useGame } from "../../game/store";
import type { JobSpot } from "../../world/layout";
import { jobColor } from "../../world/theme";
import { Asset } from "./Asset";
import Label from "./Label";

/** Un trabajo anterior: su edificio y el NPC que lo representa. */
export default function JobSite({ spot }: { spot: JobSpot }) {
  const { job, index, building, buildingRotY, npc, interactId } = spot;
  const npcRef = useRef<Group>(null);
  const marker = useRef<Mesh>(null);
  const buildingRef = useRef<Group>(null);
  const discovered = useGame((s) => s.discovered.includes(interactId));
  const near = useGame((s) => s.nearbyId === interactId);

  const buildingType = buildingTypeIds[index % buildingTypeIds.length];
  const tint = jobColor(job, index);

  // Para poder ver al NPC aunque este edificio quede en el medio (ver OcclusionFade).
  useEffect(() => {
    const g = buildingRef.current;
    if (!g) return;
    return registerOccluder(g);
  }, []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);

    // El NPC te mira cuando te acercás
    const g = npcRef.current;
    if (g) {
      const dx = playerState.x - npc[0];
      const dz = playerState.z - npc[1];
      if (Math.hypot(dx, dz) < 7) {
        g.rotation.y = dampAngle(g.rotation.y, Math.atan2(dx, dz), 8, dt);
      }
    }

    const m = marker.current;
    if (m) {
      m.position.y = 2.5 + Math.sin(clock.elapsedTime * 3) * 0.12;
      m.rotation.y = clock.elapsedTime * 2;
    }
  });

  return (
    <>
      <group ref={buildingRef} position={[building[0], 0, building[1]]} rotation={[0, buildingRotY, 0]}>
        <Asset id={buildingType} tint={tint} />
      </group>
      <Label position={[building[0], 5.8, building[1]]} className="label label--building">
        <strong>{job.company}</strong>
        <span>{job.period}</span>
      </Label>

      <group position={[npc[0], 0, npc[1]]}>
        <group ref={npcRef}>
          <Asset id={`npc-${job.id}`} />
        </group>
        {/* marca de "tiene algo para contarte" hasta que hablás con el NPC */}
        {!discovered && (
          <mesh ref={marker} position={[0, 2.5, 0]}>
            <octahedronGeometry args={[0.2]} />
            <meshBasicMaterial color="#ffd166" />
          </mesh>
        )}
        {near && <Label position={[0, 3, 0]}>{job.npc.name}</Label>}
      </group>
    </>
  );
}
