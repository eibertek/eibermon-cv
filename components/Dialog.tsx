"use client";

import { cv } from "../data/cv";
import { useGame } from "../game/store";
import { interactableById, type Interactable } from "../world/layout";

/** Modal de contenido: se abre al interactuar con un trabajo o el buzón (las skills usan BattleModal). */
export default function Dialog() {
  const dialogId = useGame((s) => s.dialogId);
  const closeDialog = useGame((s) => s.closeDialog);

  if (!dialogId) return null;
  const interactable = interactableById.get(dialogId);
  if (!interactable) return null;
  if (interactable.kind === "skill") return null;

  return (
    <div className="dialog" role="dialog" aria-modal="true" onClick={closeDialog}>
      <div className="dialog__card" onClick={(e) => e.stopPropagation()}>
        <button className="dialog__close" onClick={closeDialog} aria-label="Cerrar">
          ✕
        </button>
        <DialogBody interactable={interactable} />
        <button className="btn btn--primary dialog__ok" onClick={closeDialog}>
          Seguir caminando
        </button>
      </div>
    </div>
  );
}

function DialogBody({ interactable }: { interactable: Interactable }) {
  if (interactable.kind === "job") {
    const job = cv.jobs.find((j) => j.id === interactable.ref);
    if (!job) return null;
    return (
      <>
        <p className="dialog__eyebrow">{job.period}</p>
        <h2>
          {job.role} · {job.company}
        </h2>
        <p className="dialog__npc">
          <strong>{job.npc.name}</strong> · {job.npc.role}
        </p>
        <p className="dialog__greeting">&ldquo;{job.npc.greeting}&rdquo;</p>
        <p>{job.summary}</p>
        <ul>
          {job.achievements.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </>
    );
  }

  // contact
  return (
    <>
      <p className="dialog__eyebrow">Buzón de contacto</p>
      <h2>¿Hablamos?</h2>
      <p>{cv.profile.contactMessage}</p>
      <ul className="dialog__links">
        {cv.profile.links.map((link) => (
          <li key={link.url}>
            <a
              className="link"
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
