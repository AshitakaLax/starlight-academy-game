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
- [~] STEP-18 — Centrally configured Pegasus, Phoenix, and Nymph Kitten care abilities with one active bonus following the selected companion, no stacking, and strict isolation from curriculum/answer rules implemented; verification pending
- [~] STEP-19 — Data-driven Starlight Ribbon Waltz with preview/count-in, mouse tracing, forgiving beat checkpoints, separate trace/rhythm scoring, configurable combined score/stars, and save-backed personal bests implemented; verification pending
- [~] STEP-20 — Chapter-specific activity sequences, prerequisite validation, safe saved checkpoints, skip-without-fail outcomes, replay records, and once-only major reward hooks implemented; verification pending
- [~] STEP-21 — Chapter 1 vertical slice: Lantern Tree story, tiered skip-counting lesson, three-question multiplication relay, ribbon trace-and-rhythm routine, Professor Hoot hints, and one-time keepsake reward implemented; local playtest pending
- [~] STEP-22 — Chapter 1 source review, shortcut corrections, and regression coverage implemented; live Chrome/Edge and learner playtest still required
- [~] STEP-23 — Apollo's Musical Fractions: tiered fraction-bar identification, equivalent-fraction challenge, Professor Hoot demonstrations, Chapter 1 prerequisite, checkpoint resume, and once-only Harmony Medallion reward implemented; CI syntax check, all 234 regression tests, and standalone HTML build passed; live browser/learner playtest pending
- [~] STEP-24 — Spellbook of Spelling & Root Words: curated Foundation/Core/Stretch word bank, prefix and suffix word-building, contextual potion challenge, spelling-change guidance, Professor Hoot demonstrations, Chapter 2 prerequisite, checkpoints, and once-only Lexicon Lantern reward implemented; CI syntax checks, all 240 regression tests, and standalone HTML build passed; live browser/learner playtest pending
- [~] STEP-25 — Geometry on the Balance Beam: tiered shape properties, lines of symmetry, angle classification, perimeter and area measurement, accessible geometry diagrams, Professor Hoot demonstrations, Chapter 3 prerequisite, checkpoints, and once-only Geometry Star Pin reward implemented; CI syntax checks, all 246 regression tests, and standalone HTML build passed; live browser/learner playtest pending
- [~] STEP-26 — Artemis and the Magical Habitats: six curated creature/biome clues, structural and behavioral adaptation classification, survival-purpose reasoning, ecosystem connections, accessible clue cards, Professor Hoot demonstrations, Chapter 4 prerequisite, checkpoints, and once-only Wildlife Compass reward implemented; desktop browser and learner playtest pending
- [~] STEP-27 — Demeter's Enchanted Greenhouse: tiered flowering-plant life-cycle sequencing, scenario-based water/sunlight/carbon dioxide/mineral-nutrient choices, consistent photosynthesis inputs and outputs, accessible stage/resource cards, Professor Hoot demonstrations, Chapter 5 prerequisite, checkpoints, and once-only Sunrise Seed Satchel reward implemented; desktop browser and learner playtest pending
- [~] STEP-28 — Athena's Logic & Word Wizardry: curated noun/verb/adjective/adverb sentences, tiered main-idea and inference passages with verified answer keys, accessible highlighted-word and passage cards, Professor Hoot demonstrations, Chapter 6 prerequisite, checkpoints, and once-only Athena's Quill reward implemented; desktop browser and learner playtest pending
- [~] STEP-29 — Poseidon's Volume & Measurement Lab: tiered beaker graduations, balanced mass problems, metric length/capacity/mass conversions, elapsed-time clock challenges, accessible measurement cards, Professor Hoot demonstrations, Chapter 7 prerequisite, checkpoints, and once-only Poseidon's Tideglass reward implemented; desktop browser and learner playtest pending
- [~] STEP-30 — The Chimera's Multi-Step Challenge: exact-quotient equal-group division, tiered multi-digit addition/subtraction/multiplication, two- and three-step word problems with verified operation sequences, accessible calculation/story cards, Professor Hoot demonstrations, Chapter 8 prerequisite, checkpoints, and once-only Chimera's Strategy Stone reward implemented; desktop browser and learner playtest pending
- [~] STEP-31 — The Grand Starlight Championship: a 12-event cumulative sampler balanced across mathematics, science, and language arts; reused chapter question generators and hints; Starlight Ribbon performance; live character, outfit, companion, and gymnastics showcase; Chapter 9 prerequisite; resumable checkpoints; and once-only Grand Starlight Crown implemented; desktop browser and learner playtest pending
- [~] STEP-32 — Chapter 1 side quests: optional Firefly Gap Maze skip-counting mastery extension and Moonberry Picnic Planner multiplication application; separate tiered generators, Professor Hoot hints, completion/replay records, Chapter 1 unlock, and once-only quest rewards implemented; live browser/learner validation pending
- [~] STEP-33 — Chapter 2 side quests: The Fraction Family Outlier mastery extension and Fractions in the Celestial Amphitheater story application; independent tiered generators, accessible fraction-bar models, Professor Hoot hints, Chapter 2 unlock gating, saved completion/replay records, and once-only rewards implemented; live browser/learner validation pending
- [~] STEP-42 — Quest Board & Stars: all ten chapters and twenty optional quests appear with unlock/completion status, replay controls, skill mastery records, three-star personal-best scores, and lifetime-best preservation; regression tests cover replay improvements, save restoration, and once-only rewards; live browser/learner validation pending

