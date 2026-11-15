/**
 * Data-driven optional side-quest registry.
 * Quest content is added in STEP-32 through STEP-41.
 */
export const sideQuestDefinitions = Object.freeze([]);

/** @param {string} id */
export function getSideQuestDefinition(id) {
  return sideQuestDefinitions.find((quest) => quest.id === id) ?? null;
}
