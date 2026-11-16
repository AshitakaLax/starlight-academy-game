# Chapter 3 implementation and playtest notes

**Review date:** 2026-11-16  
**Scope:** Spellbook of Spelling & Root Words, including curated spelling content, word-part activities, contextual potion questions, hints, chapter progression, and replay rewards.

## Implemented content

- A 17-word curated lexicon divided into Foundation, Core, and Stretch tiers.
- Prefix-building questions for re-, un-, pre-, mis-, and dis-.
- Suffix-building questions for -ful, -less, -er, -ness, -ment, and -able.
- A three-question potion challenge that asks players to infer a derived word's meaning from a complete sentence and its root.
- Word-part and potion-note learning visuals, including a note for the final-e spelling change in **use + -able = usable**, then **re- + usable = reusable**.
- Three-stage Professor Hoot assistance for prefix, suffix, and context-clue activities.
- Chapter 2 prerequisite, saved checkpoints, resume, replay, and a once-only Lexicon Lantern reward.

## Source-level verification completed

- The 17 curated entries were checked so their parts assemble to the target spelling, including the explicitly documented final-e rule.
- Every context sentence contains its target word.
- Chapter 3 activity definitions, hint definitions, and chapter definition passed registry validation.
- A deterministic smoke check generated 450 questions across the three activities and three tiers. All generated choice sets had four distinct, valid options and contained the correct answer; contextual questions matched their curated sentence and meaning.
- Regression tests were added for content validity, deterministic questions, all three difficulty tiers, hint stages, prerequisite gating, checkpoint resume, and once-only reward replay.

## Automated verification

The branch's GitHub Actions workflow runs JavaScript syntax checks, the full Node regression suite, the single-file/offline build, and uploads the built HTML artifact. Record the run linked from the current branch after it completes.

## Still required before mass content production

1. Download the latest `starlight-academy-html` artifact from the successful GitHub Actions run and open it in desktop Chrome and Edge.
2. Play through Chapters 1–3 with mouse, Tab/Enter, number shortcuts, and H hints; check the three Chapter 3 activities and the five-part chapter flow.
3. Observe a representative learner building words from the parts without coaching and using the sentence clue to infer a word meaning.
4. Check text scaling, reduced motion, focus order, and narrow desktop window sizes; verify that the potion sentence and word-part visuals remain readable.
5. Confirm chapter checkpoint/resume, reward clarity, save/reload, and replay behavior in the packaged HTML.

**Gate:** Chapter 3 is implemented and has targeted source-level checks. It is not yet approved for mass content production until the current CI run and live desktop/learner playtest are recorded.
