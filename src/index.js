/** Public source-project entry point. */
export { createGameApp } from "./app/createGameApp.js";
export { createGameStore } from "./core/state/createGameStore.js";
export { createSaveManager, getBrowserStorage, SAVE_FORMAT, SaveDataError } from "./core/save/createSaveManager.js";
export { createSaveService } from "./core/save/createSaveService.js";
export { createInputRouter, HUB_DOCK_IDS } from "./core/input/createInputRouter.js";
export { registerStandardInputContexts } from "./core/input/standardContexts.js";
export { createInitialGameState, coreActionDefinitions } from "./core/state/actions.js";
export { createSelector, selectActiveOverlayId, selectAtPath, selectCurrentScreen } from "./core/state/selectors.js";
export { createAcademyShell } from "./ui/createAcademyShell.js";
export { DEFAULT_UI_PREFERENCES, selectUiPreferences } from "./ui/uiPreferences.js";
export { createCanvasRenderer } from "./rendering/canvas/createCanvasRenderer.js";
export { createMaskedTexture } from "./rendering/canvas/createMaskedTexture.js";
export { createAcademyScene } from "./rendering/scenes/createAcademyScene.js";
export { gameConfig } from "./config/gameConfig.js";
export { chapterDefinitions, getChapterDefinition } from "./chapters/registry.js";
export { sideQuestDefinitions, getSideQuestDefinition } from "./side-quests/registry.js";
