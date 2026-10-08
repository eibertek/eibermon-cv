"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Asset } from "./three/Asset";

function RotatingCreature({ skillId, shaking }: { skillId: string; shaking: boolean }) {
  const group = useRef<Group>(null);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    if (shaking) {
      g.rotation.z = Math.sin(t * 28) * 0.18;
      g.position.x = Math.sin(t * 24) * 0.08;
    } else {
      g.rotation.z = 0;
      g.position.x = 0;
      g.rotation.y = t * 0.6;
    }
    g.position.y = 0.8 + Math.sin(t * 1.6) * 0.08;
  });

  return (
    <group ref={group}>
      <Asset id={`skill-${skillId}`} />
    </group>
  );
}

/** Mini escena 3D para la pantalla de batalla: el mismo GLB (o fallback) que ya se ve en el mundo. */
export default function BattleCreature({ skillId, shaking }: { skillId: string; shaking: boolean }) {
  return (
    <div className="battle__creature-canvas">
      <Canvas camera={{ position: [0, 1.4, 3.4], fov: 32 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 2]} intensity={1.6} />
        <RotatingCreature skillId={skillId} shaking={shaking} />
      </Canvas>
    </div>
  );
}
