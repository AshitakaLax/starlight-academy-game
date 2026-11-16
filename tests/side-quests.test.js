import test from "node:test";
import assert from "node:assert/strict";
import { createActivityRegistry } from "../src/systems/curriculum/activityDefinitions.js";
import { createQuestionGeneratorRegistry } from "../src/systems/curriculum/questionGenerators.js";
import { checkActivityAnswer } from "../src/systems/curriculum/answerRules.js";
import { createHintRegistry } from "../src/systems/hints/createHintRegistry.js";
import { createHintService } from "../src/systems/hints/createHintService.js";
import { createRewardRegistry, createShopCatalog } from "../src/systems/economy/economyCatalogs.js";
import { createInitialEconomyState, selectEconomy } from "../src/systems/economy/economyState.js";
import { createEconomyActionDefinitions } from "../src/systems/economy/economyActions.js";
import { createEconomyService } from "../src/systems/economy/createEconomyService.js";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState } from "../src/core/state/actions.js";
import { createChapterCatalog } from "../src/gameplay/chapter-runtime/chapterCatalog.js";
import { createInitialChapterRuntimeState } from "../src/gameplay/chapter-runtime/chapterRuntimeState.js";
import { createChapterRuntimeActionDefinitions } from "../src/gameplay/chapter-runtime/chapterRuntimeActions.js";
import { createChapterRuntimeService } from "../src/gameplay/chapter-runtime/createChapterRuntimeService.js";
import { chapterOneDefinition, chapterOneReward } from "../src/chapters/chapterOne.js";
import { chapterTwoDefinition, chapterTwoReward } from "../src/chapters/chapterTwo.js";
import { chapterThreeDefinition, chapterThreeReward } from "../src/chapters/chapterThree.js";
import { chapterFourDefinition, chapterFourReward } from "../src/chapters/chapterFour.js";
import { getChapterThreeWords } from "../src/data/wordBuildingLexicon.js";
import {
  sideQuestDefinitions, sideQuestActivityDefinitions, sideQuestHintDefinitions,
  sideQuestRewardDefinitions, getSideQuestDefinition, validateSideQuestDefinition
} from "../src/side-quests/registry.js";

const tiers = ["foundation", "core", "stretch"];

test("the first six optional side quests have chapter-specific objectives and rewards", () => {
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.id), [
    "quest-01", "quest-02", "quest-03", "quest-04", "quest-05", "quest-06"
  ]);
  for (const [index, id] of ["quest-01", "quest-02", "quest-03", "quest-04", "quest-05", "quest-06"].entries()) {
    assert.equal(getSideQuestDefinition(id), sideQuestDefinitions[index]);
  }
  assert.equal(getSideQuestDefinition("quest-missing"), null);
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.questType), [
    "mastery", "application", "mastery", "application", "mastery", "application"
  ]);
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.sourceChapterId), [
    "chapter-01", "chapter-01", "chapter-02", "chapter-02", "chapter-03", "chapter-03"
  ]);
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.prerequisiteChapterIds), [
    ["chapter-01"], ["chapter-01"], ["chapter-02"], ["chapter-02"], ["chapter-03"], ["chapter-03"]
  ]);
  assert.notDeepEqual(sideQuestDefinitions[0].objectives, sideQuestDefinitions[1].objectives);
  assert.notDeepEqual(sideQuestDefinitions[2].objectives, sideQuestDefinitions[3].objectives);
  assert.notDeepEqual(sideQuestDefinitions[4].objectives, sideQuestDefinitions[5].objectives);
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.majorRewardIds), [
    ["reward.quest-01-firefly-pattern-pin"], ["reward.quest-02-moonberry-basket"],
    ["reward.quest-03-fraction-family-prism"], ["reward.quest-04-celestial-measure-book"],
    ["reward.quest-05-wordsmith-prism"], ["reward.quest-06-storykeepers-quill"]
  ]);
  assert.equal(validateSideQuestDefinition({
    ...sideQuestDefinitions[0], id: "chapter-99", sourceChapterId: "chapter-01", questType: "mastery"
  }).includes("quest-NN"), true);
  for (const [index, quest] of sideQuestDefinitions.entries()) {
    assert.equal(quest.activities[0].id.startsWith("quest-0" + (index + 1) + "."), true);
  }
  assert.equal(sideQuestActivityDefinitions.length, 6);
  assert.equal(sideQuestHintDefinitions.length, 6);
  assert.equal(sideQuestRewardDefinitions.length, 6);
  assert.deepEqual(sideQuestRewardDefinitions.map((reward) => reward.replayPolicy),
    Array.from({ length: 6 }, () => ({ type: "once" })));
  assert.deepEqual(sideQuestRewardDefinitions.map((reward) => reward.sourceId),
    ["quest-01", "quest-02", "quest-03", "quest-04", "quest-05", "quest-06"]);
  assert.equal(new Set(sideQuestActivityDefinitions.map((activity) => activity.generatorId)).size, 6);
  assert.equal(chapterOneDefinition.activities.length, 5);
  assert.equal(chapterOneDefinition.activities.every((activity) => activity.id.startsWith("chapter-01.")), true);
  assert.equal(chapterTwoDefinition.activities.length, 4);
  assert.equal(chapterTwoDefinition.activities.every((activity) => activity.id.startsWith("chapter-02.")), true);
  assert.equal(chapterThreeDefinition.activities.length, 5);
  assert.equal(chapterThreeDefinition.activities.every((activity) => activity.id.startsWith("chapter-03.")), true);
});
test("the Firefly Gap Maze generates verified missing terms at every tier", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-01.firefly-gap-maze");
  assert.deepEqual(activity.skillIds, ["math.skip-counting"]);
  assert.equal(activity.generatorId, "quests.skip-counting-gap");

  for (const tier of tiers) {
    const options = { seed: "firefly-gap:" + tier, tier };
    const question = generators.generate(activity, options);
    const repeated = generators.generate(activity, options);
    assert.deepEqual(repeated, question);
    assert.ok(question.prompt.includes("□"));
    assert.equal(question.choices.length, 4);
    assert.equal(question.choices.includes(question.correctAnswer), true);
    const { sequence, missingIndex, step } = question.stimulus;
    assert.equal(sequence[missingIndex], null);
    assert.equal(sequence[missingIndex - 1] + step, question.correctAnswer);
    assert.equal(question.correctAnswer + step, sequence[missingIndex + 1]);
    assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
  }
});

