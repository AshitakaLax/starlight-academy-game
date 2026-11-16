import { skillDefinitions, getSkillDefinition } from "../systems/curriculum/skillRegistry.js";

function readRegistry(registry, label, issues) {
  if (!registry || typeof registry.list !== "function") {
    issues.push(label + " registry must provide list().");
    return [];
  }
  const items = registry.list();
  if (!Array.isArray(items)) {
    issues.push(label + " registry list() must return an array.");
    return [];
  }
  return items;
}

function indexUnique(items, key, label, issues) {
  const indexed = new Map();
  for (const item of items) {
    const id = item?.[key];
    if (typeof id !== "string" || !id.trim()) {
      issues.push(label + " contains an entry without a stable " + key + ".");
      continue;
    }
    if (indexed.has(id)) issues.push(label + " contains duplicate ID: " + id + ".");
    else indexed.set(id, item);
  }
  return indexed;
}

function expectedIds(prefix, count) {
  return Array.from({ length: count }, (_, index) => prefix + "-" + String(index + 1).padStart(2, "0"));
}

function compareExpectedIds(actual, expected, label, issues) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  for (const id of expected) {
    if (!actualSet.has(id)) issues.push(label + " is missing " + id + ".");
  }
  for (const id of actual) {
    if (!expectedSet.has(id)) issues.push(label + " contains unexpected ID " + id + ".");
  }
}

/**
 * Validate the cross-registry contracts used by every chapter and optional quest.
 * Returns a compact count summary or throws one actionable error containing all
 * discovered content issues.
 */
