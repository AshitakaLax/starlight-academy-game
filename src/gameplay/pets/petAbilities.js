import { gameConfig } from "../../config/gameConfig.js";
import { selectPetCollection } from "./petCollectionState.js";

const ABILITY_DEFINITIONS = gameConfig.petAbilities.definitions;

function isValidAbility(value) {
  return value && typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.description === "string"
    && ["feeding", "grooming", "play"].includes(value.careType)
    && Number.isInteger(value.careProgressBonus)
    && value.careProgressBonus > 0
    && value.careProgressBonus <= 50;
}

export function getPetAbilityDefinition(petId) {
  const ability = ABILITY_DEFINITIONS[petId] ?? null;
  if (!ability) return null;
  if (!isValidAbility(ability)) throw new TypeError("Configured pet ability is invalid: " + petId);
  return ability;
}

/** Exactly one configured ability follows the currently selected unlocked companion. */
export function selectActivePetAbility(state, petCatalog) {
  if (!petCatalog || typeof petCatalog.has !== "function") {
    throw new TypeError("selectActivePetAbility requires a pet catalog.");
  }
  const collection = selectPetCollection(state, petCatalog);
  const petId = collection.activePetId;
  const ability = getPetAbilityDefinition(petId);
  if (!ability || !collection.pets[petId]?.unlocked) return null;
  return Object.freeze({ petId, ...ability });
}

/**
 * Resolve a bonus only for the active pet and its matching optional care action.
 * No curriculum, question generation, answer validation, or reward rule is read.
 */
export function selectPetAbilityCareBonus(state, petCatalog, petId, careType) {
  if (typeof petId !== "string" || !petCatalog?.has?.(petId)) return 0;
  if (!["feeding", "grooming", "play"].includes(careType)) return 0;
  const activeAbility = selectActivePetAbility(state, petCatalog);
  return activeAbility?.petId === petId && activeAbility.careType === careType
    ? activeAbility.careProgressBonus
    : 0;
}
