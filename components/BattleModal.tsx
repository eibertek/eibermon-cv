"use client";

import { useEffect, useRef, useState } from "react";
import { cv, type Skill } from "../data/cv";
import BattleCreature from "./BattleCreature";
import { beginFight, createBattleState, throwBall, throwRay, type BattleState } from "../game/battle";
import { useGame } from "../game/store";
import { interactableById } from "../world/layout";

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

const THROW_DURATION_MS = 500;

function BattleModalContent({ dialogId, skill }: { dialogId: string; skill: Skill }) {
  const closeDialog = useGame((s) => s.closeDialog);
  const catchSkill = useGame((s) => s.catchSkill);
  const [battle, setBattle] = useState<BattleState>(() => createBattleState(skill.level));
  const [zapId, setZapId] = useState(0);
  const [throwing, setThrowing] = useState(false);
  const throwTimeout = useRef<number | null>(null);

  // Si se huye (Huir o Escape) mientras la Eiberball está en el aire, cancelá el
  // final del lanzamiento: de lo contrario catchSkill() dispararía igual sobre un
  // encuentro ya abandonado.
  useEffect(() => {
    return () => {
      if (throwTimeout.current) clearTimeout(throwTimeout.current);
    };
  }, []);

  const energyPct = Math.round((battle.energy / battle.maxEnergy) * 100);

  function handleRay() {
    setBattle((b) => throwRay(b));
    setZapId((id) => id + 1);
  }

  function handleBall() {
    if (throwing || battle.phase !== "catching") return;
    setThrowing(true);
    throwTimeout.current = window.setTimeout(() => {
      const next = throwBall(battle);
      setBattle(next);
      if (next.phase === "caught") catchSkill(dialogId);
      setThrowing(false);
    }, THROW_DURATION_MS);
  }

  return (
    <div className="battle" role="dialog" aria-modal="true" aria-label={`Batalla contra ${skill.name}`}>
      <div className="battle__scene">
        <BattleCreature skillId={skill.id} shaking={throwing} />
        {zapId > 0 && <div key={zapId} className="battle__zap" />}
        {battle.phase === "caught" && <div className="battle__sparkle" aria-hidden="true" />}
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
              <button className="btn btn--primary" onClick={handleRay}>
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
            <p className="battle__text">
              {throwing ? "¡Lanzaste la Eiberball!" : `¡${skill.name} está débil! Es el momento de atraparlo.`}
            </p>
            <div className="battle__actions">
              <button className="btn btn--primary" onClick={handleBall} disabled={throwing}>
                ¡Eiberball!
              </button>
              <button className="btn" onClick={closeDialog} disabled={throwing}>
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
