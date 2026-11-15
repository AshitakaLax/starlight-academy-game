import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { createInputRouter } from "../src/core/input/createInputRouter.js";
import { registerStandardInputContexts } from "../src/core/input/standardContexts.js";

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }
  addEventListener(type, listener) {
    const list = this.listeners.get(type) ?? new Set();
    list.add(listener);
    this.listeners.set(type, list);
  }
  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }
  emit(type, event) {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
  }
  listenerCount(type) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

class FakeElement {
  constructor(tagName = "div", attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.parentElement = null;
    this.disabled = false;
    this.isContentEditable = false;
    this.clickCount = 0;
    this.onClick = null;
  }
  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  matches(selector) {
    if (selector.includes("[contenteditable") && this.isContentEditable) return true;
    if (selector.includes("[role='textbox']") && this.getAttribute("role") === "textbox") return true;
    if (selector.includes("data-primary-action") && this.getAttribute("data-primary-action") !== null) return true;
    if (selector.includes("[role='button']") && this.getAttribute("role") === "button"
        && this.getAttribute("tabindex") !== null) return true;
    if (selector.includes("[tabindex='0']") && this.getAttribute("tabindex") === "0"
        && this.getAttribute("data-game-action") !== null) return true;
    if (selector.includes("[disabled]") && this.disabled) return true;
    if (selector.includes("[aria-disabled='true']") && this.getAttribute("aria-disabled") === "true") return true;
    return false;
  }
  closest(selector) {
    let current = this;
    while (current) {
      if (selector === "[data-game-action]" && current.getAttribute("data-game-action") !== null) return current;
      if (selector === "[disabled], [aria-disabled='true']"
          && (current.disabled || current.getAttribute("aria-disabled") === "true")) return current;
      current = current.parentElement;
    }
    return null;
  }
  click() {
    this.clickCount += 1;
    this.onClick?.();
  }
}

function makeKeyEvent(key, overrides = {}) {
  let prevented = false;
  return {
    key,
    keyCode: 0,
    repeat: false,
    isComposing: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    get defaultPrevented() { return prevented; },
    preventDefault() { prevented = true; },
    ...overrides
  };
}

function setup({ screenId = "academy", extraState = {}, onError } = {}) {
  const store = createGameStore({
    initialState: {
      app: { screenId },
      ui: { activeOverlayId: null },
      ...extraState
    }
  });
  const target = new FakeEventTarget();
  const root = new FakeEventTarget();
  root.contains = () => true;
  const documentRef = { activeElement: null };
  const errors = [];
  const router = createInputRouter({
    store,
    target,
    root,
    documentRef,
    onError: (error, context) => {
      errors.push({ message: error.message, context });
      onError?.(error, context);
    }
  });
  const unregisterContexts = registerStandardInputContexts(router);
  router.start();

  return { store, target, root, documentRef, router, errors, unregisterContexts };
}

function press(target, key, overrides) {
  const event = makeKeyEvent(key, overrides);
  target.emit("keydown", event);
  return event;
}

test("hub shortcuts 1–5 select their corresponding dock item only on the hub screen", () => {
  const app = setup();
  const expected = ["chapters", "gymnastics", "pets", "wardrobe", "quests"];

  expected.forEach((dockId, index) => {
    const event = press(app.target, String(index + 1));
    assert.equal(event.defaultPrevented, true);
    assert.equal(app.store.getState().app.activeDockId, dockId);
  });

  app.store.dispatch({ type: "app/screen-changed", payload: { screenId: "pets" } });
  const previous = app.store.getState().app.activeDockId;
  const event = press(app.target, "1");
  assert.equal(event.defaultPrevented, false);
  assert.equal(app.store.getState().app.activeDockId, previous);
});

test("multiple-choice shortcuts 1–4 select only choices in a multiple-choice activity", () => {
  const app = setup({
    screenId: "activity",
    extraState: { activity: { inputMode: "multiple-choice" } }
  });

  for (let index = 0; index < 4; index += 1) {
    press(app.target, String(index + 1));
    assert.equal(app.store.getState().ui.input.lastAnswerChoiceIndex, index);
    assert.equal(app.store.getState().ui.input.answerRequestId, index + 1);
  }

  const event = press(app.target, "5");
  assert.equal(event.defaultPrevented, false);
  assert.equal(app.store.getState().ui.input.answerRequestId, 4);
});

