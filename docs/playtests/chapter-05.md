# Chapter 5 implementation and playtest notes

**Review date:** 2026-11-16  
**Scope:** Artemis and the Magical Habitats: six creature/biome matches, structural and behavioral adaptations, ecosystem relationships, hints, progression, checkpoints, and replay.

## Implemented content

- A curated six-creature field guide: Arctic fox, dromedary camel, red-eyed tree frog, North American beaver, mountain goat, and black-tailed prairie dog.
- Four activity formats: habitat matching, structural-versus-behavioral classification, adaptation-purpose reasoning, and ecosystem-connection reasoning.
- Foundation uses four familiar creatures; Core and Stretch expand to all six. Question generation is deterministic by seed with distinct answer choices.
- Accessible clue cards are rendered as semantic DOM text. Choices remain native buttons for mouse, Tab, Enter, and existing number shortcuts.
- Four three-stage Professor Hoot hint sequences, Chapter 4 prerequisite, checkpoint resume, replay, and a once-only Wildlife Compass reward.

## Content references

- National Geographic Kids — [Arctic Fox](https://kids.nationalgeographic.com/animals/mammals/facts/arctic-fox): cold-weather fur, tail use, Arctic habitat, and small-mammal prey.
- Rainforest Alliance — [Red-Eyed Tree Frog](https://www.rainforest-alliance.org/species/tree-frog/): rainforest habitat and toe-pad/climbing adaptations.
- Wyoming Extension — [Prairie Dog Ecology and Management](https://wyoextension.org/publications/html/B1346/): grassland burrows and alarm calls.
- Montana Fish, Wildlife & Parks — [Living With Beavers](https://fwp.mt.gov/conservation/living-with-wildlife/beavers): beaver swimming traits, diet, and habitat use.
- U.S. National Park Service — [Mountain Goats](https://www.nps.gov/articles/mountain-goats.htm): alpine habitat and hoof adaptations.

## Automated verification coverage

Regression tests check unique biome data, both adaptation types, deterministic generation at all three tiers, answer uniqueness, habitat/feature/effect matching, all hint stages, Chapter 4 prerequisite gating, checkpoint resume, replay, and once-only reward claims.

## Remaining desktop and learner checks

1. Open the new standalone HTML build in desktop Chrome and Edge.
2. Check creature clues and habitat labels at supported desktop sizes and text scaling settings.
3. Play each activity at Foundation, Core, and Stretch; confirm each correct answer is supported by the displayed clue.
4. Check mouse and keyboard answer selection, Professor Hoot hints, checkpoint resume, save/reload, and replay rewards.
5. Observe a representative learner matching a creature to a biome and explaining how an adaptation helps it survive.

**Gate:** Source implementation and regression coverage are added. A live desktop playthrough and representative learner observation are still required.
