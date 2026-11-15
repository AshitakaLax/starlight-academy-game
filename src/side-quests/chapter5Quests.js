import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter5Quests = [
  {
    id: "sq9_mastery",
    chapterId: "chapter5",
    title: "Habitat Match",
    type: "mastery",
    skillId: SKILL_IDS.SCIENCE_HABITATS,
    count: 3,
    seedBase: 5100,
    reward: { id: "reward_sq9", type: "sparkles", amount: 5, repeatPolicy: "replay-capped", replayCap: 2 },
  },
  {
    id: "sq10_playful",
    chapterId: "chapter5",
    title: "Creature Clues",
    type: "playful",
    skillId: SKILL_IDS.SCIENCE_HABITATS,
    count: 2,
    seedBase: 5200,
    reward: { id: "reward_sq10", type: "gems", amount: 8, repeatPolicy: "replay-capped", replayCap: 2 },
  },
];
export default chapter5Quests;
