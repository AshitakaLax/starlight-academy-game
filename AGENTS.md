# AGENTS.md

Guidance for coding agents and contributors working in Starlight Academy. These instructions apply to the entire repository. Follow any more-specific `AGENTS.md` added in a subdirectory as well; keep it consistent with these project-wide rules.

## 1. Start with the project context

Before changing code or content:

1. Read `README.md` for the current project shape, setup, build, browser QA, and release commands.
2. Read `detailed_implementation_plan.md` for product requirements and intended architecture.
3. Read `implementation_ledger.md` to understand what is implemented, what is still pending, and the acceptance criteria for the next increment.
4. Read the relevant module README, nearby implementation, and tests. For learner-facing changes, also review the matching brief or notes under `docs/playtests/`.

Treat the implementation plan as the product/architecture reference and the ledger as the progress record. Do not mark work complete just because code exists: distinguish automated coverage, desktop-browser verification, and observed learner playtesting. Update the ledger or relevant documentation when a meaningful implementation step changes its status or acceptance evidence.

## 2. Project at a glance

Starlight Academy is a modular JavaScript ES-module project. Its player-facing deliverable is one self-contained HTML file for desktop Google Chrome and Microsoft Edge. The HTML embeds its JavaScript, CSS, SVG artwork, and JSON data and must work locally without a server, sibling assets, or network access.

- Runtime source: `src/`
- Browser bootstrap: `src/browser-entry.js`
- Public source exports: `src/index.js`
- Build template and bundler: `build/`
- Shared configuration: `src/config/`
- Content registries and contracts: `src/validation/`
- Chapter content: `src/chapters/`
- Optional side quests: `src/side-quests/`
- Automated tests: `tests/`
- Browser QA: `scripts/offline-browser-qa.py`
- Release packaging: `scripts/package-release.mjs`
- Browser/build CI: `.github/workflows/ci.yml`
- Learner playtest records: `docs/playtests/`

The release currently targets ten chapters and twenty optional side quests. Check the registries and release manifest rather than duplicating content counts or assuming a feature is complete.

## 3. Development environment and commands

Use Node.js 20 or newer and npm. Install dependencies with:

```sh
npm install --no-audit --no-fund
```

Run the repository's verification commands after relevant changes:

```sh
npm run check
npm test
npm run build
```

What they do:

- `npm run check` runs the configured JavaScript syntax checks for application, source, build, test, and release-script files.
- `npm test` runs the Node.js built-in test suite (`node --test`).
- `npm run build` creates and validates `dist/starlight-academy.html`, the single-file offline game.

For a release-package verification, use:

```sh
npm run package
npm run verify-release
```

The package command builds the HTML and writes `dist/release-v<version>/`. The generated `dist/` directory is ignored by Git; change source files, templates, or scripts rather than hand-editing build output.

### Browser QA

The final HTML—not just source modules or a development server—must be checked in the supported desktop browsers for user-facing changes. The GitHub Actions workflow runs offline Playwright QA on Windows, opens the local `file://` artifact in branded Chrome and Edge with network access disabled, and exercises representative gameplay, save/restore, and system integration.

For a local Chrome run, install Python Playwright and its browser as described in `README.md`, then run:

```sh
npm run build
BROWSER_CHANNEL=chrome HTML_PATH=dist/starlight-academy.html REQUIRE_FILE_URL=1 python scripts/offline-browser-qa.py
```

For Edge, use `BROWSER_CHANNEL=msedge` and install the Edge Playwright browser. Keep the CI `REQUIRE_FILE_URL=1` behavior: a network-served page is not a substitute for verifying the actual local-file release.

## 4. Architecture and ownership boundaries

Keep dependencies flowing toward stable contracts. Prefer small modules, explicit inputs, injected services, and documented interfaces.

