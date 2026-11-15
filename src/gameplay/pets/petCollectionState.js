const CARE_TRACKS = Object.freeze(["feeding", "grooming", "play"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validCounter(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function createPetEntry(definition) {
  return {
    unlocked: definition.starter,
    unlockSource: definition.starter ? "academy-starter" : null,
    appearance: { paletteId: definition.defaultPaletteId },
    bondExperience: 0,
    careProgress: { feeding: 0, grooming: 0, play: 0 }
  };
}

function normalizePetEntry(definition, savedEntry) {
  const saved = isPlainObject(savedEntry) ? savedEntry : {};
  const unlocked = definition.starter || saved.unlocked === true;
  const appearance = isPlainObject(saved.appearance) ? saved.appearance : {};
  const paletteIsValid = definition.appearancePalettes.some((palette) => palette.id === appearance.paletteId);
  const savedCare = isPlainObject(saved.careProgress) ? saved.careProgress : {};
  const careProgress = Object.fromEntries(CARE_TRACKS.map((track) => [
    track,
    validCounter(savedCare[track]) ? savedCare[track] : 0
  ]));
  const unlockSource = unlocked
    ? (definition.starter ? "academy-starter"
      : (typeof saved.unlockSource === "string" && saved.unlockSource.trim().length > 0
        ? saved.unlockSource.slice(0, 128) : "saved-progress"))
    : null;
  return Object.freeze({
    unlocked,
    unlockSource,
    appearance: Object.freeze({
      paletteId: paletteIsValid ? appearance.paletteId : definition.defaultPaletteId
    }),
    bondExperience: validCounter(saved.bondExperience) ? saved.bondExperience : 0,
    careProgress: Object.freeze(careProgress)
  });
}

export function createInitialPetCollectionState(petCatalog) {
  if (!petCatalog || typeof petCatalog.list !== "function") {
    throw new TypeError("createInitialPetCollectionState requires a pet catalog.");
  }
  const definitions = petCatalog.list();
  if (definitions.length === 0) throw new Error("At least one pet must be registered.");
  const pets = Object.fromEntries(definitions.map((definition) => [
    definition.id,
    createPetEntry(definition)
  ]));
  const firstStarter = definitions.find((definition) => definition.starter);
  if (!firstStarter) throw new Error("A pet collection requires at least one starter companion.");
  return { activePetId: firstStarter.id, pets };
}

export function selectPetCollection(state, petCatalog) {
  if (!petCatalog || typeof petCatalog.list !== "function") {
    throw new TypeError("selectPetCollection requires a pet catalog.");
  }
  const savedCollection = isPlainObject(state?.petCollection) ? state.petCollection : {};
  const savedPets = isPlainObject(savedCollection.pets) ? savedCollection.pets : {};
  const pets = Object.fromEntries(petCatalog.list().map((definition) => [
    definition.id,
    normalizePetEntry(definition, savedPets[definition.id])
  ]));
  const unlocked = petCatalog.list().filter((definition) => pets[definition.id].unlocked);
  const requestedActive = savedCollection.activePetId;
  const activePetId = unlocked.some((definition) => definition.id === requestedActive)
    ? requestedActive
    : unlocked[0]?.id ?? petCatalog.list().find((definition) => definition.starter).id;
  return Object.freeze({
    activePetId,
    pets: Object.freeze(pets)
  });
}

export function selectPet(state, petCatalog, petId) {
  const definition = petCatalog?.get?.(petId);
  if (!definition) return null;
  const collection = selectPetCollection(state, petCatalog);
  return Object.freeze({
    definition,
    ...collection.pets[petId],
    active: collection.activePetId === petId
  });
}

export { CARE_TRACKS };
