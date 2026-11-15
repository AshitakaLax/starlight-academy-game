import { gameConfig } from "../../config/gameConfig.js";
import { isPlainObject } from "../../core/state/stateUtils.js";
import { getDifficultyTier } from "./difficultyTiers.js";
import { createLowPressureOnboardingProfile, evaluateAdaptiveTier } from "./adaptiveDifficulty.js";
import { skillDefinitions, getSkillDefinition } from "./skillRegistry.js";

const ACTIVITY_ID_PATTERN = /^[a-z][a-z0-9-]*(?:[.-][a-z][a-z0-9-]*)+$/;
const EVIDENCE_KEYS = Object.freeze(["skillId", "activityId", "tier", "correct", "hintLevel", "attempts"]);

function emptySkillProgress() {
  return {
    totalResponses: 0,
    totalAttempts: 0,
    correctResponses: 0,
    unassistedCorrect: 0,
    hintedResponses: 0,
    masteryStatus: "not-started",
    currentTier: gameConfig.curriculum.onboardingTier,
    recentEvidence: [],
    tierEvidence: [],
    tierChanges: 0,
    lastTierChangeReason: null
  };
}

/** Serializable blank progress for every registered skill. */
export function createInitialCurriculumProgress() {
  return {
    onboarding: createLowPressureOnboardingProfile(),
    skills: Object.fromEntries(skillDefinitions.map((skill) => [skill.id, emptySkillProgress()])),
    evidence: [],
    nextEvidenceSequence: 1
  };
}

function validateEvidence(payload) {
  if (!isPlainObject(payload) || Object.keys(payload).length !== EVIDENCE_KEYS.length
      || Object.keys(payload).some((key) => !EVIDENCE_KEYS.includes(key))) {
    return "curriculum/evidence-recorded expects skillId, activityId, tier, correct, hintLevel, and attempts.";
  }
  if (typeof payload.skillId !== "string" || !getSkillDefinition(payload.skillId)) {
    return "skillId must exist in the curriculum skill registry.";
  }
  if (typeof payload.activityId !== "string" || !ACTIVITY_ID_PATTERN.test(payload.activityId)) {
    return "activityId must be a stable namespaced identifier.";
  }
  if (!getDifficultyTier(payload.tier)) return "tier must be a registered difficulty tier.";
  if (typeof payload.correct !== "boolean") return "correct must be a boolean.";
  if (!Number.isInteger(payload.hintLevel) || payload.hintLevel < 0 || payload.hintLevel > 3) {
    return "hintLevel must be an integer from 0 to 3.";
  }
  if (!Number.isInteger(payload.attempts) || payload.attempts < 1 || payload.attempts > 5) {
    return "attempts must be an integer from 1 to 5.";
  }
  return true;
}

function updateSkillProgress(current, record) {
  const prior = isPlainObject(current) ? current : emptySkillProgress();
  const recentEvidence = [...(Array.isArray(prior.recentEvidence) ? prior.recentEvidence : []), record]
    .slice(-gameConfig.curriculum.masteryWindowSize);
  const independentCorrect = recentEvidence.filter((item) => item.correct && item.hintLevel === 0).length;
  const alreadyDemonstrated = prior.masteryStatus === "demonstrated";
  const masteryStatus = alreadyDemonstrated
      || (recentEvidence.length >= gameConfig.curriculum.masteryWindowSize
        && independentCorrect >= gameConfig.curriculum.masteryRequiredIndependentCorrect)
    ? "demonstrated"
    : "in-progress";

  const currentTier = getDifficultyTier(prior.currentTier)
    ? prior.currentTier
    : gameConfig.curriculum.onboardingTier;
  const previousTierEvidence = Array.isArray(prior.tierEvidence)
    ? prior.tierEvidence.filter((item) => item?.tier === currentTier)
    : [];
  const tierEvidence = record.tier === currentTier
    ? [...previousTierEvidence, record].slice(-gameConfig.curriculum.adaptiveWindowSize)
    : previousTierEvidence;
  const adaptation = evaluateAdaptiveTier({ currentTier, evidence: tierEvidence });
  const changedTier = adaptation.changed;
  const nextTierEvidence = changedTier ? [] : tierEvidence;

  return {
    totalResponses: (Number.isSafeInteger(prior.totalResponses) ? prior.totalResponses : 0) + 1,
    totalAttempts: (Number.isSafeInteger(prior.totalAttempts) ? prior.totalAttempts : 0) + record.attempts,
    correctResponses: (Number.isSafeInteger(prior.correctResponses) ? prior.correctResponses : 0) + (record.correct ? 1 : 0),
    unassistedCorrect: (Number.isSafeInteger(prior.unassistedCorrect) ? prior.unassistedCorrect : 0)
      + (record.correct && record.hintLevel === 0 ? 1 : 0),
    hintedResponses: (Number.isSafeInteger(prior.hintedResponses) ? prior.hintedResponses : 0)
      + (record.hintLevel > 0 ? 1 : 0),
    masteryStatus,
    currentTier: adaptation.nextTier,
    recentEvidence,
    tierEvidence: nextTierEvidence,
    tierChanges: (Number.isSafeInteger(prior.tierChanges) ? prior.tierChanges : 0) + (changedTier ? 1 : 0),
    lastTierChangeReason: changedTier ? adaptation.reason : (prior.lastTierChangeReason ?? null)
  };
}

/** State action extension injected by the browser composition root. */
export const curriculumActionDefinitions = Object.freeze({
  "curriculum/evidence-recorded": Object.freeze({
    validate: validateEvidence,
    reduce(state, payload) {
      const current = isPlainObject(state.curriculum) ? state.curriculum : createInitialCurriculumProgress();
      const sequence = Number.isSafeInteger(current.nextEvidenceSequence) && current.nextEvidenceSequence > 0
        ? current.nextEvidenceSequence
        : 1;
      const record = Object.freeze({
        sequence,
        skillId: payload.skillId,
        activityId: payload.activityId,
        tier: payload.tier,
        correct: payload.correct,
        hintLevel: payload.hintLevel,
        attempts: payload.attempts
      });
      const currentSkills = isPlainObject(current.skills) ? current.skills : {};
      const skillProgress = updateSkillProgress(currentSkills[payload.skillId], record);
      const evidence = [...(Array.isArray(current.evidence) ? current.evidence : []), record]
        .slice(-gameConfig.curriculum.evidenceHistoryLimit);
      return {
        ...state,
        curriculum: {
          ...current,
          skills: { ...currentSkills, [payload.skillId]: skillProgress },
          evidence,
          nextEvidenceSequence: sequence + 1
        }
      };
    }
  })
});

export function selectSkillProgress(state, skillId) {
  const progress = state?.curriculum?.skills?.[skillId];
  if (!isPlainObject(progress)) return Object.freeze(emptySkillProgress());
  return progress;
}

export function selectCurriculumEvidence(state) {
  return Array.isArray(state?.curriculum?.evidence) ? state.curriculum.evidence : [];
}
