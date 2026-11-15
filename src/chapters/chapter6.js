import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter6Definition = {
  id: "chapter6",
  title: "Demeter's Enchanted Greenhouse",
  theme: "Magical greenhouse",
  learningFocus: "Plant structures, life cycle, photosynthesis inputs",
  skillIds: [SKILL_IDS.SCIENCE_BOTANY_LIFECYCLE],
  reward: { id: "reward_chapter6_greenhouse", type: "item", itemId: "chapter6_greenhouse", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Greenhouse: grow a plant by sequencing stages." },
    { id: "practice", type: "practice", skillId: SKILL_IDS.SCIENCE_BOTANY_LIFECYCLE, count: 3 },
    { id: "reward", type: "reward", text: "You earned the Greenhouse Key!" },
  ],
};

export default chapter6Definition;
