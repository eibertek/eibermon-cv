"use client";

import { cv } from "../data/cv";
import { useGame } from "../game/store";
import CVContent from "./CVContent";

/** CV clásico por encima del juego: para quien tiene poco tiempo. */
export default function ClassicOverlay() {
  const open = useGame((s) => s.classicOpen);
  const setClassic = useGame((s) => s.setClassic);

  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="CV clásico">
      <div className="overlay__bar">
        <button className="btn" onClick={() => setClassic(false)}>
          ← Volver a la ciudad
        </button>
        <div className="overlay__actions">
          {cv.profile.pdf && (
            <a className="btn" href={cv.profile.pdf} download>
              Descargar PDF
            </a>
          )}
          <button className="btn" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>
      </div>
      <div className="overlay__sheet">
        <CVContent />
      </div>
    </div>
  );
}
