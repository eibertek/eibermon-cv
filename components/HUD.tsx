"use client";

import { useState } from "react";
import { cv } from "../data/cv";
import { t, ui } from "../data/i18n";
import { useGame } from "../game/store";
import { world } from "../world/layout";
import Minimap from "./Minimap";

/** Interfaz permanente del juego: progreso, acciones y mapa. */
export default function HUD() {
  const started = useGame((s) => s.started);
  const classicOpen = useGame((s) => s.classicOpen);
  const dialogId = useGame((s) => s.dialogId);
  const discovered = useGame((s) => s.discovered);
  const nearbyId = useGame((s) => s.nearbyId);
  const locale = useGame((s) => s.locale);
  const rotateCam = useGame((s) => s.rotateCam);
  const requestTeleport = useGame((s) => s.requestTeleport);
  const setClassic = useGame((s) => s.setClassic);
  const interact = useGame((s) => s.interact);
  const setLocale = useGame((s) => s.setLocale);
  const [gotoOpen, setGotoOpen] = useState(false);

  if (!started || classicOpen) return null;

  const total = world.interactables.length;
  const nearby = nearbyId ? world.interactables.find((it) => it.id === nearbyId) : null;

  return (
    <div className="hud">
      <div className="hud__card">
        <strong className="hud__name">{cv.profile.name}</strong>
        <span className="hud__progress">
          {discovered.length} / {total} {ui("discovered", locale)}
        </span>
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
      </div>

      {nearby && !dialogId && (
        <button className="btn btn--primary hud__interact" onClick={interact}>
          {ui("interact", locale)}
          {nearby.label ? ` · ${t(nearby.label, locale)}` : ""}
        </button>
      )}

      <Minimap />
    </div>
  );
}