test("the Moonberry Picnic Planner applies multiplication to verified equal-group stories", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-02.moonberry-picnic");
  assert.deepEqual(activity.skillIds, ["math.multiplication"]);
  assert.equal(activity.generatorId, "quests.equal-groups-picnic");

  for (const tier of tiers) {
    const options = { seed: "moonberry-picnic:" + tier, tier };
    const question = generators.generate(activity, options);
    const repeated = generators.generate(activity, options);
    assert.deepEqual(repeated, question);
    assert.equal(question.stimulus.groups * question.stimulus.itemsEach, question.correctAnswer);
    assert.ok(question.prompt.includes(String(question.stimulus.groups)));
    assert.ok(question.prompt.includes(String(question.stimulus.itemsEach)));
    assert.equal(question.choices.length, 4);
    assert.equal(question.choices.includes(question.correctAnswer), true);
    assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
  }
});

test("the Fraction Family Outlier finds exactly one fraction that changes the amount", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-03.fraction-outlier");
  assert.deepEqual(activity.skillIds, ["math.equivalent-fractions"]);
  assert.equal(activity.generatorId, "quests.fraction-outlier");

  for (const tier of tiers) {
    const options = { seed: "fraction-outlier:" + tier, tier };
    const question = generators.generate(activity, options);
    assert.deepEqual(generators.generate(activity, options), question);
    assert.equal(question.choices.length, 4);
    assert.equal(question.choices.includes(question.correctAnswer), true);
    assert.equal(question.stimulus.bars.length, 5);
    const { numerator: baseNumerator, denominator: baseDenominator } = question.stimulus.base;
    const different = question.choices.filter((choice) => {
      const [numerator, denominator] = choice.split("/").map(Number);
      return numerator * baseDenominator !== baseNumerator * denominator;
    });
    assert.deepEqual(different, [question.correctAnswer]);
    assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
  }
});

