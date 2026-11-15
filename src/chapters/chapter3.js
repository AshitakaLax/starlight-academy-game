import { SKILL_IDS } from "../systems/curriculum/skillRegistry.js";

export const chapter3Definition = {
  id: "chapter3",
  title: "Spellbook of Spelling & Root Words",
  theme: "Potion classroom",
  learningFocus: "Spelling, roots, prefixes, suffixes, context",
  skillIds: [SKILL_IDS.ELA_SPELLING_PREFIXES, SKILL_IDS.ELA_SPELLING_ROOTS, SKILL_IDS.ELA_SPELLING_SUFFIXES],
  reward: { id: "reward_chapter3_spellbook", type: "item", itemId: "chapter3_spellbook", repeatPolicy: "once" },
  scenes: [
    { id: "intro", type: "story", text: "Potion classroom: build valid words from parts." },
    { id: "practice", type: "practice", skillId: SKILL_IDS.ELA_SPELLING_ROOTS, count: 3 },
    { id: "reward", type: "reward", text: "You earned the Spellbook!" },
  ],
};

export default chapter3Definition;
