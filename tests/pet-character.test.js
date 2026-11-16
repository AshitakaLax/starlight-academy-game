import test from "node:test";
import assert from "node:assert/strict";
import { createPetCharacterMarkup } from "../src/ui/petCharacter.js";

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
