import type { Job, Skill } from "../data/cv";

const AREA_COLORS: Record<string, string> = {
  Frontend: "#4cc9f0",
  Backend: "#f72585",
  Datos: "#7bd88f",
  "Cloud / DevOps": "#b388ff",
  Personas: "#ffb703",
  Mentalidad: "#ff7a59",
};

const TECH_DEFAULT = "#4cc9f0";
const SOFT_DEFAULT = "#ffb703";

export function skillColor(skill: Skill): string {
  return skill.color ?? AREA_COLORS[skill.area] ?? (skill.category === "tech" ? TECH_DEFAULT : SOFT_DEFAULT);
}

const JOB_COLORS = ["#e76f51", "#2a9d8f", "#e9c46a", "#8d99ae", "#9b72cf", "#f28482"];

export function jobColor(job: Job, index: number): string {
  return job.color ?? JOB_COLORS[index % JOB_COLORS.length];
}
