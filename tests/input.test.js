import test from "node:test";
import assert from "node:assert/strict";
import InputManager from "../src/core/input/inputManager.js";
import { bindShortcuts } from "../src/core/input/shortcuts.js";

test("focused input ignores shortcuts", () => {
  const im = new InputManager();
  let called = false;
  im.registerKey("mc", "1", () => { called = true; });
  im.setContext("mc");
  const event = { key: "1", repeat: false, target: { tagName: "INPUT" }, preventDefault() {}, stopPropagation() {} };
  im.handleKeyDown(event);
  assert.equal(called, false);
});

test("context-aware: mc handler fires in mc context", () => {
  const im = new InputManager();
  let called = false;
  im.registerKey("mc", "1", () => { called = true; });
  im.setContext("mc");
  const event = { key: "1", repeat: false, target: {}, preventDefault() {}, stopPropagation() {} };
  im.handleKeyDown(event);
  assert.equal(called, true);
});

test("context-aware: mc handler does not fire in hub context", () => {
  const im = new InputManager();
  let called = false;
  im.registerKey("mc", "1", () => { called = true; });
  im.setContext("hub");
  const event = { key: "1", repeat: false, target: {}, preventDefault() {}, stopPropagation() {} };
  im.handleKeyDown(event);
  assert.equal(called, false);
});

test("one key press triggers one action (repeat ignored)", () => {
  const im = new InputManager();
  let count = 0;
  im.registerKey("mc", "1", () => { count++; });
  im.setContext("mc");
  im.handleKeyDown({ key: "1", repeat: true, target: {}, preventDefault() {}, stopPropagation() {} });
  assert.equal(count, 0);
  im.handleKeyDown({ key: "1", repeat: false, target: {}, preventDefault() {}, stopPropagation() {} });
  assert.equal(count, 1);
});

test("bindShortcuts binds only provided handlers", () => {
  const im = new InputManager();
  let n = 0;
  bindShortcuts(im, "hub", { "hub:dock:1": () => { n++; } });
  im.setContext("hub");
  im.handleKeyDown({ key: "1", repeat: false, target: {}, preventDefault() {}, stopPropagation() {} });
  assert.equal(n, 1);
  // key 2 not bound
  im.handleKeyDown({ key: "2", repeat: false, target: {}, preventDefault() {}, stopPropagation() {} });
  assert.equal(n, 1);
});
