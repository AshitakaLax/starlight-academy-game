import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import { CurriculumService } from "../src/systems/curriculum/curriculumService.js";
import { initialTierForPreference } from "../src/systems/curriculum/adaptiveDifficulty.js";

test("preference maps to initial tier", () => {
  assert.equal(initialTierForPreference("gentle"), "Developing");
  assert.equal(initialTierForPreference("standard"), "Core");
  assert.equal(initialTierForPreference("challenging"), "Stretch");
});

test("skill initializes per preference without placement test", () => {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  store.dispatch("settings/update", { startingDifficultyPreference: "gentle" });
  const cs = new CurriculumService(store);
  cs.registerSkill("math.x", { objective: "x" });
  assert.equal(cs.getTier("math.x"), "Developing");
});

test("existing skill tier preserved on re-register", () => {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const cs = new CurriculumService(store);
  cs.registerSkill("math.y", {});
  store.dispatch("skill/tier/set", { skillId: "math.y", tier: "Stretch" });
  // re-register should not overwrite
  cs.registerSkill("math.y", {});
  assert.equal(cs.getTier("math.y"), "Stretch");
});
