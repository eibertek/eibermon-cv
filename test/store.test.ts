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
    locale: "en",
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
