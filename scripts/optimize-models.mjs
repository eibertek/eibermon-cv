#!/usr/bin/env node
/**
 * Toma los GLBs crudos de Meshy (models-src/*.glb) y los optimiza a public/models/
 * con gltf-transform, comprimiendo geometría con Meshopt (no Draco: el juego carga
 * los modelos con `useGLTF(url, false)`, sin decoder de Draco).
 *
 * Uso: node scripts/optimize-models.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "models-src");
const outDir = path.join(root, "public", "models");

if (!existsSync(srcDir)) {
  console.log("No existe models-src/: nada para optimizar.");
  process.exit(0);
}

const files = readdirSync(srcDir).filter((f) => f.endsWith(".glb"));
if (files.length === 0) {
  console.log("models-src/ no tiene archivos .glb.");
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

const bin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "gltf-transform.cmd" : "gltf-transform");
if (!existsSync(bin)) {
  console.error('No se encontró gltf-transform. Corré "npm install" primero (es devDependency).');
  process.exit(1);
}

// La simplificación de malla (decimación) de gltf-transform no es confiable para estos
// modelos: ya rompió el skinning de los personajes animados (el player salió deformado),
// y en los edificios (mesh estática, sin animación) le abrió agujeros triangulares en las
// fachadas de vidrio/detalladas, con un look "post-apocalíptico" en vez de prolijo. El
// tamaño final no depende de ella — lo que pesa acá es la textura, no el conteo de
// vértices — así que la sacamos siempre, no solo para los modelos animados.
for (const file of files) {
  const input = path.join(srcDir, file);
  const output = path.join(outDir, file);

  console.log(`Optimizando ${file}...`);
  execFileSync(bin, ["optimize", input, output, "--compress", "meshopt", "--simplify", "false"], {
    stdio: "inherit",
  });
}

console.log(`Listo: ${files.length} modelo(s) optimizados en public/models/.`);
