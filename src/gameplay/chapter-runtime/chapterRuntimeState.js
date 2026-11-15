import { gameConfig } from "../../config/gameConfig.js";

function validCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function normalizeActivityResults(results, chapter, maximumLength = chapter.activities.length) {
  if (!Array.isArray(results)) return [];
  const normalized = [];
  for (let index = 0; index < Math.min(results.length, maximumLength, chapter.activities.length); index += 1) {
    const result = results[index];
    if (!result || typeof result !== "object"
        || result.activityId !== chapter.activities[index].id
        || !["completed", "skipped"].includes(result.status)) break;
    normalized.push(Object.freeze({ activityId: result.activityId, status: result.status }));
  }
  return normalized;
}

function normalizeRun(run, chapter) {
  if (!run || typeof run !== "object") return null;
  const activityResults = normalizeActivityResults(run.activityResults, chapter);
  if (activityResults.length !== chapter.activities.length) return null;
  return Object.freeze({
    completedActivityCount: activityResults.filter((entry) => entry.status === "completed").length,
    skippedActivityCount: activityResults.filter((entry) => entry.status === "skipped").length,
    activityResults: Object.freeze(activityResults)
  });
}

export function createInitialChapterRuntimeState() {
  return { chapters: {} };
}

/** Select sanitized, chapter-specific checkpoints and replay records. */
export function selectChapterRuntimeProgress(state, chapterCatalog) {
  if (!chapterCatalog || typeof chapterCatalog.list !== "function") {
    throw new TypeError("selectChapterRuntimeProgress requires a chapter catalog.");
  }
  const stored = state?.chapterRuntime?.chapters && typeof state.chapterRuntime.chapters === "object"
    ? state.chapterRuntime.chapters : {};
  const chapters = {};
  for (const chapter of chapterCatalog.list()) {
    const raw = stored[chapter.id] && typeof stored[chapter.id] === "object" ? stored[chapter.id] : {};
    const activityResults = normalizeActivityResults(raw.activityResults, chapter);
    const currentActivityIndex = Math.min(chapter.activities.length, activityResults.length);
    const recentRuns = Array.isArray(raw.recentRuns)
      ? raw.recentRuns.map((run) => normalizeRun(run, chapter)).filter(Boolean).slice(-gameConfig.chapterRuntime.completedHistoryLimit)
      : [];
    const lastRun = normalizeRun(raw.lastRun, chapter);
    const status = raw.status === "completed" && lastRun
      ? "completed"
      : raw.status === "in-progress" ? "in-progress" : "not-started";
    chapters[chapter.id] = Object.freeze({
      status,
      currentActivityIndex,
      activityResults: Object.freeze(activityResults),
      completedRuns: validCount(raw.completedRuns),
      lastRun,
      recentRuns: Object.freeze(recentRuns),
      lastExitActivityIndex: Number.isInteger(raw.lastExitActivityIndex)
        ? Math.max(0, Math.min(chapter.activities.length, raw.lastExitActivityIndex))
        : null
    });
  }
  return Object.freeze({ chapters: Object.freeze(chapters) });
}
