/**
 * Adaptive difficulty: rolling evidence window and bounded tier changes.
 */
import { CONFIG } from "../config/config.js";

const TIERS = CONFIG.difficulty.tiers;

export function tierIndex(tier) {
  return Math.max(0, TIERS.indexOf(tier));
}

export function adjustTier(currentTier, attempts) {
  // attempts: array of { correct, hintUsed, demonstrated }
  const window = attempts.slice(-CONFIG.difficulty.evidenceWindow);
  const independentCorrect = window.filter((a) => a.correct && !a.demonstrated).length;
  const solved = window.filter((a) => a.correct).length;
  const demos = window.filter((a) => a.demonstrated).length;
  let idx = tierIndex(currentTier);
  if (window.length >= CONFIG.difficulty.evidenceWindow) {
    if (independentCorrect >= CONFIG.difficulty.moveUpThreshold) {
      idx = Math.min(TIERS.length - 1, idx + 1);
    } else if (solved <= CONFIG.difficulty.moveDownThreshold || demos >= 3) {
      idx = Math.max(0, idx - 1);
    }
  }
  // never move more than one tier (already enforced)
  return TIERS[idx];
}
export default { tierIndex, adjustTier };
