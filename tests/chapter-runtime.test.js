import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState, mergeGameStateDefaults } from "../src/core/state/actions.js";
import { createInitialEconomyState } from "../src/systems/economy/economyState.js";
import { createRewardRegistry, createShopCatalog } from "../src/systems/economy/economyCatalogs.js";
import { createEconomyActionDefinitions } from "../src/systems/economy/economyActions.js";
import { createEconomyService } from "../src/systems/economy/createEconomyService.js";
import {
  createChapterDefinition, createChapterCatalog, validateChapterDefinition
} from "../src/gameplay/chapter-runtime/chapterCatalog.js";
import {
  createInitialChapterRuntimeState, selectChapterRuntimeProgress
} from "../src/gameplay/chapter-runtime/chapterRuntimeState.js";
import { createChapterRuntimeActionDefinitions } from "../src/gameplay/chapter-runtime/chapterRuntimeActions.js";
import { createChapterRuntimeService } from "../src/gameplay/chapter-runtime/createChapterRuntimeService.js";

const rewardDefinitions = [
  {
    id: "reward.chapter-01-star-crown",
    sourceId: "chapter-01",
    title: "Star Crown",
    starGems: 25,
    starlightSparkles: 1,
    replayPolicy: { type: "once" }
  },
  {
    id: "reward.chapter-02-moon-medal",
    sourceId: "chapter-02",
    title: "Moon Medal",
    starGems: 30,
    starlightSparkles: 2,
    replayPolicy: { type: "once" }
  }
];

const chapterOne = {
  id: "chapter-01",
  title: "The Starlight Gate",
  description: "Open the academy gate with a curious first adventure.",
  objectives: ["Explore the academy", "Practice a new skill"],
  activities: [
    { id: "chapter-01.welcome", title: "A warm welcome", type: "story", description: "Meet the academy guide." },
    { id: "chapter-01.skip-count", title: "The counting lanterns", type: "learning", description: "Count the lanterns in groups.", activityId: "math.skip-counting", skillIds: ["math.skip-counting"] },
    { id: "chapter-01.ribbon", title: "Ribbon constellation", type: "gymnastics", description: "Trace a constellation and follow its rhythm.", metadata: { routineId: "routine.starlight-ribbon" } }
  ],
  majorRewardIds: ["reward.chapter-01-star-crown"]
};

const chapterTwo = {
  id: "chapter-02",
  title: "Apollo's Musical Garden",
  description: "Use the garden's rhythm to explore fractions.",
  objectives: ["Notice equal parts"],
  activities: [
    { id: "chapter-02.story", title: "Apollo's invitation", type: "story", description: "Enter the garden." },
    { id: "chapter-02.fractions", title: "Fraction flowers", type: "challenge", description: "Build equal parts." }
  ],
  majorRewardIds: ["reward.chapter-02-moon-medal"],
  prerequisiteChapterIds: ["chapter-01"]
};

const chapters = createChapterCatalog([chapterOne, chapterTwo]);
const rewards = createRewardRegistry(rewardDefinitions);
const shop = createShopCatalog([]);

function harness(saved = null, { catalog = chapters, rewardRegistry = rewards } = {}) {
  const defaults = {
    ...createInitialGameState(),
    economy: createInitialEconomyState(),
    chapterRuntime: createInitialChapterRuntimeState()
  };
  const initialState = saved ? mergeGameStateDefaults(defaults, saved) : defaults;
  const store = createGameStore({
    initialState,
    actions: {
      ...createEconomyActionDefinitions({ rewardRegistry, shopCatalog: shop }),
      ...createChapterRuntimeActionDefinitions({ chapterCatalog: catalog })
    }
  });
  const economyService = createEconomyService({ store, rewardRegistry, shopCatalog: shop });
  const service = createChapterRuntimeService({
    store, chapterCatalog: catalog, rewardRegistry, economyService
  });
  return { store, economyService, service };
}

test("chapter definition validates a chapter-owned activity sequence and optional metadata", () => {
  const definition = createChapterDefinition(chapterOne);
  assert.equal(definition.id, chapterOne.id);
  assert.deepEqual(definition.activities.map((activity) => activity.type), ["story", "learning", "gymnastics"]);
  assert.deepEqual(definition.activities[2].metadata, { routineId: "routine.starlight-ribbon" });
  assert.equal(Object.isFrozen(definition.activities[2].metadata), true);
  assert.equal(validateChapterDefinition(chapterOne), true);
});

