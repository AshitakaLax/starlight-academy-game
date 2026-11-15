import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter8Definition = {
  id: "chapter8",
  title: "Poseidon's Volume & Measurement Lab",
  theme: "Potion laboratory",
  learningFocus: "Liquid volume, mass, units, elapsed time",
  skillIds: [SKILL_IDS.MATH_MEASUREMENT_VOLUME, SKILL_IDS.MATH_MEASUREMENT_ELAPSED_TIME],
  reward: { id: "reward_chapter8_trident", type: "item", itemId: "chapter8_trident", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Measurement lab: measure, compare, fill, schedule." },
    { id: "practice", type: "practice", skillId: SKILL_IDS.MATH_MEASUREMENT_VOLUME, count: 3 },
    { id: "reward", type: "reward", text: "You earned Poseidon's Trident!" },
  ],
};

export default chapter8Definition;
