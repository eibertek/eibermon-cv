"use client";

import dynamic from "next/dynamic";

// El juego usa WebGL: solo se carga en el navegador.
const Game = dynamic(() => import("./Game"), {
  ssr: false,
  // Se ve antes de que el store (con el locale guardado) hidrate, así que queda fijo en inglés.
  loading: () => <div className="boot">Loading city…</div>,
});

export default function GameLoader() {
  return <Game />;
}
