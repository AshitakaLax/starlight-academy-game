import { QuestionGenerator, seededRng } from "../questionGenerator.js";
import { SKILL_IDS } from "../skillRegistry.js";
import HABITATS from "../../../data/habitats.js";

export class HabitatGenerator extends QuestionGenerator {
  constructor() {
    super({ skillId: SKILL_IDS.SCIENCE_HABITATS, supportedTiers: ["Foundation","Developing","Core","Stretch"], objective: "Habitats and adaptations", type: "mc" });
  }
  generate(seed, params = {}) {
    const rng = seededRng(seed);
    const item = HABITATS[Math.floor(rng() * HABITATS.length)];
    const answer = item.habitat;
    const choices = new Set([answer]);
    while (choices.size < 4) {
      const other = HABITATS[Math.floor(rng() * HABITATS.length)].habitat;
      if (other !== answer) choices.add(other);
    }
    const arr = [...choices];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return {
      prompt: `${item.creature} has ${item.trait}. Which habitat suits it best?`,
      choices: arr,
      answer,
      hints: [
        { type: "gentle", text: "Think about the trait." },
        { type: "clue", text: `${item.trait} helps in ${item.habitat}.` },
        { type: "demonstration", text: `${item.creature} lives in ${item.habitat}.`, narrate: `${item.creature} lives in the ${item.habitat}.` },
      ],
    };
  }
  validate(q) { return !!q && Array.isArray(q.choices) && q.choices.length >= 2 && new Set(q.choices).size === q.choices.length && q.choices.includes(q.answer); }
}
export default HabitatGenerator;
