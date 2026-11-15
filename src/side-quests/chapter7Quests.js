import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter7Quests = [
  {
    id: "sq13_mastery",
    chapterId: "chapter7",
    title: "Grammar Sprint",
    type: "mastery",
    skillId: SKILL_IDS.ELA_GRAMMAR_POS,
    count: 3,
    seedBase: 7100,
    reward: { id: "reward_sq13", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq14_playful",
    chapterId: "chapter7",
    title: "Library Helper",
    type: "playful",
    skillId: SKILL_IDS.ELA_GRAMMAR_POS,
    count: 2,
    seedBase: 7200,
    reward: { id: "reward_sq14", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter7Quests;
