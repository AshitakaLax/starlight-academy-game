import test from "node:test";
import assert from "node:assert/strict";
import { AudioEngine } from "../src/systems/audio/audioEngine.js";

test("audio engine degrades gracefully without Web Audio", async () => {
  const ae = new AudioEngine();
  // In Node, init should return false or true? No AudioContext -> false
  const res = await ae.init();
  assert.equal(res, false);
  // methods should not throw
  ae.setVolumes({ master: 0.5 });
  ae.playEffect("click");
  ae.playSceneMusic("hub");
  ae.stopMusic();
  assert.ok(true);
});

test("mute toggles", () => {
  const ae = new AudioEngine();
  ae.muted = false;
  ae.setMute(true);
  assert.equal(ae.muted, true);
  ae.setMute(false);
  assert.equal(ae.muted, false);
});