The current HTML includes the academy hub visual shell, five navigation destinations, the first ten playable chapters, accessible settings, text scaling, reduced motion, a layered student/Pegasus scene, synthesized audio and mixer controls, optional narrated guidance with visible captions, and local save backup controls. Chapter 1 connects its story scenes, tiered skip-counting and multiplication questions, staged Professor Hoot hints, the existing gymnastics routine, save-backed checkpoints, a once-only currency reward, and the chapter-exclusive Comet Dance Dress unlock. Chapter 2 adds Apollo's fraction mosaics and equivalent-fraction challenge, accessible segmented fraction bars, tiered deterministic questions, fraction-specific Professor Hoot demonstrations, a Chapter 1 prerequisite, resumable checkpoints, and a once-only Harmony Medallion reward. Chapter 3 adds a curated 17-word lexicon, prefix and suffix word-building stations, sentence-context potion clues, an explicit final-e spelling note for reusable, three-stage Professor Hoot demonstrations, a Chapter 2 prerequisite, resumable checkpoints, and a once-only Lexicon Lantern reward. Chapter 4 adds tiered shape-property and symmetry questions, measured angle diagrams, rectangle perimeter and area grids, geometry-specific Professor Hoot demonstrations, a Chapter 3 prerequisite, resumable checkpoints, and a once-only Geometry Star Pin reward. Chapter 5 adds a six-creature wildlife field guide, biome matching, structural and behavioral adaptation classification, survival-purpose questions, ecosystem connections, habitat-specific Professor Hoot demonstrations, a Chapter 4 prerequisite, resumable checkpoints, and a once-only Wildlife Compass reward. Chapter 6 adds a five-stage flowering-plant life cycle, tiered next-stage sequencing, scenario-based greenhouse resource choices, a photosynthesis challenge that distinguishes sunlight, water, and carbon dioxide inputs from oxygen and mineral nutrients, plant-specific Professor Hoot demonstrations, a Chapter 5 prerequisite, resumable checkpoints, and a once-only Sunrise Seed Satchel reward. Chapter 7 adds curated grammar sentences for nouns, verbs, adjectives, and adverbs, short reading passages with passage-specific main-idea and inference answer keys, accessible highlighted-word and reading cards, Athena-specific Professor Hoot demonstrations, a Chapter 6 prerequisite, resumable checkpoints, and a once-only Athena's Quill of Clarity reward. Chapter 8 adds graduated-beaker volume readings, balanced gram-weight mass problems, verified metric conversions for length/capacity/mass, elapsed-time questions using start and finish times, accessible measurement visuals, Poseidon-specific Professor Hoot demonstrations, a Chapter 7 prerequisite, resumable checkpoints, and a once-only Poseidon's Tideglass reward. Chapter 9 adds exact equal-sharing division, tiered multi-digit addition/subtraction/multiplication, curated multi-step word problems with independently verified operation sequences, accessible division/calculation/story cards, Chimera-specific Professor Hoot demonstrations, a Chapter 8 prerequisite, resumable checkpoints, and a once-only Chimera's Strategy Stone reward. Chapter 10 adds a balanced 12-event cumulative sampler with four mathematics, four science, and four language-arts questions, reusing each activity's established question generator and Professor Hoot hints. Its finale includes the Starlight Ribbon routine, a live showcase of the academy character, equipped wardrobe, active companion and care progress, saved gymnastics score, a Chapter 9 prerequisite, resumable checkpoints, and the once-only Grand Starlight Crown. Two optional Chapter 1 side quests now extend the main adventure without adding required steps: the Firefly Gap Maze strengthens skip-counting with missing interior terms, and the Moonberry Picnic Planner applies multiplication to equal-group stories. Each has its own tiered generator, Professor Hoot hints, saved completion/replay history, and once-only reward. Two optional Chapter 2 quests also extend Apollo's fraction adventures without adding required steps: The Fraction Family Outlier spots a non-equivalent tile among matching fractions, and Fractions in the Celestial Amphitheater turns music, ribbon, tart, and star-chart stories into fractions of a whole. Both include tiered generators, accessible fraction bars, Professor Hoot hints, independent progress, and once-only rewards. Two optional Chapter 3 quests extend the spellbook lessons: The Morphology Looking Glass asks learners to analyze curated prefix/root/suffix structures, and The Missing Word Library applies word meanings and sentence context to restore missing words. Both use the 17-word curated lexicon, tiered deterministic generators, three-stage Professor Hoot hints, independent saved progress, and once-only rewards. Two optional Chapter 4 quests extend the geometry adventure: The Sky Gallery Shape Riddles combines side, angle, and symmetry clues to identify shapes, and The Balance Beam Builders applies perimeter and area to practical platform stories. Both include tiered deterministic questions, geometry visuals, three-stage Professor Hoot hints, independent saved progress, and once-only rewards. Two optional Chapter 5 quests extend Artemis's sanctuary investigations: The Adaptation Pair Detective identifies animals from two matching field observations, while The Ecosystem Cause Tracker infers animal actions from recorded habitat effects. Both use the curated habitat lexicon, tiered deterministic generators, three-stage Professor Hoot hints, saved progress, and once-only rewards. Two optional Chapter 6 quests extend Demeter's greenhouse: The Life-Cycle Time Traveler reasons backward from a plant stage, and The Greenhouse Recipe Restorer completes partially filled photosynthesis recipes from greenhouse clues. Both use curated plant-science data, tiered deterministic questions, distinct Professor Hoot hints, independent saved progress, and once-only rewards. Two optional Chapter 7 quests extend Athena's language library: The Grammar Twin Detective compares highlighted words from separate sentences to find their shared part of speech, while The Evidence Matchmaker selects the strongest text detail for a stated inference. Both use the curated grammar and reading banks, tiered deterministic questions, dedicated Professor Hoot hints, independent saved progress, and once-only rewards. Two optional Chapter 8 quests extend Poseidon's measurement lab: The Metric Mislabel Mystery audits four conversion cards to find one incorrect result, while The Harbor Cargo Calculator combines the measured masses of two separate objects for a shipment total. Both reuse the verified measurement lexicon, provide tiered deterministic questions and dedicated Professor Hoot hints, and keep independent saved progress with once-only rewards. Two optional Chapter 9 quests extend the Chimera's puzzle workshop: The Chimera's Operation Blueprint asks learners to identify the correct order of operations from a curated story, while The Workshop Supply Planner applies tiered addition, multiplication, subtraction, and equal-sharing division to new supply scenarios. Both provide deterministic tiered questions, dedicated three-stage Professor Hoot hints, independent saved progress, checkpoint/resume/replay, and once-only rewards; Chapter 10 remains accessible without either optional quest. Two optional Chapter 10 quests complete the academy's twenty-quest collection: The Starlight Skill Matchmaker connects clues from mathematics, science, and language arts to the championship stars that use those skills, while The Grand Constellation Planner calculates the missing or replacement selections needed to balance four stars in each subject. Both use tiered deterministic questions, dedicated Professor Hoot hints, independent saved progress, safe checkpoint/replay, and once-only rewards; neither changes the required championship sequence. The Pet and Wardrobe studios remain available alongside the chapters.  This is an integration prototype, not yet the completed game. Curriculum services begin new players at Core without a placement quiz and retain independent skill tiers as evidence accumulates. The hint framework offers activity-authored nudges, strategies, and Professor Hoot demonstrations, with retry or parallel-question recovery and no hint-based completion gate. The economy keeps Star Gems spendable and Starlight Sparkles achievement-only; reward claims are one-time or replay-capped, and shop items use catalog-defined Star Gem prices. The wardrobe includes starter equipment, chapter-locked cosmetics, optional Star Gem purchases, and a saved inventory/equipment panel. Its Coloring Studio adds clipped garment painting, stamps, undo/redo, confirmed reset, live preview, and compact save-backed designs. The Pets destination now contains a saved three-companion collection with independent unlocks and appearances, optional treat feeding, sparkle grooming, ribbon play, and positive-only care and bond progression; live palette changes repaint the animated pet character and survive save/restore; their unique care abilities follow the active companion without stacking or changing educational difficulty or answer correctness. Pegasus, Phoenix, and Nymph Kitten each appear as an animated little character, with a distinct happy reaction to treats, grooming, and ribbon play. The Gymnastics Studio now includes a playable ribbon-tracing and rhythm routine with independent saved scores and forgiving, non-failing beat timing. The chapter runtime supports chapter-owned activity sequences, prerequisite gating, resumable checkpoints, safe exits, replays, and one-time chapter reward claims. The chapter registry currently contains Chapters 1–10; 20 of 20 optional side quests are playable; all optional quest content is implemented. Shared startup and test-time content validation checks all 30 adventures, curriculum links, unique IDs, registered generators, hints, skill IDs, and reward sources. The Quest Board & Stars destination brings all 30 adventures together with live unlock and completion status, saved skill mastery records, replay actions, three-star personal-best scores, and a lifetime-best record that lower replays cannot overwrite. Chapter and quest reward claims continue to obey their registered replay caps.

