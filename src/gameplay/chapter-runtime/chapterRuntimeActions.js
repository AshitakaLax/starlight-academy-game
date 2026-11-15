import { isPlainObject } from "../../core/state/stateUtils.js";
import { gameConfig } from "../../config/gameConfig.js";
import { selectChapterRuntimeProgress } from "./chapterRuntimeState.js";

function hasOnlyKeys(value, allowed) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function validateActivityResults(results, chapter, { requireComplete = false } = {}) {
  if (!Array.isArray(results) || results.length > chapter.activities.length
      || (requireComplete && results.length !== chapter.activities.length)) {
    return "Chapter activity results must match the chapter's ordered activity sequence.";
  }
  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    if (!isPlainObject(result) || Object.keys(result).length !== 2
        || !hasOnlyKeys(result, ["activityId", "status"])
        || result.activityId !== chapter.activities[index].id
        || !["completed", "skipped"].includes(result.status)) {
      return "Each activity result must match its ordered chapter activity and be completed or skipped.";
    }
  }
  return true;
}

function copyProgress(state, chapterId, chapterProgress) {
  const domain = isPlainObject(state.chapterRuntime) ? state.chapterRuntime : {};
  const chapters = isPlainObject(domain.chapters) ? domain.chapters : {};
  return {
    ...state,
    chapterRuntime: {
      ...domain,
      chapters: { ...chapters, [chapterId]: chapterProgress }
    }
  };
}

export function createChapterRuntimeActionDefinitions({ chapterCatalog } = {}) {
  if (!chapterCatalog || typeof chapterCatalog.has !== "function" || typeof chapterCatalog.get !== "function") {
    throw new TypeError("createChapterRuntimeActionDefinitions requires a chapter catalog.");
  }
  return Object.freeze({
    "chapters/session-started": Object.freeze({
      validate(payload) {
        return isPlainObject(payload) && Object.keys(payload).length === 1
          && hasOnlyKeys(payload, ["chapterId"]) && typeof payload.chapterId === "string"
          && chapterCatalog.has(payload.chapterId)
          ? true : "chapters/session-started expects a registered chapterId.";
      },
      reduce(state, payload) {
        const chapter = chapterCatalog.get(payload.chapterId);
        const current = selectChapterRuntimeProgress(state, chapterCatalog).chapters[payload.chapterId];
        if (current.status === "in-progress") return state;
        return copyProgress(state, payload.chapterId, {
          ...current,
          status: "in-progress",
          currentActivityIndex: 0,
          activityResults: [],
          lastExitActivityIndex: null
        });
      }
    }),

    "chapters/checkpoint-saved": Object.freeze({
      validate(payload) {
        if (!isPlainObject(payload) || Object.keys(payload).length !== 2
            || !hasOnlyKeys(payload, ["chapterId", "activityResults"])
            || typeof payload.chapterId !== "string" || !chapterCatalog.has(payload.chapterId)) {
          return "chapters/checkpoint-saved expects a registered chapterId and activityResults.";
        }
        return validateActivityResults(payload.activityResults, chapterCatalog.get(payload.chapterId));
      },
      reduce(state, payload) {
        const progress = selectChapterRuntimeProgress(state, chapterCatalog).chapters[payload.chapterId];
        if (progress.status !== "in-progress" || progress.completedRuns === Number.MAX_SAFE_INTEGER) return state;
        return copyProgress(state, payload.chapterId, {
          ...progress,
          currentActivityIndex: payload.activityResults.length,
          activityResults: payload.activityResults.map((entry) => ({ ...entry }))
        });
      }
    }),

    "chapters/session-exited": Object.freeze({
      validate(payload) {
        return isPlainObject(payload) && Object.keys(payload).length === 1
          && hasOnlyKeys(payload, ["chapterId"]) && typeof payload.chapterId === "string"
          && chapterCatalog.has(payload.chapterId)
          ? true : "chapters/session-exited expects a registered chapterId.";
      },
      reduce(state, payload) {
        const progress = selectChapterRuntimeProgress(state, chapterCatalog).chapters[payload.chapterId];
        if (progress.status !== "in-progress") return state;
        if (progress.lastExitActivityIndex === progress.currentActivityIndex) return state;
        return copyProgress(state, payload.chapterId, {
          ...progress,
          lastExitActivityIndex: progress.currentActivityIndex
        });
      }
    }),

    "chapters/chapter-completed": Object.freeze({
      validate(payload) {
        if (!isPlainObject(payload) || Object.keys(payload).length !== 2
            || !hasOnlyKeys(payload, ["chapterId", "activityResults"])
            || typeof payload.chapterId !== "string" || !chapterCatalog.has(payload.chapterId)) {
          return "chapters/chapter-completed expects a registered chapterId and activityResults.";
        }
        return validateActivityResults(payload.activityResults, chapterCatalog.get(payload.chapterId), { requireComplete: true });
      },
      reduce(state, payload) {
        const progress = selectChapterRuntimeProgress(state, chapterCatalog).chapters[payload.chapterId];
        if (progress.status !== "in-progress") return state;
        const activityResults = payload.activityResults.map((entry) => Object.freeze({ ...entry }));
        const run = Object.freeze({
          completedActivityCount: activityResults.filter((entry) => entry.status === "completed").length,
          skippedActivityCount: activityResults.filter((entry) => entry.status === "skipped").length,
          activityResults: Object.freeze(activityResults)
        });
        return copyProgress(state, payload.chapterId, {
          ...progress,
          status: "completed",
          currentActivityIndex: activityResults.length,
          activityResults,
          completedRuns: Math.min(Number.MAX_SAFE_INTEGER, progress.completedRuns + 1),
          lastRun: run,
          recentRuns: Object.freeze([...progress.recentRuns, run].slice(-gameConfig.chapterRuntime.completedHistoryLimit)),
          lastExitActivityIndex: null
        });
      }
    })
  });
}
