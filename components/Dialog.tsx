"use client";

import { cv } from "../data/cv";
import { t, ui, type Locale } from "../data/i18n";
import { useGame } from "../game/store";
import { interactableById, type Interactable } from "../world/layout";

/** Modal de contenido: se abre al interactuar con un trabajo, el buzón o el archivo (las skills usan BattleModal). */
export default function Dialog() {
  const dialogId = useGame((s) => s.dialogId);
  const closeDialog = useGame((s) => s.closeDialog);
  const locale = useGame((s) => s.locale);

  if (!dialogId) return null;
  const interactable = interactableById.get(dialogId);
  if (!interactable) return null;
  if (interactable.kind === "skill") return null;

  return (
    <div className="dialog" role="dialog" aria-modal="true" onClick={closeDialog}>
      <div className="dialog__card" onClick={(e) => e.stopPropagation()}>
        <button className="dialog__close" onClick={closeDialog} aria-label={ui("close", locale)}>
          ✕
        </button>
        <DialogBody interactable={interactable} locale={locale} />
        <button className="btn btn--primary dialog__ok" onClick={closeDialog}>
          {ui("keepWalking", locale)}
        </button>
      </div>
    </div>
  );
}

function DialogBody({ interactable, locale }: { interactable: Interactable; locale: Locale }) {
  if (interactable.kind === "job") {
    const job = cv.jobs.find((j) => j.id === interactable.ref);
    if (!job) return null;
    return (
      <>
        <p className="dialog__eyebrow">{t(job.period, locale)}</p>
        <h2>
          {t(job.role, locale)} · {job.company}
        </h2>
        <p className="dialog__npc">
          <strong>{job.npc.name}</strong> · {t(job.npc.role, locale)}
        </p>
        <p className="dialog__greeting">&ldquo;{t(job.npc.greeting, locale)}&rdquo;</p>
        <p>{t(job.summary, locale)}</p>
        <ul>
          {job.achievements.map((a) => (
            <li key={a.en}>{t(a, locale)}</li>
          ))}
        </ul>
      </>
    );
  }

  if (interactable.kind === "archive") {
    return (
      <>
        <p className="dialog__eyebrow">{ui("archiveLabel", locale)}</p>
        <h2>{ui("archiveTitle", locale)}</h2>
        <p>{ui("archiveIntro", locale)}</p>
        <ul className="dialog__archive">
          {cv.earlierJobs.map((job, i) => (
            <li key={`${job.company}-${i}`}>
              <strong>{job.company}</strong> — {t(job.role, locale)}
              <span className="dialog__archive-period"> ({t(job.period, locale)})</span>
            </li>
          ))}
        </ul>
      </>
    );
  }

  // contact
  return (
    <>
      <p className="dialog__eyebrow">{ui("mailboxLabel", locale)}</p>
      <h2>{ui("mailboxTitle", locale)}</h2>
      <p>{t(cv.profile.contactMessage, locale)}</p>
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
    </>
  );
}
