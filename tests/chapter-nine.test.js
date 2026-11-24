import test from "node:test";
import assert from "node:assert/strict";
import { createActivityRegistry } from "../src/systems/curriculum/activityDefinitions.js";
import { createQuestionGeneratorRegistry } from "../src/systems/curriculum/questionGenerators.js";
import { checkActivityAnswer } from "../src/systems/curriculum/answerRules.js";
import { createHintRegistry } from "../src/systems/hints/createHintRegistry.js";
import { createHintService } from "../src/systems/hints/createHintService.js";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState } from "../src/core/state/actions.js";
import { createInitialEconomyState, selectEconomy } from "../src/systems/economy/economyState.js";
import { createRewardRegistry, createShopCatalog } from "../src/systems/economy/economyCatalogs.js";
import { createEconomyActionDefinitions } from "../src/systems/economy/economyActions.js";
import { createEconomyService } from "../src/systems/economy/createEconomyService.js";
import { createChapterCatalog, validateChapterDefinition } from "../src/gameplay/chapter-runtime/chapterCatalog.js";
import { createInitialChapterRuntimeState } from "../src/gameplay/chapter-runtime/chapterRuntimeState.js";
import { createChapterRuntimeActionDefinitions } from "../src/gameplay/chapter-runtime/chapterRuntimeActions.js";
import { createChapterRuntimeService } from "../src/gameplay/chapter-runtime/createChapterRuntimeService.js";
import { chapterOneReward } from "../src/chapters/chapterOne.js";
import { chapterTwoReward } from "../src/chapters/chapterTwo.js";
import { chapterThreeReward } from "../src/chapters/chapterThree.js";
import { chapterFourReward } from "../src/chapters/chapterFour.js";
import { chapterFiveReward } from "../src/chapters/chapterFive.js";
import { chapterSixReward } from "../src/chapters/chapterSix.js";
import { chapterSevenReward } from "../src/chapters/chapterSeven.js";
import { chapterEightReward } from "../src/chapters/chapterEight.js";
import {
  chapterNineActivityDefinitions, chapterNineDefinition, chapterNineHintDefinitions, chapterNineReward
} from "../src/chapters/chapterNine.js";
import { chapterTenReward } from "../src/chapters/chapterTen.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";
import { getDivisionSettings, getMultiStepProblems } from "../src/data/chimeraChallengeLexicon.js";

const tiers = ["foundation", "core", "stretch"];

function calculateProblem(problem) {
  return problem.steps.reduce((value, step) => {
    if (step.operation === "add") return value + step.operand;
    if (step.operation === "subtract") return value - step.operand;
    if (step.operation === "multiply") return value * step.operand;
    if (step.operation === "divide") {
      assert.equal(value % step.operand, 0, problem.id + " must divide evenly");
      return value / step.operand;
    }
    assert.fail("Unknown operation " + step.operation + " in " + problem.id);
  }, problem.startValue);
}

test("Chapter 9 is registered after Chapter 8 with division, multi-digit, and multi-step activities", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), [
    "chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05",
    "chapter-06", "chapter-07", "chapter-08", "chapter-09", "chapter-10"
  ]);
  assert.equal(getChapterDefinition("chapter-09"), chapterNineDefinition);
  assert.equal(validateChapterDefinition(chapterNineDefinition), true);
  assert.deepEqual(chapterNineDefinition.prerequisiteChapterIds, ["chapter-08"]);
  assert.deepEqual(chapterNineActivityDefinitions.map((activity) => activity.skillIds[0]), [
    "math.division", "math.multi-digit-arithmetic", "math.multi-step-reasoning"
  ]);
  assert.deepEqual(chapterNineDefinition.activities.map((activity) => activity.type), [
    "story", "learning", "learning", "challenge", "story"
  ]);
  assert.deepEqual(chapterNineDefinition.activities.slice(1, 4).map((activity) => activity.metadata.questionCount), [5, 5, 4]);
  assert.deepEqual(chapterNineReward.replayPolicy, { type: "once" });
  assert.equal(chapterNineReward.sourceId, "chapter-09");
  assert.equal(chapterNineReward.starGems, 120);
  assert.equal(chapterNineReward.starlightSparkles, 10);
});

test("division tiers use exact equal-sharing totals with sensible quotient and divisor ranges", () => {
  const expected = {
    foundation: { divisorMin: 2, divisorMax: 5, quotientMin: 2, quotientMax: 9 },
    core: { divisorMin: 3, divisorMax: 9, quotientMin: 6, quotientMax: 18 },
    stretch: { divisorMin: 4, divisorMax: 12, quotientMin: 12, quotientMax: 36 }
  };
  for (const tier of tiers) assert.deepEqual(getDivisionSettings(tier), expected[tier]);
  assert.throws(() => getDivisionSettings("expert"), /Unknown division difficulty tier/);
});