## Source layout

~~~text
src/
  index.js                 Public source entry point
  browser-entry.js         Browser entry point for the packaged HTML
  app/                     Application bootstrap and lifecycle
  validation/              Shared content registry construction and release contracts
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

tests/                     Node built-in tests for foundation, state, save, input, UI, audio/narration, curriculum, hints, Chapters 1–10, Side Quests 1–20, rendering, build, and integrated academy playthroughs
scripts/                   Offline packaged-browser QA for Chrome and Edge
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

The GitHub Actions workflow in `.github/workflows/ci.yml` runs the syntax check, Node regression suite, and standalone HTML build on pushes to the implementation branch or `main`, and on pull requests targeting `main`. A Windows browser-QA job also opens the built HTML by its local `file://` URL in branded Google Chrome and Microsoft Edge with network access disabled, then exercises chapter play, hints, quest unlocks, companion care, wardrobe purchases, save export/import, and restored progress.

Open that file locally in desktop Chrome or Edge. The packaging validator rejects external script references, stylesheet links, remote resource URLs, unexpanded template placeholders, and missing application mount points. The generated dist/ directory is intentionally excluded from source control.

## Build behavior

- JavaScript modules are bundled into one inline browser script with esbuild.
- Project CSS is minified and embedded in one inline style element.
- Imported SVG files are embedded as JavaScript text and inserted as inline vector markup.
- Imported JSON data is bundled into the JavaScript output.
- Runtime modules reachable from the browser entry are bundled automatically, including the synthesized Web Audio engine and optional Web Speech narration.
- No runtime network requests, CDN dependencies, external fonts, or external asset files are permitted.

