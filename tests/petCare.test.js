import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import { PetCollection } from "../src/gameplay/pets/petCollection.js";
import { PetCare } from "../src/gameplay/pets/petCare.js";

test("care increases progress and bond, never decreases", () => {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const pc = new PetCollection(store);
  pc.unlock("pegasus");
  const care = new PetCare(store);
  const before = store.getState().pets.pets.pegasus.careProgress.joy;
  care.play("pegasus");
  const after = store.getState().pets.pets.pegasus.careProgress.joy;
  assert.ok(after >= before);
  assert.ok(store.getState().pets.pets.pegasus.bondXp > 0);
});

test("full meter still allows interaction and bond", () => {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const pc = new PetCollection(store);
  pc.unlock("pegasus");
  // fill joy
  for (let i = 0; i < 25; i++) store.dispatch("pet/care", { petId: "pegasus", metric: "joy", amount: 5, bondXp: 0 });
  const beforeBond = store.getState().pets.pets.pegasus.bondXp;
  const care = new PetCare(store);
  const res = care.play("pegasus");
  assert.equal(res.ok, true);
  assert.equal(store.getState().pets.pets.pegasus.careProgress.joy, 100);
  assert.ok(store.getState().pets.pets.pegasus.bondXp >= beforeBond);
});
