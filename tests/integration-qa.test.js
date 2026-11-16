import test from "node:test";
import assert from "node:assert/strict";

import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState, mergeGameStateDefaults } from "../src/core/state/actions.js";
import { createSaveManager } from "../src/core/save/createSaveManager.js";
import { createSaveService } from "../src/core/save/createSaveService.js";
import { gameConfig } from "../src/config/gameConfig.js";
import { createAcademyContentRegistries } from "../src/validation/academyContent.js";
import { createInitialCurriculumProgress, curriculumActionDefinitions, selectSkillProgress } from "../src/systems/curriculum/curriculumProgress.js";
import { checkActivityAnswer } from "../src/systems/curriculum/answerRules.js";
import { createInitialEconomyState, selectEconomy } from "../src/systems/economy/economyState.js";
import { createEconomyActionDefinitions } from "../src/systems/economy/economyActions.js";
import { createEconomyService } from "../src/systems/economy/createEconomyService.js";
import { createShopCatalog } from "../src/systems/economy/economyCatalogs.js";
import { createWardrobeCatalog, createWardrobeShopCatalog, defaultWardrobeItems } from "../src/gameplay/wardrobe/wardrobeCatalog.js";
import { createInitialWardrobeState, selectWardrobe } from "../src/gameplay/wardrobe/wardrobeState.js";
import { createWardrobeActionDefinitions } from "../src/gameplay/wardrobe/wardrobeActions.js";
import { createWardrobeService } from "../src/gameplay/wardrobe/createWardrobeService.js";
import { createPetCatalog, defaultPetDefinitions } from "../src/gameplay/pets/petCatalog.js";
import { createInitialPetCollectionState } from "../src/gameplay/pets/petCollectionState.js";
import { createPetActionDefinitions } from "../src/gameplay/pets/petActions.js";
import { createPetCollectionService } from "../src/gameplay/pets/createPetCollectionService.js";
import { createInitialChapterRuntimeState } from "../src/gameplay/chapter-runtime/chapterRuntimeState.js";
import { createChapterRuntimeActionDefinitions } from "../src/gameplay/chapter-runtime/chapterRuntimeActions.js";
import { createChapterRuntimeService } from "../src/gameplay/chapter-runtime/createChapterRuntimeService.js";
import { createGymnasticsRoutineCatalog, defaultGymnasticsRoutines } from "../src/gameplay/gymnastics/gymnasticsCatalog.js";
import { createInitialGymnasticsState } from "../src/gameplay/gymnastics/gymnasticsState.js";
import { createGymnasticsActionDefinitions } from "../src/gameplay/gymnastics/gymnasticsActions.js";
import { createGymnasticsService } from "../src/gameplay/gymnastics/createGymnasticsService.js";
import { createHintService } from "../src/systems/hints/createHintService.js";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

function createIntegrationHarness(storage = new MemoryStorage(), savedState = null) {
  const content = createAcademyContentRegistries();
  const wardrobeCatalog = createWardrobeCatalog(defaultWardrobeItems);
  const petCatalog = createPetCatalog(defaultPetDefinitions);
  const gymnasticsRoutineCatalog = createGymnasticsRoutineCatalog(defaultGymnasticsRoutines);
  const shopCatalog = createShopCatalog(createWardrobeShopCatalog(wardrobeCatalog));
  const economyActions = createEconomyActionDefinitions({
    rewardRegistry: content.rewardRegistry,
    shopCatalog
  });
  const initialState = {
    ...createInitialGameState(),
    curriculum: createInitialCurriculumProgress(),
    economy: createInitialEconomyState(),
    wardrobe: createInitialWardrobeState(wardrobeCatalog),
    petCollection: createInitialPetCollectionState(petCatalog),
    gymnastics: createInitialGymnasticsState(),
    chapterRuntime: createInitialChapterRuntimeState()
  };
  const store = createGameStore({
    initialState: savedState ? mergeGameStateDefaults(initialState, savedState) : initialState,
    actions: {
      ...curriculumActionDefinitions,
      ...economyActions,
      ...createWardrobeActionDefinitions({ wardrobeCatalog, economyActionDefinitions: economyActions }),
      ...createPetActionDefinitions({ petCatalog }),
      ...createGymnasticsActionDefinitions({ routineCatalog: gymnasticsRoutineCatalog }),
      ...createChapterRuntimeActionDefinitions({ chapterCatalog: content.chapterCatalog })
    }
  });
  const economyService = createEconomyService({
    store, rewardRegistry: content.rewardRegistry, shopCatalog
  });
  const wardrobeService = createWardrobeService({ store, wardrobeCatalog });
  const petCollectionService = createPetCollectionService({ store, petCatalog });
  const gymnasticsService = createGymnasticsService({ store, routineCatalog: gymnasticsRoutineCatalog });
  const chapterRuntimeService = createChapterRuntimeService({
    store,
    chapterCatalog: content.chapterCatalog,
    rewardRegistry: content.rewardRegistry,
    economyService,
    wardrobeService
  });
  const hintService = createHintService({
    activityRegistry: content.activityRegistry,
    hintRegistry: content.hintRegistry,
    questionGeneratorRegistry: content.questionGeneratorRegistry
  });
  const saveManager = createSaveManager({
    storage,
    storageKey: "starlight-academy.integration",
    schemaVersion: gameConfig.persistence.schemaVersion,
    autosaveDelayMs: 60_000
  });
  const saveService = createSaveService({
    store,
    saveManager,
    normalizeRestoredState: (restored) => mergeGameStateDefaults(initialState, restored)
  });

  return {
    content, store, economyService, wardrobeService, petCollectionService,
    gymnasticsService, chapterRuntimeService, hintService, saveManager, saveService,
    wardrobeCatalog, petCatalog, gymnasticsRoutineCatalog
  };
}

