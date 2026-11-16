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
import { chapterFiveDefinition, chapterFiveReward } from "../src/chapters/chapterFive.js";
import { chapterSixDefinition, chapterSixReward } from "../src/chapters/chapterSix.js";
import { chapterSevenDefinition, chapterSevenReward } from "../src/chapters/chapterSeven.js";
import { chapterEightDefinition, chapterEightReward } from "../src/chapters/chapterEight.js";
import { chapterNineDefinition, chapterNineReward } from "../src/chapters/chapterNine.js";
import { chapterTenDefinition, chapterTenReward } from "../src/chapters/chapterTen.js";
import { getMultiStepProblems } from "../src/data/chimeraChallengeLexicon.js";
import { getHabitatCreatures, getHabitatEcosystemConnections } from "../src/data/habitatLexicon.js";
import { getPlantLifecycleStages, getPlantLifecycleTransitions, getPlantPhotosynthesisRecipeScenarios } from "../src/data/plantLexicon.js";
import { getChapterThreeWords } from "../src/data/wordBuildingLexicon.js";
import { getGrammarExamples, getReadingPassages } from "../src/data/languageArtsLexicon.js";
import { getMassBalanceProblems, getUnitConversionProblems } from "../src/data/measurementLexicon.js";
import {
  sideQuestDefinitions, sideQuestActivityDefinitions, sideQuestHintDefinitions,
  sideQuestRewardDefinitions, getSideQuestDefinition, validateSideQuestDefinition
} from "../src/side-quests/registry.js";

const tiers = ["foundation", "core", "stretch"];

