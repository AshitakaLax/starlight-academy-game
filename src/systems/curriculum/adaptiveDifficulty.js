import { gameConfig } from "../../config/gameConfig.js";
import { DIFFICULTY_TIER_IDS, getDifficultyTier } from "./difficultyTiers.js";
import { getSkillDefinition } from "./skillRegistry.js";

/**
 * Evaluate only learning evidence from the currently selected tier.
 * This policy intentionally ignores elapsed time, response speed, and streaks.
 */
export function evaluateAdaptiveTier({
  currentTier = gameConfig.curriculum.defaultTier,
  evidence = [],
  windowSize = gameConfig.curriculum.adaptiveWindowSize
} = {}) {
  if (!getDifficultyTier(currentTier)) throw new TypeError("currentTier must be a registered difficulty tier.");
  if (!Array.isArray(evidence)) throw new TypeError("evidence must be an array.");
  if (!Number.isInteger(windowSize) || windowSize < 2 || windowSize > 20) {
    throw new RangeError("windowSize must be an integer from 2 to 20.");
  }

  const window = evidence.slice(-windowSize);
  const correctResponses = window.filter((item) => item?.correct === true).length;
  const independentCorrect = window.filter((item) => item?.correct === true && item?.hintLevel === 0).length;
  const tierIndex = DIFFICULTY_TIER_IDS.indexOf(currentTier);
  let nextTier = currentTier;
  let reason = "keep-practicing";

  if (window.length < windowSize) {
    reason = "gathering-evidence";
  } else if (independentCorrect >= gameConfig.curriculum.promotionIndependentCorrect) {
    nextTier = DIFFICULTY_TIER_IDS[Math.min(DIFFICULTY_TIER_IDS.length - 1, tierIndex + 1)];
    reason = nextTier === currentTier ? "top-tier-demonstrated" : "consistent-independent-success";
  } else if (correctResponses <= gameConfig.curriculum.demotionMaximumCorrect) {
    nextTier = DIFFICULTY_TIER_IDS[Math.max(0, tierIndex - 1)];
    reason = nextTier === currentTier ? "foundation-support-retained" : "more-supported-practice";
  }

  const nextIndex = DIFFICULTY_TIER_IDS.indexOf(nextTier);
  const direction = nextIndex === tierIndex ? "maintain" : nextIndex > tierIndex
    ? "increase"
    : "decrease";

  return Object.freeze({
    currentTier,
    nextTier,
    changed: nextTier !== currentTier,
    direction,
    reason,
    evidenceCount: window.length,
    correctResponses,
    independentCorrect,
    windowSize
  });
}

/** A fresh player starts ready to explore at Core; no placement quiz is required. */
export function createLowPressureOnboardingProfile() {
  return Object.freeze({
    mode: "guided-discovery",
    placementTestRequired: false,
    initialTier: gameConfig.curriculum.onboardingTier,
    startingGuidance: "Start near the Core / third-grade range and let each skill find its own level through ordinary activities."
  });
}

export function selectSkillTier(state, skillId) {
  if (!getSkillDefinition(skillId)) return null;
  const candidate = state?.curriculum?.skills?.[skillId]?.currentTier;
  return getDifficultyTier(candidate) ? candidate : gameConfig.curriculum.defaultTier;
}

/** Select the nearest tier an activity can actually serve; ties prefer more support. */
export function selectSupportedSkillTier(state, skillId, supportedTiers) {
  if (!getSkillDefinition(skillId)) return null;
  if (!Array.isArray(supportedTiers) || supportedTiers.length === 0
      || supportedTiers.some((tier) => !getDifficultyTier(tier))) {
    throw new TypeError("supportedTiers must be a non-empty list of registered tiers.");
  }
  const unique = [...new Set(supportedTiers)];
  const preferredIndex = DIFFICULTY_TIER_IDS.indexOf(selectSkillTier(state, skillId));
  return unique.sort((left, right) => {
    const leftIndex = DIFFICULTY_TIER_IDS.indexOf(left);
    const rightIndex = DIFFICULTY_TIER_IDS.indexOf(right);
    const distance = Math.abs(leftIndex - preferredIndex) - Math.abs(rightIndex - preferredIndex);
    return distance || leftIndex - rightIndex;
  })[0];
}
