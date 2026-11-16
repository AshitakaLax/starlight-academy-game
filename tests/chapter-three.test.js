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
import {
  chapterThreeActivityDefinitions,
  chapterThreeDefinition,
  chapterThreeHintDefinitions,
  chapterThreeReward
} from "../src/chapters/chapterThree.js";
import { chapterFourDefinition, chapterFourReward } from "../src/chapters/chapterFour.js";
import { chapterFiveReward } from "../src/chapters/chapterFive.js";
import { chapterSixReward } from "../src/chapters/chapterSix.js";
import { chapterSevenReward } from "../src/chapters/chapterSeven.js";
import { chapterEightReward } from "../src/chapters/chapterEight.js";
import { chapterNineReward } from "../src/chapters/chapterNine.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";
import { chapterThreeWordBank, getChapterThreeWords } from "../src/data/wordBuildingLexicon.js";

function assembleCuratedWord(entry) {
  const prefix = entry.prefixes.map((part) => part.text).join("");
  let root = entry.root.text;
  if (entry.spellingRule === "drop-final-e") root = root.replace(/e$/, "");
  const suffixes = entry.suffixes.map((part) => part.text).join("");
  return prefix + root + suffixes;
}

test("Chapter 3 is registered after Chapter 2 with prefix, suffix, potion, and story activities", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), [
    "chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06", "chapter-07", "chapter-08", "chapter-09"
  ]);
  assert.equal(getChapterDefinition("chapter-03"), chapterThreeDefinition);
  assert.equal(getChapterDefinition("chapter-04"), chapterFourDefinition);
  assert.equal(validateChapterDefinition(chapterThreeDefinition), true);
  assert.deepEqual(chapterThreeDefinition.prerequisiteChapterIds, ["chapter-02"]);
  assert.deepEqual(chapterThreeDefinition.activities.map((activity) => activity.type), [
    "story", "learning", "learning", "challenge", "story"
  ]);
  assert.equal(chapterThreeDefinition.activities[1].activityId, "chapter-03.prefix-workshop");
  assert.equal(chapterThreeDefinition.activities[2].activityId, "chapter-03.suffix-workshop");
  assert.equal(chapterThreeDefinition.activities[3].activityId, "chapter-03.potion-inference");
  assert.equal(chapterThreeDefinition.activities[3].metadata.questionCount, 3);
  assert.deepEqual(chapterThreeReward.replayPolicy, { type: "once" });
  assert.equal(chapterThreeReward.sourceId, "chapter-03");
});

test("curated word bank entries are correctly assembled, unique, and supported by their context sentences", () => {
  assert.equal(chapterThreeWordBank.length, 17);
  assert.equal(new Set(chapterThreeWordBank.map((entry) => entry.word)).size, chapterThreeWordBank.length);
  for (const tier of ["foundation", "core", "stretch"]) {
    const entries = getChapterThreeWords(tier);
    assert.ok(entries.length >= 5);
    assert.equal(new Set(entries.map((entry) => entry.meaning)).size, entries.length);
    for (const entry of entries) {
      assert.equal(assembleCuratedWord(entry), entry.word, entry.word + " should match its component spelling");
      assert.ok(entry.sentence.toLowerCase().includes(entry.word.toLowerCase()), entry.word + " should appear in its context sentence");
      assert.ok(entry.meaning.length > 8);
      assert.ok(entry.root.text.length > 1);
      assert.ok(entry.prefixes.length + entry.suffixes.length > 0);
    }
  }
  const reusable = chapterThreeWordBank.find((entry) => entry.word === "reusable");
  assert.equal(reusable.spellingRule, "drop-final-e");
  assert.match(reusable.spellingNote, /Drop the final e/);
});

