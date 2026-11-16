import { createChapterCatalog, createChapterDefinition, validateChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";
import { chapterOneDefinition } from "./chapterOne.js";
import { chapterTwoDefinition } from "./chapterTwo.js";
import { chapterThreeDefinition } from "./chapterThree.js";
import { chapterFourDefinition } from "./chapterFour.js";

/**
 * Data-driven chapter registry. New chapter files can add authored content
 * without changing the runtime's activity or progression contracts.
 */
export { createChapterCatalog, createChapterDefinition, validateChapterDefinition };
export const chapterDefinitions = Object.freeze([chapterOneDefinition, chapterTwoDefinition, chapterThreeDefinition, chapterFourDefinition]);

export function getChapterDefinition(id) {
  return chapterDefinitions.find((chapter) => chapter.id === id) ?? null;
}
