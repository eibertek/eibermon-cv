# Eibermon: batallas para descubrir skills

## Propósito

Hoy cada skill es un ítem flotante quieto; te acercás, apretás Interactuar y se
abre un modal de texto con la descripción. La idea es reemplazar esa
interacción (solo para skills, no para trabajos ni el buzón) por un mini-juego
estilo batalla de Pokémon, pero con nombre propio: **Eibermon** en vez de
Pokémon, **Eiberball** en vez de Pokébola. Las skills pasan de ser postes
estáticos a criaturas ("Eibermon") que deambulan cerca de su punto asignado;
al acercarte y atraparlas revelás la misma información que hoy (nombre, nivel,
descripción, años).

No es un desafío real: la captura **siempre se logra**. Es la forma divertida
de revelar el contenido del CV, no un filtro — nadie debería quedarse sin ver
una skill por "perder".

## Alcance

- Las 13 skills de `data/cv.ts` pasan a comportarse como Eibermon.
- Trabajos (NPCs) y el buzón de contacto **no cambian**: siguen abriendo
  `Dialog.tsx` como hoy.
- Sin sonido, sin captura fallida/reintentos, sin ilustraciones únicas por
  skill (dos arquetipos 2D reusados, teñidos por color).

## Flujo de encuentro

Igual que cualquier otro interactuable: te acercás, el HUD muestra el botón
"Interactuar" cuando `nearbyId` apunta a una skill, lo presionás. La
detección de cercanía (`Interactable.radius`, ya existe en
`world/layout.ts`) **no cambia** — sigue basada en el punto fijo que genera
el layout, no en la posición visual del Eibermon mientras deambula (ver
abajo). Al presionar Interactuar sobre una skill, en vez de abrir `Dialog` se
abre el nuevo `BattleModal`.

## Deambular (solo visual)

`components/three/SkillItem.tsx` se renombra a `SkillCreature.tsx`. Cada
instancia, en estado local (no en el store), cada 2–4s elige un punto al azar
a ~1.3m de su `pos` asignado y se desliza hacia ahí con un `lerp`, con pausas
intermedias — board look vivo sin tocar colisiones ni el sistema de
interacción. Al estar atrapada (ver estado más abajo) deja de moverse.

Como ya no es un obstáculo físico que haya que "rodear", se elimina el
obstáculo de colisión que hoy agrega `buildWorld()` en `world/layout.ts` para
cada skill (`{ kind: "circle", x, z, r: 0.75 }`). El pedestal/anillo visual
(ya existente) se mantiene igual.

## Estado y datos

`game/store.ts`: `discovered` sigue siendo la fuente de verdad de "ya lo vi",
pero el momento en que se marca cambia según el tipo:

- **Trabajos y buzón**: igual que hoy — se marca al abrir el diálogo
  (`interact()`).
- **Skills**: se marca recién al completar la captura (acción nueva
  `catchSkill(id)`), no al abrir la batalla.

Cambios concretos:

```ts
// interact(): ya no marca discovered automáticamente para skills
interact: () => {
  const { nearbyId, dialogId, discovered } = get();
  if (!nearbyId || dialogId || !interactableById.has(nearbyId)) return;
  const kind = interactableById.get(nearbyId)!.kind;
  set({
    dialogId: nearbyId,
    discovered:
      kind !== "skill" && !discovered.includes(nearbyId)
        ? [...discovered, nearbyId]
        : discovered,
  });
},

// nueva acción, la llama BattleModal al completar la captura
catchSkill: (id) =>
  set((s) => ({
    discovered: s.discovered.includes(id) ? s.discovered : [...s.discovered, id],
  })),
```

`closeDialog()` (ya existe) se reusa para "Huir"/cerrar sin atrapar: no toca
`discovered`, así que cancelar una batalla no pierde progreso — podés volver
después y el Eibermon sigue salvaje.

