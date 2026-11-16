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
import {
  chapterFourActivityDefinitions, chapterFourDefinition, chapterFourHintDefinitions, chapterFourReward
} from "../src/chapters/chapterFour.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";

test("Chapter 4 is registered after Chapter 3 with five geometry skills and the correct prerequisite", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05"]);
  assert.equal(getChapterDefinition("chapter-04"), chapterFourDefinition);
  assert.equal(validateChapterDefinition(chapterFourDefinition), true);
  assert.deepEqual(chapterFourDefinition.prerequisiteChapterIds, ["chapter-03"]);
  assert.deepEqual(chapterFourDefinition.activities.map((activity) => activity.type), [
    "story", "learning", "learning", "learning", "challenge", "challenge", "story"
  ]);
  assert.deepEqual(chapterFourActivityDefinitions.map((activity) => activity.skillIds[0]), [
    "math.shape-recognition", "math.symmetry", "math.angles", "math.perimeter", "math.area"
  ]);
  assert.deepEqual(chapterFourDefinition.activities.slice(1, 6).map((activity) => activity.metadata.questionCount), [1, 1, 1, 3, 3]);
  assert.deepEqual(chapterFourReward.replayPolicy, { type: "once" });
  assert.equal(chapterFourReward.sourceId, "chapter-04");
});

test("shape and symmetry questions are deterministic, tiered, visual, and mathematically grounded", () => {
  const activityRegistry = createActivityRegistry(chapterFourActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  for (const tier of ["foundation", "core", "stretch"]) {
    for (const [activityId, focus] of [["chapter-04.shape-studio", "shape"], ["chapter-04.symmetry-mirror", "symmetry"]]) {
      const activity = activityRegistry.get(activityId);
      for (let index = 0; index < 36; index += 1) {
        const seed = activityId + ":" + tier + ":" + index;
        const question = generator.generate(activity, { seed, tier });
        assert.deepEqual(question, generator.generate(activity, { seed, tier }));
        assert.equal(question.stimulus.kind, "geometry-shape");
        assert.equal(question.stimulus.focus, focus);
        assert.equal(question.choices.length, 4);
        assert.equal(new Set(question.choices).size, 4);
        assert.ok(question.choices.includes(question.correctAnswer));
        if (focus === "shape") assert.equal(question.correctAnswer, question.stimulus.label);
        else {
          assert.equal(question.correctAnswer, question.stimulus.symmetryLines);
          assert.ok(question.choices.every((choice) => Number.isInteger(choice) && choice >= 0));
        }
        assert.ok(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules));
      }
    }
  }
});

