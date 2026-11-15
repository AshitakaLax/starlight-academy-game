import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import { CurriculumService } from "../src/systems/curriculum/curriculumService.js";
import { QuestionGenerator, seededRng } from "../src/systems/curriculum/questionGenerator.js";

class AddGen extends QuestionGenerator {
  constructor() { super({ skillId: "math.add", supportedTiers: ["Core", "Stretch"], objective: "add", type: "mc" }); }
  generate(seed, params) {
    const rng = seededRng(seed);
    const a = Math.floor(rng() * 10) + 1;
    const b = Math.floor(rng() * 10) + 1;
    const answer = a + b;
    const choices = [answer, answer + 1, answer - 1, answer + 2];
    return { prompt: `${a}+${b}`, choices, answer, hints: ["add"] };
  }
  validate(q) { return super.validate(q) && q.choices.includes(q.answer); }
}

test("seeded generation is deterministic", () => {
  const store = new Store(createDefaultState()); registerCoreActions(store);
  const cs = new CurriculumService(store);
  cs.registerSkill("math.add", { objective: "add" });
  cs.registerGenerator("math.add", new AddGen());
  const q1 = cs.generate("math.add", 42, {}, "Core");
  const q2 = cs.generate("math.add", 42, {}, "Core");
  assert.deepEqual(q1, q2);
});

test("evidence recording adjusts tier within bounds", () => {
  const store = new Store(createDefaultState()); registerCoreActions(store);
  const cs = new CurriculumService(store);
  cs.registerSkill("math.add", {});
  // 5 independent correct
  for (let i = 0; i < 5; i++) cs.recordAttempt("math.add", { correct: true, hintUsed: false, demonstrated: false });
  assert.equal(cs.getTier("math.add"), "Stretch");
});
