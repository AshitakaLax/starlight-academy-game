import test from "node:test";
import assert from "node:assert/strict";
import { createChapterInputController } from "../src/gameplay/chapter-runtime/chapterInput.js";

function makeEvent(key, overrides = {}) {
  let prevented = false;
  return {
    key,
    target: null,
    defaultPrevented: false,
    repeat: false,
    isComposing: false,
    keyCode: 0,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    preventDefault() { prevented = true; },
    get wasPrevented() { return prevented; },
    ...overrides
  };
}

function setup({ activityType = "learning", choices = [9, 12, 15, 18] } = {}) {
  const answers = [];
  const hints = [];
  const activity = { type: activityType };
  const question = { choices };
  const controller = createChapterInputController({
    getCurrentActivity: () => activity,
    getCurrentQuestion: () => question,
    onAnswer: (answer) => answers.push(answer),
    onHint: (value) => hints.push(value)
  });
  return { controller, answers, hints, activity, question };
}

test("Chapter 1 number shortcuts select the matching generated answer and prevent page shortcuts", () => {
  const app = setup();
  for (const [key, expected] of [["1", 9], ["2", 12], ["3", 15], ["4", 18]]) {
    const event = makeEvent(key);
    assert.equal(app.controller.handleKeydown(event), true);
    assert.equal(event.wasPrevented, true);
    assert.equal(app.answers.at(-1), expected);
  }
  assert.deepEqual(app.answers, [9, 12, 15, 18]);
  assert.deepEqual(app.hints, []);
});

test("H requests an activity-specific hint only while a chapter question is active", () => {
  const app = setup();
  const event = makeEvent("H");
  assert.equal(app.controller.handleKeydown(event), true);
  assert.equal(event.wasPrevented, true);
  assert.deepEqual(app.hints, [app.question]);
});

test("Chapter shortcuts do not intercept story, gymnastics, or non-question activities", () => {
  for (const activityType of ["story", "gymnastics", "reflection", "custom"]) {
    const app = setup({ activityType });
    const numberEvent = makeEvent("1");
    const hintEvent = makeEvent("h");
    assert.equal(app.controller.handleKeydown(numberEvent), false);
    assert.equal(app.controller.handleKeydown(hintEvent), false);
    assert.equal(numberEvent.wasPrevented, false);
    assert.equal(hintEvent.wasPrevented, false);
  }
});

test("Chapter shortcuts ignore text entry, modifiers, repeats, and composition", () => {
  const app = setup();
  const editable = [
    { tagName: "INPUT" },
    { tagName: "TEXTAREA" },
    { tagName: "SELECT" },
    { tagName: "DIV", isContentEditable: true },
    { tagName: "DIV", closest: () => ({}) }
  ];
  for (const target of editable) {
    const event = makeEvent("2", { target });
    assert.equal(app.controller.handleKeydown(event), false);
    assert.equal(event.wasPrevented, false);
  }
  for (const overrides of [
    { ctrlKey: true }, { altKey: true }, { metaKey: true },
    { repeat: true }, { isComposing: true }, { keyCode: 229 },
    { defaultPrevented: true }
  ]) {
    const event = makeEvent("2", overrides);
    assert.equal(app.controller.handleKeydown(event), false);
    assert.equal(event.wasPrevented, false);
  }
  assert.deepEqual(app.answers, []);
});

test("number shortcuts ignore unavailable choices and unknown keys", () => {
  const app = setup({ choices: [4, 8] });
  const unavailable = makeEvent("4");
  const unknown = makeEvent("9");
  const enter = makeEvent("Enter");
  assert.equal(app.controller.handleKeydown(unavailable), false);
  assert.equal(app.controller.handleKeydown(unknown), false);
  assert.equal(app.controller.handleKeydown(enter), false);
  assert.deepEqual(app.answers, []);
});

test("chapter input controller validates callbacks", () => {
  assert.throws(() => createChapterInputController({}), /requires activity, question, answer, and hint callbacks/);
});
