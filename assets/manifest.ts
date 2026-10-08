/**
 * Manifest de assets 3D.
 *
 * Meshy es una herramienta de PRODUCCIÓN: una vez generado un modelo, el GLB vive en
 * /public/models y el juego nunca vuelve a llamar a ninguna API.
 * Si un GLB no existe, el juego dibuja la forma simple definida en `fallback`.
 *
 * Los assets de skills, edificios y NPCs se derivan de data/cv.ts; acá solo se
 * listan a mano los props genéricos (jugador, árbol, farol, buzón).
 */
import { cv } from "../data/cv";
import { jobColor, skillColor } from "../world/theme";

export const STYLE_PREFIX =
  "low-poly stylized game asset, flat pastel colors, clean silhouette, simple shapes, isometric game view, single object, no background";

const MESHY_LICENSE = "Meshy: verificar los términos del plan con el que se generó";
const CC0 = "CC0 1.0";

export type AssetSource = "meshy" | "kenney" | "quaternius" | "manual";

export type FallbackShape = "box" | "cylinder" | "cone" | "sphere" | "octahedron" | "capsule";

export type Fallback = {
  shape: FallbackShape;
  color: string;
  /** [ancho, alto, fondo] en metros */
  size: [number, number, number];
  /** Color del techo (solo "box"): dibuja una pirámide y una puerta al frente (+z) */
  roof?: string;
  /** Color del tronco (solo "cone"): dibuja un tronco debajo */
  trunk?: string;
};

export type AssetEntry = {
  id: string;
  /** Ruta relativa a /public, ej: "models/tree.glb" */
  file: string;
  /** Prompt para regenerarlo en Meshy */
  prompt: string;
  source: AssetSource;
  license: string;
  fallback: Fallback;
  scale?: number;
  /** Tope de peso en KB (por defecto 1500). check-assets falla si se pasa. */
  maxKB?: number;
  notes?: string;
};

function fileFor(id: string): string {
  return `models/${id}.glb`;
}

const staticAssets: AssetEntry[] = [
  {
    id: "player-female",
    file: fileFor("player-female"),
    prompt: `${STYLE_PREFIX}, cute adventurer character with a backpack, A-pose, full body, friendly look`,
    source: "meshy",
    license: MESHY_LICENSE,
    fallback: { shape: "capsule", color: "#ff7a59", size: [0.8, 1.7, 0.8] },
    maxKB: 2500,
    notes: "Rigueado con Meshy: el GLB trae esqueleto + animación de caminar.",
  },
  {
    id: "player-male",
    file: fileFor("player-male"),
    prompt: `${STYLE_PREFIX}, bald male character with a short beard, wearing blue jeans and a plain black t-shirt, arms held clearly away from the torso with visible gap at the hips, open relaxed hands not touching the body or pockets, clean A-pose for rigging, full body, friendly confident look`,
    source: "meshy",
    license: MESHY_LICENSE,
    fallback: { shape: "capsule", color: "#4a5568", size: [0.8, 1.7, 0.8] },
    maxKB: 2500,
    notes: "Rigueado con Meshy: el GLB trae esqueleto + animación de caminar.",
  },
  {
    id: "tree",
    file: fileFor("tree"),
    prompt: `${STYLE_PREFIX}, round stylized tree with a short trunk`,
    source: "kenney",
    license: CC0,
    fallback: { shape: "cone", color: "#4f9d5d", size: [1.6, 2.8, 1.6], trunk: "#7a5a3a" },
    maxKB: 400,
  },
  {
    id: "lamp",
    file: fileFor("lamp"),
    prompt: `${STYLE_PREFIX}, vintage street lamp post`,
    source: "kenney",
    license: CC0,
    fallback: { shape: "cylinder", color: "#3d405b", size: [0.25, 3, 0.25] },
    maxKB: 300,
  },
  {
    id: "mailbox",
    file: fileFor("mailbox"),
    prompt: `${STYLE_PREFIX}, big red mailbox on a post, friendly look`,
    source: "meshy",
    license: MESHY_LICENSE,
    fallback: { shape: "box", color: "#d62828", size: [0.9, 1.4, 0.7] },
    maxKB: 600,
  },
];

