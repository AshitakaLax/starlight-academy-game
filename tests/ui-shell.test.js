import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState } from "../src/core/state/actions.js";
import { selectUiPreferences } from "../src/ui/uiPreferences.js";

test("UI preferences have safe defaults for fresh states and older saves", () => {
  assert.deepEqual(selectUiPreferences(createInitialGameState()), { textScale: "normal", reducedMotion: false });
  assert.deepEqual(selectUiPreferences({ app: { screenId: "academy" }, ui: { activeOverlayId: null } }), {
    textScale: "normal", reducedMotion: false
  });
});

test("settings actions update one preference without discarding the other", () => {
  const store = createGameStore();
  store.dispatch({ type: "settings/preferences-updated", payload: { textScale: "large" } });
  assert.deepEqual(selectUiPreferences(store.getState()), { textScale: "large", reducedMotion: false });
  store.dispatch({ type: "settings/preferences-updated", payload: { reducedMotion: true } });
  assert.deepEqual(selectUiPreferences(store.getState()), { textScale: "large", reducedMotion: true });
});

test("settings reject unsupported values and unknown preference keys", () => {
  const store = createGameStore();
  const initial = store.getState();
  assert.throws(() => store.dispatch({ type: "settings/preferences-updated", payload: { textScale: "extra-large" } }), /textScale/);
  assert.throws(() => store.dispatch({ type: "settings/preferences-updated", payload: { reducedMotion: "yes" } }), /reducedMotion/);
  assert.throws(() => store.dispatch({ type: "settings/preferences-updated", payload: { textScale: "large", animations: false } }), /textScale and\\/or reducedMotion/);
  assert.throws(() => store.dispatch({ type: "settings/preferences-updated", payload: {} }), /textScale and\\/or reducedMotion/);
  assert.equal(store.getState(), initial);
});

test("navigation accepts only the five academy destinations", () => {
  const store = createGameStore();
  assert.throws(() => store.dispatch({ type: "hub/dock-selected", payload: { dockId: "secret-room" } }), /recognized academy dock ID/);
  store.dispatch({ type: "hub/dock-selected", payload: { dockId: "pets" } });
  assert.equal(store.getState().app.activeDockId, "pets");
});
