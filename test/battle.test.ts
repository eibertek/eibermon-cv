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
