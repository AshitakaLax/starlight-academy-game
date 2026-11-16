# Chapter 7 Playtest — Athena's Logic & Word Wizardry

## Automated coverage

- Curated grammar targets are checked for exactly one whole-word occurrence in their sentence.
- Foundation, Core, and Stretch question generation is deterministic.
- Grammar prompts cover nouns, verbs, adjectives, and adverbs.
- Every reading passage has four distinct main-idea answers and four distinct inference answers, with an authored explanation for each key.
- Generated reading questions are checked against the passage-specific answer key.
- Hint progression, Chapter 6 prerequisite, checkpoint resume, replay, and the once-only reward are covered by Node tests.

## Manual desktop and learner review (pending)

Run the built standalone HTML file in current desktop Chrome and Edge. Complete Chapter 6 first, then:

1. Open Chapter 7 and confirm the chapter stays locked until Chapter 6 is complete.
2. In the Grammar Observatory, confirm the target word is highlighted without revealing its part of speech. Check nouns, verbs, adjectives, and adverbs across the three tiers.
3. In the Main-Idea Reading Room, verify the passage remains readable at normal and enlarged text settings, and that the choices do not cover the passage.
4. In the Inference Archive, ask the learner to point to the text clue that supports the selected conclusion. Confirm distractors do not appear defensible from the passage.
5. Use keyboard keys 1–4 and mouse selection; request each Professor Hoot hint stage with H and confirm the demonstration is understandable.
6. Exit after the grammar activity and resume. Confirm the next activity is the Main-Idea Reading Room.
7. Finish the chapter, replay it, and confirm the Quill reward is not granted twice.
8. Check narration captions, focus order, narrow desktop windows, and the full passage at increased text scale.

Record learner comments and any confusing sentence or answer choice here before release.
