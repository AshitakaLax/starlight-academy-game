import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import SubscriptionScope from "../src/core/state/subscriptions.js";

test("deterministic transitions", () => {
  const s1 = new Store(createDefaultState()); registerCoreActions(s1);
  const s2 = new Store(createDefaultState()); registerCoreActions(s2);
  s1.dispatch("economy/gems/add", { amount: 5 });
  s2.dispatch("economy/gems/add", { amount: 5 });
  assert.deepEqual(s1.getState().economy, s2.getState().economy);
});

test("subscription scope disposes", () => {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const scope = new SubscriptionScope();
  let calls = 0;
  scope.subscribe(store, () => { calls++; });
  store.dispatch("app/boot");
  const before = calls;
  scope.dispose();
  store.dispatch("app/boot");
  assert.equal(calls, before);
});
