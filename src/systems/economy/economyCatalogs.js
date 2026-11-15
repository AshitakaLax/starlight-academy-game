import { gameConfig } from "../../config/gameConfig.js";

const ID_PATTERN = /^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)+$/;
const SOURCE_ID_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)?$/;
const REWARD_KEYS = Object.freeze(["id", "sourceId", "title", "starGems", "starlightSparkles", "replayPolicy"]);
const ITEM_KEYS = Object.freeze(["id", "title", "priceStarGems", "maxOwned"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value, allowed) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function freezeRecursively(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeRecursively(child);
  }
  return value;
}

function validateReward(input) {
  if (!isPlainObject(input) || !hasOnlyKeys(input, REWARD_KEYS)) {
    return "A reward must be a plain object containing only id, sourceId, title, starGems, starlightSparkles, and replayPolicy.";
  }
  if (typeof input.id !== "string" || !ID_PATTERN.test(input.id)) return "Reward id must be a stable namespaced identifier.";
  if (typeof input.sourceId !== "string" || !SOURCE_ID_PATTERN.test(input.sourceId)) return "Reward sourceId must be a stable chapter, quest, or content identifier.";
  if (typeof input.title !== "string" || !input.title.trim()) return "Reward title must be non-empty.";
  for (const key of ["starGems", "starlightSparkles"]) {
    if (!Number.isSafeInteger(input[key]) || input[key] < 0) {
      return key + " must be a non-negative safe integer.";
    }
  }
  if (input.starGems === 0 && input.starlightSparkles === 0) return "A reward must grant at least one currency.";
  const policy = input.replayPolicy;
  if (!isPlainObject(policy)) return "replayPolicy must be an explicit once or capped policy.";
  if (policy.type === "once") {
    if (!hasOnlyKeys(policy, ["type"])) return "A once replay policy accepts only its type.";
  } else if (policy.type === "capped") {
    if (!hasOnlyKeys(policy, ["type", "maxClaims"])
        || !Number.isInteger(policy.maxClaims)
        || policy.maxClaims < 2
        || policy.maxClaims > gameConfig.economy.maximumRewardClaims) {
      return "A capped replay policy requires maxClaims from 2 through the configured maximum.";
    }
  } else {
    return 'replayPolicy.type must be "once" or "capped".';
  }
  return true;
}

function validateShopItem(input) {
  if (!isPlainObject(input) || !hasOnlyKeys(input, ITEM_KEYS)) {
    return "A shop item must contain only id, title, priceStarGems, and maxOwned.";
  }
  if (typeof input.id !== "string" || !ID_PATTERN.test(input.id)) return "Shop item id must be a stable namespaced identifier.";
  if (typeof input.title !== "string" || !input.title.trim()) return "Shop item title must be non-empty.";
  if (!Number.isSafeInteger(input.priceStarGems) || input.priceStarGems < 1) {
    return "priceStarGems must be a positive safe integer.";
  }
  if (!Number.isInteger(input.maxOwned ?? 1) || (input.maxOwned ?? 1) < 1 || (input.maxOwned ?? 1) > 99) {
    return "maxOwned must be an integer from 1 to 99.";
  }
  return true;
}

/** Create immutable reward definitions with explicit, bounded replay behavior. */
export function createRewardDefinition(input) {
  const validation = validateReward(input);
  if (validation !== true) throw new TypeError(validation);
  return freezeRecursively({
    id: input.id,
    sourceId: input.sourceId,
    title: input.title.trim(),
    starGems: input.starGems,
    starlightSparkles: input.starlightSparkles,
    replayPolicy: { ...input.replayPolicy }
  });
}

/** Create an immutable optional shop item; purchase price is always read from this catalog. */
export function createShopItemDefinition(input) {
  const validation = validateShopItem(input);
  if (validation !== true) throw new TypeError(validation);
  return freezeRecursively({
    id: input.id,
    title: input.title.trim(),
    priceStarGems: input.priceStarGems,
    maxOwned: input.maxOwned ?? 1
  });
}

function createRegistry(initial, factory, idField, label) {
  if (!Array.isArray(initial)) throw new TypeError(label + " initial definitions must be an array.");
  const definitions = new Map();
  function register(input) {
    const definition = factory(input);
    if (definitions.has(definition[idField])) throw new Error(label + " already registered: " + definition[idField]);
    definitions.set(definition[idField], definition);
    return definition;
  }
  for (const definition of initial) register(definition);
  return Object.freeze({
    register,
    get(id) { return definitions.get(id) ?? null; },
    has(id) { return definitions.has(id); },
    list() { return [...definitions.values()].sort((a, b) => a[idField].localeCompare(b[idField])); }
  });
}

export function createRewardRegistry(initialDefinitions = []) {
  return createRegistry(initialDefinitions, createRewardDefinition, "id", "Reward");
}

export function createShopCatalog(initialItems = []) {
  return createRegistry(initialItems, createShopItemDefinition, "id", "Shop item");
}
