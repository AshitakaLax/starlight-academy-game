import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter3Quests = [
  {
    id: "sq5_mastery",
    chapterId: "chapter3",
    title: "Prefix Power",
    type: "mastery",
    skillId: SKILL_IDS.ELA_SPELLING_ROOTS,
    count: 3,
    seedBase: 3100,
    reward: { id: "reward_sq5", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq6_playful",
    chapterId: "chapter3",
    title: "Potion Word Mix",
    type: "playful",
    skillId: SKILL_IDS.ELA_SPELLING_ROOTS,
    count: 2,
    seedBase: 3200,
    reward: { id: "reward_sq6", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter3Quests;
