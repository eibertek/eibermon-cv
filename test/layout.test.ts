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
