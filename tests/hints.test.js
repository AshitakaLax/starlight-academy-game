import test from "node:test";
import assert from "node:assert/strict";
import { createActivityDefinition, createActivityRegistry } from "../src/systems/curriculum/activityDefinitions.js";
import { createQuestionGeneratorRegistry } from "../src/systems/curriculum/questionGenerators.js";
import {
  createHintDefinition,
  createProfessorHootDemonstration,
  validateHintDefinition
} from "../src/systems/hints/hintDefinitions.js";
import { createHintRegistry } from "../src/systems/hints/createHintRegistry.js";
import { createHintService } from "../src/systems/hints/createHintService.js";

function multiplicationActivity() {
  return createActivityDefinition({
    id: "chapter-01.multiplication-practice",
    title: "Multiplication practice",
    skillIds: ["math.multiplication"],
    objectives: ["Solve multiplication facts using equal groups and known facts."],
    supportedTiers: ["foundation", "core", "stretch"],
    answerRules: { type: "numeric", tolerance: 0 },
    generatorId: "arithmetic.multiplication",
    generatorConstraints: {
      foundation: { factorMin: 1, factorMax: 5, multiplierMin: 1, multiplierMax: 5, choiceCount: 4 },
      core: { factorMin: 2, factorMax: 10, multiplierMin: 2, multiplierMax: 10, choiceCount: 4 },
      stretch: { factorMin: 6, factorMax: 12, multiplierMin: 6, multiplierMax: 12, choiceCount: 4 }
    }
  });
}

function multiplicationHints(overrides = {}) {
  const base = {
    activityId: "chapter-01.multiplication-practice",
    title: "Multiplication helper",
    skillIds: ["math.multiplication"],
    stages: [
      {
        attempt: 1,
        kind: "nudge",
        message: "Think about making equal groups."
      },
      {
        attempt: 2,
        kind: "strategy",
        message: "Use repeated addition to find the total.",
        narrationText: "You can add the same number once for each group."
      },
      {
        attempt: 3,
        kind: "demonstration",
        message: "Professor Hoot will work through an example with you.",
        demonstration: {
          title: "Build equal groups",
          introduction: "Let's solve four groups of three together.",
          steps: [
            {
              label: "Count the groups",
              explanation: "There are four groups.",
              visual: { kind: "array", content: "4 rows of dots", ariaLabel: "Four equal rows" }
            },
            {
              label: "Count each group",
              explanation: "Each group contains three dots, so add three four times.",
              visual: { kind: "equation", content: "3 + 3 + 3 + 3 = 12", ariaLabel: "Four threes make twelve" }
            }
          ],
          summary: "Four groups of three make twelve."
        }
      }
    ]
  };
  return { ...base, ...overrides };
}

function createHarness({ hints = [multiplicationHints()], narrationService = null, onHint = () => {} } = {}) {
  const activity = multiplicationActivity();
  const activityRegistry = createActivityRegistry([activity]);
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: hints });
  const questionGeneratorRegistry = createQuestionGeneratorRegistry();
  const service = createHintService({
    activityRegistry,
    hintRegistry,
    questionGeneratorRegistry,
    narrationService,
    onHint
  });
  const question = questionGeneratorRegistry.generate(activity, { seed: "hint-test-seed", tier: "core" });
  return { activity, activityRegistry, hintRegistry, questionGeneratorRegistry, service, question };
}

test("hint definitions validate and freeze activity-specific three-stage content", () => {
  const definition = createHintDefinition(multiplicationHints());
  assert.equal(definition.activityId, "chapter-01.multiplication-practice");
  assert.deepEqual(definition.stages.map((stage) => stage.kind), ["nudge", "strategy", "demonstration"]);
  assert.ok(Object.isFrozen(definition));
  assert.ok(Object.isFrozen(definition.stages[2].demonstration.steps[0].visual));
  assert.equal(validateHintDefinition(multiplicationHints()), true);
  assert.throws(() => { definition.stages[0].message = "Changed"; }, TypeError);
});

