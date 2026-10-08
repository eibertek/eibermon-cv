import { cv } from "../data/cv";

/** CV en formato clásico. Sin hooks: sirve tanto para el overlay del juego como para /cv. */
export default function CVContent() {
  const { profile, skills, jobs } = cv;
  const tech = skills.filter((s) => s.category === "tech");
  const soft = skills.filter((s) => s.category === "soft");
  const areas = Array.from(new Set(tech.map((s) => s.area)));
  const recentFirst = [...jobs].reverse();

  return (
    <article className="cv">
      <header className="cv__header">
        <h1>{profile.name}</h1>
        <p className="cv__title">{profile.title}</p>
        {profile.location && <p className="cv__meta">{profile.location}</p>}
        <p className="cv__links">
          {profile.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </p>
      </header>

      <section>
        <h2>Perfil</h2>
        <p>{profile.summary}</p>
      </section>

      <section>
        <h2>Experiencia</h2>
        {recentFirst.map((job) => (
          <div className="cv__job" key={job.id}>
            <div className="cv__jobhead">
              <h3>
                {job.role} · {job.company}
              </h3>
              <span>{job.period}</span>
            </div>
            <p>{job.summary}</p>
            <ul>
              {job.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Tecnologías</h2>
        {areas.map((area) => (
          <p key={area}>
            <strong>{area}:</strong>{" "}
            {tech
              .filter((s) => s.area === area)
              .map((s) => s.name)
              .join(", ")}
          </p>
        ))}
      </section>

      <section>
        <h2>Habilidades blandas</h2>
        <p>{soft.map((s) => s.name).join(", ")}</p>
      </section>
    </article>
  );
}
