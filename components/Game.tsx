"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useKeyboard } from "../game/useKeyboard";
import ClassicOverlay from "./ClassicOverlay";
import Dialog from "./Dialog";
import HUD from "./HUD";
import Joystick from "./Joystick";
import StartScreen from "./StartScreen";
import Scene from "./three/Scene";

export default function Game() {
  useKeyboard();

  return (
    <div className="game">
      <Canvas orthographic shadows dpr={[1, 1.75]} gl={{ antialias: true }}>
        <color attach="background" args={["#a9d6e5"]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <HUD />
      <Joystick />
      <Dialog />
      <StartScreen />
      <ClassicOverlay />
    </div>
  );
}
