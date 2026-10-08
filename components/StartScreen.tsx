"use client";

import { cv } from "../data/cv";
import { type Character, useGame } from "../game/store";

const CHARACTERS: { id: Character; label: string }[] = [
  { id: "female", label: "Mujer" },
  { id: "male", label: "Varón" },
];

export default function StartScreen() {
  const started = useGame((s) => s.started);
  const discovered = useGame((s) => s.discovered);
  const character = useGame((s) => s.character);
  const start = useGame((s) => s.start);
  const setClassic = useGame((s) => s.setClassic);
  const resetProgress = useGame((s) => s.resetProgress);
  const setCharacter = useGame((s) => s.setCharacter);

  if (started) return null;

  const hasProgress = discovered.length > 0;

  return (
    <div className="start">
      <div className="start__card">
        <p className="start__eyebrow">CV jugable</p>
        <h1>{cv.profile.name}</h1>
        <p className="start__title">{cv.profile.title}</p>
        <p className="start__summary">{cv.profile.summary}</p>

        <div className="start__characters" role="radiogroup" aria-label="Elegí tu personaje">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={character === c.id}
              className={character === c.id ? "start__character start__character--active" : "start__character"}
              onClick={() => setCharacter(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <ul className="start__help">
          <li className="desktop-only">
            <kbd>WASD</kbd> o flechas para caminar
          </li>
          <li className="desktop-only">
            <kbd>E</kbd> o <kbd>Espacio</kbd> para interactuar
          </li>
          <li className="desktop-only">
            <kbd>Q</kbd> y <kbd>R</kbd> para rotar la cámara
          </li>
          <li className="touch-only">Usá el joystick para caminar y el botón para interactuar</li>
          <li>Acercate a los objetos y a las personas para descubrir mi recorrido</li>
        </ul>

        <div className="start__actions">
          <button className="btn btn--primary" onClick={start} autoFocus>
            {hasProgress ? "Continuar" : "Empezar"}
          </button>
          <button className="btn" onClick={() => setClassic(true)}>
            Ver CV clásico
          </button>
        </div>

        {hasProgress && (
          <button className="link" onClick={resetProgress}>
            Reiniciar progreso
          </button>
        )}
      </div>
    </div>
  );
}
