import assert from "node:assert/strict";
import { test } from "node:test";
import { beginFight, createBattleState, throwBall, throwRay, timingTierAt } from "../game/battle";

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

test("timingTierAt is 'ok' right at the start of the cycle", () => {
  assert.equal(timingTierAt(0).tier, "ok");
});

test("timingTierAt is 'perfect' at the peak (middle of the 2s cycle)", () => {
  const { tier, points } = timingTierAt(1);
  assert.equal(tier, "perfect");
  assert.equal(points, 50);
});

test("timingTierAt is 'good' partway up the ramp", () => {
  assert.equal(timingTierAt(0.7).tier, "good");
});

test("timingTierAt wraps around for elapsed times beyond one cycle", () => {
  assert.equal(timingTierAt(2).tier, timingTierAt(0).tier);
  assert.equal(timingTierAt(3).tier, timingTierAt(1).tier);
});
