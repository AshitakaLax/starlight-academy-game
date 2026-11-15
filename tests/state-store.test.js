import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInitialGameState } from "../src/core/state/actions.js";
import {
  createSelector,
  selectActiveOverlayId,
  selectAtPath,
  selectCurrentScreen
} from "../src/core/state/selectors.js";

const incrementAction = Object.freeze({
  validate(payload) {
    return payload && Number.isInteger(payload.amount) && payload.amount > 0
      ? true
      : "amount must be a positive integer.";
  },
  reduce(state, payload) {
    return { ...state, counter: (state.counter ?? 0) + payload.amount };
  }
});

test("initial state is copied and deeply immutable", () => {
  const supplied = createInitialGameState();
  const store = createGameStore({ initialState: supplied });

  supplied.app.screenId = "changed-outside-store";
  assert.equal(selectCurrentScreen(store.getState()), "academy");
  assert.equal(Object.isFrozen(store.getState()), true);
  assert.equal(Object.isFrozen(store.getState().app), true);
  assert.throws(() => { store.getState().app.screenId = "mutated"; }, TypeError);
});

test("validated actions produce deterministic immutable transitions and notify subscribers", () => {
  const store = createGameStore();
  const transitions = [];
  store.subscribe((state, action, version) => {
    transitions.push({ screenId: state.app.screenId, type: action.type, version });
  });

  const first = store.dispatch({ type: "app/screen-changed", payload: { screenId: "pets" } });
  const second = store.dispatch({ type: "app/screen-changed", payload: { screenId: "pets" } });

  assert.deepEqual(first, { accepted: true, changed: true, version: 1, type: "app/screen-changed" });
  assert.deepEqual(second, { accepted: true, changed: false, version: 1, type: "app/screen-changed" });
  assert.deepEqual(transitions, [{ screenId: "pets", type: "app/screen-changed", version: 1 }]);
  assert.equal(store.getVersion(), 1);
});

test("unknown and malformed actions are rejected without changing state", () => {
  const store = createGameStore();
  const initial = store.getState();

  assert.throws(() => store.dispatch({ type: "made-up/action" }), /Unknown game action/);
  assert.throws(() => store.dispatch({ type: "app/screen-changed", payload: { screenId: " " } }), /screenId/);
  assert.throws(() => store.dispatch({ type: "app/screen-changed", payload: { screenId: "pets", extra: true } }), /screenId/);
  assert.throws(() => store.dispatch({ type: "bad action" }), /namespaced string type/);
  assert.equal(store.getState(), initial);
  assert.equal(store.getVersion(), 0);
});

test("selectors support path access, memoization and equality-filtered subscriptions", () => {
  const store = createGameStore({
    initialState: { ...createInitialGameState(), profile: { displayName: "Star Student" } }
  });
  const selectGreeting = createSelector(
    selectCurrentScreen,
    (state) => state.profile.displayName,
    (screenId, name) => name + " at " + screenId
  );
  const firstResult = selectGreeting(store.getState());
  assert.equal(firstResult, "Star Student at academy");
  assert.equal(selectGreeting(store.getState()), firstResult);
  assert.equal(selectAtPath(store.getState(), "profile.displayName"), "Star Student");
  assert.throws(() => selectAtPath(store.getState(), "profile..name"), /non-empty keys/);

  const updates = [];
  store.subscribeSelector(selectCurrentScreen, (next, previous) => updates.push([previous, next]));
  store.subscribeSelector(selectActiveOverlayId, (next) => updates.push(["overlay", next]));
  store.dispatch({ type: "ui/overlay-opened", payload: { overlayId: "settings" } });
  store.dispatch({ type: "app/screen-changed", payload: { screenId: "pets" } });
  assert.deepEqual(updates, [["overlay", "settings"], ["academy", "pets"]]);
});