test("the first eighteen optional side quests have chapter-specific objectives and rewards", () => {
  const questIds = [
    "quest-01", "quest-02", "quest-03", "quest-04", "quest-05",
    "quest-06", "quest-07", "quest-08", "quest-09", "quest-10", "quest-11", "quest-12", "quest-13", "quest-14", "quest-15", "quest-16", "quest-17", "quest-18"
  ];
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.id), questIds);
  for (const [index, id] of questIds.entries()) assert.equal(getSideQuestDefinition(id), sideQuestDefinitions[index]);
  assert.equal(getSideQuestDefinition("quest-missing"), null);
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.questType), [
    "mastery", "application", "mastery", "application", "mastery",
    "application", "mastery", "application", "mastery", "application",
    "mastery", "application", "mastery", "application", "mastery", "application", "mastery", "application"
  ]);
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.sourceChapterId), [
    "chapter-01", "chapter-01", "chapter-02", "chapter-02", "chapter-03",
    "chapter-03", "chapter-04", "chapter-04", "chapter-05", "chapter-05",
    "chapter-06", "chapter-06", "chapter-07", "chapter-07", "chapter-08", "chapter-08", "chapter-09", "chapter-09"
  ]);
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.prerequisiteChapterIds), [
    ["chapter-01"], ["chapter-01"], ["chapter-02"], ["chapter-02"], ["chapter-03"],
    ["chapter-03"], ["chapter-04"], ["chapter-04"], ["chapter-05"], ["chapter-05"],
    ["chapter-06"], ["chapter-06"], ["chapter-07"], ["chapter-07"], ["chapter-08"], ["chapter-08"], ["chapter-09"], ["chapter-09"]
  ]);
  for (let pairStart = 0; pairStart < 18; pairStart += 2) {
    assert.notDeepEqual(sideQuestDefinitions[pairStart].objectives, sideQuestDefinitions[pairStart + 1].objectives);
  }
  assert.deepEqual(sideQuestDefinitions.map((quest) => quest.majorRewardIds), [
    ["reward.quest-01-firefly-pattern-pin"], ["reward.quest-02-moonberry-basket"],
    ["reward.quest-03-fraction-family-prism"], ["reward.quest-04-celestial-measure-book"],
    ["reward.quest-05-wordsmith-prism"], ["reward.quest-06-storykeepers-quill"],
    ["reward.quest-07-sky-gallery-compass"], ["reward.quest-08-builders-toolkit"],
    ["reward.quest-09-adaptation-detective-lens"], ["reward.quest-10-ecosystem-field-lens"],
    ["reward.quest-11-life-cycle-timeglass"], ["reward.quest-12-greenhouse-recipe-crystal"],
    ["reward.quest-13-grammar-twin-monocle"], ["reward.quest-14-evidence-compass-bookmark"],
    ["reward.quest-15-metric-audit-loupe"], ["reward.quest-16-harbor-cargo-seal"],
    ["reward.quest-17-chimera-blueprint-compass"], ["reward.quest-18-chimera-supply-satchel"]
  ]);
  assert.equal(validateSideQuestDefinition({
    ...sideQuestDefinitions[0], id: "chapter-99", sourceChapterId: "chapter-01", questType: "mastery"
  }).includes("quest-NN"), true);
  for (const [index, quest] of sideQuestDefinitions.entries()) {
    assert.equal(quest.activities[0].id.startsWith("quest-" + String(index + 1).padStart(2, "0") + "."), true);
  }
  assert.equal(sideQuestActivityDefinitions.length, 18);
  assert.equal(sideQuestHintDefinitions.length, 18);
  assert.equal(sideQuestRewardDefinitions.length, 18);
  assert.deepEqual(sideQuestRewardDefinitions.map((reward) => reward.replayPolicy),
    Array.from({ length: 18 }, () => ({ type: "once" })));
  assert.deepEqual(sideQuestRewardDefinitions.map((reward) => reward.sourceId), questIds);
  assert.equal(new Set(sideQuestActivityDefinitions.map((activity) => activity.generatorId)).size, 18);
  assert.equal(chapterOneDefinition.activities.length, 5);
  assert.equal(chapterOneDefinition.activities.every((activity) => activity.id.startsWith("chapter-01.")), true);
  assert.equal(chapterTwoDefinition.activities.length, 4);
  assert.equal(chapterTwoDefinition.activities.every((activity) => activity.id.startsWith("chapter-02.")), true);
  assert.equal(chapterThreeDefinition.activities.length, 5);
  assert.equal(chapterThreeDefinition.activities.every((activity) => activity.id.startsWith("chapter-03.")), true);
  assert.equal(chapterFourDefinition.activities.length, 7);
  assert.equal(chapterFourDefinition.activities.every((activity) => activity.id.startsWith("chapter-04.")), true);
  assert.equal(chapterFiveDefinition.activities.length, 6);
  assert.equal(chapterFiveDefinition.activities.every((activity) => activity.id.startsWith("chapter-05.")), true);
  assert.equal(chapterSixDefinition.activities.length, 5);
  assert.equal(chapterSixDefinition.activities.every((activity) => activity.id.startsWith("chapter-06.")), true);
  assert.equal(chapterSevenDefinition.activities.length, 5);
  assert.equal(chapterSevenDefinition.activities.every((activity) => activity.id.startsWith("chapter-07.")), true);
  assert.equal(chapterEightDefinition.activities.length, 6);
  assert.equal(chapterEightDefinition.activities.every((activity) => activity.id.startsWith("chapter-08.")), true);
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

test("The Sky Gallery Shape Riddles combine side, angle, and symmetry clues at every tier", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-07.shape-riddle");
  assert.deepEqual(activity.skillIds, ["math.shape-recognition", "math.symmetry", "math.angles"]);
  assert.equal(activity.generatorId, "quests.geometry-shape-riddle");
  const shapes = {
    triangle: { label: "equilateral triangle", sides: 3, angle: "3 corners", lines: 3 },
    square: { label: "square", sides: 4, angle: "4 right angles", lines: 4 },
    rectangle: { label: "rectangle", sides: 4, angle: "4 right angles", lines: 2 },
    rhombus: { label: "rhombus", sides: 4, angle: "no right angles", lines: 2 },
    pentagon: { label: "regular pentagon", sides: 5, angle: "5 corners", lines: 5 },
    hexagon: { label: "regular hexagon", sides: 6, angle: "6 corners", lines: 6 }
  };
  for (const tier of tiers) {
    const options = { seed: "sky-gallery-riddles:" + tier, tier };
    const question = generators.generate(activity, options);
    assert.deepEqual(generators.generate(activity, options), question);
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices).size, 4);
    assert.equal(question.choices.includes(question.correctAnswer), true);
    const shape = shapes[question.stimulus.shape];
    assert.ok(shape);
    assert.equal(question.correctAnswer, shape.label);
    assert.equal(question.stimulus.label, "mystery shape");
    assert.equal(question.prompt.includes(String(shape.sides) + " sides"), true);
    assert.equal(question.prompt.includes(shape.angle), true);
    assert.equal(question.prompt.includes(String(shape.lines) + " lines of symmetry"), true);
    assert.equal(question.stimulus.properties.includes(shape.angle), true);
    assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
  }
});

