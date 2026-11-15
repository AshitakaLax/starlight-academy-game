import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter9Definition = {
  id: "chapter9",
  title: "The Chimera's Multi-Step Challenge",
  theme: "Grand vault",
  learningFocus: "Multi-digit addition/subtraction, division, multi-step reasoning",
  skillIds: [SKILL_IDS.MATH_MULTISTEP],
  reward: { id: "reward_chapter9_chimera", type: "item", itemId: "chapter9_chimera", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Grand vault: solve connected steps." },
    { id: "practice", type: "practice", skillId: SKILL_IDS.MATH_MULTISTEP, count: 3 },
    { id: "reward", type: "reward", text: "You opened the vault!" },
  ],
};

export default chapter9Definition;
