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
import {
  chapterEightActivityDefinitions, chapterEightDefinition, chapterEightHintDefinitions, chapterEightReward
} from "../src/chapters/chapterEight.js";
import { chapterNineReward } from "../src/chapters/chapterNine.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";
import {
  massBalanceProblems, unitConversionProblems, getVolumeScale, getMassBalanceProblems,
  getUnitConversionProblems, getElapsedTimeOptions
} from "../src/data/measurementLexicon.js";

const tiers = ["foundation", "core", "stretch"];
const answer = (value, unit) => (Number.isInteger(value) ? value.toLocaleString("en-US") : String(value)) + " " + unit;

function clockMinutes(value) {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(value);
  assert.ok(match, "Clock time should use a clear 12-hour format: " + value);
  let hour = Number(match[1]) % 12;
  if (match[3] === "PM") hour += 12;
  return hour * 60 + Number(match[2]);
}

function displayDuration(value) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours === 0) return minutes + " minutes";
  if (minutes === 0) return hours + (hours === 1 ? " hour" : " hours");
  return hours + (hours === 1 ? " hour " : " hours ") + minutes + " minutes";
}

test("Chapter 8 is registered after Chapter 7 with volume, mass, conversion, and elapsed-time activities", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), [
    "chapter-01", "chapter-02", "chapter-03", "chapter-04",
    "chapter-05", "chapter-06", "chapter-07", "chapter-08", "chapter-09"
  ]);
  assert.equal(getChapterDefinition("chapter-08"), chapterEightDefinition);
  assert.equal(validateChapterDefinition(chapterEightDefinition), true);
  assert.deepEqual(chapterEightDefinition.prerequisiteChapterIds, ["chapter-07"]);
  assert.deepEqual(chapterEightActivityDefinitions.map((activity) => activity.skillIds[0]), [
    "math.volume", "math.mass", "math.unit-conversion", "math.elapsed-time"
  ]);
  assert.deepEqual(chapterEightDefinition.activities.map((activity) => activity.type), [
    "story", "learning", "learning", "learning", "challenge", "story"
  ]);
  assert.deepEqual(chapterEightDefinition.activities.slice(1, 5).map((activity) => activity.metadata.questionCount), [4, 4, 4, 4]);
  assert.deepEqual(chapterEightReward.replayPolicy, { type: "once" });
  assert.equal(chapterEightReward.sourceId, "chapter-08");
  assert.equal(chapterEightReward.starGems, 110);
  assert.equal(chapterEightReward.starlightSparkles, 9);
});

test("graduated beaker scales have ordered, evenly spaced graduations at each tier", () => {
  for (const tier of tiers) {
    const scale = getVolumeScale(tier);
    assert.ok(scale.capacityMl > 0);
    assert.ok(scale.graduationMl > 0);
    assert.equal(scale.graduations[0].value, 0);
    assert.equal(scale.graduations.at(-1).value, scale.capacityMl);
    assert.ok(scale.availableReadings.length >= 3);
    assert.ok(scale.graduations.every((entry, index) =>
      entry.value === index * scale.graduationMl && (entry.major ? entry.label === String(entry.value) : entry.label === null)
    ));
    assert.ok(scale.graduations.some((entry) => entry.major));
  }
  assert.equal(getVolumeScale("foundation").capacityMl, 200);
  assert.equal(getVolumeScale("core").capacityMl, 500);
  assert.equal(getVolumeScale("stretch").capacityMl, 600);
  assert.throws(() => getVolumeScale("expert"), /Unknown volume difficulty tier/);
});

test("volume questions are deterministic, tiered, and agree with the beaker liquid line and labeled scale", () => {
  const activities = createActivityRegistry(chapterEightActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-08.volume-reading");
  for (const tier of tiers) {
    for (let index = 0; index < 100; index += 1) {
      const seed = "poseidon-volume:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "measurement-beaker");
      const scale = getVolumeScale(tier);
      assert.equal(question.stimulus.capacityMl, scale.capacityMl);
      assert.deepEqual(question.stimulus.graduations, scale.graduations);
      assert.ok(scale.availableReadings.includes(question.stimulus.fillValueMl));
      assert.equal(question.correctAnswer, answer(question.stimulus.fillValueMl, "mL"));
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.every((choice) =>
        scale.graduations.some((entry) => answer(entry.value, "mL") === choice)
      ));
      assert.ok(checkActivityAnswer(question.correctAnswer, answer(question.stimulus.fillValueMl, "mL"), question.answerRules));
    }
  }
});

