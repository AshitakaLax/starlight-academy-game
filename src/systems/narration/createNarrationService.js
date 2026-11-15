import { selectNarrationSettings } from "./narrationSettings.js";

/**
 * Optional browser speech adapter. Every requested utterance is first copied
 * to a visible caption element. Speech is opt-in, uses the browser default
 * voice when a selected voice is unavailable, and never blocks the game.
 */
export function createNarrationService({
  store,
  speechSynthesis = globalThis.speechSynthesis,
  UtteranceCtor = globalThis.SpeechSynthesisUtterance,
  audioEngine = null,
  textElement = null,
  onStatus = () => {}
} = {}) {
  if (!store || typeof store.getState !== "function" || typeof store.subscribe !== "function") {
    throw new TypeError("createNarrationService requires a game store.");
  }
  if (!textElement || typeof textElement !== "object" || typeof textElement.textContent !== "string") {
    throw new TypeError("createNarrationService requires a visible textElement for every spoken instruction.");
  }
  if (typeof onStatus !== "function") throw new TypeError("onStatus must be a function.");
  if (audioEngine !== null && typeof audioEngine.setMusicDuck !== "function") {
    throw new TypeError("audioEngine must expose setMusicDuck() when supplied.");
  }

  let started = false;
  let settings = selectNarrationSettings(store.getState());
  let voices = [];
  let unsubscribeStore = null;
  let speaking = false;
  let hasPendingUtterance = false;
  let requestId = 0;
  const voiceListeners = new Set();

  const available = Boolean(
    speechSynthesis
    && typeof speechSynthesis.speak === "function"
    && typeof speechSynthesis.cancel === "function"
    && typeof UtteranceCtor === "function"
  );

  function status(kind, message) {
    try { onStatus(Object.freeze({ kind, message, available, enabled: settings.enabled, speaking })); } catch {}
  }

  function setMusicDuck(factor) {
    try { audioEngine?.setMusicDuck?.(factor); } catch {}
  }

  function showText(text) {
    if (textElement) {
      textElement.textContent = text;
      textElement.hidden = false;
      if (textElement.dataset) textElement.dataset.kind = "caption";
    }
  }

  function refreshVoices() {
    try {
      const discovered = typeof speechSynthesis?.getVoices === "function"
        ? speechSynthesis.getVoices()
        : [];
      voices = Array.isArray(discovered) ? discovered.filter((voice) => voice && typeof voice.voiceURI === "string") : [];
    } catch {
      voices = [];
    }
    const snapshot = voices.slice();
    for (const listener of [...voiceListeners]) {
      try { listener(snapshot); } catch {}
    }
    return snapshot;
  }

  function cancel() {
    if (!hasPendingUtterance && !speaking) return false;
    requestId += 1;
    const wasActive = hasPendingUtterance || speaking;
    hasPendingUtterance = false;
    speaking = false;
    try { speechSynthesis?.cancel?.(); } catch {}
    setMusicDuck(1);
    if (wasActive) status("ready", "Narration stopped.");
    return wasActive;
  }

  function speak(text, { interrupt = true, rate } = {}) {
    if (typeof text !== "string" || !text.trim()) {
      throw new TypeError("speak() expects non-empty visible text.");
    }
    const message = text.trim();

    if (!settings.enabled) {
      showText(message);
      status("disabled", "Narration is turned off. The instruction is available here as text.");
      return false;
    }
    if (!available) {
      showText(message);
      status("unavailable", "Narration is not available in this browser. The instruction remains visible as text.");
      return false;
    }
    if (!interrupt && hasPendingUtterance) return false;

    showText(message);
    cancel();
    requestId += 1;
    const utteranceId = requestId;
    let utterance;
    try {
      utterance = new UtteranceCtor(message);
      const selectedRate = Number.isFinite(rate) ? rate : settings.rate;
      utterance.rate = Math.min(1.2, Math.max(0.8, selectedRate));
      const selectedVoice = voices.find((voice) => voice.voiceURI === settings.voiceURI);
      if (selectedVoice) utterance.voice = selectedVoice;
      if (selectedVoice?.lang) utterance.lang = selectedVoice.lang;

      utterance.onstart = () => {
        if (utteranceId !== requestId) return;
        speaking = true;
        setMusicDuck(0.28);
        status("speaking", "Reading the instruction aloud.");
      };
      const finish = () => {
        if (utteranceId !== requestId) return;
        speaking = false;
        hasPendingUtterance = false;
        setMusicDuck(1);
        status("ready", "Narration is ready.");
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      hasPendingUtterance = true;
      speechSynthesis.speak(utterance);
      status("queued", voices.length > 0
        ? "Narration is ready. Your chosen voice will be used when available."
        : "Using your browser's default voice. You can continue without a named voice.");
      return true;
    } catch {
      speaking = false;
      hasPendingUtterance = false;
      setMusicDuck(1);
      status("error", "Speech could not be started. The instruction remains visible as text.");
      return false;
    }
  }

  function onVoicesChanged() {
    refreshVoices();
    if (available) {
      status("ready", voices.length > 0
        ? "Browser voices are ready. Choose one or keep the default voice."
        : "No voice list is available. Narration can still use the browser's default voice.");
    }
  }

  function subscribeVoices(listener, { emitCurrent = true } = {}) {
    if (typeof listener !== "function") throw new TypeError("subscribeVoices expects a function.");
    voiceListeners.add(listener);
    if (emitCurrent) {
      try { listener(voices.slice()); } catch {}
    }
    return () => voiceListeners.delete(listener);
  }

  function start() {
    if (started) return;
    started = true;
    settings = selectNarrationSettings(store.getState());
    speechSynthesis?.addEventListener?.("voiceschanged", onVoicesChanged);
    refreshVoices();
    unsubscribeStore = store.subscribe((state, action) => {
      settings = selectNarrationSettings(state);
      if (!settings.enabled && hasPendingUtterance) cancel();
    });
    if (!available) {
      status("unavailable", "Narration is not available in this browser. Instructions will remain visible as text.");
    } else if (voices.length > 0) {
      status("ready", "Narration is optional and ready. Choose a voice, then use the sample button.");
    } else {
      status("ready", "Narration is optional and ready. The browser's default voice will be used when available.");
    }
  }

  function stop() {
    if (!started) return;
    cancel();
    speechSynthesis?.removeEventListener?.("voiceschanged", onVoicesChanged);
    unsubscribeStore?.();
    unsubscribeStore = null;
    started = false;
  }

  return Object.freeze({
    name: "narration",
    start,
    stop,
    speak,
    cancel,
    getVoices: () => voices.slice(),
    subscribeVoices,
    isAvailable: () => available,
    getDiagnostics: () => Object.freeze({
      started, available, enabled: settings.enabled, speaking, pending: hasPendingUtterance, voiceCount: voices.length
    })
  });
}
