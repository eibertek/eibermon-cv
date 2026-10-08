# Eibermon: batallas para descubrir skills — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static "walk up, press Interactuar, read a text modal" flow for skills with a Pokémon-style (but trademark-free: **Eibermon** / **Eiberball**) catch mini-game, while leaving jobs and the contact mailbox untouched.

**Architecture:** Pure game logic (`game/store.ts`, `game/battle.ts`, `world/layout.ts`) is unit-tested with Node's built-in test runner. The 3D wandering creature and the 2D battle overlay are verified by hand in the dev server, the same way every other visual feature in this project has been verified — there is no practical way to unit-test React Three Fiber rendering or CSS without heavy mocking that would not catch real regressions.

**Tech Stack:** Next.js (App Router) · React Three Fiber / drei · zustand · Node's built-in `node:test` + `node:assert/strict` runner (via the `tsx` loader, already a devDependency — no new package added).

**Spec:** `docs/superpowers/specs/2026-10-08-eibermon-skill-battles-design.md`

## Global Constraints

- UI copy must say **Eibermon** / **Eiberball** — never "Pokémon" / "Pokébola" (explicit requirement from the user; trademark-sensitive).
- Capture always succeeds. No RNG, no fail state, no retries — this is flavor, not a gate on seeing the CV content.
- Jobs and the contact mailbox are unaffected: `Dialog.tsx` keeps handling `kind !== "skill"` exactly as today.
- The project has no test framework installed and none of its ~30 existing components have tests — this plan does not change that convention for visual code. Only pure, DOM-free logic (store actions, world layout data, the battle reducer) gets `node:test` unit tests. Everything else (R3F components, CSS) is verified with `npm run typecheck` plus a manual walkthrough in `npm run dev`, exactly as every prior feature in this project was verified.
- Spanish UI copy, 2-space indent, no comments beyond the existing file's style (brief "why", never "what") — match the surrounding code exactly.
- This repo has no git history yet (`git init` was never run). Task 1 below creates it. There's a single active workspace and no team to isolate from, so this plan works directly in the project directory — no worktree.

## Review Focus

- **E/Space/Enter while a battle is open must not accidentally close it.** `game/useKeyboard.ts` already treats any interact-key press while `dialogId` is set as "close the dialog" (a shortcut built for the old text `Dialog`). Left unguarded, a player's muscle-memory tap of the same key that opened the fight would silently flee it. Task 6 excludes skill battles from that shortcut.
- **Re-interacting with an already-caught skill must still work cleanly** — no crash, and `discovered` must not grow a duplicate entry. Covered by Task 2's "does not duplicate" test plus a manual re-catch check in Task 6.
- **Clicking "Rayo" after energy is already 0, or "Eiberball" before the fight is won, must be inert** (no phase skip, no negative energy). Covered by Task 4's pure-reducer tests.
- **Fleeing (Huir / the close button / Escape) at any point before "caught" must never add the skill to `discovered`.** `catchSkill` is the only code path that discovers a skill; `closeDialog` never does. Covered by Task 2 plus a manual check in Task 6.
- **A skill's `level` (1–5) sets both the hits required and the energy bar's max** — a level-1 skill must be catchable in exactly one "Rayo" click, not zero or two. Covered by Task 4's reducer tests.

---

### Task 1: Initialize git

This project has never had version control. Before we start making incremental, committable changes, give it a baseline so every later task's commit is a real, revertible checkpoint.

**Files:**
- Create: `.git/` (via `git init`)

- [x] **Step 1: Initialize the repo**

Run: `git init`
Expected: `Initialized empty Git repository in /Users/marianoeiberman/projects/cv-city/.git/`

- [x] **Step 2: Confirm `.gitignore` excludes the right things**