test("hint stages must have ordered attempt thresholds and an activity-specific worked example", () => {
  const tooEarly = multiplicationHints();
  tooEarly.stages[1].attempt = 1;
  assert.match(validateHintDefinition(tooEarly), /increasing positive integers/);

  const missingDemo = multiplicationHints();
  delete missingDemo.stages[2].demonstration;
  assert.match(validateHintDefinition(missingDemo), /demonstration needs a title|worked example|title, introduction/i);

  const unsupportedVisual = multiplicationHints();
  unsupportedVisual.stages[2].demonstration.steps[0].visual.kind = "animation";
  assert.match(validateHintDefinition(unsupportedVisual), /supported, accessible visual descriptor/);

  const extraField = multiplicationHints();
  extraField.debug = true;
  assert.match(validateHintDefinition(extraField), /contain only activityId/);
});

test("hint registry binds definitions to known activities and matching skill IDs", () => {
  const activity = multiplicationActivity();
  const activityRegistry = createActivityRegistry([activity]);
  const registry = createHintRegistry({ activityRegistry });
  const definition = registry.register(multiplicationHints());
  assert.equal(registry.get(activity.id), definition);
  assert.equal(registry.has(activity.id), true);
  assert.deepEqual(registry.list().map((item) => item.activityId), [activity.id]);
  assert.throws(() => registry.register(multiplicationHints()), /already registered/);
  assert.throws(() => registry.register({
    ...multiplicationHints(),
    activityId: "chapter-02.unknown-practice"
  }), /unknown activity/);
  assert.throws(() => registry.register({
    ...multiplicationHints(),
    skillIds: ["math.division"]
  }), /must match/);
});

test("first, second, and third incorrect attempts reveal nudge, strategy, and Professor Hoot", () => {
  const callbacks = [];
  const spoken = [];
  const harness = createHarness({
    onHint: (presentation) => callbacks.push(presentation),
    narrationService: { speak: (text) => { spoken.push(text); return false; } }
  });
  const first = harness.service.recordIncorrect(harness.question);
  const second = harness.service.recordIncorrect(harness.question);
  const third = harness.service.recordIncorrect(harness.question);

  assert.deepEqual([first.stage, second.stage, third.stage], [1, 2, 3]);
  assert.deepEqual([first.kind, second.kind, third.kind], ["nudge", "strategy", "demonstration"]);
  assert.equal(third.demonstration.character, "professor-hoot");
  assert.equal(third.demonstration.component, "professor-hoot-demonstration");
  assert.equal(third.demonstration.steps.length, 2);
  assert.match(third.visibleTextEquivalent, /Step 1/);
  assert.match(third.narrationText, /four groups of three/i);
  assert.equal(third.canRetry, true);
  assert.equal(third.canSolveParallelQuestion, true);
  assert.equal(third.canComplete, true);
  assert.equal(callbacks.length, 3);
  assert.equal(spoken.length, 3);
  assert.equal(harness.service.getSession(harness.question.id).incorrectAttempts, 3);
});

test("content authors can move later hint stages to configurable attempt thresholds", () => {
  const hints = multiplicationHints();
  hints.stages[1].attempt = 3;
  hints.stages[2].attempt = 4;
  const harness = createHarness({ hints: [hints] });
  const results = Array.from({ length: 4 }, () => harness.service.recordIncorrect(harness.question));
  assert.deepEqual(results.map((result) => result.stage), [1, 1, 2, 3]);
  assert.deepEqual(results.map((result) => result.kind), ["nudge", "nudge", "strategy", "demonstration"]);
});

test("a manual hint request does not count as an incorrect answer", () => {
  const harness = createHarness();
  const hint = harness.service.requestHint(harness.question);
  const session = harness.service.getSession(harness.question.id);
  assert.equal(hint.stage, 1);
  assert.equal(session.hintRequests, 1);
  assert.equal(session.incorrectAttempts, 0);
  assert.equal(session.canComplete, true);
});

