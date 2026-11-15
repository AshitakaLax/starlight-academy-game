import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter8Quests = [
  {
    id: "sq15_mastery",
    chapterId: "chapter8",
    title: "Measure Master",
    type: "mastery",
    skillId: SKILL_IDS.MATH_MEASUREMENT_VOLUME,
    count: 3,
    seedBase: 8100,
    reward: { id: "reward_sq15", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq16_playful",
    chapterId: "chapter8",
    title: "Lab Assistant",
    type: "playful",
    skillId: SKILL_IDS.MATH_MEASUREMENT_VOLUME,
    count: 2,
    seedBase: 8200,
    reward: { id: "reward_sq16", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter8Quests;