test("overlay close actions cannot close a different active overlay", () => {
  const store = createGameStore();
  store.dispatch({ type: "ui/overlay-opened", payload: { overlayId: "settings" } });
  store.dispatch({ type: "ui/overlay-opened", payload: { overlayId: "inventory" } });
  store.dispatch({ type: "ui/overlay-closed", payload: { overlayId: "settings" } });
  assert.equal(selectActiveOverlayId(store.getState()), "inventory");
  store.dispatch({ type: "ui/overlay-closed", payload: { overlayId: "inventory" } });
  assert.equal(selectActiveOverlayId(store.getState()), null);
  store.dispatch({ type: "ui/overlay-opened", payload: { overlayId: "map" } });
  store.dispatch({ type: "ui/overlay-closed" });
  assert.equal(selectActiveOverlayId(store.getState()), null);
});

test("screen-scoped subscriptions are disposed automatically when leaving their screen", () => {
  const store = createGameStore();
  const scope = store.createScope("academy-screen");
  const appScope = store.createScope("app-lifetime", { screenId: null });
  let scopedCalls = 0;
  let appCalls = 0;

  scope.subscribe(() => { scopedCalls += 1; });
  appScope.subscribe(() => { appCalls += 1; });
  assert.equal(store.getDiagnostics().subscriberCount, 2);
  assert.equal(store.getDiagnostics().scopeCount, 2);

  store.dispatch({ type: "app/screen-changed", payload: { screenId: "pets" } });
  assert.equal(scope.active, false);
  assert.equal(scopedCalls, 0);
  assert.equal(appCalls, 1);
  assert.equal(store.getDiagnostics().subscriberCount, 1);
  assert.equal(store.getDiagnostics().scopeCount, 1);
  assert.throws(() => scope.subscribe(() => {}), /has been disposed/);

  appScope.dispose();
  assert.equal(store.getDiagnostics().subscriberCount, 0);
  assert.equal(store.getDiagnostics().scopeCount, 0);
});

test("nested dispatches are processed in FIFO order after the current notification", () => {
  const store = createGameStore({
    initialState: { ...createInitialGameState(), counter: 0 },
    actions: { "test/increment": incrementAction }
  });
  const observed = [];
  let queuedReceipt;
  store.subscribe((state) => {
    observed.push(state.counter);
    if (state.counter === 1) {
      queuedReceipt = store.dispatch({ type: "test/increment", payload: { amount: 1 } });
    }
  });

  const receipt = store.dispatch({ type: "test/increment", payload: { amount: 1 } });
  assert.equal(receipt.version, 1);
  assert.deepEqual(queuedReceipt, { accepted: true, queued: true, version: 1, type: "test/increment" });
  assert.deepEqual(observed, [1, 2]);
  assert.equal(store.getState().counter, 2);
  assert.equal(store.getVersion(), 2);
});

test("listener failures do not block other listeners or roll back committed state", () => {
  const listenerErrors = [];
  const store = createGameStore({ onListenerError: (error) => listenerErrors.push(error.message) });
  let healthyCalls = 0;
  store.subscribe(() => { throw new Error("render listener failed"); });
  store.subscribe(() => { healthyCalls += 1; });

  store.dispatch({ type: "ui/overlay-opened", payload: { overlayId: "inventory" } });
  assert.equal(healthyCalls, 1);
  assert.equal(selectActiveOverlayId(store.getState()), "inventory");
  assert.deepEqual(listenerErrors, ["render listener failed"]);
});

test("custom action definitions and store disposal are validated", () => {
  assert.throws(() => createGameStore({ actions: { invalid: {} } }), /namespace\/name/);
  assert.throws(() => createGameStore({ actions: { "app/screen-changed": incrementAction } }), /already registered/);
  assert.throws(() => createGameStore({ actions: { "test/increment": { reduce() {} } } }), /validate\(\) and reduce\(\)/);

  const store = createGameStore();
  store.destroy();
  store.destroy();
  assert.equal(store.getDiagnostics().destroyed, true);
  assert.throws(() => store.dispatch({ type: "ui/overlay-closed" }), /destroyed/);
});
