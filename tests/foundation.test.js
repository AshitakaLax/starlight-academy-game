import test from "node:test";
import assert from "node:assert/strict";
import { createGameApp } from "../src/app/createGameApp.js";
import { chapterDefinitions } from "../src/chapters/registry.js";
import { sideQuestDefinitions } from "../src/side-quests/registry.js";
import { gameConfig } from "../src/config/gameConfig.js";

test("application starts services in order and stops them in reverse order", async () => {
  const calls = [];
  const app = createGameApp({
    services: [
      { name: "state", start: () => calls.push("start:state"), stop: () => calls.push("stop:state") },
      { name: "ui", start: () => calls.push("start:ui"), stop: () => calls.push("stop:ui") }
    ]
  });

  await app.start();
  assert.equal(app.status, "running");
  await app.start(); // idempotent
  await app.stop();
  await app.stop(); // idempotent
  assert.equal(app.status, "stopped");
  assert.deepEqual(calls, ["start:state", "start:ui", "stop:ui", "stop:state"]);
});

test("application rolls back already-started services after a startup failure", async () => {
  const calls = [];
  const app = createGameApp({
    services: [
      { name: "first", start: () => calls.push("start:first"), stop: () => calls.push("stop:first") },
      { name: "broken", start: () => { throw new Error("startup failed"); }, stop: () => calls.push("stop:broken") }
    ]
  });

  await assert.rejects(app.start(), /startup failed/);
  assert.equal(app.status, "failed");
  assert.deepEqual(calls, ["start:first", "stop:first"]);
});

test("application rejects ambiguous or malformed service registrations", () => {
  assert.throws(() => createGameApp({ services: [{ name: "missing-stop", start() {} }] }), /start\(\) and stop\(\)/);
  assert.throws(() => createGameApp({ services: [
    { name: "duplicate", start() {}, stop() {} },
    { name: "duplicate", start() {}, stop() {} }
  ] }), /Duplicate application service name/);
});

test("release defaults and incremental content registries match implemented scope", () => {
  assert.deepEqual(gameConfig.platform.targetBrowsers, ["Chrome", "Edge"]);
  assert.equal(gameConfig.release.chapterCount, 10);
  assert.equal(gameConfig.release.sideQuestCount, 20);
  assert.equal(gameConfig.release.offlineRuntime, true);
  assert.equal(chapterDefinitions.length, 10);
  assert.equal(sideQuestDefinitions.length, 4);
});