test("number shortcuts do not activate when the current activity is not multiple-choice", () => {
  const app = setup({
    screenId: "activity",
    extraState: { activity: { inputMode: "trace-path" } }
  });

  press(app.target, "2");
  assert.equal(app.store.getState().ui.input, undefined);
});

test("H requests a hint only when the active activity explicitly supports hints", () => {
  const unsupported = setup({
    screenId: "activity",
    extraState: { activity: { supportsHints: false } }
  });
  const ignored = press(unsupported.target, "h");
  assert.equal(ignored.defaultPrevented, false);
  assert.equal(unsupported.store.getState().ui.input, undefined);

  const supported = setup({
    screenId: "activity",
    extraState: { activity: { supportsHints: true } }
  });
  const handled = press(supported.target, "H");
  assert.equal(handled.defaultPrevented, true);
  assert.equal(supported.store.getState().ui.input.hintRequestId, 1);
});

test("Enter and Space advance dialogue once per physical keydown", () => {
  const app = setup({ screenId: "dialogue" });

  press(app.target, "Enter");
  assert.equal(app.store.getState().ui.input.dialogueAdvanceRequestId, 1);

  press(app.target, " ");
  assert.equal(app.store.getState().ui.input.dialogueAdvanceRequestId, 2);

  const repeated = press(app.target, "Enter", { repeat: true });
  assert.equal(repeated.defaultPrevented, false);
  assert.equal(app.store.getState().ui.input.dialogueAdvanceRequestId, 2);
});

test("Escape opens settings without an overlay and closes the active overlay", () => {
  const app = setup();
  press(app.target, "Escape");
  assert.equal(app.store.getState().ui.activeOverlayId, "settings");

  press(app.target, "Escape");
  assert.equal(app.store.getState().ui.activeOverlayId, null);

  app.store.dispatch({ type: "ui/overlay-opened", payload: { overlayId: "inventory" } });
  press(app.target, "Escape");
  assert.equal(app.store.getState().ui.activeOverlayId, null);
});

test("keyboard shortcuts are ignored while typing or composing text", () => {
  const app = setup({
    screenId: "activity",
    extraState: { activity: { inputMode: "multiple-choice", supportsHints: true } }
  });
  app.documentRef.activeElement = new FakeElement("input");

  for (const key of ["1", "H", "Enter", " ", "Escape"]) {
    const event = press(app.target, key);
    assert.equal(event.defaultPrevented, false);
  }
  assert.equal(app.store.getState().ui.input, undefined);
  assert.equal(app.store.getState().ui.activeOverlayId, null);

  app.documentRef.activeElement = null;
  press(app.target, "1", { isComposing: true });
  press(app.target, "1", { keyCode: 229 });
  press(app.target, "1", { ctrlKey: true });
  assert.equal(app.store.getState().ui.input, undefined);
});

test("native buttons retain browser keyboard activation without router double-dispatch", () => {
  const app = setup();
  const button = new FakeElement("button", {
    "data-game-action": "hub/dock-selected",
    "data-game-payload": JSON.stringify({ dockId: "pets" })
  });
  app.documentRef.activeElement = button;

  const event = press(app.target, "Enter");
  assert.equal(event.defaultPrevented, false);
  assert.equal(app.store.getState().app.activeDockId, undefined);

  // The browser performs the native click after keyboard activation.
  app.root.emit("click", { target: button, defaultPrevented: false });
  assert.equal(app.store.getState().app.activeDockId, "pets");
});

test("focused custom primary actions activate by Enter or Space exactly once", () => {
  const app = setup();
  const button = new FakeElement("div", {
    "data-primary-action": "true",
    "data-game-action": "hub/dock-selected",
    "data-game-payload": JSON.stringify({ dockId: "wardrobe" })
  });
  button.onClick = () => app.root.emit("click", { target: button, defaultPrevented: false });
  app.documentRef.activeElement = button;

  const event = press(app.target, "Enter");
  assert.equal(event.defaultPrevented, true);
  assert.equal(button.clickCount, 1);
  assert.equal(app.store.getState().app.activeDockId, "wardrobe");
});

