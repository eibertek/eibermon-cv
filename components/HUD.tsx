"use client";

import { useState } from "react";
import { cv } from "../data/cv";
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
  const rotateCam = useGame((s) => s.rotateCam);
  const requestTeleport = useGame((s) => s.requestTeleport);
  const setClassic = useGame((s) => s.setClassic);
  const interact = useGame((s) => s.interact);
  const [gotoOpen, setGotoOpen] = useState(false);

  if (!started || classicOpen) return null;

  const total = world.interactables.length;
  const nearby = nearbyId ? world.interactables.find((it) => it.id === nearbyId) : null;

  return (
    <div className="hud">
      <div className="hud__card">
        <strong className="hud__name">{cv.profile.name}</strong>
        <span className="hud__progress">
          {discovered.length} / {total} descubiertos
        </span>
      </div>

      <div className="hud__actions">
        <button className="btn hud__iconbtn" onClick={() => rotateCam(-1)} aria-label="Rotar cámara a la izquierda">
          ⟲
        </button>
        <button className="btn hud__iconbtn" onClick={() => rotateCam(1)} aria-label="Rotar cámara a la derecha">
          ⟳
        </button>

        <div className="hud__goto">
          <button className="btn" onClick={() => setGotoOpen((v) => !v)} aria-expanded={gotoOpen}>
            Ir a…
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
                  {d.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn" onClick={() => setClassic(true)}>
          CV clásico
        </button>
      </div>

      {nearby && !dialogId && (
        <button className="btn btn--primary hud__interact" onClick={interact}>
          Interactuar{nearby.label ? ` · ${nearby.label}` : ""}
        </button>
      )}

      <Minimap />
    </div>
  );
}