test("Fractions in the Celestial Amphitheater turns selected story parts into a whole fraction", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-04.fraction-story");
  assert.deepEqual(activity.skillIds, ["math.fractions"]);
  assert.equal(activity.generatorId, "quests.fraction-story");

  for (const tier of tiers) {
    const options = { seed: "fraction-story:" + tier, tier };
    const question = generators.generate(activity, options);
    assert.deepEqual(generators.generate(activity, options), question);
    const { numerator, denominator, storyKind } = question.stimulus;
    assert.ok(["music", "ribbon", "tart", "star-chart"].includes(storyKind));
    assert.equal(question.correctAnswer, numerator + "/" + denominator);
    assert.ok(question.prompt.includes(String(numerator)));
    assert.ok(question.prompt.includes(String(denominator)));
    assert.equal(question.choices.length, 4);
    assert.equal(question.choices.includes(question.correctAnswer), true);
    assert.equal(question.stimulus.bars[0].numerator, numerator);
    assert.equal(question.stimulus.bars[0].denominator, denominator);
    assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
  }
});


test("The Morphology Looking Glass analyzes only curated Chapter 3 word structures", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-05.morphology-analysis");
  assert.deepEqual(activity.skillIds, ["language.prefixes", "language.roots", "language.suffixes"]);
  assert.equal(activity.generatorId, "quests.word-morphology");
  const describeParts = (entry) => [
    ...entry.prefixes.map((part) => part.display), entry.root.text,
    ...entry.suffixes.map((part) => part.display)
  ].join(" + ");
  for (const tier of tiers) {
    const entries = getChapterThreeWords(tier);
    const valid = new Set(entries.map(describeParts));
    const options = { seed: "morphology-looking-glass:" + tier, tier };
    const question = generators.generate(activity, options);
    assert.deepEqual(generators.generate(activity, options), question);
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices).size, 4);
    assert.equal(question.choices.includes(question.correctAnswer), true);
    assert.equal(valid.has(question.correctAnswer), true);
    assert.equal(question.choices.every((choice) => valid.has(choice)), true);
    const target = entries.find((entry) => entry.word === question.stimulus.word);
    assert.ok(target);
    assert.equal(question.prompt.includes(target.meaning), true);
    assert.equal(question.stimulus.sentence, target.sentence);
    assert.equal(question.stimulus.spellingNote ?? null, target.spellingNote ?? null);
    assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
  }
});

test("The Missing Word Library restores a curated word from its meaning and sentence context", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-06.context-word-rescue");
  assert.deepEqual(activity.skillIds, ["language.prefixes", "language.roots", "language.suffixes"]);
  assert.equal(activity.generatorId, "quests.context-word-rescue");
  for (const tier of tiers) {
    const entries = getChapterThreeWords(tier);
    const options = { seed: "missing-word-library:" + tier, tier };
    const question = generators.generate(activity, options);
    assert.deepEqual(generators.generate(activity, options), question);
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices).size, 4);
    assert.equal(question.choices.includes(question.correctAnswer), true);
    const target = entries.find((entry) => entry.word === question.correctAnswer);
    assert.ok(target);
    assert.equal(question.prompt.includes(target.meaning), true);
    assert.equal(question.stimulus.word, "Missing word");
    assert.equal(question.stimulus.sentence.includes("________"), true);
    assert.equal(question.stimulus.sentence.toLocaleLowerCase().includes(target.word.toLocaleLowerCase()), false);
    assert.equal(question.choices.every((choice) => entries.some((entry) => entry.word === choice)), true);
    assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
  }
});

test("Professor Hoot gives each side quest three skill-matched hint stages", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const hintRegistry = createHintRegistry({ activityRegistry, initialDefinitions: sideQuestHintDefinitions });
  const generators = createQuestionGeneratorRegistry();
  const hints = createHintService({ activityRegistry, hintRegistry, questionGeneratorRegistry: generators });

  for (const activity of activityRegistry.list()) {
    const question = generators.generate(activity, {
      seed: "side-quest-hints:" + activity.id, tier: "core"
    });
    const first = hints.recordIncorrect(question);
    const second = hints.recordIncorrect(question);
    const third = hints.recordIncorrect(question);
    assert.equal(first.stage, 1);
    assert.equal(first.kind, "nudge");
    assert.equal(second.stage, 2);
    assert.equal(second.kind, "strategy");
    assert.equal(third.stage, 3);
    assert.equal(third.kind, "demonstration");
    assert.ok(third.demonstration.steps.length >= 2);
    assert.equal(hints.complete(question.id).canComplete, true);
  }
});

