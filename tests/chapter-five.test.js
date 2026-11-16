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
import {
  chapterFiveActivityDefinitions, chapterFiveDefinition, chapterFiveHintDefinitions, chapterFiveReward
} from "../src/chapters/chapterFive.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";
import { chapterSixReward } from "../src/chapters/chapterSix.js";
import { chapterSevenReward } from "../src/chapters/chapterSeven.js";
import {
  habitatCreatureLexicon, habitatEcosystemConnections, getHabitatCreatures, getHabitatAdaptations
} from "../src/data/habitatLexicon.js";

const tiers = ["foundation", "core", "stretch"];

test("Chapter 5 is registered after Chapter 4 with habitat, adaptation, and ecosystem activities", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), [
    "chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06", "chapter-07"
  ]);
  assert.equal(getChapterDefinition("chapter-05"), chapterFiveDefinition);
  assert.equal(validateChapterDefinition(chapterFiveDefinition), true);
  assert.deepEqual(chapterFiveDefinition.prerequisiteChapterIds, ["chapter-04"]);
  assert.deepEqual(chapterFiveActivityDefinitions.map((activity) => activity.skillIds[0]), [
    "science.habitats", "science.adaptations", "science.adaptations", "science.habitats"
  ]);
  assert.deepEqual(chapterFiveDefinition.activities.map((activity) => activity.type), [
    "story", "learning", "learning", "challenge", "challenge", "story"
  ]);
  assert.deepEqual(chapterFiveDefinition.activities.slice(1, 5).map((activity) => activity.metadata.questionCount), [2, 2, 3, 3]);
  assert.deepEqual(chapterFiveReward.replayPolicy, { type: "once" });
  assert.equal(chapterFiveReward.sourceId, "chapter-05");
});

test("the curated habitat bank has unique biomes, clue coverage, and both adaptation types", () => {
  assert.equal(habitatCreatureLexicon.length, 6);
  assert.equal(new Set(habitatCreatureLexicon.map((entry) => entry.id)).size, 6);
  assert.equal(new Set(habitatCreatureLexicon.map((entry) => entry.habitatId)).size, 6);
  assert.ok(habitatCreatureLexicon.every((entry) => entry.animal && entry.habitatLabel && entry.climateClue && entry.needsClue));
  const adaptations = getHabitatAdaptations("stretch");
  assert.ok(adaptations.some((entry) => entry.type === "structural"));
  assert.ok(adaptations.some((entry) => entry.type === "behavioral"));
  assert.equal(new Set(adaptations.map((entry) => entry.purpose)).size, adaptations.length);
  assert.equal(habitatEcosystemConnections.length, 4);
  assert.equal(getHabitatCreatures("foundation").length, 4);
  assert.equal(getHabitatCreatures("core").length, 6);
  assert.equal(getHabitatCreatures("stretch").length, 6);
  assert.throws(() => getHabitatCreatures("expert"), /Unknown habitat difficulty tier/);
});

test("biome matching questions are deterministic, tiered, and use defensible creature clues", () => {
  const activities = createActivityRegistry(chapterFiveActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-05.biome-clues");
  for (const tier of tiers) {
    for (let index = 0; index < 35; index += 1) {
      const seed = "habitat:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "habitat-creature");
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(question.correctAnswer));
      const creature = habitatCreatureLexicon.find((entry) => entry.animal === question.stimulus.animal);
      assert.ok(getHabitatCreatures(tier).some((entry) => entry.id === creature.id));
      assert.equal(question.correctAnswer, creature.habitatLabel);
      assert.ok(question.stimulus.climateClue.length > 20);
      assert.ok(checkActivityAnswer(question.correctAnswer, creature.habitatLabel, question.answerRules));
    }
  }
});