test("chapter definitions reject malformed IDs, empty activities, duplicate IDs, and reward gaps", () => {
  assert.throws(() => createChapterDefinition({ ...chapterOne, id: "ch-01" }), /chapter-NN/);
  assert.throws(() => createChapterDefinition({ ...chapterOne, activities: [] }), /1 to 40 activities/);
  assert.throws(() => createChapterDefinition({
    ...chapterOne,
    activities: [chapterOne.activities[0], { ...chapterOne.activities[1], id: chapterOne.activities[0].id }]
  }), /unique/);
  assert.throws(() => createChapterDefinition({ ...chapterOne, majorRewardIds: [] }), /majorRewardIds/);
  assert.throws(() => createChapterDefinition({
    ...chapterOne,
    activities: [{ ...chapterOne.activities[0], metadata: { callback() {} } }]
  }), /JSON-compatible/);
});

test("chapter catalog rejects duplicate and unknown prerequisite definitions", () => {
  assert.throws(() => createChapterCatalog([chapterOne, chapterOne]), /already registered/);
  assert.throws(() => createChapterCatalog([{ ...chapterTwo, prerequisiteChapterIds: ["chapter-03"] }]), /Unknown prerequisite/);
  assert.equal(createChapterCatalog([]).list().length, 0);
});

test("runtime exposes independent chapter sequences and prerequisite availability", () => {
  const { service } = harness();
  const snapshot = service.getSnapshot();
  assert.deepEqual(snapshot.chapters.map((chapter) => chapter.id), ["chapter-01", "chapter-02"]);
  assert.equal(snapshot.chapters[0].activities.length, 3);
  assert.equal(snapshot.chapters[1].activities.length, 2);
  assert.equal(snapshot.chapters[0].prerequisitesMet, true);
  assert.equal(snapshot.chapters[1].prerequisitesMet, false);
  assert.throws(() => service.createSession("chapter-unknown"), /Unknown chapter/);
});

test("a chapter cannot begin until all prerequisite chapters are completed", () => {
  const { service, store } = harness();
  const session = service.createSession("chapter-02");
  assert.throws(() => session.start(), /prerequisite chapters/);
  assert.equal(store.getState().chapterRuntime.chapters["chapter-02"], undefined);
});

test("activities advance in their declared order and save a checkpoint after each step", () => {
  const { service, store } = harness();
  const session = service.createSession("chapter-01");
  const started = session.start();
  assert.equal(started.status, "in-progress");
  assert.equal(started.currentActivity.id, chapterOne.activities[0].id);
  assert.equal(started.currentActivityIndex, 0);

  const next = session.completeActivity();
  assert.equal(next.currentActivityIndex, 1);
  assert.equal(next.currentActivity.id, chapterOne.activities[1].id);
  assert.deepEqual(next.activityResults, [{ activityId: chapterOne.activities[0].id, status: "completed" }]);
  assert.equal(store.getState().chapterRuntime.chapters["chapter-01"].status, "in-progress");
  assert.equal(store.getState().chapterRuntime.chapters["chapter-01"].currentActivityIndex, 1);
});

test("safe exit records the checkpoint and a fresh session resumes at the saved activity", () => {
  const first = harness();
  const session = first.service.createSession("chapter-01");
  session.start();
  session.completeActivity();
  const exited = session.exit();
  assert.equal(exited.status, "exited");
  assert.equal(first.store.getState().chapterRuntime.chapters["chapter-01"].lastExitActivityIndex, 1);

  const saved = JSON.parse(JSON.stringify(first.store.getState()));
  const restored = harness(saved);
  const resumed = restored.service.createSession("chapter-01");
  const snapshot = resumed.start();
  assert.equal(snapshot.currentActivityIndex, 1);
  assert.equal(snapshot.currentActivity.id, chapterOne.activities[1].id);
  assert.equal(snapshot.activityResults.length, 1);
});

test("skipping is a non-failing activity outcome and the completed chapter grants its major reward", () => {
  const { service, economyService } = harness();
  const session = service.createSession("chapter-01");
  session.start();
  session.skipActivity();
  session.completeActivity();
  const finished = session.completeActivity();

  assert.equal(finished.status, "completed");
  assert.equal(finished.isComplete, true);
  assert.equal(finished.currentActivity, null);
  assert.equal(finished.completedActivityCount, 2);
  assert.equal(finished.skippedActivityCount, 1);
  assert.equal(finished.completionReceipt.completed, true);
  assert.equal(finished.completionReceipt.rewards[0].granted, true);
  assert.deepEqual(economyService.getBalance(), { starGems: 25, starlightSparkles: 1 });
  assert.equal(economyService.getState().rewardClaims["reward.chapter-01-star-crown"], 1);
});

test("replaying preserves the previous run and cannot claim a chapter reward twice", () => {
  const { service, economyService } = harness();
  const first = service.createSession("chapter-01");
  first.start();
  first.completeActivity();
  first.completeActivity();
  first.completeActivity();
  assert.equal(first.getSnapshot().status, "completed");

  const replay = service.createSession("chapter-01");
  assert.equal(replay.start().currentActivityIndex, 0);
  replay.skipActivity();
  replay.skipActivity();
  const final = replay.skipActivity();
  assert.equal(final.status, "completed");
  assert.equal(final.completionReceipt.rewards[0].granted, false);
  assert.equal(final.completionReceipt.rewards[0].reason, "already-claimed");

  const progress = service.getProgress().chapters["chapter-01"];
  assert.equal(progress.completedRuns, 2);
  assert.equal(progress.lastRun.skippedActivityCount, 3);
  assert.equal(progress.recentRuns.length, 2);
  assert.equal(economyService.getBalance().starGems, 25);
  assert.equal(economyService.getState().rewardClaims["reward.chapter-01-star-crown"], 1);
});

