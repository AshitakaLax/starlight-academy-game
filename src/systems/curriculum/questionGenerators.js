import { validateActivityDefinition } from "./activityDefinitions.js";
import { gameConfig } from "../../config/gameConfig.js";
import { getChapterThreeWords } from "../../data/wordBuildingLexicon.js";

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
        meaning: entry.meaning
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
