import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter4Quests = [
  {
    id: "sq7_mastery",
    chapterId: "chapter4",
    title: "Shape Sorter",
    type: "mastery",
    skillId: SKILL_IDS.MATH_GEOMETRY_SHAPES,
    count: 3,
    seedBase: 4100,
    reward: { id: "reward_sq7", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq8_playful",
    chapterId: "chapter4",
    title: "Beam Balance",
    type: "playful",
    skillId: SKILL_IDS.MATH_GEOMETRY_SHAPES,
    count: 2,
    seedBase: 4200,
    reward: { id: "reward_sq8", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter4Quests;
