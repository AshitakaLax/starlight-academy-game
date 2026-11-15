import test from "node:test";
import assert from "node:assert/strict";
import { createGameStore } from "../src/core/state/createGameStore.js";
import { selectNarrationSettings } from "../src/systems/narration/narrationSettings.js";
import { createNarrationService } from "../src/systems/narration/createNarrationService.js";

class EventTargetStub {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(callback);
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  emit(type) { for (const callback of [...(this.listeners.get(type) ?? [])]) callback(); }
  count(type) { return this.listeners.get(type)?.size ?? 0; }
}

class FakeUtterance {
  constructor(text) { this.text = text; this.rate = 1; this.voice = null; }
}
class FakeSpeechSynthesis extends EventTargetStub {
  constructor(voices = []) { super(); this.voices = voices; this.utterances = []; this.cancelCount = 0; }
  getVoices() { return this.voices; }
  speak(utterance) { this.utterances.push(utterance); }
  cancel() { this.cancelCount += 1; }
}

function captionElement() {
  return { textContent: "", hidden: true, dataset: {} };
}

test("narration defaults off and older saves receive safe defaults", () => {
  const store = createGameStore();
  assert.deepEqual(selectNarrationSettings(store.getState()), { enabled: false, voiceURI: "", rate: 1 });
  assert.deepEqual(selectNarrationSettings({}), { enabled: false, voiceURI: "", rate: 1 });
});

test("narration settings action validates values and preserves omitted preferences", () => {
  const store = createGameStore();
  store.dispatch({ type: "narration/settings-updated", payload: { enabled: true } });
  store.dispatch({ type: "narration/settings-updated", payload: { rate: 1.1, voiceURI: "voice-test" } });
  assert.deepEqual(selectNarrationSettings(store.getState()), {
    enabled: true, voiceURI: "voice-test", rate: 1.1
  });
  const current = store.getState();
  assert.throws(() => store.dispatch({ type: "narration/settings-updated", payload: { rate: 1.3 } }), /0.8 to 1.2/);
  assert.throws(() => store.dispatch({ type: "narration/settings-updated", payload: { enabled: "yes" } }), /boolean/);
  assert.throws(() => store.dispatch({ type: "narration/settings-updated", payload: { voiceURI: 3 } }), /voiceURI/);
  assert.throws(() => store.dispatch({ type: "narration/settings-updated", payload: { voiceName: "unknown" } }), /at least one/);
  assert.equal(store.getState(), current);
});

test("narration service refuses to speak without a visible caption target", () => {
  assert.throws(() => createNarrationService({
    store: createGameStore(), speechSynthesis: new FakeSpeechSynthesis(), UtteranceCtor: FakeUtterance
  }), /visible textElement/);
});

test("disabled narration keeps the requested instruction visible without speaking", () => {
  const speech = new FakeSpeechSynthesis();
  const caption = captionElement();
  const service = createNarrationService({
    store: createGameStore(), speechSynthesis: speech, UtteranceCtor: FakeUtterance, textElement: caption
  });
  service.start();
  assert.equal(service.speak("Welcome to the academy."), false);
  assert.equal(caption.textContent, "Welcome to the academy.");
  assert.equal(caption.hidden, false);
  assert.equal(speech.utterances.length, 0);
  service.stop();
});

test("enabled narration uses a selected voice, respects rate and ducks music while speaking", () => {
  const voice = { voiceURI: "voice-en", name: "Friendly Voice", lang: "en-US" };
  const speech = new FakeSpeechSynthesis([voice]);
  const duckLevels = [];
  const store = createGameStore();
  store.dispatch({ type: "narration/settings-updated", payload: { enabled: true, voiceURI: voice.voiceURI, rate: 1.15 } });
  const service = createNarrationService({
    store, speechSynthesis: speech, UtteranceCtor: FakeUtterance,
    audioEngine: { setMusicDuck: (value) => duckLevels.push(value) }, textElement: captionElement()
  });
  service.start();
  assert.equal(service.speak("Follow the sparkling path."), true);
  const utterance = speech.utterances[0];
  assert.equal(utterance.voice, voice);
  assert.equal(utterance.lang, "en-US");
  assert.equal(utterance.rate, 1.15);
  utterance.onstart();
  assert.equal(duckLevels.at(-1), 0.28);
  assert.equal(service.getDiagnostics().speaking, true);
  utterance.onend();
  assert.equal(duckLevels.at(-1), 1);
  assert.equal(service.getDiagnostics().speaking, false);
  service.stop();
});