test("mouse click delegation dispatches one action with its JSON payload", () => {
  const app = setup();
  const actionElement = new FakeElement("button", {
    "data-game-action": "hub/dock-selected",
    "data-game-payload": JSON.stringify({ dockId: "quests" })
  });

  app.root.emit("click", { target: actionElement, defaultPrevented: false });
  assert.equal(app.store.getState().app.activeDockId, "quests");
});

test("click actions can require an active context, and disabled controls are ignored", () => {
  const app = setup();
  const actionElement = new FakeElement("button", {
    "data-game-action": "hub/dock-selected",
    "data-game-payload": JSON.stringify({ dockId: "chapters" }),
    "data-game-context": "dialogue"
  });

  app.root.emit("click", { target: actionElement, defaultPrevented: false });
  assert.equal(app.store.getState().app.activeDockId, undefined);

  actionElement.setAttribute("data-game-context", "hub");
  actionElement.disabled = true;
  app.root.emit("click", { target: actionElement, defaultPrevented: false });
  assert.equal(app.store.getState().app.activeDockId, undefined);

  actionElement.disabled = false;
  app.root.emit("click", { target: actionElement, defaultPrevented: false });
  assert.equal(app.store.getState().app.activeDockId, "chapters");
});

test("modal overlays block background contexts and can own a higher-priority context", () => {
  const app = setup();
  app.router.registerContext("settings-modal", {
    screenId: "academy",
    overlayId: "settings",
    priority: 10,
    keys: { "1": { type: "hub/dock-selected", payload: { dockId: "settings-home" } } }
  });

  press(app.target, "1");
  assert.equal(app.store.getState().app.activeDockId, "chapters");

  app.store.dispatch({ type: "ui/overlay-opened", payload: { overlayId: "settings" } });
  press(app.target, "1");
  assert.equal(app.store.getState().app.activeDockId, "settings-home");
});

test("invalid bindings, duplicate contexts and malformed click payloads are reported safely", () => {
  const app = setup();
  assert.throws(() => app.router.registerContext("bad", { keys: { "1": { payload: {} } } }), /Invalid binding/);
  assert.throws(() => app.router.registerContext("hub", { keys: {} }), /already registered/);

  const badPayload = new FakeElement("button", {
    "data-game-action": "hub/dock-selected",
    "data-game-payload": "{not json}"
  });
  app.root.emit("click", { target: badPayload, defaultPrevented: false });
  assert.equal(app.store.getState().app.activeDockId, undefined);
  assert.equal(app.errors.length, 1);
});

test("start and stop are idempotent, and stop removes keyboard and mouse listeners", () => {
  const app = setup();
  app.router.start();
  assert.equal(app.target.listenerCount("keydown"), 1);
  assert.equal(app.root.listenerCount("click"), 1);

  app.router.stop();
  app.router.stop();
  assert.equal(app.target.listenerCount("keydown"), 0);
  assert.equal(app.root.listenerCount("click"), 0);

  const before = app.store.getState().app.activeDockId;
  press(app.target, "1");
  app.root.emit("click", {
    target: new FakeElement("button", {
      "data-game-action": "hub/dock-selected",
      "data-game-payload": JSON.stringify({ dockId: "pets" })
    })
  });
  assert.equal(app.store.getState().app.activeDockId, before);

  app.unregisterContexts();
});

test("screen-bound contexts are gated by state and unregister cleanly", () => {
  const app = setup({ screenId: "dialogue" });
  assert.deepEqual(app.router.getDiagnostics().activeContexts, ["dialogue"]);
  const unregister = app.router.registerContext("dialogue-modal", {
    screenId: "dialogue",
    overlayId: null,
    keys: { "1": { type: "hub/dock-selected", payload: { dockId: "chapters" } } }
  });
  assert.equal(app.router.getDiagnostics().activeContexts.length, 2);
  unregister();
  assert.deepEqual(app.router.getDiagnostics().activeContexts, ["dialogue"]);
});
