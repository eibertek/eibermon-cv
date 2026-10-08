/**
 * Valida data/cv.ts y el manifest de assets, y regenera assets/available.generated.json
 * con los .glb que existen en /public/models.
 *
 * Uso: tsx scripts/check-assets.ts [--strict]
 * --strict: los GLBs faltantes pasan de warning a error (se usa en CI / antes de generar en Meshy).
 */
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { allAssets } from "../assets/manifest";
import { cv } from "../data/cv";

const strict = process.argv.includes("--strict");
const root = process.cwd();
const modelsDir = path.join(root, "public", "models");

let hasError = false;
function warn(msg: string): void {
  console.warn(`⚠ ${msg}`);
}
function fail(msg: string): void {
  console.error(`✖ ${msg}`);
  hasError = true;
}

function validateCV(): void {
  const skillIds = new Set<string>();
  for (const skill of cv.skills) {
    if (skillIds.has(skill.id)) fail(`Skill duplicada en data/cv.ts: "${skill.id}"`);
    skillIds.add(skill.id);
  }

  const jobIds = new Set<string>();
  for (const job of cv.jobs) {
    if (jobIds.has(job.id)) fail(`Trabajo duplicado en data/cv.ts: "${job.id}"`);
    jobIds.add(job.id);

    for (const skillId of job.skills) {
      if (!skillIds.has(skillId)) {
        fail(`El trabajo "${job.id}" referencia la skill inexistente "${skillId}"`);
      }
    }
  }
}

function validateAssets(): string[] {
  const existingFiles = existsSync(modelsDir)
    ? readdirSync(modelsDir).filter((f) => f.endsWith(".glb"))
    : [];
  const existingSet = new Set(existingFiles.map((f) => `models/${f}`));

  for (const asset of allAssets) {
    if (!existingSet.has(asset.file)) {
      const msg = `Falta el GLB de "${asset.id}" (${asset.file}); el juego usa el reemplazo.`;
      if (strict) fail(msg);
      else warn(msg);
      continue;
    }

    const maxKB = asset.maxKB ?? 1500;
    const sizeKB = statSync(path.join(root, "public", asset.file)).size / 1024;
    if (sizeKB > maxKB) {
      fail(`"${asset.file}" pesa ${sizeKB.toFixed(0)}KB y supera el tope de ${maxKB}KB.`);
    }
  }

  return existingFiles.map((f) => `models/${f}`);
}

validateCV();
const available = validateAssets().sort();

writeFileSync(
  path.join(root, "assets", "available.generated.json"),
  `${JSON.stringify(available, null, 2)}\n`,
);

if (hasError) {
  console.error("\nassets:check falló.");
  process.exit(1);
} else {
  console.log(`assets:check OK (${available.length} modelo(s) encontrados en public/models).`);
}