export function validateAcademyContent({
  chapterCatalog,
  sideQuestDefinitions = [],
  activityRegistry,
  questionGeneratorRegistry,
  hintRegistry,
  rewardRegistry,
  expectedChapterCount = 10,
  expectedQuestCount = 20
} = {}) {
  const issues = [];
  const progressions = readRegistry(chapterCatalog, "Chapter", issues);
  const activities = readRegistry(activityRegistry, "Activity", issues);
  const generators = readRegistry(questionGeneratorRegistry, "Question generator", issues);
  const hints = readRegistry(hintRegistry, "Hint", issues);
  const rewards = readRegistry(rewardRegistry, "Reward", issues);
  const quests = Array.isArray(sideQuestDefinitions) ? sideQuestDefinitions : [];

  const progressionById = indexUnique(progressions, "id", "Progression catalog", issues);
  const activityById = indexUnique(activities, "id", "Activity registry", issues);
  const generatorIds = new Set(generators);
  const hintByActivityId = indexUnique(hints, "activityId", "Hint registry", issues);
  const rewardById = indexUnique(rewards, "id", "Reward registry", issues);
  const questById = indexUnique(quests, "id", "Side-quest definitions", issues);
  const skillIds = new Set(skillDefinitions.map((skill) => skill.id));

  const chapters = progressions.filter((item) => /^chapter-[0-9]{2}$/.test(item.id));
  const catalogQuests = progressions.filter((item) => /^quest-[0-9]{2}$/.test(item.id));
  compareExpectedIds(chapters.map((item) => item.id), expectedIds("chapter", expectedChapterCount), "Chapter registration", issues);
  compareExpectedIds(catalogQuests.map((item) => item.id), expectedIds("quest", expectedQuestCount), "Quest registration", issues);
  compareExpectedIds(quests.map((item) => item.id), expectedIds("quest", expectedQuestCount), "Side-quest definitions", issues);
  if (catalogQuests.length !== quests.length) {
    issues.push("Chapter runtime catalog and side-quest definition registry must contain the same quest count.");
  }

  for (const progression of progressions) {
    for (const prerequisiteId of progression.prerequisiteChapterIds ?? []) {
      if (!progressionById.has(prerequisiteId) || !/^chapter-/.test(prerequisiteId)) {
        issues.push(progression.id + " references an unregistered prerequisite chapter: " + prerequisiteId + ".");
      }
    }
    if (!Array.isArray(progression.activities) || progression.activities.length === 0) {
      issues.push(progression.id + " must contain at least one activity.");
      continue;
    }
    for (const step of progression.activities) {
      if (step.skillIds) {
        for (const skillId of step.skillIds) {
          if (!getSkillDefinition(skillId)) issues.push(step.id + " references unknown skill " + skillId + ".");
        }
      }
      if (["learning", "challenge"].includes(step.type) && !step.activityId) {
        issues.push(step.id + " is missing its curriculum activityId.");
      }
      if (!step.activityId) continue;
      const activity = activityById.get(step.activityId);
      if (!activity) {
        issues.push(step.id + " references unregistered curriculum activity " + step.activityId + ".");
        continue;
      }
      if (step.skillIds && (step.skillIds.length !== activity.skillIds.length
          || step.skillIds.some((skillId, index) => skillId !== activity.skillIds[index]))) {
        issues.push(step.id + " skillIds do not match " + step.activityId + ".");
      }
    }
  }

  for (const activity of activities) {
    for (const skillId of activity.skillIds ?? []) {
      if (!skillIds.has(skillId)) issues.push(activity.id + " references unknown skill " + skillId + ".");
    }
    if (!generatorIds.has(activity.generatorId)) {
      issues.push(activity.id + " references missing question generator " + activity.generatorId + ".");
    }
    const hint = hintByActivityId.get(activity.id);
    if (!hint) {
      issues.push(activity.id + " is missing its Professor Hoot hint definition.");
    } else if (hint.skillIds.length !== activity.skillIds.length
        || hint.skillIds.some((skillId, index) => skillId !== activity.skillIds[index])) {
      issues.push(activity.id + " hint skillIds do not match the activity skillIds.");
    }
  }

  for (const hint of hints) {
    if (!activityById.has(hint.activityId)) {
      issues.push("Hint definition references unregistered activity " + hint.activityId + ".");
    }
    for (const skillId of hint.skillIds ?? []) {
      if (!skillIds.has(skillId)) issues.push(hint.activityId + " hint references unknown skill " + skillId + ".");
    }
  }

  for (const quest of quests) {
    if (!progressionById.has(quest.id)) issues.push("Quest " + quest.id + " is missing from the chapter runtime catalog.");
    if (!progressionById.has(quest.sourceChapterId)
        || !/^chapter-[0-9]{2}$/.test(quest.sourceChapterId)) {
      issues.push(quest.id + " references an unknown source chapter " + quest.sourceChapterId + ".");
    }
    if (!Array.isArray(quest.prerequisiteChapterIds)
        || !quest.prerequisiteChapterIds.includes(quest.sourceChapterId)) {
      issues.push(quest.id + " must be gated by its declared source chapter.");
    }
  }

  for (const progression of progressions) {
    if (!Array.isArray(progression.majorRewardIds) || progression.majorRewardIds.length === 0) {
      issues.push(progression.id + " must reference at least one major reward.");
      continue;
    }
    for (const rewardId of progression.majorRewardIds) {
      const reward = rewardById.get(rewardId);
      if (!reward) {
        issues.push(progression.id + " references missing reward " + rewardId + ".");
      } else if (reward.sourceId !== progression.id) {
        issues.push(rewardId + " sourceId must match " + progression.id + ".");
      }
    }
  }

  for (const reward of rewards) {
    const source = progressionById.get(reward.sourceId);
    if (!source) {
      issues.push(reward.id + " references unknown reward source " + reward.sourceId + ".");
    } else if (!source.majorRewardIds.includes(reward.id)) {
      issues.push(reward.id + " is not listed by its source " + reward.sourceId + ".");
    }
  }

  if (issues.length) {
    throw new TypeError("Academy content validation failed:\n- " + [...new Set(issues)].join("\n- "));
  }

  return Object.freeze({
    chapters: chapters.length,
    quests: catalogQuests.length,
    activities: activities.length,
    hints: hints.length,
    rewards: rewards.length,
    skills: skillDefinitions.length,
    generators: generators.length
  });
}
