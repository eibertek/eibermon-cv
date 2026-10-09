import assert from "node:assert/strict";
import { test } from "node:test";
import { isBadgeEarned, newlyEarnedBadges } from "../game/badges";
import { interactableById } from "../world/layout";

const allIds = [...interactableById.keys()];
const skillIds = allIds.filter((id) => id.startsWith("skill:"));
const experienceIds = allIds.filter((id) => !id.startsWith("skill:"));

test("eibermon badge needs every skill caught, nothing else", () => {
  assert.equal(isBadgeEarned("eibermon", skillIds), true);
  assert.equal(isBadgeEarned("eibermon", skillIds.slice(1)), false);
  assert.equal(isBadgeEarned("eibermon", experienceIds), false);
});

test("experience badge needs every job + archive + mailbox visited, nothing else", () => {
  assert.equal(isBadgeEarned("experience", experienceIds), true);
  assert.equal(isBadgeEarned("experience", experienceIds.slice(1)), false);
  assert.equal(isBadgeEarned("experience", skillIds), false);
});

test("completionist badge needs literally everything", () => {
  assert.equal(isBadgeEarned("completionist", allIds), true);
  assert.equal(isBadgeEarned("completionist", allIds.slice(1)), false);
});

test("newlyEarnedBadges only returns badges that are earned AND not already seen", () => {
  assert.deepEqual(newlyEarnedBadges(skillIds, []), ["eibermon"]);
  assert.deepEqual(newlyEarnedBadges(skillIds, ["eibermon"]), []);
});

test("newlyEarnedBadges returns multiple badges at once, in BADGE_IDS order", () => {
  // Atrapar el último interactuable puede cerrar "experience" y "completionist" a la vez.
  assert.deepEqual(newlyEarnedBadges(allIds, []), ["eibermon", "experience", "completionist"]);
  assert.deepEqual(newlyEarnedBadges(allIds, ["eibermon"]), ["experience", "completionist"]);
});