Run: `git status --short | head -30`
Expected: no `node_modules/`, `.next/`, or `.env` lines in the output (they're already in `.gitignore`).

- [x] **Step 3: Stage and commit everything as the baseline**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Initial commit: CV jugable en 3D

Snapshot of the project as it stood before adding git: Next.js app,
game/world/assets code, generated Meshy models, and docs.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

Expected: a single commit succeeds; `git log --oneline` shows exactly one commit.

---

### Task 2: Store — `catchSkill` and a skill-aware `interact()`

**Files:**
- Modify: `game/store.ts`
- Test: `test/store.test.ts` (new)

**Interfaces:**
- Produces: `catchSkill(id: string): void` on `useGame`'s state — adds `id` to `discovered` if not already present. Task 6 calls this when a battle reaches the `"caught"` phase.
- Produces: `interact()` (existing function, behavior change) — no longer adds a `kind === "skill"` interactable to `discovered` when opening its dialog; still does for `"job"` and `"contact"`.

- [x] **Step 1: Write the failing tests**

Create `test/store.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { useGame } from "../game/store";

function resetStore() {
  useGame.setState({
    started: false,
    discovered: [],
    nearbyId: null,
    dialogId: null,
    classicOpen: false,
    camRot: 0,
    teleport: null,
    character: "female",
  });
}

test("interact() on a skill opens the dialog but does not discover it yet", () => {
  resetStore();
  useGame.getState().setNearby("skill:ts");
  useGame.getState().interact();
  const state = useGame.getState();
  assert.equal(state.dialogId, "skill:ts");
  assert.equal(state.discovered.includes("skill:ts"), false);
});

test("interact() on a job discovers it immediately", () => {
  resetStore();
  useGame.getState().setNearby("job:estudio-pixel");
  useGame.getState().interact();
  const state = useGame.getState();
  assert.equal(state.dialogId, "job:estudio-pixel");
  assert.equal(state.discovered.includes("job:estudio-pixel"), true);
});

test("catchSkill() discovers a skill", () => {
  resetStore();
  useGame.getState().catchSkill("skill:ts");
  assert.equal(useGame.getState().discovered.includes("skill:ts"), true);
});

test("catchSkill() does not add a duplicate when caught twice", () => {
  resetStore();
  useGame.getState().catchSkill("skill:ts");
  useGame.getState().catchSkill("skill:ts");
  const count = useGame.getState().discovered.filter((id) => id === "skill:ts").length;
  assert.equal(count, 1);
});
```

- [x] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test test/store.test.ts`
Expected: FAIL — `catchSkill` is not a function (it doesn't exist on the store yet), and the "does not discover it yet" test fails because `interact()` currently discovers every kind unconditionally.

- [x] **Step 3: Implement the change**

In `game/store.ts`, add `catchSkill` to the `GameState` type (near `resetProgress`):

```ts
  resetProgress: () => void;
  setCharacter: (character: Character) => void;
  catchSkill: (id: string) => void;
```

Replace the `interact` implementation:

```ts
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
```

Add `catchSkill` next to `resetProgress` in the store body:

```ts
      catchSkill: (id) =>
        set((s) => ({
          discovered: s.discovered.includes(id) ? s.discovered : [...s.discovered, id],
        })),
```

- [x] **Step 4: Run the tests to verify they pass**

Run: `node --import tsx --test test/store.test.ts`
Expected: PASS — `# pass 4`, `# fail 0`.

- [x] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 6: Commit**

```bash
git add game/store.ts test/store.test.ts
git commit -m "$(cat <<'EOF'
feat: discover skills on catch, not on opening the battle

Adds catchSkill() and makes interact() skip discovering skill
interactables immediately — BattleModal (added later) will call
catchSkill() once a fight is actually won.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Remove the skill collision obstacle

**Files:**
- Modify: `world/layout.ts`
- Test: `test/layout.test.ts` (new)

**Interfaces:**
- Consumes: nothing new.
- Produces: `world.obstacles` no longer contains a circle obstacle at any skill's position — skills are purely proximity-triggered now that they wander (Task 5), not physical obstacles.

- [x] **Step 1: Write the failing test**

Create `test/layout.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { world } from "../world/layout";

test("skills are not collision obstacles", () => {
  for (const skill of world.skills) {
    const hit = world.obstacles.some(
      (o) => o.kind === "circle" && o.x === skill.pos[0] && o.z === skill.pos[1],
    );
    assert.equal(hit, false, `skill ${skill.interactId} should not be a collision obstacle`);
  }
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `node --import tsx --test test/layout.test.ts`
Expected: FAIL — every skill currently has a matching circle obstacle.

- [x] **Step 3: Remove the obstacle**

In `world/layout.ts`, inside `buildWorld()`, find the `obstacles` array:

```ts
  const obstacles: Obstacle[] = [
    ...skillSpots.map<Obstacle>((s) => ({ kind: "circle", x: s.pos[0], z: s.pos[1], r: 0.75 })),
    ...jobSpots.map<Obstacle>((j) => ({
```

Delete the `...skillSpots.map...` line so it reads:

```ts
  const obstacles: Obstacle[] = [
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
```

- [x] **Step 4: Run the test to verify it passes**

Run: `node --import tsx --test test/layout.test.ts`
Expected: PASS — `# pass 1`, `# fail 0`.

- [x] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 6: Commit**

```bash
git add world/layout.ts test/layout.test.ts
git commit -m "$(cat <<'EOF'
fix: stop skills from blocking player movement

Skills are about to wander (next task) and are already
proximity-triggered, not something you physically bump into — a
static collision circle at their spawn point no longer makes sense.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `game/battle.ts` — pure battle state machine

**Files:**
- Create: `game/battle.ts`
- Test: `test/battle.test.ts` (new)

**Interfaces:**
- Produces: `type BattlePhase = "intro" | "fighting" | "catching" | "caught"`
- Produces: `type BattleState = { phase: BattlePhase; energy: number; maxEnergy: number }`
- Produces: `createBattleState(level: 1 | 2 | 3 | 4 | 5): BattleState`
- Produces: `beginFight(state: BattleState): BattleState` — `"intro"` → `"fighting"`.
- Produces: `throwRay(state: BattleState): BattleState` — in `"fighting"`, lowers `energy` by 1; moves to `"catching"` once `energy` hits 0; no-op outside `"fighting"` or once `energy` is already 0.
- Produces: `throwBall(state: BattleState): BattleState` — `"catching"` → `"caught"`; no-op otherwise.
- Consumed by: Task 6 (`BattleModal.tsx`).

- [x] **Step 1: Write the failing tests**

Create `test/battle.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { beginFight, createBattleState, throwBall, throwRay } from "../game/battle";

test("createBattleState starts in intro with energy equal to the skill level", () => {
  const state = createBattleState(3);
  assert.equal(state.phase, "intro");
  assert.equal(state.energy, 3);
  assert.equal(state.maxEnergy, 3);
});

test("beginFight moves from intro to fighting", () => {
  const state = beginFight(createBattleState(2));
  assert.equal(state.phase, "fighting");
});

test("throwRay lowers energy by 1 and stays in fighting while energy remains", () => {
  let state = beginFight(createBattleState(3));
  state = throwRay(state);
  assert.equal(state.energy, 2);
  assert.equal(state.phase, "fighting");
});

test("throwRay moves to catching exactly when energy reaches 0", () => {
  let state = beginFight(createBattleState(1));
  state = throwRay(state);
  assert.equal(state.energy, 0);
  assert.equal(state.phase, "catching");
});

test("throwRay is a no-op once energy is already 0", () => {
  let state = beginFight(createBattleState(1));
  state = throwRay(state);
  state = throwRay(state);
  assert.equal(state.energy, 0);
  assert.equal(state.phase, "catching");
});

test("throwBall only works from catching, and moves to caught", () => {
  let state = beginFight(createBattleState(1));
  const tooEarly = throwBall(state);
  assert.equal(tooEarly.phase, "fighting");
  state = throwRay(state); // now catching
  state = throwBall(state);
  assert.equal(state.phase, "caught");
});
```

- [x] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test test/battle.test.ts`
Expected: FAIL — `game/battle.ts` doesn't exist yet (module not found).

- [x] **Step 3: Implement**

Create `game/battle.ts`:

```ts
export type BattlePhase = "intro" | "fighting" | "catching" | "caught";

export type BattleState = {
  phase: BattlePhase;
  energy: number;
  maxEnergy: number;
};

/** El nivel de la skill (1-5) es tanto la energía inicial como los golpes necesarios. */
export function createBattleState(level: 1 | 2 | 3 | 4 | 5): BattleState {
  return { phase: "intro", energy: level, maxEnergy: level };
}

export function beginFight(state: BattleState): BattleState {
  if (state.phase !== "intro") return state;
  return { ...state, phase: "fighting" };
}

export function throwRay(state: BattleState): BattleState {
  if (state.phase !== "fighting" || state.energy <= 0) return state;
  const energy = state.energy - 1;
  return { ...state, energy, phase: energy <= 0 ? "catching" : "fighting" };
}

export function throwBall(state: BattleState): BattleState {
  if (state.phase !== "catching") return state;
  return { ...state, phase: "caught" };
}
```

- [x] **Step 4: Run the tests to verify they pass**

Run: `node --import tsx --test test/battle.test.ts`
Expected: PASS — `# pass 6`, `# fail 0`.

- [x] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 6: Commit**

```bash
git add game/battle.ts test/battle.test.ts
git commit -m "$(cat <<'EOF'
feat: add pure battle state machine for Eibermon fights

Keeps the phase/energy logic (intro -> fighting -> catching -> caught)
free of React and Three.js so it's trivially unit-testable; BattleModal
(next tasks) is just a thin view over this.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `SkillCreature` — wandering + freeze on capture

**Files:**
- Create: `components/three/SkillCreature.tsx`
- Delete: `components/three/SkillItem.tsx`
- Modify: `components/three/WorldScene.tsx`

**Interfaces:**
- Consumes: `SkillSpot` type and `world.skills` from `world/layout.ts` (unchanged); `discovered`/`nearbyId` from `useGame` (unchanged — `discovered` for a skill id now only flips true once Task 6's `BattleModal` calls `catchSkill`, but `SkillCreature` doesn't need to know that — it just reads the same boolean as before).
- Produces: default export `SkillCreature({ spot: SkillSpot })`, replacing `SkillItem` everywhere.

This task has no automated test (R3F `useFrame` needs a live Canvas/render loop that Node's test runner can't provide, and mocking Three.js well enough to make that meaningful isn't worth it for a hobby project). It's verified with `npm run typecheck` plus the manual walkthrough in Step 5 below — notably, the "freeze on capture" behavior is checked by calling the store action directly from the browser console, since `BattleModal` (which triggers it for real) doesn't exist until Task 6.

- [x] **Step 1: Create the new component**

Create `components/three/SkillCreature.tsx`:

```tsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useGame } from "../../game/store";
import type { SkillSpot } from "../../world/layout";
import { skillColor } from "../../world/theme";
import { Asset } from "./Asset";
import Label from "./Label";

const WANDER_RADIUS = 1.3;
const WANDER_SPEED = 0.6;
const PAUSE_MIN = 1.5;
const PAUSE_MAX = 3.5;

function pickWanderTarget(): { x: number; z: number } {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * WANDER_RADIUS;
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

/** Un Eibermon: deambula cerca de `spot.pos` hasta que lo atrapan (BattleModal + catchSkill). */
export default function SkillCreature({ spot }: { spot: SkillSpot }) {
  const { skill, pos, interactId } = spot;
  const floating = useRef<Group>(null);
  const discovered = useGame((s) => s.discovered.includes(interactId));
  const near = useGame((s) => s.nearbyId === interactId);
  const color = skillColor(skill);

  const offset = useRef({ x: 0, z: 0 });
  const wanderTarget = useRef(pickWanderTarget());
  const nextTargetAt = useRef(0);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    if (!discovered && t >= nextTargetAt.current) {
      wanderTarget.current = pickWanderTarget();
      nextTargetAt.current = t + PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN);
    }
    const target = discovered ? { x: 0, z: 0 } : wanderTarget.current;
    const lerp = Math.min(1, WANDER_SPEED * delta);
    offset.current.x += (target.x - offset.current.x) * lerp;
    offset.current.z += (target.z - offset.current.z) * lerp;

    const g = floating.current;
    if (g) {
      g.position.set(offset.current.x, 0.55 + Math.sin(t * 2 + pos[0] * 0.7) * 0.15, offset.current.z);
      g.rotation.y = t * 0.8;
      const s = near ? 1.18 : 1;
      g.scale.setScalar(g.scale.x + (s - g.scale.x) * 0.15);
    }
  });

  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.3, 14]} />
        <meshStandardMaterial color={discovered ? "#8fe3a2" : "#ece6d6"} flatShading />
      </mesh>

      {!discovered && (
        <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.04, 8, 36]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}

      <group ref={floating}>
        <Asset id={`skill-${skill.id}`} />
      </group>

      {near && <Label position={[0, 2.6, 0]}>{skill.name}</Label>}
    </group>
  );
}
```

- [x] **Step 2: Delete the old component**

Run: `rm components/three/SkillItem.tsx`

- [x] **Step 3: Update the import in `WorldScene.tsx`**

In `components/three/WorldScene.tsx`, change:

```ts
import SkillItem from "./SkillItem";
```

to:

```ts
import SkillCreature from "./SkillCreature";
```

And change:

```tsx
      {world.skills.map((s) => (
        <SkillItem key={s.interactId} spot={s} />
      ))}