The chapter registry contains all ten chapters. The side-quest registry contains two optional quests for each chapter. The same content-registration factory is used by browser startup and automated contract tests, so missing generator, hint, skill, activity, or reward references fail before play begins. The cross-system integration suite runs all chapter and quest completions through the real runtime, verifies reward and cosmetic behavior, saves and restores the academy, and checks hint, mastery, pet-care, and gymnastics flows.

## Offline browser QA

The release build is tested as a local file in Chrome and Edge, not only through Node tests. The Windows CI job launches both browsers with network access disabled and verifies that no external requests or uncaught browser errors occur. It also completes a Chapter 1 run, requests a Professor Hoot hint, checks optional quest unlocks, changes companion care and wardrobe state, exports and imports a JSON backup, and starts a fresh browser context from the saved data.

To run the browser checks locally, install Python Playwright and the desired browser channel:

~~~sh
python -m pip install playwright
python -m playwright install chrome
~~~ 

Then build and run the test against the exact standalone file:

~~~sh
npm run build
BROWSER_CHANNEL=chrome HTML_PATH=dist/starlight-academy.html REQUIRE_FILE_URL=1 python scripts/offline-browser-qa.py
~~~

For Microsoft Edge, use `BROWSER_CHANNEL=msedge` and install it with `python -m playwright install msedge`. The test has an optional `BROWSER_EXECUTABLE` setting for a locally installed Chromium binary. On hosts that block local-file navigation, it can fall back to loading the same built HTML bytes into an offline browser document; the Windows CI job does not permit that fallback.


## Versioned release packaging

The current source release version is **0.1.0**. Create the standalone game and complete release folder with:

~~~sh
npm install
npm run check
npm test
npm run package
npm run verify-release
~~~

The release folder is written to `dist/release-v0.1.0/` and contains:

- `starlight-academy-v0.1.0.html` — the complete, self-contained offline game.
- `starlight-academy-source-v0.1.0.zip` — a ZIP snapshot of the exact source commit.
- `release-manifest.json` — version, source commit, browser targets, content counts, sizes, and SHA-256 hashes.
- `SHA256SUMS.txt` — checksums for the HTML, source archive, manifest, and release notes.
- `RELEASE-README.txt` — local opening and rebuild instructions.

The CI release artifact is named `starlight-academy-release-v0.1.0`. Verify the checksums from the release folder with `sha256sum -c SHA256SUMS.txt` on Linux/macOS or an equivalent SHA-256 tool on Windows.
