import { cv } from "../data/cv";
import { t, ui, type Locale } from "../data/i18n";

/** CV en formato clásico. Sin hooks: sirve tanto para el overlay del juego como para /cv. */
export default function CVContent({ locale }: { locale: Locale }) {
  const { profile, skills, jobs, earlierJobs } = cv;
  const tech = skills.filter((s) => s.category === "tech");
  const soft = skills.filter((s) => s.category === "soft");
  const areaKeys = Array.from(new Set(tech.map((s) => s.area.en)));
  const recentFirst = [...jobs].reverse();

  return (
    <article className="cv">
      <header className="cv__header">
        <h1>{profile.name}</h1>
        <p className="cv__title">{t(profile.title, locale)}</p>
        {profile.location && <p className="cv__meta">{profile.location}</p>}
        <p className="cv__links">
          {profile.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              {t(link.label, locale)}
            </a>
          ))}
        </p>
      </header>

      <section>
        <h2>{ui("cvProfile", locale)}</h2>
        <p>{t(profile.summary, locale)}</p>
      </section>

      <section>
        <h2>{ui("cvExperience", locale)}</h2>
        {recentFirst.map((job) => (
          <div className="cv__job" key={job.id}>
            <div className="cv__jobhead">
              <h3>
                {t(job.role, locale)} · {job.company}
              </h3>
              <span>{t(job.period, locale)}</span>
            </div>
            <p>{t(job.summary, locale)}</p>
            <ul>
              {job.achievements.map((a) => (
                <li key={a.en}>{t(a, locale)}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>{ui("cvEarlierRoles", locale)}</h2>
        <ul className="cv__earlier">
          {earlierJobs.map((job, i) => (
            <li key={`${job.company}-${i}`}>
              <strong>{job.company}</strong> — {t(job.role, locale)} <span>({t(job.period, locale)})</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{ui("cvTechnologies", locale)}</h2>
        {areaKeys.map((areaKey) => {
          const areaSkills = tech.filter((s) => s.area.en === areaKey);
          return (
            <p key={areaKey}>
              <strong>{t(areaSkills[0].area, locale)}:</strong>{" "}
              {areaSkills.map((s) => t(s.name, locale)).join(", ")}
            </p>
          );
        })}
      </section>

      <section>
        <h2>{ui("cvSoftSkills", locale)}</h2>
        <p>{soft.map((s) => t(s.name, locale)).join(", ")}</p>
      </section>
    </article>
  );
}
