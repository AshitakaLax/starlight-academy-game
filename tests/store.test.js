import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";

test("unknown action rejected", () => {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const res = store.dispatch("nope/action", {});
  assert.equal(res.ok, false);
  assert.match(res.error, /Unknown action/);
});

test("gems cannot go negative", () => {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const res = store.dispatch("economy/gems/spend", { amount: 999999 });
  assert.equal(res.ok, false);
  assert.equal(store.getState().economy.gems, 150);
});

test("invalid action payload rejected", () => {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const res = store.dispatch("settings/update", "bad");
  assert.equal(res.ok, false);
});
