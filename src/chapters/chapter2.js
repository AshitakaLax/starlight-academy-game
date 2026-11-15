import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter2Definition = {
  id: "chapter2",
  title: "Apollo's Musical Fractions",
  theme: "Apollo's music room",
  learningFocus: "Fractions, visual parts, equivalent fractions",
  skillIds: [SKILL_IDS.MATH_FRACTIONS_PARTS, SKILL_IDS.MATH_FRACTIONS_EQUIV],
  reward: { id: "reward_chapter2_lyre", type: "item", itemId: "chapter2_lyre", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Apollo's music room: build measures from equal parts." },
    { id: "parts", type: "practice", skillId: SKILL_IDS.MATH_FRACTIONS_PARTS, count: 2 },
    { id: "equiv", type: "practice", skillId: SKILL_IDS.MATH_FRACTIONS_EQUIV, count: 2 },
    { id: "reward", type: "reward", text: "You earned Apollo's Lyre!" },
  ],
};

export default chapter2Definition;
