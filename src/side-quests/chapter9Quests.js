import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter9Quests = [
  {
    id: "sq17_mastery",
    chapterId: "chapter9",
    title: "Vault Steps",
    type: "mastery",
    skillId: SKILL_IDS.MATH_MULTISTEP,
    count: 3,
    seedBase: 9100,
    reward: { id: "reward_sq17", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq18_playful",
    chapterId: "chapter9",
    title: "Chimera Challenge",
    type: "playful",
    skillId: SKILL_IDS.MATH_MULTISTEP,
    count: 2,
    seedBase: 9200,
    reward: { id: "reward_sq18", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter9Quests;
