import { createChapterCatalog, createChapterDefinition, validateChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";

/**
 * Data-driven chapter registry.
 * Definitions are authored in STEP-21 and STEP-23 through STEP-31.
 * Each chapter owns its activity sequence; the registry imposes no universal order.
 */
export { createChapterCatalog, createChapterDefinition, validateChapterDefinition };
export const chapterDefinitions = Object.freeze([]);

export function getChapterDefinition(id) {
  return chapterDefinitions.find((chapter) => chapter.id === id) ?? null;
}
