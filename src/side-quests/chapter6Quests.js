import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter6Quests = [
  {
    id: "sq11_mastery",
    chapterId: "chapter6",
    title: "Growth Stages",
    type: "mastery",
    skillId: SKILL_IDS.SCIENCE_BOTANY_LIFECYCLE,
    count: 3,
    seedBase: 6100,
    reward: { id: "reward_sq11", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq12_playful",
    chapterId: "chapter6",
    title: "Resource Mix",
    type: "playful",
    skillId: SKILL_IDS.SCIENCE_BOTANY_LIFECYCLE,
    count: 2,
    seedBase: 6200,
    reward: { id: "reward_sq12", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter6Quests;
