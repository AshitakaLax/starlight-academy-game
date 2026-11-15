import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import * as PA from "../src/gameplay/pets/petAbilities.js";

function setup(active) {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  store.dispatch("pet/unlock", { petId: "pegasus" });
  store.dispatch("pet/unlock", { petId: "phoenix" });
  store.dispatch("pet/unlock", { petId: "nymphKitten" });
  if (active) store.dispatch("pet/selectActive", { petId: active });
  return store;
}

test("only active pet ability applies", () => {
  const store = setup("pegasus");
  assert.equal(PA.activeAbility(store.getState()).id, "graceful_flight");
  // gem bonus applies
  assert.equal(PA.applyGemBonus(store.getState(), 100), 110);
  // sparkle bonus not applied
  assert.equal(PA.grantSparkleBonus(store.getState(), 5), 5);
});

test("switching pets updates active bonus", () => {
  const store = setup("pegasus");
  store.dispatch("pet/selectActive", { petId: "phoenix" });
  assert.equal(PA.activeAbility(store.getState()).id, "spark_reprise");
  assert.equal(PA.applyGemBonus(store.getState(), 100), 100);
  assert.equal(PA.grantSparkleBonus(store.getState(), 5), 6);
});

test("abilities do not stack", () => {
  const store = setup("nymphKitten");
  // only nymph kitten ability
  assert.equal(PA.extraHintTokens(store.getState()), 1);
  assert.equal(PA.applyGemBonus(store.getState(), 100), 100);
  assert.equal(PA.grantSparkleBonus(store.getState(), 5), 5);
});
