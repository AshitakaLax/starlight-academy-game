import { coreActionDefinitions, createInitialGameState } from "./actions.js";
import { selectCurrentScreen } from "./selectors.js";
import { cloneSerializable, deepFreeze, isPlainObject } from "./stateUtils.js";

const ACTION_TYPE_PATTERN = /^[a-z][a-z0-9-]*(?:\/[a-z][a-z0-9-]*)+$/;

function validateActionDefinition(type, definition) {
  if (!ACTION_TYPE_PATTERN.test(type)) {
    throw new TypeError("Action type \"" + type + "\" must use the namespace/name format.");
  }
  if (!isPlainObject(definition)
      || typeof definition.validate !== "function"
      || typeof definition.reduce !== "function") {
    throw new TypeError("Action \"" + type + "\" must provide validate() and reduce() functions.");
  }
}

function hasOnlyKeys(value, allowedKeys) {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function normalizeAction(input, definitions) {
  if (!isPlainObject(input)
      || !hasOnlyKeys(input, ["type", "payload"])
      || typeof input.type !== "string"
      || !ACTION_TYPE_PATTERN.test(input.type)) {
    throw new TypeError("dispatch expects an action with a namespaced string type and optional payload.");
  }

  const definition = definitions.get(input.type);
  if (!definition) throw new Error("Unknown game action: " + input.type);

  const payload = input.payload === undefined
    ? undefined
    : deepFreeze(cloneSerializable(input.payload, "action(" + input.type + ").payload"));
  const validation = definition.validate(payload);
  if (validation !== true) {
    const message = typeof validation === "string" && validation.trim()
      ? validation
      : "Invalid payload for action: " + input.type;
    throw new TypeError(message);
  }

  const action = payload === undefined
    ? { type: input.type }
    : { type: input.type, payload };
  return { action: deepFreeze(action), definition };
}

/**
 * Create the single source of truth for mutable runtime state.
 * Reducers are pure: they receive a frozen snapshot and return a new state object.
 */
export function createGameStore({
  initialState = createInitialGameState(),
  actions = {},
  onListenerError = () => {},
  onDispatchError = () => {}
} = {}) {
  if (!isPlainObject(actions)) throw new TypeError("createGameStore: actions must be an object.");
  if (typeof onListenerError !== "function" || typeof onDispatchError !== "function") {
    throw new TypeError("createGameStore: error handlers must be functions.");
  }

  const definitions = new Map(Object.entries(coreActionDefinitions));
  for (const [type, definition] of Object.entries(actions)) {
    validateActionDefinition(type, definition);
    if (definitions.has(type)) {
      throw new Error("Action type is already registered: " + type);
    }
    definitions.set(type, definition);
  }

  let state = deepFreeze(cloneSerializable(initialState));
  if (!isPlainObject(state)) {
    throw new TypeError("The initial game state must be a plain object.");
  }

  let version = 0;
  let processing = false;
  let destroyed = false;
  const queue = [];
  const subscriptions = new Set();
  const scopes = new Map();

  function assertActive() {
    if (destroyed) throw new Error("The game state store has been destroyed.");
  }

  function reportListenerError(error, action, currentVersion) {
    try {
      onListenerError(error, { action, version: currentVersion });
    } catch {
      // A diagnostic callback must not break state delivery to other subscribers.
    }
  }

  function reportDispatchError(error, action) {
    try {
      onDispatchError(error, { action, version });
    } catch {
      // A diagnostic callback must not corrupt the action queue.
    }
  }

  function addSubscription(record) {
    assertActive();
    subscriptions.add(record);
    let active = true;
    return function unsubscribe() {
      if (!active) return;
      active = false;
      subscriptions.delete(record);
    };
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("subscribe expects a listener function.");
    }
    return addSubscription({
      notify(nextState, action, nextVersion) {
        listener(nextState, action, nextVersion);
      }
    });
  }

  function subscribeSelector(selector, listener, {
    equalityFn = Object.is,
    emitCurrent = false
  } = {}) {
    if (typeof selector !== "function" || typeof listener !== "function") {
      throw new TypeError("subscribeSelector expects selector and listener functions.");
    }
    if (typeof equalityFn !== "function") {
      throw new TypeError("equalityFn must be a function.");
    }

    let selectedValue = selector(state);
    const unsubscribe = addSubscription({
      notify(nextState, action, nextVersion) {
        const nextValue = selector(nextState);
        if (equalityFn(selectedValue, nextValue)) return;
        const previousValue = selectedValue;
        selectedValue = nextValue;
        listener(nextValue, previousValue, action, nextVersion);
      }
    });

    if (emitCurrent) {
      try {
        listener(selectedValue, undefined, null, version);
      } catch (error) {
        reportListenerError(error, null, version);
      }
    }
    return unsubscribe;
  }

  function createScope(scopeId, options = {}) {
    assertActive();
    if (typeof scopeId !== "string" || !scopeId.trim()) {
      throw new TypeError("createScope expects a non-empty scope ID.");
    }
    if (scopes.has(scopeId)) {
      throw new Error("Subscription scope already exists: " + scopeId);
    }
    if (!isPlainObject(options)) {
      throw new TypeError("createScope options must be an object.");
    }

    const screenId = Object.hasOwn(options, "screenId")
      ? options.screenId
      : selectCurrentScreen(state);
    if (screenId !== null && (typeof screenId !== "string" || !screenId.trim())) {
      throw new TypeError("A scoped screenId must be null or a non-empty string.");
    }

    let active = true;
    const unsubscribeFunctions = new Set();

    function addScoped(unsubscribeBase) {
      let subscribed = true;
      const unsubscribe = () => {
        if (!subscribed) return;
        subscribed = false;
        unsubscribeBase();
        unsubscribeFunctions.delete(unsubscribe);
      };
      unsubscribeFunctions.add(unsubscribe);
      return unsubscribe;
    }

    const scope = {
      subscribe(listener) {
        if (!active) {
          throw new Error("Subscription scope \"" + scopeId + "\" has been disposed.");
        }
        return addScoped(subscribe(listener));
      },
      subscribeSelector(selector, listener, subscriptionOptions) {
        if (!active) {
          throw new Error("Subscription scope \"" + scopeId + "\" has been disposed.");
        }
        return addScoped(subscribeSelector(selector, listener, subscriptionOptions));
      },
      dispose() {
        if (!active) return;
        active = false;
        for (const unsubscribe of [...unsubscribeFunctions]) unsubscribe();
        unsubscribeFunctions.clear();
        scopes.delete(scopeId);
      },
      get active() { return active; },
      get id() { return scopeId; },
      get screenId() { return screenId; }
    };

    scopes.set(scopeId, scope);
    return Object.freeze(scope);
  }

  function notify(nextAction) {
    for (const subscription of [...subscriptions]) {
      if (!subscriptions.has(subscription)) continue;
      try {
        subscription.notify(state, nextAction, version);
      } catch (error) {
        reportListenerError(error, nextAction, version);
      }
    }
  }

  function applyAction(record) {
    const { action, definition } = record;
    const previousScreen = selectCurrentScreen(state);
    const nextState = definition.reduce(state, action.payload, action);
    if (!isPlainObject(nextState)) {
      throw new TypeError("Reducer for \"" + action.type + "\" must return a plain state object.");
    }
    if (nextState === state) {
      return Object.freeze({ accepted: true, changed: false, version, type: action.type });
    }

    state = deepFreeze(cloneSerializable(nextState));
    version += 1;

    const nextScreen = selectCurrentScreen(state);
    if (nextScreen !== previousScreen) {
      for (const scope of [...scopes.values()]) {
        if (scope.screenId !== null && scope.screenId !== nextScreen) scope.dispose();
      }
    }

    notify(action);
    return Object.freeze({ accepted: true, changed: true, version, type: action.type });
  }

  function dispatch(input) {
    assertActive();
    const normalized = normalizeAction(input, definitions);
    queue.push(normalized);
    if (processing) {
      return Object.freeze({
        accepted: true,
        queued: true,
        version,
        type: normalized.action.type
      });
    }

    processing = true;
    let firstReceipt;
    const firstRecord = normalized;
    try {
      while (queue.length > 0) {
        const record = queue.shift();
        try {
          const receipt = applyAction(record);
          if (record === firstRecord) firstReceipt = receipt;
        } catch (error) {
          if (record === firstRecord) {
            queue.length = 0;
            throw error;
          }
          reportDispatchError(error, record.action);
        }
      }
    } finally {
      processing = false;
    }
    return firstReceipt;
  }

  function destroy() {
    if (destroyed) return;
    for (const scope of [...scopes.values()]) scope.dispose();
    subscriptions.clear();
    queue.length = 0;
    destroyed = true;
  }

  return Object.freeze({
    getState() { return state; },
    getVersion() { return version; },
    dispatch,
    subscribe,
    subscribeSelector,
    createScope,
    destroy,
    getDiagnostics() {
      return Object.freeze({
        version,
        subscriberCount: subscriptions.size,
        scopeCount: scopes.size,
        destroyed
      });
    }
  });
}
