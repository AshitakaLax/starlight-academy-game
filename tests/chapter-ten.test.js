import test from "node:test";
import assert from "node:assert/strict";
import { createActivityRegistry } from "../src/systems/curriculum/activityDefinitions.js";
import { createQuestionGeneratorRegistry } from "../src/systems/curriculum/questionGenerators.js";
import { checkActivityAnswer } from "../src/systems/curriculum/answerRules.js";
import { getSkillDefinition } from "../src/systems/curriculum/skillRegistry.js";
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
import { chapterOneActivityDefinitions, chapterOneReward } from "../src/chapters/chapterOne.js";
import { chapterTwoActivityDefinitions, chapterTwoReward } from "../src/chapters/chapterTwo.js";
import { chapterThreeActivityDefinitions, chapterThreeReward } from "../src/chapters/chapterThree.js";
import { chapterFourActivityDefinitions, chapterFourReward } from "../src/chapters/chapterFour.js";
import { chapterFiveActivityDefinitions, chapterFiveReward } from "../src/chapters/chapterFive.js";
import { chapterSixActivityDefinitions, chapterSixReward } from "../src/chapters/chapterSix.js";
import { chapterSevenActivityDefinitions, chapterSevenReward } from "../src/chapters/chapterSeven.js";
import { chapterEightActivityDefinitions, chapterEightReward } from "../src/chapters/chapterEight.js";
import { chapterNineActivityDefinitions, chapterNineReward } from "../src/chapters/chapterNine.js";
import { chapterTenDefinition, chapterTenReward } from "../src/chapters/chapterTen.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";
import { grandStarlightSampler, grandStarlightSubjectOrder } from "../src/data/championshipSampler.js";

const activityRegistry = createActivityRegistry([
  ...chapterOneActivityDefinitions,
  ...chapterTwoActivityDefinitions,
  ...chapterThreeActivityDefinitions,
  ...chapterFourActivityDefinitions,
  ...chapterFiveActivityDefinitions,
  ...chapterSixActivityDefinitions,
  ...chapterSevenActivityDefinitions,
  ...chapterEightActivityDefinitions,
  ...chapterNineActivityDefinitions
]);

const allRewards = [
  chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward,
  chapterFiveReward, chapterSixReward, chapterSevenReward, chapterEightReward,
  chapterNineReward, chapterTenReward
];

test("Chapter 10 is registered after Chapter 9 and validates as the final championship", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), [
    "chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05",
    "chapter-06", "chapter-07", "chapter-08", "chapter-09", "chapter-10"
  ]);
  assert.equal(getChapterDefinition("chapter-10"), chapterTenDefinition);
  assert.equal(validateChapterDefinition(chapterTenDefinition), true);
  assert.deepEqual(chapterTenDefinition.prerequisiteChapterIds, ["chapter-09"]);
  assert.equal(chapterTenReward.sourceId, "chapter-10");
  assert.deepEqual(chapterTenReward.replayPolicy, { type: "once" });
  assert.equal(chapterTenReward.starGems, 150);
  assert.equal(chapterTenReward.starlightSparkles, 12);
});

test("the 12-event sampler is evenly balanced by subject and never repeats a skill", () => {
  assert.equal(grandStarlightSampler.length, 12);
  assert.deepEqual(grandStarlightSubjectOrder, ["mathematics", "science", "language-arts"]);

  const subjectCounts = Object.fromEntries(grandStarlightSubjectOrder.map((subject) => [subject, 0]));
  const skillIds = new Set();
  for (const event of grandStarlightSampler) {
    const skill = getSkillDefinition(event.skillId);
    assert.ok(skill, event.id + " must use a registered skill");
    assert.equal(skill.subject, event.subject, event.id + " subject must match its skill");
    subjectCounts[event.subject] += 1;
    assert.equal(skillIds.has(event.skillId), false, event.skillId + " must appear only once");
    skillIds.add(event.skillId);

    const activity = activityRegistry.get(event.activityId);
    assert.ok(activity, event.id + " must reuse a registered learning activity");
    assert.deepEqual(activity.skillIds, [event.skillId], event.id + " must preserve its original skill mapping");
  }
  assert.deepEqual(subjectCounts, { mathematics: 4, science: 4, "language-arts": 4 });
  assert.equal(skillIds.size, grandStarlightSampler.length);
  assert.deepEqual(
    chapterTenDefinition.activities.filter((activity) => grandStarlightSampler.some((event) => event.id === activity.id))
      .map((activity) => activity.id),
    grandStarlightSampler.map((event) => event.id)
  );
});

test("every championship sample reuses a deterministic tiered question and original answer rules", () => {
  const generators = createQuestionGeneratorRegistry();
  for (const event of grandStarlightSampler) {
    const activity = activityRegistry.get(event.activityId);
    for (const tier of ["foundation", "core", "stretch"]) {
      const options = { seed: "grand-starlight:" + event.id + ":" + tier, tier };
      const question = generators.generate(activity, options);
      const repeated = generators.generate(activity, options);
      assert.deepEqual(repeated, question, event.id + " should remain deterministic at " + tier);
      assert.deepEqual(question.skillIds, [event.skillId]);
      assert.equal(question.prompt.length > 0, true);
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
  }
});

test("the finale places gymnastics before a live academy character, outfit, pet, and score showcase", () => {
  const routine = chapterTenDefinition.activities.find((activity) => activity.type === "gymnastics");
  const showcase = chapterTenDefinition.activities.find((activity) => activity.metadata.showcase === "grand-starlight");
  assert.ok(routine);
  assert.equal(routine.metadata.routineId, "routine.starlight-ribbon");
  assert.ok(showcase);
  assert.equal(showcase.type, "reflection");
  assert.equal(showcase.metadata.routineId, routine.metadata.routineId);
  assert.ok(chapterTenDefinition.activities.indexOf(routine) < chapterTenDefinition.activities.indexOf(showcase));
});

test("Chapter 10 waits for Chapter 9, resumes its checkpoint, and awards the Grand Starlight Crown only once", () => {
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const rewardRegistry = createRewardRegistry(allRewards);
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
  const chapterService = createChapterRuntimeService({ store, chapterCatalog, rewardRegistry, economyService });

  assert.throws(() => chapterService.createSession("chapter-10").start(), /prerequisite chapters/);
  for (const chapter of chapterDefinitions.slice(0, 9)) {
    const session = chapterService.createSession(chapter.id);
    session.start();
    for (let index = 0; index < chapter.activities.length; index += 1) session.completeActivity();
    assert.equal(session.getSnapshot().isComplete, true, chapter.id + " should be completable");
  }

  const interrupted = chapterService.createSession("chapter-10");
  interrupted.start();
  interrupted.completeActivity();
  interrupted.completeActivity();
  interrupted.exit();

  const resumed = chapterService.createSession("chapter-10");
  assert.equal(resumed.start().currentActivity.id, chapterTenDefinition.activities[2].id);
  for (let index = 2; index < chapterTenDefinition.activities.length; index += 1) resumed.completeActivity();
  assert.equal(resumed.getSnapshot().isComplete, true);
  assert.equal(resumed.getSnapshot().completionReceipt.rewards[0].reason, "reward-granted");

  const replay = chapterService.createSession("chapter-10");
  replay.start();
  for (let index = 0; index < chapterTenDefinition.activities.length; index += 1) replay.completeActivity();
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  assert.equal(selectEconomy(store.getState()).rewardClaims[chapterTenReward.id], 1);
  assert.equal(chapterService.getSnapshot().chapters.find((chapter) => chapter.id === "chapter-10").progress.completedRuns, 2);
  store.destroy();
});
