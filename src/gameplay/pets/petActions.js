import { isPlainObject } from "../../core/state/stateUtils.js";
import { selectPetCollection } from "./petCollectionState.js";
import { CARE_TRACKS } from "./petCollectionState.js";
import { gameConfig } from "../../config/gameConfig.js";

function hasOnlyKeys(value, keys) {
  return Object.keys(value).every((key) => keys.includes(key));
}

export function createPetActionDefinitions({ petCatalog, careConfig = gameConfig.petCare } = {}) {
  if (!petCatalog || typeof petCatalog.has !== "function" || typeof petCatalog.get !== "function"
      || typeof petCatalog.list !== "function") {
    throw new TypeError("createPetActionDefinitions requires a pet catalog.");
  }
  if (!careConfig || !Number.isInteger(careConfig.progressPerInteraction)
      || careConfig.progressPerInteraction < 1 || careConfig.progressPerInteraction > 100
      || !Number.isInteger(careConfig.progressMaximum) || careConfig.progressMaximum < 1
      || careConfig.progressMaximum > 1000 || !Number.isInteger(careConfig.bondExperiencePerInteraction)
      || careConfig.bondExperiencePerInteraction < 1 || careConfig.bondExperiencePerInteraction > 1000) {
    throw new TypeError("Pet care configuration contains unsupported progression values.");
  }

  return Object.freeze({
    "pets/pet-unlocked": Object.freeze({
      validate(payload) {
        return isPlainObject(payload) && Object.keys(payload).length === 2
          && hasOnlyKeys(payload, ["petId", "sourceId"])
          && typeof payload.petId === "string" && petCatalog.has(payload.petId)
          && typeof payload.sourceId === "string" && payload.sourceId.trim().length > 0
          && payload.sourceId.length <= 128
          ? true : "pets/pet-unlocked expects a registered petId and non-empty sourceId.";
      },
      reduce(state, payload) {
        const collection = selectPetCollection(state, petCatalog);
        const current = collection.pets[payload.petId];
        if (current.unlocked) return state;
        return {
          ...state,
          petCollection: {
            activePetId: collection.activePetId,
            pets: {
              ...collection.pets,
              [payload.petId]: {
                ...current,
                unlocked: true,
                unlockSource: payload.sourceId
              }
            }
          }
        };
      }
    }),

    "pets/active-pet-selected": Object.freeze({
      validate(payload) {
        if (!isPlainObject(payload) || Object.keys(payload).length !== 1
            || !hasOnlyKeys(payload, ["petId"]) || typeof payload.petId !== "string"
            || !petCatalog.has(payload.petId)) {
          return "pets/active-pet-selected expects a registered petId.";
        }
        return true;
      },
      reduce(state, payload) {
        const collection = selectPetCollection(state, petCatalog);
        if (!collection.pets[payload.petId].unlocked) throw new Error("A locked pet cannot become the active companion.");
        if (collection.activePetId === payload.petId) return state;
        return {
          ...state,
          petCollection: {
            ...collection,
            activePetId: payload.petId
          }
        };
      }
    }),

    "pets/care-performed": Object.freeze({
      validate(payload) {
        return isPlainObject(payload) && Object.keys(payload).length === 2
          && hasOnlyKeys(payload, ["petId", "careType"])
          && typeof payload.petId === "string" && petCatalog.has(payload.petId)
          && CARE_TRACKS.includes(payload.careType)
          ? true : "pets/care-performed expects a registered petId and careType.";
      },
      reduce(state, payload) {
        const collection = selectPetCollection(state, petCatalog);
        const current = collection.pets[payload.petId];
        if (!current.unlocked) throw new Error("A locked companion cannot receive care.");
        const nextProgress = Math.min(
          careConfig.progressMaximum,
          current.careProgress[payload.careType] + careConfig.progressPerInteraction
        );
        const nextBondExperience = Math.min(
          Number.MAX_SAFE_INTEGER,
          current.bondExperience + careConfig.bondExperiencePerInteraction
        );
        const nextCareMoments = Math.min(Number.MAX_SAFE_INTEGER, current.careMoments + 1);
        if (nextProgress === current.careProgress[payload.careType]
            && nextBondExperience === current.bondExperience
            && nextCareMoments === current.careMoments) return state;
        return {
          ...state,
          petCollection: {
            ...collection,
            pets: {
              ...collection.pets,
              [payload.petId]: {
                ...current,
                bondExperience: nextBondExperience,
                careMoments: nextCareMoments,
                careProgress: {
                  ...current.careProgress,
                  [payload.careType]: nextProgress
                }
              }
            }
          }
        };
      }
    }),

    "pets/appearance-updated": Object.freeze({
      validate(payload) {
        if (!isPlainObject(payload) || Object.keys(payload).length !== 2
            || !hasOnlyKeys(payload, ["petId", "paletteId"])
            || typeof payload.petId !== "string" || !petCatalog.has(payload.petId)
            || typeof payload.paletteId !== "string") {
          return "pets/appearance-updated expects a registered petId and paletteId.";
        }
        return petCatalog.get(payload.petId).appearancePalettes.some((palette) => palette.id === payload.paletteId)
          ? true : "The selected appearance palette is not registered for this pet.";
      },
      reduce(state, payload) {
        const collection = selectPetCollection(state, petCatalog);
        const current = collection.pets[payload.petId];
        if (!current.unlocked) throw new Error("A locked pet's appearance cannot be changed.");
        if (current.appearance.paletteId === payload.paletteId) return state;
        return {
          ...state,
          petCollection: {
            ...collection,
            pets: {
              ...collection.pets,
              [payload.petId]: {
                ...current,
                appearance: { ...current.appearance, paletteId: payload.paletteId }
              }
            }
          }
        };
      }
    })
  });
}
