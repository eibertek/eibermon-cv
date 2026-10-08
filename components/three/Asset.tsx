import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Box3, type Group, type Material, type Mesh } from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { getAsset, type Fallback } from "../../assets/manifest";
import { hasModel } from "../../assets/available";

type AssetProps = {
  id: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  /** Si el GLB trae animación, controla si corre (default: true). Sin efecto en modelos estáticos. */
  playing?: boolean;
  /** Tiñe el material (multiplica la textura). Sirve para variar color sin generar un GLB nuevo. */
  tint?: string;
};

/**
 * Dibuja el modelo GLB del manifest si existe en /public/models.
 * Si no existe (o falla al cargar), dibuja la forma simple de `fallback`.
 */
export function Asset({ id, position, rotation, scale = 1, playing, tint }: AssetProps) {
  const entry = getAsset(id);
  const fallback = tint ? { ...entry.fallback, color: tint } : entry.fallback;
  const shape = <FallbackShape fallback={fallback} />;

  return (
    <group position={position} rotation={rotation} scale={scale * (entry.scale ?? 1)}>
      {hasModel(entry.file) ? (
        <ModelBoundary fallback={shape}>
          <Suspense fallback={shape}>
            <Model url={`/${entry.file}`} playing={playing} tint={tint} />
          </Suspense>
        </ModelBoundary>
      ) : (
        shape
      )}
    </group>
  );
}

function Model({ url, playing = true, tint }: { url: string; playing?: boolean; tint?: string }) {
  // Draco desactivado a propósito: el script de optimización usa Meshopt,
  // así el juego no depende de ningún CDN para decodificar.
  const { scene, animations } = useGLTF(url, false);
  const groupRef = useRef<Group>(null);
  const object = useMemo(() => {
    const copy = cloneSkinned(scene) as Group;
    copy.traverse((o) => {
      if ((o as Mesh).isMesh) {
        const mesh = o as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Clonamos el material por instancia: varios edificios comparten el mismo GLB
        // (ver `buildingTypeIds`) pero cada uno necesita su propio tinte/opacidad.
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : (mesh.material as Material).clone();
        if (tint) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of materials) {
            if ("color" in m) (m as Material & { color: { set: (c: string) => void } }).color.set(tint);
          }
        }
      }
    });
    // Meshy centra el modelo en su bounding box, no apoyado en los pies: lo bajamos a y = 0.
    const box = new Box3().setFromObject(copy);
    copy.position.y -= box.min.y;
    return copy;
  }, [scene, tint]);

  const { actions, mixer } = useAnimations(animations, groupRef);

  useEffect(() => {
    const clip = animations[0];
    if (!clip) return;
    actions[clip.name]?.reset().play();
  }, [actions, animations]);

  useEffect(() => {
    mixer.timeScale = playing ? 1 : 0;
  }, [mixer, playing]);

  return <primitive ref={groupRef} object={object} />;
}

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[cv-city] No se pudo cargar un modelo, uso el reemplazo:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Formas simples con la base apoyada en y = 0. */
export function FallbackShape({ fallback }: { fallback: Fallback }) {
  const { shape, color, size, roof, trunk } = fallback;
  const [w, h, d] = size;
  const material = <meshStandardMaterial color={color} flatShading roughness={0.85} />;

  switch (shape) {
    case "box":
      return (
        <group>
          <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            {material}
          </mesh>
          {roof && (
            <>
              <mesh castShadow position={[0, h + h * 0.18, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[(Math.hypot(w, d) / 2) * 1.08, h * 0.36, 4]} />
                <meshStandardMaterial color={roof} flatShading roughness={0.9} />
              </mesh>
              {/* puerta: marca el frente (+z) */}
              <mesh position={[0, 0.9, d / 2 + 0.02]}>
                <boxGeometry args={[1.2, 1.8, 0.1]} />
                <meshStandardMaterial color="#3b2f2f" />
              </mesh>
            </>
          )}
        </group>
      );

    case "cylinder":
      return (
        <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
          <cylinderGeometry args={[w / 2, w / 2, h, 12]} />
          {material}
        </mesh>
      );

    case "cone": {
      const trunkH = trunk ? h * 0.25 : 0;
      return (
        <group>
          {trunk && (
            <mesh castShadow position={[0, trunkH / 2, 0]}>
              <cylinderGeometry args={[w * 0.1, w * 0.14, trunkH, 8]} />
              <meshStandardMaterial color={trunk} flatShading />
            </mesh>
          )}
          <mesh castShadow receiveShadow position={[0, trunkH + (h - trunkH) / 2, 0]}>
            <coneGeometry args={[w / 2, h - trunkH, 8]} />
            {material}
          </mesh>
        </group>
      );
    }

    case "sphere":
      return (
        <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
          <sphereGeometry args={[w / 2, 16, 12]} />
          {material}
        </mesh>
      );

    case "octahedron":
      return (
        <mesh castShadow receiveShadow position={[0, h / 2, 0]} scale={[1, h / w, 1]}>
          <octahedronGeometry args={[w / 2]} />
          {material}
        </mesh>
      );

    case "capsule": {
      const r = w / 2;
      return (
        <group>
          <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
            <capsuleGeometry args={[r, Math.max(0.01, h - w), 4, 10]} />
            {material}
          </mesh>
          {/* "cara": marca hacia dónde mira (+z) */}
          <mesh position={[0, h * 0.78, r * 0.92]}>
            <boxGeometry args={[r * 0.9, r * 0.35, r * 0.4]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    }

    default:
      return null;
  }
}
