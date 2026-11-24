import { createHintDefinition } from "./hintDefinitions.js";

/** Activity-bound hint registry; every definition must match its activity's skill contract. */
export function createHintRegistry({ activityRegistry, initialDefinitions = [] } = {}) {
  if (!activityRegistry || typeof activityRegistry.get !== "function") {
    throw new TypeError("createHintRegistry requires an activity registry.");
  }
  if (!Array.isArray(initialDefinitions)) {
    throw new TypeError("initialDefinitions must be an array.");
  }

  const definitions = new Map();

  function register(input) {
    const definition = createHintDefinition(input);
    const activity = activityRegistry.get(definition.activityId);
    if (!activity) {
      throw new Error("Cannot register hints for an unknown activity: " + definition.activityId);
    }
    if (activity.skillIds.length !== definition.skillIds.length
        || activity.skillIds.some((skillId, index) => skillId !== definition.skillIds[index])) {
      throw new Error("Hint skillIds must match the linked activity's skillIds in order.");
    }
    if (definitions.has(definition.activityId)) {
      throw new Error("Hint definition already registered: " + definition.activityId);
    }
    definitions.set(definition.activityId, definition);
    return definition;
  }

  for (const definition of initialDefinitions) register(definition);

  return Object.freeze({
    register,
    get(activityId) { return definitions.get(activityId) ?? null; },
    has(activityId) { return definitions.has(activityId); },
    list() {
      return [...definitions.values()].sort((left, right) => left.activityId.localeCompare(right.activityId));
    }
  });
}