```

to:

```tsx
      {world.skills.map((s) => (
        <SkillCreature key={s.interactId} spot={s} />
      ))}
```

- [x] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors (confirms the rename didn't leave a dangling import anywhere).

- [x] **Step 5: Manual verification**

Run: `npm run dev`, open `http://localhost:3000`, start the game.

1. Walk toward the Plaza / Barrio Tech. Confirm skill pedestals now have a small creature drifting gently around them (not perfectly still like before), pausing and moving again every couple seconds.
2. `BattleModal` (which would call `catchSkill` for real) doesn't exist until Task 6, so simulate a catch directly: temporarily add `window.useGame = useGame;` as the last line of `game/store.ts`, save, reload the page, open the browser devtools console, and run `window.useGame.getState().catchSkill("skill:ts")`.
   Confirm: the TypeScript skill's pedestal turns green and its ring disappears (existing behavior), and the creature **stops wandering** and settles back over the pedestal.
3. Remove the temporary `window.useGame = useGame;` line from `game/store.ts` again — it was only for this manual check, and must not ship.

- [x] **Step 6: Commit**

```bash
git add components/three/SkillCreature.tsx components/three/WorldScene.tsx
git rm components/three/SkillItem.tsx
git commit -m "$(cat <<'EOF'
feat: skills wander like little creatures (Eibermon)

Renames SkillItem to SkillCreature and gives it a gentle random walk
within ~1.3m of its spawn point, freezing once caught. Purely visual —
the interaction radius still uses the fixed spawn position.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `BattleModal` — wire the fight into the game

**Files:**
- Create: `components/BattleModal.tsx`
- Modify: `components/Dialog.tsx` (skip `kind === "skill"`)
- Modify: `components/Game.tsx` (mount `<BattleModal />`)
- Modify: `game/useKeyboard.ts` (don't let the interact-key shortcut close a battle)
- Modify: `app/globals.css` (new `.battle*` classes)

**Interfaces:**
- Consumes: `createBattleState`, `beginFight`, `throwRay`, `throwBall`, `BattleState` from `game/battle.ts` (Task 4).
- Consumes: `catchSkill(id: string): void`, `closeDialog(): void`, `dialogId: string | null` from `game/store.ts` (Task 2 + existing).
- Consumes: `interactableById` from `world/layout.ts`, `cv.skills` + `Skill`/`Category` types from `data/cv.ts`, `skillColor` from `world/theme.ts` (all existing, unchanged).
- Produces: default export `BattleModal` (no props) — mounted once in `Game.tsx`, same pattern as `Dialog`/`HUD`.

No automated test for this task either (2D UI driven by clicks, same reasoning as Task 5). Verified with `npm run typecheck` plus the manual walkthrough in Step 6.

- [x] **Step 1: Create `BattleModal.tsx`**

Create `components/BattleModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { cv, type Category, type Skill } from "../data/cv";
import { beginFight, createBattleState, throwBall, throwRay, type BattleState } from "../game/battle";
import { useGame } from "../game/store";
import { interactableById } from "../world/layout";
import { skillColor } from "../world/theme";

