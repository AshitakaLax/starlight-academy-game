# Starlight Academy — Source Project

This repository is a modular JavaScript ES-module source project. The player-facing release is a **single self-contained HTML file** for desktop Chrome and Edge. The delivered file embeds its JavaScript, CSS, vector art, and JSON release data and does not require an internet connection or sibling asset files.

## Current implementation scope

- [x] STEP-01 — Modular source foundation and interface boundaries
- [~] STEP-02 — Build pipeline implemented; npm install/check/test/build pass per user; manual local launch in Chrome and Edge remains to be confirmed
- [x] STEP-03 — Centralized immutable event-driven state store, validated actions, selectors, and scoped subscriptions
- [x] STEP-04 — Versioned save manager, autosave/checkpoints, JSON backup/restore, migrations, and recovery status (npm check/test/build confirmed passing by user)
- [x] STEP-05 — Context-aware keyboard shortcuts and delegated mouse-action routing (user confirmed npm check/test/build pass)
- [~] STEP-06 — Responsive academy hub, accessible settings, text scaling, reduced motion, and save backup controls implemented; verification pending
- [~] STEP-07 — Layered canvas renderer, student and Pegasus scene, high-DPI resize, visibility lifecycle, reduced motion, and masked offscreen texture utility implemented; verification pending
- [~] STEP-08 — User-gesture Web Audio activation, synthesized scene music/effects, separate mixer buses, saved volume/mute settings, and silent fallback implemented; verification pending
- [~] STEP-09 — Opt-in Web Speech narration, voice discovery/default-voice fallback, visible instruction captions, saved voice/speed preferences, interruption/cancel behavior, and music ducking implemented; verification pending

The current HTML includes the academy hub visual shell, five navigation destinations, accessible settings, text scaling, reduced motion, a layered student/Pegasus scene, synthesized audio and mixer controls, optional narrated welcome guidance with visible captions, and local save backup controls. Chapter activities, gymnastics routines, pet interactions, wardrobe customization, and other playable systems are added in later ledger steps; the shell is not yet the completed game.

## Source layout

~~~text
src/
  index.js                 Public source entry point
  browser-entry.js         Browser entry point for the packaged HTML
  app/                     Application bootstrap and lifecycle
  core/
    state/                 Immutable store, actions, selectors, subscription scopes
    save/                  Versioned persistence, import/export, migration and recovery
    input/                 Context-aware keyboard shortcuts and delegated mouse actions
  systems/                 Audio, narration, curriculum, hints, economy
  gameplay/                Chapter runtime, gymnastics, pets, coloring
  chapters/                Data-driven chapter definitions and registry
  side-quests/             Data-driven optional quest definitions and registry
  rendering/               Canvas scenes, sprites, animation and effects
  ui/
    createAcademyShell.js  Responsive hub, settings dialog and save controls
    uiPreferences.js       Accessible presentation preference selectors
    screens/               Semantic DOM screens and controls
    styles.css             CSS embedded in the final HTML
  assets/                  Vector assets embedded by the build
  data/                    Release and game data

build/
  build.mjs                Bundles and validates the offline HTML
  index.template.html      HTML shell with inline CSS/JS insertion points

tests/                     Node built-in tests for foundation, state, save, input, UI, audio/narration, rendering, and build
dist/                       Generated, git-ignored HTML deliverable
~~~

## Dependency rules

1. app/ is the composition root. It wires services together; feature modules must not import the application bootstrap.
2. core/ owns cross-cutting contracts and infrastructure. It must not depend on DOM screens, canvas rendering, or chapter content.
3. The state store is the sole authority for mutable game state. Systems submit validated named actions; no system or renderer mutates a state snapshot directly.
4. systems/ and gameplay/ contain rules and behavior. They communicate through injected services, named actions, events, and documented contracts—not direct mutation of unrelated modules.
5. rendering/ observes state through selectors and renders it. It does not award rewards, change progression, or write saves.
6. ui/ gathers player input and displays state. It dispatches actions and subscribes to selected state; it does not implement curriculum, economy, pet, or chapter rules.
7. chapters/ and side-quests/ provide content definitions and reference shared system APIs; content files do not implement infrastructure.
8. config/ is the source of shared defaults. Tunable values must not be scattered as duplicated constants throughout feature code.
9. Runtime modules must not make network requests. Build-time dependencies are permitted; the produced HTML embeds all runtime JavaScript, CSS, SVG, and JSON data.

## State and subscription rules

- Store snapshots and action payloads are copied, JSON-compatible, and deeply frozen.
- Every action is namespaced and registered with a payload validator and pure reducer. Unknown or invalid actions are rejected before state changes.
- Selectors are the read boundary for UI and rendering. Selector subscriptions notify only when the selected value changes.
- Screen-specific listeners belong to a screen-bound subscription scope. Navigating away disposes that scope automatically; application-wide listeners opt into screenId: null.
- Re-entrant dispatches from subscribers are queued FIFO so a transition finishes before the next transition begins.

See src/core/state/README.md for the store API and usage details.

## Input and navigation rules

- Keyboard shortcuts are registered by screen and overlay context; modal overlays suspend background shortcuts.
- Hub keys 1–5 select the five dock destinations. Multiple-choice activity keys 1–4 select answers only in multiple-choice mode.
- H requests a hint only when the current activity explicitly supports hints. Enter/Space advance dialogue when appropriate or activate a focused primary control.
- Escape closes the current overlay, or opens Settings when no overlay is active.
- Text inputs, textareas, selects, contenteditable regions and textboxes retain normal keyboard behavior. Native buttons and links keep browser-managed activation, preventing duplicate actions.
- Mouse clicks on `data-game-action` controls dispatch named actions once; optional JSON payloads and context gates are validated.

See src/core/input/README.md for context registration, action bindings and event-lifecycle details.

## Save and recovery rules

- Save files use a format identifier, schema version, timestamp, and JSON-compatible state.
- Browser storage is accessed defensively. Unavailable, blocked, full, malformed, or newer-version saves produce a readable save-health status.
- Autosave is debounced. Explicit checkpoints and shutdown flush pending progress.
- Save migrations are registered by source schema version and run before current-schema validation.
- Export produces a portable JSON backup. Import preview does not write; replacing an existing save requires explicit confirmation.
- A failed import or corrupt stored save never deletes or silently overwrites the existing data.
- The academy shell displays save-health status and exposes JSON backup export plus validated import with explicit confirmation. Recovery diagnostics remain visible without silently overwriting existing progress.

See src/core/save/README.md for the persistence API and migration rules.

## Development setup

Requires Node.js 20 or newer.

~~~sh
npm install
npm run check
npm test
npm run build
~~~

The build creates:

~~~text
dist/starlight-academy.html
~~~

Open that file locally in desktop Chrome or Edge. The packaging validator rejects external script references, stylesheet links, remote resource URLs, unexpanded template placeholders, and missing application mount points. The generated dist/ directory is intentionally excluded from source control.

## Build behavior

- JavaScript modules are bundled into one inline browser script with esbuild.
- Project CSS is minified and embedded in one inline style element.
- Imported SVG files are embedded as JavaScript text and inserted as inline vector markup.
- Imported JSON data is bundled into the JavaScript output.
- Runtime modules reachable from the browser entry are bundled automatically, including the synthesized Web Audio engine. Narration code will be included when that system is implemented and connected in STEP-09.
- No runtime network requests, CDN dependencies, external fonts, or external asset files are permitted.

The empty chapter and side-quest registries are intentional scaffolding. Content is added in the corresponding chapter and side-quest ledger steps.
