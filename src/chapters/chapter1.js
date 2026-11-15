import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter1Definition = {
  id: "chapter1",
  title: "The Ribbon of Multiplication",
  theme: "Hermes and the ribbon studio",
  learningFocus: "Multiplication facts 1-5; skip counting; arrays",
  skillIds: [SKILL_IDS.MATH_MULT_FACTS_1_5],
  reward: { id: "reward_chapter1_cape", type: "item", itemId: "chapter1_cape", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Welcome to the ribbon studio! Let's build star arrays." },
    { id: "practice", type: "practice", skillId: SKILL_IDS.MATH_MULT_FACTS_1_5, count: 3 },
    { id: "gymnastics", type: "gymnastics", routineId: "chapter1_ribbon" },
    { id: "reward", type: "reward", text: "You earned the Ribbon Cape!" },
  ],
};

export default chapter1Definition;