test("prefix and suffix questions are deterministic and select only valid curated words", () => {
  const activityRegistry = createActivityRegistry(chapterThreeActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  for (const [activityId, focus] of [
    ["chapter-03.prefix-workshop", "prefix"],
    ["chapter-03.suffix-workshop", "suffix"]
  ]) {
    const activity = activityRegistry.get(activityId);
    for (const tier of ["foundation", "core", "stretch"]) {
      for (let index = 0; index < 36; index += 1) {
        const seed = activityId + ":" + tier + ":" + index;
        const question = generator.generate(activity, { seed, tier });
        assert.deepEqual(question, generator.generate(activity, { seed, tier }));
        assert.equal(question.stimulus.kind, "word-parts");
        assert.equal(question.choices.length, 4);
        assert.equal(new Set(question.choices).size, 4);
        assert.ok(question.choices.includes(question.correctAnswer));
        const chosen = getChapterThreeWords(tier).find((entry) => entry.word === question.correctAnswer);
        assert.ok(chosen, "answer must be a word from the current tier");
        assert.ok(focus === "prefix" ? chosen.prefixes.length > 0 : chosen.suffixes.length > 0);
        assert.equal(question.stimulus.meaning, chosen.meaning);
        assert.deepEqual(
          question.stimulus.components.map((part) => part.text),
          [
            ...chosen.prefixes.map((part) => part.display),
            chosen.root.text,
            ...chosen.suffixes.map((part) => part.display)
          ]
        );
        assert.ok(question.choices.every((choice) => getChapterThreeWords(tier).some((entry) => entry.word === choice)));
        assert.ok(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules));
        if (chosen.spellingNote) assert.equal(question.stimulus.spellingNote, chosen.spellingNote);
      }
    }
  }
});

test("context-potion questions contain unambiguous context and four distinct curated meanings", () => {
  const activityRegistry = createActivityRegistry(chapterThreeActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("chapter-03.potion-inference");
  for (const tier of ["foundation", "core", "stretch"]) {
    for (let index = 0; index < 48; index += 1) {
      const seed = "potion:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "context-potion");
      assert.ok(question.stimulus.sentence.toLowerCase().includes(question.stimulus.word.toLowerCase()));
      const entry = getChapterThreeWords(tier).find((candidate) => candidate.word === question.stimulus.word);
      assert.ok(entry);
      assert.equal(question.correctAnswer, entry.meaning);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.includes(entry.meaning));
      assert.ok(question.choices.every((choice) => getChapterThreeWords(tier).some((candidate) => candidate.meaning === choice)));
      assert.ok(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules));
    }
  }
});

test("Professor Hoot offers prefix, suffix, and context-specific three-stage assistance", () => {
  const activityRegistry = createActivityRegistry(chapterThreeActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({
    activityRegistry,
    initialDefinitions: chapterThreeHintDefinitions
  });
  const hints = createHintService({
    activityRegistry,
    hintRegistry,
    questionGeneratorRegistry: generator
  });
  for (const [activityId, seed] of [
    ["chapter-03.prefix-workshop", "prefix-hint"],
    ["chapter-03.suffix-workshop", "suffix-hint"],
    ["chapter-03.potion-inference", "context-hint"]
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

test("Chapter 3 waits for Chapter 2, resumes its checkpoint, and grants its Lexicon Lantern only once", () => {
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const rewardRegistry = createRewardRegistry([chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward, chapterFiveReward, chapterSixReward, chapterSevenReward, chapterEightReward, chapterNineReward]);
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

  assert.throws(() => chapterService.createSession("chapter-03").start(), /prerequisite chapters/);
  const first = chapterService.createSession("chapter-01");
  first.start();
  for (let index = 0; index < chapterDefinitions[0].activities.length; index += 1) first.completeActivity();
  assert.equal(first.getSnapshot().isComplete, true);
  assert.throws(() => chapterService.createSession("chapter-03").start(), /prerequisite chapters/);

  const second = chapterService.createSession("chapter-02");
  second.start();
  for (let index = 0; index < chapterDefinitions[1].activities.length; index += 1) second.completeActivity();
  assert.equal(second.getSnapshot().isComplete, true);

  const interrupted = chapterService.createSession("chapter-03");
  interrupted.start();
  interrupted.completeActivity();
  interrupted.completeActivity();
  interrupted.exit();

  const resumed = chapterService.createSession("chapter-03");
  assert.equal(resumed.start().currentActivity.id, "chapter-03.suffix-still");
  resumed.completeActivity();
  resumed.completeActivity();
  const completed = resumed.completeActivity();
  assert.equal(completed.isComplete, true);
  assert.equal(completed.completedActivityCount, 5);
  assert.equal(completed.completionReceipt.rewards[0].granted, true);
  assert.equal(completed.completionReceipt.rewards[0].reason, "reward-granted");

  const replay = chapterService.createSession("chapter-03");
  replay.start();
  for (let index = 0; index < chapterThreeDefinition.activities.length; index += 1) replay.completeActivity();
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterThreeReward.id], 1);
  assert.equal(economy.starGems, 150);
  assert.equal(economy.starlightSparkles, 9);
  assert.equal(chapterService.getSnapshot().chapters.find((chapter) => chapter.id === "chapter-03").progress.completedRuns, 2);
  store.destroy();
});
