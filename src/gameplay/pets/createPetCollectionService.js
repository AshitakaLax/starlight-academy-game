import { selectPetCollection, selectPet } from "./petCollectionState.js";
import { gameConfig } from "../../config/gameConfig.js";

/** Runtime facade for pet collection; each species retains its own saved data. */
export function createPetCollectionService({ store, petCatalog } = {}) {
  if (!store || typeof store.getState !== "function" || typeof store.dispatch !== "function") {
    throw new TypeError("createPetCollectionService requires a compatible game store.");
  }
  if (!petCatalog || typeof petCatalog.get !== "function"
      || typeof petCatalog.has !== "function" || typeof petCatalog.list !== "function") {
    throw new TypeError("createPetCollectionService requires a pet catalog.");
  }

  function getSnapshot() {
    const state = store.getState();
    const collection = selectPetCollection(state, petCatalog);
    const pets = petCatalog.list().map((definition) => Object.freeze({
      ...definition,
      ...collection.pets[definition.id],
      active: collection.activePetId === definition.id,
      totalCareMoments: collection.pets[definition.id].careMoments
    }));
    return Object.freeze({
      activePetId: collection.activePetId,
      activePet: pets.find((pet) => pet.id === collection.activePetId) ?? null,
      pets: Object.freeze(pets)
    });
  }

  function getPet(petId) {
    return selectPet(store.getState(), petCatalog, petId);
  }

  function unlockPet(petId, sourceId) {
    if (typeof petId !== "string" || !petId.trim()) throw new TypeError("unlockPet requires a pet ID.");
    if (typeof sourceId !== "string" || !sourceId.trim()) throw new TypeError("unlockPet requires a source ID.");
    const receipt = store.dispatch({
      type: "pets/pet-unlocked",
      payload: { petId, sourceId }
    });
    const pet = getPet(petId);
    return Object.freeze({
      unlocked: pet?.unlocked === true,
      changed: receipt.changed === true,
      reason: receipt.changed ? "pet-unlocked" : "already-unlocked",
      petId,
      unlockSource: pet?.unlockSource ?? null
    });
  }

  function selectActivePet(petId) {
    if (typeof petId !== "string" || !petId.trim()) throw new TypeError("selectActivePet requires a pet ID.");
    const receipt = store.dispatch({
      type: "pets/active-pet-selected",
      payload: { petId }
    });
    return Object.freeze({
      changed: receipt.changed === true,
      activePetId: selectPetCollection(store.getState(), petCatalog).activePetId,
      pet: getPet(petId)
    });
  }

  function performCare(petId, careType) {
    if (typeof petId !== "string" || !petId.trim()) throw new TypeError("performCare requires a pet ID.");
    const before = getPet(petId);
    if (!before) throw new RangeError("Unknown pet ID: " + petId);
    if (!before.unlocked) throw new Error("A locked companion cannot receive care.");
    const receipt = store.dispatch({
      type: "pets/care-performed",
      payload: { petId, careType }
    });
    const after = getPet(petId);
    const progressBefore = before.careProgress[careType];
    const progressAfter = after.careProgress[careType];
    return Object.freeze({
      performed: true,
      changed: receipt.changed === true,
      petId,
      careType,
      progressBefore,
      progressAfter,
      progressIncreased: progressAfter > progressBefore,
      meterFull: progressAfter >= gameConfig.petCare.progressMaximum,
      bondExperienceBefore: before.bondExperience,
      bondExperienceAfter: after.bondExperience,
      bondExperienceGained: Math.max(0, after.bondExperience - before.bondExperience),
      careMoments: after.careMoments
    });
  }

  function setAppearancePalette(petId, paletteId) {
    if (typeof petId !== "string" || !petId.trim()
        || typeof paletteId !== "string" || !paletteId.trim()) {
      throw new TypeError("setAppearancePalette requires a pet ID and palette ID.");
    }
    const receipt = store.dispatch({
      type: "pets/appearance-updated",
      payload: { petId, paletteId }
    });
    return Object.freeze({
      changed: receipt.changed === true,
      pet: getPet(petId)
    });
  }

  return Object.freeze({
    getSnapshot,
    getPet,
    unlockPet,
    selectActivePet,
    setAppearancePalette,
    performCare
  });
}
