"use client";

import { cv } from "../data/cv";
import { ui } from "../data/i18n";
import { useGame } from "../game/store";
import CVContent from "./CVContent";

/** CV clásico por encima del juego: para quien tiene poco tiempo. */
export default function ClassicOverlay() {
  const open = useGame((s) => s.classicOpen);
  const setClassic = useGame((s) => s.setClassic);
  const locale = useGame((s) => s.locale);

  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={ui("classicCv", locale)}>
      <div className="overlay__bar">
        <button className="btn" onClick={() => setClassic(false)}>
          {ui("backToCity", locale)}
        </button>
        <div className="overlay__actions">
          {cv.profile.pdf && (
            <a className="btn" href={cv.profile.pdf} download>
              {ui("downloadPdf", locale)}
            </a>
          )}
          <button className="btn" onClick={() => window.print()}>
            {ui("print", locale)}
          </button>
        </div>
      </div>
      <div className="overlay__sheet">
        <CVContent locale={locale} />
      </div>
    </div>
  );
}
