import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState } from "../src/core/state/actions.js";
import { createInitialEconomyState, selectEconomy } from "../src/systems/economy/economyState.js";
import { createRewardRegistry, createShopCatalog } from "../src/systems/economy/economyCatalogs.js";
import { createEconomyActionDefinitions } from "../src/systems/economy/economyActions.js";
import { createEconomyService } from "../src/systems/economy/createEconomyService.js";
import { createActivityRegistry } from "../src/systems/curriculum/activityDefinitions.js";
import { createQuestionGeneratorRegistry } from "../src/systems/curriculum/questionGenerators.js";
import { checkActivityAnswer } from "../src/systems/curriculum/answerRules.js";
import { createHintRegistry } from "../src/systems/hints/createHintRegistry.js";
import { createHintService } from "../src/systems/hints/createHintService.js";
import { createChapterCatalog, validateChapterDefinition } from "../src/gameplay/chapter-runtime/chapterCatalog.js";
import { createInitialChapterRuntimeState } from "../src/gameplay/chapter-runtime/chapterRuntimeState.js";
import { createChapterRuntimeActionDefinitions } from "../src/gameplay/chapter-runtime/chapterRuntimeActions.js";
import { createChapterRuntimeService } from "../src/gameplay/chapter-runtime/createChapterRuntimeService.js";
import {
  chapterTwoActivityDefinitions,
  chapterTwoDefinition,
  chapterTwoHintDefinitions,
  chapterTwoReward
} from "../src/chapters/chapterTwo.js";
import { chapterOneReward } from "../src/chapters/chapterOne.js";
import { chapterThreeDefinition, chapterThreeReward } from "../src/chapters/chapterThree.js";
import { chapterFourDefinition, chapterFourReward } from "../src/chapters/chapterFour.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";

test("Chapter 2 is registered with an Apollo story, two fraction skills, and a Chapter 1 prerequisite", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05"]);
  assert.equal(getChapterDefinition("chapter-02"), chapterTwoDefinition);
  assert.equal(getChapterDefinition("chapter-03"), chapterThreeDefinition);
  assert.equal(getChapterDefinition("chapter-04"), chapterFourDefinition);
  assert.equal(validateChapterDefinition(chapterTwoDefinition), true);
  assert.deepEqual(chapterTwoDefinition.prerequisiteChapterIds, ["chapter-01"]);
  assert.deepEqual(chapterTwoDefinition.activities.map((activity) => activity.type), [
    "story", "learning", "challenge", "story"
  ]);
  assert.equal(chapterTwoDefinition.activities[1].activityId, "chapter-02.fraction-models");
  assert.equal(chapterTwoDefinition.activities[2].activityId, "chapter-02.equivalent-fractions");
  assert.equal(chapterTwoDefinition.activities[2].metadata.questionCount, 3);
  assert.deepEqual(chapterTwoReward.replayPolicy, { type: "once" });
  assert.equal(chapterTwoReward.sourceId, "chapter-02");
});