test("new narration interrupts the previous utterance and cancel restores music", () => {
  const speech = new FakeSpeechSynthesis();
  const duckLevels = [];
  const store = createGameStore();
  store.dispatch({ type: "narration/settings-updated", payload: { enabled: true } });
  const service = createNarrationService({
    store, speechSynthesis: speech, UtteranceCtor: FakeUtterance,
    audioEngine: { setMusicDuck: (value) => duckLevels.push(value) }
  });
  service.start();
  service.speak("First instruction.");
  const previous = speech.utterances[0];
  previous.onstart();
  service.speak("Second instruction.");
  assert.equal(speech.cancelCount, 1);
  assert.equal(speech.utterances.length, 2);
  previous.onend();
  assert.equal(service.getDiagnostics().speaking, false);
  speech.utterances[1].onstart();
  assert.equal(service.cancel(), true);
  assert.equal(duckLevels.at(-1), 1);
  assert.equal(service.getDiagnostics().speaking, false);
  service.stop();
});

test("missing voice names fall back to the browser default and never block narration", () => {
  const speech = new FakeSpeechSynthesis([]);
  const store = createGameStore();
  store.dispatch({ type: "narration/settings-updated", payload: { enabled: true, voiceURI: "not-installed" } });
  const service = createNarrationService({ store, speechSynthesis: speech, UtteranceCtor: FakeUtterance, textElement: captionElement() });
  service.start();
  assert.equal(service.speak("You can still learn without a named voice."), true);
  assert.equal(speech.utterances[0].voice, null);
  assert.match(service.getDiagnostics().available ? "available" : "unavailable", /available/);
  service.stop();
});

test("unavailable Web Speech APIs leave visible text and do not throw", () => {
  const caption = captionElement();
  const service = createNarrationService({
    store: createGameStore(), speechSynthesis: null, UtteranceCtor: null, textElement: caption
  });
  service.start();
  assert.equal(service.isAvailable(), false);
  assert.equal(service.speak("Read this instruction on screen."), false);
  assert.equal(caption.textContent, "Read this instruction on screen.");
  assert.equal(caption.hidden, false);
  service.stop();
});

test("turning narration off interrupts speech immediately", () => {
  const speech = new FakeSpeechSynthesis();
  const store = createGameStore();
  store.dispatch({ type: "narration/settings-updated", payload: { enabled: true } });
  const service = createNarrationService({ store, speechSynthesis: speech, UtteranceCtor: FakeUtterance });
  service.start();
  service.speak("A short instruction.");
  speech.utterances[0].onstart();
  store.dispatch({ type: "narration/settings-updated", payload: { enabled: false } });
  assert.equal(speech.cancelCount, 1);
  assert.equal(service.getDiagnostics().enabled, false);
  assert.equal(service.getDiagnostics().speaking, false);
  service.stop();
});

test("turning narration off cancels an utterance that is queued but has not started", () => {
  const speech = new FakeSpeechSynthesis();
  const store = createGameStore();
  store.dispatch({ type: "narration/settings-updated", payload: { enabled: true } });
  const service = createNarrationService({ store, speechSynthesis: speech, UtteranceCtor: FakeUtterance });
  service.start();
  service.speak("Waiting for the browser voice.");
  assert.equal(service.getDiagnostics().pending, true);
  assert.equal(service.getDiagnostics().speaking, false);
  store.dispatch({ type: "narration/settings-updated", payload: { enabled: false } });
  assert.equal(speech.cancelCount, 1);
  assert.equal(service.getDiagnostics().pending, false);
  service.stop();
});

test("voiceschanged refreshes voice discovery and subscriptions are cleaned up", () => {
  const first = { voiceURI: "voice-one", name: "One", lang: "en" };
  const second = { voiceURI: "voice-two", name: "Two", lang: "en" };
  const speech = new FakeSpeechSynthesis([first]);
  const service = createNarrationService({
    store: createGameStore(), speechSynthesis: speech, UtteranceCtor: FakeUtterance, textElement: captionElement()
  });
  const seen = [];
  const unsubscribe = service.subscribeVoices((voices) => seen.push(voices.map((voice) => voice.voiceURI).join(",")));
  service.start();
  assert.equal(speech.count("voiceschanged"), 1);
  speech.voices = [first, second];
  speech.emit("voiceschanged");
  assert.equal(service.getVoices().length, 2);
  assert.ok(seen.includes("voice-one,voice-two"));
  unsubscribe();
  service.stop();
  assert.equal(speech.count("voiceschanged"), 0);
});
