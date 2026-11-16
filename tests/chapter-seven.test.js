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
import {
  chapterSevenActivityDefinitions, chapterSevenDefinition, chapterSevenHintDefinitions, chapterSevenReward
} from "../src/chapters/chapterSeven.js";
import { chapterDefinitions, getChapterDefinition } from "../src/chapters/registry.js";
import {
  grammarSentenceBank, readingPassageBank, getGrammarExamples, getReadingPassages
} from "../src/data/languageArtsLexicon.js";

const tiers = ["foundation", "core", "stretch"];
const categories = ["noun", "verb", "adjective", "adverb"];

function wholeWordCount(sentence, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return sentence.match(new RegExp("\\b" + escaped + "\\b", "gi"))?.length ?? 0;
}

test("Chapter 7 is registered after Chapter 6 with grammar, main-idea, and inference activities", () => {
  assert.deepEqual(chapterDefinitions.map((chapter) => chapter.id), [
    "chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06", "chapter-07"
  ]);
  assert.equal(getChapterDefinition("chapter-07"), chapterSevenDefinition);
  assert.equal(validateChapterDefinition(chapterSevenDefinition), true);
  assert.deepEqual(chapterSevenDefinition.prerequisiteChapterIds, ["chapter-06"]);
  assert.deepEqual(chapterSevenActivityDefinitions.map((activity) => activity.skillIds[0]), [
    "language.parts-of-speech", "language.reading-main-idea", "language.reading-inference"
  ]);
  assert.deepEqual(chapterSevenDefinition.activities.map((activity) => activity.type), [
    "story", "learning", "learning", "challenge", "story"
  ]);
  assert.deepEqual(chapterSevenDefinition.activities.slice(1, 4).map((activity) => activity.metadata.questionCount), [5, 4, 4]);
  assert.deepEqual(chapterSevenReward.replayPolicy, { type: "once" });
  assert.equal(chapterSevenReward.sourceId, "chapter-07");
  assert.equal(chapterSevenReward.starGems, 100);
  assert.equal(chapterSevenReward.starlightSparkles, 8);
});

test("curated grammar sentences have one unambiguous target word and balanced parts of speech", () => {
  assert.equal(new Set(grammarSentenceBank.map((entry) => entry.id)).size, grammarSentenceBank.length);
  assert.ok(grammarSentenceBank.length >= 20);
  assert.ok(grammarSentenceBank.every((entry) =>
    entry.sentence && entry.targetWord && entry.explanation && categories.includes(entry.partOfSpeech)
  ));
  for (const entry of grammarSentenceBank) {
    assert.equal(wholeWordCount(entry.sentence, entry.targetWord), 1, entry.id);
  }
  for (const category of categories) {
    assert.ok(grammarSentenceBank.some((entry) => entry.partOfSpeech === category), category);
  }
  assert.equal(getGrammarExamples("foundation").length, 8);
  assert.ok(getGrammarExamples("core").length > getGrammarExamples("foundation").length);
  assert.equal(getGrammarExamples("stretch").length, grammarSentenceBank.length);
  assert.throws(() => getGrammarExamples("expert"), /Unknown grammar difficulty tier/);
});

