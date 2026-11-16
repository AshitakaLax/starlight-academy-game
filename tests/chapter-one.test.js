import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState } from "../src/core/state/actions.js";
import { createInitialEconomyState, selectEconomy } from "../src/systems/economy/economyState.js";
import { createRewardRegistry, createShopCatalog } from "../src/systems/economy/economyCatalogs.js";
import { createEconomyActionDefinitions } from "../src/systems/economy/economyActions.js";
import { createEconomyService } from "../src/systems/economy/createEconomyService.js";
import { createWardrobeCatalog, defaultWardrobeItems } from "../src/gameplay/wardrobe/wardrobeCatalog.js";
import { createInitialWardrobeState } from "../src/gameplay/wardrobe/wardrobeState.js";
import { createWardrobeActionDefinitions } from "../src/gameplay/wardrobe/wardrobeActions.js";
import { createWardrobeService } from "../src/gameplay/wardrobe/createWardrobeService.js";
import { createActivityRegistry } from "../src/systems/curriculum/activityDefinitions.js";
import { createQuestionGeneratorRegistry } from "../src/systems/curriculum/questionGenerators.js";
import { checkActivityAnswer } from "../src/systems/curriculum/answerRules.js";
import { createInitialCurriculumProgress, curriculumActionDefinitions } from "../src/systems/curriculum/curriculumProgress.js";
import { createHintRegistry } from "../src/systems/hints/createHintRegistry.js";
import { createHintService } from "../src/systems/hints/createHintService.js";
import { createChapterCatalog, validateChapterDefinition } from "../src/gameplay/chapter-runtime/chapterCatalog.js";
import { createInitialChapterRuntimeState } from "../src/gameplay/chapter-runtime/chapterRuntimeState.js";
import { createChapterRuntimeActionDefinitions } from "../src/gameplay/chapter-runtime/chapterRuntimeActions.js";
import { createChapterRuntimeService } from "../src/gameplay/chapter-runtime/createChapterRuntimeService.js";
import {
  chapterOneActivityDefinitions,
  chapterOneDefinition,
  chapterOneHintDefinitions,
  chapterOneReward
} from "../src/chapters/chapterOne.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";
import { chapterTwoDefinition, chapterTwoReward } from "../src/chapters/chapterTwo.js";
import { chapterThreeDefinition, chapterThreeReward } from "../src/chapters/chapterThree.js";
import { chapterFourDefinition, chapterFourReward } from "../src/chapters/chapterFour.js";
import { chapterFiveReward } from "../src/chapters/chapterFive.js";
import { chapterSixReward } from "../src/chapters/chapterSix.js";
import { chapterSevenReward } from "../src/chapters/chapterSeven.js";
import { chapterEightReward } from "../src/chapters/chapterEight.js";
import { chapterNineReward } from "../src/chapters/chapterNine.js";
import { createGymnasticsRoutineCatalog, defaultGymnasticsRoutines } from "../src/gameplay/gymnastics/gymnasticsCatalog.js";
import { createGymnasticsEngine } from "../src/gameplay/gymnastics/gymnasticsEngine.js";
import { gameConfig } from "../src/config/gameConfig.js";

test("Chapter 1 is registered as a five-part story, math, challenge, and movement adventure", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06", "chapter-07", "chapter-08", "chapter-09"]);
  assert.equal(getChapterDefinition("chapter-01"), chapterOneDefinition);
  assert.equal(getChapterDefinition("chapter-02"), chapterTwoDefinition);
  assert.equal(getChapterDefinition("chapter-03"), chapterThreeDefinition);
  assert.equal(getChapterDefinition("chapter-04"), chapterFourDefinition);
  assert.equal(validateChapterDefinition(chapterOneDefinition), true);
  assert.deepEqual(chapterOneDefinition.activities.map((activity) => activity.type), [
    "story", "learning", "challenge", "gymnastics", "story"
  ]);
  assert.equal(chapterOneDefinition.activities[1].activityId, "chapter-01.skip-counting");
  assert.equal(chapterOneDefinition.activities[2].metadata.questionCount, 3);
  assert.equal(chapterOneDefinition.activities[3].metadata.routineId, "routine.starlight-ribbon");
  assert.ok(chapterOneDefinition.activities.every((activity) => activity.description.length > 10));
});

test("Chapter 1 skill activities generate supported, deterministic tiered questions", () => {
  const activityRegistry = createActivityRegistry(chapterOneActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const skip = activityRegistry.get("chapter-01.skip-counting");
  const multiplication = activityRegistry.get("chapter-01.multiplication-challenge");
  for (const tier of ["foundation", "core", "stretch"]) {
    const first = generator.generate(skip, { seed: "chapter-one:" + tier, tier });
    const again = generator.generate(skip, { seed: "chapter-one:" + tier, tier });
    assert.deepEqual(first, again);
    assert.equal(first.stimulus.sequence.length, tier === "foundation" ? 3 : tier === "core" ? 4 : 5);
    assert.ok(checkActivityAnswer(first.correctAnswer, first.correctAnswer, first.answerRules));

    const math = generator.generate(multiplication, { seed: "lantern-relay:" + tier, tier });
    assert.equal(math.choices.length, 4);
    assert.ok(math.choices.includes(math.correctAnswer));
    assert.ok(checkActivityAnswer(String(math.correctAnswer), math.correctAnswer, math.answerRules));
  }
});

test("Chapter 1 Professor Hoot clues advance through nudge, strategy, and a worked example", () => {
  const activityRegistry = createActivityRegistry(chapterOneActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: chapterOneHintDefinitions });
  const hints = createHintService({ activityRegistry, hintRegistry, questionGeneratorRegistry: generator });
  const activity = activityRegistry.get("chapter-01.multiplication-challenge");
  const question = generator.generate(activity, { seed: "hoot-demo", tier: "core" });
  const nudge = hints.requestHint(question);
  const strategy = hints.recordIncorrect(question);
  const demonstration = hints.recordIncorrect(question);
  assert.equal(nudge.stage, 1);
  assert.equal(strategy.stage, 1);
  assert.equal(demonstration.stage, 2);
  const workedExample = hints.recordIncorrect(question);
  assert.equal(workedExample.stage, 3);
  assert.ok(workedExample.demonstration.steps.length >= 2);
  assert.equal(hints.getSession(question.id).canComplete, true);
  assert.equal(hints.complete(question.id).completed, true);
});

