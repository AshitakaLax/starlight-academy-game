import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import { EconomyService } from "../src/systems/economy/economyService.js";

function setup() {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  return { store, eco: new EconomyService(store) };
}

test("gem balance never negative", () => {
  const { store, eco } = setup();
  const res = eco.spendGems(999999);
  assert.equal(res.ok, false);
  assert.equal(store.getState().economy.gems, 150);
});

test("one-time reward not granted twice", () => {
  const { store, eco } = setup();
  const r = { id: "r1", type: "gems", amount: 10, repeatPolicy: "once" };
  assert.equal(eco.grantReward(r).ok, true);
  assert.equal(store.getState().economy.gems, 160);
  assert.equal(eco.grantReward(r).ok, false);
  assert.equal(store.getState().economy.gems, 160);
});

test("replay-capped reward respects cap", () => {
  const { eco } = setup();
  const r = { id: "r2", type: "sparkles", amount: 1, repeatPolicy: "replay-capped", replayCap: 2 };
  assert.equal(eco.grantReward(r).ok, true);
  assert.equal(eco.grantReward(r).ok, true);
  assert.equal(eco.grantReward(r).ok, false);
});

test("sparkles cannot be spent (no method)", () => {
  const { eco } = setup();
  assert.equal(typeof eco.spendSparkles, "undefined");
});