test("adaptation classification and survival-purpose questions match curated data", () => {
  const activities = createActivityRegistry(chapterFiveActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const typeActivity = activities.get("chapter-05.adaptation-lab");
  const purposeActivity = activities.get("chapter-05.survival-strategies");
  for (const tier of tiers) {
    for (let index = 0; index < 40; index += 1) {
      const typeSeed = "adaptation-type:" + tier + ":" + index;
      const typeQuestion = generator.generate(typeActivity, { seed: typeSeed, tier });
      assert.deepEqual(typeQuestion, generator.generate(typeActivity, { seed: typeSeed, tier }));
      assert.equal(typeQuestion.stimulus.kind, "adaptation-clue");
      const typeRecord = getHabitatAdaptations(tier).find((entry) =>
        entry.animal === typeQuestion.stimulus.animal && entry.feature === typeQuestion.stimulus.feature
      );
      assert.ok(typeRecord);
      assert.equal(typeQuestion.correctAnswer, typeRecord.type);
      assert.deepEqual([...typeQuestion.choices].sort(), ["behavioral", "structural"]);
      assert.ok(checkActivityAnswer(typeQuestion.correctAnswer, typeRecord.type, typeQuestion.answerRules));

      const purposeSeed = "adaptation-purpose:" + tier + ":" + index;
      const purposeQuestion = generator.generate(purposeActivity, { seed: purposeSeed, tier });
      assert.deepEqual(purposeQuestion, generator.generate(purposeActivity, { seed: purposeSeed, tier }));
      assert.equal(purposeQuestion.stimulus.kind, "adaptation-clue");
      const purposeRecord = getHabitatAdaptations(tier).find((entry) =>
        entry.animal === purposeQuestion.stimulus.animal && entry.feature === purposeQuestion.stimulus.feature
      );
      assert.ok(purposeRecord);
      assert.equal(purposeQuestion.correctAnswer, purposeRecord.purpose);
      assert.equal(purposeQuestion.choices.length, 4);
      assert.equal(new Set(purposeQuestion.choices).size, 4);
      assert.ok(purposeQuestion.choices.includes(purposeQuestion.correctAnswer));
      assert.ok(checkActivityAnswer(purposeQuestion.correctAnswer, purposeRecord.purpose, purposeQuestion.answerRules));
    }
  }
});

test("ecosystem questions describe grounded effects on habitat and food-web connections", () => {
  const activities = createActivityRegistry(chapterFiveActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-05.ecosystem-web");
  for (const tier of tiers) {
    for (let index = 0; index < 36; index += 1) {
      const seed = "ecosystem:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "ecosystem-connection");
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      const record = habitatEcosystemConnections.find((entry) => entry.organism === question.stimulus.organism);
      assert.ok(record);
      assert.equal(question.correctAnswer, record.effect);
      assert.ok(question.choices.includes(record.effect));
      assert.ok(checkActivityAnswer(question.correctAnswer, record.effect, question.answerRules));
    }
  }
});

test("Professor Hoot has three useful hint stages for each habitat activity", () => {
  const activityRegistry = createActivityRegistry(chapterFiveActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: chapterFiveHintDefinitions });
  const hints = createHintService({ activityRegistry, hintRegistry, questionGeneratorRegistry: generator });
  for (const activityId of [
    "chapter-05.biome-clues", "chapter-05.adaptation-lab",
    "chapter-05.survival-strategies", "chapter-05.ecosystem-web"
  ]) {
    const question = generator.generate(activityRegistry.get(activityId), { seed: "hint:" + activityId, tier: "core" });
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

test("Chapter 5 waits for Chapter 4, resumes its checkpoint, and awards the Wildlife Compass only once", () => {
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const rewardRegistry = createRewardRegistry([
    chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward, chapterFiveReward, chapterSixReward, chapterSevenReward
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
  assert.throws(() => chapterService.createSession("chapter-05").start(), /prerequisite chapters/);

  for (const chapter of chapterDefinitions.slice(0, 4)) {
    const session = chapterService.createSession(chapter.id);
    session.start();
    for (let index = 0; index < chapter.activities.length; index += 1) session.completeActivity();
    assert.equal(session.getSnapshot().isComplete, true);
  }
  const interrupted = chapterService.createSession("chapter-05");
  interrupted.start();
  interrupted.completeActivity();
  interrupted.completeActivity();
  interrupted.exit();
  const resumed = chapterService.createSession("chapter-05");
  assert.equal(resumed.start().currentActivity.id, "chapter-05.adaptation-lab-scene");
  for (let index = 2; index < chapterFiveDefinition.activities.length; index += 1) resumed.completeActivity();
  assert.equal(resumed.getSnapshot().isComplete, true);
  assert.equal(resumed.getSnapshot().completionReceipt.rewards[0].reason, "reward-granted");

  const replay = chapterService.createSession("chapter-05");
  replay.start();
  for (let index = 0; index < chapterFiveDefinition.activities.length; index += 1) replay.completeActivity();
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterFiveReward.id], 1);
  assert.equal(economy.starGems, 300);
  assert.equal(economy.starlightSparkles, 20);
  assert.equal(chapterService.getSnapshot().chapters.find((chapter) => chapter.id === "chapter-05").progress.completedRuns, 2);
  store.destroy();
});
