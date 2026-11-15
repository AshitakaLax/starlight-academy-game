import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createSaveManager, SAVE_FORMAT } from "../src/core/save/createSaveManager.js";
import { createSaveService } from "../src/core/save/createSaveService.js";

class MemoryStorage {
  constructor(entries = []) {
    this.values = new Map(entries);
    this.failRead = false;
    this.failWrite = false;
  }
  getItem(key) {
    if (this.failRead) throw new Error("read blocked");
    return this.values.has(key) ? this.values.get(key) : null;
  }
  setItem(key, value) {
    if (this.failWrite) throw new Error("quota exceeded");
    this.values.set(key, String(value));
  }
  removeItem(key) {
    this.values.delete(key);
  }
}

function makeState(screenId = "academy", extra = {}) {
  return {
    app: { screenId },
    ui: { activeOverlayId: null },
    ...extra
  };
}

function makeTimers() {
  let nextId = 1;
  const callbacks = new Map();
  return {
    setTimer(callback) {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    },
    clearTimer(id) {
      callbacks.delete(id);
    },
    pending() {
      return callbacks.size;
    },
    runNext() {
      const first = callbacks.entries().next().value;
      if (!first) return false;
      const [id, callback] = first;
      callbacks.delete(id);
      callback();
      return true;
    }
  };
}

function envelope(state, schemaVersion = 1) {
  return JSON.stringify({
    format: SAVE_FORMAT,
    schemaVersion,
    savedAt: "2026-11-15T12:00:00.000Z",
    state
  });
}

test("save and load round-trip preserves the complete serializable state", () => {
  const storage = new MemoryStorage();
  const manager = createSaveManager({ storage, now: () => new Date("2026-11-15T13:00:00.000Z") });
  const expected = makeState("pets", {
    profile: { name: "Star Student" },
    progress: { chapters: { "chapter-1": { completed: true, stars: 3 } } }
  });

  const receipt = manager.save(expected);
  assert.equal(receipt.schemaVersion, 1);
  assert.equal(receipt.savedAt, "2026-11-15T13:00:00.000Z");
  assert.equal(manager.getStatus().state, "saved");

  const reloaded = createSaveManager({ storage }).load();
  assert.deepEqual(reloaded, expected);
  assert.equal(Object.isFrozen(reloaded), false);
  assert.equal(manager.getStatus().state, "saved");
});

test("loaded states are cloned and malformed storage is left untouched for recovery", () => {
  const corrupt = "{ this is not valid JSON";
  const storage = new MemoryStorage([["starlight-academy.save", corrupt]]);
  const manager = createSaveManager({ storage });

  assert.equal(manager.load(), null);
  assert.equal(manager.getStatus().state, "recovery-required");
  assert.equal(manager.getStatus().code, "INVALID_JSON");
  assert.equal(storage.getItem("starlight-academy.save"), corrupt);
});

test("invalid states and malformed save envelopes are rejected before writing", () => {
  const storage = new MemoryStorage();
  const manager = createSaveManager({ storage });

  assert.throws(() => manager.save({ app: {}, ui: { activeOverlayId: null } }), /app.screenId/);
  assert.throws(() => manager.save({ ...makeState(), unsafe: undefined }), /cannot be saved/);
  assert.equal(storage.getItem("starlight-academy.save"), null);

  for (const serialized of [
    "",
    "{",
    JSON.stringify({ schemaVersion: 1, state: makeState() }),
    envelope({ app: { screenId: "" }, ui: { activeOverlayId: null } })
  ]) {
    assert.throws(() => manager.previewImport(serialized));
  }
  assert.equal(manager.getStatus().state, "import-error");
  assert.equal(storage.getItem("starlight-academy.save"), null);
});

test("future schema versions and missing migrations are rejected without altering data", () => {
  const future = envelope(makeState(), 99);
  const storage = new MemoryStorage([["starlight-academy.save", future]]);
  const manager = createSaveManager({ storage, schemaVersion: 2, migrations: { 1: (state) => state } });

  assert.equal(manager.load(), null);
  assert.equal(manager.getStatus().code, "UNSUPPORTED_VERSION");
  assert.equal(storage.getItem("starlight-academy.save"), future);

  const noMigration = createSaveManager({ storage: new MemoryStorage(), schemaVersion: 2 });
  assert.throws(() => noMigration.previewImport(envelope(makeState(), 1)), /update that is not available/);
});

