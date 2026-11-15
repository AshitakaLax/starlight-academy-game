import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import { SaveManager } from "../src/core/save/saveManager.js";

function makeStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: (k) => { data.delete(k); },
    _data: data,
  };
}

test("save/load round trip", () => {
  const storage = makeStorage();
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const sm = new SaveManager(store, storage);
  store.dispatch("economy/gems/add", { amount: 10 });
  const res = sm.save(store.getState());
  assert.equal(res.ok, true);
  // reload
  const store2 = new Store(createDefaultState());
  registerCoreActions(store2);
  const sm2 = new SaveManager(store2, storage);
  const loaded = sm2.load();
  store2.dispatch("save/loaded", loaded);
  assert.equal(store2.getState().economy.gems, 160);
});

test("malformed import does not overwrite", () => {
  const storage = makeStorage();
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const sm = new SaveManager(store, storage);
  sm.save(store.getState());
  const before = storage.getItem("starlight_academy_save_v1");
  const preview = sm.previewImport("{not json");
  assert.equal(preview.ok, false);
  // applyImport with bad data should fail
  const bad = sm.applyImport(store, { foo: 1 });
  assert.equal(bad.ok, false);
  const after = storage.getItem("starlight_academy_save_v1");
  assert.equal(after, before);
});

test("import round trip restores state", () => {
  const storage = makeStorage();
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const sm = new SaveManager(store, storage);
  store.dispatch("economy/gems/add", { amount: 7 });
  const exported = JSON.stringify(store.getState());
  const preview = sm.previewImport(exported);
  assert.equal(preview.ok, true);
  // new store
  const store2 = new Store(createDefaultState());
  registerCoreActions(store2);
  const sm2 = new SaveManager(store2, storage);
  const res = sm2.applyImport(store2, preview.data);
  assert.equal(res.ok, true);
  assert.equal(store2.getState().economy.gems, 157);
});

test("quota failure handled visibly", () => {
  const storage = {
    getItem: () => null,
    setItem: () => { const e = new Error("quota"); e.name = "QuotaExceededError"; throw e; },
  };
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const sm = new SaveManager(store, storage);
  const res = sm.save(store.getState());
  assert.equal(res.ok, false);
  assert.match(res.error, /quota/i);
  assert.ok(sm.getLastError());
});