| Area | Owns | Must not do |
| --- | --- | --- |
| `core/` | State, persistence, and input infrastructure | Depend on DOM screens, canvas rendering, chapters, or feature content |
| `systems/` | Reusable curriculum, hints, economy, audio, and narration rules | Query the DOM, draw to canvas, or import chapter definitions |
| `gameplay/` | Reusable player activities and feature-specific state/actions | Mutate unrelated systems or own global persistence/currency rules |
| `chapters/`, `side-quests/` | Data-driven story/activity definitions and references to shared APIs | Reimplement infrastructure or duplicate shared system rules |
| `rendering/` | Visual scene/canvas rendering from selected state | Award rewards, change progression, or write saves |
| `ui/` | Semantic DOM, controls, settings, accessible feedback, and focus | Implement curriculum, reward, pet-ability, or other gameplay rules |
| `config/` | Shared defaults and tunable values | Become a second source of feature logic |
| `validation/` | Cross-registry and content contracts | Silently repair invalid authored content |

Additional rules:

- Inject dependencies into service factories; avoid hidden global singletons and circular imports.
- Keep stable public exports in `src/index.js` intentional. Add exports when a module is part of the supported source API, not merely to make tests convenient.
- Place a new feature in the layer that owns its behavior. Add or update that layer's README when its public contract or responsibilities change.
- Centralize tunable values in the relevant configuration/catalog. Do not scatter duplicate prices, reward amounts, timing thresholds, difficulty limits, or content IDs.
- Keep rendering decorative. Essential instructions, questions, feedback, scores, and controls belong in accessible DOM content.

## 5. State, actions, and persistence

The game store is the sole authority for mutable game state.

- Read state through selectors and immutable snapshots; never mutate a snapshot or nested state directly.
- Change state through registered, namespaced actions with payload validation and deterministic, side-effect-free reducers.
- Keep reducers pure. Perform browser APIs, I/O, audio, and other effects in services or UI adapters, then dispatch validated outcomes.
- Keep action payloads and persisted state JSON-compatible. Do not place DOM nodes, functions, class instances, or live canvas objects in saves.
- Use selector subscriptions for consumers. Dispose screen-scoped subscriptions when their screen is left; retain and call unsubscribe functions for unscoped subscriptions.
- Preserve deterministic ordering and avoid re-entrant state transitions; the store's queued dispatch behavior is part of its contract.

For save changes, preserve the versioned envelope and migration chain. Normalize older saves through the existing default-merge/migration paths. Validate imports before writing, require explicit confirmation before replacing an existing save, and never erase or silently overwrite recoverable data after a failed import. Add tests for current and legacy saves, malformed input, and relevant storage failures.

See `src/core/state/README.md`, `src/core/save/README.md`, and `src/core/input/README.md` before changing those contracts.

## 6. Curriculum, content, and player experience

- Keep curriculum logic independent of chapter navigation, DOM, and rendering. Use stable skill IDs, explicit learning objectives, activity contracts, registered answer rules, and registered generators.
- Question generation must be deterministic for the same inputs/seed. Use the existing seeded generator and curated lexicons where applicable; do not use unseeded randomness in testable content paths.
- Keep Foundation, Core, and Stretch behavior within each activity's declared supported tiers. Adaptive difficulty is based on each skill's bounded evidence, not response speed.
- Author hints for the activity and its misconception. Hints support learning; they must not decide correctness, directly grant mastery, or make completion conditional on using a hint.
- Test answer keys, distractors, boundaries, and generated variations. Math, measurement, grammar, science, and reading content must have defensible answers and unambiguous wording.
- Keep progression forgiving: no perfect-score completion gates, punitive failure loops, lost progress, or automatic care decay. Skipped activities are recorded as skipped rather than treated as a hard failure.
- Preserve prerequisites, safe checkpoints, replay history limits, and catalog-defined once-only/replay-capped reward policies. Never let a replay duplicate a once-only reward or bypass a prerequisite.

Use the relevant playtest notes and content lexicons when editing learner-facing material. Keep all essential instructions visible as text even when narration or visual effects are available.

## 7. Accessibility, input, audio, and offline constraints