test("Chapter 1 saves and resumes, then grants its keepsake and chapter wardrobe item only once", () => {
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const rewardRegistry = createRewardRegistry([chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward, chapterFiveReward, chapterSixReward, chapterSevenReward, chapterEightReward, chapterNineReward]);
  const shopCatalog = createShopCatalog([]);
  const wardrobeCatalog = createWardrobeCatalog(defaultWardrobeItems);
  const economyActions = createEconomyActionDefinitions({ rewardRegistry, shopCatalog });
  const wardrobeActions = createWardrobeActionDefinitions({ wardrobeCatalog, economyActionDefinitions: economyActions });
  const store = createGameStore({
    initialState: {
      ...createInitialGameState(),
      curriculum: createInitialCurriculumProgress(),
      economy: createInitialEconomyState(),
      wardrobe: createInitialWardrobeState(wardrobeCatalog),
      chapterRuntime: createInitialChapterRuntimeState()
    },
    actions: {
      ...curriculumActionDefinitions,
      ...economyActions,
      ...wardrobeActions,
      ...createChapterRuntimeActionDefinitions({ chapterCatalog })
    }
  });
  const economyService = createEconomyService({ store, rewardRegistry, shopCatalog });
  const wardrobeService = createWardrobeService({ store, wardrobeCatalog });
  const chapterService = createChapterRuntimeService({ store, chapterCatalog, rewardRegistry, economyService, wardrobeService });

  const firstRun = chapterService.createSession("chapter-01");
  firstRun.start();
  firstRun.completeActivity();
  firstRun.completeActivity();
  firstRun.exit();

  const resumed = chapterService.createSession("chapter-01");
  assert.equal(resumed.start().currentActivity.id, "chapter-01.lantern-relay");
  resumed.completeActivity();
  resumed.completeActivity();
  const completed = resumed.completeActivity();
  assert.equal(completed.isComplete, true);
  assert.equal(completed.completedActivityCount, 5);
  assert.equal(completed.completionReceipt.rewards[0].granted, true);
  assert.equal(completed.completionReceipt.rewards[0].reason, "reward-granted");
  assert.deepEqual(completed.completionReceipt.wardrobe.unlockedItemIds, ["wardrobe.comet-dance-dress"]);
  assert.equal(wardrobeService.getInventory().find((item) => item.id === "wardrobe.comet-dance-dress").ownership.sourceType, "chapter");

  const replay = chapterService.createSession("chapter-01");
  replay.start();
  for (let index = 0; index < chapterOneDefinition.activities.length; index += 1) replay.completeActivity();
  assert.equal(replay.getSnapshot().isComplete, true);
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  assert.deepEqual(replay.getSnapshot().completionReceipt.wardrobe.alreadyOwnedItemIds, ["wardrobe.comet-dance-dress"]);
  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterOneReward.id], 1);
  assert.equal(economy.starGems, 40);
  assert.equal(economy.starlightSparkles, 2);
  assert.equal(chapterService.getSnapshot().chapters[0].progress.completedRuns, 2);
  store.destroy();
});

test("Chapter 1's authored gymnastics step uses the playable ribbon routine and completes on its own rules", () => {
  const routineCatalog = createGymnasticsRoutineCatalog(defaultGymnasticsRoutines);
  const routineId = chapterOneDefinition.activities.find((activity) => activity.type === "gymnastics").metadata.routineId;
  const routine = routineCatalog.get(routineId);
  assert.ok(routine);
  const engine = createGymnasticsEngine({ routine, config: gameConfig.gymnastics });
  const beatInterval = 60000 / routine.bpm;
  const countInDuration = routine.countInBeats * beatInterval;
  engine.start(0);
  assert.equal(engine.update(countInDuration + 1).stage, "tracing");
  for (const point of routine.tracePath) engine.recordTracePoint(point);
  const rhythmStart = countInDuration + 2;
  assert.equal(engine.finishTrace(rhythmStart).stage, "rhythm");
  for (const beat of routine.beatCheckpoints) {
    assert.equal(engine.tapBeat(rhythmStart + beat * beatInterval).accepted, true);
  }
  const completed = engine.update(
    rhythmStart + routine.beatCheckpoints.at(-1) * beatInterval + gameConfig.gymnastics.timingWindowMs + 1
  );
  assert.equal(completed.stage, "completed");
  assert.equal(completed.completed, true);
  assert.equal(completed.traceAccuracyScore, 100);
  assert.equal(completed.rhythmTimingScore, 100);
  assert.equal(completed.starRating, 3);
});
