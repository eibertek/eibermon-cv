"use client";

import { cv } from "../data/cv";
import { t, ui } from "../data/i18n";
import { BADGE_DESC_KEY, BADGE_ICON, BADGE_LABEL_KEY } from "../game/badges";
import { useGame } from "../game/store";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Modal automático: se abre solo cuando se gana una medalla nueva (ver `badgeQueue` en game/store.ts). */
export default function BadgeModal() {
  const badgeQueue = useGame((s) => s.badgeQueue);
  const dismissBadge = useGame((s) => s.dismissBadge);
  const score = useGame((s) => s.score);
  const bestTimeSeconds = useGame((s) => s.bestTimeSeconds);
  const locale = useGame((s) => s.locale);

  if (badgeQueue.length === 0) return null;
  const badgeId = badgeQueue[0];

  // La medalla de completista es el cierre del recorrido: modal grande, con agradecimiento y contacto.
  if (badgeId === "completionist") {
    return (
      <div className="dialog badge-modal" role="dialog" aria-modal="true">
        <div className="dialog__card badge-modal__card--thanks">
          <span className="badge-modal__icon" aria-hidden="true">
            {BADGE_ICON.completionist}
          </span>
          <h2>{ui("thanksTitle", locale)}</h2>
          <p>{ui("thanksMessage", locale)}</p>
          <p className="badge-modal__score">
            {ui("finalScore", locale)}: {score}
            {bestTimeSeconds !== null && ` · ${ui("bestTime", locale)}: ${formatTime(bestTimeSeconds)}`}
          </p>
          <ul className="dialog__links">
            {cv.profile.links.map((link) => (
              <li key={link.url}>
                <a
                  className="link"
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {t(link.label, locale)}
                </a>
              </li>
            ))}
          </ul>
          <button className="btn btn--primary dialog__ok" onClick={dismissBadge}>
            {ui("badgeModalClose", locale)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dialog badge-modal" role="dialog" aria-modal="true">
      <div className="dialog__card">
        <span className="badge-modal__icon" aria-hidden="true">
          {BADGE_ICON[badgeId]}
        </span>
        <p className="dialog__eyebrow">{ui("badgeEarnedEyebrow", locale)}</p>
        <h2>{ui(BADGE_LABEL_KEY[badgeId], locale)}</h2>
        <p>{ui(BADGE_DESC_KEY[badgeId], locale)}</p>
        <button className="btn btn--primary dialog__ok" onClick={dismissBadge}>
          {ui("badgeModalClose", locale)}
        </button>
      </div>
    </div>
  );
}
