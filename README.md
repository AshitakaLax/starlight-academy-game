# Starlight Academy — Source Project

This repository is organized as a modular JavaScript ES-module source project. The eventual player-facing release is a **single self-contained HTML file** that runs offline in desktop Chrome and Edge. Build and packaging are intentionally deferred to implementation step `STEP-02`.

## Current implementation scope

`STEP-01` establishes the project structure, module responsibilities, and stable interfaces. It does not yet implement the state store, input handling, persistence, gameplay, rendering, or user interface. Those are later ledger steps and will be added behind the contracts documented in `src/core/contracts.d.ts`.

## Source layout

```text
src/
  index.js                 Public source entry point
  app/                     Application bootstrap and lifecycle
  core/
    contracts.d.ts           Shared service and system contracts
    state/                 Authoritative game state boundary
    input/                 Mouse/keyboard input boundary
    save/                  Persistence and import/export boundary
  systems/                 Shared audio, narration, curriculum, hints, economy
    audio/ narration/ curriculum/ hints/ economy/
  gameplay/                Player-facing activities and chapter runtime
    chapter-runtime/ gymnastics/ pets/ coloring/
  rendering/               Canvas scenes, sprites, animation and effects
    canvas/
  ui/                      Semantic DOM screens and controls
    screens/
  chapters/                Data-driven chapter definitions
  side-quests/             Data-driven optional quest definitions
  config/                  Centralized game configuration

tests/                     Node built-in tests for source foundation
```

## Dependency rules

1. `app/` is the composition root. It wires services together; feature modules must not import the application bootstrap.
2. `core/` owns cross-cutting contracts and infrastructure. It must not depend on DOM screens, canvas rendering, or chapter content.
3. `systems/` and `gameplay/` contain rules and behavior. They communicate through injected services, named actions, events, and documented contracts—not direct mutation of unrelated modules.
4. `rendering/` observes presentation state and renders it. It does not award rewards, change progression, or write saves.
5. `ui/` gathers player input and displays state. It does not implement curriculum, economy, pet, or chapter rules.
6. `chapters/` and `side-quests/` provide content definitions and reference shared system APIs; content files do not implement infrastructure.
7. `config/` is the source of shared defaults. Tunable values must not be scattered as duplicated constants throughout feature code.
8. Runtime modules must not make network requests. The later build step embeds runtime code and assets into the single HTML deliverable.

## Development checks

Requires Node.js 20 or newer. No third-party packages are required for this foundation step.

```sh
npm test
npm run check
```

## Implementation status

- [x] `STEP-01` — Modular source foundation and interface boundaries
- [ ] `STEP-02` — Single-file offline build and packaging pipeline

The empty chapter and side-quest registries are intentional scaffolding. Content is added in the corresponding chapter and side-quest ledger steps.
