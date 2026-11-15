/**
 * Adaptive difficulty helpers: onboarding preference mapping and bounded updates.
 */
import { CONFIG } from "../config/config.js";

export const PREFERENCE_TO_TIER = {
  gentle: "Developing",
  standard: "Core",
  challenging: "Stretch",
};

export function initialTierForPreference(pref) {
  return PREFERENCE_TO_TIER[pref] || CONFIG.difficulty.defaultTier;
}

export function applyOnboardingPreference(store, pref) {
  const tier = initialTierForPreference(pref);
  // Sets a default tier for newly seen skills; does not overwrite existing evidence.
  store.dispatch("settings/update", { startingDifficultyPreference: pref });
  return tier;
}

export function clampTierChange(from, to) {
  const tiers = CONFIG.difficulty.tiers;
  const i = tiers.indexOf(from);
  const j = tiers.indexOf(to);
  if (i < 0 || j < 0) return from;
  const delta = Math.max(-1, Math.min(1, j - i));
  return tiers[i + delta];
}
export default { PREFERENCE_TO_TIER, initialTierForPreference, applyOnboardingPreference, clampTierChange };
