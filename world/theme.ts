import type { Job, Skill } from "../data/cv";

/** Clave en inglés (`skill.area.en`): el área es bilingüe pero el color necesita una clave estable. */
const AREA_COLORS: Record<string, string> = {
  Frontend: "#4cc9f0",
  Backend: "#f72585",
  Data: "#7bd88f",
  People: "#ffb703",
  Mindset: "#ff7a59",
  Testing: "#3ebd93",
  CMS: "#5b6fe0",
};

const TECH_DEFAULT = "#4cc9f0";
const SOFT_DEFAULT = "#ffb703";

export function skillColor(skill: Skill): string {
  return skill.color ?? AREA_COLORS[skill.area.en] ?? (skill.category === "tech" ? TECH_DEFAULT : SOFT_DEFAULT);
}

const JOB_COLORS = ["#e76f51", "#2a9d8f", "#e9c46a", "#8d99ae", "#9b72cf", "#f28482"];

export function jobColor(job: Job, index: number): string {
  return job.color ?? JOB_COLORS[index % JOB_COLORS.length];
}
