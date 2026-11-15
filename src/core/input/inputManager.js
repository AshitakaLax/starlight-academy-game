/**
 * Context-aware input router. Tracks active context (screen) and dispatches
 * keyboard and mouse events to registered handlers. Shortcuts are ignored
 * while typing in form fields and never fire twice for one key press.
 */

export class InputManager {
  constructor() {
    /** @type {string} */
    this.context = "global";
    /** @type {Map<string, Map<string, Function>>} */
    this.keyHandlers = new Map();
    /** @type {Map<string, Function>} */
    this.mouseHandlers = new Map();
    this.listenersAttached = false;
    this.ignoreKeyRepeat = true;
  }

  setContext(ctx) {
    this.context = ctx || "global";
  }

  getContext() {
    return this.context;
  }

  registerKey(context, key, handler) {
    if (!this.keyHandlers.has(context)) this.keyHandlers.set(context, new Map());
    this.keyHandlers.get(context).set(String(key).toLowerCase(), handler);
  }

  unregisterKey(context, key) {
    const m = this.keyHandlers.get(context);
    if (m) m.delete(String(key).toLowerCase());
  }

  registerMouse(context, handler) {
    this.mouseHandlers.set(context, handler);
  }

  isTypingTarget(target) {
    if (!target) return false;
    const tag = (target.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
  }

  handleKeyDown(e) {
    if (!e) return;
    if (this.ignoreKeyRepeat && e.repeat) return;
    if (this.isTypingTarget(e.target)) return;
    const key = String(e.key || "").toLowerCase();
    const ctxHandlers = this.keyHandlers.get(this.context);
    const globalHandlers = this.keyHandlers.get("global");
    const handler = (ctxHandlers && ctxHandlers.get(key)) || (globalHandlers && globalHandlers.get(key));
    if (handler) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
      handler(e);
    }
  }

  handleClick(e) {
    const handler = this.mouseHandlers.get(this.context);
    if (handler) {
      handler(e);
    }
  }

  attach() {
    if (this.listenersAttached || typeof window === "undefined") return;
    window.addEventListener("keydown", (e) => this.handleKeyDown(e), true);
    window.addEventListener("click", (e) => this.handleClick(e), true);
    this.listenersAttached = true;
  }

  detach() {
    if (!this.listenersAttached || typeof window === "undefined") return;
    // listeners are anonymous; mark detached
    this.listenersAttached = false;
  }
}
export default InputManager;
