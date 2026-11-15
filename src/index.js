/** Public source-project entry point. */
export { createGameApp } from "./app/createGameApp.js";
export { createGameStore } from "./core/state/createGameStore.js";
export { createInitialGameState, coreActionDefinitions } from "./core/state/actions.js";
export { createSelector, selectActiveOverlayId, selectAtPath, selectCurrentScreen } from "./core/state/selectors.js";
export { gameConfig } from "./config/gameConfig.js";
export { chapterDefinitions, getChapterDefinition } from "./chapters/registry.js";
export { sideQuestDefinitions, getSideQuestDefinition } from "./side-quests/registry.js";
