/** Public source-project entry point. The browser-specific offline launch shell is in browser-entry.js. */
export { createGameApp } from "./app/createGameApp.js";
export { gameConfig } from "./config/gameConfig.js";
export { chapterDefinitions, getChapterDefinition } from "./chapters/registry.js";
export { sideQuestDefinitions, getSideQuestDefinition } from "./side-quests/registry.js";
