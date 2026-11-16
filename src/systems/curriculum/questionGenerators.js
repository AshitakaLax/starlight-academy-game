import { validateActivityDefinition } from "./activityDefinitions.js";
import { gameConfig } from "../../config/gameConfig.js";
import { getChapterThreeWords } from "../../data/wordBuildingLexicon.js";
import { getHabitatCreatures, getHabitatAdaptations, getHabitatEcosystemConnections } from "../../data/habitatLexicon.js";
import { getPlantLifecycleStages, getPlantLifecycleTransitions, getPlantResourceScenarios, photosynthesisChoiceBank, PHOTOSYNTHESIS_INPUTS_ANSWER } from "../../data/plantLexicon.js";
import { getGrammarExamples, getReadingPassages } from "../../data/languageArtsLexicon.js";
import { getVolumeScale, getMassBalanceProblems, getUnitConversionProblems, getElapsedTimeOptions } from "../../data/measurementLexicon.js";
import { getDivisionSettings, getMultiStepProblems } from "../../data/chimeraChallengeLexicon.js";

function hashSeed(seed) {
  if (typeof seed === "number" && Number.isFinite(seed)) return seed >>> 0;
  if (typeof seed !== "string" || seed.length === 0) {
    throw new TypeError("A question seed must be a finite number or a non-empty string.");
  }
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Small deterministic PRNG so question generation is reproducible offline. */
export function createSeededRandom(seed) {
  let state = hashSeed(seed);
  function next() {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
  return Object.freeze({
    next,
    integer(minimum, maximum) {
      if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || maximum < minimum) {
        throw new RangeError("Random integer bounds must be an ordered pair of integers.");
      }
      return minimum + Math.floor(next() * (maximum - minimum + 1));
    },
    pick(items) {
      if (!Array.isArray(items) || items.length === 0) throw new TypeError("pick() requires a non-empty array.");
      return items[Math.floor(next() * items.length)];
    },
    shuffle(items) {
      if (!Array.isArray(items)) throw new TypeError("shuffle() requires an array.");
      const result = items.slice();
      for (let index = result.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(next() * (index + 1));
        [result[index], result[swap]] = [result[swap], result[index]];
      }
      return result;
    }
  });
}

function makeChoices(correctAnswer, random, count = 4) {
  if (!Number.isInteger(count) || count < 2 || count > 6) {
    throw new RangeError("choiceCount must be an integer from 2 to 6.");
  }
  const choices = new Set([correctAnswer]);
  let guard = 0;
  while (choices.size < count && guard < 100) {
    guard += 1;
    const offset = random.integer(1, Math.max(3, Math.ceil(Math.abs(correctAnswer) * 0.35) + 2));
    const signed = random.next() < 0.5 ? -offset : offset;
    const candidate = Math.max(0, correctAnswer + signed);
    choices.add(candidate);
  }
  let fallback = 1;
  while (choices.size < count) {
    if (fallback !== correctAnswer) choices.add(fallback);
    fallback += 1;
  }
  return random.shuffle([...choices]);
}

function readInteger(constraints, key, minimum) {
  const value = constraints[key];
  if (!Number.isInteger(value) || value < minimum) {
    throw new TypeError("Generator constraint " + key + " must be an integer of at least " + minimum + ".");
  }
  return value;
}


const GEOMETRY_SHAPES = Object.freeze([
  Object.freeze({ name: "triangle", label: "equilateral triangle", sideCount: 3, sideClue: "3 equal sides", angleClue: "3 corners", symmetryLines: 3 }),
  Object.freeze({ name: "square", label: "square", sideCount: 4, sideClue: "4 equal sides", angleClue: "4 right angles", symmetryLines: 4 }),
  Object.freeze({ name: "rectangle", label: "rectangle", sideCount: 4, sideClue: "4 sides with opposite sides equal", angleClue: "4 right angles", symmetryLines: 2 }),
  Object.freeze({ name: "rhombus", label: "rhombus", sideCount: 4, sideClue: "4 equal sides", angleClue: "no right angles", symmetryLines: 2 }),
  Object.freeze({ name: "pentagon", label: "regular pentagon", sideCount: 5, sideClue: "5 equal sides", angleClue: "5 corners", symmetryLines: 5 }),
  Object.freeze({ name: "hexagon", label: "regular hexagon", sideCount: 6, sideClue: "6 equal sides", angleClue: "6 corners", symmetryLines: 6 })
]);
const GEOMETRY_SHAPE_TIERS = Object.freeze({
  foundation: ["triangle", "square", "rectangle", "pentagon"],
  core: ["triangle", "square", "rectangle", "rhombus", "pentagon", "hexagon"],
  stretch: ["triangle", "square", "rectangle", "rhombus", "pentagon", "hexagon"]
});
const GEOMETRY_ANGLE_DEGREES = Object.freeze({
  foundation: [35, 45, 60, 90, 120, 135],
  core: [25, 55, 75, 90, 105, 125, 150],
  stretch: [15, 40, 80, 90, 100, 130, 155, 180]
});
function makeDistinctChoices(correctAnswer, candidates, random, count = 4) {
  if (!Number.isInteger(count) || count < 2 || count > 6) {
    throw new RangeError("choiceCount must be an integer from 2 to 6.");
  }
  const choices = [correctAnswer];
  for (const candidate of random.shuffle([...new Set(candidates)])) {
    if (choices.length >= count) break;
    if (candidate !== correctAnswer) choices.push(candidate);
  }
  if (choices.length !== count) {
    throw new RangeError("The geometry question does not have enough distinct answer choices.");
  }
  return random.shuffle(choices);
}
function getGeometryShapes(tier) {
  const allowed = GEOMETRY_SHAPE_TIERS[tier];
  if (!allowed) throw new RangeError("Unknown geometry difficulty tier: " + tier);
  return allowed.map((name) => GEOMETRY_SHAPES.find((shape) => shape.name === name));
}
function createRectangleMeasurementQuestion({ random, constraints, focus }) {
  const widthMin = readInteger(constraints, "widthMin", 1);
  const widthMax = readInteger(constraints, "widthMax", widthMin);
  const heightMin = readInteger(constraints, "heightMin", 1);
  const heightMax = readInteger(constraints, "heightMax", heightMin);
  const choiceCount = readInteger(constraints, "choiceCount", 2);
  if (widthMax < widthMin || heightMax < heightMin || widthMax > 20 || heightMax > 20) {
    throw new RangeError("Rectangle measurement bounds must be ordered and no greater than 20.");
  }
  const width = random.integer(widthMin, widthMax);
  const height = random.integer(heightMin, heightMax);
  const correctAnswer = focus === "perimeter" ? 2 * (width + height) : width * height;
  const likelyErrors = focus === "perimeter"
    ? [width * height, width + height, 2 * width + height, width + 2 * height]
    : [2 * (width + height), width + height, width * 2, height * 2];
  const distractors = [
    ...likelyErrors, correctAnswer - 2, correctAnswer - 1,
    correctAnswer + 1, correctAnswer + 2, correctAnswer + 3
  ].filter((value) => Number.isInteger(value) && value >= 0 && value !== correctAnswer);
  return {
    prompt: focus === "perimeter"
      ? "What is the perimeter of this rectangle, in centimeters?"
      : "What is the area of this rectangle, in square centimeters?",
    correctAnswer,
    choices: makeDistinctChoices(correctAnswer, distractors, random, choiceCount),
    stimulus: Object.freeze({ kind: "geometry-rectangle", focus, width, height, unit: "cm" })
  };
}


const BUILT_IN_GENERATORS = Object.freeze({
  "arithmetic.multiplication": ({ random, constraints }) => {
    const factorMin = readInteger(constraints, "factorMin", 1);
    const factorMax = readInteger(constraints, "factorMax", factorMin);
    const multiplierMin = readInteger(constraints, "multiplierMin", 1);
    const multiplierMax = readInteger(constraints, "multiplierMax", multiplierMin);
    if (factorMax < factorMin || multiplierMax < multiplierMin) {
      throw new RangeError("Multiplication constraint ranges must be ordered.");
    }
    const left = random.integer(factorMin, factorMax);
    const right = random.integer(multiplierMin, multiplierMax);
    const correctAnswer = left * right;
    return {
      prompt: "What is " + left + " × " + right + "?",
      correctAnswer,
      choices: makeChoices(correctAnswer, random, constraints.choiceCount ?? 4),
      stimulus: Object.freeze({ left, right, operation: "multiplication" })
    };
  },
  "arithmetic.addition": ({ random, constraints }) => {
    const minimum = readInteger(constraints, "operandMin", 0);
    const maximum = readInteger(constraints, "operandMax", minimum);
    if (maximum < minimum) throw new RangeError("Addition operand range must be ordered.");
    const left = random.integer(minimum, maximum);
    const right = random.integer(minimum, maximum);
    const correctAnswer = left + right;
    return {
      prompt: "What is " + left + " + " + right + "?",
      correctAnswer,
      choices: makeChoices(correctAnswer, random, constraints.choiceCount ?? 4),
      stimulus: Object.freeze({ left, right, operation: "addition" })
    };
  },
  "number.skip-counting": ({ random, constraints }) => {
    const startMin = readInteger(constraints, "startMin", 0);
    const startMax = readInteger(constraints, "startMax", startMin);
    const stepMin = readInteger(constraints, "stepMin", 1);
    const stepMax = readInteger(constraints, "stepMax", stepMin);
    const sequenceLength = readInteger(constraints, "sequenceLength", 3);
    if (startMax < startMin || stepMax < stepMin || sequenceLength > 8) {
      throw new RangeError("Skip-counting constraints contain an invalid range or sequence length.");
    }
    const start = random.integer(startMin, startMax);
    const step = random.integer(stepMin, stepMax);
    const sequence = Array.from({ length: sequenceLength }, (_, index) => start + step * index);
    const correctAnswer = start + step * sequenceLength;
    return {
      prompt: "What number comes next? " + sequence.join(", ") + ", …",
      correctAnswer,
      choices: makeChoices(correctAnswer, random, constraints.choiceCount ?? 4),
      stimulus: Object.freeze({ sequence, step })
    };
  }
  ,
  "fractions.identify": ({ random, constraints }) => {
    const denominatorMin = readInteger(constraints, "denominatorMin", 4);
    const denominatorMax = readInteger(constraints, "denominatorMax", denominatorMin);
    if (denominatorMax < denominatorMin || denominatorMax > 12) {
      throw new RangeError("Fraction denominator bounds must be ordered and no greater than 12.");
    }
    const denominator = random.integer(denominatorMin, denominatorMax);
    const numerator = random.integer(1, denominator - 1);
    const correctAnswer = numerator + "/" + denominator;
    const distractorNumerators = random.shuffle(
      Array.from({ length: denominator }, (_, index) => index + 1)
        .filter((value) => value !== numerator)
    ).slice(0, Math.max(0, (constraints.choiceCount ?? 4) - 1));
    const choices = random.shuffle([
      correctAnswer,
      ...distractorNumerators.map((value) => value + "/" + denominator)
    ]);
    return {
      prompt: "What fraction of the whole is shaded?",
      correctAnswer,
      choices,
      stimulus: Object.freeze({
        kind: "fraction-bars",
        bars: [Object.freeze({
          label: "Shaded parts",
          numerator,
          denominator,
          showValue: false
        })]
      })
    };
  },
  "fractions.equivalent": ({ random, constraints }) => {
    const denominatorMin = readInteger(constraints, "denominatorMin", 2);
    const denominatorMax = readInteger(constraints, "denominatorMax", denominatorMin);
    const multiplierMin = readInteger(constraints, "multiplierMin", 2);
    const multiplierMax = readInteger(constraints, "multiplierMax", multiplierMin);
    if (denominatorMax < denominatorMin || multiplierMax < multiplierMin) {
      throw new RangeError("Equivalent-fraction ranges must be ordered.");
    }
    const denominator = random.integer(denominatorMin, denominatorMax);
    const numerator = random.integer(1, denominator - 1);
    const multiplier = random.integer(multiplierMin, multiplierMax);
    const equivalentNumerator = numerator * multiplier;
    const equivalentDenominator = denominator * multiplier;
    const correctAnswer = equivalentNumerator + "/" + equivalentDenominator;
    const distractors = random.shuffle(
      Array.from({ length: equivalentDenominator }, (_, index) => index + 1)
        .filter((value) => value !== equivalentNumerator)
    ).slice(0, Math.max(0, (constraints.choiceCount ?? 4) - 1));
    const choices = random.shuffle([
      correctAnswer,
      ...distractors.map((value) => value + "/" + equivalentDenominator)
    ]);
    return {
      prompt: "Which fraction names the same amount as " + numerator + "/" + denominator + "?",
      correctAnswer,
      choices,
      stimulus: Object.freeze({
        kind: "fraction-bars",
        bars: [Object.freeze({
          label: "Starting fraction",
          numerator,
          denominator,
          showValue: true
        })]
      })
    };
  },
  "geometry.shape-properties": ({ random, constraints, tier }) => {
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    const shapes = getGeometryShapes(tier);
    const shape = random.pick(shapes);
    return {
      prompt: "Which shape has " + shape.sideClue + " and " + shape.angleClue + "?",
      correctAnswer: shape.label,
      choices: makeDistinctChoices(shape.label, shapes.map((candidate) => candidate.label), random, choiceCount),
      stimulus: Object.freeze({
        kind: "geometry-shape", focus: "shape", shape: shape.name, label: shape.label,
        sideCount: shape.sideCount, symmetryLines: shape.symmetryLines,
        properties: shape.sideClue + " · " + shape.angleClue
      })
    };
  },
  "geometry.symmetry": ({ random, constraints, tier }) => {
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    const shapes = getGeometryShapes(tier);
    const shape = random.pick(shapes);
    return {
      prompt: "How many lines of symmetry does a " + shape.label + " have?",
      correctAnswer: shape.symmetryLines,
      choices: makeDistinctChoices(shape.symmetryLines, shapes.map((candidate) => candidate.symmetryLines), random, choiceCount),
      stimulus: Object.freeze({
        kind: "geometry-shape", focus: "symmetry", shape: shape.name, label: shape.label,
        sideCount: shape.sideCount, symmetryLines: shape.symmetryLines,
        properties: "Imagine folding the shape so both halves match exactly."
      })
    };
  },
  "geometry.angles": ({ random, constraints, tier }) => {
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    const degrees = random.pick(GEOMETRY_ANGLE_DEGREES[tier]);
    const correctAnswer = degrees < 90 ? "acute"
      : degrees === 90 ? "right"
      : degrees < 180 ? "obtuse" : "straight";
    const categories = ["acute", "right", "obtuse", "straight"];
    return {
      prompt: "What kind of angle measures " + degrees + "°?",
      correctAnswer,
      choices: makeDistinctChoices(correctAnswer, categories, random, choiceCount),
      stimulus: Object.freeze({ kind: "geometry-angle", degrees, angleType: correctAnswer })
    };
  },
  "geometry.perimeter": ({ random, constraints }) =>
    createRectangleMeasurementQuestion({ random, constraints, focus: "perimeter" }),
  "geometry.area": ({ random, constraints }) =>
    createRectangleMeasurementQuestion({ random, constraints, focus: "area" }),
  "botany.lifecycle-next": ({ random, constraints, tier }) => {
    const transition = random.pick(getPlantLifecycleTransitions(tier));
    const stages = getPlantLifecycleStages();
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Which plant life-cycle stage comes next?",
      correctAnswer: transition.nextStage.label,
      choices: makeDistinctChoices(transition.nextStage.label, stages.map((stage) => stage.label), random, choiceCount),
      stimulus: Object.freeze({
        kind: "plant-lifecycle",
        completedStages: transition.currentStages.map((stage) => Object.freeze({
          id: stage.id, label: stage.label, description: stage.description
        }))
      })
    };
  },
  "botany.resource-choice": ({ random, constraints, tier }) => {
    const scenarios = getPlantResourceScenarios(tier);
    const scenario = random.pick(scenarios);
    const resourceChoices = getPlantResourceScenarios("stretch").map((entry) => entry.resource);
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Which resource would most directly help this plant?",
      correctAnswer: scenario.resource,
      choices: makeDistinctChoices(scenario.resource, resourceChoices, random, choiceCount),
      stimulus: Object.freeze({
        kind: "plant-resource-scenario",
        scenarioId: scenario.id, title: scenario.title,
        scenario: scenario.scenario, explanation: scenario.explanation
      })
    };
  },
  "botany.photosynthesis-inputs": ({ random, constraints }) => {
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Which three inputs does a plant use in photosynthesis to make sugars?",
      correctAnswer: PHOTOSYNTHESIS_INPUTS_ANSWER,
      choices: makeDistinctChoices(
        PHOTOSYNTHESIS_INPUTS_ANSWER,
        photosynthesisChoiceBank.filter((choice) => choice !== PHOTOSYNTHESIS_INPUTS_ANSWER),
        random,
        choiceCount
      ),
      stimulus: Object.freeze({
        kind: "photosynthesis-inputs",
        title: "The greenhouse recipe card",
        roles: ["Energy from light", "Taken in through roots", "Taken in from air"]
      })
    };
  },
  "habitats.biome-match": ({ random, constraints, tier }) => {
    const creatures = getHabitatCreatures(tier);
    const creature = random.pick(creatures);
    const choices = creatures.map((entry) => entry.habitatLabel);
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Read the animal's climate, food, and shelter clues. Which habitat is the best match?",
      correctAnswer: creature.habitatLabel,
      choices: makeDistinctChoices(creature.habitatLabel, choices, random, choiceCount),
      stimulus: Object.freeze({
        kind: "habitat-creature", animal: creature.animal, symbol: creature.symbol,
        climateClue: creature.climateClue, needsClue: creature.needsClue
      })
    };
  },
  "habitats.adaptation-type": ({ random, constraints, tier }) => {
    const adaptations = getHabitatAdaptations(tier);
    const adaptation = random.pick(adaptations);
    const categories = ["structural", "behavioral"];
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Is this a structural body feature or a behavioral action?",
      correctAnswer: adaptation.type,
      choices: makeDistinctChoices(adaptation.type, categories, random, choiceCount),
      stimulus: Object.freeze({
        kind: "adaptation-clue", animal: adaptation.animal, symbol: adaptation.symbol,
        feature: adaptation.feature, description: adaptation.description, focus: "type"
      })
    };
  },
  "habitats.adaptation-purpose": ({ random, constraints, tier }) => {
    const adaptations = getHabitatAdaptations(tier);
    const adaptation = random.pick(adaptations);
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "How does this adaptation help the animal survive?",
      correctAnswer: adaptation.purpose,
      choices: makeDistinctChoices(adaptation.purpose, adaptations.map((entry) => entry.purpose), random, choiceCount),
      stimulus: Object.freeze({
        kind: "adaptation-clue", animal: adaptation.animal, symbol: adaptation.symbol,
        feature: adaptation.feature, description: adaptation.description, focus: "purpose"
      })
    };
  },
  "habitats.ecosystem-connection": ({ random, constraints, tier }) => {
    const connections = getHabitatEcosystemConnections(tier);
    const connection = random.pick(connections);
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "How can this action affect the ecosystem?",
      correctAnswer: connection.effect,
      choices: makeDistinctChoices(connection.effect, connections.map((entry) => entry.effect), random, choiceCount),
      stimulus: Object.freeze({
        kind: "ecosystem-connection", organism: connection.organism, symbol: connection.symbol,
        action: connection.action, context: connection.context
      })
    };
  },
  "language.word-building": ({ random, constraints, tier }) => {
    const focus = constraints.focus;
    if (!["prefix", "suffix"].includes(focus)) {
      throw new TypeError("Word-building focus must be prefix or suffix.");
    }
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    if (choiceCount > 6) throw new RangeError("Word-building choiceCount cannot exceed 6.");
    const candidates = getChapterThreeWords(tier).filter((entry) =>
      focus === "prefix" ? entry.prefixes.length > 0 : entry.suffixes.length > 0
    );
    if (candidates.length === 0) {
      throw new RangeError("No curated words are available for " + focus + " practice at tier " + tier + ".");
    }
    const entry = random.pick(candidates);
    const componentOptions = [
      ...entry.prefixes.map((part) => ({
        label: "Prefix",
        text: part.display,
        meaning: part.meaning
      })),
      { label: "Root",
        text: entry.root.text,
        meaning: entry.root.meaning
      },
      ...entry.suffixes.map((part) => ({
        label: "Suffix",
        text: part.display,
        meaning: part.meaning
      }))
    ];
    const distractors = random.shuffle(
      getChapterThreeWords(tier).filter((candidate) => candidate.word !== entry.word)
    ).slice(0, choiceCount - 1);
    const choices = random.shuffle([entry.word, ...distractors.map((candidate) => candidate.word)]);
    return {
      prompt: "Choose the correctly spelled word formed by the parts shown.",
      correctAnswer: entry.word,
      choices,
      stimulus: Object.freeze({
        kind: "word-parts",
        title: focus === "prefix" ? "Add a beginning" : "Add an ending",
        instruction: "Read each word part from left to right, then blend the parts together.",
        components: componentOptions,
        meaning: entry.meaning,
        ...(entry.spellingNote ? { spellingNote: entry.spellingNote } : {})
      })
    };
  },
  "language.context-potion": ({ random, constraints, tier }) => {
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    if (choiceCount > 6) throw new RangeError("Context-potion choiceCount cannot exceed 6.");
    const entries = getChapterThreeWords(tier);
    if (entries.length < choiceCount) {
      throw new RangeError("The curated word bank does not have enough distinct choices for tier " + tier + ".");
    }
    const entry = random.pick(entries);
    const distractors = random.shuffle(entries.filter((candidate) => candidate.word !== entry.word))
      .slice(0, choiceCount - 1);
    const choices = random.shuffle([entry.meaning, ...distractors.map((candidate) => candidate.meaning)]);
    return {
      prompt: "Read the potion note. Which meaning of “" + entry.word + "” best fits the sentence?",
      correctAnswer: entry.meaning,
      choices,
      stimulus: Object.freeze({
        kind: "context-potion",
        title: "A clue from the cauldron",
        word: entry.word,
        sentence: entry.sentence,
        root: Object.freeze({
          text: entry.root.text,
          meaning: entry.root.meaning
        }),
        components: [
          ...entry.prefixes.map((part) => Object.freeze({
            label: "Prefix",
            text: part.display,
            meaning: part.meaning
          })),
          ...entry.suffixes.map((part) => Object.freeze({
            label: "Suffix",
            text: part.display,
            meaning: part.meaning
          }))
        ]
      })
    };
  }
  ,
  "language.parts-of-speech": ({ random, constraints, tier }) => {
    const examples = getGrammarExamples(tier);
    const example = random.pick(examples);
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    const categories = ["noun", "verb", "adjective", "adverb"];
    return {
      prompt: "What part of speech is the highlighted word?",
      correctAnswer: example.partOfSpeech,
      choices: makeDistinctChoices(example.partOfSpeech, categories, random, choiceCount),
      stimulus: Object.freeze({
        kind: "grammar-target",
        exampleId: example.id,
        sentence: example.sentence,
        targetWord: example.targetWord
      })
    };
  },
  "language.reading-main-idea": ({ random, constraints, tier }) => {
    const passage = random.pick(getReadingPassages(tier));
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Which statement best expresses the main idea of this passage?",
      correctAnswer: passage.mainIdea,
      choices: makeDistinctChoices(passage.mainIdea, passage.mainIdeaChoices, random, choiceCount),
      stimulus: Object.freeze({
        kind: "reading-passage",
        passageId: passage.id,
        title: passage.title,
        passage: passage.passage,
        focus: "main-idea"
      })
    };
  },
  "language.reading-inference": ({ random, constraints, tier }) => {
    const passage = random.pick(getReadingPassages(tier));
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Which conclusion can you reasonably infer from the passage?",
      correctAnswer: passage.inference,
      choices: makeDistinctChoices(passage.inference, passage.inferenceChoices, random, choiceCount),
      stimulus: Object.freeze({
        kind: "reading-passage",
        passageId: passage.id,
        title: passage.title,
        passage: passage.passage,
        focus: "inference"
      })
    };
  }
  ,
  "measurement.volume-reading": ({ random, constraints, tier }) => {
    const scale = getVolumeScale(tier);
    const reading = random.pick(scale.availableReadings);
    const correctAnswer = reading.toLocaleString("en-US") + " mL";
    const choices = scale.graduations.map((entry) => entry.value.toLocaleString("en-US") + " mL");
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "How much liquid is in the beaker?",
      correctAnswer,
      choices: makeDistinctChoices(correctAnswer, choices, random, choiceCount),
      stimulus: Object.freeze({
        kind: "measurement-beaker",
        capacityMl: scale.capacityMl,
        graduationMl: scale.graduationMl,
        fillValueMl: reading,
        graduations: scale.graduations.map((entry) => Object.freeze(entry))
      })
    };
  },
  "measurement.mass-balance": ({ random, constraints, tier }) => {
    const problems = getMassBalanceProblems(tier);
    const problem = random.pick(problems);
    const step = tier === "foundation" ? 100 : tier === "core" ? 50 : 25;
    const correctAnswer = problem.massGrams.toLocaleString("en-US") + " g";
    const candidates = Array.from({ length: 10 }, (_, index) => problem.massGrams + (index + 1) * step)
      .concat(Array.from({ length: 8 }, (_, index) => Math.max(step, problem.massGrams - (index + 1) * step)))
      .map((value) => value.toLocaleString("en-US") + " g");
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "The balance is level. What is the mass of the object?",
      correctAnswer,
      choices: makeDistinctChoices(correctAnswer, candidates, random, choiceCount),
      stimulus: Object.freeze({
        kind: "measurement-balance",
        problemId: problem.id,
        object: problem.object,
        weights: problem.weights.map((value) => value.toLocaleString("en-US") + " g"),
        unit: "g"
      })
    };
  },
  "measurement.unit-conversion": ({ random, constraints, tier }) => {
    const problem = random.pick(getUnitConversionProblems(tier));
    const answerValue = Number.isInteger(problem.resultValue)
      ? problem.resultValue.toLocaleString("en-US")
      : String(problem.resultValue);
    const correctAnswer = answerValue + " " + problem.toUnit;
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Convert the measurement to the requested unit.",
      correctAnswer,
      choices: makeDistinctChoices(correctAnswer, problem.choices, random, choiceCount),
      stimulus: Object.freeze({
        kind: "measurement-conversion",
        problemId: problem.id,
        sourceValue: problem.sourceValue.toLocaleString("en-US"),
        fromUnit: problem.fromUnit,
        toUnit: problem.toUnit
      })
    };
  },
  "measurement.elapsed-time": ({ random, constraints, tier }) => {
    const options = getElapsedTimeOptions(tier);
    const startSlots = Math.floor((options.maximumStart - options.minimumStart) / options.startStep);
    const startMinutes = options.minimumStart + random.integer(0, startSlots) * options.startStep;
    const elapsedMinutes = random.pick(options.durationChoices);
    const finishMinutes = startMinutes + elapsedMinutes;
    const formatClockTime = (value) => {
      const hour24 = Math.floor(value / 60);
      const minute = value % 60;
      const hour12 = hour24 % 12 || 12;
      return hour12 + ":" + String(minute).padStart(2, "0") + (hour24 < 12 ? " AM" : " PM");
    };
    const formatDuration = (value) => {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      if (hours === 0) return minutes + " minutes";
      if (minutes === 0) return hours + (hours === 1 ? " hour" : " hours");
      return hours + (hours === 1 ? " hour " : " hours ") + minutes + " minutes";
    };
    const correctAnswer = formatDuration(elapsedMinutes);
    const candidates = options.durationChoices.map(formatDuration);
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "How much time passes between the start and finish?",
      correctAnswer,
      choices: makeDistinctChoices(correctAnswer, candidates, random, choiceCount),
      stimulus: Object.freeze({
        kind: "measurement-elapsed-time",
        startTime: formatClockTime(startMinutes),
        finishTime: formatClockTime(finishMinutes),
        elapsedMinutes
      })
    };
  }
  ,
  "reasoning.division": ({ random, constraints, tier }) => {
    const settings = getDivisionSettings(tier);
    const divisor = random.integer(settings.divisorMin, settings.divisorMax);
    const quotient = random.integer(settings.quotientMin, settings.quotientMax);
    const total = divisor * quotient;
    const items = ["pearls", "shells", "star tokens", "glass beads"];
    const groups = ["baskets", "boxes", "teams", "trays"];
    const itemLabel = random.pick(items);
    const groupLabel = random.pick(groups);
    const correctAnswer = String(quotient);
    const candidates = Array.from({ length: 12 }, (_, index) => Math.max(1, quotient + index - 5));
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Share the collection equally. How many go in each group?",
      correctAnswer,
      choices: makeDistinctChoices(quotient, candidates, random, choiceCount).map(String),
      stimulus: Object.freeze({
        kind: "chimera-division",
        total,
        divisor,
        itemLabel,
        groupLabel
      })
    };
  },
  "reasoning.multi-digit-arithmetic": ({ random, constraints, tier }) => {
    let left;
    let right;
    let operation;
    if (tier === "foundation") {
      operation = random.pick(["addition", "subtraction"]);
      if (operation === "addition") {
        const leftTens = random.integer(2, 4);
        const rightTens = random.integer(1, 4);
        const leftOnes = random.integer(0, 4);
        const rightOnes = random.integer(0, 9 - leftOnes);
        left = leftTens * 10 + leftOnes;
        right = rightTens * 10 + rightOnes;
      } else {
        const leftTens = random.integer(4, 9);
        const rightTens = random.integer(1, leftTens - 1);
        const leftOnes = random.integer(1, 9);
        const rightOnes = random.integer(0, leftOnes);
        left = leftTens * 10 + leftOnes;
        right = rightTens * 10 + rightOnes;
      }
    } else if (tier === "core") {
      operation = random.pick(["addition", "subtraction", "multiplication"]);
      if (operation === "addition") {
        left = random.integer(125, 499);
        right = random.integer(125, 399);
      } else if (operation === "subtraction") {
        left = random.integer(600, 899);
        right = random.integer(150, 399);
      } else {
        left = random.integer(12, 49);
        right = random.integer(2, 9);
      }
    } else {
      operation = random.pick(["addition", "subtraction", "multiplication"]);
      if (operation === "addition") {
        left = random.integer(1200, 4800);
        right = random.integer(1100, 3900);
      } else if (operation === "subtraction") {
        left = random.integer(3500, 8999);
        right = random.integer(1000, 2999);
      } else {
        left = random.integer(24, 99);
        right = random.integer(12, 39);
      }
    }
    const symbols = { addition: "+", subtraction: "−", multiplication: "×" };
    const correctValue = operation === "addition" ? left + right
      : operation === "subtraction" ? left - right : left * right;
    const candidates = [
      correctValue + 1, correctValue - 1, correctValue + 10, correctValue - 10,
      correctValue + 100, correctValue - 100, correctValue + 1000, correctValue - 1000,
      left + right, Math.abs(left - right), left * right
    ].filter((value) => Number.isInteger(value) && value >= 0 && value !== correctValue);
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: "Solve the multi-digit calculation.",
      correctAnswer: correctValue.toLocaleString("en-US"),
      choices: makeDistinctChoices(correctValue, candidates, random, choiceCount).map((value) => value.toLocaleString("en-US")),
      stimulus: Object.freeze({
        kind: "chimera-arithmetic",
        left: left.toLocaleString("en-US"),
        right: right.toLocaleString("en-US"),
        leftValue: left,
        rightValue: right,
        operation,
        symbol: symbols[operation]
      })
    };
  },
  "reasoning.multi-step": ({ random, constraints, tier }) => {
    const problem = random.pick(getMultiStepProblems(tier));
    const correctAnswer = String(problem.answer);
    const candidates = [
      problem.answer + 1, problem.answer - 1, problem.answer + 2, problem.answer - 2,
      problem.answer + 5, problem.answer - 5, problem.answer + 10, problem.answer - 10,
      problem.answer + 20, problem.answer - 20, problem.answer + 25
    ].filter((value) => Number.isInteger(value) && value >= 0 && value !== problem.answer);
    const choiceCount = readInteger(constraints, "choiceCount", 2);
    return {
      prompt: problem.question,
      correctAnswer,
      choices: makeDistinctChoices(problem.answer, candidates, random, choiceCount).map(String),
      stimulus: Object.freeze({
        kind: "chimera-multi-step",
        problemId: problem.id,
        title: problem.title,
        story: problem.story,
        question: problem.question,
        stepPrompts: problem.stepPrompts.slice()
      })
    };
  }
});

