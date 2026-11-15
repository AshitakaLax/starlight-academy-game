# Hint system

The hint framework is activity-specific and independent of chapter completion.

- `hintDefinitions.js` validates immutable three-stage content and builds the accessible Professor Hoot presentation model. The visual descriptor and full text equivalent are always supplied together.
- `createHintRegistry.js` binds hint content to a registered activity and requires the exact activity skill contract.
- `createHintService.js` tracks a question's incorrect attempts, reveals a gentle nudge, a strategy prompt, and then a Professor Hoot worked demonstration. Stage attempt thresholds are authored per activity and may be adjusted without changing the service.
- The third stage includes ordered steps with renderer-friendly visual descriptors, narration text, and a complete readable equivalent. When a narration service is supplied, the service speaks the hint; the narration adapter displays the caption even when speech is disabled or unavailable.
- Players may retry the same question or request a deterministic parallel question generated for the same activity and difficulty tier. The parallel question starts its own hint session.
- `complete(questionId)` is unconditional. Hints are optional support and never become prerequisites for finishing an activity.

Content authors should register one definition per activity. A worked example must use the same activity ID and skill IDs; there is no generic answer demonstration that could accidentally teach the wrong method. Hint use and incorrect attempts remain separate from curriculum evidence recording, which the activity runtime performs through the curriculum system.

Implementation: `STEP-12`.
