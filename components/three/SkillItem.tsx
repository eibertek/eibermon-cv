import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useGame } from "../../game/store";
import type { SkillSpot } from "../../world/layout";
import { skillColor } from "../../world/theme";
import { Asset } from "./Asset";
import Label from "./Label";

/** Objeto coleccionable: una skill sobre un pedestal. */
export default function SkillItem({ spot }: { spot: SkillSpot }) {
  const { skill, pos, interactId } = spot;
  const floating = useRef<Group>(null);
  const discovered = useGame((s) => s.discovered.includes(interactId));
  const near = useGame((s) => s.nearbyId === interactId);
  const color = skillColor(skill);

  useFrame(({ clock }) => {
    const g = floating.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.position.y = 0.55 + Math.sin(t * 2 + pos[0] * 0.7) * 0.15;
    g.rotation.y = t * 0.8;
    const s = near ? 1.18 : 1;
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * 0.15);
  });

  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.3, 14]} />
        <meshStandardMaterial color={discovered ? "#8fe3a2" : "#ece6d6"} flatShading />
      </mesh>

      {/* aro de color mientras no la descubriste */}
      {!discovered && (
        <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.04, 8, 36]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}

      <group ref={floating} position={[0, 0.55, 0]}>
        <Asset id={`skill-${skill.id}`} />
      </group>

      {near && <Label position={[0, 2.6, 0]}>{skill.name}</Label>}
    </group>
  );
}
