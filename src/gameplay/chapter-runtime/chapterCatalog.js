import { cloneSerializable } from "../../core/state/stateUtils.js";
import { getSkillDefinition } from "../../systems/curriculum/skillRegistry.js";

const CHAPTER_ID_PATTERN = /^chapter-[0-9]{2}$/;
const CONTENT_ID_PATTERN = /^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)+$/;
const ACTIVITY_TYPES = Object.freeze(["story", "learning", "challenge", "gymnastics", "reflection", "custom"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function freezeRecursively(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeRecursively(child);
  }
  return value;
}

function cloneMetadata(value) {
  if (value === undefined) return {};
  if (!isPlainObject(value)) throw new TypeError("Activity metadata must be a plain JSON-compatible object.");
  let cloned;
  try {
    cloned = cloneSerializable(value, "chapter activity metadata");
  } catch (error) {
    throw new TypeError("Activity metadata must be JSON-compatible: " + error.message);
  }
  if (!isPlainObject(cloned)) throw new TypeError("Activity metadata must be a plain object.");
  return cloned;
}

export function validateChapterDefinition(input) {
  if (!isPlainObject(input)) return "A chapter definition must be a plain object.";
  if (typeof input.id !== "string" || !CHAPTER_ID_PATTERN.test(input.id)) {
    return "Chapter id must use the chapter-NN format.";
  }
  if (typeof input.title !== "string" || !input.title.trim() || input.title.length > 120) {
    return "Chapter title must be a non-empty string of at most 120 characters.";
  }
  if (typeof input.description !== "string" || !input.description.trim() || input.description.length > 600) {
    return "Chapter description must be a non-empty string of at most 600 characters.";
  }
  if (!Array.isArray(input.objectives) || input.objectives.length === 0 || input.objectives.length > 12
      || input.objectives.some((objective) => typeof objective !== "string" || !objective.trim())) {
    return "Chapter objectives must contain 1 to 12 non-empty strings.";
  }
  if (!Array.isArray(input.activities) || input.activities.length === 0 || input.activities.length > 40) {
    return "A chapter must contain 1 to 40 activities in its own sequence.";
  }
  const activityIds = new Set();
  for (const activity of input.activities) {
    if (!isPlainObject(activity)) return "Every chapter activity must be a plain object.";
    if (typeof activity.id !== "string" || !CONTENT_ID_PATTERN.test(activity.id)
        || !activity.id.startsWith(input.id + ".")) {
      return "Every activity id must be namespaced beneath its chapter id.";
    }
    if (activityIds.has(activity.id)) return "Chapter activity IDs must be unique.";
    activityIds.add(activity.id);
    if (typeof activity.title !== "string" || !activity.title.trim() || activity.title.length > 120) {
      return "Every activity requires a non-empty title of at most 120 characters.";
    }
    if (!ACTIVITY_TYPES.includes(activity.type)) return "Activity type must be story, learning, challenge, gymnastics, reflection, or custom.";
    if (typeof activity.description !== "string" || !activity.description.trim() || activity.description.length > 1200) {
      return "Every activity requires a short player-facing description.";
    }
    if (activity.activityId !== undefined
        && (typeof activity.activityId !== "string" || !CONTENT_ID_PATTERN.test(activity.activityId))) {
      return "An optional activityId must be a stable namespaced identifier.";
    }
    if (activity.skillIds !== undefined
        && (!Array.isArray(activity.skillIds) || activity.skillIds.some((id) => !getSkillDefinition(id))
          || new Set(activity.skillIds).size !== activity.skillIds.length)) {
      return "Activity skillIds must contain unique IDs from the curriculum skill registry.";
    }
    try { cloneMetadata(activity.metadata); } catch (error) { return error.message; }
  }
  if (!Array.isArray(input.majorRewardIds) || input.majorRewardIds.length === 0
      || input.majorRewardIds.some((id) => typeof id !== "string" || !CONTENT_ID_PATTERN.test(id))
      || new Set(input.majorRewardIds).size !== input.majorRewardIds.length) {
    return "A chapter must declare one or more unique, namespaced majorRewardIds.";
  }
  if (input.prerequisiteChapterIds !== undefined
      && (!Array.isArray(input.prerequisiteChapterIds)
        || input.prerequisiteChapterIds.some((id) => typeof id !== "string" || !CHAPTER_ID_PATTERN.test(id))
        || new Set(input.prerequisiteChapterIds).size !== input.prerequisiteChapterIds.length
        || input.prerequisiteChapterIds.includes(input.id))) {
    return "prerequisiteChapterIds must contain unique chapter IDs other than this chapter.";
  }
  return true;
}

export function createChapterDefinition(input) {
  const validation = validateChapterDefinition(input);
  if (validation !== true) throw new TypeError(validation);
  return freezeRecursively({
    id: input.id,
    title: input.title.trim(),
    description: input.description.trim(),
    objectives: input.objectives.map((objective) => objective.trim()),
    activities: input.activities.map((activity) => ({
      id: activity.id,
      title: activity.title.trim(),
      type: activity.type,
      description: activity.description.trim(),
      ...(activity.activityId ? { activityId: activity.activityId } : {}),
      ...(activity.skillIds ? { skillIds: [...activity.skillIds] } : {}),
      metadata: cloneMetadata(activity.metadata)
    })),
    majorRewardIds: [...input.majorRewardIds],
    prerequisiteChapterIds: [...(input.prerequisiteChapterIds ?? [])]
  });
}

export function createChapterCatalog(initialDefinitions = []) {
  if (!Array.isArray(initialDefinitions)) throw new TypeError("Chapter catalog definitions must be an array.");
  const definitions = new Map();
  let initializing = true;
  function validatePrerequisiteGraph() {
    for (const chapter of definitions.values()) {
      for (const prerequisiteId of chapter.prerequisiteChapterIds) {
        if (!definitions.has(prerequisiteId)) throw new Error("Unknown prerequisite chapter: " + prerequisiteId);
      }
    }
    const visiting = new Set();
    const visited = new Set();
    function visit(chapterId) {
      if (visiting.has(chapterId)) throw new Error("Chapter prerequisite cycle detected at " + chapterId);
      if (visited.has(chapterId)) return;
      visiting.add(chapterId);
      for (const prerequisiteId of definitions.get(chapterId).prerequisiteChapterIds) visit(prerequisiteId);
      visiting.delete(chapterId);
      visited.add(chapterId);
    }
    for (const chapterId of definitions.keys()) visit(chapterId);
  }
  function register(input) {
    const chapter = createChapterDefinition(input);
    if (definitions.has(chapter.id)) throw new Error("Chapter already registered: " + chapter.id);
    definitions.set(chapter.id, chapter);
    if (!initializing) {
      try { validatePrerequisiteGraph(); }
      catch (error) { definitions.delete(chapter.id); throw error; }
    }
    return chapter;
  }
  for (const definition of initialDefinitions) register(definition);
  initializing = false;
  validatePrerequisiteGraph();
  return Object.freeze({
    register,
    get(id) { return definitions.get(id) ?? null; },
    has(id) { return definitions.has(id); },
    list() { return Object.freeze([...definitions.values()].sort((a, b) => a.id.localeCompare(b.id))); }
  });
}
