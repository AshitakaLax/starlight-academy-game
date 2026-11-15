const TRACKS = Object.freeze({
  academy: Object.freeze([261.63, 329.63, 392.0]),
  gymnastics: Object.freeze([293.66, 369.99, 440.0]),
  pets: Object.freeze([220.0, 261.63, 329.63]),
  wardrobe: Object.freeze([246.94, 311.13, 369.99]),
  quests: Object.freeze([196.0, 246.94, 293.66])
});
const EFFECTS = Object.freeze({
  select: Object.freeze({ frequency: 659.25, endFrequency: 987.77, duration: 0.16, type: "sine" }),
  open: Object.freeze({ frequency: 523.25, endFrequency: 783.99, duration: 0.22, type: "sine" }),
  close: Object.freeze({ frequency: 440.0, endFrequency: 329.63, duration: 0.15, type: "sine" }),
  sparkle: Object.freeze({ frequency: 880.0, endFrequency: 1318.51, duration: 0.28, type: "triangle" }),
  correct: Object.freeze({ frequency: 523.25, endFrequency: 1046.5, duration: 0.3, type: "triangle" })
});

const DEFAULT_SETTINGS = Object.freeze({ masterVolume: 70, musicVolume: 24, sfxVolume: 55, muted: false });

function normalizeSettings(settings = {}) {
  return Object.freeze({
    masterVolume: clampVolume(settings.masterVolume, DEFAULT_SETTINGS.masterVolume),
    musicVolume: clampVolume(settings.musicVolume, DEFAULT_SETTINGS.musicVolume),
    sfxVolume: clampVolume(settings.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
    muted: settings.muted === true
  });
}
function clampVolume(value, fallback) {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback;
}

/**
 * Local synthesized audio. AudioContext is constructed only after unlock() is
 * called from a user gesture. Failure is non-fatal and never blocks gameplay.
 */
export function createAudioEngine({
  AudioContextCtor = globalThis.AudioContext ?? globalThis.webkitAudioContext,
  onStatus = () => {}
} = {}) {
  if (typeof onStatus !== "function") throw new TypeError("onStatus must be a function.");
  let context = null;
  let masterBus = null;
  let musicBus = null;
  let sfxBus = null;
  let musicVoices = [];
  let settings = normalizeSettings();
  let unlocked = false;
  let available = typeof AudioContextCtor === "function";
  let destroyed = false;
  let activeTrack = null;
  let musicDuck = 1;
  let createdEffectCount = 0;

  function report(state, message) {
    try { onStatus(Object.freeze({ state, message, available, unlocked, track: activeTrack })); } catch {}
  }

  function applySettings() {
    if (!masterBus) return;
    masterBus.gain.value = settings.muted ? 0 : settings.masterVolume / 100;
    musicBus.gain.value = settings.musicVolume / 100 * musicDuck;
    sfxBus.gain.value = settings.sfxVolume / 100;
  }

  function createBuses() {
    masterBus = context.createGain();
    musicBus = context.createGain();
    sfxBus = context.createGain();
    musicBus.connect(masterBus);
    sfxBus.connect(masterBus);
    masterBus.connect(context.destination);
    applySettings();
  }

  async function unlock() {
    if (destroyed) return false;
    if (!available) {
      report("unsupported", "Audio is not available in this browser. The academy will continue without sound.");
      return false;
    }
    try {
      if (!context) {
        context = new AudioContextCtor();
        if (!context || typeof context.createGain !== "function" || typeof context.createOscillator !== "function") {
          throw new Error("The browser returned an incomplete Web Audio implementation.");
        }
        createBuses();
      }
      if (context.state === "suspended" && typeof context.resume === "function") await context.resume();
      unlocked = context.state !== "closed";
      applySettings();
      report(unlocked ? "ready" : "unavailable", unlocked
        ? "Sound is ready. Music and effects will play at your chosen levels."
        : "Audio could not be started. You can continue playing without sound.");
      return unlocked;
    } catch (error) {
      available = false;
      unlocked = false;
      report("error", "Sound could not be started. The academy will continue without audio.");
      return false;
    }
  }

  function stopMusic() {
    for (const voice of musicVoices) {
      try { voice.oscillator.stop(); } catch {}
      try { voice.oscillator.disconnect(); } catch {}
      try { voice.gain.disconnect(); } catch {}
    }
    musicVoices = [];
    activeTrack = null;
  }

  function startMusic(sceneId = "academy") {
    if (destroyed || !unlocked || !context || !musicBus) return false;
    const notes = TRACKS[sceneId] ?? TRACKS.academy;
    if (activeTrack === sceneId && musicVoices.length > 0) return true;
    stopMusic();
    try {
      for (const [index, frequency] of notes.entries()) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = index === 0 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.value = index === 0 ? 0.014 : 0.009;
        oscillator.connect(gain);
        gain.connect(musicBus);
        oscillator.start();
        musicVoices.push({ oscillator, gain });
      }
      activeTrack = sceneId;
      report("playing", "Academy music is playing.");
      return true;
    } catch (error) {
      stopMusic();
      report("error", "Background music could not be played. Sound effects may still be available.");
      return false;
    }
  }

  function playSfx(effectId = "select") {
    if (destroyed || !unlocked || !context || !sfxBus) return false;
    const effect = EFFECTS[effectId];
    if (!effect) return false;
    try {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = effect.type;
      oscillator.frequency.setValueAtTime(effect.frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(effect.endFrequency, now + effect.duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + effect.duration);
      oscillator.connect(gain);
      gain.connect(sfxBus);
      oscillator.start(now);
      oscillator.stop(now + effect.duration + 0.02);
      oscillator.onended = () => {
        try { oscillator.disconnect(); } catch {}
        try { gain.disconnect(); } catch {}
      };
      createdEffectCount += 1;
      return true;
    } catch {
      report("error", "A sound effect could not be played.");
      return false;
    }
  }

  function setMusicDuck(factor = 1) {
    musicDuck = Number.isFinite(factor) ? Math.min(1, Math.max(0, factor)) : 1;
    if (musicBus) musicBus.gain.value = settings.musicVolume / 100 * musicDuck;
    return musicDuck;
  }

  function setSettings(nextSettings = {}) {
    if (destroyed) return settings;
    settings = normalizeSettings({ ...settings, ...nextSettings });
    applySettings();
    return settings;
  }

  async function destroy() {
    if (destroyed) return;
    stopMusic();
    destroyed = true;
    unlocked = false;
    try {
      if (context && context.state !== "closed" && typeof context.close === "function") await context.close();
    } catch {}
    context = null;
    masterBus = null;
    musicBus = null;
    sfxBus = null;
    report("stopped", "Audio has been stopped.");
  }

  return Object.freeze({
    unlock, startMusic, stopMusic, playSfx, setSettings, setMusicDuck, destroy,
    getSettings: () => settings,
    getDiagnostics: () => Object.freeze({
      available, unlocked, destroyed, activeTrack,
      activeMusicVoices: musicVoices.length,
      createdEffectCount,
      musicDuck,
      settings
    })
  });
}
