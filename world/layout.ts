import { cv, type Job, type Skill } from "../data/cv";

export type Vec2 = [number, number];

export type Obstacle =
  | { kind: "rect"; x: number; z: number; hw: number; hd: number }
  | { kind: "circle"; x: number; z: number; r: number };

export type InteractKind = "skill" | "job" | "contact";

export type Interactable = {
  /** "skill:ts" | "job:nube-labs" | "contact" */
  id: string;
  kind: InteractKind;
  /** id dentro de data/cv.ts ("contact" para el buzón) */
  ref: string;
  pos: Vec2;
  radius: number;
  label: string;
};

export type District = {
  id: string;
  name: string;
  tagline: string;
  center: Vec2;
  /** ancho (x) y fondo (z) del piso; en círculos, el diámetro está en size[0] */
  size: Vec2;
  shape: "circle" | "rect";
  spawn: Vec2;
  color: string;
};

export type SkillSpot = { skill: Skill; pos: Vec2; interactId: string };

export type JobSpot = {
  job: Job;
  index: number;
  building: Vec2;
  buildingRotY: number;
  npc: Vec2;
  interactId: string;
};

export type PathRect = { x: number; z: number; w: number; d: number; color: string };

export type Decor = { id: "tree" | "lamp"; pos: Vec2; rotY: number; scale: number };