test("older saves are migrated before current-schema validation and rewritten", () => {
  const oldState = { app: { screenId: "academy" }, profile: { name: "Ari" } };
  const storage = new MemoryStorage([["starlight-academy.save", envelope(oldState, 1)]]);
  const manager = createSaveManager({
    storage,
    schemaVersion: 2,
    migrations: {
      1(state) {
        return { ...state, ui: { activeOverlayId: null }, preferences: { textScale: "normal" } };
      }
    }
  });

  const loaded = manager.load();
  assert.deepEqual(loaded, {
    app: { screenId: "academy" },
    profile: { name: "Ari" },
    ui: { activeOverlayId: null },
    preferences: { textScale: "normal" }
  });
  assert.equal(JSON.parse(storage.getItem("starlight-academy.save")).schemaVersion, 2);
  assert.equal(manager.getStatus().state, "migrated");
});

test("failed migration rewrite keeps valid migrated progress available in memory", () => {
  const storage = new MemoryStorage([["starlight-academy.save", envelope(makeState(), 1)]]);
  storage.failWrite = true;
  const manager = createSaveManager({
    storage,
    schemaVersion: 2,
    migrations: { 1: (state) => ({ ...state, migrated: true }) }
  });

  const loaded = manager.load();
  assert.equal(loaded.migrated, true);
  assert.equal(manager.getStatus().state, "migration-save-failed");
  assert.equal(JSON.parse(storage.getItem("starlight-academy.save")).schemaVersion, 1);
});

test("import preview does not overwrite; existing saves require explicit confirmation", () => {
  const storage = new MemoryStorage();
  const manager = createSaveManager({ storage });
  const original = makeState("academy", { score: 4 });
  const incoming = makeState("pets", { score: 12 });
  manager.save(original);
  const oldSerialized = storage.getItem("starlight-academy.save");

  const preview = manager.previewImport(envelope(incoming));
  assert.equal(preview.hasExistingSave, true);
  assert.equal(preview.replacesExistingSave, true);
  assert.deepEqual(preview.state, incoming);
  assert.throws(() => manager.import(envelope(incoming)), /confirm replacement/);
  assert.equal(manager.getStatus().state, "confirmation-required");
  assert.equal(storage.getItem("starlight-academy.save"), oldSerialized);

  const imported = manager.import(envelope(incoming), { confirmReplace: true });
  assert.deepEqual(imported, incoming);
  assert.deepEqual(JSON.parse(storage.getItem("starlight-academy.save")).state, incoming);
  assert.equal(manager.getStatus().state, "imported");
});

test("a valid import is accepted automatically when there is no existing save", () => {
  const storage = new MemoryStorage();
  const manager = createSaveManager({ storage });
  const imported = makeState("wardrobe");

  assert.deepEqual(manager.import(envelope(imported)), imported);
  assert.deepEqual(JSON.parse(storage.getItem("starlight-academy.save")).state, imported);
});

test("oversized import files are rejected before parsing or modifying the current save", () => {
  const storage = new MemoryStorage([["starlight-academy.save", "keep-this"]]);
  const manager = createSaveManager({ storage, maxImportBytes: 64 });

  assert.throws(() => manager.previewImport("x".repeat(100)), /too large/);
  assert.equal(storage.getItem("starlight-academy.save"), "keep-this");
});

