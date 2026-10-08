import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { DirectionalLight } from "three";
import { playerState } from "../../game/playerState";

/** Luz de día; la sombra sigue al jugador para mantener buena resolución. */
export default function Sun() {
  const light = useRef<DirectionalLight>(null);

  useFrame(() => {
    const l = light.current;
    if (!l) return;
    l.position.set(playerState.x + 14, 24, playerState.z + 9);
    l.target.position.set(playerState.x, 0, playerState.z);
    l.target.updateMatrixWorld();
  });

  return (
    <>
      <hemisphereLight args={["#e8f6ff", "#7fa46c", 1.15]} />
      <directionalLight
        ref={light}
        castShadow
        intensity={2.2}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
      />
    </>
  );
}
