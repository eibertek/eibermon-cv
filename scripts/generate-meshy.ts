/**
 * Genera modelos con la API de Meshy (text-to-3d: preview -> refine -> descarga el GLB)
 * para los ids que se pasen por línea de comandos, usando los prompts de assets/manifest.ts.
 * Los GLB crudos quedan en models-src/<id>.glb (correr después `npm run assets:optimize`).
 *
 * Uso: tsx scripts/generate-meshy.ts [--rig] <id> [<id> ...]
 * Ej:  tsx scripts/generate-meshy.ts skill-ts mailbox
 *      tsx scripts/generate-meshy.ts --rig player-male npc-nube-labs
 *
 * --rig: además de preview+refine, auto-riggea el resultado (personajes humanoides en A-pose)
 * y guarda la versión animada caminando (con skin) en vez de la malla estática.
 *
 * La API key sale de .env (clave "meshy_api_key") o de MESHY_API_KEY en el entorno.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { allAssets, type AssetEntry } from "../assets/manifest";

const root = process.cwd();

function loadApiKey(): string {
  if (process.env.MESHY_API_KEY) return process.env.MESHY_API_KEY;
  const envPath = path.join(root, ".env");
  let text = "";
  try {
    text = readFileSync(envPath, "utf8");
  } catch {
    throw new Error(".env no encontrado y MESHY_API_KEY no está en el entorno.");
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key.toLowerCase() === "meshy_api_key") {
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  throw new Error('No encontré "meshy_api_key" en .env.');
}

const API_KEY = loadApiKey();
const TEXT_TO_3D_BASE = "https://api.meshy.ai/openapi/v2/text-to-3d";
const RIGGING_BASE = "https://api.meshy.ai/openapi/v1/rigging";
const POLL_INTERVAL_MS = 6000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

type MeshyTask = {
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "CANCELED";
  progress?: number;
  model_urls?: { glb?: string };
  result?: {
    rigged_character_glb_url?: string;
    basic_animations?: { walking_glb_url?: string };
  };
  task_error?: unknown;
};

async function meshyFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Meshy API ${res.status} en ${url}: ${JSON.stringify(body)}`);
  }
  return body as T;
}

async function createPreviewTask(prompt: string): Promise<string> {
  const body = await meshyFetch<{ result: string }>(TEXT_TO_3D_BASE, {
    method: "POST",
    body: JSON.stringify({
      mode: "preview",
      prompt,
      ai_model: "latest",
      topology: "triangle",
      target_polycount: 10000,
      should_remesh: true,
      target_formats: ["glb"],
    }),
  });
  return body.result;
}

async function createRefineTask(previewTaskId: string): Promise<string> {
  const body = await meshyFetch<{ result: string }>(TEXT_TO_3D_BASE, {
    method: "POST",
    body: JSON.stringify({
      mode: "refine",
      preview_task_id: previewTaskId,
      enable_pbr: false,
      texture_resolution: "2k",
    }),
  });
  return body.result;
}

async function createRigTask(inputTaskId: string): Promise<string> {
  const body = await meshyFetch<{ result: string }>(RIGGING_BASE, {
    method: "POST",
    body: JSON.stringify({
      input_task_id: inputTaskId,
      height_meters: 1.7,
    }),
  });
  return body.result;
}

async function pollTask(base: string, taskId: string): Promise<MeshyTask> {
  const started = Date.now();
  for (;;) {
    const task = await meshyFetch<MeshyTask>(`${base}/${taskId}`);
    console.log(`  [${taskId}] ${task.status} (${task.progress ?? "?"}%)`);
    if (task.status === "SUCCEEDED") return task;
    if (task.status === "FAILED" || task.status === "CANCELED") {
      throw new Error(`Tarea ${taskId} terminó en estado ${task.status}: ${JSON.stringify(task.task_error ?? {})}`);
    }
    if (Date.now() - started > POLL_TIMEOUT_MS) {
      throw new Error(`Tarea ${taskId} no terminó en ${POLL_TIMEOUT_MS / 1000}s.`);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

async function downloadGlb(url: string, destPath: string): Promise<number> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No pude descargar el GLB (${res.status}) de ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buf);
  return buf.length;
}

async function generateOne(entry: AssetEntry, rig: boolean): Promise<void> {
  console.log(`\n== ${entry.id} ==`);
  console.log(`Prompt: ${entry.prompt}`);

  console.log("Creando preview...");
  const previewId = await createPreviewTask(entry.prompt);
  console.log(`Preview task: ${previewId}`);
  await pollTask(TEXT_TO_3D_BASE, previewId);

  console.log("Creando refine (textura)...");
  const refineId = await createRefineTask(previewId);
  console.log(`Refine task: ${refineId}`);
  const finished = await pollTask(TEXT_TO_3D_BASE, refineId);

  let glbUrl = finished.model_urls?.glb;

  if (rig) {
    console.log("Creando rig (esqueleto + animaciones)...");
    const rigId = await createRigTask(refineId);
    console.log(`Rig task: ${rigId}`);
    const rigged = await pollTask(RIGGING_BASE, rigId);
    const walkingUrl = rigged.result?.basic_animations?.walking_glb_url;
    if (!walkingUrl) throw new Error(`La tarea de rig ${rigId} no devolvió basic_animations.walking_glb_url`);
    glbUrl = walkingUrl;
  }

  if (!glbUrl) throw new Error(`No se obtuvo una URL de GLB para "${entry.id}"`);

  const outDir = path.join(root, "models-src");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${entry.id}.glb`);
  const bytes = await downloadGlb(glbUrl, outPath);
  console.log(`Guardado models-src/${entry.id}.glb (${(bytes / 1024).toFixed(0)}KB)`);
}

async function main() {
  const args = process.argv.slice(2);
  const rig = args.includes("--rig");
  const ids = args.filter((a) => a !== "--rig");

  if (ids.length === 0) {
    console.error("Uso: tsx scripts/generate-meshy.ts [--rig] <id> [<id> ...]");
    process.exit(1);
  }

  const byId = new Map(allAssets.map((a) => [a.id, a]));

  for (const id of ids) {
    const entry = byId.get(id);
    if (!entry) {
      console.error(`✖ Asset desconocido: "${id}" (no está en assets/manifest.ts)`);
      continue;
    }
    if (entry.source !== "meshy") {
      console.error(`✖ "${id}" tiene source "${entry.source}", no se genera con Meshy.`);
      continue;
    }
    try {
      await generateOne(entry, rig);
    } catch (err) {
      console.error(`✖ Falló "${id}": ${(err as Error).message}`);
    }
  }
}

main();
