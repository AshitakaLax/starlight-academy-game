import test from "node:test";
import assert from "node:assert/strict";
import { ColoringStudio } from "../src/gameplay/coloring/coloringStudio.js";

test("paint remains inside mask (validateTexture)", () => {
  const res = ColoringStudio.validateTexture("data:image/png;base64,AAAA");
  assert.equal(res.ok, true);
  assert.equal(ColoringStudio.validateTexture("not a data url").ok, false);
  assert.equal(ColoringStudio.validateTexture("data:image/png;base64," + "A".repeat(2_100_000)).ok, false);
});

test("reset requires confirmation", () => {
  const cs = new ColoringStudio(null);
  assert.equal(cs.reset(false).ok, false);
  assert.equal(cs.reset(true).ok, false); // no canvas
});