test("The Balance Beam Builders apply perimeter and area to rectangular platform stories", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-08.measurement-stories");
  assert.deepEqual(activity.skillIds, ["math.perimeter", "math.area"]);
  assert.equal(activity.generatorId, "quests.geometry-measurement-stories");
  const seenFocus = new Set();
  for (const tier of tiers) {
    for (let index = 0; index < 24; index += 1) {
      const options = { seed: "beam-builders:" + tier + ":" + index, tier };
      const question = generators.generate(activity, options);
      if (index === 0) assert.deepEqual(generators.generate(activity, options), question);
      const { width, height, focus, storyTitle, storyText } = question.stimulus;
      assert.ok(["perimeter", "area"].includes(focus));
      seenFocus.add(focus);
      assert.ok(storyTitle.length > 0);
      assert.ok(storyText.length > 0);
      assert.ok(question.prompt.includes(String(width) + " cm"));
      assert.ok(question.prompt.includes(String(height) + " cm"));
      assert.equal(
        question.correctAnswer,
        focus === "perimeter" ? 2 * (width + height) : width * height
      );
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.equal(question.choices.includes(question.correctAnswer), true);
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
  }
  assert.deepEqual([...seenFocus].sort(), ["area", "perimeter"]);
});

test("The Adaptation Pair Detective identifies an animal from two curated field observations", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-09.adaptation-pair-detective");
  assert.deepEqual(activity.skillIds, ["science.habitats", "science.adaptations"]);
  assert.equal(activity.generatorId, "quests.habitat-adaptation-pair");
  for (const tier of tiers) {
    const creatures = getHabitatCreatures(tier);
    const options = { seed: "adaptation-pair-detective:" + tier, tier };
    const question = generators.generate(activity, options);
    assert.deepEqual(generators.generate(activity, options), question);
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices).size, 4);
    assert.equal(question.choices.includes(question.correctAnswer), true);
    assert.equal(question.choices.every((choice) => creatures.some((creature) => creature.animal === choice)), true);
    const target = creatures.find((creature) => creature.animal === question.correctAnswer);
    assert.ok(target);
    assert.equal(question.stimulus.animal, "Mystery animal");
    assert.equal(question.stimulus.adaptationIds.length, 2);
    const pair = target.adaptations.filter((adaptation) => question.stimulus.adaptationIds.includes(adaptation.id));
    assert.equal(pair.length, 2);
    assert.equal(pair.every((adaptation) => question.stimulus.feature.includes(adaptation.feature)), true);
    assert.equal(pair.every((adaptation) => question.stimulus.description.includes(adaptation.description)), true);
    assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
  }
});

test("The Ecosystem Cause Tracker reasons backward from curated habitat effects", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-10.ecosystem-cause-tracker");
  assert.deepEqual(activity.skillIds, ["science.habitats"]);
  assert.equal(activity.generatorId, "quests.ecosystem-cause-tracker");
  const allConnections = getHabitatEcosystemConnections("core");
  const seenEffects = new Set();
  for (const tier of tiers) {
    const options = { seed: "ecosystem-cause-tracker:" + tier, tier };
    for (let index = 0; index < 24; index += 1) {
      const seeded = { seed: options.seed + ":" + index, tier };
      const question = generators.generate(activity, seeded);
      if (index === 0) assert.deepEqual(generators.generate(activity, seeded), question);
      const connection = allConnections.find((entry) =>
        entry.action === question.correctAnswer
        && entry.effect === question.stimulus.effect
        && entry.context === question.stimulus.context
      );
      assert.ok(connection);
      seenEffects.add(connection.id);
      assert.equal(question.stimulus.kind, "ecosystem-effect-clue");
      assert.equal(question.stimulus.title, "Sanctuary habitat monitor");
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.equal(question.choices.includes(connection.action), true);
      assert.deepEqual([...question.choices].sort(), allConnections.map((entry) => entry.action).sort());
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
  }
  assert.equal(seenEffects.size, allConnections.length);
});