/** Modal de batalla: reemplaza a Dialog para las skills (kind === "skill"). */
export default function BattleModal() {
  const dialogId = useGame((s) => s.dialogId);
  if (!dialogId) return null;
  const interactable = interactableById.get(dialogId);
  if (!interactable || interactable.kind !== "skill") return null;
  const skill = cv.skills.find((s) => s.id === interactable.ref);
  if (!skill) return null;

  // key={dialogId}: cada encuentro arranca la fase de batalla de cero.
  return <BattleModalContent key={dialogId} dialogId={dialogId} skill={skill} />;
}

function BattleModalContent({ dialogId, skill }: { dialogId: string; skill: Skill }) {
  const closeDialog = useGame((s) => s.closeDialog);
  const catchSkill = useGame((s) => s.catchSkill);
  const [battle, setBattle] = useState<BattleState>(() => createBattleState(skill.level));

  const color = skillColor(skill);
  const energyPct = Math.round((battle.energy / battle.maxEnergy) * 100);

  function handleBall() {
    setBattle((b) => {
      const next = throwBall(b);
      if (next.phase === "caught") catchSkill(dialogId);
      return next;
    });
  }

  return (
    <div className="battle" role="dialog" aria-modal="true" aria-label={`Batalla contra ${skill.name}`}>
      <div className="battle__scene">
        <CreatureArt category={skill.category} color={color} shaking={battle.phase === "catching"} />
        {battle.phase !== "intro" && (
          <div className="battle__hpbar">
            <div className="battle__hpbar-fill" style={{ width: `${energyPct}%` }} />
          </div>
        )}
      </div>

      <div className="battle__box">
        {battle.phase === "intro" && (
          <>
            <p className="battle__text">¡Un Eibermon salvaje apareció! Es {skill.name}.</p>
            <div className="battle__actions">
              <button className="btn btn--primary" onClick={() => setBattle((b) => beginFight(b))}>
                ¡Empezar!
              </button>
              <button className="btn" onClick={closeDialog}>
                Huir
              </button>
            </div>
          </>
        )}

        {battle.phase === "fighting" && (
          <>
            <p className="battle__text">{skill.name} se resiste. ¡Atacalo con un rayo!</p>
            <div className="battle__actions">
              <button className="btn btn--primary" onClick={() => setBattle((b) => throwRay(b))}>
                Rayo
              </button>
              <button className="btn" onClick={closeDialog}>
                Huir
              </button>
            </div>
          </>
        )}

        {battle.phase === "catching" && (
          <>
            <p className="battle__text">¡{skill.name} está débil! Es el momento de atraparlo.</p>
            <div className="battle__actions">
              <button className="btn btn--primary" onClick={handleBall}>
                ¡Eiberball!
              </button>
              <button className="btn" onClick={closeDialog}>
                Huir
              </button>
            </div>
          </>
        )}

        {battle.phase === "caught" && (
          <>
            <p className="battle__text">¡Atrapado! Sumaste a {skill.name} a tu Eibermon.</p>
            <p className="dialog__eyebrow">
              {skill.category === "tech" ? "Tecnología" : "Habilidad blanda"} · {skill.area}
            </p>
            <div className="battle__level" aria-label={`Nivel ${skill.level} de 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= skill.level ? "dialog__pip dialog__pip--on" : "dialog__pip"} />
              ))}
              {skill.years !== undefined && <span className="dialog__years">{skill.years} años</span>}
            </div>
            <p className="battle__description">{skill.description}</p>
            <button className="btn btn--primary" onClick={closeDialog}>
              Seguir caminando
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CreatureArt({ category, color, shaking }: { category: Category; color: string; shaking: boolean }) {
  return (
    <div className={shaking ? "battle__creature battle__creature--shake" : "battle__creature"}>
      {category === "tech" ? (
        <svg viewBox="0 0 100 100" className="battle__creature-svg" aria-hidden="true">
          <polygon points="50,6 90,35 76,90 24,90 10,35" fill={color} />
          <polygon points="50,6 90,35 50,52 10,35" fill="#ffffff" opacity="0.25" />
        </svg>
      ) : (
        <svg viewBox="0 0 100 100" className="battle__creature-svg" aria-hidden="true">
          <circle cx="50" cy="55" r="40" fill={color} />
          <circle cx="36" cy="45" r="10" fill="#ffffff" opacity="0.3" />
        </svg>
      )}
    </div>
  );
}
```

- [x] **Step 2: Make `Dialog` skip skills**

In `components/Dialog.tsx`, right after the existing `if (!interactable) return null;` line, add:

```tsx
  if (interactable.kind === "skill") return null;
```

- [x] **Step 3: Mount `BattleModal` in `Game.tsx`**

In `components/Game.tsx`, add the import next to the other component imports:

```tsx
import BattleModal from "./BattleModal";
```

And render it next to `<Dialog />`:

```tsx
      <Dialog />
      <BattleModal />
```

- [x] **Step 4: Stop the interact key from fleeing a battle**

In `game/useKeyboard.ts`, add the import:

```ts
import { interactableById } from "../world/layout";
```

Replace this block:

```ts
      if (s.dialogId) {
        if (isInteractKey(e.code)) {
          e.preventDefault();
          s.closeDialog();
        }
        return;
      }
```

with:

```ts
      if (s.dialogId) {
        if (isInteractKey(e.code) && interactableById.get(s.dialogId)?.kind !== "skill") {
          e.preventDefault();
          s.closeDialog();
        }
        return;
      }
```

- [x] **Step 5: Add the battle styles**

In `app/globals.css`, append at the end of the file:

```css
/* ───────────────────────── Batalla de Eibermon ───────────────────────── */

.battle {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #cfe8f3 0%, #cfe8f3 55%, #e3ddcd 55%, #e3ddcd 100%);
}

.battle__scene {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.battle__creature {
  width: min(40vw, 220px);
  height: min(40vw, 220px);
  animation: battle-float 2.4s ease-in-out infinite;
}

.battle__creature--shake {
  animation: battle-shake 0.4s ease-in-out infinite;
}

.battle__creature-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 14px rgba(43, 42, 38, 0.25));
}

@keyframes battle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes battle-shake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-6px) rotate(-4deg); }
  75% { transform: translateX(6px) rotate(4deg); }
}

.battle__hpbar {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  width: min(50vw, 220px);
  height: 0.9rem;
  background: rgba(253, 251, 244, 0.85);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.battle__hpbar-fill {
  height: 100%;
  background: #4caf63;
  transition: width 0.25s ease;
}

.battle__box {
  background: var(--paper);
  border-top: 3px solid var(--line);
  padding: 1.4rem 1.6rem 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.7em;
  max-width: 30rem;
  margin: 0 auto;
  width: 100%;
  border-radius: var(--radius) var(--radius) 0 0;
  box-shadow: var(--shadow);
}

.battle__text {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.4;
}

.battle__actions {
  display: flex;
  gap: 0.6em;
  flex-wrap: wrap;
}

.battle__level {
  display: flex;
  align-items: center;
  gap: 0.3em;
}

.battle__description {
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}
```

- [x] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [x] **Step 7: Manual verification**

Run: `npm run dev`, open `http://localhost:3000`, start the game.

1. Walk to any skill. Confirm the HUD's "Interactuar" button appears, same as before.
2. Press it. Confirm `BattleModal` opens (not the old text dialog): "¡Un Eibermon salvaje apareció! Es `<skill name>`." with **¡Empezar!** and **Huir** buttons.
3. Click **Huir**. Confirm the modal closes, the pedestal is still the "undiscovered" color (ring still visible), and the minimap dot for that skill is still the "not found" color.
4. Interact with the same skill again. Click **¡Empezar!**. Confirm it switches to the fighting screen with a **Rayo** button and an energy bar at 100%.
5. Click **Rayo** repeatedly. Confirm the bar drops one notch per click, and after exactly `skill.level` clicks (check the skill's `level` in `data/cv.ts`) the **Eiberball** button appears in place of Rayo.
6. Click **Eiberball**. Confirm the "¡Atrapado!" screen shows the correct category/area, the right number of filled level pips, years (if the skill has them), and the full description.
7. Click **Seguir caminando**. Confirm the modal closes, the pedestal is now green with no ring, the minimap dot is green, and the HUD's discovered count went up by one.
8. Interact with that same, now-caught skill once more. Confirm it reopens the battle from "intro" cleanly (no crash) and that catching it again doesn't create a second entry for it in the HUD's discovered count (it should stay the same number as after step 7).
9. Press **E** while a battle is open (open a different, not-yet-caught skill) — confirm it does **not** close the battle (this is the Review Focus fix from Task 6 Step 4). Pressing **Escape** should still close it.
10. Confirm a job (e.g. walk to an NPC) still opens the old text `Dialog`, unaffected.

- [x] **Step 8: Commit**

```bash
git add components/BattleModal.tsx components/Dialog.tsx components/Game.tsx game/useKeyboard.ts app/globals.css
git commit -m "$(cat <<'EOF'
feat: Eibermon battle screen for catching skills

Walking up to a skill and interacting now opens a Game Boy-style
battle (Rayo to wear it down, Eiberball to catch it) instead of a
plain text dialog. Catching is always guaranteed — this is a fun
reveal of the skill's info, not a gate. Jobs and the contact mailbox
are untouched.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
