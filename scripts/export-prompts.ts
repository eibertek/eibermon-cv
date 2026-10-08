/**
 * Genera assets/PROMPTS.md con los prompts de Meshy que todavía no se generaron
 * (es decir, cuyo GLB no existe en /public/models).
 *
 * Uso: tsx scripts/export-prompts.ts
 */
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { allAssets } from "../assets/manifest";

const root = process.cwd();

function exists(file: string): boolean {
  return existsSync(path.join(root, "public", file));
}

const meshyAssets = allAssets.filter((a) => a.source === "meshy");
const pending = meshyAssets.filter((a) => !exists(a.file));

const lines: string[] = [
  "# Prompts pendientes para Meshy",
  "",
  `Generado por \`npm run assets:prompts\`. ${pending.length} de ${meshyAssets.length} modelo(s) de Meshy están pendientes.`,
  "",
];

if (pending.length === 0) {
  lines.push("No hay prompts pendientes: todos los modelos de Meshy ya existen en `public/models`.");
} else {
  for (const asset of pending) {
    lines.push(`## ${asset.id}`);
    lines.push("");
    lines.push(`- Archivo esperado: \`${asset.file}\``);
    lines.push(`- Licencia: ${asset.license}`);
    if (asset.notes) lines.push(`- Nota: ${asset.notes}`);
    lines.push("");
    lines.push("```");
    lines.push(asset.prompt);
    lines.push("```");
    lines.push("");
  }
}

writeFileSync(path.join(root, "assets", "PROMPTS.md"), `${lines.join("\n")}\n`);
console.log(`assets/PROMPTS.md generado (${pending.length} pendiente(s)).`);