export type World = {
  districts: District[];
  skills: SkillSpot[];
  jobs: JobSpot[];
  contact: { pos: Vec2; interactId: string };
  paths: PathRect[];
  decor: Decor[];
  interactables: Interactable[];
  obstacles: Obstacle[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
};

// Medidas del layout (en metros de mundo)
const TECH_COLS = 4;
const TECH_SPACING = 3.4;
const JOB_SPACING = 11;
const BUILDING_HW = 3.2;
const BUILDING_HD = 2.6;

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildWorld(): World {
  const techSkills = cv.skills.filter((s) => s.category === "tech");
  const softSkills = cv.skills.filter((s) => s.category === "soft");

  // ── Plaza de las Soft Skills (centro, punto de partida) ──────────────
  const plazaRadius = Math.max(4.5, (softSkills.length * 3.2) / (2 * Math.PI));
  const plazaEdge = plazaRadius + 2.5;
  const plaza: District = {
    id: "plaza",
    name: "Plaza de las Soft Skills",
    tagline: "Lo que no se aprende con un tutorial",
    center: [0, 0],
    size: [plazaEdge * 2, plazaEdge * 2],
    shape: "circle",
    spawn: [0, 0],
    color: "#f3e3b6",
  };

  // ── Barrio Tech (oeste) ──────────────────────────────────────────────
  const techCols = Math.min(TECH_COLS, Math.max(1, techSkills.length));
  const techRows = Math.max(1, Math.ceil(techSkills.length / TECH_COLS));
  const techW = techCols * TECH_SPACING + 2;
  const techD = techRows * TECH_SPACING + 2;
  const techGap = 6;
  const techCenterX = -plazaEdge - techGap - techW / 2;
  const tech: District = {
    id: "tech",
    name: "Barrio Tech",
    tagline: "Las herramientas del oficio",
    center: [techCenterX, 0],
    size: [techW, techD],
    shape: "rect",
    spawn: [techCenterX + techW / 2 + 1.5, 0],
    color: "#cfe8f3",
  };

  // ── Avenida de la Experiencia (este) ─────────────────────────────────
  const avenueStart = Math.max(9, plazaEdge + 3);
  const firstJobX = avenueStart + 8;
  const jobCount = cv.jobs.length;
  const lastJobX = jobCount > 0 ? firstJobX + (jobCount - 1) * JOB_SPACING : firstJobX;
  const avenueEnd = lastJobX + 9;
  const experience: District = {
    id: "experience",
    name: "Avenida de la Experiencia",
    tagline: "Los lugares donde crecí",
    center: [(avenueStart + avenueEnd) / 2, 0],
    size: [avenueEnd - avenueStart, 17],
    shape: "rect",
    spawn: [avenueStart + 3, 0],
    color: "#e6e0d4",
  };

  // ── Estación de Contacto (final) ─────────────────────────────────────
  const contactX = avenueEnd + 5;
  const contactDistrict: District = {
    id: "contact",
    name: "Estación de Contacto",
    tagline: "¿Hablamos?",
    center: [contactX, 0],
    size: [9, 9],
    shape: "circle",
    spawn: [contactX - 2.6, 0],
    color: "#f4d6d6",
  };

  const districts = [plaza, tech, experience, contactDistrict];

  // ── Posiciones de las skills ─────────────────────────────────────────
  const skillSpots: SkillSpot[] = [];
  techSkills.forEach((skill, i) => {
    const col = i % TECH_COLS;
    const row = Math.floor(i / TECH_COLS);
    const x = techCenterX + (col - (techCols - 1) / 2) * TECH_SPACING;
    const z = (row - (techRows - 1) / 2) * TECH_SPACING;
    skillSpots.push({ skill, pos: [x, z], interactId: `skill:${skill.id}` });
  });
  softSkills.forEach((skill, i) => {
    const angle = (i / softSkills.length) * Math.PI * 2 - Math.PI / 2;
    skillSpots.push({
      skill,
      pos: [Math.cos(angle) * plazaRadius, Math.sin(angle) * plazaRadius],
      interactId: `skill:${skill.id}`,
    });
  });

  // ── Edificios y NPCs de los trabajos ─────────────────────────────────
  const jobSpots: JobSpot[] = cv.jobs.map((job, index) => {
    const x = firstJobX + index * JOB_SPACING;
    const side = index % 2 === 0 ? -1 : 1; // -1: lado norte (z negativo)
    return {
      job,
      index,
      building: [x, side * 5.5],
      // el frente del modelo mira a +z; los del lado sur se giran para mirar a la avenida
      buildingRotY: side < 0 ? 0 : Math.PI,
      npc: [x, side * 1.3],
      interactId: `job:${job.id}`,
    };
  });

  // ── Caminos ──────────────────────────────────────────────────────────
  const paths: PathRect[] = [
    {
      x: -plazaEdge - techGap / 2,
      z: 0,
      w: techGap,
      d: 2.6,
      color: "#d9c9a3",
    },
    {
      x: (plazaEdge + avenueStart) / 2,
      z: 0,
      w: avenueStart - plazaEdge,
      d: 2.6,
      color: "#d9c9a3",
    },
    {
      x: (avenueStart + contactX) / 2,
      z: 0,
      w: contactX - avenueStart,
      d: 4,
      color: "#b9b2a3",
    },
  ];

  // ── Interactuables ───────────────────────────────────────────────────
  const interactables: Interactable[] = [
    ...skillSpots.map<Interactable>((s) => ({
      id: s.interactId,
      kind: "skill",
      ref: s.skill.id,
      pos: s.pos,
      radius: 2.2,
      label: s.skill.name,
    })),
    ...jobSpots.map<Interactable>((j) => ({
      id: j.interactId,
      kind: "job",
      ref: j.job.id,
      pos: j.npc,
      radius: 2.6,
      label: j.job.npc.name,
    })),
    {
      id: "contact",
      kind: "contact",
      ref: "contact",
      pos: [contactX, 0],
      radius: 2.8,
      label: "Buzón de contacto",
    },
  ];

  // ── Obstáculos (colisiones) ──────────────────────────────────────────
  const obstacles: Obstacle[] = [
    ...skillSpots.map<Obstacle>((s) => ({ kind: "circle", x: s.pos[0], z: s.pos[1], r: 0.75 })),
    ...jobSpots.map<Obstacle>((j) => ({
      kind: "rect",
      x: j.building[0],
      z: j.building[1],
      hw: BUILDING_HW,
      hd: BUILDING_HD,
    })),
    ...jobSpots.map<Obstacle>((j) => ({ kind: "circle", x: j.npc[0], z: j.npc[1], r: 0.5 })),
    { kind: "circle", x: contactX, z: 0, r: 0.8 },
  ];

  // ── Límites del mundo ────────────────────────────────────────────────
  const halfDepth = Math.max(15, techD / 2 + 6, plazaEdge + 4);
  const bounds = {
    minX: techCenterX - techW / 2 - 8,
    maxX: contactX + 9,
    minZ: -halfDepth,
    maxZ: halfDepth,
  };

  // ── Decoración: faroles a lo largo de la avenida ─────────────────────
  const decor: Decor[] = [];
  let lampIndex = 0;
  for (let x = avenueStart + 2; x < contactX - 3; x += 5.5) {
    decor.push({ id: "lamp", pos: [x, lampIndex % 2 === 0 ? -2.3 : 2.3], rotY: 0, scale: 1 });
    obstacles.push({ kind: "circle", x, z: lampIndex % 2 === 0 ? -2.3 : 2.3, r: 0.25 });
    lampIndex++;
  }

  // ── Decoración: árboles (determinista) ───────────────────────────────
  const rng = mulberry32(7);
  const blocked: { x: number; z: number; hw: number; hd: number }[] = [
    ...districts.map((d) => ({
      x: d.center[0],
      z: d.center[1],
      hw: d.size[0] / 2 + 1.5,
      hd: d.size[1] / 2 + 1.5,
    })),
    ...paths.map((p) => ({ x: p.x, z: p.z, hw: p.w / 2 + 1.2, hd: p.d / 2 + 1.2 })),
  ];
  const treePoints: Vec2[] = [];
  const treeCount = 90;
  for (let attempt = 0; attempt < 900 && treePoints.length < treeCount; attempt++) {
    const x = bounds.minX - 10 + rng() * (bounds.maxX - bounds.minX + 20);
    const z = bounds.minZ - 10 + rng() * (bounds.maxZ - bounds.minZ + 20);
    const inBlocked = blocked.some((r) => Math.abs(x - r.x) < r.hw && Math.abs(z - r.z) < r.hd);
    if (inBlocked) continue;
    const nearInteractable = interactables.some((it) => Math.hypot(x - it.pos[0], z - it.pos[1]) < 3);
    if (nearInteractable) continue;
    const nearBuilding = jobSpots.some(
      (j) => Math.abs(x - j.building[0]) < BUILDING_HW + 2.5 && Math.abs(z - j.building[1]) < BUILDING_HD + 2.5,
    );
    if (nearBuilding) continue;
    const nearTree = treePoints.some((p) => Math.hypot(x - p[0], z - p[1]) < 2.2);
    if (nearTree) continue;
    treePoints.push([x, z]);
    const scale = 0.8 + rng() * 0.6;
    decor.push({ id: "tree", pos: [x, z], rotY: rng() * Math.PI * 2, scale });
    obstacles.push({ kind: "circle", x, z, r: 0.45 * scale });
  }

  return {
    districts,
    skills: skillSpots,
    jobs: jobSpots,
    contact: { pos: [contactX, 0], interactId: "contact" },
    paths,
    decor,
    interactables,
    obstacles,
    bounds,
  };
}

export const world: World = buildWorld();

export const interactableById: Map<string, Interactable> = new Map(
  world.interactables.map((it) => [it.id, it]),
);
