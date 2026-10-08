"use client";

import dynamic from "next/dynamic";

// El juego usa WebGL: solo se carga en el navegador.
const Game = dynamic(() => import("./Game"), {
  ssr: false,
  loading: () => <div className="boot">Cargando ciudad…</div>,
});

export default function GameLoader() {
  return <Game />;
}
