# CV City

CV jugable en 3D: un personaje camina por una ciudad isométrica donde cada distrito,
edificio y NPC representa una parte del currículum (skills, trabajos, contacto).
Hecho con Next.js, TypeScript, React Three Fiber y zustand.

## Empezar

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`. También existe `/cv`, la versión clásica (texto) del CV.

## Cómo funciona

Todo el contenido sale de **una sola fuente de verdad**: [`data/cv.ts`](data/cv.ts).
A partir de ahí:

- [`world/layout.ts`](world/layout.ts) genera el mapa (distritos, posiciones de skills,
  edificios y NPCs de cada trabajo, caminos, árboles, colisiones).
- [`assets/manifest.ts`](assets/manifest.ts) define, para cada objeto 3D, el prompt de
  Meshy para generarlo y una forma de reemplazo (`fallback`) que se dibuja si todavía
  no existe el modelo `.glb`.
- [`components/three/Asset.tsx`](components/three/Asset.tsx) dibuja el GLB si está en
  `/public/models`, o el reemplazo si no.

Para poner tu propio CV, editá `data/cv.ts` (perfil, skills y trabajos) — el mapa,
los diálogos y el CV clásico se actualizan solos.

## Scripts

| Comando                        | Qué hace                                                                 |
| ------------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`                   | Valida los assets y levanta el servidor de desarrollo.                   |
| `npm run build`                 | Valida los assets y compila para producción.                             |
| `npm run typecheck`             | Corre `tsc --noEmit`.                                                    |
| `npm run assets:check`          | Valida `data/cv.ts` y el manifest; regenera `assets/available.generated.json`. |
| `npm run assets:check:strict`   | Igual, pero falla si falta algún GLB (útil antes de un deploy).          |
| `npm run assets:prompts`        | Genera `assets/PROMPTS.md` con los prompts de Meshy pendientes.          |
| `npm run assets:optimize`       | Optimiza `models-src/*.glb` → `public/models/*.glb` con gltf-transform.  |

## Generar los modelos 3D con Meshy

El juego nunca llama a ninguna API en producción: los modelos son archivos `.glb`
estáticos en `public/models`. Mientras no existan, se dibuja la forma de reemplazo
definida en `assets/manifest.ts`, así que el juego funciona igual sin ningún modelo.

1. `npm run assets:prompts` para generar `assets/PROMPTS.md` con los prompts pendientes.
2. Generá cada modelo en [Meshy](https://www.meshy.ai/) con su prompt y descargalo.
3. Poné los GLB crudos en `models-src/<id>.glb` (carpeta ignorada por git: son pesados).
4. `npm run assets:optimize` para comprimirlos (Meshopt) a `public/models/<id>.glb`.
5. `npm run assets:check` para confirmar que todo está en orden.

## Controles

- **Escritorio**: `WASD` / flechas para caminar, `E` / `Espacio` para interactuar,
  `Q` / `R` para rotar la cámara.
- **Táctil**: joystick en la esquina inferior izquierda y botón "Interactuar" en el HUD.

## Stack

Next.js (App Router) · TypeScript · React Three Fiber / drei · three.js · zustand.
