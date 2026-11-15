import { QuestionGenerator, seededRng } from "../questionGenerator.js";
import { SKILL_IDS } from "../skillRegistry.js";
import WORD_PARTS from "../../../data/wordParts.js";

export class SpellingGenerator extends QuestionGenerator {
  constructor() {
    super({ skillId: SKILL_IDS.ELA_SPELLING_ROOTS, supportedTiers: ["Foundation","Developing","Core","Stretch"], objective: "Build words from prefix/root/suffix", type: "mc" });
  }
  generate(seed, params = {}) {
    const rng = seededRng(seed);
    const item = WORD_PARTS[Math.floor(rng() * WORD_PARTS.length)];
    const answer = item.word;
    const choices = new Set([answer]);
    // invalid distractors by swapping
    while (choices.size < 4) {
      const other = WORD_PARTS[Math.floor(rng() * WORD_PARTS.length)];
      const cand = other.prefix + item.root + item.suffix;
      if (cand !== answer) choices.add(cand);
    }
    const arr = [...choices];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return {
      prompt: `Combine prefix "${item.prefix}" + root "${item.root}" + suffix "${item.suffix}". Which word is formed?`,
      choices: arr,
      answer,
      hints: [
        { type: "gentle", text: "Put the parts together in order." },
        { type: "clue", text: `Starts with ${item.prefix}, ends with ${item.suffix}.` },
        { type: "demonstration", text: `${item.prefix}+${item.root}+${item.suffix} = ${item.word}.`, narrate: `The word is ${item.word}.` },
      ],
      meaning: item.meaning,
    };
  }
  validate(q) { return !!q && Array.isArray(q.choices) && q.choices.length === 4 && new Set(q.choices).size === 4 && q.choices.includes(q.answer); }
}
export default SpellingGenerator;
