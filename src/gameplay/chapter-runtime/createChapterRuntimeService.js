import { selectChapterRuntimeProgress } from "./chapterRuntimeState.js";

function freezeSnapshot(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeSnapshot(child);
  }
  return value;
}

/** Coordinates ordered chapter activities, safe checkpoints, replays, and one-time rewards. */
export function createChapterRuntimeService({
  store, chapterCatalog, rewardRegistry, economyService, wardrobeService = null
} = {}) {
  if (!store || typeof store.getState !== "function" || typeof store.dispatch !== "function") {
    throw new TypeError("createChapterRuntimeService requires a compatible game store.");
  }
  if (!chapterCatalog || typeof chapterCatalog.get !== "function" || typeof chapterCatalog.list !== "function") {
    throw new TypeError("createChapterRuntimeService requires a chapter catalog.");
  }
  if (!rewardRegistry || typeof rewardRegistry.get !== "function") {
    throw new TypeError("createChapterRuntimeService requires a reward registry.");
  }
  if (!economyService || typeof economyService.claimReward !== "function") {
    throw new TypeError("createChapterRuntimeService requires the economy reward service.");
  }
  if (wardrobeService !== null && typeof wardrobeService.unlockSource !== "function") {
    throw new TypeError("wardrobeService must expose unlockSource() when supplied.");
  }

  for (const chapter of chapterCatalog.list()) {
    for (const rewardId of chapter.majorRewardIds) {
      const reward = rewardRegistry.get(rewardId);
      if (!reward) throw new Error("Chapter " + chapter.id + " references an unregistered major reward: " + rewardId);
      if (reward.sourceId !== chapter.id || reward.replayPolicy.type !== "once") {
        throw new Error("Major chapter rewards must use the chapter as sourceId and a once-only replay policy.");
      }
    }
    for (const prerequisiteId of chapter.prerequisiteChapterIds) {
      if (!chapterCatalog.has(prerequisiteId)) throw new Error("Unknown prerequisite chapter: " + prerequisiteId);
    }
  }

  const sessions = new WeakSet();
  let activeSession = null;

  function getProgress() {
    return selectChapterRuntimeProgress(store.getState(), chapterCatalog);
  }

  function getSnapshot() {
    const progress = getProgress();
    return freezeSnapshot({
      chapters: chapterCatalog.list().map((chapter) => ({
        ...chapter,
        progress: progress.chapters[chapter.id],
        prerequisitesMet: chapter.prerequisiteChapterIds.every(
          (id) => progress.chapters[id]?.status === "completed"
        )
      }))
    });
  }

  function createSession(chapterId) {
    const chapter = chapterCatalog.get(chapterId);
    if (!chapter) throw new RangeError("Unknown chapter: " + chapterId);
    let started = false;
    let ended = false;
    let completionReceipt = null;
    let activityResults = [];

    function readProgress() {
      return getProgress().chapters[chapterId];
    }

    function sessionSnapshot() {
      const progress = readProgress();
      const currentActivity = progress.currentActivityIndex < chapter.activities.length
        ? chapter.activities[progress.currentActivityIndex] : null;
      return freezeSnapshot({
        chapterId,
        title: chapter.title,
        description: chapter.description,
        status: ended ? "exited" : progress.status,
        currentActivityIndex: progress.currentActivityIndex,
        activityCount: chapter.activities.length,
        currentActivity,
        activityResults: progress.activityResults,
        completedActivityCount: progress.activityResults.filter((entry) => entry.status === "completed").length,
        skippedActivityCount: progress.activityResults.filter((entry) => entry.status === "skipped").length,
        isComplete: progress.status === "completed",
        prerequisitesMet: chapter.prerequisiteChapterIds.every((id) => getProgress().chapters[id]?.status === "completed"),
        completionReceipt
      });
    }

    function start() {
      if (ended) throw new Error("An exited chapter session cannot be restarted; create a new session to resume.");
      if (started) return sessionSnapshot();
      if (activeSession && activeSession !== session) {
        throw new Error("Another chapter session is already active. Exit it safely before starting this chapter.");
      }
      const progress = readProgress();
      if (!chapter.prerequisiteChapterIds.every((id) => getProgress().chapters[id]?.status === "completed")) {
        throw new Error("This chapter is not available until its prerequisite chapters are completed.");
      }
      store.dispatch({ type: "chapters/session-started", payload: { chapterId } });
      activityResults = readProgress().activityResults.map((entry) => ({ ...entry }));
      started = true;
      activeSession = session;
      return sessionSnapshot();
    }

    function recordActivity(status) {
      if (!started || ended || activeSession !== session) {
        throw new Error("Start the active chapter session before completing activities.");
      }
      const progress = readProgress();
      if (progress.status === "completed") throw new Error("This chapter run is already complete.");
      const activity = chapter.activities[progress.currentActivityIndex];
      if (!activity) throw new Error("There are no remaining activities in this chapter.");
      activityResults = [
        ...progress.activityResults.map((entry) => ({ ...entry })),
        { activityId: activity.id, status }
      ];
      if (activityResults.length < chapter.activities.length) {
        store.dispatch({
          type: "chapters/checkpoint-saved",
          payload: { chapterId, activityResults }
        });
      } else {
        const previousBest = progress.personalBest;
        store.dispatch({
          type: "chapters/chapter-completed",
          payload: { chapterId, activityResults }
        });
        if (readProgress().status !== "completed") {
          throw new Error("The chapter could not be marked complete.");
        }
        const rewardReceipts = chapter.majorRewardIds.map((rewardId) => economyService.claimReward(rewardId));
        const wardrobeReceipt = wardrobeService?.unlockSource(chapterId) ?? null;
        const completedProgress = readProgress();
        completionReceipt = freezeSnapshot({
          chapterId,
          completed: true,
          completedActivityCount: activityResults.filter((entry) => entry.status === "completed").length,
          skippedActivityCount: activityResults.filter((entry) => entry.status === "skipped").length,
          currentRun: completedProgress.lastRun,
          personalBest: completedProgress.personalBest,
          personalBestImproved: !previousBest
            || completedProgress.personalBest.scorePercent > previousBest.scorePercent,
          rewards: rewardReceipts,
          wardrobe: wardrobeReceipt
        });
        activeSession = null;
      }
      return sessionSnapshot();
    }

    function completeActivity() {
      return recordActivity("completed");
    }

    function skipActivity() {
      return recordActivity("skipped");
    }

    function saveCheckpoint() {
      if (!started || ended || activeSession !== session) {
        throw new Error("Only the active chapter session can save a checkpoint.");
      }
      const progress = readProgress();
      store.dispatch({
        type: "chapters/checkpoint-saved",
        payload: { chapterId, activityResults: progress.activityResults.map((entry) => ({ ...entry })) }
      });
      return sessionSnapshot();
    }

    function exit() {
      if (!started || ended) return sessionSnapshot();
      if (activeSession !== session) {
        ended = true;
        return sessionSnapshot();
      }
      const progress = readProgress();
      if (progress.status === "in-progress") {
        store.dispatch({
          type: "chapters/checkpoint-saved",
          payload: { chapterId, activityResults: progress.activityResults.map((entry) => ({ ...entry })) }
        });
        store.dispatch({ type: "chapters/session-exited", payload: { chapterId } });
      }
      ended = true;
      if (activeSession === session) activeSession = null;
      return sessionSnapshot();
    }

    const session = Object.freeze({
      start,
      completeActivity,
      skipActivity,
      saveCheckpoint,
      exit,
      getSnapshot: sessionSnapshot
    });
    sessions.add(session);
    return session;
  }

  return Object.freeze({
    getSnapshot,
    getProgress,
    createSession,
    isSession(session) { return sessions.has(session); }
  });
}