test("division questions are deterministic, tiered, and divide each total into equal groups", () => {
  const activities = createActivityRegistry(chapterNineActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-09.division-quests");
  for (const tier of tiers) {
    const settings = getDivisionSettings(tier);
    for (let index = 0; index < 120; index += 1) {
      const seed = "chimera-division:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "chimera-division");
      assert.ok(question.stimulus.divisor >= settings.divisorMin && question.stimulus.divisor <= settings.divisorMax);
      const quotient = Number(question.correctAnswer);
      assert.ok(quotient >= settings.quotientMin && quotient <= settings.quotientMax);
      assert.equal(question.stimulus.total % question.stimulus.divisor, 0);
      assert.equal(question.stimulus.total / question.stimulus.divisor, quotient);
      assert.ok(question.stimulus.itemLabel && question.stimulus.groupLabel);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(question.correctAnswer));
      assert.ok(question.choices.every((choice) => /^\d+$/.test(choice)));
      assert.ok(checkActivityAnswer(question.correctAnswer, String(quotient), question.answerRules));
    }
  }
});

test("multi-digit arithmetic questions match the displayed operation and respect tier expectations", () => {
  const activities = createActivityRegistry(chapterNineActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-09.arithmetic-forge");
  for (const tier of tiers) {
    for (let index = 0; index < 180; index += 1) {
      const seed = "chimera-arithmetic:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "chimera-arithmetic");
      const { leftValue, rightValue, operation, symbol } = question.stimulus;
      const expectedSymbol = { addition: "+", subtraction: "−", multiplication: "×" }[operation];
      assert.equal(symbol, expectedSymbol);
      const result = operation === "addition" ? leftValue + rightValue
        : operation === "subtraction" ? leftValue - rightValue : leftValue * rightValue;
      assert.ok(result >= 0);
      assert.equal(question.correctAnswer, result.toLocaleString("en-US"));
      assert.equal(question.stimulus.left, leftValue.toLocaleString("en-US"));
      assert.equal(question.stimulus.right, rightValue.toLocaleString("en-US"));
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(question.correctAnswer));
      assert.ok(question.choices.every((choice) => Number.isInteger(Number(choice.replaceAll(",", "")))));
      assert.ok(checkActivityAnswer(question.correctAnswer, result.toLocaleString("en-US"), question.answerRules));

      if (tier === "foundation" && operation === "addition") {
        assert.ok(leftValue % 10 + rightValue % 10 < 10);
        assert.ok(Math.floor(leftValue / 10) + Math.floor(rightValue / 10) < 10);
      }
      if (tier === "foundation" && operation === "subtraction") assert.ok(leftValue % 10 >= rightValue % 10);
      if (tier === "core") {
        if (operation === "addition" || operation === "subtraction") {
          assert.ok(leftValue >= 100 && leftValue <= 899);
          assert.ok(rightValue >= 100 && rightValue <= 499);
          assert.ok(result >= 100 && result <= 999);
        } else {
          assert.ok(leftValue >= 10 && leftValue <= 99);
          assert.ok(rightValue >= 2 && rightValue <= 9);
        }
      }
      if (tier === "stretch" && operation !== "multiplication") {
        assert.ok(leftValue >= 1000 && leftValue <= 8999);
        assert.ok(rightValue >= 1000 && rightValue <= 4999);
      }
      if (tier === "stretch" && operation === "multiplication") {
        assert.ok(leftValue >= 20 && leftValue <= 99);
        assert.ok(rightValue >= 10 && rightValue <= 39);
      }
    }
  }
});

test("curated multi-step problems have two or three valid operations and independently verified answers", () => {
  const problems = getMultiStepProblems("stretch");
  assert.equal(problems.length, 9);
  assert.equal(new Set(problems.map((problem) => problem.id)).size, problems.length);
  for (const tier of tiers) {
    const selected = getMultiStepProblems(tier);
    assert.ok(selected.length >= 3);
    assert.ok(selected.every((problem) => problem.steps.length >= 2));
    if (tier !== "stretch") assert.ok(selected.every((problem) => problem.steps.length === 2));
    else assert.ok(selected.some((problem) => problem.steps.length === 3));
    for (const problem of selected) {
      assert.ok(problem.story && problem.question && problem.explanation);
      assert.ok(problem.steps.every((step) => step.label && step.explanation && Number.isInteger(step.operand)));
      assert.ok(problem.stepPrompts.length === problem.steps.length);
      const computed = calculateProblem(problem);
      assert.equal(computed, problem.answer, problem.id);
      assert.ok(computed >= 0);
    }
  }
  assert.equal(getMultiStepProblems("foundation").length, 3);
  assert.equal(getMultiStepProblems("core").length, 6);
  assert.equal(getMultiStepProblems("stretch").length, 9);
  assert.throws(() => getMultiStepProblems("expert"), /Unknown multi-step difficulty tier/);
});

