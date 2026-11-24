import { getSkillDefinition } from "../../systems/curriculum/skillRegistry.js";

function freezeRecursively(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeRecursively(child);
  }
  return value;
}

function getEntryStatus(entry) {
  const progress = entry.progress ?? {};
  if (progress.status === "completed") return "completed";
  if (entry.prerequisitesMet !== true) return "locked";
  if (progress.status === "in-progress") return "in-progress";
  return "available";
}

function getSkillRecords(entry, state) {
  const skillIds = [...new Set((entry.activities ?? []).flatMap((activity) =>
    Array.isArray(activity.skillIds) ? activity.skillIds : []
  ))].sort();
  return skillIds.map((skillId) => {
    const definition = getSkillDefinition(skillId);
    const saved = state?.curriculum?.skills?.[skillId];
    const masteryStatus = saved?.masteryStatus === "demonstrated"
      ? "demonstrated"
      : saved?.masteryStatus === "in-progress" || (saved?.totalResponses ?? 0) > 0
        ? "in-progress"
        : "not-started";
    return {
      id: skillId,
      title: definition?.title ?? skillId,
      subject: definition?.subject ?? "other",
      masteryStatus
    };
  });
}

/**
 * Projects chapter and optional-quest runtime progress into a read-only academy
 * board. It deliberately reuses saved runtime and curriculum state rather than
 * maintaining a second, potentially divergent progression store.
 */
export function buildQuestBoardSnapshot({ progressionEntries, state = {} } = {}) {
  if (!Array.isArray(progressionEntries)) {
    throw new TypeError("buildQuestBoardSnapshot requires progressionEntries from the chapter runtime.");
  }

  const records = progressionEntries.map((entry) => {
    if (!entry || typeof entry.id !== "string" || !entry.progress) {
      throw new TypeError("Every quest-board entry must include an id and runtime progress.");
    }
    const progress = entry.progress;
    const personalBest = progress.personalBest ?? null;
    const skills = getSkillRecords(entry, state);
    const masteredSkillCount = skills.filter((skill) => skill.masteryStatus === "demonstrated").length;
    const practicedSkillCount = skills.filter((skill) => skill.masteryStatus === "in-progress").length;
    const isQuest = entry.id.startsWith("quest-");
    const prerequisiteChapterId = entry.prerequisiteChapterIds?.[0] ?? null;
    return {
      id: entry.id,
      title: entry.title,
      description: entry.description,
      objectives: [...(entry.objectives ?? [])],
      type: isQuest ? "quest" : "chapter",
      questType: entry.questType ?? null,
      prerequisiteChapterId,
      status: getEntryStatus(entry),
      currentActivityIndex: progress.currentActivityIndex ?? 0,
      activityCount: entry.activities?.length ?? 0,
      completedRuns: Number.isSafeInteger(progress.completedRuns) ? progress.completedRuns : 0,
      stars: Number.isInteger(personalBest?.starRating) ? Math.max(0, Math.min(3, personalBest.starRating)) : 0,
      starsLabel: "★".repeat(Number.isInteger(personalBest?.starRating) ? Math.max(0, Math.min(3, personalBest.starRating)) : 0)
        + "☆".repeat(3 - (Number.isInteger(personalBest?.starRating) ? Math.max(0, Math.min(3, personalBest.starRating)) : 0)),
      personalBestScore: Number.isInteger(personalBest?.scorePercent)
        ? Math.max(0, Math.min(100, personalBest.scorePercent))
        : null,
      personalBest,
      lastRun: progress.lastRun ?? null,
      mastery: {
        skillCount: skills.length,
        masteredSkillCount,
        practicedSkillCount,
        remainingSkillCount: skills.length - masteredSkillCount - practicedSkillCount
      },
      skills
    };
  }).sort((left, right) => left.id.localeCompare(right.id));

  const chapters = records.filter((entry) => entry.type === "chapter");
  const quests = records.filter((entry) => entry.type === "quest");
  const statusCounts = {
    completed: records.filter((entry) => entry.status === "completed").length,
    inProgress: records.filter((entry) => entry.status === "in-progress").length,
    available: records.filter((entry) => entry.status === "available").length,
    locked: records.filter((entry) => entry.status === "locked").length
  };
  const masteredSkillIds = new Set(records.flatMap((entry) =>
    entry.skills.filter((skill) => skill.masteryStatus === "demonstrated").map((skill) => skill.id)
  ));

  return freezeRecursively({
    chapters,
    quests,
    summary: {
      totalCount: records.length,
      chapterCount: chapters.length,
      questCount: quests.length,
      ...statusCounts,
      starsEarned: records.reduce((total, entry) => total + entry.stars, 0),
      starsPossible: records.length * 3,
      masteredSkillCount: masteredSkillIds.size
    }
  });
}