test("side quests unlock after their source chapter and never block the next chapter or duplicate rewards on replay", () => {
  const chapterCatalog = createChapterCatalog([
    chapterOneDefinition, chapterTwoDefinition, chapterThreeDefinition, chapterFourDefinition, ...sideQuestDefinitions
  ]);
  const rewardRegistry = createRewardRegistry([
    chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward, ...sideQuestRewardDefinitions
  ]);
  const shopCatalog = createShopCatalog([]);
  const store = createGameStore({
    initialState: {
      ...createInitialGameState(),
      economy: createInitialEconomyState(),
      chapterRuntime: createInitialChapterRuntimeState()
    },
    actions: {
      ...createEconomyActionDefinitions({ rewardRegistry, shopCatalog }),
      ...createChapterRuntimeActionDefinitions({ chapterCatalog })
    }
  });
  const economyService = createEconomyService({ store, rewardRegistry, shopCatalog });
  const runtime = createChapterRuntimeService({ store, chapterCatalog, rewardRegistry, economyService });

  for (const quest of sideQuestDefinitions) {
    assert.throws(() => runtime.createSession(quest.id).start(), /prerequisite chapters/);
  }

  const mainChapter = runtime.createSession("chapter-01");
  mainChapter.start();
  for (let index = 0; index < chapterOneDefinition.activities.length; index += 1) {
    mainChapter.completeActivity();
  }
  assert.equal(mainChapter.getSnapshot().isComplete, true);
  const afterChapterOne = runtime.getSnapshot().chapters;
  for (const quest of sideQuestDefinitions) {
    const entry = afterChapterOne.find((item) => item.id === quest.id);
    assert.equal(entry.progress.status, "not-started");
    assert.equal(entry.prerequisitesMet, quest.sourceChapterId === "chapter-01");
  }
  const chapterTwo = runtime.createSession("chapter-02");
  assert.equal(chapterTwo.start().prerequisitesMet, true);
  for (let index = 0; index < chapterTwoDefinition.activities.length; index += 1) {
    chapterTwo.completeActivity();
  }
  assert.equal(chapterTwo.getSnapshot().isComplete, true);
  const afterChapterTwo = runtime.getSnapshot().chapters;
  for (const quest of sideQuestDefinitions) {
    const entry = afterChapterTwo.find((item) => item.id === quest.id);
    assert.equal(entry.prerequisitesMet, ["chapter-01", "chapter-02"].includes(quest.sourceChapterId));
  }
  const chapterThree = runtime.createSession("chapter-03");
  assert.equal(chapterThree.start().prerequisitesMet, true);
  for (let index = 0; index < chapterThreeDefinition.activities.length; index += 1) {
    chapterThree.completeActivity();
  }
  assert.equal(chapterThree.getSnapshot().isComplete, true);
  const afterChapterThree = runtime.getSnapshot().chapters;
  for (const quest of sideQuestDefinitions) {
    const entry = afterChapterThree.find((item) => item.id === quest.id);
    assert.equal(entry.prerequisitesMet, true);
  }
  for (const id of ["quest-05", "quest-06"]) {
    assert.equal(afterChapterThree.find((item) => item.id === id).progress.status, "not-started");
  }
  const chapterFour = runtime.createSession("chapter-04");
  assert.equal(chapterFour.start().prerequisitesMet, true);
  chapterFour.exit();

  for (const quest of sideQuestDefinitions) {
    const interrupted = runtime.createSession(quest.id);
    interrupted.start();
    assert.equal(interrupted.getSnapshot().currentActivity.activityId, quest.activities[0].activityId);
    interrupted.saveCheckpoint();
    interrupted.exit();

    const resumed = runtime.createSession(quest.id);
    assert.equal(resumed.start().currentActivity.id, quest.activities[0].id);
    const completed = resumed.completeActivity();
    assert.equal(completed.isComplete, true);
    assert.equal(completed.completionReceipt.rewards[0].reason, "reward-granted");

    const replay = runtime.createSession(quest.id);
    replay.start();
    assert.equal(replay.completeActivity().completionReceipt.rewards[0].reason, "already-claimed");
    const record = runtime.getSnapshot().chapters.find((item) => item.id === quest.id);
    assert.equal(record.progress.completedRuns, 2);
    assert.equal(record.progress.status, "completed");
  }

  const economy = selectEconomy(store.getState());
  assert.equal(economy.rewardClaims[chapterOneReward.id], 1);
  for (const reward of sideQuestRewardDefinitions) assert.equal(economy.rewardClaims[reward.id], 1);
  assert.equal(economy.rewardClaims[chapterTwoReward.id], 1);
  assert.equal(economy.starGems, 415);
  assert.equal(economy.starlightSparkles, 26);
  store.destroy();
});