const skillAssets: AssetEntry[] = cv.skills.map((skill) => ({
  id: `skill-${skill.id}`,
  file: fileFor(`skill-${skill.id}`),
  prompt:
    skill.assetPrompt ??
    `${STYLE_PREFIX}, a magical floating crystal totem symbolizing ${skill.name}, ${
      skill.category === "tech" ? "futuristic tech vibe" : "warm friendly vibe"
    }`,
  source: "meshy",
  license: MESHY_LICENSE,
  fallback: {
    shape: skill.category === "tech" ? "octahedron" : "sphere",
    color: skillColor(skill),
    size: skill.category === "tech" ? [0.8, 1.2, 0.8] : [0.9, 0.9, 0.9],
  },
  maxKB: 800,
}));

/**
 * 5 moldes de edificio reutilizables (en vez de uno por trabajo). JobSite.tsx elige
 * uno por índice (`index % 5`) y le aplica un tinte de color por código (ver
 * `jobColor` en world/theme.ts) — así la variedad crece con los trabajos sin generar
 * un GLB nuevo cada vez. Fachadas claras/neutras a propósito: el tinte multiplica el
 * color de la textura, así que arrancar de un color neutro es lo que deja ver bien el tinte.
 */
const BUILDING_FOOTPRINT = "footprint about 6.4 by 5.2 meters";
const buildingTypes: { id: string; prompt: string }[] = [
  {
    id: "building-modern",
    prompt: `${STYLE_PREFIX}, small modern office building with a flat roof and large front windows, light neutral concrete walls, door on the front facing +Z, ${BUILDING_FOOTPRINT}`,
  },
  {
    id: "building-cottage",
    prompt: `${STYLE_PREFIX}, cozy building with a pitched gable roof and a small chimney, light neutral walls, door on the front facing +Z, ${BUILDING_FOOTPRINT}`,
  },
  {
    id: "building-tower",
    prompt: `${STYLE_PREFIX}, narrow building with a flat roof and a row of small square windows stacked vertically, light neutral walls, door on the front facing +Z, ${BUILDING_FOOTPRINT}`,
  },
  {
    id: "building-dome",
    prompt: `${STYLE_PREFIX}, quirky building with a rounded dome roof and a round window above the door, light neutral walls, door on the front facing +Z, ${BUILDING_FOOTPRINT}`,
  },
  {
    id: "building-workshop",
    prompt: `${STYLE_PREFIX}, rustic workshop building with a sloped shed roof and a wooden awning over the door, light neutral walls, door on the front facing +Z, ${BUILDING_FOOTPRINT}`,
  },
];

const buildingAssets: AssetEntry[] = buildingTypes.map((t) => ({
  id: t.id,
  file: fileFor(t.id),
  prompt: t.prompt,
  source: "meshy",
  license: MESHY_LICENSE,
  fallback: { shape: "box", color: "#e3ddcd", size: [6.4, 4, 5.2], roof: "#5c4b51" },
  maxKB: 2500,
  notes: "El frente (puerta) debe mirar hacia +Z. El color final lo pone el tint por código, no el manifest.",
}));

export const buildingTypeIds: string[] = buildingTypes.map((t) => t.id);

const npcAssets: AssetEntry[] = cv.jobs.map((job, index) => ({
  id: `npc-${job.id}`,
  file: fileFor(`npc-${job.id}`),
  prompt:
    job.npcPrompt ??
    `${STYLE_PREFIX}, friendly cartoon character, ${job.npc.role}, A-pose, full body`,
  source: "meshy",
  license: MESHY_LICENSE,
  fallback: { shape: "capsule", color: jobColor(job, index), size: [0.8, 1.7, 0.8] },
  maxKB: 2500,
}));

export const allAssets: AssetEntry[] = [...staticAssets, ...skillAssets, ...buildingAssets, ...npcAssets];

export const manifest: Record<string, AssetEntry> = Object.fromEntries(allAssets.map((a) => [a.id, a]));

export function getAsset(id: string): AssetEntry {
  const entry = manifest[id];
  if (!entry) {
    throw new Error(`Asset "${id}" no está en assets/manifest.ts`);
  }
  return entry;
}
