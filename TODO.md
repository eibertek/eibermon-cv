# Estado del proyecto (traspaso a Claude Code local)

Proyecto: CV jugable en 3D (Next.js + TypeScript + React Three Fiber, cámara isométrica).
**Nada de esto fue instalado, compilado ni probado todavía.** Se escribió sin poder correr `npm install`.

## Ya escrito
- Config: `package.json` (dependencias con versiones estimadas, ajustalas si hace falta), `tsconfig.json`, `next.config.mjs`, `.gitignore`
- Contenido: `data/cv.ts` (datos de EJEMPLO, reemplazar por los reales)
- Mundo: `world/layout.ts` (genera el mapa desde `data/cv.ts`), `world/collision.ts`, `world/theme.ts`
- Assets: `assets/manifest.ts` (prompts de Meshy + forma de reemplazo si falta el GLB), `assets/available.ts`, `assets/available.generated.json`
- Juego: `game/` (store con zustand, input, teclado, estado del jugador, math)
- Escena 3D: `components/three/*` (Asset con fallback, cámara isométrica, jugador, skills, trabajos/NPCs, buzón, escena)
- UI: `components/Game.tsx`, `GameLoader.tsx`, `StartScreen.tsx`, `ClassicOverlay.tsx`, `CVContent.tsx`

## Falta escribir
1. `components/HUD.tsx`: tarjeta con nombre y progreso, botones (rotar cámara, "Ir a…" con `requestTeleport` a `world.districts[].spawn`, "CV clásico"), botón de interactuar cuando hay `nearbyId`, y el `<Minimap />`.
2. `components/Minimap.tsx`: SVG con `viewBox` de `world.bounds`, distritos, interactuables (verde si descubierto) y punto del jugador actualizado con `requestAnimationFrame` leyendo `playerState`.
3. `components/Dialog.tsx`: modal según `interactableById.get(dialogId).kind` (`skill` / `job` / `contact`) con los datos de `data/cv.ts`. Cierra con `closeDialog`.
4. `components/Joystick.tsx`: joystick táctil (solo `pointer: coarse`) que escribe `input.joyX` / `input.joyY` (arriba = +joyY).
5. `app/layout.tsx`, `app/page.tsx` (renderiza `GameLoader`), `app/globals.css`, `app/cv/page.tsx` (ruta `/cv` con `CVContent`).
   Clases CSS usadas hasta ahora: `game`, `boot`, `label`, `label--district`, `label--building`, `start*`, `overlay*`, `btn`, `btn--primary`, `link`, `cv*`, `desktop-only`, `touch-only`.
6. `scripts/check-assets.ts`: valida `data/cv.ts` (ids duplicados, skills inexistentes en trabajos) y el manifest, avisa de GLBs faltantes (error con `--strict`), falla si un GLB pesa más que `maxKB`, y escribe `assets/available.generated.json` con los `.glb` que existen en `public/models`.
7. `scripts/export-prompts.ts`: genera `assets/PROMPTS.md` con los prompts pendientes de Meshy.
8. `scripts/optimize-models.mjs`: toma `models-src/*.glb` y los optimiza a `public/models/` con `gltf-transform` (Meshopt, no Draco: el juego carga con `useGLTF(url, false)`).
9. `README.md`.

## Después
- `npm install`, `npm run typecheck`, `npm run dev` y arreglar lo que aparezca.
- Reemplazar los datos de ejemplo y generar los modelos en Meshy (los nombres de archivo salen del manifest: `models/<id>.glb`).