test("a completed prerequisite unlocks the next chapter", () => {
  const { service } = harness();
  const first = service.createSession("chapter-01");
  first.start();
  first.skipActivity();
  first.skipActivity();
  first.skipActivity();
  assert.equal(service.getSnapshot().chapters[1].prerequisitesMet, true);

  const second = service.createSession("chapter-02");
  assert.equal(second.start().currentActivity.id, chapterTwo.activities[0].id);
});

test("checkpoints cannot erase completed activities or save a full chapter without completion", () => {
  const { service, store } = harness();
  const session = service.createSession("chapter-01");
  session.start();
  session.completeActivity();
  const before = store.getState();
  assert.equal(store.dispatch({
    type: "chapters/checkpoint-saved",
    payload: { chapterId: "chapter-01", activityResults: [] }
  }).changed, false);
  assert.equal(store.getState(), before);
  assert.throws(() => store.dispatch({
    type: "chapters/checkpoint-saved",
    payload: {
      chapterId: "chapter-01",
      activityResults: chapterOne.activities.map((activity) => ({ activityId: activity.id, status: "completed" }))
    }
  }), /final activity must complete the chapter/);
});

test("chapter completion action cannot be dispatched before its preceding ordered checkpoint", () => {
  const { store } = harness();
  assert.throws(() => store.dispatch({
    type: "chapters/chapter-completed",
    payload: {
      chapterId: "chapter-01",
      activityResults: chapterOne.activities.map((activity) => ({ activityId: activity.id, status: "completed" }))
    }
  }), /ordered chapter activity/);
});

test("major rewards must exist, match their chapter source, and use a once-only policy", () => {
  const wrongSource = createRewardRegistry([{
    ...rewardDefinitions[0], sourceId: "chapter-02"
  }]);
  const onceEconomyStore = harness();
  assert.throws(() => createChapterRuntimeService({
    store: onceEconomyStore.store,
    chapterCatalog: chapters,
    rewardRegistry: wrongSource,
    economyService: onceEconomyStore.economyService
  }), /chapter as sourceId/);

  const repeatReward = createRewardRegistry([{
    ...rewardDefinitions[0], replayPolicy: { type: "capped", maxClaims: 2 }
  }]);
  assert.throws(() => createChapterRuntimeService({
    store: onceEconomyStore.store,
    chapterCatalog: createChapterCatalog([chapterOne]),
    rewardRegistry: repeatReward,
    economyService: onceEconomyStore.economyService
  }), /once-only/);
});

test("chapter progress survives save export/import shape and malformed saved data is normalized", () => {
  const first = harness();
  const session = first.service.createSession("chapter-01");
  session.start();
  session.completeActivity();
  session.skipActivity();
  const saved = JSON.parse(JSON.stringify(first.store.getState()));
  const restored = harness(saved);
  const progress = restored.service.getProgress().chapters["chapter-01"];
  assert.equal(progress.currentActivityIndex, 2);
  assert.deepEqual(progress.activityResults, [
    { activityId: chapterOne.activities[0].id, status: "completed" },
    { activityId: chapterOne.activities[1].id, status: "skipped" }
  ]);

  const legacy = mergeGameStateDefaults({
    ...createInitialGameState(),
    chapterRuntime: createInitialChapterRuntimeState()
  }, { app: { screenId: "academy" } });
  assert.deepEqual(selectChapterRuntimeProgress(legacy, chapters).chapters["chapter-01"].activityResults, []);

  const damaged = selectChapterRuntimeProgress({
    chapterRuntime: {
      chapters: {
        "chapter-01": {
          status: "in-progress",
          activityResults: [
            { activityId: chapterOne.activities[0].id, status: "completed" },
            { activityId: "unknown", status: "completed" },
            { activityId: chapterOne.activities[2].id, status: "skipped" }
          ]
        }
      }
    }
  }, chapters).chapters["chapter-01"];
  assert.equal(damaged.currentActivityIndex, 1);
  assert.equal(damaged.activityResults.length, 1);
});

test("chapter service and catalog reject unknown or invalid dependencies at construction", () => {
  const { store, economyService } = harness();
  assert.throws(() => createChapterRuntimeService({
    store,
    chapterCatalog: chapters,
    rewardRegistry: createRewardRegistry([]),
    economyService
  }), /unregistered major reward/);
});
