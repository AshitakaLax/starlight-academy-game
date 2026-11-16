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
- [~] STEP-10 — Stable skill registry, Foundation/Core/Stretch tiers, validated activity contracts, deterministic seeded generators, answer rules, bounded learning evidence, and per-skill mastery records implemented; verification pending
- [~] STEP-11 — Guided-discovery onboarding without placement testing, Core starting tier, and independent bounded per-skill adaptations from rolling correct/assisted evidence implemented; verification pending
- [~] STEP-12 — Activity-specific three-stage hints, Professor Hoot visual/narrated worked examples, retry and deterministic parallel-question paths, and unconditional completion implemented; verification pending
- [~] STEP-13 — Save-backed Star Gem and Starlight Sparkle balances, atomic reward claims, explicit once/capped replay policies, bounded transaction history, and catalog-priced Star Gem purchases implemented; verification pending
- [~] STEP-14 — Cosmetic catalog, starter/chapter/quest/purchase ownership sources, four saved equipment slots, atomic Star Gem purchases, and functional wardrobe inventory UI implemented; verification pending
- [~] STEP-15 — Three garment templates, polygon clipping masks, brush/eraser/stamp tools, bounded undo/redo, reset confirmation, live canvas preview, and compressed save-backed texture designs implemented; verification pending
- [~] STEP-16 — Saved Pegasus, Phoenix, and Nymph Kitten collection with independent unlocks, appearance palettes, bond/care fields, active companion selection, legacy-save defaults, and Pets collection UI implemented; verification pending
- [~] STEP-17 — Optional treat feeding, sparkle grooming, ribbon-toss play, per-pet bounded care meters, positive bond experience, full-meter interactions, and no-decay save behavior implemented; verification pending
- [~] STEP-18 — Centrally configured Pegasus, Phoenix, and Nymph Kitten care abilities with one active bonus following the selected companion, no stacking, and strict isolation from curriculum/answer rules implemented; verification pending\n- [~] STEP-19 — Data-driven Starlight Ribbon Waltz with preview/count-in, mouse tracing, forgiving beat checkpoints, separate trace/rhythm scoring, configurable combined score/stars, and save-backed personal bests implemented; verification pending\n- [~] STEP-20 — Chapter-specific activity sequences, prerequisite validation, safe saved checkpoints, skip-without-fail outcomes, replay records, and once-only major reward hooks implemented; verification pending
- [~] STEP-21 — Chapter 1 vertical slice: Lantern Tree story, tiered skip-counting lesson, three-question multiplication relay, ribbon trace-and-rhythm routine, Professor Hoot hints, and one-time keepsake reward implemented; local playtest pending
- [~] STEP-22 — Chapter 1 source review, shortcut corrections, and regression coverage implemented; live Chrome/Edge and learner playtest still required
- [~] STEP-23 — Apollo's Musical Fractions: tiered fraction-bar identification, equivalent-fraction challenge, Professor Hoot demonstrations, Chapter 1 prerequisite, checkpoint resume, and once-only Harmony Medallion reward implemented; local npm and browser verification pending

The current HTML includes the academy hub visual shell, five navigation destinations, the first two playable chapters, accessible settings, text scaling, reduced motion, a layered student/Pegasus scene, synthesized audio and mixer controls, optional narrated guidance with visible captions, and local save backup controls. Chapter 1 connects its story scenes, tiered skip-counting and multiplication questions, staged Professor Hoot hints, the existing gymnastics routine, save-backed checkpoints, a once-only currency reward, and the chapter-exclusive Comet Dance Dress unlock. Chapter 2 adds Apollo's fraction mosaics and equivalent-fraction challenge, accessible segmented fraction bars, tiered deterministic questions, fraction-specific Professor Hoot demonstrations, a Chapter 1 prerequisite, resumable checkpoints, and a once-only Harmony Medallion reward. The Pet and Wardrobe studios remain available alongside the chapter. This is an integration prototype, not yet the completed game. Curriculum services begin new players at Core without a placement quiz and retain independent skill tiers as evidence accumulates. The hint framework offers activity-authored nudges, strategies, and Professor Hoot demonstrations, with retry or parallel-question recovery and no hint-based completion gate. The economy keeps Star Gems spendable and Starlight Sparkles achievement-only; reward claims are one-time or replay-capped, and shop items use catalog-defined Star Gem prices. The wardrobe includes starter equipment, chapter-locked cosmetics, optional Star Gem purchases, and a saved inventory/equipment panel. Its Coloring Studio adds clipped garment painting, stamps, undo/redo, confirmed reset, live preview, and compact save-backed designs. The Pets destination now contains a saved three-companion collection with independent unlocks and appearances, optional treat feeding, sparkle grooming, ribbon play, and positive-only care and bond progression; their unique care abilities follow the active companion without stacking or changing educational difficulty or answer correctness. The Gymnastics Studio now includes a playable ribbon-tracing and rhythm routine with independent saved scores and forgiving, non-failing beat timing. The chapter runtime supports chapter-owned activity sequences, prerequisite gating, resumable checkpoints, safe exits, replays, and one-time chapter reward claims. The chapter registry currently contains Chapters 1 and 2; Chapters 3–10 and the 20 side quests remain content work.

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

tests/                     Node built-in tests for foundation, state, save, input, UI, audio/narration, curriculum, hints, Chapters 1–2, rendering, and build
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
- Hub keys 1–5 select the five dock destinations. In chapter learning and challenge activities, keys 1–4 select the correspondingly numbered visible answer; H requests a hint. These shortcuts are inactive during stories, gymnastics, text entry, or modal dialogs.
- Enter/Space activate focused native controls or advance dialogue when appropriate. Chapter answer choices are native buttons, so Tab and Enter work as well as the number shortcuts.
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

The GitHub Actions workflow in `.github/workflows/ci.yml` runs the same syntax check, Node regression suite, and standalone HTML build on pushes to the implementation branch or `main`, and on pull requests targeting `main`.

Open that file locally in desktop Chrome or Edge. The packaging validator rejects external script references, stylesheet links, remote resource URLs, unexpanded template placeholders, and missing application mount points. The generated dist/ directory is intentionally excluded from source control.

## Build behavior

- JavaScript modules are bundled into one inline browser script with esbuild.
- Project CSS is minified and embedded in one inline style element.
- Imported SVG files are embedded as JavaScript text and inserted as inline vector markup.
- Imported JSON data is bundled into the JavaScript output.
- Runtime modules reachable from the browser entry are bundled automatically, including the synthesized Web Audio engine and optional Web Speech narration.
- No runtime network requests, CDN dependencies, external fonts, or external asset files are permitted.

The chapter registry is populated incrementally as each chapter reaches its ledger step. The side-quest registry remains intentional scaffolding until its corresponding content steps.
