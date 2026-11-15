import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter5Definition = {
  id: "chapter5",
  title: "Artemis and the Magical Habitats",
  theme: "Wildlife sanctuary",
  learningFocus: "Habitats, ecosystems, adaptations",
  skillIds: [SKILL_IDS.SCIENCE_HABITATS],
  reward: { id: "reward_chapter5_quiver", type: "item", itemId: "chapter5_quiver", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Wildlife sanctuary: investigate creature clues." },
    { id: "practice", type: "practice", skillId: SKILL_IDS.SCIENCE_HABITATS, count: 3 },
    { id: "reward", type: "reward", text: "You earned Artemis's Quiver!" },
  ],
};

export default chapter5Definition;