test("fraction model questions are deterministic, tiered, visual, and always include their correct answer", () => {
  const activityRegistry = createActivityRegistry(chapterTwoActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  for (const tier of ["foundation", "core", "stretch"]) {
    const modelActivity = activityRegistry.get("chapter-02.fraction-models");
    const model = generator.generate(modelActivity, { seed: "mosaic:" + tier, tier });
    const repeated = generator.generate(modelActivity, { seed: "mosaic:" + tier, tier });
    assert.deepEqual(model, repeated);
    assert.equal(model.stimulus.kind, "fraction-bars");
    assert.equal(model.stimulus.bars.length, 1);
    const bar = model.stimulus.bars[0];
    assert.ok(bar.numerator > 0 && bar.numerator < bar.denominator);
    assert.equal(bar.showValue, false);
    assert.equal(model.correctAnswer, bar.numerator + "/" + bar.denominator);
    assert.equal(model.choices.length, 4);
    assert.equal(new Set(model.choices).size, 4);
    assert.ok(model.choices.includes(model.correctAnswer));
    assert.ok(checkActivityAnswer(model.correctAnswer, model.correctAnswer, model.answerRules));

    for (let index = 0; index < 24; index += 1) {
      const question = generator.generate(modelActivity, { seed: "mosaic:" + tier + ":" + index, tier });
      assert.ok(question.choices.includes(question.correctAnswer));
      assert.equal(new Set(question.choices).size, 4);
      assert.equal(question.stimulus.bars[0].denominator, Number(question.correctAnswer.split("/")[1]));
    }
  }
});

test("equivalent-fraction choices contain exactly one mathematically equivalent amount", () => {
  const activityRegistry = createActivityRegistry(chapterTwoActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("chapter-02.equivalent-fractions");
  for (const tier of ["foundation", "core", "stretch"]) {
    for (let index = 0; index < 36; index += 1) {
      const question = generator.generate(activity, { seed: "harmony:" + tier + ":" + index, tier });
      const base = question.stimulus.bars[0];
      assert.equal(base.showValue, true);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      const equivalents = question.choices.filter((choice) => {
        const [numerator, denominator] = choice.split("/").map(Number);
        return numerator * base.denominator === base.numerator * denominator;
      });
      assert.deepEqual(equivalents, [question.correctAnswer]);
      assert.ok(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules));
    }
  }
});

test("Professor Hoot supplies fraction-specific nudges, strategies, and worked examples", () => {
  const activityRegistry = createActivityRegistry(chapterTwoActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({
    activityRegistry,
    initialDefinitions: chapterTwoHintDefinitions
  });
  const hints = createHintService({ activityRegistry, hintRegistry, questionGeneratorRegistry: generator });
  for (const [activityId, seed] of [
    ["chapter-02.fraction-models", "hoot-fractions"],
    ["chapter-02.equivalent-fractions", "hoot-equivalent"]
  ]) {
    const question = generator.generate(activityRegistry.get(activityId), { seed, tier: "core" });
    assert.equal(hints.requestHint(question).stage, 1);
    assert.equal(hints.recordIncorrect(question).stage, 1);
    assert.equal(hints.recordIncorrect(question).stage, 2);
    const workedExample = hints.recordIncorrect(question);
    assert.equal(workedExample.stage, 3);
    assert.ok(workedExample.demonstration.steps.length >= 2);
    assert.equal(hints.getSession(question.id).canComplete, true);
    assert.equal(hints.complete(question.id).completed, true);
  }
});

test("Chapter 2 waits for Chapter 1, resumes its checkpoint, and grants its reward only once", () => {
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
    actions: {
      ...economyActions,
      ...createChapterRuntimeActionDefinitions({ chapterCatalog })
    }
  });
  const economyService = createEconomyService({ store, rewardRegistry, shopCatalog });
  const chapterService = createChapterRuntimeService({
    store, chapterCatalog, rewardRegistry, economyService
  });

  assert.throws(
    () => chapterService.createSession("chapter-02").start(),
    /prerequisite chapters/
  );

  const firstChapter = chapterService.createSession("chapter-01");
  firstChapter.start();
  for (let index = 0; index < chapterDefinitions[0].activities.length; index += 1) {
    firstChapter.completeActivity();
  }
  assert.equal(firstChapter.getSnapshot().isComplete, true);

  const firstRun = chapterService.createSession("chapter-02");
  firstRun.start();
  firstRun.completeActivity();
  firstRun.completeActivity();
  firstRun.exit();

  const resumed = chapterService.createSession("chapter-02");
  assert.equal(resumed.start().currentActivity.id, "chapter-02.harmony-lens");
  resumed.completeActivity();
  const completed = resumed.completeActivity();
  assert.equal(completed.isComplete, true);
  assert.equal(completed.completedActivityCount, 4);
  assert.equal(completed.completionReceipt.rewards[0].granted, true);
  assert.equal(completed.completionReceipt.rewards[0].reason, "reward-granted");

  const replay = chapterService.createSession("chapter-02");
  replay.start();
  for (let index = 0; index < chapterTwoDefinition.activities.length; index += 1) {
    replay.completeActivity();
  }
  assert.equal(replay.getSnapshot().isComplete, true);
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterTwoReward.id], 1);
  assert.equal(economy.starGems, 90);
  assert.equal(economy.starlightSparkles, 5);
  assert.equal(chapterService.getSnapshot().chapters.find((chapter) => chapter.id === "chapter-02").progress.completedRuns, 2);
  store.destroy();
});