test("debounced autosave keeps only the latest state and flush writes immediately", () => {
  const storage = new MemoryStorage();
  const timers = makeTimers();
  const manager = createSaveManager({
    storage,
    autosaveDelayMs: 400,
    setTimer: timers.setTimer,
    clearTimer: timers.clearTimer
  });

  manager.schedule(makeState("academy", { value: 1 }));
  manager.schedule(makeState("pets", { value: 2 }));
  manager.schedule(makeState("wardrobe", { value: 3 }));
  assert.equal(timers.pending(), 1);
  assert.equal(storage.getItem("starlight-academy.save"), null);
  assert.equal(manager.getStatus().state, "pending");

  timers.runNext();
  assert.equal(timers.pending(), 0);
  assert.deepEqual(JSON.parse(storage.getItem("starlight-academy.save")).state, makeState("wardrobe", { value: 3 }));
  assert.equal(manager.getStatus().state, "saved");

  manager.schedule(makeState("gymnastics", { checkpoint: true }));
  manager.flush();
  assert.equal(timers.pending(), 0);
  assert.deepEqual(JSON.parse(storage.getItem("starlight-academy.save")).state, makeState("gymnastics", { checkpoint: true }));
});

test("checkpoint cancels pending autosave and storage failures remain visible", () => {
  const storage = new MemoryStorage();
  const timers = makeTimers();
  const manager = createSaveManager({
    storage,
    setTimer: timers.setTimer,
    clearTimer: timers.clearTimer
  });

  manager.schedule(makeState("academy", { old: true }));
  manager.checkpoint(makeState("pets", { checkpoint: true }));
  assert.equal(timers.pending(), 0);
  assert.deepEqual(JSON.parse(storage.getItem("starlight-academy.save")).state, makeState("pets", { checkpoint: true }));

  storage.failWrite = true;
  assert.throws(() => manager.checkpoint(makeState("wardrobe")), /could not be saved/);
  assert.equal(manager.getStatus().state, "error");
  assert.deepEqual(JSON.parse(storage.values.get("starlight-academy.save")).state, makeState("pets", { checkpoint: true }));

  const unavailable = createSaveManager({ storage: null });
  assert.equal(unavailable.load(), null);
  assert.equal(unavailable.getStatus().state, "unavailable");
  assert.throws(() => unavailable.save(makeState()), /Local storage is unavailable/);
  assert.equal(unavailable.getStatus().state, "unavailable");
});

test("save service restores before subscribing and autosaves state transitions", async () => {
  const storage = new MemoryStorage();
  const manager = createSaveManager({ storage });
  const previous = makeState("pets", { visitedPets: true });
  manager.save(previous);

  const timers = makeTimers();
  const autosavingManager = createSaveManager({
    storage,
    setTimer: timers.setTimer,
    clearTimer: timers.clearTimer
  });
  const store = createGameStore();
  const service = createSaveService({ store, saveManager: autosavingManager });

  await service.start();
  assert.deepEqual(store.getState(), previous);
  assert.equal(timers.pending(), 0, "loading a save must not schedule a redundant autosave");

  store.dispatch({ type: "app/screen-changed", payload: { screenId: "wardrobe" } });
  assert.equal(timers.pending(), 1);
  await service.stop();
  assert.equal(timers.pending(), 0);
  assert.deepEqual(JSON.parse(storage.getItem("starlight-academy.save")).state, {
    ...previous,
    app: { screenId: "wardrobe" }
  });
  assert.equal(service.started, false);
});

test("save service supports checkpoints and confirmed imports", async () => {
  const storage = new MemoryStorage();
  const manager = createSaveManager({ storage });
  const store = createGameStore();
  const service = createSaveService({ store, saveManager: manager });
  await service.start();

  store.dispatch({ type: "app/screen-changed", payload: { screenId: "pets" } });
  service.saveCheckpoint();
  assert.equal(JSON.parse(storage.getItem("starlight-academy.save")).state.app.screenId, "pets");

  const incoming = makeState("academy", { imported: true });
  const exported = service.export();
  assert.equal(JSON.parse(exported).format, SAVE_FORMAT);
  assert.equal(service.previewImport(envelope(incoming)).hasExistingSave, true);
  assert.throws(() => service.import(envelope(incoming)), /confirm replacement/);
  const restored = service.import(envelope(incoming), { confirmReplace: true });
  assert.deepEqual(restored, incoming);
  assert.deepEqual(store.getState(), incoming);
  await service.stop();
});
