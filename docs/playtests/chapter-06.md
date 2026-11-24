# Chapter 6 implementation and playtest notes

**Review date:** 2026-11-16  
**Scope:** Demeter's Enchanted Greenhouse, including flowering-plant life-cycle sequencing, greenhouse resource choices, photosynthesis inputs, hints, chapter progression, checkpoints, and replay.

## Implemented content

- Five stages in the flowering-plant cycle: seed, germination, seedling, mature flowering plant, and fruit with new seeds.
- Foundation, Core, and Stretch sequence questions reveal progressively later transitions while preserving the same stage order.
- Four greenhouse scenarios ask the player to choose water, sunlight, carbon dioxide, or mineral nutrients based on the plant's condition.
- A dedicated photosynthesis challenge consistently identifies sunlight, water, and carbon dioxide as inputs used to make sugars; oxygen is named as an output, and mineral nutrients are described separately as supporting growth.
- Accessible ordered stage lists and resource-situation cards are paired with native answer buttons for mouse and keyboard play.
- Three three-stage Professor Hoot hint tracks, Chapter 5 prerequisite, checkpoint resume, replay, and a once-only Sunrise Seed Satchel reward.

## Science references

- Utah State University Extension — [Plant Life Cycle](https://ucanr.edu/sites/default/files/2020-04/323108.pdf): seed, germination, seedling, flowering, pollination, and renewed seed cycle.
- Colorado State University Extension — [Plant Physiology: Photosynthesis, Transpiration, and Respiration](https://cmg.extension.colostate.edu/wp-content/uploads/sites/59/2024/10/2024-2-Botany-Full-Section.pdf): light energy, carbon dioxide, and water as photosynthesis inputs; sugars and oxygen as products.
- Smithsonian Science Education Center — [What is Photosynthesis](https://ssec.si.edu/node/915): photosynthesis uses sunlight, water, and gases from the air to make glucose and oxygen.

## Automated verification coverage

The Chapter 6 regression suite checks stage order and supported transition tiers, deterministic question generation, resource/scenario matching, distinct answer choices, photosynthesis input consistency, hint stages, Chapter 5 prerequisite gating, checkpoint resume, replay, and one-time reward claims.

## Remaining desktop and learner checks

1. Open the new standalone HTML build in desktop Chrome and Edge.
2. Check the plant-stage list and greenhouse clue cards at supported desktop sizes and text-scaling settings.
3. Play each activity at Foundation, Core, and Stretch; verify that every answer matches the displayed stage or growing condition.
4. Check mouse and keyboard answer selection, Professor Hoot hints, checkpoint resume, save/reload, and replay rewards.
5. Observe a representative learner explain the sequence and distinguish photosynthesis inputs from mineral nutrients.

**Gate:** Source implementation and regression coverage are added. A live desktop playthrough and representative learner observation are still required.