test("The Life-Cycle Time Traveler identifies the immediately preceding plant stage", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-11.lifecycle-backtrack");
  const stages = getPlantLifecycleStages();
  assert.deepEqual(activity.skillIds, ["science.plant-life-cycles"]);
  assert.equal(activity.generatorId, "quests.plant-lifecycle-backtrack");

  for (const tier of tiers) {
    const transitions = getPlantLifecycleTransitions(tier);
    assert.equal(transitions.length, tier === "foundation" ? 2 : tier === "core" ? 3 : 4);
    for (let index = 0; index < 32; index += 1) {
      const options = { seed: "lifecycle-backtrack:" + tier + ":" + index, tier };
      const question = generators.generate(activity, options);
      assert.deepEqual(generators.generate(activity, options), question);
      const shownStage = question.stimulus.completedStages[0];
      const laterIndex = stages.findIndex((stage) => stage.id === shownStage.id);
      assert.ok(laterIndex > 0);
      assert.equal(question.correctAnswer, stages[laterIndex - 1].label);
      assert.ok(transitions.some((transition) =>
        transition.nextStage.id === shownStage.id
        && transition.currentStages.at(-1).label === question.correctAnswer
      ));
      assert.equal(question.stimulus.kind, "plant-lifecycle");
      assert.equal(question.stimulus.title, "Work backward from this stage");
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.equal(question.choices.includes(question.correctAnswer), true);
      assert.equal(question.choices.every((choice) => stages.some((stage) => stage.label === choice)), true);
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
  }
});

test("The Greenhouse Recipe Restorer applies photosynthesis inputs to incomplete recipe clues", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-12.photosynthesis-recipe-restorer");
  const canonicalInputs = ["Sunlight", "Water", "Carbon dioxide"];
  assert.deepEqual(activity.skillIds, ["science.plant-resources"]);
  assert.equal(activity.generatorId, "quests.plant-recipe-restorer");

  for (const tier of tiers) {
    const scenarios = getPlantPhotosynthesisRecipeScenarios(tier);
    assert.equal(scenarios.length, tier === "foundation" ? 1 : tier === "core" ? 2 : 3);
    for (let index = 0; index < 32; index += 1) {
      const options = { seed: "recipe-restorer:" + tier + ":" + index, tier };
      const question = generators.generate(activity, options);
      assert.deepEqual(generators.generate(activity, options), question);
      const scenario = scenarios.find((entry) =>
        entry.title === question.stimulus.title && entry.scenario === question.stimulus.scenario
      );
      assert.ok(scenario);
      assert.deepEqual(question.stimulus.roles, scenario.availableInputs);
      assert.equal(scenario.availableInputs.length, 2);
      assert.deepEqual(
        canonicalInputs.filter((resource) => !scenario.availableInputs.includes(resource)),
        [scenario.missingInput]
      );
      assert.equal(question.correctAnswer, scenario.missingInput);
      assert.equal(question.stimulus.kind, "photosynthesis-inputs");
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.equal(question.choices.includes(question.correctAnswer), true);
      assert.equal(question.choices.every((choice) =>
        [...canonicalInputs, "Oxygen", "Mineral nutrients"].includes(choice)
      ), true);
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
  }
  assert.throws(() => getPlantPhotosynthesisRecipeScenarios("expert"), /Unknown photosynthesis-recipe difficulty tier/);
});

test("The Grammar Twin Detective compares two curated words with a shared part of speech", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-13.grammar-pair-detective");
  const categories = ["noun", "verb", "adjective", "adverb"];
  assert.deepEqual(activity.skillIds, ["language.parts-of-speech"]);
  assert.equal(activity.generatorId, "quests.grammar-pair-detective");

  for (const tier of tiers) {
    const examples = getGrammarExamples(tier);
    for (let index = 0; index < 36; index += 1) {
      const options = { seed: "grammar-pair:" + tier + ":" + index, tier };
      const question = generators.generate(activity, options);
      assert.deepEqual(generators.generate(activity, options), question);
      assert.equal(question.stimulus.kind, "grammar-pair");
      assert.equal(question.stimulus.examples.length, 2);
      const pair = question.stimulus.examples.map((clue) => examples.find((example) =>
        example.sentence === clue.sentence && example.targetWord === clue.targetWord
      ));
      assert.equal(pair.every(Boolean), true);
      assert.notEqual(pair[0].id, pair[1].id);
      assert.equal(pair[0].partOfSpeech, pair[1].partOfSpeech);
      assert.equal(question.correctAnswer, pair[0].partOfSpeech);
      assert.equal(categories.includes(question.correctAnswer), true);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.deepEqual([...question.choices].sort(), [...categories].sort());
      assert.equal(question.choices.includes(question.correctAnswer), true);
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
  }
});