test("multi-step questions use the curated story, correct final result, and a clear sequence of prompts", () => {
  const activities = createActivityRegistry(chapterNineActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-09.multi-step-labyrinth");
  const problems = new Map(getMultiStepProblems("stretch").map((problem) => [problem.id, problem]));
  for (const tier of tiers) {
    for (let index = 0; index < 150; index += 1) {
      const seed = "chimera-multi-step:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "chimera-multi-step");
      const problem = problems.get(question.stimulus.problemId);
      assert.ok(problem);
      assert.equal(question.stimulus.title, problem.title);
      assert.equal(question.stimulus.story, problem.story);
      assert.equal(question.stimulus.question, problem.question);
      assert.deepEqual(question.stimulus.stepPrompts, problem.stepPrompts);
      assert.equal(question.correctAnswer, String(calculateProblem(problem)));
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(question.correctAnswer));
      assert.ok(checkActivityAnswer(question.correctAnswer, String(problem.answer), question.answerRules));
    }
  }
});

test("Professor Hoot provides three-stage scaffolding for each Chimera activity", () => {
  const activityRegistry = createActivityRegistry(chapterNineActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: chapterNineHintDefinitions });
  const hints = createHintService({ activityRegistry, hintRegistry, questionGeneratorRegistry: generator });
  for (const activityId of [
    "chapter-09.division-quests", "chapter-09.arithmetic-forge", "chapter-09.multi-step-labyrinth"
  ]) {
    const question = generator.generate(activityRegistry.get(activityId), {
      seed: "chimera-hint:" + activityId, tier: "core"
    });
    assert.equal(hints.requestHint(question).stage, 1);
    assert.equal(hints.recordIncorrect(question).stage, 1);
    assert.equal(hints.recordIncorrect(question).stage, 2);
    const finalHint = hints.recordIncorrect(question);
    assert.equal(finalHint.stage, 3);
    assert.ok(finalHint.demonstration.steps.length >= 3);
    assert.equal(hints.getSession(question.id).canComplete, true);
    assert.equal(hints.complete(question.id).completed, true);
  }
});

test("Chapter 9 waits for Chapter 8, resumes its checkpoint, and grants the Chimera's Strategy Stone only once", () => {
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const rewardRegistry = createRewardRegistry([
    chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward,
    chapterFiveReward, chapterSixReward, chapterSevenReward, chapterEightReward, chapterNineReward, chapterTenReward
  ]);
  const shopCatalog = createShopCatalog([]);
  const economyActions = createEconomyActionDefinitions({ rewardRegistry, shopCatalog });
  const store = createGameStore({
    initialState: {
      ...createInitialGameState(), economy: createInitialEconomyState(),
      chapterRuntime: createInitialChapterRuntimeState()
    },
    actions: { ...economyActions, ...createChapterRuntimeActionDefinitions({ chapterCatalog }) }
  });
  const economyService = createEconomyService({ store, rewardRegistry, shopCatalog });
  const chapterService = createChapterRuntimeService({ store, chapterCatalog, rewardRegistry, economyService });
  assert.throws(() => chapterService.createSession("chapter-09").start(), /prerequisite chapters/);

  for (const chapter of chapterDefinitions.slice(0, 8)) {
    const session = chapterService.createSession(chapter.id);
    session.start();
    for (let index = 0; index < chapter.activities.length; index += 1) session.completeActivity();
    assert.equal(session.getSnapshot().isComplete, true);
  }

  const interrupted = chapterService.createSession("chapter-09");
  interrupted.start();
  interrupted.completeActivity();
  interrupted.completeActivity();
  interrupted.exit();
  const resumed = chapterService.createSession("chapter-09");
  assert.equal(resumed.start().currentActivity.id, "chapter-09.multi-digit-forge");
  for (let index = 2; index < chapterNineDefinition.activities.length; index += 1) resumed.completeActivity();
  assert.equal(resumed.getSnapshot().isComplete, true);
  assert.equal(resumed.getSnapshot().completionReceipt.rewards[0].reason, "reward-granted");

  const replay = chapterService.createSession("chapter-09");
  replay.start();
  for (let index = 0; index < chapterNineDefinition.activities.length; index += 1) replay.completeActivity();
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterNineReward.id], 1);
  assert.equal(economy.starGems, 720);
  assert.equal(economy.starlightSparkles, 54);
  assert.equal(chapterService.getSnapshot().chapters.find((entry) => entry.id === "chapter-09").progress.completedRuns, 2);
  store.destroy();
});
