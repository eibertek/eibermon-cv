import assert from "node:assert/strict";
import { test } from "node:test";
import { useGame } from "../game/store";
import { interactableById } from "../world/layout";

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
    locale: "en",
    score: 0,
    bestTimeSeconds: null,
    runStartedAt: null,
    seenBadges: [],
    badgeQueue: [],
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
  useGame.getState().setNearby("job:happyfuncorp");
  useGame.getState().interact();
  const state = useGame.getState();
  assert.equal(state.dialogId, "job:happyfuncorp");
  assert.equal(state.discovered.includes("job:happyfuncorp"), true);
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

test("start() sets runStartedAt, and calling it again doesn't reset the clock", () => {
  resetStore();
  useGame.getState().start();
  const first = useGame.getState().runStartedAt;
  assert.notEqual(first, null);
  useGame.getState().start();
  assert.equal(useGame.getState().runStartedAt, first);
});

test("addScore() accumulates points", () => {
  resetStore();
  useGame.getState().addScore(50);
  useGame.getState().addScore(20);
  assert.equal(useGame.getState().score, 70);
});

test("discovering everything awards a time bonus, records the best time, and closes the run", () => {
  resetStore();
  const allIds = [...interactableById.keys()];
  const [last, ...rest] = allIds;
  useGame.setState({
    discovered: rest,
    runStartedAt: Date.now() - 5000, // arrancó hace 5s
    score: 0,
    bestTimeSeconds: null,
  });

  useGame.getState().catchSkill(last);

  const state = useGame.getState();
  assert.equal(state.discovered.length, allIds.length);
  assert.equal(state.runStartedAt, null);
  assert.ok(state.score >= 990 && state.score <= 1000, `expected ~995, got ${state.score}`);
  assert.ok(state.bestTimeSeconds !== null && state.bestTimeSeconds >= 5 && state.bestTimeSeconds < 6);
});

test("completing the run again (already closed) does not award a second bonus", () => {
  resetStore();
  const allIds = [...interactableById.keys()];
  useGame.setState({ discovered: allIds, runStartedAt: null, score: 123, bestTimeSeconds: 10 });

  useGame.getState().catchSkill(allIds[0]); // ya estaba descubierto, no-op de todos modos

  const state = useGame.getState();
  assert.equal(state.score, 123);
  assert.equal(state.bestTimeSeconds, 10);
});

test("resetProgress() clears discovered, score, badges, and the run clock, but keeps the best time", () => {
  resetStore();
  useGame.setState({
    discovered: ["skill:ts"],
    score: 500,
    bestTimeSeconds: 42,
    runStartedAt: Date.now(),
    seenBadges: ["eibermon"],
    badgeQueue: ["eibermon"],
  });
  useGame.getState().resetProgress();
  const state = useGame.getState();
  assert.deepEqual(state.discovered, []);
  assert.equal(state.score, 0);
  assert.equal(state.runStartedAt, null);
  assert.equal(state.bestTimeSeconds, 42);
  assert.deepEqual(state.seenBadges, []);
  assert.deepEqual(state.badgeQueue, []);
});

test("catching the last skill queues the eibermon badge exactly once", () => {
  resetStore();
  const skillIds = [...interactableById.keys()].filter((id) => id.startsWith("skill:"));
  useGame.setState({ discovered: skillIds.slice(1) });

  useGame.getState().catchSkill(skillIds[0]);
  assert.deepEqual(useGame.getState().badgeQueue, ["eibermon"]);
  assert.deepEqual(useGame.getState().seenBadges, ["eibermon"]);

  // Ya atrapado: no debería volver a encolarse.
  useGame.getState().catchSkill(skillIds[0]);
  assert.deepEqual(useGame.getState().badgeQueue, ["eibermon"]);
});

test("interact() on the last remaining interactable can queue several badges at once", () => {
  resetStore();
  const allIds = [...interactableById.keys()];
  // El archivo (no una skill): interact() lo descubre al toque, a diferencia de una skill.
  const last = "archive";
  const rest = allIds.filter((id) => id !== last);
  useGame.setState({ discovered: rest });
  useGame.getState().setNearby(last);

  useGame.getState().interact();

  const state = useGame.getState();
  assert.ok(state.badgeQueue.includes("completionist"));
  assert.deepEqual(state.badgeQueue, state.seenBadges);
});

test("dismissBadge() pops the front of the queue", () => {
  resetStore();
  useGame.setState({ badgeQueue: ["eibermon", "experience"] });
  useGame.getState().dismissBadge();
  assert.deepEqual(useGame.getState().badgeQueue, ["experience"]);
});
