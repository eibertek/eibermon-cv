import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
// alias: dentro de useFrame ya hay una variable local `t` (tiempo del reloj).
import { t as translate } from "../../data/i18n";
import { useGame } from "../../game/store";
import type { SkillSpot } from "../../world/layout";
import { skillColor } from "../../world/theme";
import { Asset } from "./Asset";
import Label from "./Label";

const WANDER_RADIUS = 1.3;
const WANDER_SPEED = 0.6;
const PAUSE_MIN = 1.5;
const PAUSE_MAX = 3.5;

function pickWanderTarget(): { x: number; z: number } {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * WANDER_RADIUS;
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

/** Un Eibermon: deambula cerca de `spot.pos` hasta que lo atrapan (BattleModal + catchSkill). */
export default function SkillCreature({ spot }: { spot: SkillSpot }) {
  const { skill, pos, interactId } = spot;
  const floating = useRef<Group>(null);
  const discovered = useGame((s) => s.discovered.includes(interactId));
  const near = useGame((s) => s.nearbyId === interactId);
  const locale = useGame((s) => s.locale);
  const color = skillColor(skill);

  const offset = useRef({ x: 0, z: 0 });
  const wanderTarget = useRef(pickWanderTarget());
  const nextTargetAt = useRef(0);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    if (!discovered && t >= nextTargetAt.current) {
      wanderTarget.current = pickWanderTarget();
      nextTargetAt.current = t + PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN);
    }
    const target = discovered ? { x: 0, z: 0 } : wanderTarget.current;
    const lerp = Math.min(1, WANDER_SPEED * delta);
    offset.current.x += (target.x - offset.current.x) * lerp;
    offset.current.z += (target.z - offset.current.z) * lerp;

    const g = floating.current;
    if (g) {
      g.position.set(offset.current.x, 0.55 + Math.sin(t * 2 + pos[0] * 0.7) * 0.15, offset.current.z);
      g.rotation.y = t * 0.8;
      const s = near ? 1.18 : 1;
      g.scale.setScalar(g.scale.x + (s - g.scale.x) * 0.15);
    }
  });

  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.3, 14]} />
        <meshStandardMaterial color={discovered ? "#8fe3a2" : "#ece6d6"} flatShading />
      </mesh>

      {!discovered && (
        <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.04, 8, 36]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}

      <group ref={floating}>
        <Asset id={`skill-${skill.id}`} />
      </group>

      {near && <Label position={[0, 2.6, 0]}>{translate(skill.name, locale)}</Label>}
    </group>
  );
}
