import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter1Quests = [
  {
    id: "sq1_mastery",
    chapterId: "chapter1",
    title: "Array Architect",
    type: "mastery",
    skillId: SKILL_IDS.MATH_MULT_FACTS_1_5,
    count: 3,
    seedBase: 1100,
    reward: { id: "reward_sq1", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq2_playful",
    chapterId: "chapter1",
    title: "Ribbon Helper",
    type: "playful",
    skillId: SKILL_IDS.MATH_MULT_FACTS_1_5,
    count: 2,
    seedBase: 1200,
    reward: { id: "reward_sq2", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter1Quests;