test("Professor Hoot presentation includes visual descriptors, captions, and a complete text equivalent", () => {
  const demo = multiplicationHints().stages[2].demonstration;
  const presentation = createProfessorHootDemonstration(demo);
  assert.equal(presentation.character, "professor-hoot");
  assert.equal(presentation.steps[0].number, 1);
  assert.equal(presentation.steps[0].visual.kind, "array");
  assert.equal(presentation.steps[1].visual.ariaLabel, "Four threes make twelve");
  assert.match(presentation.narrationText, /four groups of three/i);
  assert.match(presentation.textEquivalent, /Visual: Four equal rows/);
  assert.ok(Object.isFrozen(presentation));
});

test("retry returns the original question and keeps its attempt history", () => {
  const harness = createHarness();
  harness.service.recordIncorrect(harness.question);
  const retry = harness.service.chooseNextStep(harness.question.id, "retry");
  assert.equal(retry.kind, "retry");
  assert.equal(retry.question, harness.question);
  assert.equal(retry.incorrectAttempts, 1);
  assert.equal(retry.canComplete, true);
  assert.equal(harness.service.getSession(harness.question.id).incorrectAttempts, 1);
  assert.throws(() => harness.service.chooseNextStep(harness.question.id, "restart"), /retry.*parallel/);
});

test("parallel question uses the same activity and tier with a new deterministic seed", () => {
  const harness = createHarness();
  harness.service.recordIncorrect(harness.question);
  const first = harness.service.chooseNextStep(harness.question.id, "parallel");
  const second = harness.service.chooseNextStep(harness.question.id, "parallel");

  assert.equal(first.kind, "parallel");
  assert.equal(first.question.activityId, harness.question.activityId);
  assert.equal(first.question.tier, harness.question.tier);
  assert.deepEqual(first.question.skillIds, harness.question.skillIds);
  assert.notEqual(first.question.id, harness.question.id);
  assert.notEqual(first.question.seed, harness.question.seed);
  assert.notEqual(second.question.id, first.question.id);
  assert.equal(harness.service.getSession(first.question.id).incorrectAttempts, 0);
  assert.equal(harness.service.getSession(harness.question.id).parallelCount, 2);
  assert.equal(first.canComplete, true);
});

test("completion is always available, even without requesting or reaching a hint stage", () => {
  const harness = createHarness();
  const untouched = harness.service.complete("question-with-no-hint-session");
  assert.equal(untouched.completed, true);
  assert.equal(untouched.canComplete, true);
  assert.equal(untouched.incorrectAttempts, 0);

  harness.service.recordIncorrect(harness.question);
  const completed = harness.service.complete(harness.question.id);
  assert.equal(completed.completed, true);
  assert.equal(completed.canComplete, true);
  assert.equal(completed.lastHintStage, 1);
  assert.equal(harness.service.recordIncorrect(harness.question).reason, "question-already-completed");
  assert.throws(() => harness.service.retry(harness.question.id), /completed/);
  assert.throws(() => harness.service.solveParallel(harness.question.id), /completed/);
});

test("missing activity hint content is graceful and never blocks parallel solving or completion", () => {
  const harness = createHarness({ hints: [] });
  const outcome = harness.service.recordIncorrect(harness.question);
  assert.equal(outcome.available, false);
  assert.equal(outcome.reason, "activity-hints-not-registered");
  assert.equal(outcome.canComplete, true);
  const parallel = harness.service.solveParallel(harness.question.id);
  assert.equal(parallel.kind, "parallel");
  assert.equal(harness.service.complete(parallel.question.id).completed, true);
});

test("question and dependency contracts are validated at service construction and use", () => {
  const harness = createHarness();
  assert.throws(() => createHintService(), /activity registry/);
  assert.throws(() => harness.service.recordIncorrect({
    ...harness.question,
    skillIds: ["math.division"]
  }), /must match/);
  assert.throws(() => harness.service.retry("missing-session"), /unknown hint session/);
  assert.throws(() => harness.service.complete(""), /non-empty string/);
});
