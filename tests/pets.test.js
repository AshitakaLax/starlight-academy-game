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


test("treat feeding, sparkle grooming, and ribbon play increase separate care tracks and bond", () => {
  const { service } = harness();
  const feeding = service.performCare("pet.pegasus", "feeding");
  const grooming = service.performCare("pet.pegasus", "grooming");
  const play = service.performCare("pet.pegasus", "play");
  const pet = service.getPet("pet.pegasus");
  assert.equal(feeding.progressAfter, 25);
  assert.equal(grooming.progressAfter, 35);
  assert.equal(play.progressAfter, 25);
  assert.deepEqual(pet.careProgress, { feeding: 25, grooming: 35, play: 25 });
  assert.equal(pet.bondExperience, 15);
  assert.equal(pet.careMoments, 3);
});

test("care is optional and the unlocked pet can receive any care activity repeatedly", () => {
  const { service } = harness();
  const untouched = service.getPet("pet.pegasus");
  assert.equal(untouched.bondExperience, 0);
  assert.equal(untouched.careMoments, 0);
  for (let count = 0; count < 2; count += 1) {
    service.performCare("pet.pegasus", "feeding");
    service.performCare("pet.pegasus", "grooming");
    service.performCare("pet.pegasus", "play");
  }
  assert.equal(service.getPet("pet.pegasus").bondExperience, 30);
  assert.equal(service.getPet("pet.pegasus").careMoments, 6);
});

test("a full care meter never blocks another care moment or bond growth", () => {
  const { service } = harness();
  for (let count = 0; count < 4; count += 1) {
    service.performCare("pet.pegasus", "feeding");
  }
  const fullBefore = service.getPet("pet.pegasus");
  assert.equal(fullBefore.careProgress.feeding, 100);
  assert.equal(fullBefore.bondExperience, 20);
  const repeated = service.performCare("pet.pegasus", "feeding");
  assert.equal(repeated.performed, true);
  assert.equal(repeated.meterFull, true);
  assert.equal(repeated.progressIncreased, false);
  assert.equal(repeated.progressAfter, 100);
  assert.equal(repeated.bondExperienceGained, 5);
  assert.equal(repeated.careMoments, 5);
  const fullAfter = service.getPet("pet.pegasus");
  assert.equal(fullAfter.careProgress.feeding, 100);
  assert.equal(fullAfter.bondExperience, 25);
});

test("care progress and bond are independent for every unlocked pet", () => {
  const { service } = harness();
  service.unlockPet("pet.phoenix", "chapter-02");
  service.performCare("pet.pegasus", "feeding");
  service.performCare("pet.phoenix", "play");
  service.selectActivePet("pet.phoenix");
  const snapshot = service.getSnapshot();
  const pegasus = snapshot.pets.find((pet) => pet.id === "pet.pegasus");
  const phoenix = snapshot.pets.find((pet) => pet.id === "pet.phoenix");
  assert.deepEqual(pegasus.careProgress, { feeding: 25, grooming: 0, play: 0 });
  assert.deepEqual(phoenix.careProgress, { feeding: 0, grooming: 0, play: 25 });
  assert.equal(pegasus.bondExperience, 5);
  assert.equal(phoenix.bondExperience, 5);
  assert.equal(pegasus.careMoments, 1);
  assert.equal(phoenix.careMoments, 1);
});

test("locked pets and unregistered care types cannot receive care or supply their own reward amounts", () => {
  const { store, service } = harness();
  assert.throws(() => service.performCare("pet.phoenix", "feeding"), /locked companion/);
  assert.throws(() => service.performCare("pet.pegasus", "training"), /registered petId and careType/);
  assert.throws(() => store.dispatch({
    type: "pets/care-performed",
    payload: { petId: "pet.pegasus", careType: "feeding", progressDelta: 100, bondExperience: 1000 }
  }), /registered petId and careType/);
});

test("care meters are bounded and malformed saved counters are safely normalized", () => {
  const { catalog } = harness();
  const normalized = selectPetCollection({
    petCollection: {
      activePetId: "pet.pegasus",
      pets: {
        "pet.pegasus": {
          unlocked: true,
          bondExperience: -4,
          careMoments: Number.MAX_SAFE_INTEGER + 1,
          careProgress: { feeding: 10000, grooming: -5, play: 4 }
        }
      }
    }
  }, catalog);
  assert.equal(normalized.pets["pet.pegasus"].careProgress.feeding, 100);
  assert.equal(normalized.pets["pet.pegasus"].careProgress.grooming, 0);
  assert.equal(normalized.pets["pet.pegasus"].careProgress.play, 4);
  assert.equal(normalized.pets["pet.pegasus"].bondExperience, 0);
  assert.equal(normalized.pets["pet.pegasus"].careMoments, 0);
});

test("care moments, meters, and bond survive save serialization and active-pet switching", () => {
  const original = harness();
  original.service.unlockPet("pet.phoenix", "chapter-02");
  original.service.performCare("pet.pegasus", "grooming");
  original.service.performCare("pet.phoenix", "play");
  original.service.selectActivePet("pet.phoenix");
  const saved = JSON.parse(JSON.stringify(original.store.getState()));
  const restored = harness(saved);
  const snapshot = restored.service.getSnapshot();
  const pegasus = snapshot.pets.find((pet) => pet.id === "pet.pegasus");
  const phoenix = snapshot.pets.find((pet) => pet.id === "pet.phoenix");
  assert.equal(snapshot.activePetId, "pet.phoenix");
  assert.equal(pegasus.careProgress.grooming, 35);
  assert.equal(pegasus.bondExperience, 5);
  assert.equal(pegasus.careMoments, 1);
  assert.equal(phoenix.careProgress.play, 25);
  assert.equal(phoenix.bondExperience, 5);
  assert.equal(phoenix.careMoments, 1);
});


