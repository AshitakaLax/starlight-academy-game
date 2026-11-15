# Curriculum system

The curriculum layer is data-driven and independent of DOM, rendering, and chapter navigation.

- `skillRegistry.js` owns stable skill IDs, subject labels, learning objectives, and supported tiers.
- `difficultyTiers.js` defines Foundation, Core, and Stretch. Core is the recommended starting tier; the later adaptive-difficulty step can move each skill independently.
- `activityDefinitions.js` validates immutable activity contracts. Every activity declares skill IDs, objectives, supported tiers, answer rules, a generator ID, and one constraints object per tier.
- `questionGenerators.js` provides a seeded PRNG, built-in multiplication/addition/skip-counting generators, and isolated custom generator registries. Reusing the same activity, seed, and tier yields the same question.
- `answerRules.js` evaluates numeric, exact-text, choice, and sequence responses.
- `curriculumProgress.js` records per-skill evidence, hint use, attempts, recent outcomes, and mastery status. Evidence is bounded and sequence-numbered.

Mastery is recorded only after a complete evidence window meets the configured unassisted-correct threshold. Once demonstrated, the mastery milestone is retained; recent evidence remains available for future adaptive decisions. No response-time measurement is used.

Implementation: STEP-10. Adaptive tier selection and rolling difficulty changes are reserved for STEP-11.
