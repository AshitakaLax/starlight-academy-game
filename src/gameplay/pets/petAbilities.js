/**
 * Pet ability resolution. Only active pet's ability applies; no stacking.
 */
import { CONFIG } from "../../systems/config/config.js";

export function activeAbility(state) {
  const id = state?.pets?.activePetId;
  if (!id) return null;
  const pet = state?.pets?.pets?.[id];
  if (!pet || !pet.unlocked) return null;
  return CONFIG.pets.abilities[id] || null;
}

export function applyGemBonus(state, baseGems) {
  const ability = activeAbility(state);
  if (ability?.effect === "gem_bonus_routine") {
    return Math.round(baseGems * (1 + (ability.value || 0)));
  }
  return baseGems;
}

export function grantSparkleBonus(state, baseSparkles) {
  const ability = activeAbility(state);
  if (ability?.effect === "sparkle_bonus_pb") {
    return baseSparkles + (ability.value || 0);
  }
  return baseSparkles;
}

export function extraHintTokens(state) {
  const ability = activeAbility(state);
  if (ability?.effect === "extra_hint_token") {
    return ability.value || 0;
  }
  return 0;
}

export default { activeAbility, applyGemBonus, grantSparkleBonus, extraHintTokens };