test("parts-of-speech questions are deterministic, tiered, and match the highlighted word's role", () => {
  const activities = createActivityRegistry(chapterSevenActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const activity = activities.get("chapter-07.parts-of-speech");
  for (const tier of tiers) {
    for (let index = 0; index < 90; index += 1) {
      const seed = "athena-grammar:" + tier + ":" + index;
      const question = generator.generate(activity, { seed, tier });
      assert.deepEqual(question, generator.generate(activity, { seed, tier }));
      assert.equal(question.stimulus.kind, "grammar-target");
      const example = grammarSentenceBank.find((entry) => entry.id === question.stimulus.exampleId);
      assert.ok(example);
      assert.equal(question.stimulus.sentence, example.sentence);
      assert.equal(question.stimulus.targetWord, example.targetWord);
      assert.equal(question.correctAnswer, example.partOfSpeech);
      assert.deepEqual(new Set(question.choices), new Set(categories));
      assert.equal(question.choices.length, 4);
      assert.ok(checkActivityAnswer(question.correctAnswer, example.partOfSpeech, question.answerRules));
    }
  }
});

test("reading passages carry distinct, text-supported main ideas and inference answer keys", () => {
  assert.equal(new Set(readingPassageBank.map((entry) => entry.id)).size, readingPassageBank.length);
  assert.equal(readingPassageBank.length, 6);
  for (const passage of readingPassageBank) {
    assert.ok(passage.title && passage.passage.length >= 150);
    for (const [answer, choices, explanation] of [
      [passage.mainIdea, passage.mainIdeaChoices, passage.mainIdeaExplanation],
      [passage.inference, passage.inferenceChoices, passage.inferenceExplanation]
    ]) {
      assert.ok(explanation.length > 25, passage.id);
      assert.equal(choices.length, 4, passage.id);
      assert.equal(new Set(choices).size, 4, passage.id);
      assert.ok(choices.includes(answer), passage.id);
    }
  }
  assert.deepEqual(getReadingPassages("foundation").map((entry) => entry.id), [
    "lantern-library", "rainy-day-garden"
  ]);
  assert.equal(getReadingPassages("core").length, 4);
  assert.equal(getReadingPassages("stretch").length, 6);
  assert.throws(() => getReadingPassages("expert"), /Unknown reading difficulty tier/);
});

test("main-idea and inference questions use their passage's curated answer key and distinct choices", () => {
  const activities = createActivityRegistry(chapterSevenActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const passageById = new Map(readingPassageBank.map((entry) => [entry.id, entry]));
  for (const tier of tiers) {
    for (const [activityId, focus, answerKey, choiceKey] of [
      ["chapter-07.main-idea", "main-idea", "mainIdea", "mainIdeaChoices"],
      ["chapter-07.inference", "inference", "inference", "inferenceChoices"]
    ]) {
      const activity = activities.get(activityId);
      for (let index = 0; index < 120; index += 1) {
        const seed = "athena-reading:" + activityId + ":" + tier + ":" + index;
        const question = generator.generate(activity, { seed, tier });
        assert.deepEqual(question, generator.generate(activity, { seed, tier }));
        assert.equal(question.stimulus.kind, "reading-passage");
        assert.equal(question.stimulus.focus, focus);
        const passage = passageById.get(question.stimulus.passageId);
        assert.ok(passage);
        assert.equal(question.stimulus.title, passage.title);
        assert.equal(question.stimulus.passage, passage.passage);
        assert.equal(question.correctAnswer, passage[answerKey]);
        assert.deepEqual(new Set(question.choices), new Set(passage[choiceKey]));
        assert.equal(question.choices.length, 4);
        assert.ok(checkActivityAnswer(question.correctAnswer, passage[answerKey], question.answerRules));
      }
    }
  }
});

test("Professor Hoot provides three useful hint stages for each Athena activity", () => {
  const activityRegistry = createActivityRegistry(chapterSevenActivityDefinitions);
  const generator = createQuestionGeneratorRegistry();
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: chapterSevenHintDefinitions });
  const hints = createHintService({ activityRegistry, hintRegistry, questionGeneratorRegistry: generator });
  for (const activityId of [
    "chapter-07.parts-of-speech", "chapter-07.main-idea", "chapter-07.inference"
  ]) {
    const question = generator.generate(activityRegistry.get(activityId), {
      seed: "athena-hint:" + activityId, tier: "core"
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

test("Chapter 7 waits for Chapter 6, resumes its checkpoint, and grants Athena's Quill only once", () => {
  const chapterCatalog = createChapterCatalog(chapterDefinitions);
  const rewardRegistry = createRewardRegistry([
    chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward,
    chapterFiveReward, chapterSixReward, chapterSevenReward
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
  assert.throws(() => chapterService.createSession("chapter-07").start(), /prerequisite chapters/);

  for (const chapter of chapterDefinitions.slice(0, 6)) {
    const session = chapterService.createSession(chapter.id);
    session.start();
    for (let index = 0; index < chapter.activities.length; index += 1) session.completeActivity();
    assert.equal(session.getSnapshot().isComplete, true);
  }

  const interrupted = chapterService.createSession("chapter-07");
  interrupted.start();
  interrupted.completeActivity();
  interrupted.completeActivity();
  interrupted.exit();
  const resumed = chapterService.createSession("chapter-07");
  assert.equal(resumed.start().currentActivity.id, "chapter-07.main-idea-room");
  for (let index = 2; index < chapterSevenDefinition.activities.length; index += 1) resumed.completeActivity();
  assert.equal(resumed.getSnapshot().isComplete, true);
  assert.equal(resumed.getSnapshot().completionReceipt.rewards[0].reason, "reward-granted");

  const replay = chapterService.createSession("chapter-07");
  replay.start();
  for (let index = 0; index < chapterSevenDefinition.activities.length; index += 1) replay.completeActivity();
  assert.equal(replay.getSnapshot().completionReceipt.rewards[0].reason, "already-claimed");
  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterSevenReward.id], 1);
  assert.equal(economy.starGems, 490);
  assert.equal(economy.starlightSparkles, 35);
  assert.equal(chapterService.getSnapshot().chapters.find((entry) => entry.id === "chapter-07").progress.completedRuns, 2);
  store.destroy();
});
