/**
 * Pet collection model helpers.
 */
export const PET_SPECIES = ["pegasus", "phoenix", "nymphKitten"];

export function defaultPetState() {
  return { unlocked: false, bondLevel: 1, bondXp: 0, careProgress: { joy: 0, nourishment: 0, grooming: 0 }, appearance: {} };
}

export function isUnlocked(state, petId) {
  return !!state?.pets?.pets?.[petId]?.unlocked;
}
export default { PET_SPECIES, defaultPetState, isUnlocked };
