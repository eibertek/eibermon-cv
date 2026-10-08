"use client";

import { useState } from "react";
import { cv, type Category, type Skill } from "../data/cv";
import { beginFight, createBattleState, throwBall, throwRay, type BattleState } from "../game/battle";
import { useGame } from "../game/store";
import { interactableById } from "../world/layout";
import { skillColor } from "../world/theme";

/** Modal de batalla: reemplaza a Dialog para las skills (kind === "skill"). */
export default function BattleModal() {
  const dialogId = useGame((s) => s.dialogId);
  if (!dialogId) return null;
  const interactable = interactableById.get(dialogId);
  if (!interactable || interactable.kind !== "skill") return null;
  const skill = cv.skills.find((s) => s.id === interactable.ref);
  if (!skill) return null;

  // key={dialogId}: cada encuentro arranca la fase de batalla de cero.
  return <BattleModalContent key={dialogId} dialogId={dialogId} skill={skill} />;
}

function BattleModalContent({ dialogId, skill }: { dialogId: string; skill: Skill }) {
  const closeDialog = useGame((s) => s.closeDialog);
  const catchSkill = useGame((s) => s.catchSkill);
  const [battle, setBattle] = useState<BattleState>(() => createBattleState(skill.level));

  const color = skillColor(skill);
  const energyPct = Math.round((battle.energy / battle.maxEnergy) * 100);

  function handleBall() {
    setBattle((b) => {
      const next = throwBall(b);
      if (next.phase === "caught") catchSkill(dialogId);
      return next;
    });
  }

  return (
    <div className="battle" role="dialog" aria-modal="true" aria-label={`Batalla contra ${skill.name}`}>
      <div className="battle__scene">
        <CreatureArt category={skill.category} color={color} shaking={battle.phase === "catching"} />
        {battle.phase !== "intro" && (
          <div className="battle__hpbar">
            <div className="battle__hpbar-fill" style={{ width: `${energyPct}%` }} />
          </div>
        )}
      </div>

      <div className="battle__box">
        {battle.phase === "intro" && (
          <>
            <p className="battle__text">¡Un Eibermon salvaje apareció! Es {skill.name}.</p>
            <div className="battle__actions">
              <button className="btn btn--primary" onClick={() => setBattle((b) => beginFight(b))}>
                ¡Empezar!
              </button>
              <button className="btn" onClick={closeDialog}>
                Huir
              </button>
            </div>
          </>
        )}

        {battle.phase === "fighting" && (
          <>
            <p className="battle__text">{skill.name} se resiste. ¡Atacalo con un rayo!</p>
            <div className="battle__actions">
              <button className="btn btn--primary" onClick={() => setBattle((b) => throwRay(b))}>
                Rayo
              </button>
              <button className="btn" onClick={closeDialog}>
                Huir
              </button>
            </div>
          </>
        )}

        {battle.phase === "catching" && (
          <>
            <p className="battle__text">¡{skill.name} está débil! Es el momento de atraparlo.</p>
            <div className="battle__actions">
              <button className="btn btn--primary" onClick={handleBall}>
                ¡Eiberball!
              </button>
              <button className="btn" onClick={closeDialog}>
                Huir
              </button>
            </div>
          </>
        )}

        {battle.phase === "caught" && (
          <>
            <p className="battle__text">¡Atrapado! Sumaste a {skill.name} a tu Eibermon.</p>
            <p className="dialog__eyebrow">
              {skill.category === "tech" ? "Tecnología" : "Habilidad blanda"} · {skill.area}
            </p>
            <div className="battle__level" aria-label={`Nivel ${skill.level} de 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= skill.level ? "dialog__pip dialog__pip--on" : "dialog__pip"} />
              ))}
              {skill.years !== undefined && <span className="dialog__years">{skill.years} años</span>}
            </div>
            <p className="battle__description">{skill.description}</p>
            <button className="btn btn--primary" onClick={closeDialog}>
              Seguir caminando
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CreatureArt({ category, color, shaking }: { category: Category; color: string; shaking: boolean }) {
  return (
    <div className={shaking ? "battle__creature battle__creature--shake" : "battle__creature"}>
      {category === "tech" ? (
        <svg viewBox="0 0 100 100" className="battle__creature-svg" aria-hidden="true">
          <polygon points="50,6 90,35 76,90 24,90 10,35" fill={color} />
          <polygon points="50,6 90,35 50,52 10,35" fill="#ffffff" opacity="0.25" />
        </svg>
      ) : (
        <svg viewBox="0 0 100 100" className="battle__creature-svg" aria-hidden="true">
          <circle cx="50" cy="55" r="40" fill={color} />
          <circle cx="36" cy="45" r="10" fill="#ffffff" opacity="0.3" />
        </svg>
      )}
    </div>
  );
}
