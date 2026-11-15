import { getDifficultyTier, DIFFICULTY_TIER_IDS } from "./difficultyTiers.js";
import { getSkillDefinition } from "./skillRegistry.js";

const ACTIVITY_ID_PATTERN = /^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)+$/;
const ANSWER_RULE_TYPES = Object.freeze(["numeric", "exact", "choice", "sequence"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function freezeRecursively(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeRecursively(child);
  }
  return value;
}

function cloneJsonObject(value, label) {
  if (!isPlainObject(value)) throw new TypeError(label + " must be a plain object.");
  let serialized;
  try { serialized = JSON.stringify(value); } catch {
    throw new TypeError(label + " must contain only serializable data.");
  }
  if (typeof serialized !== "string") throw new TypeError(label + " must contain only serializable data.");
  const copy = JSON.parse(serialized);
  if (!isPlainObject(copy)) throw new TypeError(label + " must be a plain object.");
  return copy;
}

export function validateActivityDefinition(input) {
  if (!isPlainObject(input)) return "An activity definition must be a plain object.";
  if (typeof input.id !== "string" || !ACTIVITY_ID_PATTERN.test(input.id)) {
    return "Activity id must be a stable namespaced identifier.";
  }
  if (typeof input.title !== "string" || input.title.trim().length < 3) {
    return "Activity title must contain at least three characters.";
  }
  if (!Array.isArray(input.skillIds) || input.skillIds.length === 0
      || input.skillIds.some((id) => typeof id !== "string" || !getSkillDefinition(id))
      || new Set(input.skillIds).size !== input.skillIds.length) {
    return "Activity skillIds must contain unique IDs from the skill registry.";
  }
  if (!Array.isArray(input.objectives) || input.objectives.length === 0
      || input.objectives.some((objective) => typeof objective !== "string" || !objective.trim())) {
    return "Activity objectives must contain at least one non-empty objective.";
  }
  if (!Array.isArray(input.supportedTiers) || input.supportedTiers.length === 0
      || input.supportedTiers.some((tier) => !getDifficultyTier(tier))
      || new Set(input.supportedTiers).size !== input.supportedTiers.length) {
    return "Activity supportedTiers must contain unique registered difficulty tiers.";
  }
  if (!isPlainObject(input.answerRules) || !ANSWER_RULE_TYPES.includes(input.answerRules.type)) {
    return "Activity answerRules.type must be numeric, exact, choice, or sequence.";
  }
  if (input.answerRules.type === "numeric" && input.answerRules.tolerance !== undefined
      && (!Number.isFinite(input.answerRules.tolerance) || input.answerRules.tolerance < 0)) {
    return "Numeric answer tolerance must be a finite non-negative number.";
  }
  if (typeof input.generatorId !== "string" || !ACTIVITY_ID_PATTERN.test(input.generatorId)) {
    return "Activity generatorId must be a stable namespaced identifier.";
  }
  if (!isPlainObject(input.generatorConstraints)) {
    return "Activity generatorConstraints must be a plain object keyed by difficulty tier.";
  }
  const constraintTiers = Object.keys(input.generatorConstraints);
  if (constraintTiers.length !== input.supportedTiers.length
      || constraintTiers.some((tier) => !input.supportedTiers.includes(tier)
        || !isPlainObject(input.generatorConstraints[tier]))) {
    return "Activity generatorConstraints must define one plain-object constraint set for each supported tier.";
  }
  return true;
}

/** Build immutable, serializable activity metadata with explicit learning and answer contracts. */
export function createActivityDefinition(input) {
  const validation = validateActivityDefinition(input);
  if (validation !== true) throw new TypeError(validation);
  const answerRules = cloneJsonObject(input.answerRules, "answerRules");
  const generatorConstraints = cloneJsonObject(input.generatorConstraints, "generatorConstraints");
  return freezeRecursively({
    id: input.id,
    title: input.title.trim(),
    skillIds: [...input.skillIds],
    objectives: input.objectives.map((objective) => objective.trim()),
    supportedTiers: input.supportedTiers.slice().sort(
      (left, right) => DIFFICULTY_TIER_IDS.indexOf(left) - DIFFICULTY_TIER_IDS.indexOf(right)
    ),
    answerRules,
    generatorId: input.generatorId,
    generatorConstraints
  });
}

/** Small in-memory registry; persisted content references IDs, not generator functions. */
export function createActivityRegistry(initialDefinitions = []) {
  if (!Array.isArray(initialDefinitions)) throw new TypeError("initialDefinitions must be an array.");
  const definitions = new Map();

  function register(input) {
    const definition = createActivityDefinition(input);
    const validation = validateActivityDefinition(definition);
    if (validation !== true) throw new TypeError(validation);
    if (definitions.has(definition.id)) throw new Error("Activity already registered: " + definition.id);
    definitions.set(definition.id, definition);
    return definition;
  }

  for (const definition of initialDefinitions) register(definition);

  return Object.freeze({
    register,
    get(id) { return definitions.get(id) ?? null; },
    list() { return [...definitions.values()].sort((left, right) => left.id.localeCompare(right.id)); },
    has(id) { return definitions.has(id); }
  });
}
