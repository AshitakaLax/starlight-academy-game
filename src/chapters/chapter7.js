import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter7Definition = {
  id: "chapter7",
  title: "Athena's Logic & Word Wizardry",
  theme: "Academy library",
  learningFocus: "Parts of speech, reading comprehension, main idea, inference",
  skillIds: [SKILL_IDS.ELA_GRAMMAR_POS, SKILL_IDS.ELA_READING_MAIN_IDEA],
  reward: { id: "reward_chapter7_scroll", type: "item", itemId: "chapter7_scroll", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Library: repair sentences and passages." },
    { id: "practice", type: "practice", skillId: SKILL_IDS.ELA_GRAMMAR_POS, count: 3 },
    { id: "reward", type: "reward", text: "You earned Athena's Scroll!" },
  ],
};

export default chapter7Definition;
