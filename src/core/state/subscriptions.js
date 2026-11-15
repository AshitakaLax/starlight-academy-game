/**
 * Subscription scope for UI/render layers. Collects unsubscribe functions and
 * disposes them on screen change to prevent stale subscriptions.
 */
export class SubscriptionScope {
  constructor() {
    this.unsubs = [];
  }

  /** Subscribe to store changes; tracked for disposal. */
  subscribe(store, handler) {
    const unsub = store.subscribe(handler);
    this.unsubs.push(unsub);
    return unsub;
  }

  dispose() {
    for (const u of this.unsubs) {
      try { u(); } catch (e) { console.warn("unsubscribe failed", e); }
    }
    this.unsubs = [];
  }
}
export default SubscriptionScope;
