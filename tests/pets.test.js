import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import { PetCollection } from "../src/gameplay/pets/petCollection.js";
import { PetCare } from "../src/gameplay/pets/petCare.js";

function setup() {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  return { store, pc: new PetCollection(store) };
}

test("unlock and switch preserves other pet state", () => {
  const { store, pc } = setup();
  pc.unlock("pegasus");
  pc.unlock("phoenix");
  // care for pegasus
  const care = new PetCare(store);
  care.feed("pegasus");
  const before = store.getState().pets.pets.phoenix;
  pc.selectActive("phoenix");
  pc.selectActive("pegasus");
  const after = store.getState().pets.pets.phoenix;
  assert.deepEqual(after, before);
  assert.equal(store.getState().pets.pets.pegasus.careProgress.nourishment, 5);
});

test("each pet state survives reload (serialization)", () => {
  const { store, pc } = setup();
  pc.unlock("pegasus");
  const care = new PetCare(store);
  care.play("pegasus");
  const snapshot = JSON.parse(JSON.stringify(store.getState()));
  const store2 = new Store(snapshot);
  registerCoreActions(store2);
  assert.equal(store2.getState().pets.pets.pegasus.careProgress.joy, 5);
});