test("The Evidence Matchmaker selects a curated passage detail that supports its inference", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-14.evidence-matchmaker");
  assert.deepEqual(activity.skillIds, ["language.reading-inference"]);
  assert.equal(activity.generatorId, "quests.reading-evidence-match");

  for (const tier of tiers) {
    const passages = getReadingPassages(tier);
    const seen = new Set();
    for (let index = 0; index < 72; index += 1) {
      const options = { seed: "evidence-match:" + tier + ":" + index, tier };
      const question = generators.generate(activity, options);
      assert.deepEqual(generators.generate(activity, options), question);
      const passage = passages.find((entry) => entry.id === question.stimulus.passageId);
      assert.ok(passage);
      seen.add(passage.id);
      assert.equal(question.stimulus.kind, "reading-passage");
      assert.equal(question.stimulus.focus, "evidence");
      assert.equal(question.stimulus.claim, passage.evidenceClaim);
      assert.equal(question.correctAnswer, passage.inferenceEvidence);
      assert.ok(passage.passage.includes(question.correctAnswer));
      assert.equal(passage.inferenceEvidenceChoices.length, 4);
      assert.equal(passage.inferenceEvidenceChoices.includes(passage.inferenceEvidence), true);
      assert.equal(passage.inferenceEvidenceChoices.every((choice) => passage.passage.includes(choice)), true);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.every((choice) => passage.inferenceEvidenceChoices.includes(choice)));
      assert.equal(question.choices.includes(question.correctAnswer), true);
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
    assert.equal(seen.size, passages.length);
  }
});

test("The Metric Mislabel Mystery catches exactly one incorrect conversion card", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-15.metric-mislabel-mystery");
  assert.deepEqual(activity.skillIds, ["math.unit-conversion"]);
  assert.equal(activity.generatorId, "quests.metric-mislabel-audit");

  for (const tier of tiers) {
    const sourceProblems = getUnitConversionProblems(tier);
    const seen = new Set();
    for (let index = 0; index < 64; index += 1) {
      const options = { seed: "metric-mislabel:" + tier + ":" + index, tier };
      const question = generators.generate(activity, options);
      assert.deepEqual(generators.generate(activity, options), question);
      const cards = question.stimulus.cards;
      assert.equal(question.stimulus.kind, "measurement-audit");
      assert.equal(cards.length, 4);
      assert.equal(new Set(cards.map((card) => card.problemId)).size, 4);
      const incorrectCards = cards.filter((card) => card.isIncorrect);
      assert.equal(incorrectCards.length, 1);
      for (const card of cards) {
        const source = sourceProblems.find((problem) => problem.id === card.problemId);
        assert.ok(source);
        seen.add(source.id);
        assert.equal(card.sourceValue, Number(source.sourceValue).toLocaleString("en-US"));
        assert.equal(card.fromUnit, source.fromUnit);
        assert.equal(card.toUnit, source.toUnit);
        const correctNumber = Number.isInteger(source.resultValue)
          ? source.resultValue.toLocaleString("en-US") : String(source.resultValue);
        assert.equal(card.isIncorrect, card.reportedValue !== correctNumber);
      }
      assert.equal(question.correctAnswer, incorrectCards[0].label);
      assert.equal(question.choices.length, 4);
      assert.deepEqual([...question.choices].sort(), [...cards.map((card) => card.label)].sort());
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
    assert.equal(seen.size, sourceProblems.length);
  }
});