test("angle questions display a degree measure and uniquely classify all four angle types", () => {
  const activityRegistry = createActivityRegistry(chapterFourActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("chapter-04.angle-turn");
  for (const tier of ["foundation", "core", "stretch"]) {
    for (let index = 0; index < 45; index += 1) {
      const question = generator.generate(activity, { seed: "angle:" + tier + ":" + index, tier });
      const degrees = question.stimulus.degrees;
      const expected = degrees < 90 ? "acute" : degrees === 90 ? "right" : degrees < 180 ? "obtuse" : "straight";
      assert.equal(question.stimulus.kind, "geometry-angle");
      assert.equal(question.correctAnswer, expected);
      assert.deepEqual([...question.choices].sort(), ["acute", "obtuse", "right", "straight"]);
      assert.ok(checkActivityAnswer(question.correctAnswer, expected, question.answerRules));
    }
  }
});

test("perimeter and area problems use labeled rectangle dimensions and correct formulas", () => {
  const activityRegistry = createActivityRegistry(chapterFourActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  for (const [activityId, focus] of [["chapter-04.perimeter", "perimeter"], ["chapter-04.area", "area"]]) {
    const activity = activityRegistry.get(activityId);
    for (const tier of ["foundation", "core", "stretch"]) {
      for (let index = 0; index < 48; index += 1) {
        const question = generator.generate(activity, { seed: activityId + ":" + tier + ":" + index, tier });
        const { width, height } = question.stimulus;
        const expected = focus === "perimeter" ? 2 * (width + height) : width * height;
        assert.equal(question.stimulus.kind, "geometry-rectangle");
        assert.equal(question.stimulus.focus, focus);
        assert.ok(width > 0 && height > 0);
        assert.equal(question.correctAnswer, expected);
        assert.equal(question.choices.length, 4);
        assert.equal(new Set(question.choices).size, 4);
        assert.ok(question.choices.includes(expected));
        assert.ok(checkActivityAnswer(question.correctAnswer, expected, question.answerRules));
      }
    }
  }
});

test("Professor Hoot supplies shape, symmetry, angle, perimeter, and area demonstrations", () => {
  const activityRegistry = createActivityRegistry(chapterFourActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: chapterFourHintDefinitions });
  const hints = createHintService({ activityRegistry, hintRegistry, questionGeneratorRegistry: generator });
  for (const [activityId, seed] of [
    ["chapter-04.shape-studio", "shape-hint"],
    ["chapter-04.symmetry-mirror", "symmetry-hint"],
    ["chapter-04.angle-turn", "angle-hint"],
    ["chapter-04.perimeter", "perimeter-hint"],
    ["chapter-04.area", "area-hint"]
  ]) {
    const question = generator.generate(activityRegistry.get(activityId), { seed, tier: "core" });
    assert.equal(hints.requestHint(question).stage, 1);
    assert.equal(hints.recordIncorrect(question).stage, 1);
    assert.equal(hints.recordIncorrect(question).stage, 2);
    const demonstration = hints.recordIncorrect(question);
    assert.equal(demonstration.stage, 3);
    assert.ok(demonstration.demonstration.steps.length >= 2);
    assert.equal(hints.getSession(question.id).canComplete, true);
    assert.equal(hints.complete(question.id).completed, true);
  }
});

test("Chapter 4 waits for Chapter 3, resumes its beam-course checkpoint, and awards its pin only once", () => {
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const rewardRegistry = createRewardRegistry([chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward]);
  const shopCatalog = createShopCatalog([]);
  const economyActions = createEconomyActionDefinitions({ rewardRegistry, shopCatalog });
  const store = createGameStore({
    initialState: {
      ...createInitialGameState(),
      economy: createInitialEconomyState(),
      chapterRuntime: createInitialChapterRuntimeState()
    },
    actions: { ...economyActions, ...createChapterRuntimeActionDefinitions({ chapterCatalog }) }
  });
  const economyService = createEconomyService({ store, rewardRegistry, shopCatalog });
  const chapterService = createChapterRuntimeService({ store, chapterCatalog, rewardRegistry, economyService });
  assert.throws(() => chapterService.createSession("chapter-04").start(), /prerequisite chapters/);

  for (const chapter of chapterDefinitions.slice(0, 3)) {
    const session = chapterService.createSession(chapter.id);
    session.start();
    for (let index = 0; index < chapter.activities.length; index += 1) session.completeActivity();
    assert.equal(session.getSnapshot().isComplete, true);
  }
  const interrupted = chapterService.createSession("chapter-04");
  interrupted.start();
  interrupted.completeActivity();
  interrupted.completeActivity();
  interrupted.exit();

  const resumed = chapterService.createSession("chapter-04");
  assert.equal(resumed.start().currentActivity.id, "chapter-04.mirror-garden");
  for (let index = 0; index < 5; index += 1) resumed.completeActivity();
  const completed = resumed.getSnapshot();
  assert.equal(completed.isComplete, true);
  assert.equal(completed.completedActivityCount, 7);
  assert.equal(completed.completionReceipt.rewards[0].granted, true);
  assert.equal(completed.completionReceipt.rewards[0].reason, "reward-granted");

  const replay = chapterService.createSession("chapter-04");
  replay.start();
  for (let index = 0; index < chapterFourDefinition.activities.length; index += 1) replay.completeActivity();
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterFourReward.id], 1);
  assert.equal(economy.starGems, 220);
  assert.equal(economy.starlightSparkles, 14);
  assert.equal(chapterService.getSnapshot().chapters.find((chapter) => chapter.id === "chapter-04").progress.completedRuns, 2);
  store.destroy();
});
