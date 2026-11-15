/**
 * Data-driven chapter registry.
 * Definitions are added in STEP-21 and STEP-23 through STEP-31.
 * Each chapter owns its activity sequence; the registry does not impose a
 * universal story/challenge/gymnastics sequence.
 */
export const chapterDefinitions = Object.freeze([]);

/** @param {string} id */
export function getChapterDefinition(id) {
  return chapterDefinitions.find((chapter) => chapter.id === id) ?? null;
}