test("curated mass-balance problems add to the object's mass and remain tiered", () => {
  assert.equal(new Set(massBalanceProblems.map((entry) => entry.id)).size, massBalanceProblems.length);
  assert.ok(massBalanceProblems.every((entry) =>
    entry.object && entry.explanation && entry.weights.length >= 2 &&
    entry.weights.reduce((sum, value) => sum + value, 0) === entry.massGrams
  ));
  assert.deepEqual(
    getMassBalanceProblems("foundation").map((entry) => entry.id),
    massBalanceProblems.filter((entry) => entry.tier === "foundation").map((entry) => entry.id)
  );
  assert.ok(getMassBalanceProblems("core").length > getMassBalanceProblems("foundation").length);
  assert.equal(getMassBalanceProblems("stretch").length, massBalanceProblems.length);
  assert.throws(() => getMassBalanceProblems("expert"), /Unknown mass difficulty tier/);
});

test("mass-balance questions are deterministic and match the combined standard weights", () => {
  const activities = createActivityRegistry(chapterEightActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-08.mass-balance");
  const problemsById = new Map(massBalanceProblems.map((entry) => [entry.id, entry]));
  for (const tier of tiers) {
    for (let index = 0; index < 100; index += 1) {
      const seed = "poseidon-mass:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "measurement-balance");
      const problem = problemsById.get(question.stimulus.problemId);
      assert.ok(problem);
      assert.equal(question.stimulus.object, problem.object);
      assert.deepEqual(question.stimulus.weights, problem.weights.map((value) => answer(value, "g")));
      assert.equal(problem.weights.reduce((sum, value) => sum + value, 0), problem.massGrams);
      assert.equal(question.correctAnswer, answer(problem.massGrams, "g"));
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(question.correctAnswer));
      assert.ok(checkActivityAnswer(question.correctAnswer, answer(problem.massGrams, "g"), question.answerRules));
    }
  }
});

test("metric conversion data uses accurate length, capacity, and mass relationships", () => {
  const factors = new Map([
    ["cm:m", 0.01], ["m:cm", 100], ["L:mL", 1000], ["mL:L", 0.001],
    ["kg:g", 1000], ["g:kg", 0.001]
  ]);
  assert.equal(new Set(unitConversionProblems.map((entry) => entry.id)).size, unitConversionProblems.length);
  for (const problem of unitConversionProblems) {
    const factor = factors.get(problem.fromUnit + ":" + problem.toUnit);
    assert.ok(Number.isFinite(factor), problem.id);
    assert.ok(Math.abs(problem.sourceValue * factor - problem.resultValue) < 1e-9, problem.id);
    assert.equal(problem.choices.length, 4);
    assert.equal(new Set(problem.choices).size, 4);
    assert.ok(problem.choices.includes(answer(problem.resultValue, problem.toUnit)));
    assert.ok(problem.explanation.length > 20);
  }
  assert.equal(getUnitConversionProblems("foundation").length, 4);
  assert.equal(getUnitConversionProblems("core").length, 8);
  assert.equal(getUnitConversionProblems("stretch").length, 12);
  assert.throws(() => getUnitConversionProblems("expert"), /Unknown unit-conversion difficulty tier/);
});

