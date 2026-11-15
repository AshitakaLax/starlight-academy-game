# Chapter runtime — STEP-20

The chapter runtime supplies shared sequencing, checkpoints, safe exits, completion, replay records, and major reward hooks without imposing one universal sequence on all chapters.

## Chapter definitions

A chapter defines its own ordered `activities`. Each activity has a stable chapter-scoped ID, title, type (`story`, `learning`, `challenge`, `gymnastics`, `reflection`, or `custom`), description, and optional curriculum activity/skill references and JSON metadata. Definitions also declare learning objectives, required one-time major reward IDs, and optional prerequisite chapter IDs. The catalog rejects duplicate IDs, unknown skill references, missing prerequisite chapters, and prerequisite cycles.

## Runtime behavior

- Only one live chapter session can advance shared saved progress at a time. Starting an available chapter begins a new run or resumes the current saved checkpoint.
- Completing or skipping an activity writes an ordered checkpoint. A checkpoint cannot remove earlier activity results.
- Finishing the final activity records the chapter run and claims its catalog-defined major rewards through the economy service.
- Major chapter rewards must reference their chapter as the reward source and use a once-only claim policy. Replaying a chapter does not duplicate a major reward.
- Safe exit preserves the current checkpoint. A new session resumes at the next unfinished activity.
- A skipped activity is recorded as skipped, not as a hard failure. The chapter still reaches completion.
- Recent run history is bounded by `gameConfig.chapterRuntime.completedHistoryLimit`; older saves receive empty runtime defaults.
- The chapter path UI displays chapter status, prerequisite availability, current activity, progress, and replay options. The current chapter registry remains intentionally empty until STEP-21 authors the first playable chapter.

## Module responsibilities

- `chapterCatalog.js` validates definitions and stores chapter-owned sequences.
- `chapterRuntimeState.js` normalizes persisted checkpoints and replay records.
- `chapterRuntimeActions.js` validates starts, ordered checkpoints, exits, and completion transitions.
- `createChapterRuntimeService.js` coordinates sessions, resumes, completion, and reward claims.
- `src/chapters/registry.js` exports the shared registry and current authored definitions.
- `tests/chapter-runtime.test.js` covers sequence differences, prerequisites, replay, checkpoint integrity, reward idempotency, and save restoration.
