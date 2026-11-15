import { validateActivityDefinition } from "./activityDefinitions.js";

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
});

function freezeRecursively(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeRecursively(child);
  }
  return value;
}

export function createQuestionGeneratorRegistry(customGenerators = {}) {
  if (!customGenerators || typeof customGenerators !== "object" || Array.isArray(customGenerators)) {
    throw new TypeError("customGenerators must be an object keyed by generator ID.");
  }
  const generators = new Map(Object.entries(BUILT_IN_GENERATORS));
  for (const [id, generator] of Object.entries(customGenerators)) {
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

  function generate(activity, { seed, tier = "core" } = {}) {
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
        || !Object.hasOwn(generated, "correctAnswer")) {
      throw new TypeError("Generator " + activity.generatorId + " must return a prompt and correctAnswer.");
    }
    const question = {
      id: activity.id + ":" + hashSeed(seed).toString(16),
      activityId: activity.id,
      tier,
      seed: typeof seed === "string" ? seed : String(seed),
      prompt: generated.prompt,
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
