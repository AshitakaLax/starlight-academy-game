/**
 * Centralized, event-driven state store.
 *
 * - State is immutable-ish: actions produce a new state object via reducers.
 * - Actions are validated by name against a registry.
 * - Selectors read slices of state.
 * - Subscriptions notify listeners of changes; render loops must not mutate state.
 */

import { globalBus } from "./events.js";

export class Store {
  constructor(initialState = {}, actionHandlers = {}) {
    this.state = initialState;
    /** @type {Map<string, Function>} */
    this.handlers = new Map(Object.entries(actionHandlers));
    /** @type {Set<Function>} */
    this.subscribers = new Set();
    this.bus = globalBus;
  }

  getState() {
    return this.state;
  }

  /** Register an action handler. Handler: (state, payload) => newState (or null to reject). */
  registerAction(name, handler) {
    if (this.handlers.has(name)) {
      throw new Error(`Action "${name}" already registered`);
    }
    this.handlers.set(name, handler);
  }

  hasAction(name) {
    return this.handlers.has(name);
  }

  /**
   * Dispatch an action. Returns { ok: boolean, state, error? }.
   * Invalid actions are rejected and state is unchanged.
   */
  dispatch(name, payload) {
    const handler = this.handlers.get(name);
    if (!handler) {
      const err = new Error(`Unknown action: ${name}`);
      this.bus.emit("action:rejected", { name, payload, error: err.message });
      return { ok: false, state: this.state, error: err.message };
    }
    let next;
    try {
      next = handler(this.state, payload);
    } catch (err) {
      this.bus.emit("action:rejected", { name, payload, error: err.message });
      return { ok: false, state: this.state, error: err.message };
    }
    if (next === null || next === undefined) {
      const msg = `Action "${name}" rejected`;
      this.bus.emit("action:rejected", { name, payload, error: msg });
      return { ok: false, state: this.state, error: msg };
    }
    if (next === this.state) {
      // no-op accepted
    }
    this.state = next;
    this.bus.emit("state:changed", { name, payload, state: this.state });
    this.bus.emit(`action:${name}`, { payload, state: this.state });
    for (const sub of [...this.subscribers]) {
      try {
        sub(this.state, name, payload);
      } catch (err) {
        console.error("[Store] subscriber threw", err);
      }
    }
    return { ok: true, state: this.state };
  }

  /** Subscribe to all state changes. Returns unsubscribe. */
  subscribe(handler) {
    this.subscribers.add(handler);
    return () => this.subscribers.delete(handler);
  }

  /** Selector helper: read a slice without subscribing. */
  select(selector) {
    return selector(this.state);
  }
}

export default Store;
