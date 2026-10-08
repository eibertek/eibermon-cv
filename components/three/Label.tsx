import type { ReactNode } from "react";
import { Html } from "@react-three/drei";

type Props = {
  position?: [number, number, number];
  className?: string;
  children: ReactNode;
};

/** Cartel HTML anclado a una posición 3D. */
export default function Label({ position = [0, 2.4, 0], className = "label", children }: Props) {
  return (
    <Html position={position} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
      <div className={className}>{children}</div>
    </Html>
  );
}
