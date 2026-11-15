import { selectAudioSettings } from "./audioSettings.js";

/**
 * Application adapter for audio unlock, state-driven mixer updates and UI/game
 * event sounds. No AudioContext is created until a real user gesture occurs.
 */
export function createAudioService({
  engine,
  store,
  gestureTarget = globalThis.document,
  root = null,
  onStatus = () => {}
} = {}) {
  if (!engine || typeof engine.unlock !== "function" || typeof engine.setSettings !== "function"
      || typeof engine.startMusic !== "function" || typeof engine.playSfx !== "function"
      || typeof engine.destroy !== "function") {
    throw new TypeError("createAudioService requires a compatible audio engine.");
  }
  if (!store || typeof store.getState !== "function" || typeof store.subscribe !== "function") {
    throw new TypeError("createAudioService requires a game store.");
  }
  if (typeof onStatus !== "function") throw new TypeError("onStatus must be a function.");

  let started = false;
  let unlocked = false;
  let currentScene = "academy";
  let unsubscribe = null;

  function status(message, kind = "info") {
    try { onStatus(Object.freeze({ message, kind })); } catch {}
  }

  function removeGestureListeners() {
    gestureTarget?.removeEventListener?.("pointerdown", onFirstGesture, true);
    gestureTarget?.removeEventListener?.("keydown", onFirstGesture, true);
  }

  async function onFirstGesture(event) {
    if (unlocked || event?.defaultPrevented) return;
    if (root && event?.target && typeof root.contains === "function" && !root.contains(event.target)) return;
    unlocked = true;
    removeGestureListeners();
    const available = await engine.unlock();
    if (available) engine.startMusic(currentScene);
    else status("Audio is unavailable. Gameplay and learning will work normally.", "unavailable");
  }

  async function start() {
    if (started) return;
    engine.setSettings(selectAudioSettings(store.getState()));
    unsubscribe = store.subscribe((state, action) => {
      engine.setSettings(selectAudioSettings(state));
      if (!action) return;
      if (action.type === "hub/dock-selected") {
        currentScene = {
          chapters: "academy",
          gymnastics: "gymnastics",
          pets: "pets",
          wardrobe: "wardrobe",
          quests: "quests"
        }[action.payload?.dockId] ?? "academy";
        engine.startMusic(currentScene);
        engine.playSfx("select");
      } else if (action.type === "ui/overlay-opened") {
        engine.playSfx("open");
      } else if (action.type === "ui/overlay-closed") {
        engine.playSfx("close");
      }
    });
    if (gestureTarget?.addEventListener) {
      gestureTarget.addEventListener("pointerdown", onFirstGesture, true);
      gestureTarget.addEventListener("keydown", onFirstGesture, true);
      status("Sound is ready when you are. Tap or press a key to begin audio.");
    } else {
      status("Audio input is unavailable. The academy will continue silently.", "unavailable");
    }
    started = true;
  }

  async function stop() {
    if (!started) return;
    removeGestureListeners();
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
    started = false;
    unlocked = false;
    await engine.destroy();
  }

  return Object.freeze({
    name: "audio",
    start,
    stop,
    get started() { return started; },
    get unlocked() { return unlocked; },
    playSfx(effectId = "select") { return unlocked ? engine.playSfx(effectId) : false; },
    getDiagnostics: () => Object.freeze({ started, unlocked })
  });
}
