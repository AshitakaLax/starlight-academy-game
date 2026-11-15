import { isPlainObject } from "./stateUtils.js";

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
    throw new TypeError('The state must contain a "ui" object to change overlays.');
  }
}

/** Minimal serializable state shape; feature systems add their own domains later. */
export function createInitialGameState() {
  return {
    app: { screenId: "academy" },
    ui: { activeOverlayId: null }
  };
}

/** Built-in UI/navigation actions. Feature actions are injected by their systems. */
export const coreActionDefinitions = Object.freeze({
  "app/screen-changed": Object.freeze({
    validate(payload) {
      return isPlainObject(payload)
        && hasOnlyKeys(payload, ["screenId"])
        && typeof payload.screenId === "string"
        && payload.screenId.trim().length > 0
        ? true
        : 'app/screen-changed expects { screenId: non-empty string }.';
    },
    reduce(state, payload) {
      requireScreenContainer(state);
      if (state.app.screenId === payload.screenId) return state;
      return { ...state, app: { ...state.app, screenId: payload.screenId } };
    }
  }),
  "app/state-restored": Object.freeze({
    validate(payload) {
      return isPlainObject(payload)
        && hasOnlyKeys(payload, ["state"])
        && isPlainObject(payload.state)
        ? true
        : 'app/state-restored expects { state: plain object }.';
    },
    reduce(_state, payload) {
      return payload.state;
    }
  }),
  "ui/overlay-opened": Object.freeze({
    validate(payload) {
      return isPlainObject(payload)
        && hasOnlyKeys(payload, ["overlayId"])
        && typeof payload.overlayId === "string"
        && payload.overlayId.trim().length > 0
        ? true
        : 'ui/overlay-opened expects { overlayId: non-empty string }.';
    },
    reduce(state, payload) {
      requireUiContainer(state);
      if (state.ui.activeOverlayId === payload.overlayId) return state;
      return { ...state, ui: { ...state.ui, activeOverlayId: payload.overlayId } };
    }
  }),
  "ui/overlay-closed": Object.freeze({
    validate(payload) {
      return payload === undefined
        || (isPlainObject(payload)
          && hasOnlyKeys(payload, ["overlayId"])
          && (!Object.hasOwn(payload, "overlayId")
            || (typeof payload.overlayId === "string" && payload.overlayId.trim().length > 0)))
        ? true
        : 'ui/overlay-closed expects no payload or { overlayId?: non-empty string }.';
    },
    reduce(state, payload = {}) {
      requireUiContainer(state);
      if (payload.overlayId && state.ui.activeOverlayId !== payload.overlayId) return state;
      if (state.ui.activeOverlayId === null) return state;
      return { ...state, ui: { ...state.ui, activeOverlayId: null } };
    }
  })
});
