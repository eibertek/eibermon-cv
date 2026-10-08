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
import { NodeIO } from "@gltf-transform/core";

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

const io = new NodeIO();

for (const file of files) {
  const input = path.join(srcDir, file);
  const output = path.join(outDir, file);

  // La simplificación de malla (decimación) no siempre respeta bien el peso de huesos
  // en meshes con skin: puede estirar vértices hacia la posición de otro joint durante
  // la animación. Para modelos animados, saltamos --simplify (igual el tamaño final no
  // cambia: en estos assets lo que más pesa es la textura, no el conteo de vértices).
  const doc = await io.read(input);
  const hasAnimations = doc.getRoot().listAnimations().length > 0;

  const args = ["optimize", input, output, "--compress", "meshopt"];
  if (hasAnimations) args.push("--simplify", "false");

  console.log(`Optimizando ${file}${hasAnimations ? " (animado: sin simplify)" : ""}...`);
  execFileSync(bin, args, { stdio: "inherit" });
}

console.log(`Listo: ${files.length} modelo(s) optimizados en public/models/.`);
