import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../src/core/state/store.js";
import { registerCoreActions } from "../src/core/state/registerActions.js";
import { createDefaultState } from "../src/core/save/schema.js";
import { EconomyService } from "../src/systems/economy/economyService.js";
import { ChapterRuntime } from "../src/gameplay/chapters/chapterRuntime.js";

function setup() {
  const store = new Store(createDefaultState());
  registerCoreActions(store);
  const eco = new EconomyService(store);
  const rt = new ChapterRuntime(store, eco);
  rt.register({ id: "ch1", title: "Ch1", scenes: [{ id: "s1" }, { id: "s2" }] });
  return { store, rt };
}

test("chapter start/scene transitions/checkpoint/complete", () => {
  const { store, rt } = setup();
  const start = rt.start("ch1");
  assert.equal(start.ok, true);
  assert.equal(rt.currentScene().id, "s1");
  assert.equal(rt.nextScene().scene.id, "s2");
  rt.checkpoint({ foo: 1 });
  const reward = { id: "r_ch1", type: "gems", amount: 5, repeatPolicy: "once" };
  const res = rt.complete(reward);
  assert.equal(res.ok, true);
  assert.equal(store.getState().progress.chapters.ch1.completed, true);
  assert.equal(store.getState().economy.gems, 155);
});

test("safe exit saves checkpoint", () => {
  const { store, rt } = setup();
  rt.start("ch1");
  const res = rt.exit();
  assert.equal(res.ok, true);
  assert.equal(rt.active, null);
});
