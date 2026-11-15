/**
 * Declarative shortcut definitions. Each entry maps a key to an action name
 * and the context in which it is active.
 *
 * key: KeyboardEvent.key (lowercased)
 * context: "hub" | "mc" (multiple choice) | "global" | ...
 * action: store action or callback id handled by the screen
 */
export const SHORTCUTS = [
  { key: "1", contexts: ["mc"], action: "answer:1" },
  { key: "2", contexts: ["mc"], action: "answer:2" },
  { key: "3", contexts: ["mc"], action: "answer:3" },
  { key: "4", contexts: ["mc"], action: "answer:4" },
  { key: "1", contexts: ["hub"], action: "hub:dock:1" },
  { key: "2", contexts: ["hub"], action: "hub:dock:2" },
  { key: "3", contexts: ["hub"], action: "hub:dock:3" },
  { key: "4", contexts: ["hub"], action: "hub:dock:4" },
  { key: "5", contexts: ["hub"], action: "hub:dock:5" },
  { key: "enter", contexts: ["global"], action: "primary:activate" },
  { key: " ", contexts: ["global"], action: "primary:activate" },
  { key: "h", contexts: ["global"], action: "hint:request" },
  { key: "escape", contexts: ["global"], action: "modal:close" },
];

export function shortcutsForContext(context) {
  return SHORTCUTS.filter((s) => s.contexts.includes(context) || s.contexts.includes("global"));
}

/**
 * Bind a shortcut table to an InputManager for a given context.
 * `handlers` maps action id -> function.
 */
export function bindShortcuts(inputManager, context, handlers = {}) {
  for (const s of shortcutsForContext(context)) {
    const key = s.key;
    const action = s.action;
    if (handlers[action]) {
      inputManager.registerKey(context, key, handlers[action]);
    }
  }
}
export default { SHORTCUTS, shortcutsForContext, bindShortcuts };
