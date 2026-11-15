import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState, mergeGameStateDefaults } from "../src/core/state/actions.js";
import { createPetCatalog, createPetDefinition, defaultPetDefinitions } from "../src/gameplay/pets/petCatalog.js";
import { createInitialPetCollectionState, selectPetCollection, selectPet } from "../src/gameplay/pets/petCollectionState.js";
import { createPetActionDefinitions } from "../src/gameplay/pets/petActions.js";
import { createPetCollectionService } from "../src/gameplay/pets/createPetCollectionService.js";

function harness(saved = null) {
  const catalog = createPetCatalog(defaultPetDefinitions);
  const initialState = { ...createInitialGameState(), petCollection: createInitialPetCollectionState(catalog) };
  const store = createGameStore({
    initialState: saved ? mergeGameStateDefaults(initialState, saved) : initialState,
    actions: createPetActionDefinitions({ petCatalog: catalog })
  });
  const service = createPetCollectionService({ store, petCatalog: catalog });
  return { catalog, store, service };
}

test("catalog contains Pegasus, Phoenix, and Nymph Kitten with independent appearance palettes", () => {
  const catalog = createPetCatalog(defaultPetDefinitions);
  assert.deepEqual(catalog.list().map((pet) => pet.title), ["Pegasus", "Phoenix", "Nymph Kitten"]);
  assert.equal(catalog.list().filter((pet) => pet.starter).length, 1);
  assert.ok(catalog.list().every((pet) => pet.appearancePalettes.length >= 2));
  assert.throws(() => createPetDefinition({ ...defaultPetDefinitions[0], id: "bad" }), /namespace/);
  assert.throws(() => catalog.register(defaultPetDefinitions[0]), /already registered/);
});

test("new collection starts with Pegasus active and other companions locked", () => {
  const { service } = harness();
  const snapshot = service.getSnapshot();
  assert.equal(snapshot.activePetId, "pet.pegasus");
  assert.equal(snapshot.activePet.unlocked, true);
  assert.equal(snapshot.pets.find((pet) => pet.id === "pet.phoenix").unlocked, false);
  assert.equal(snapshot.pets.find((pet) => pet.id === "pet.nymph-kitten").unlocked, false);
});

test("locked pets cannot be selected or customized", () => {
  const { service } = harness();
  assert.throws(() => service.selectActivePet("pet.phoenix"), /locked pet/);
  assert.throws(() => service.setAppearancePalette("pet.phoenix", "ember"), /locked pet/);
});

test("unlocking a pet records its source and preserves the existing active companion", () => {
  const { service } = harness();
  const result = service.unlockPet("pet.phoenix", "chapter-02");
  assert.equal(result.unlocked, true);
  assert.equal(result.unlockSource, "chapter-02");
  assert.equal(service.getSnapshot().activePetId, "pet.pegasus");
  assert.equal(service.unlockPet("pet.phoenix", "chapter-02").changed, false);
});

test("appearance and active selection are independent per pet", () => {
  const { service } = harness();
  service.unlockPet("pet.phoenix", "chapter-02");
  service.setAppearancePalette("pet.pegasus", "twilight");
  service.setAppearancePalette("pet.phoenix", "ember");
  service.selectActivePet("pet.phoenix");
  assert.equal(service.getSnapshot().activePetId, "pet.phoenix");
  service.selectActivePet("pet.pegasus");
  const snapshot = service.getSnapshot();
  assert.equal(snapshot.pets.find((pet) => pet.id === "pet.pegasus").appearance.paletteId, "twilight");
  assert.equal(snapshot.pets.find((pet) => pet.id === "pet.phoenix").appearance.paletteId, "ember");
});

test("bond and care progress normalize independently and never decay during collection switching", () => {
  const { catalog, store, service } = harness();
  const state = store.getState();
  const petCollection = {
    activePetId: "pet.pegasus",
    pets: {
      "pet.pegasus": { unlocked: true, appearance: { paletteId: "twilight" }, bondExperience: 12, careProgress: { feeding: 2, grooming: 3, play: 4 } },
      "pet.phoenix": { unlocked: true, unlockSource: "chapter-02", appearance: { paletteId: "ember" }, bondExperience: 8, careProgress: { feeding: 1, grooming: 2, play: 3 } }
    }
  };
  const restored = { ...state, petCollection };
  const normalized = selectPetCollection(restored, catalog);
  assert.equal(normalized.pets["pet.pegasus"].bondExperience, 12);
  assert.deepEqual(normalized.pets["pet.pegasus"].careProgress, { feeding: 2, grooming: 3, play: 4 });
  assert.equal(normalized.pets["pet.phoenix"].bondExperience, 8);
  assert.deepEqual(normalized.pets["pet.phoenix"].careProgress, { feeding: 1, grooming: 2, play: 3 });
  service.selectActivePet("pet.pegasus");
  service.unlockPet("pet.phoenix", "chapter-02");
  assert.equal(service.getSnapshot().pets.find((pet) => pet.id === "pet.phoenix").bondExperience, 0);
});

test("legacy saves receive pet collection defaults without losing other progress", () => {
  const { catalog } = harness();
  const defaults = { ...createInitialGameState(), petCollection: createInitialPetCollectionState(catalog) };
  const legacy = { app: { screenId: "academy" }, profile: { nickname: "Star Student" } };
  const restored = mergeGameStateDefaults(defaults, legacy);
  assert.equal(restored.profile.nickname, "Star Student");
  assert.equal(restored.petCollection.activePetId, "pet.pegasus");
  assert.equal(restored.petCollection.pets["pet.pegasus"].unlocked, true);
});

test("invalid pet IDs, unlock payloads, and palette choices are rejected", () => {
  const { store, service } = harness();
  assert.throws(() => service.unlockPet("pet.unknown", "chapter-01"), /registered petId/);
  assert.throws(() => store.dispatch({ type: "pets/pet-unlocked", payload: { petId: "pet.phoenix", sourceId: "" } }), /non-empty sourceId/);
  assert.throws(() => service.setAppearancePalette("pet.pegasus", "not-a-palette"), /not registered/);
});
