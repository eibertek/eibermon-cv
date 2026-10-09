"use client";

import { useState } from "react";
import { cv } from "../data/cv";
import { t, ui } from "../data/i18n";
import { BADGE_DESC_KEY, BADGE_ICON, BADGE_IDS, BADGE_LABEL_KEY, isBadgeEarned } from "../game/badges";
import { useGame } from "../game/store";
import { world } from "../world/layout";
import Minimap from "./Minimap";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Interfaz permanente del juego: progreso, badges, puntaje, acciones y mapa. */
export default function HUD() {
  const started = useGame((s) => s.started);
  const classicOpen = useGame((s) => s.classicOpen);
  const dialogId = useGame((s) => s.dialogId);
  const discovered = useGame((s) => s.discovered);
  const nearbyId = useGame((s) => s.nearbyId);
  const locale = useGame((s) => s.locale);
  const score = useGame((s) => s.score);
  const bestTimeSeconds = useGame((s) => s.bestTimeSeconds);
  const rotateCam = useGame((s) => s.rotateCam);
  const requestTeleport = useGame((s) => s.requestTeleport);
  const setClassic = useGame((s) => s.setClassic);
  const interact = useGame((s) => s.interact);
  const setLocale = useGame((s) => s.setLocale);
  const resetProgress = useGame((s) => s.resetProgress);
  const infoBadge = useGame((s) => s.infoBadge);
  const openBadgeInfo = useGame((s) => s.openBadgeInfo);
  const closeBadgeInfo = useGame((s) => s.closeBadgeInfo);
  const [gotoOpen, setGotoOpen] = useState(false);

  if (!started || classicOpen) return null;

  const total = world.interactables.length;
  const nearby = nearbyId ? world.interactables.find((it) => it.id === nearbyId) : null;

  function handleReset() {
    if (window.confirm(ui("resetConfirm", locale))) resetProgress();
  }

  return (
    <div className="hud">
      <div className="hud__card">
        <strong className="hud__name">{cv.profile.name}</strong>
        <span className="hud__progress">
          {discovered.length} / {total} {ui("discovered", locale)}
        </span>
        <span className="hud__score">
          {ui("score", locale)}: {score}
          {bestTimeSeconds !== null && ` · ${ui("bestTime", locale)}: ${formatTime(bestTimeSeconds)}`}
        </span>
        <div className="hud__badges">
          {BADGE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={isBadgeEarned(id, discovered) ? "hud__badge hud__badge--on" : "hud__badge"}
              onClick={() => openBadgeInfo(id)}
              aria-label={`${ui(BADGE_LABEL_KEY[id], locale)} — ${ui(BADGE_DESC_KEY[id], locale)}`}
            >
              {BADGE_ICON[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="hud__actions">
        <button
          className="btn hud__iconbtn"
          onClick={() => rotateCam(-1)}
          aria-label={ui("rotateLeft", locale)}
        >
          ⟲
        </button>
        <button
          className="btn hud__iconbtn"
          onClick={() => rotateCam(1)}
          aria-label={ui("rotateRight", locale)}
        >
          ⟳
        </button>

        <div className="hud__goto">
          <button className="btn" onClick={() => setGotoOpen((v) => !v)} aria-expanded={gotoOpen}>
            {ui("goTo", locale)}
          </button>
          {gotoOpen && (
            <div className="hud__gotomenu">
              {world.districts.map((d) => (
                <button
                  key={d.id}
                  className="btn"
                  onClick={() => {
                    requestTeleport(d.spawn[0], d.spawn[1]);
                    setGotoOpen(false);
                  }}
                >
                  {t(d.name, locale)}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn" onClick={() => setClassic(true)}>
          {ui("classicCv", locale)}
        </button>

        <button className="btn" onClick={() => setLocale(locale === "en" ? "es" : "en")}>
          {ui("languageToggle", locale)}
        </button>

        <button className="btn hud__reset" onClick={handleReset}>
          {ui("resetButton", locale)}
        </button>
      </div>

      {nearby && !dialogId && (
        <button className="btn btn--primary hud__interact" onClick={interact}>
          {ui("interact", locale)}
          {nearby.label ? ` · ${t(nearby.label, locale)}` : ""}
        </button>
      )}

      <Minimap />

      {infoBadge && (
        <div className="dialog badge-modal" role="dialog" aria-modal="true" onClick={closeBadgeInfo}>
          <div className="dialog__card" onClick={(e) => e.stopPropagation()}>
            <button
              className="dialog__close"
              onClick={closeBadgeInfo}
              aria-label={ui("close", locale)}
            >
              ✕
            </button>
            <span
              className={
                isBadgeEarned(infoBadge, discovered) ? "badge-modal__icon" : "badge-modal__icon badge-modal__icon--locked"
              }
              aria-hidden="true"
            >
              {BADGE_ICON[infoBadge]}
            </span>
            <p className="dialog__eyebrow">
              {isBadgeEarned(infoBadge, discovered) ? ui("badgeEarnedLabel", locale) : ui("badgeLocked", locale)}
            </p>
            <h2>{ui(BADGE_LABEL_KEY[infoBadge], locale)}</h2>
            <p>{ui(BADGE_DESC_KEY[infoBadge], locale)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
