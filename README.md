# Starlight Academy — Source Project

This repository is a modular JavaScript ES-module source project. The player-facing release is a **single self-contained HTML file** for desktop Chrome and Edge. The delivered file embeds its JavaScript, CSS, vector art, and JSON release data and does not require an internet connection or sibling asset files.

## Current implementation scope

- [x] STEP-01 — Modular source foundation and interface boundaries
- [~] STEP-02 — Build pipeline implemented; npm install/check/test/build pass; manual local launch in Chrome and Edge remains to be confirmed
- [x] STEP-03 — Centralized immutable event-driven state store, validated actions, selectors, and scoped subscriptions

The current HTML is an offline launch shell demonstrating the packaged project foundation and the state store's UI subscription boundary. Game screens and playable systems are added in their later ledger steps; the shell is not yet the completed game.

## Source layout

~~~text
src/
  index.js                 Public source entry point
  browser-entry.js         Browser entry point for the packaged HTML
  app/                     Application bootstrap and lifecycle
  core/
    state/                 Immutable store, actions, selectors, subscription scopes
    input/                 Context-aware keyboard and mouse routing boundary
    save/                  Versioned local persistence boundary
  systems/                 Audio, narration, curriculum, hints, economy
  gameplay/                Chapter runtime, gymnastics, pets, coloring
  chapters/                Data-driven chapter definitions and registry
  side-quests/             Data-driven optional quest definitions and registry
  rendering/               Canvas scenes, sprites, animation and effects
  ui/
    screens/               Semantic DOM screens and controls
    styles.css             CSS embedded in the final HTML
  assets/                  Vector assets embedded by the build
  data/                    Release and game data embedded by the build

build/
  build.mjs                Bundles and validates the offline HTML
  index.template.html      HTML shell with inline CSS/JS insertion points

tests/                     Node built-in tests for foundation, state, and build
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
- Runtime modules reachable from the browser entry are bundled automatically; synthesized audio/narration code will be included when those systems are implemented and connected in their later ledger steps.
- No runtime network requests, CDN dependencies, external fonts, or external asset files are permitted.

The empty chapter and side-quest registries are intentional scaffolding. Content is added in the corresponding chapter and side-quest ledger steps.
