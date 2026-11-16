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
import { chapterSixActivityDefinitions, chapterSixDefinition, chapterSixHintDefinitions, chapterSixReward } from "../src/chapters/chapterSix.js";
import { chapterSevenReward } from "../src/chapters/chapterSeven.js";
import { chapterEightReward } from "../src/chapters/chapterEight.js";
import { chapterNineReward } from "../src/chapters/chapterNine.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";
import {
  plantLifecycleStages, getPlantLifecycleTransitions, getPlantResourceScenarios,
  photosynthesisChoiceBank, PHOTOSYNTHESIS_INPUTS_ANSWER
} from "../src/data/plantLexicon.js";

const tiers = ["foundation", "core", "stretch"];

test("Chapter 6 is registered after Chapter 5 with lifecycle, resource, and photosynthesis activities", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), [
    "chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06", "chapter-07", "chapter-08", "chapter-09"
  ]);
  assert.equal(getChapterDefinition("chapter-06"), chapterSixDefinition);
  assert.equal(validateChapterDefinition(chapterSixDefinition), true);
  assert.deepEqual(chapterSixDefinition.prerequisiteChapterIds, ["chapter-05"]);
  assert.deepEqual(chapterSixActivityDefinitions.map((activity) => activity.skillIds[0]), [
    "science.plant-life-cycles", "science.plant-resources", "science.plant-resources"
  ]);
  assert.deepEqual(chapterSixDefinition.activities.map((activity) => activity.type), [
    "story", "learning", "learning", "challenge", "story"
  ]);
  assert.deepEqual(chapterSixDefinition.activities.slice(1, 4).map((activity) => activity.metadata.questionCount), [4, 4, 3]);
  assert.deepEqual(chapterSixReward.replayPolicy, { type: "once" });
  assert.equal(chapterSixReward.sourceId, "chapter-06");
});

test("the curated plant life cycle is ordered and tiered transitions preserve the stage sequence", () => {
  assert.deepEqual(plantLifecycleStages.map((stage) => stage.id), [
    "seed", "germination", "seedling", "flowering", "fruit-seeds"
  ]);
  assert.equal(new Set(plantLifecycleStages.map((stage) => stage.id)).size, plantLifecycleStages.length);
  assert.ok(plantLifecycleStages.every((stage) => stage.label && stage.description && stage.clue));
  assert.deepEqual(getPlantLifecycleTransitions("foundation").map((entry) => entry.nextStage.id), [
    "germination", "seedling"
  ]);
  assert.deepEqual(getPlantLifecycleTransitions("core").map((entry) => entry.nextStage.id), [
    "germination", "seedling", "flowering"
  ]);
  assert.deepEqual(getPlantLifecycleTransitions("stretch").map((entry) => entry.nextStage.id), [
    "germination", "seedling", "flowering", "fruit-seeds"
  ]);
  assert.throws(() => getPlantLifecycleTransitions("expert"), /Unknown plant-life-cycle difficulty tier/);
});

test("life-cycle sequence questions are deterministic, tiered, and have the correct next stage", () => {
  const activities = createActivityRegistry(chapterSixActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-06.lifecycle-sequence");
  for (const tier of tiers) {
    for (let index = 0; index < 50; index += 1) {
      const seed = "plant-cycle:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "plant-lifecycle");
      const transition = getPlantLifecycleTransitions(tier).find((entry) => entry.nextStage.label === question.correctAnswer);
      assert.ok(transition);
      assert.deepEqual(question.stimulus.completedStages.map((stage) => stage.id), transition.currentStages.map((stage) => stage.id));
      assert.equal(question.correctAnswer, transition.nextStage.label);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(question.correctAnswer));
      assert.ok(checkActivityAnswer(question.correctAnswer, transition.nextStage.label, question.answerRules));
    }
  }
});

