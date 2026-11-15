import test from "node:test";
import assert from "node:assert/strict";
import { createAudioEngine } from "../src/systems/audio/createAudioEngine.js";
import { createAudioService } from "../src/systems/audio/createAudioService.js";
import { selectAudioSettings } from "../src/systems/audio/audioSettings.js";
import { createGameStore } from "../src/core/state/createGameStore.js";

class AudioParam {
  constructor() { this.value = 0; this.events = []; }
  setValueAtTime(value, time) { this.value = value; this.events.push(["set", value, time]); }
  exponentialRampToValueAtTime(value, time) { this.value = value; this.events.push(["ramp", value, time]); }
}
class AudioNode {
  constructor(kind) { this.kind = kind; this.gain = new AudioParam(); this.frequency = new AudioParam(); this.connections = []; this.stops = 0; }
  connect(node) { this.connections.push(node); }
  disconnect() { this.disconnected = true; }
  start() { this.started = true; }
  stop() { this.stops += 1; this.onended?.(); }
}
class FakeAudioContext {
  static instances = [];
  constructor() {
    this.state = "suspended"; this.currentTime = 4; this.destination = new AudioNode("destination");
    this.gains = []; this.oscillators = []; this.resumed = false; this.closed = false;
    FakeAudioContext.instances.push(this);
  }
  createGain() { const node = new AudioNode("gain"); this.gains.push(node); return node; }
  createOscillator() { const node = new AudioNode("oscillator"); this.oscillators.push(node); return node; }
  async resume() { this.resumed = true; this.state = "running"; }
  async close() { this.closed = true; this.state = "closed"; }
}
class EventTargetStub {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) {
    const records = this.listeners.get(type) ?? new Set();
    records.add(callback); this.listeners.set(type, records);
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  async emit(type, event = {}) {
    for (const callback of [...(this.listeners.get(type) ?? [])]) await callback(event);
  }
  count(type) { return this.listeners.get(type)?.size ?? 0; }
}

test("audio engine creates no AudioContext before an explicit unlock", () => {
  FakeAudioContext.instances.length = 0;
  const engine = createAudioEngine({ AudioContextCtor: FakeAudioContext });
  assert.equal(FakeAudioContext.instances.length, 0);
  assert.equal(engine.playSfx("select"), false);
  assert.equal(engine.startMusic("academy"), false);
  assert.equal(engine.getDiagnostics().unlocked, false);
});

test("unlock creates separate mixer buses and begins a soft synthesized track", async () => {
  FakeAudioContext.instances.length = 0;
  const engine = createAudioEngine({ AudioContextCtor: FakeAudioContext });
  assert.equal(await engine.unlock(), true);
  const context = FakeAudioContext.instances[0];
  assert.equal(context.resumed, true);
  assert.equal(context.gains.length, 3);
  assert.equal(engine.startMusic("academy"), true);
  assert.equal(engine.getDiagnostics().activeMusicVoices, 3);
  assert.equal(engine.getDiagnostics().activeTrack, "academy");
  assert.equal(context.oscillators.length, 3);
  await engine.destroy();
  assert.equal(context.closed, true);
});

test("music scenes switch their notes and stop cleans up prior oscillators", async () => {
  const engine = createAudioEngine({ AudioContextCtor: FakeAudioContext });
  await engine.unlock(); engine.startMusic("academy");
  const context = FakeAudioContext.instances.at(-1);
  const firstSet = context.oscillators.slice();
  engine.startMusic("pets");
  assert.equal(engine.getDiagnostics().activeTrack, "pets");
  assert.ok(firstSet.every((voice) => voice.stops === 1));
  assert.equal(engine.getDiagnostics().activeMusicVoices, 3);
  engine.stopMusic();
  assert.equal(engine.getDiagnostics().activeMusicVoices, 0);
  await engine.destroy();
});

test("effects are synthesized with envelopes and unknown effect IDs are ignored", async () => {
  const engine = createAudioEngine({ AudioContextCtor: FakeAudioContext });
  await engine.unlock();
  assert.equal(engine.playSfx("sparkle"), true);
  assert.equal(engine.playSfx("not-a-sound"), false);
  const context = FakeAudioContext.instances.at(-1);
  const effect = context.oscillators.at(-1);
  assert.equal(effect.started, true);
  assert.equal(effect.stops, 1);
  assert.equal(effect.frequency.events.length, 2);
  assert.equal(engine.getDiagnostics().createdEffectCount, 1);
  await engine.destroy();
});

