# Context-aware input routing

STEP-05 implements desktop keyboard shortcuts and delegated mouse-action routing. It translates input into validated store actions; it does not contain game rules or mutate state directly.

## Input router

\`createInputRouter({ store, target, documentRef, root, onError })\` installs one \`keydown\` listener and one delegated \`click\` listener. The defaults target the current browser window and document; tests inject lightweight event targets.

\`registerContext(contextId, bindings)\` registers a named context and returns an unregister function. Contexts default to a screen ID matching their ID. A context may specify:

- \`screenId\`: the app screen on which it is valid; use null for an app-wide context.
- \`overlayId\`: when supplied, the context is active only for that exact overlay state. Background contexts are suspended while any overlay is open.
- \`priority\`: higher priorities win when multiple active contexts bind the same key.
- \`enabledWhen(state)\`: an additional capability check, such as whether the current activity supports hints.
- \`keys\`: a map from keyboard keys to a registered action type or \`{ type, payload, preventDefault }\`.

Actions always pass through the state store, so action validators remain authoritative. A failed dispatch is reported via \`onError\` and does not crash the input event handler.

## Standard contexts

\`registerStandardInputContexts(router)\` adds these conventions:

| Context | Keys | Action |
|---|---|---|
| Academy hub | 1–5 | Select Chapters, Gymnastics, Pets, Wardrobe, or Quests dock item |
| Multiple-choice activity | 1–4 | Select answer choices 1–4; enabled only when \`activity.inputMode\` is \`multiple-choice\` |
| Hint-capable activity | H | Request a hint only when \`activity.supportsHints\` is true |
| Dialogue | Enter / Space | Request the next dialogue line |

Escape closes the active overlay; without an overlay it opens Settings. Enter/Space activate a focused native control using browser behavior, or activate a focused custom \`data-primary-action\` control. Otherwise, a dialogue context can advance its line.

## Mouse delegation and safety

A clicked element marked \`data-game-action="namespace/action"\` dispatches that action once. Optional \`data-game-payload\` must be a JSON object. Optional \`data-game-context\` restricts the click to a currently active context; \`data-game-prevent-default="true"\` opts into preventing the browser default.

Shortcuts are ignored while an input, textarea, select, contenteditable region, or textbox is focused. Repeated keydown events, IME composition, keyCode 229, and Ctrl/Meta/Alt combinations are ignored. Native button/link keyboard activation is left to the browser to avoid double actions. \`stop()\` removes both event listeners; context registrations can be independently removed.