These are product requirements, not optional polish:

- Use semantic native controls where practical, meaningful labels, visible keyboard focus, readable status feedback, and sensible focus placement/restoration.
- Do not rely on color alone. Respect saved text-scale and reduced-motion preferences.
- Preserve mouse and keyboard paths. Contextual shortcuts must be inactive in the wrong screen/overlay and ignored while text-entry controls are focused. Do not double-trigger native button/link keyboard activation.
- Narration and audio are optional enhancements. Every spoken instruction must have a readable equivalent; missing browser voice/audio support must not block play.
- Start Web Audio only when permitted by browser user-gesture policies. Audio controls and mute behavior must remain independent and safe when audio is unavailable.
- Do not add runtime network requests, remote APIs, analytics, CDNs, web fonts, external scripts/styles, or externally hosted media. Do not introduce a service worker or server requirement for the player-facing build.
- Keep the offline release self-contained. Imported SVG and JSON assets must be bundled/embedded by the build pipeline, not left as sibling file dependencies.

## 8. Testing expectations

Add or update tests with the behavior; do not rely on manual inspection alone.

- Tests use Node's built-in `node:test` runner and `node:assert/strict`. Follow neighboring test naming and fixture patterns.
- Prefer focused unit tests for reducers, selectors, services, generators, and validation contracts, plus integration tests when behavior crosses systems.
- Cover success and rejection paths, boundary values, deterministic output, replay/idempotency, save restoration, and input/focus/overlay constraints as relevant.
- When changing a registered activity, chapter, or quest, update content validation and its corresponding test coverage. Keep registries, generator IDs, skill IDs, hint IDs, reward IDs, and prerequisite references consistent.
- For browser-facing changes, run the standalone build and confirm the relevant flows in Chrome and Edge offline. Use the existing Playwright script and CI workflow rather than inventing a separate test harness without need.
- When a check cannot be run in the current environment, say so explicitly. Never report automated browser QA as a human learner playtest.

A meaningful implementation step is not complete until its acceptance criteria and regression evidence are recorded accurately in `implementation_ledger.md`. Keep open manual learner observations open until someone has actually performed and recorded them.

## 9. Release and versioning safeguards

The package version in `package.json` is the source of truth for local release directory and filenames. Do not bump it as part of an unrelated change. A deliberate version bump must also update versioned references such as the CI artifact name in `.github/workflows/ci.yml` and the current release instructions in `README.md`.

Important: `scripts/package-release.mjs` creates the source ZIP with `git archive ... HEAD`. That archive contains the committed snapshot, not uncommitted or untracked working-tree changes. Therefore:

1. Finish and commit the intended source changes first.
2. Build/package from the commit intended for release.
3. Verify `npm run verify-release` and the SHA-256 checksums.
4. Inspect the release manifest's source commit and file list before distributing the package.

The versioned package contains the standalone HTML, exact-commit source ZIP, release manifest, release notes, and checksums. The GitHub Actions artifact is the CI-published build output; do not claim a tagged GitHub Release exists unless one has actually been created.

## 10. Change and Git workflow

- Confirm the current branch and working-tree state before making changes. Work on the branch specified by the user or the existing task; do not silently switch branches.
- Keep changes focused and review the diff for accidental generated files, unrelated refactors, secrets, or local machine data.
- Add tests and update documentation when behavior or contracts change. Keep comments focused on intent and non-obvious constraints.
- Follow the user's requested delivery flow. Do not create a pull request when the user asked for a direct branch update, and do not push to `main` unless explicitly requested.
- Never force-push, rewrite shared history, or overwrite concurrent branch work. If the remote branch head changes while preparing a commit, fetch the new head and reconcile before updating it.
- In the completion summary, identify the branch and commit, list meaningful files changed, report checks that actually passed, and state any remaining manual verification separately.

Prefer a small, reviewable commit with a descriptive imperative message. Avoid committing generated `dist/`, `node_modules/`, logs, coverage output, local Playwright artifacts, or secrets.
