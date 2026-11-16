# Chapter 1 vertical-slice playtest notes

**Review date:** 2026-11-16  
**Scope:** Source-level walkthrough of the chapter flow, targeted keyboard-input smoke checks, and regression tests added for mouse/keyboard, hint behavior, chapter resume/replay, rewards, wardrobe unlock, and the authored gymnastics routine.

## Review findings and corrections

| Area | Finding | Correction |
|---|---|---|
| Chapter answer shortcuts | Chapter 1 runs inside the academy hub screen, while the existing 1–4 and H bindings were scoped to a separate activity screen. | Added a chapter input controller. Keys 1–4 choose the correspondingly numbered visible answer; H asks Professor Hoot for a hint. |
| Modal and text-entry safety | Chapter shortcuts must not answer a question behind Settings or while the player is typing. | Shortcuts now ignore modal-covered chapter state, inputs, textareas, selects, contenteditable elements, modified key chords, repeated keys, and composition events. |
| Dynamic focus | Replacing the question card after an answer or hint could leave keyboard focus on a removed button. | Focus now moves to the next answer, story action, routine start, or chapter-completion control. |
| Challenge progress label | The first lantern previously displayed “0 of 3.” | Progress is now one-based (“1 of 3”). |
| Choice discoverability | Number shortcuts were not explained on the question card. | Choices display their shortcut numbers and the question explains mouse, 1–4, and H controls. |
| Gymnastics integration | The chapter refers to the shared Starlight Ribbon routine; the connection needed explicit regression coverage. | Added a chapter integration test that resolves the routine ID from chapter content and verifies the trace/rhythm engine reaches completion with independent 100 scores and three stars. |
| Replay and rewards | Chapter replay must preserve progress history without granting repeat rewards. | The Chapter 1 integration test covers checkpoint resume, once-only Star Gems/Sparkles, and the one-time Comet Dance Dress wardrobe unlock. |

## Checks completed in this review

- Static syntax parsing passed for the updated chapter, chapter input controller, UI, chapter runtime service, and related tests.
- A focused keyboard-controller smoke check confirmed answer selection, hint request, text-entry exclusion, modal exclusion, and default-prevention behavior.
- Regression tests were added to the repository for keyboard shortcuts and boundaries, chapter content and question generation, hint stages, resume/replay/reward handling, wardrobe unlocking, and the chapter's ribbon routine.

## Not yet verified

This review did **not** launch the packaged HTML in Chrome or Edge and did not include observation of a child or other representative learner. No GitHub Actions workflow run was available for this branch. The following remain open before treating the vertical slice as playtested:

1. Run npm run check, npm test, and npm run build locally.
2. Open the built HTML in desktop Chrome and Edge; exercise mouse, Tab/Enter, 1–4, and H across story, learning, challenge, gymnastics, and Settings.
3. Observe whether the learner understands the skip-counting pattern, equal-groups prompt, hint stages, and completion reward without coaching.
4. Check the chapter and gymnastics panels at normal and enlarged text sizes, reduced motion, and representative desktop window sizes.
5. Confirm count-in and beat audio clarity, trace interaction reliability, save/reload behavior, and wardrobe reward visibility.

**Gate:** The source-level review and corrective fixes are complete. STEP-22 remains partially complete until live desktop and learner observations are recorded. Do not treat the chapter as approved for mass content production yet.