test("master, music, effects, and mute update their independent buses immediately", async () => {
  const engine = createAudioEngine({ AudioContextCtor: FakeAudioContext });
  await engine.unlock();
  const context = FakeAudioContext.instances.at(-1);
  engine.setSettings({ masterVolume: 50, musicVolume: 30, sfxVolume: 80 });
  assert.equal(context.gains[0].gain.value, 0.5);
  assert.equal(context.gains[1].gain.value, 0.3);
  assert.equal(context.gains[2].gain.value, 0.8);
  engine.setSettings({ muted: true });
  assert.equal(context.gains[0].gain.value, 0);
  assert.equal(context.gains[1].gain.value, 0.3);
  engine.setSettings({ muted: false, masterVolume: 140 });
  assert.equal(context.gains[0].gain.value, 1);
  await engine.destroy();
});

test("unsupported or failing audio contexts return a graceful unavailable result", async () => {
  const unsupported = createAudioEngine({ AudioContextCtor: null });
  assert.equal(await unsupported.unlock(), false);
  assert.equal(unsupported.playSfx("select"), false);
  await unsupported.destroy();

  class BrokenContext { constructor() { throw new Error("blocked by browser"); } }
  const broken = createAudioEngine({ AudioContextCtor: BrokenContext });
  assert.equal(await broken.unlock(), false);
  assert.equal(broken.getDiagnostics().available, false);
  await broken.destroy();
});

test("service unlocks only after a user gesture and removes gesture listeners", async () => {
  const calls = [];
  const engine = {
    setSettings: (settings) => calls.push(["settings", settings]),
    unlock: async () => { calls.push(["unlock"]); return true; },
    startMusic: (track) => calls.push(["music", track]),
    playSfx: (name) => calls.push(["sfx", name]),
    destroy: async () => calls.push(["destroy"])
  };
  const target = new EventTargetStub();
  const root = { contains: (node) => node.inside === true };
  const store = createGameStore();
  const service = createAudioService({ engine, store, gestureTarget: target, root });
  await service.start();
  assert.equal(target.count("pointerdown"), 1);
  assert.equal(target.count("keydown"), 1);
  await target.emit("pointerdown", { target: { inside: false } });
  assert.equal(calls.some((call) => call[0] === "unlock"), false);
  await target.emit("pointerdown", { target: { inside: true } });
  assert.equal(calls.some((call) => call[0] === "unlock"), true);
  assert.equal(target.count("pointerdown"), 0);
  assert.deepEqual(calls.find((call) => call[0] === "music"), ["music", "academy"]);
  await service.stop();
  assert.equal(calls.at(-1)[0], "destroy");
});

test("service forwards persisted mixer settings and plays UI navigation sounds", async () => {
  const calls = [];
  const engine = {
    setSettings: (settings) => calls.push(["settings", settings]),
    unlock: async () => true,
    startMusic: (track) => calls.push(["music", track]),
    playSfx: (name) => calls.push(["sfx", name]),
    destroy: async () => {}
  };
  const target = new EventTargetStub();
  const store = createGameStore();
  const service = createAudioService({ engine, store, gestureTarget: target });
  await service.start();
  store.dispatch({ type: "audio/settings-updated", payload: { masterVolume: 42, muted: true } });
  assert.deepEqual(calls.at(-1), ["settings", { masterVolume: 42, musicVolume: 24, sfxVolume: 55, muted: true }]);
  store.dispatch({ type: "hub/dock-selected", payload: { dockId: "pets" } });
  assert.deepEqual(calls.slice(-3).map((call) => call[0]), ["settings", "music", "sfx"]);
  assert.equal(calls.at(-2)[1], "pets");
  store.dispatch({ type: "ui/overlay-opened", payload: { overlayId: "settings" } });
  assert.deepEqual(calls.at(-1), ["sfx", "open"]);
  store.dispatch({ type: "ui/overlay-closed" });
  assert.deepEqual(calls.at(-1), ["sfx", "close"]);
  await service.stop();
});

test("audio settings selector provides safe defaults for older saves", () => {
  assert.deepEqual(selectAudioSettings({}), {
    masterVolume: 70, musicVolume: 24, sfxVolume: 55, muted: false
  });
});

test("audio settings actions validate ranges and preserve unspecified mixer settings", () => {
  const store = createGameStore();
  store.dispatch({ type: "audio/settings-updated", payload: { masterVolume: 33 } });
  store.dispatch({ type: "audio/settings-updated", payload: { muted: true } });
  assert.deepEqual(selectAudioSettings(store.getState()), {
    masterVolume: 33, musicVolume: 24, sfxVolume: 55, muted: true
  });
  const current = store.getState();
  assert.throws(() => store.dispatch({ type: "audio/settings-updated", payload: { musicVolume: 101 } }), /0 to 100/);
  assert.throws(() => store.dispatch({ type: "audio/settings-updated", payload: { muted: 1 } }), /boolean/);
  assert.throws(() => store.dispatch({ type: "audio/settings-updated", payload: {} }), /at least one/);
  assert.equal(store.getState(), current);
});