function freezeRecursively(value) {
  if (!value || typeof value !== "object") return value;
  for (const child of Object.values(value)) freezeRecursively(child);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

export function createQuestionGeneratorRegistry(customGenerators = {}) {
  if (!customGenerators || typeof customGenerators !== "object" || Array.isArray(customGenerators)) {
    throw new TypeError("customGenerators must be an object keyed by generator ID.");
  }
  const generators = new Map(Object.entries(BUILT_IN_GENERATORS));
  for (const [id, generator] of Object.entries(customGenerators)) {
    if (!/^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)+$/.test(id)) throw new TypeError("Generator ID must be namespaced.");
    if (typeof generator !== "function") throw new TypeError("Generator " + id + " must be a function.");
    if (generators.has(id)) throw new Error("Cannot replace built-in generator: " + id);
    generators.set(id, generator);
  }

  function register(id, generator) {
    if (typeof id !== "string" || !/^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)+$/.test(id)) {
      throw new TypeError("Generator ID must be namespaced.");
    }
    if (typeof generator !== "function") throw new TypeError("A question generator must be a function.");
    if (generators.has(id)) throw new Error("Question generator already registered: " + id);
    generators.set(id, generator);
    return () => generators.delete(id);
  }

  function generate(activity, { seed, tier = gameConfig.curriculum.defaultTier } = {}) {
    const validation = validateActivityDefinition(activity);
    if (validation !== true) throw new TypeError(validation);
    if (!activity.supportedTiers.includes(tier)) {
      throw new RangeError("Activity " + activity.id + " does not support the " + tier + " tier.");
    }
    const generator = generators.get(activity.generatorId);
    if (!generator) throw new Error("Unknown question generator: " + activity.generatorId);
    const random = createSeededRandom(seed);
    const constraints = activity.generatorConstraints[tier];
    const generated = generator({ random, constraints, activity, seed, tier });
    if (!generated || typeof generated !== "object"
        || typeof generated.prompt !== "string" || !generated.prompt.trim()
        || !Object.hasOwn(generated, "correctAnswer")
        || generated.correctAnswer === null || generated.correctAnswer === undefined) {
      throw new TypeError("Generator " + activity.generatorId + " must return a prompt and correctAnswer.");
    }
    const question = {
      id: activity.id + ":" + tier + ":" + hashSeed(seed).toString(16),
      activityId: activity.id,
      tier,
      skillIds: activity.skillIds.slice(),
      objectives: activity.objectives.slice(),
      seed: typeof seed === "string" ? seed : String(seed),
      prompt: generated.prompt.trim(),
      correctAnswer: generated.correctAnswer,
      answerRules: activity.answerRules,
      ...(Array.isArray(generated.choices) ? { choices: generated.choices.slice() } : {}),
      ...(generated.stimulus ? { stimulus: generated.stimulus } : {})
    };
    return freezeRecursively(question);
  }

  return Object.freeze({
    register,
    has(id) { return generators.has(id); },
    generate,
    list() { return [...generators.keys()].sort(); }
  });
}

const defaultGeneratorRegistry = createQuestionGeneratorRegistry();

export function generateQuestion(activity, options) {
  return defaultGeneratorRegistry.generate(activity, options);
}
