import { cloneSerializable, deepFreeze } from "../state/stateUtils.js";

const ACTION_TYPE_PATTERN = /^[a-z][a-z0-9-]*(?:\/[a-z][a-z0-9-]*)+$/;
const DOCK_IDS = Object.freeze(["chapters", "gymnastics", "pets", "wardrobe", "quests"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeKey(key) {
  if (key === " ") return "Space";
  if (key === "Esc") return "Escape";
  if (typeof key === "string" && /^[A-Z]$/.test(key)) return key.toLowerCase();
  return key;
}

function normalizeBinding(binding, contextId, key) {
  const result = typeof binding === "string" ? { type: binding } : binding;
  if (!isPlainObject(result)
      || typeof result.type !== "string"
      || !ACTION_TYPE_PATTERN.test(result.type)
      || (result.payload !== undefined && !isPlainObject(result.payload))
      || (result.preventDefault !== undefined && typeof result.preventDefault !== "boolean")) {
    throw new TypeError('Invalid binding for key "' + key + '" in context "' + contextId + '".');
  }
  const payload = result.payload === undefined
    ? undefined
    : deepFreeze(cloneSerializable(result.payload, "inputBinding.payload"));
  return Object.freeze({
    type: result.type,
    ...(payload === undefined ? {} : { payload }),
    preventDefault: result.preventDefault !== false
  });
}

function isEditable(element) {
  if (!element) return false;
  const tagName = String(element.tagName ?? "").toLowerCase();
  if (["input", "textarea", "select"].includes(tagName)) return true;
  if (element.isContentEditable === true) return true;
  if (typeof element.matches === "function"
      && element.matches("[contenteditable=''], [contenteditable='true'], [role='textbox']")) {
    return true;
  }
  return false;
}

function isNativeKeyboardTarget(element) {
  if (!element) return false;
  const tagName = String(element.tagName ?? "").toLowerCase();
  return ["button", "a", "input", "textarea", "select", "summary"].includes(tagName);
}

function isDisabled(element) {
  return Boolean(element?.disabled)
    || element?.getAttribute?.("aria-disabled") === "true"
    || Boolean(element?.closest?.("[disabled], [aria-disabled='true']"));
}

/**
 * Route desktop keyboard and delegated mouse input into validated store actions.
 * Contexts are active only for their declared screen and, when specified, overlay.
 */
export function createInputRouter({
  store,
  target = globalThis.window,
  documentRef = globalThis.document,
  root = documentRef,
  onError = () => {}
} = {}) {
  if (!store || typeof store.getState !== "function" || typeof store.dispatch !== "function") {
    throw new TypeError("createInputRouter requires a game store with getState() and dispatch().");
  }
  if (!target || typeof target.addEventListener !== "function"
      || typeof target.removeEventListener !== "function") {
    throw new TypeError("createInputRouter requires an event target.");
  }
  if (!root || typeof root.addEventListener !== "function"
      || typeof root.removeEventListener !== "function") {
    throw new TypeError("createInputRouter requires a DOM event root.");
  }
  if (typeof onError !== "function") throw new TypeError("onError must be a function.");

  const contexts = new Map();
  let running = false;
  let activeContextId = null;

  function reportError(error, context) {
    try {
      onError(error, context);
    } catch {
      // Diagnostics must not interrupt input routing.
    }
  }

  function getActiveOverlayId() {
    return store.getState()?.ui?.activeOverlayId ?? null;
  }

  function contextMatches(context, state = store.getState()) {
    const screenId = context.screenId;
    if (screenId !== null && state?.app?.screenId !== screenId) return false;

    if (context.hasOverlayConstraint) {
      if ((state?.ui?.activeOverlayId ?? null) !== context.overlayId) return false;
    } else if ((state?.ui?.activeOverlayId ?? null) !== null) {
      // A modal owns input until it closes.
      return false;
    }

    if (context.enabledWhen) {
      try {
        if (context.enabledWhen(state) !== true) return false;
      } catch (error) {
        reportError(error, "context:" + context.id);
        return false;
      }
    }
    return true;
  }

  function getContext(contextId) {
    const context = contexts.get(contextId);
    return context && contextMatches(context) ? context : null;
  }

  function resolveContextForKey(key) {
    const state = store.getState();
    let selected = null;
    for (const context of contexts.values()) {
      if (!context.keys.has(key) || !contextMatches(context, state)) continue;
      if (!selected || context.priority > selected.priority) selected = context;
    }
    return selected;
  }

  function dispatchAction(action, source) {
    try {
      store.dispatch(action);
      return true;
    } catch (error) {
      reportError(error, source);
      return false;
    }
  }

  function handleEscape(event) {
    const overlayId = getActiveOverlayId();
    if (overlayId !== null) {
      dispatchAction({
        type: "ui/overlay-closed",
        payload: { overlayId }
      }, "keyboard:Escape");
    } else {
      dispatchAction({
        type: "ui/overlay-opened",
        payload: { overlayId: "settings" }
      }, "keyboard:Escape");
    }
    event.preventDefault?.();
  }

  function handleKeyDown(event) {
    if (!running || event.defaultPrevented || event.repeat || event.isComposing
        || event.keyCode === 229 || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const key = normalizeKey(event.key);
    const focused = documentRef?.activeElement ?? null;
    if (isEditable(focused)) return;

    if (key === "Escape") {
      handleEscape(event);
      return;
    }

    if (key === "Enter" || key === "Space") {
      if (isNativeKeyboardTarget(focused)) return;

      const primaryAction = typeof focused?.matches === "function"
        && focused.matches("[data-primary-action], [role='button'][tabindex], [tabindex='0'][data-game-action]");
      if (primaryAction && typeof focused.click === "function") {
        event.preventDefault?.();
        focused.click();
        return;
      }
    }

    const context = resolveContextForKey(key);
    if (!context) return;

    const binding = context.keys.get(key);
    const action = binding.payload === undefined
      ? { type: binding.type }
      : { type: binding.type, payload: binding.payload };

    if (binding.preventDefault) event.preventDefault?.();
    activeContextId = context.id;
    dispatchAction(action, "keyboard:" + key + ":" + context.id);
  }

  function findActionElement(eventTarget) {
    if (!eventTarget) return null;
    if (typeof eventTarget.closest === "function") {
      return eventTarget.closest("[data-game-action]");
    }
    return eventTarget.parentElement?.closest?.("[data-game-action]") ?? null;
  }

  function handleClick(event) {
    if (!running || event.defaultPrevented) return;
    const actionElement = findActionElement(event.target);
    if (!actionElement || isDisabled(actionElement)) return;

    if (typeof root.contains === "function" && !root.contains(actionElement)) return;

    const requiredContext = actionElement.getAttribute?.("data-game-context");
    const overlayIsOpen = getActiveOverlayId() !== null;
    if (requiredContext && !getContext(requiredContext)) return;
    if (overlayIsOpen && !requiredContext) return;

    const type = actionElement.getAttribute?.("data-game-action");
    if (typeof type !== "string" || !ACTION_TYPE_PATTERN.test(type)) {
      reportError(new TypeError("The clicked control has an invalid data-game-action."), "mouse:click");
      return;
    }

    let payload;
    const serializedPayload = actionElement.getAttribute?.("data-game-payload");
    if (serializedPayload !== null && serializedPayload !== undefined) {
      try {
        payload = JSON.parse(serializedPayload);
      } catch (error) {
        reportError(new TypeError("The clicked control has invalid JSON in data-game-payload.", { cause: error }), "mouse:click");
        return;
      }
      if (!isPlainObject(payload)) {
        reportError(new TypeError("data-game-payload must contain a JSON object."), "mouse:click");
        return;
      }
    }

    const action = payload === undefined ? { type } : { type, payload };
    dispatchAction(action, "mouse:click:" + type);
    if (actionElement.getAttribute?.("data-game-prevent-default") === "true") {
      event.preventDefault?.();
    }
  }

  function start() {
    if (running) return;
    target.addEventListener("keydown", handleKeyDown);
    root.addEventListener("click", handleClick);
    running = true;
  }

  function stop() {
    if (!running) return;
    target.removeEventListener("keydown", handleKeyDown);
    root.removeEventListener("click", handleClick);
    running = false;
    activeContextId = null;
  }

  function registerContext(contextId, bindings) {
    if (typeof contextId !== "string" || !contextId.trim()) {
      throw new TypeError("registerContext expects a non-empty context ID.");
    }
    if (contexts.has(contextId)) throw new Error("Input context is already registered: " + contextId);
    if (!isPlainObject(bindings)) throw new TypeError("Input context bindings must be an object.");

    const screenId = Object.hasOwn(bindings, "screenId") ? bindings.screenId : contextId;
    const overlayId = bindings.overlayId;
    const hasOverlayConstraint = Object.hasOwn(bindings, "overlayId");
    if (screenId !== null && (typeof screenId !== "string" || !screenId.trim())) {
      throw new TypeError("Input context screenId must be null or a non-empty string.");
    }
    if (hasOverlayConstraint && overlayId !== null
        && (typeof overlayId !== "string" || !overlayId.trim())) {
      throw new TypeError("Input context overlayId must be null or a non-empty string.");
    }
    if (bindings.priority !== undefined
        && (!Number.isFinite(bindings.priority) || bindings.priority < 0)) {
      throw new TypeError("Input context priority must be a non-negative number.");
    }
    if (bindings.enabledWhen !== undefined && typeof bindings.enabledWhen !== "function") {
      throw new TypeError("Input context enabledWhen must be a function.");
    }

    const rawKeys = bindings.keys ?? {};
    if (!isPlainObject(rawKeys)) throw new TypeError("Input context keys must be an object.");
    const keys = new Map();
    for (const [rawKey, binding] of Object.entries(rawKeys)) {
      const key = normalizeKey(rawKey);
      if (!key || keys.has(key)) throw new TypeError("Input context contains an empty or duplicate key.");
      keys.set(key, normalizeBinding(binding, contextId, key));
    }

    const context = Object.freeze({
      id: contextId,
      screenId,
      overlayId: hasOverlayConstraint ? overlayId : null,
      hasOverlayConstraint,
      priority: bindings.priority ?? 0,
      enabledWhen: bindings.enabledWhen ?? null,
      keys
    });
    contexts.set(contextId, context);
    return () => {
      if (contexts.get(contextId) === context) contexts.delete(contextId);
    };
  }

  function getDiagnostics() {
    const activeIds = [...contexts.values()]
      .filter((context) => contextMatches(context))
      .map((context) => context.id);
    return Object.freeze({
      running,
      registeredContexts: contexts.size,
      activeContexts: Object.freeze(activeIds),
      lastKeyContext: activeContextId
    });
  }

  return Object.freeze({
    start,
    stop,
    registerContext,
    getDiagnostics
  });
}

export const HUB_DOCK_IDS = DOCK_IDS;
