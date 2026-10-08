"use client";

import { useEffect, useRef } from "react";
import { playerState } from "../game/playerState";
import { useGame } from "../game/store";
import { world } from "../world/layout";

/** Mapa esquemático: distritos, interactuables (verde si ya los viste) y el jugador. */
export default function Minimap() {
  const discovered = useGame((s) => s.discovered);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      const dot = dotRef.current;
      if (dot) {
        dot.setAttribute("cx", String(playerState.x));
        dot.setAttribute("cy", String(playerState.z));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const b = world.bounds;
  const w = b.maxX - b.minX;
  const h = b.maxZ - b.minZ;
  const dotRadius = Math.max(w, h) * 0.014;

  return (
    <svg
      className="minimap"
      viewBox={`${b.minX} ${b.minZ} ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Mapa"
    >
      {world.districts.map((d) => {
        const [cx, cz] = d.center;
        const [dw, dd] = d.size;
        return d.shape === "circle" ? (
          <circle key={d.id} className="minimap__district" cx={cx} cy={cz} r={dw / 2} fill={d.color} />
        ) : (
          <rect
            key={d.id}
            className="minimap__district"
            x={cx - dw / 2}
            y={cz - dd / 2}
            width={dw}
            height={dd}
            fill={d.color}
          />
        );
      })}

      {world.interactables.map((it) => (
        <circle
          key={it.id}
          cx={it.pos[0]}
          cy={it.pos[1]}
          r={dotRadius}
          className={discovered.includes(it.id) ? "minimap__dot minimap__dot--found" : "minimap__dot"}
        />
      ))}

      <circle ref={dotRef} cx={playerState.x} cy={playerState.z} r={dotRadius * 1.3} className="minimap__player" />
    </svg>
  );
}