test("each species has one distinct centrally configured care ability", async () => {
  const { gameConfig } = await import("../src/config/gameConfig.js");
  const abilities = gameConfig.petAbilities.definitions;
  assert.deepEqual(Object.keys(abilities).sort(), ["pet.nymph-kitten", "pet.pegasus", "pet.phoenix"]);
  assert.deepEqual(
    Object.values(abilities).map((ability) => ability.careType).sort(),
    ["feeding", "grooming", "play"]
  );
  assert.ok(Object.values(abilities).every((ability) => ability.careProgressBonus === 10));
});

test("Pegasus ability adds a grooming bonus only while Pegasus is active", async () => {
  const { catalog, store, service } = harness();
  const { selectPetAbilityCareBonus, selectActivePetAbility } = await import("../src/gameplay/pets/petAbilities.js");
  const active = selectActivePetAbility(store.getState(), catalog);
  assert.equal(active.id, "ability.skyward-shine");
  assert.equal(active.petId, "pet.pegasus");
  assert.equal(selectPetAbilityCareBonus(store.getState(), catalog, "pet.pegasus", "grooming"), 10);
  assert.equal(selectPetAbilityCareBonus(store.getState(), catalog, "pet.pegasus", "feeding"), 0);
  assert.equal(service.performCare("pet.pegasus", "grooming").progressAfter, 35);
  assert.equal(service.performCare("pet.pegasus", "feeding").progressAfter, 25);
});

test("switching companions replaces the active ability and prevents ability stacking", async () => {
  const { service, store, catalog } = harness();
  const { selectPetAbilityCareBonus } = await import("../src/gameplay/pets/petAbilities.js");
  service.unlockPet("pet.phoenix", "chapter-02");
  service.unlockPet("pet.nymph-kitten", "chapter-03");

  const pegasus = service.getSnapshot();
  assert.equal(pegasus.activeAbility.id, "ability.skyward-shine");
  service.selectActivePet("pet.phoenix");
  const phoenix = service.getSnapshot();
  assert.equal(phoenix.activeAbility.id, "ability.ember-treat");
  assert.equal(phoenix.activeAbility.petId, "pet.phoenix");
  assert.equal(selectPetAbilityCareBonus(store.getState(), catalog, "pet.phoenix", "feeding"), 10);
  assert.equal(selectPetAbilityCareBonus(store.getState(), catalog, "pet.pegasus", "grooming"), 0);
  assert.equal(service.performCare("pet.phoenix", "feeding").progressAfter, 35);
  assert.equal(service.performCare("pet.pegasus", "grooming").progressAfter, 25);

  service.selectActivePet("pet.nymph-kitten");
  const kitten = service.getSnapshot();
  assert.equal(kitten.activeAbility.id, "ability.ribbontail-whirl");
  assert.equal(kitten.pets.filter((pet) => pet.active).length, 1);
  assert.equal(selectPetAbilityCareBonus(store.getState(), catalog, "pet.nymph-kitten", "play"), 10);
  assert.equal(selectPetAbilityCareBonus(store.getState(), catalog, "pet.phoenix", "feeding"), 0);
  assert.equal(service.performCare("pet.nymph-kitten", "play").progressAfter, 35);
});

test("pet ability selection is derived from the saved active pet and restores without stacking", () => {
  const initial = harness();
  initial.service.unlockPet("pet.phoenix", "chapter-02");
  initial.service.unlockPet("pet.nymph-kitten", "chapter-03");
  initial.service.selectActivePet("pet.nymph-kitten");
  const saved = JSON.parse(JSON.stringify(initial.store.getState()));
  const restored = harness(saved);
  assert.equal(restored.service.getSnapshot().activeAbility.id, "ability.ribbontail-whirl");
  assert.equal(restored.service.getSnapshot().activePetId, "pet.nymph-kitten");
  assert.equal(restored.service.getSnapshot().pets.filter((pet) => pet.active).length, 1);
});

test("pet abilities cannot be supplied or stacked through care action payloads", () => {
  const { store, service } = harness();
  const initial = service.getPet("pet.pegasus");
  assert.throws(() => store.dispatch({
    type: "pets/care-performed",
    payload: { petId: "pet.pegasus", careType: "grooming", abilityId: "ability.ember-treat", careBonus: 100 }
  }), /registered petId and careType/);
  assert.equal(service.getPet("pet.pegasus").careProgress.grooming, initial.careProgress.grooming);
});

test("changing the active pet does not change adaptive difficulty or answer correctness", async () => {
  const { service } = harness();
  const { checkActivityAnswer } = await import("../src/systems/curriculum/answerRules.js");
  const { evaluateAdaptiveTier } = await import("../src/systems/curriculum/adaptiveDifficulty.js");
  service.unlockPet("pet.phoenix", "chapter-02");
  const evidence = [
    { correct: true, hintLevel: 0 },
    { correct: false, hintLevel: 1 },
    { correct: true, hintLevel: 0 },
    { correct: true, hintLevel: 0 },
    { correct: false, hintLevel: 2 }
  ];
  const beforeTier = evaluateAdaptiveTier({ currentTier: "core", evidence });
  const beforeAnswer = checkActivityAnswer(42, 42, { type: "numeric" });
  service.selectActivePet("pet.phoenix");
  const afterTier = evaluateAdaptiveTier({ currentTier: "core", evidence });
  const afterAnswer = checkActivityAnswer(42, 42, { type: "numeric" });
  assert.deepEqual(afterTier, beforeTier);
  assert.equal(afterAnswer, beforeAnswer);
});
