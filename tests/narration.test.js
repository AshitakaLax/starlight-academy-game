import test from "node:test";
import assert from "node:assert/strict";
import { NarrationEngine } from "../src/systems/narration/narrationEngine.js";

test("narration degrades without speech synthesis", () => {
  const ne = new NarrationEngine();
  assert.equal(ne.synth, null);
  // should not throw
  ne.speak("hello");
  ne.cancel();
  ne.setEnabled(false);
  assert.equal(ne.enabled, false);
});

test("ducking restores via no audio engine safely", () => {
  const ne = new NarrationEngine(null);
  ne.duckMusic();
  ne.restoreMusic();
  assert.ok(true);
});
