import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter10Quests = [
  {
    id: "sq19_mastery",
    chapterId: "chapter10",
    title: "Championship Drill",
    type: "mastery",
    skillId: SKILL_IDS.MATH_MULT_FACTS_1_5,
    count: 3,
    seedBase: 10100,
    reward: { id: "reward_sq19", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq20_playful",
    chapterId: "chapter10",
    title: "Final Showcase",
    type: "playful",
    skillId: SKILL_IDS.MATH_FRACTIONS_PARTS,
    count: 2,
    seedBase: 10200,
    reward: { id: "reward_sq20", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter10Quests;
