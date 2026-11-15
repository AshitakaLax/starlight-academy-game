/**
 * Simple screen router. Screens register render/unmount callbacks.
 * Manages a SubscriptionScope per screen to avoid stale subscriptions.
 */
import SubscriptionScope from "../core/state/subscriptions.js";

export class Router {
  constructor(root, store = null) {
    this.root = root;
    this.store = store;
    this.screens = new Map();
    this.current = null;
    this.scope = null;
  }

  register(name, screen) {
    this.screens.set(name, screen);
  }

  async go(name, params = {}) {
    if (this.scope) {
      this.scope.dispose();
      this.scope = null;
    }
    if (this.current && this.screens.get(this.current)?.unmount) {
      this.screens.get(this.current).unmount();
    }
    const screen = this.screens.get(name);
    if (!screen) {
      console.error(`Unknown screen: ${name}`);
      return;
    }
    this.current = name;
    this.scope = new SubscriptionScope();
    if (screen.mount) await screen.mount(this.root, params, this.scope, this.store);
    else if (screen.render) screen.render(this.root, params, this.scope, this.store);
  }

  currentScreen() {
    return this.current;
  }

  getScope() {
    return this.scope;
  }
}
export default Router;