test("The Harbor Cargo Calculator combines two curated object masses by tier", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-16.harbor-cargo-total");
  assert.deepEqual(activity.skillIds, ["math.mass"]);
  assert.equal(activity.generatorId, "quests.harbor-cargo-total");

  for (const tier of tiers) {
    const problems = getMassBalanceProblems(tier);
    const possibleTotals = new Set();
    for (let first = 0; first < problems.length; first += 1) {
      for (let second = first + 1; second < problems.length; second += 1) {
        possibleTotals.add(problems[first].massGrams + problems[second].massGrams);
      }
    }
    for (let index = 0; index < 64; index += 1) {
      const options = { seed: "harbor-cargo:" + tier + ":" + index, tier };
      const question = generators.generate(activity, options);
      assert.deepEqual(generators.generate(activity, options), question);
      assert.equal(question.stimulus.kind, "measurement-combined-load");
      assert.equal(question.stimulus.items.length, 2);
      const items = question.stimulus.items.map((item) =>
        problems.find((problem) => problem.id === item.problemId)
      );
      assert.equal(items.every(Boolean), true);
      assert.notEqual(items[0].id, items[1].id);
      const expected = items[0].massGrams + items[1].massGrams;
      assert.equal(question.correctAnswer, expected.toLocaleString("en-US") + " g");
      assert.equal(possibleTotals.has(expected), true);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.equal(question.choices.includes(question.correctAnswer), true);
      assert.ok(question.choices.every((choice) =>
        [...possibleTotals].some((total) => choice === total.toLocaleString("en-US") + " g")
      ));
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
  }
});

test("The Chimera's Operation Blueprint distinguishes the correct event order at every tier", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-17.operation-blueprint");
  assert.deepEqual(activity.skillIds, ["math.multi-step-reasoning"]);
  assert.equal(activity.generatorId, "quests.chimera-operation-blueprint");

  const signature = (steps) => JSON.stringify(steps);
  for (const tier of tiers) {
    const problems = getMultiStepProblems(tier);
    const seen = new Set();
    for (let index = 0; index < 128; index += 1) {
      const options = { seed: "chimera-blueprint:" + tier + ":" + index, tier };
      const question = generators.generate(activity, options);
      assert.deepEqual(generators.generate(activity, options), question);
      const stimulus = question.stimulus;
      assert.equal(stimulus.kind, "chimera-operation-blueprint");
      const source = problems.find((problem) => problem.id === stimulus.problemId);
      assert.ok(source);
      seen.add(source.id);
      assert.equal(stimulus.startingValue, source.startValue);
      assert.equal(stimulus.story, source.story);
      assert.equal(stimulus.plans.length, 4);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.deepEqual(question.choices, stimulus.plans.map((plan) => plan.label));
      assert.deepEqual(stimulus.plans.map((plan) => plan.label), ["A", "B", "C", "D"]);
      const expectedSteps = source.steps.map((step) => ({
        operation: step.operation,
        operand: step.operand
      }));
      let computed = source.startValue;
      for (const step of source.steps) {
        if (step.operation === "add") computed += step.operand;
        else if (step.operation === "subtract") computed -= step.operand;
        else if (step.operation === "multiply") computed *= step.operand;
        else if (step.operation === "divide") computed /= step.operand;
        else assert.fail("Unexpected operation in curated multi-step problem.");
      }
      assert.equal(computed, source.answer);
      const matchingPlans = stimulus.plans.filter((plan) => signature(plan.steps) === signature(expectedSteps));
      assert.equal(matchingPlans.length, 1);
      assert.equal(question.correctAnswer, matchingPlans[0].label);
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
      assert.equal(new Set(stimulus.plans.map((plan) => signature(plan.steps))).size, 4);
    }
    assert.equal(seen.size, problems.length);
  }
});

