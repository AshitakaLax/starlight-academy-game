import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter2Quests = [
  {
    id: "sq3_mastery",
    chapterId: "chapter2",
    title: "Fraction Composer",
    type: "mastery",
    skillId: SKILL_IDS.MATH_FRACTIONS_EQUIV,
    count: 3,
    seedBase: 2100,
    reward: { id: "reward_sq3", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq4_playful",
    chapterId: "chapter2",
    title: "Music Measure Helper",
    type: "playful",
    skillId: SKILL_IDS.MATH_FRACTIONS_PARTS,
    count: 2,
    seedBase: 2200,
    reward: { id: "reward_sq4", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter2Quests;
