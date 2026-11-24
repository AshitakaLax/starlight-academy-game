# Curriculum system

The curriculum layer is data-driven and independent of DOM, rendering, and chapter navigation.

- `skillRegistry.js` owns stable skill IDs, subject labels, learning objectives, and supported tiers.
- `difficultyTiers.js` defines Foundation, Core, and Stretch. New players start at Core; the adaptive policy moves each skill independently from its own evidence window.
- `activityDefinitions.js` validates immutable activity contracts. Every activity declares skill IDs, objectives, supported tiers, answer rules, a generator ID, and one constraints object per tier.
- `questionGenerators.js` provides a seeded PRNG, built-in multiplication/addition/skip-counting generators, and isolated custom generator registries. Reusing the same activity, seed, and tier yields the same question.
- `answerRules.js` evaluates numeric, exact-text, choice, and sequence responses.
- `curriculumProgress.js` records per-skill evidence, hint use, attempts, recent outcomes, and mastery status. Evidence is bounded and sequence-numbered.
- `adaptiveDifficulty.js` starts without a placement quiz at Core, evaluates five responses independently for each skill, promotes after at least four unassisted correct responses, and offers one tier of support after at most one correct response. It never uses response speed and resolves activity-specific supported tiers without changing the skill's saved tier.

Mastery is recorded only after a complete evidence window meets the configured unassisted-correct threshold. Once demonstrated, the mastery milestone is retained; recent evidence remains available for future adaptive decisions. No response-time measurement is used.

STEP-10 established the reusable evidence contracts; STEP-11 adds no-test Core onboarding and independent per-skill tier movement using rolling response evidence. The policy ignores response speed, promotes after four or more unassisted correct responses in a five-response window, and offers one tier of extra support after four or more incorrect responses. Tier changes are bounded to Foundation, Core, and Stretch.


The STEP-12 hint system consumes activity contracts without changing adaptive tiers or mastery. Activity runtimes record answer evidence separately and pass incorrect outcomes to the hint service; stage-specific hint levels can then be included in curriculum evidence. The hint service itself never writes correctness or completion state.
