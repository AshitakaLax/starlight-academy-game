import { createChapterDefinition } from "../gameplay/chapter-runtime/chapterCatalog.js";

const QUEST_ID_PATTERN = /^quest-[0-9]{2}$/;
const CHAPTER_ID_PATTERN = /^chapter-[0-9]{2}$/;
const QUEST_TYPES = Object.freeze(["mastery", "application"]);

/** Validate an optional quest before it joins the shared progression runtime. */
export function validateSideQuestDefinition(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return "A side quest definition must be an object.";
  }
  if (typeof input.id !== "string" || !QUEST_ID_PATTERN.test(input.id)) {
    return "A side quest id must use the quest-NN format.";
  }
  if (typeof input.sourceChapterId !== "string" || !CHAPTER_ID_PATTERN.test(input.sourceChapterId)) {
    return "A side quest must name a valid sourceChapterId.";
  }
  if (!QUEST_TYPES.includes(input.questType)) {
    return "A side quest type must be mastery or application.";
  }
  try {
    createChapterDefinition({
      id: input.id,
      title: input.title,
      description: input.description,
      objectives: input.objectives,
      activities: input.activities,
      majorRewardIds: input.majorRewardIds,
      prerequisiteChapterIds: [input.sourceChapterId]
    });
  } catch (error) {
    return error.message;
  }
  return true;
}

/**
 * Side quests reuse the tested progression session contract but receive their
 * own quest-* IDs and remain outside the required chapter sequence.
 */
export function createSideQuestDefinition(input) {
  const validation = validateSideQuestDefinition(input);
  if (validation !== true) throw new TypeError(validation);
  const progression = createChapterDefinition({
    id: input.id,
    title: input.title,
    description: input.description,
    objectives: input.objectives,
    activities: input.activities,
    majorRewardIds: input.majorRewardIds,
    prerequisiteChapterIds: [input.sourceChapterId]
  });
  return Object.freeze({
    ...progression,
    questType: input.questType,
    sourceChapterId: input.sourceChapterId
  });
}