test("metric-conversion questions return the selected problem's exact result and answer bank", () => {
  const activities = createActivityRegistry(chapterEightActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-08.unit-conversion");
  const problemsById = new Map(unitConversionProblems.map((entry) => [entry.id, entry]));
  for (const tier of tiers) {
    for (let index = 0; index < 100; index += 1) {
      const seed = "poseidon-convert:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "measurement-conversion");
      const problem = problemsById.get(question.stimulus.problemId);
      assert.ok(problem);
      assert.equal(question.stimulus.sourceValue, problem.sourceValue.toLocaleString("en-US"));
      assert.equal(question.stimulus.fromUnit, problem.fromUnit);
      assert.equal(question.stimulus.toUnit, problem.toUnit);
      assert.equal(question.correctAnswer, answer(problem.resultValue, problem.toUnit));
      assert.deepEqual(new Set(question.choices), new Set(problem.choices));
      assert.equal(question.choices.length, 4);
      assert.ok(checkActivityAnswer(question.correctAnswer, answer(problem.resultValue, problem.toUnit), question.answerRules));
    }
  }
});

test("elapsed-time options have age-appropriate step sizes and valid time ranges", () => {
  assert.equal(getElapsedTimeOptions("foundation").startStep, 60);
  assert.equal(getElapsedTimeOptions("core").startStep, 15);
  assert.equal(getElapsedTimeOptions("stretch").startStep, 5);
  assert.ok(getElapsedTimeOptions("foundation").durationChoices.every((value) => value % 30 === 0));
  assert.ok(getElapsedTimeOptions("core").durationChoices.every((value) => value % 15 === 0));
  assert.ok(getElapsedTimeOptions("stretch").durationChoices.every((value) => value % 5 === 0));
  assert.throws(() => getElapsedTimeOptions("expert"), /Unknown elapsed-time difficulty tier/);
});

test("elapsed-time questions calculate correct intervals and use readable 12-hour clock times", () => {
  const activities = createActivityRegistry(chapterEightActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-08.elapsed-time");
  for (const tier of tiers) {
    const allowedDurations = getElapsedTimeOptions(tier).durationChoices;
    for (let index = 0; index < 120; index += 1) {
      const seed = "poseidon-elapsed:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "measurement-elapsed-time");
      const start = clockMinutes(question.stimulus.startTime);
      const finish = clockMinutes(question.stimulus.finishTime);
      const elapsed = finish - start;
      assert.ok(elapsed > 0 && elapsed < 12 * 60);
      assert.ok(allowedDurations.includes(elapsed));
      assert.equal(question.correctAnswer, displayDuration(elapsed));
      assert.equal(question.stimulus.elapsedMinutes, elapsed);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(question.correctAnswer));
      assert.ok(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules));
    }
  }
});

test("Professor Hoot provides three helpful hint stages for every Poseidon activity", () => {
  const activityRegistry = createActivityRegistry(chapterEightActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: chapterEightHintDefinitions });
  const hints = createHintService({ activityRegistry, hintRegistry, questionGeneratorRegistry: generator });
  for (const activityId of [
    "chapter-08.volume-reading", "chapter-08.mass-balance",
    "chapter-08.unit-conversion", "chapter-08.elapsed-time"
  ]) {
    const question = generator.generate(activityRegistry.get(activityId), {
      seed: "poseidon-hint:" + activityId, tier: "core"
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

test("Chapter 8 waits for Chapter 7, resumes its checkpoint, and grants Poseidon's Tideglass only once", () => {
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const rewardRegistry = createRewardRegistry([
    chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward,
    chapterFiveReward, chapterSixReward, chapterSevenReward, chapterEightReward, chapterNineReward
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
  assert.throws(() => chapterService.createSession("chapter-08").start(), /prerequisite chapters/);

  for (const chapter of chapterDefinitions.slice(0, 7)) {
    const session = chapterService.createSession(chapter.id);
    session.start();
    for (let index = 0; index < chapter.activities.length; index += 1) session.completeActivity();
    assert.equal(session.getSnapshot().isComplete, true);
  }

  const interrupted = chapterService.createSession("chapter-08");
  interrupted.start();
  interrupted.completeActivity();
  interrupted.completeActivity();
  interrupted.exit();
  const resumed = chapterService.createSession("chapter-08");
  assert.equal(resumed.start().currentActivity.id, "chapter-08.mass-scales");
  for (let index = 2; index < chapterEightDefinition.activities.length; index += 1) resumed.completeActivity();
  assert.equal(resumed.getSnapshot().isComplete, true);
  assert.equal(resumed.getSnapshot().completionReceipt.rewards[0].reason, "reward-granted");

  const replay = chapterService.createSession("chapter-08");
  replay.start();
  for (let index = 0; index < chapterEightDefinition.activities.length; index += 1) replay.completeActivity();
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterEightReward.id], 1);
  assert.equal(economy.starGems, 600);
  assert.equal(economy.starlightSparkles, 44);
  assert.equal(chapterService.getSnapshot().chapters.find((entry) => entry.id === "chapter-08").progress.completedRuns, 2);
  store.destroy();
});
