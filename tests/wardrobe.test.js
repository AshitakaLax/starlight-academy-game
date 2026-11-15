import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import { EconomyService } from "../src/systems/economy/economyService.js";
import { WardrobeService } from "../src/systems/wardrobe/wardrobeService.js";

function setup() {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const eco = new EconomyService(store);
  return { store, ws: new WardrobeService(store, eco) };
}

test("locked item cannot be equipped", () => {
  const { ws } = setup();
  const res = ws.equip("accessory", "ribbon_star");
  assert.equal(res.ok, false);
});

test("shop purchase unlocks item", () => {
  const { store, ws } = setup();
  const res = ws.purchase("ribbon_star");
  assert.equal(res.ok, true);
  assert.equal(ws.isOwned("ribbon_star"), true);
  assert.equal(store.getState().economy.gems, 130);
});

test("chapter-exclusive item cannot be purchased or unlocked via shop", () => {
  const { ws } = setup();
  assert.equal(ws.purchase("chapter1_cape").ok, false);
  assert.equal(ws.unlock("chapter1_cape", "shop").ok, false);
  // chapter source allowed
  assert.equal(ws.unlock("chapter1_cape", "chapter").ok, true);
  assert.equal(ws.isOwned("chapter1_cape"), true);
});

test("wrong slot rejected", () => {
  const { ws } = setup();
  ws.unlock("ribbon_star", "shop").ok; // not chapter, but source shop? item source shop, unlock with system allowed? unlock checks chapter only, so ok
  // Actually unlock chapter check only; system allowed.
  const res = ws.equip("outfit", "ribbon_star");
  assert.equal(res.ok, false);
});
