import { isPlainObject } from "./stateUtils.js";
import { gameConfig } from "../../config/gameConfig.js";

function hasOnlyKeys(value, allowedKeys) {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function requireScreenContainer(state) {
  if (!isPlainObject(state.app)) {
    throw new TypeError('The state must contain an "app" object to change screens.');
  }
}

function requireUiContainer(state) {
  if (!isPlainObject(state.ui)) {
    throw new TypeError('The state must contain a "ui" object to change overlays or preferences.');
  }
}

function updateInputRequest(state, requestId, changes = {}) {
  requireUiContainer(state);
  const currentInput = isPlainObject(state.ui.input) ? state.ui.input : {};
  const nextRequestId = Number.isSafeInteger(currentInput[requestId]) ? currentInput[requestId] + 1 : 1;
  return {
    ...state,
    ui: {
      ...state.ui,
      input: { ...currentInput, ...changes, [requestId]: nextRequestId }
    }
  };
}

/** Minimal serializable state shape; feature systems add their own domains later. */
export function createInitialGameState() {
  return {
    app: { screenId: "academy" },
    ui: {
      activeOverlayId: null,
      preferences: { textScale: gameConfig.ui.defaultTextScale, reducedMotion: gameConfig.ui.defaultReducedMotion }
    },
    audio: {
      masterVolume: gameConfig.audio.defaultMasterVolume,
      musicVolume: gameConfig.audio.defaultMusicVolume,
      sfxVolume: gameConfig.audio.defaultSfxVolume,
      muted: gameConfig.audio.defaultMuted
    }
  };
}

/** Built-in UI/navigation actions. Feature actions are injected by their systems. */
export const coreActionDefinitions = Object.freeze({
  "app/screen-changed": Object.freeze({
    validate(payload) {
      return isPlainObject(payload) && hasOnlyKeys(payload, ["screenId"])
        && typeof payload.screenId === "string" && payload.screenId.trim().length > 0
        ? true : 'app/screen-changed expects { screenId: non-empty string }.';
    },
    reduce(state, payload) {
      requireScreenContainer(state);
      if (state.app.screenId === payload.screenId) return state;
      return { ...state, app: { ...state.app, screenId: payload.screenId } };
    }
  }),
  "app/state-restored": Object.freeze({
    validate(payload) {
      return isPlainObject(payload) && hasOnlyKeys(payload, ["state"]) && isPlainObject(payload.state)
        ? true : 'app/state-restored expects { state: plain object }.';
    },
    reduce(_state, payload) { return payload.state; }
  }),
  "hub/dock-selected": Object.freeze({
    validate(payload) {
      return isPlainObject(payload) && hasOnlyKeys(payload, ["dockId"])
        && typeof payload.dockId === "string" && payload.dockId.trim().length > 0
        ? true : "hub/dock-selected expects { dockId: non-empty string }.";
    },
    reduce(state, payload) {
      requireScreenContainer(state);
      if (state.app.activeDockId === payload.dockId) return state;
      return { ...state, app: { ...state.app, activeDockId: payload.dockId } };
    }
  }),
  "activity/answer-selected": Object.freeze({
    validate(payload) {
      return isPlainObject(payload) && hasOnlyKeys(payload, ["choiceIndex"])
        && Number.isInteger(payload.choiceIndex) && payload.choiceIndex >= 0 && payload.choiceIndex <= 3
        ? true : "activity/answer-selected expects { choiceIndex: integer from 0 to 3 }.";
    },
    reduce(state, payload) {
      return updateInputRequest(state, "answerRequestId", { lastAnswerChoiceIndex: payload.choiceIndex });
    }
  }),
  "hints/requested": Object.freeze({
    validate(payload) { return payload === undefined ? true : "hints/requested does not accept a payload."; },
    reduce(state) { return updateInputRequest(state, "hintRequestId"); }
  }),
  "dialogue/advance-requested": Object.freeze({
    validate(payload) { return payload === undefined ? true : "dialogue/advance-requested does not accept a payload."; },
    reduce(state) { return updateInputRequest(state, "dialogueAdvanceRequestId"); }
  }),
  "ui/overlay-opened": Object.freeze({
    validate(payload) {
      return isPlainObject(payload) && hasOnlyKeys(payload, ["overlayId"])
        && typeof payload.overlayId === "string" && payload.overlayId.trim().length > 0
        ? true : 'ui/overlay-opened expects { overlayId: non-empty string }.';
    },
    reduce(state, payload) {
      requireUiContainer(state);
      if (state.ui.activeOverlayId === payload.overlayId) return state;
      return { ...state, ui: { ...state.ui, activeOverlayId: payload.overlayId } };
    }
  }),
  "ui/overlay-closed": Object.freeze({
    validate(payload) {
      return payload === undefined || (isPlainObject(payload) && hasOnlyKeys(payload, ["overlayId"])
        && (!Object.hasOwn(payload, "overlayId")
          || (typeof payload.overlayId === "string" && payload.overlayId.trim().length > 0)))
        ? true : "ui/overlay-closed expects no payload or { overlayId?: non-empty string }.";
    },
    reduce(state, payload = {}) {
      requireUiContainer(state);
      if (payload.overlayId && state.ui.activeOverlayId !== payload.overlayId) return state;
      if (state.ui.activeOverlayId === null) return state;
      return { ...state, ui: { ...state.ui, activeOverlayId: null } };
    }
  }),
  "settings/preferences-updated": Object.freeze({
    validate(payload) {
      if (!isPlainObject(payload) || Object.keys(payload).length === 0
          || !hasOnlyKeys(payload, ["textScale", "reducedMotion"])) {
        return "settings/preferences-updated expects textScale and/or reducedMotion.";
      }
      if (Object.hasOwn(payload, "textScale") && !["small", "normal", "large"].includes(payload.textScale)) {
        return 'textScale must be "small", "normal", or "large".';
      }
      if (Object.hasOwn(payload, "reducedMotion") && typeof payload.reducedMotion !== "boolean") {
        return "reducedMotion must be a boolean.";
      }
      return true;
    },
    reduce(state, payload) {
      requireUiContainer(state);
      const current = isPlainObject(state.ui.preferences) ? state.ui.preferences : {};
      const preferences = { textScale: gameConfig.ui.defaultTextScale, reducedMotion: gameConfig.ui.defaultReducedMotion, ...current, ...payload };
      if (preferences.textScale === current.textScale && preferences.reducedMotion === current.reducedMotion) return state;
      return { ...state, ui: { ...state.ui, preferences } };
    }
  })
  "audio/settings-updated": Object.freeze({
    validate(payload) {
      if (!isPlainObject(payload) || Object.keys(payload).length === 0
          || !hasOnlyKeys(payload, ["masterVolume", "musicVolume", "sfxVolume", "muted"])) {
        return "audio/settings-updated expects at least one audio setting.";
      }
      for (const key of ["masterVolume", "musicVolume", "sfxVolume"]) {
        if (Object.hasOwn(payload, key)
            && (!Number.isFinite(payload[key]) || payload[key] < 0 || payload[key] > 100)) {
          return key + " must be a number from 0 to 100.";
        }
      }
      if (Object.hasOwn(payload, "muted") && typeof payload.muted !== "boolean") {
        return "muted must be a boolean.";
      }
      return true;
    },
    reduce(state, payload) {
      const current = isPlainObject(state.audio) ? state.audio : {
        masterVolume: gameConfig.audio.defaultMasterVolume,
        musicVolume: gameConfig.audio.defaultMusicVolume,
        sfxVolume: gameConfig.audio.defaultSfxVolume,
        muted: gameConfig.audio.defaultMuted
      };
      const audio = { ...current, ...payload };
      if (audio.masterVolume === current.masterVolume
          && audio.musicVolume === current.musicVolume
          && audio.sfxVolume === current.sfxVolume
          && audio.muted === current.muted) return state;
      return { ...state, audio };
    }
  })
});
