import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter10Definition = {
  id: "chapter10",
  title: "The Grand Starlight Championship",
  theme: "Academy celebration",
  learningFocus: "Cumulative review",
  skillIds: [SKILL_IDS.MATH_MULT_FACTS_1_5, SKILL_IDS.MATH_FRACTIONS_PARTS, SKILL_IDS.ELA_SPELLING_ROOTS, SKILL_IDS.MATH_GEOMETRY_SHAPES],
  reward: { id: "reward_chapter10_trophy", type: "item", itemId: "chapter10_trophy", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Grand championship: sample your skills!" },
    { id: "practice", type: "practice", count: 4 },
    { id: "reward", type: "reward", text: "You are the Starlight Champion!" },
  ],
};

export default chapter10Definition;
