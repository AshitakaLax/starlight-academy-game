import test from "node:test";
import assert from "node:assert/strict";
import { createPetCharacterMarkup, createPetCharacterPresentation } from "../src/ui/petCharacter.js";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState } from "../src/core/state/actions.js";
import { createPetCatalog, defaultPetDefinitions } from "../src/gameplay/pets/petCatalog.js";
import { createInitialPetCollectionState } from "../src/gameplay/pets/petCollectionState.js";
import { createPetActionDefinitions } from "../src/gameplay/pets/petActions.js";
import { createPetCollectionService } from "../src/gameplay/pets/createPetCollectionService.js";

const palette = {
  primaryColor: "#eecfff",
  secondaryColor: "#8b6ca8",
  accentColor: "#f4d47d"
};

test("each companion receives its own animated SVG character", () => {
  const speciesMarkers = {
    pegasus: "pet-character-wing--near",
    phoenix: "pet-character-wing--far",
    "nymph-kitten": "pet-character-eye"
  };
  for (const [species, marker] of Object.entries(speciesMarkers)) {
    const markup = createPetCharacterMarkup({ species, palette });
    assert.match(markup, /^<svg class="pet-character-art/);
    assert.ok(markup.includes("pet-character-art--" + species));
    assert.ok(markup.includes(marker));
    assert.ok(markup.includes("--pet-primary:#eecfff"));
    assert.ok(markup.includes('data-reaction="idle"'));
    assert.ok(markup.includes("pet-character-effect--feeding"));
    assert.ok(markup.includes("pet-character-effect--grooming"));
    assert.ok(markup.includes("pet-character-effect--play"));
  }
});

test("care interactions select distinct temporary character reactions", () => {
  for (const reaction of ["feeding", "grooming", "play"]) {
    const markup = createPetCharacterMarkup({ species: "pegasus", palette, reaction });
    assert.ok(markup.includes('data-reaction="' + reaction + '"'));
  }
});

test("unknown species are rejected and unsafe palette values fall back to defaults", () => {
  assert.throws(() => createPetCharacterMarkup({ species: "<svg onload=alert(1)>" }), /not supported/);
  const markup = createPetCharacterMarkup({
    species: "phoenix",
    palette: { primaryColor: 'red" onload="alert(1)', secondaryColor: "#ABCDEF", accentColor: null },
    reaction: "unexpected-event"
  });
  assert.ok(markup.includes("--pet-primary:#f4a45d"));
  assert.ok(markup.includes("--pet-secondary:#abcdef"));
  assert.ok(markup.includes("--pet-accent:#ffdf8a"));
  assert.ok(markup.includes('data-reaction="idle"'));
  assert.ok(!markup.includes("onload"));
});


test("changing a saved appearance palette updates the character presentation colors", () => {
  const catalog = createPetCatalog(defaultPetDefinitions);
  const store = createGameStore({
    initialState: {
      ...createInitialGameState(),
      petCollection: createInitialPetCollectionState(catalog)
    },
    actions: createPetActionDefinitions({ petCatalog: catalog })
  });
  const service = createPetCollectionService({ store, petCatalog: catalog });
  const getPegasusPresentation = () => createPetCharacterPresentation(
    service.getSnapshot().pets.find((pet) => pet.id === "pet.pegasus")
  );

  const original = getPegasusPresentation();
  assert.equal(original.paletteId, "moonlit");
  assert.match(original.markup, /--pet-primary:#fffaf3/);

  const update = service.setAppearancePalette("pet.pegasus", "twilight");
  assert.equal(update.changed, true);
  assert.equal(update.pet.appearance.paletteId, "twilight");

  const twilight = getPegasusPresentation();
  assert.equal(twilight.paletteId, "twilight");
  assert.deepEqual(twilight.palette, {
    primaryColor: "#d9d5f2",
    secondaryColor: "#7972b4",
    accentColor: "#f0c979"
  });
  assert.match(twilight.markup, /--pet-primary:#d9d5f2/);
  assert.match(twilight.markup, /--pet-secondary:#7972b4/);
  assert.match(twilight.markup, /--pet-accent:#f0c979/);

  const saved = JSON.parse(JSON.stringify(store.getState()));
  const restoredStore = createGameStore({
    initialState: { ...createInitialGameState(), petCollection: saved.petCollection },
    actions: createPetActionDefinitions({ petCatalog: catalog })
  });
  const restoredService = createPetCollectionService({ store: restoredStore, petCatalog: catalog });
  const restored = createPetCharacterPresentation(
    restoredService.getSnapshot().pets.find((pet) => pet.id === "pet.pegasus")
  );
  assert.equal(restored.paletteId, "twilight");
  assert.match(restored.markup, /--pet-primary:#d9d5f2/);
});
