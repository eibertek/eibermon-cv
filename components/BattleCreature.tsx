"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box3, Vector3, type Group } from "three";
import { Asset } from "./three/Asset";

/**
 * Meshy normaliza cada modelo a su propia escala (no respeta "metros" del prompt),
 * así que no podemos asumir un tamaño fijo: medimos el bounding box real cada frame
 * y encuadramos la cámara en base a eso. Reencuadra solo si el tamaño cambió bastante
 * (ej: al pasar del fallback al GLB real), para no "respirar" con la rotación normal.
 */
function FramedCreature({ skillId, shaking }: { skillId: string; shaking: boolean }) {
  const group = useRef<Group>(null);
  const { camera } = useThree();
  const lastRadius = useRef(0);

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
    g.position.y = Math.sin(t * 1.6) * 0.08;

    const box = new Box3().setFromObject(g);
    if (box.isEmpty()) return;
    const size = box.getSize(new Vector3());
    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    if (Math.abs(radius - lastRadius.current) / (lastRadius.current || radius || 1) > 0.2) {
      const center = box.getCenter(new Vector3());
      camera.position.set(center.x, center.y, center.z + radius * 2.4 + 0.5);
      camera.lookAt(center);
      lastRadius.current = radius;
    }
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
      <Canvas camera={{ position: [0, 1, 3.4], fov: 32 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 2]} intensity={1.6} />
        <FramedCreature skillId={skillId} shaking={shaking} />
      </Canvas>
    </div>
  );
}