No hay cambios en `data/cv.ts`: la "dificultad" (cantidad de golpes de Rayo)
sale de `skill.level` (1–5), campo que ya existe.

## `BattleModal.tsx` (nuevo)

Se monta en `Game.tsx` junto a `Dialog`, cada uno se auto-filtra por el
`kind` del interactuable (`Dialog` ignora `kind === "skill"`, `BattleModal`
solo actúa si `kind === "skill"`). Usa `dialogId`/`closeDialog` del store
igual que `Dialog`. El estado de la batalla (fase) es **local** al
componente (`useState`), con `key={dialogId}` para que cada encuentro
arranque de cero sin estado global nuevo — el bloqueo de movimiento del
jugador ya funciona solo porque `Player.tsx` ya frena cuando hay
`dialogId` seteado, sea cual sea el modal que lo esté usando.

Fases (máquina de estados local):

1. **intro**: "¡Un Eibermon salvaje apareció!" con el nombre de la skill.
2. **fighting**: criatura con barra de energía arriba, botones **Rayo** /
   **Huir** abajo. Cada click en Rayo dispara una animación (CSS, un rayo que
   cruza la pantalla) y resta `1/skill.level` a la barra. Al llegar a 0,
   **Eiberball** reemplaza a Rayo.
3. **catching**: click en Eiberball dispara la animación de captura
   (throw + shake + destello), y pasa a `caught`.
4. **caught**: "¡Atrapado! Sumaste `<Skill>` a tu Eibermon." + la misma
   ficha que hoy muestra `Dialog` para skills (categoría/área, puntitos de
   nivel 1–5, años si los tiene, descripción). Acá se llama `catchSkill(id)`.
   Botón "Seguir caminando" (mismo texto que ya usa `Dialog`) cierra con
   `closeDialog()`.

**Huir** (visible en `intro` y `fighting`) y una X de cerrar (visible en
cualquier fase antes de `caught`) llaman `closeDialog()` sin tocar
`discovered`.

## Visual de la criatura

Ilustración 2D (SVG/CSS), no el modelo 3D (evita una segunda escena de
Three.js). Dos arquetipos reusables, elegidos por `skill.category`:

- **tech**: silueta tipo cristal/poliedro (ecos del fallback "octahedron"
  que ya usan las skills tech).
- **soft**: silueta tipo blob/orbe (ecos del fallback "sphere" de las soft
  skills).

Ambos teñidos con `skillColor(skill)` (ya existe en `world/theme.ts`) — mismo
patrón "forma × color" que ya se usó para los 5 tipos de edificio. Animación
simple de flote/pulso en CSS, igual de liviana que el resto de la UI 2D del
juego (no HTML dentro del canvas de Three.js: es un overlay normal, como
`Dialog`).

## Archivos que toca

- `components/three/SkillItem.tsx` → renombrado `SkillCreature.tsx` (deambular
  + congelarse si está atrapada).
- `components/three/WorldScene.tsx`: actualiza el import/uso tras el rename.
- `components/BattleModal.tsx`: nuevo.
- `components/Dialog.tsx`: ya no renderiza nada para `kind === "skill"` (lo
  toma `BattleModal`); sigue igual para `job`/`contact`.
- `components/Game.tsx`: monta `<BattleModal />`.
- `game/store.ts`: `catchSkill`, y `interact()` ajustado como arriba.
- `world/layout.ts`: saca el obstáculo de colisión de las skills.
- `app/globals.css`: clases nuevas para `BattleModal` (prefijo `.battle`) y
  las dos siluetas de criatura.

## No-goals (explícito)

- Sin probabilidad de fallo ni reintentos.
- Sin sonido.
- Sin ilustración única por skill (solo 2 arquetipos × color).
- Sin tocar el flujo de trabajos/buzón (`Dialog.tsx` sigue como está para
  esos casos).
- Sin mover el radio/punto de interacción: el deambular es puramente visual.