test("The Workshop Supply Planner applies tiered multi-step arithmetic to new scenarios", () => {
  const activityRegistry = createActivityRegistry(sideQuestActivityDefinitions);
  const generators = createQuestionGeneratorRegistry();
  const activity = activityRegistry.get("quest-18.workshop-supply-plan");
  assert.deepEqual(activity.skillIds, ["math.multi-step-reasoning"]);
  assert.equal(activity.generatorId, "quests.chimera-supply-workshop");

  for (const tier of tiers) {
    const answers = new Set();
    for (let index = 0; index < 96; index += 1) {
      const options = { seed: "chimera-supply:" + tier + ":" + index, tier };
      const question = generators.generate(activity, options);
      assert.deepEqual(generators.generate(activity, options), question);
      const stimulus = question.stimulus;
      assert.equal(stimulus.kind, "chimera-supply-plan");
      assert.equal(stimulus.tier, tier);
      assert.ok(stimulus.story.includes("bundles"));
      let expected;
      if (tier === "foundation") {
        const { startingBundles, deliveredBundles, reservedBundles } = stimulus.quantities;
        expected = startingBundles + deliveredBundles - reservedBundles;
        assert.equal(stimulus.clues.length, 2);
        assert.ok(startingBundles > 0 && deliveredBundles > 0 && reservedBundles > 0);
      } else if (tier === "core") {
        const { crateCount, bundlesPerCrate, reservedBundles } = stimulus.quantities;
        expected = crateCount * bundlesPerCrate - reservedBundles;
        assert.equal(stimulus.clues.length, 2);
        assert.ok(crateCount >= 3 && bundlesPerCrate >= 14 && reservedBundles > 0);
        assert.ok(expected >= 20);
      } else {
        const { crateCount, bundlesPerCrate, reservedBundles, teamCount } = stimulus.quantities;
        const remaining = crateCount * bundlesPerCrate - reservedBundles;
        assert.equal(remaining % teamCount, 0);
        expected = remaining / teamCount;
        assert.equal(stimulus.clues.length, 3);
        assert.ok(crateCount >= 12 && bundlesPerCrate >= 18 && reservedBundles > 0);
        assert.ok(teamCount >= 3 && expected >= 20);
      }
      const formatted = expected.toLocaleString("en-US");
      assert.equal(question.correctAnswer, formatted);
      answers.add(formatted);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices.every((choice) => /^\d[\d,]*$/.test(choice)));
      assert.ok(question.choices.includes(question.correctAnswer));
      assert.equal(checkActivityAnswer(question.correctAnswer, question.correctAnswer, question.answerRules), true);
    }
    assert.ok(answers.size > 10);
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
    chapterOneDefinition, chapterTwoDefinition, chapterThreeDefinition,
    chapterFourDefinition, chapterFiveDefinition, chapterSixDefinition, chapterSevenDefinition, chapterEightDefinition, chapterNineDefinition, chapterTenDefinition, ...sideQuestDefinitions
  ]);
  const rewardRegistry = createRewardRegistry([
    chapterOneReward, chapterTwoReward, chapterThreeReward, chapterFourReward,
    chapterFiveReward, chapterSixReward, chapterSevenReward, chapterEightReward, chapterNineReward, chapterTenReward, ...sideQuestRewardDefinitions
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
    assert.equal(entry.prerequisitesMet, ["chapter-01", "chapter-02", "chapter-03"].includes(quest.sourceChapterId));
  }
  for (const id of ["quest-05", "quest-06", "quest-07", "quest-08", "quest-09", "quest-10"]) {
    assert.equal(afterChapterThree.find((item) => item.id === id).progress.status, "not-started");
  }
  const chapterFour = runtime.createSession("chapter-04");
  assert.equal(chapterFour.start().prerequisitesMet, true);
  for (let index = 0; index < chapterFourDefinition.activities.length; index += 1) {
    chapterFour.completeActivity();
  }
  assert.equal(chapterFour.getSnapshot().isComplete, true);
  const afterChapterFour = runtime.getSnapshot().chapters;
  for (const quest of sideQuestDefinitions) {
    const entry = afterChapterFour.find((item) => item.id === quest.id);
    assert.equal(entry.prerequisitesMet,
      ["chapter-01", "chapter-02", "chapter-03", "chapter-04"].includes(quest.sourceChapterId));
  }
  for (const id of ["quest-07", "quest-08", "quest-09", "quest-10"]) {
    assert.equal(afterChapterFour.find((item) => item.id === id).progress.status, "not-started");
  }
  const chapterFive = runtime.createSession("chapter-05");
  assert.equal(chapterFive.start().prerequisitesMet, true);
  for (let index = 0; index < chapterFiveDefinition.activities.length; index += 1) {
    chapterFive.completeActivity();
  }
  assert.equal(chapterFive.getSnapshot().isComplete, true);
  const afterChapterFive = runtime.getSnapshot().chapters;
  for (const quest of sideQuestDefinitions) {
    const entry = afterChapterFive.find((item) => item.id === quest.id);
    assert.equal(entry.prerequisitesMet, ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05"].includes(quest.sourceChapterId));
    if (quest.sourceChapterId === "chapter-06") assert.equal(entry.progress.status, "not-started");
  }
  for (const id of ["quest-09", "quest-10"]) {
    assert.equal(afterChapterFive.find((item) => item.id === id).progress.status, "not-started");
  }
  const chapterSix = runtime.createSession("chapter-06");
  assert.equal(chapterSix.start().prerequisitesMet, true);
  for (let index = 0; index < chapterSixDefinition.activities.length; index += 1) {
    chapterSix.completeActivity();
  }
  assert.equal(chapterSix.getSnapshot().isComplete, true);
  const afterChapterSix = runtime.getSnapshot().chapters;
  for (const quest of sideQuestDefinitions) {
    const entry = afterChapterSix.find((item) => item.id === quest.id);
    assert.equal(entry.prerequisitesMet, ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06"].includes(quest.sourceChapterId));
    assert.equal(entry.progress.status, "not-started");
  }
  const chapterSeven = runtime.createSession("chapter-07");
  assert.equal(chapterSeven.start().prerequisitesMet, true);
  for (let index = 0; index < chapterSevenDefinition.activities.length; index += 1) {
    chapterSeven.completeActivity();
  }
  assert.equal(chapterSeven.getSnapshot().isComplete, true);
  const afterChapterSeven = runtime.getSnapshot().chapters;
  for (const quest of sideQuestDefinitions) {
    const entry = afterChapterSeven.find((item) => item.id === quest.id);
    assert.equal(entry.prerequisitesMet, ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06", "chapter-07"].includes(quest.sourceChapterId));
    if (quest.sourceChapterId === "chapter-07") assert.equal(entry.progress.status, "not-started");
    if (quest.sourceChapterId === "chapter-08") assert.equal(entry.progress.status, "not-started");
  }
  const chapterEight = runtime.createSession("chapter-08");
  assert.equal(chapterEight.start().prerequisitesMet, true);
  for (let index = 0; index < chapterEightDefinition.activities.length; index += 1) {
    chapterEight.completeActivity();
  }
  assert.equal(chapterEight.getSnapshot().isComplete, true);
  const afterChapterEight = runtime.getSnapshot().chapters;
  for (const quest of sideQuestDefinitions) {
    const entry = afterChapterEight.find((item) => item.id === quest.id);
    assert.equal(entry.prerequisitesMet, ["chapter-01", "chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06", "chapter-07", "chapter-08"].includes(quest.sourceChapterId));
    assert.equal(entry.progress.status, "not-started");
  }
  const chapterNine = runtime.createSession("chapter-09");
  assert.equal(chapterNine.start().prerequisitesMet, true);
  for (let index = 0; index < chapterNineDefinition.activities.length; index += 1) {
    chapterNine.completeActivity();
  }
  assert.equal(chapterNine.getSnapshot().isComplete, true);
  const afterChapterNine = runtime.getSnapshot().chapters;
  for (const quest of sideQuestDefinitions) {
    const entry = afterChapterNine.find((item) => item.id === quest.id);
    assert.equal(entry.prerequisitesMet, true);
    assert.equal(entry.progress.status, "not-started");
  }
  const chapterTen = runtime.createSession("chapter-10");
  assert.equal(chapterTen.start().prerequisitesMet, true);
  chapterTen.exit();

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
  assert.equal(economy.rewardClaims[chapterFourReward.id], 1);
  assert.equal(economy.rewardClaims[chapterFiveReward.id], 1);
  assert.equal(economy.rewardClaims[chapterSixReward.id], 1);
  assert.equal(economy.rewardClaims[chapterSevenReward.id], 1);
  assert.equal(economy.rewardClaims[chapterEightReward.id], 1);
  assert.equal(economy.rewardClaims[chapterNineReward.id], 1);
  assert.equal(economy.starGems, 1835);
  assert.equal(economy.starlightSparkles, 128);
  store.destroy();
});
