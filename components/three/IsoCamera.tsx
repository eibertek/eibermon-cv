import { useRef } from "react";
import { OrthographicCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { playerState } from "../../game/playerState";
import { useGame } from "../../game/store";

/** Distancia horizontal de la cámara; la altura sale del ángulo isométrico clásico (~35.26°). */
const DIST = 20;
const HEIGHT = DIST * Math.SQRT1_2;
const BASE_YAW = Math.PI / 4;

/** Ángulo actual de la cámara (lo lee el jugador para mover "relativo a la pantalla"). */
export const camState = { yaw: BASE_YAW };

export default function IsoCamera() {
  const width = useThree((s) => s.size.width);
  const focus = useRef(new Vector3(playerState.x, 0, playerState.z));

  // Más ancho de pantalla => más zoom, con topes para celular y pantallas grandes
  const zoom = MathUtils.clamp(width / 22, 24, 60);

  useFrame(({ camera }, dt) => {
    const targetYaw = BASE_YAW + useGame.getState().camRot * (Math.PI / 2);
    camState.yaw = MathUtils.damp(camState.yaw, targetYaw, 6, dt);

    focus.current.x = MathUtils.damp(focus.current.x, playerState.x, 5, dt);
    focus.current.z = MathUtils.damp(focus.current.z, playerState.z, 5, dt);

    camera.position.set(
      focus.current.x + DIST * Math.sin(camState.yaw),
      HEIGHT,
      focus.current.z + DIST * Math.cos(camState.yaw),
    );
    camera.lookAt(focus.current.x, 0, focus.current.z);
  });

  return <OrthographicCamera makeDefault zoom={zoom} near={0.1} far={200} position={[DIST * 0.707, HEIGHT, DIST * 0.707]} />;
}
