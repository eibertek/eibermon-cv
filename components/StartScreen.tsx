"use client";

import { cv } from "../data/cv";
import { t, ui, type StringKey } from "../data/i18n";
import { type Character, useGame } from "../game/store";

const CHARACTERS: { id: Character; labelKey: StringKey }[] = [
  { id: "female", labelKey: "characterFemale" },
  { id: "male", labelKey: "characterMale" },
];

export default function StartScreen() {
  const started = useGame((s) => s.started);
  const discovered = useGame((s) => s.discovered);
  const character = useGame((s) => s.character);
  const locale = useGame((s) => s.locale);
  const start = useGame((s) => s.start);
  const setClassic = useGame((s) => s.setClassic);
  const resetProgress = useGame((s) => s.resetProgress);
  const setCharacter = useGame((s) => s.setCharacter);
  const setLocale = useGame((s) => s.setLocale);

  if (started) return null;

  const hasProgress = discovered.length > 0;

  return (
    <div className="start">
      <div className="start__card">
        <button className="btn start__lang" onClick={() => setLocale(locale === "en" ? "es" : "en")}>
          {ui("languageToggle", locale)}
        </button>

        <p className="start__eyebrow">{ui("gameTitle", locale)}</p>
        <h1>{cv.profile.name}</h1>
        <p className="start__title">{t(cv.profile.title, locale)}</p>
        <p className="start__summary">{t(cv.profile.summary, locale)}</p>

        <div className="start__characters" role="radiogroup" aria-label={ui("chooseCharacter", locale)}>
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={character === c.id}
              className={character === c.id ? "start__character start__character--active" : "start__character"}
              onClick={() => setCharacter(c.id)}
            >
              {ui(c.labelKey, locale)}
            </button>
          ))}
        </div>

        <ul className="start__help">
          <li className="desktop-only">{ui("helpMove", locale)}</li>
          <li className="desktop-only">{ui("helpInteract", locale)}</li>
          <li className="desktop-only">{ui("helpCamera", locale)}</li>
          <li className="touch-only">{ui("helpTouch", locale)}</li>
          <li>{ui("helpDiscover", locale)}</li>
        </ul>

        <div className="start__actions">
          <button className="btn btn--primary" onClick={start} autoFocus>
            {hasProgress ? ui("continue", locale) : ui("start", locale)}
          </button>
          <button className="btn" onClick={() => setClassic(true)}>
            {ui("seeClassicCv", locale)}
          </button>
        </div>

        {hasProgress && (
          <button className="link" onClick={resetProgress}>
            {ui("resetProgress", locale)}
          </button>
        )}
      </div>
    </div>
  );
}