function finishProgression(runtime, progressionId, { skipIndex = -1 } = {}) {
  const session = runtime.createSession(progressionId);
  let snapshot = session.start();
  while (!snapshot.isComplete) {
    snapshot = snapshot.currentActivityIndex === skipIndex
      ? session.skipActivity()
      : session.completeActivity();
  }
  return session;
}

test("full academy journey integrates all chapters, optional quests, replay, rewards, wardrobe, pets, and save restore", async () => {
  const original = createIntegrationHarness();
  await original.saveService.start();

  assert.equal(original.content.validation.chapters, 10);
  assert.equal(original.content.validation.quests, 20);
  assert.equal(original.chapterRuntimeService.getSnapshot().chapters.length, 30);
  assert.throws(() => original.chapterRuntimeService.createSession("chapter-02").start(), /prerequisite chapters/);

  // Interrupt and safely resume Chapter 1. A skipped learning activity remains
  // a non-failing outcome, but it lowers that run's star score.
  const interrupted = original.chapterRuntimeService.createSession("chapter-01");
  let chapterOne = interrupted.start();
  chapterOne = interrupted.completeActivity();
  assert.equal(chapterOne.currentActivityIndex, 1);
  interrupted.saveCheckpoint();
  interrupted.exit();

  const resumed = original.chapterRuntimeService.createSession("chapter-01");
  chapterOne = resumed.start();
  assert.equal(chapterOne.currentActivityIndex, 1);
  while (!chapterOne.isComplete) {
    chapterOne = chapterOne.currentActivityIndex === 1
      ? resumed.skipActivity()
      : resumed.completeActivity();
  }
  assert.equal(chapterOne.completionReceipt.rewards[0].reason, "reward-granted");
  assert.equal(chapterOne.completionReceipt.personalBest.scorePercent, 80);
  assert.equal(original.chapterRuntimeService.getSnapshot().chapters.find((item) => item.id === "quest-01").prerequisitesMet, true);

  // Replaying with a stronger run improves, rather than resets, the saved best.
  const chapterOneReplay = finishProgression(original.chapterRuntimeService, "chapter-01");
  assert.equal(chapterOneReplay.getSnapshot().completionReceipt.personalBestImproved, true);
  assert.equal(chapterOneReplay.getSnapshot().completionReceipt.personalBest.scorePercent, 100);
  assert.equal(chapterOneReplay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");

  for (let number = 2; number <= 10; number += 1) {
    const id = "chapter-" + String(number).padStart(2, "0");
    const session = finishProgression(original.chapterRuntimeService, id);
    assert.equal(session.getSnapshot().isComplete, true, id + " should complete its full authored sequence.");
  }

  // Chapter-linked companions unlock only after their corresponding chapter
  // milestones have been completed; all care tracks are positive-only.
  assert.equal(original.petCollectionService.unlockPet("pet.phoenix", "chapter-02").unlocked, true);
  assert.equal(original.petCollectionService.unlockPet("pet.nymph-kitten", "chapter-05").unlocked, true);
  original.petCollectionService.setAppearancePalette("pet.phoenix", "ember");
  original.petCollectionService.setAppearancePalette("pet.nymph-kitten", "mossy-meadow");
  original.petCollectionService.selectActivePet("pet.phoenix");
  const phoenixCare = original.petCollectionService.performCare("pet.phoenix", "feeding");
  assert.equal(phoenixCare.progressAfter, 35);
  assert.equal(phoenixCare.bondExperienceGained, 5);
  original.petCollectionService.selectActivePet("pet.nymph-kitten");
  original.petCollectionService.performCare("pet.nymph-kitten", "grooming");
  const petSnapshot = original.petCollectionService.getSnapshot();
  assert.equal(petSnapshot.pets.find((pet) => pet.id === "pet.phoenix").careProgress.feeding, 35);
  assert.equal(petSnapshot.pets.find((pet) => pet.id === "pet.phoenix").appearance.paletteId, "ember");
  assert.equal(petSnapshot.pets.find((pet) => pet.id === "pet.nymph-kitten").careProgress.grooming, 25);

  // All optional quests become available after their source chapter is done.
  for (const quest of original.content.sideQuestDefinitions) {
    const entry = original.chapterRuntimeService.getSnapshot().chapters.find((item) => item.id === quest.id);
    assert.equal(entry.prerequisitesMet, true, quest.id + " should be unlocked by its source chapter.");
    const session = finishProgression(original.chapterRuntimeService, quest.id);
    assert.equal(session.getSnapshot().isComplete, true, quest.id + " should complete.");
    assert.equal(session.getSnapshot().completionReceipt.rewards[0].reason, "reward-granted", quest.id);
  }

  // Catalog-priced cosmetic purchase debits once, and equipment requires ownership.
  const purchase = original.wardrobeService.purchaseItem("wardrobe.moonbeam-bow");
  assert.equal(purchase.purchased, true);
  assert.equal(purchase.starGems, 2160);
  assert.equal(original.wardrobeService.purchaseItem("wardrobe.moonbeam-bow").reason, "already-owned");
  assert.equal(original.wardrobeService.equipItem("wardrobe.moonbeam-bow").equipped, true);
  assert.equal(selectWardrobe(original.store.getState()).equipped.accessory, "wardrobe.moonbeam-bow");
  assert.equal(original.wardrobeService.equipItem("wardrobe.comet-dance-dress").equipped, true);

  const economyBeforeExport = selectEconomy(original.store.getState());
  assert.equal(economyBeforeExport.starGems, 2160);
  assert.equal(economyBeforeExport.starlightSparkles, 153);
  assert.equal(Object.keys(economyBeforeExport.rewardClaims).length, 30);
  for (const reward of original.content.rewardRegistry.list()) {
    assert.equal(economyBeforeExport.rewardClaims[reward.id], 1, reward.id + " should be claimable once.");
  }
  assert.ok(economyBeforeExport.starGems >= 0);
  assert.ok(economyBeforeExport.starlightSparkles >= 0);

  // Export and import through the real Save Service into a fresh store.
  original.saveService.saveCheckpoint();
  const exported = original.saveService.export();
  const restored = createIntegrationHarness();
  await restored.saveService.start();
  const preview = restored.saveService.previewImport(exported);
  assert.equal(preview.hasExistingSave, false);
  restored.saveService.import(exported);

  const restoredEconomy = selectEconomy(restored.store.getState());
  assert.equal(restoredEconomy.starGems, 2160);
  assert.equal(restoredEconomy.starlightSparkles, 153);
  assert.equal(restoredEconomy.rewardClaims["reward.chapter-01-starfall-circlet"], 1);
  assert.equal(restored.petCollectionService.getSnapshot().activePetId, "pet.nymph-kitten");
  assert.equal(restored.petCollectionService.getPet("pet.phoenix").appearance.paletteId, "ember");
  assert.equal(restored.wardrobeService.getEquipped().find((slot) => slot.slot === "accessory").itemId, "wardrobe.moonbeam-bow");
  assert.equal(restored.chapterRuntimeService.getSnapshot().chapters.filter((item) => item.progress.status === "completed").length, 30);

  // Lower-quality replays must not erase the all-complete personal best or pay
  // a second time. They also retain the completed record after import.
  const lowerChapterReplay = finishProgression(restored.chapterRuntimeService, "chapter-01", { skipIndex: 0 });
  assert.equal(lowerChapterReplay.getSnapshot().completionReceipt.personalBest.scorePercent, 100);
  assert.equal(lowerChapterReplay.getSnapshot().completionReceipt.personalBestImproved, false);
  const lowerQuestReplay = finishProgression(restored.chapterRuntimeService, "quest-01", { skipIndex: 0 });
  assert.equal(lowerQuestReplay.getSnapshot().completionReceipt.personalBest.scorePercent, 100);
  assert.equal(lowerQuestReplay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  const finalEconomy = selectEconomy(restored.store.getState());
  assert.equal(finalEconomy.rewardClaims["reward.chapter-01-starfall-circlet"], 1);
  assert.equal(finalEconomy.rewardClaims["reward.quest-01-firefly-pattern-pin"], 1);
  assert.equal(finalEconomy.starGems, 2160);
  assert.equal(restored.chapterRuntimeService.getSnapshot().chapters.find((item) => item.id === "chapter-01").progress.completedRuns, 3);
  assert.equal(restored.chapterRuntimeService.getSnapshot().chapters.find((item) => item.id === "quest-01").progress.completedRuns, 2);

  await original.saveService.stop();
  await restored.saveService.stop();
  original.store.destroy();
  restored.store.destroy();
});

test("learning hints, mastery evidence, pet care, and gymnastics scoring work together without gating progress", () => {
  const integration = createIntegrationHarness();
  const activity = integration.content.activityRegistry.get("chapter-01.multiplication-challenge");
  const question = integration.content.questionGeneratorRegistry.generate(activity, {
    seed: "integration-multiplication-question",
    tier: "core"
  });
  assert.equal(checkActivityAnswer(String(question.correctAnswer), question.correctAnswer, question.answerRules), true);

  const firstHint = integration.hintService.recordIncorrect(question);
  const secondHint = integration.hintService.recordIncorrect(question);
  const demonstration = integration.hintService.recordIncorrect(question);
  assert.equal(firstHint.stage, 1);
  assert.equal(secondHint.stage, 2);
  assert.equal(demonstration.stage, 3);
  assert.ok(demonstration.demonstration.textEquivalent.includes("Professor Hoot"));
  const parallel = integration.hintService.chooseNextStep(question.id, "parallel");
  assert.equal(parallel.kind, "parallel");
  assert.equal(parallel.question.activityId, activity.id);
  assert.equal(integration.hintService.complete(question.id).completed, true);
  assert.equal(integration.hintService.complete(parallel.question.id).completed, true);

  for (let index = 0; index < 5; index += 1) {
    integration.store.dispatch({
      type: "curriculum/evidence-recorded",
      payload: {
        skillId: activity.skillIds[0],
        activityId: activity.id,
        tier: "core",
        correct: true,
        hintLevel: index === 0 ? 3 : 0,
        attempts: 1
      }
    });
  }
  const mastery = selectSkillProgress(integration.store.getState(), activity.skillIds[0]);
  assert.equal(mastery.masteryStatus, "demonstrated");
  assert.equal(mastery.hintedResponses, 1);
  assert.equal(mastery.unassistedCorrect, 4);

  integration.petCollectionService.unlockPet("pet.phoenix", "chapter-02");
  integration.petCollectionService.performCare("pet.pegasus", "feeding");
  integration.petCollectionService.performCare("pet.pegasus", "grooming");
  integration.petCollectionService.performCare("pet.pegasus", "play");
  integration.petCollectionService.selectActivePet("pet.phoenix");
  integration.petCollectionService.setAppearancePalette("pet.phoenix", "ember");
  const phoenix = integration.petCollectionService.getPet("pet.phoenix");
  assert.equal(phoenix.appearance.paletteId, "ember");
  assert.equal(phoenix.careMoments, 0);
  assert.equal(integration.petCollectionService.getPet("pet.pegasus").careMoments, 3);

  const routine = integration.gymnasticsRoutineCatalog.get("routine.starlight-ribbon");
  const routineSession = integration.gymnasticsService.createSession(routine.id);
  let routineSnapshot = routineSession.start(0);
  const countInFinishedAt = routineSnapshot.beatIntervalMs * routine.countInBeats;
  routineSnapshot = routineSession.update(countInFinishedAt);
  assert.equal(routineSnapshot.stage, "tracing");
  for (const point of routine.tracePath) routineSession.recordTracePoint(point);
  routineSnapshot = routineSession.finishTrace(countInFinishedAt);
  assert.equal(routineSnapshot.stage, "rhythm");
  for (const beat of routine.beatCheckpoints) {
    const receipt = routineSession.tapBeat(countInFinishedAt + beat * routineSnapshot.beatIntervalMs);
    assert.equal(receipt.accepted, true, "Every authored beat checkpoint should accept a perfectly timed tap.");
  }
  routineSnapshot = routineSession.update(
    countInFinishedAt + routine.beatCheckpoints.at(-1) * routineSnapshot.beatIntervalMs
      + gameConfig.gymnastics.timingWindowMs + 1
  );
  assert.equal(routineSnapshot.completed, true);
  const recorded = integration.gymnasticsService.recordCompletion(routineSession);
  assert.equal(recorded.recorded, true);
  assert.equal(recorded.progress.completedRuns, 1);
  assert.equal(integration.gymnasticsService.recordCompletion(routineSession).reason, "already-recorded");
  assert.ok(recorded.result.traceAccuracyScore > 0);

  integration.store.destroy();
});