test("greenhouse resource-choice questions distinguish plant resources and match each scenario to its need", () => {
  const activities = createActivityRegistry(chapterSixActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-06.greenhouse-resources");
  for (const tier of tiers) {
    const scenarios = getPlantResourceScenarios(tier);
    assert.ok(scenarios.length >= 2);
    for (let index = 0; index < 55; index += 1) {
      const seed = "greenhouse-resource:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "plant-resource-scenario");
      const scenario = scenarios.find((entry) => entry.id === question.stimulus.scenarioId);
      assert.ok(scenario);
      assert.equal(question.correctAnswer, scenario.resource);
      assert.equal(question.stimulus.explanation, scenario.explanation);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(scenario.resource));
      assert.ok(checkActivityAnswer(question.correctAnswer, scenario.resource, question.answerRules));
    }
  }
  assert.deepEqual(getPlantResourceScenarios("foundation").map((entry) => entry.resource), ["Water", "Sunlight"]);
  assert.ok(getPlantResourceScenarios("core").some((entry) => entry.resource === "Carbon dioxide"));
  assert.ok(getPlantResourceScenarios("stretch").some((entry) => entry.resource === "Mineral nutrients"));
});

test("photosynthesis questions consistently name the three inputs and distinguish outputs and growth nutrients", () => {
  const activities = createActivityRegistry(chapterSixActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-06.photosynthesis-recipe");
  assert.equal(PHOTOSYNTHESIS_INPUTS_ANSWER, "Sunlight, water, and carbon dioxide");
  assert.ok(photosynthesisChoiceBank.includes(PHOTOSYNTHESIS_INPUTS_ANSWER));
  for (const tier of tiers) {
    for (let index = 0; index < 40; index += 1) {
      const question = generator.generate(activity, { seed: "photosynthesis:" + tier + ":" + index, tier });
      assert.deepEqual(question, generator.generate(activity, { seed: "photosynthesis:" + tier + ":" + index, tier }));
      assert.equal(question.stimulus.kind, "photosynthesis-inputs");
      assert.equal(question.correctAnswer, PHOTOSYNTHESIS_INPUTS_ANSWER);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(PHOTOSYNTHESIS_INPUTS_ANSWER));
      assert.ok(!question.correctAnswer.toLowerCase().includes("oxygen"));
      assert.ok(!question.correctAnswer.toLowerCase().includes("mineral"));
    }
  }
});

test("Professor Hoot provides three explanatory hint stages for every greenhouse activity", () => {
  const activityRegistry = createActivityRegistry(chapterSixActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: chapterSixHintDefinitions });
  const hints = createHintService({ activityRegistry, hintRegistry, questionGeneratorRegistry: generator });
  for (const activityId of [
    "chapter-06.lifecycle-sequence", "chapter-06.greenhouse-resources", "chapter-06.photosynthesis-recipe"
  ]) {
    const question = generator.generate(activityRegistry.get(activityId), { seed: "greenhouse-hint:" + activityId, tier: "core" });
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

test("Chapter 6 waits for Chapter 5, resumes its checkpoint, and grants the Sunrise Seed Satchel only once", () => {
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const rewardRegistry = createRewardRegistry([
    chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward, chapterFiveReward, chapterSixReward, chapterSevenReward, chapterEightReward, chapterNineReward
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
  assert.throws(() => chapterService.createSession("chapter-06").start(), /prerequisite chapters/);

  for (const chapter of chapterDefinitions.slice(0, 5)) {
    const session = chapterService.createSession(chapter.id);
    session.start();
    for (let index = 0; index < chapter.activities.length; index += 1) session.completeActivity();
    assert.equal(session.getSnapshot().isComplete, true);
  }

  const interrupted = chapterService.createSession("chapter-06");
  interrupted.start();
  interrupted.completeActivity();
  interrupted.completeActivity();
  interrupted.exit();
  const resumed = chapterService.createSession("chapter-06");
  assert.equal(resumed.start().currentActivity.id, "chapter-06.greenhouse-care");
  for (let index = 2; index < chapterSixDefinition.activities.length; index += 1) resumed.completeActivity();
  assert.equal(resumed.getSnapshot().isComplete, true);
  assert.equal(resumed.getSnapshot().completionReceipt.rewards[0].reason, "reward-granted");

  const replay = chapterService.createSession("chapter-06");
  replay.start();
  for (let index = 0; index < chapterSixDefinition.activities.length; index += 1) replay.completeActivity();
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterSixReward.id], 1);
  assert.equal(economy.starGems, 390);
  assert.equal(economy.starlightSparkles, 27);
  assert.equal(chapterService.getSnapshot().chapters.find((chapter) => chapter.id === "chapter-06").progress.completedRuns, 2);
  store.destroy();
});
