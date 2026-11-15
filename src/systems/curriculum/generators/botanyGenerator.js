import { QuestionGenerator, seededRng } from "../questionGenerator.js";
import { SKILL_IDS } from "../skillRegistry.js";

const LIFECYCLE = ["seed", "sprout", "seedling", "mature plant", "flower", "fruit"];

export class BotanyGenerator extends QuestionGenerator {
  constructor() {
    super({ skillId: SKILL_IDS.SCIENCE_BOTANY_LIFECYCLE, supportedTiers: ["Foundation","Developing","Core","Stretch"], objective: "Plant lifecycle and photosynthesis", type: "mc" });
  }
  generate(seed, params = {}) {
    const rng = seededRng(seed);
    if (rng() > 0.5) {
      const idx = Math.floor(rng() * (LIFECYCLE.length - 1));
      const answer = LIFECYCLE[idx + 1];
      const choices = new Set([answer]);
      while (choices.size < 4) choices.add(LIFECYCLE[Math.floor(rng() * LIFECYCLE.length)]);
      const arr = [...choices];
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return { prompt: `In the plant life cycle, what comes after ${LIFECYCLE[idx]}?`, choices: arr, answer, hints: [{type:"gentle",text:"Think of growth order."},{type:"clue",text:"Seed → sprout → ..."},{type:"demonstration",text:`Next is ${answer}.`,narrate:`Next is ${answer}.`}] };
    }
    const resources = ["water", "sunlight", "carbon dioxide"];
    const answer = resources[Math.floor(rng() * resources.length)];
    const choices = ["water", "sunlight", "carbon dioxide", "plastic"];
    // shuffle
    const arr = [...choices];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return { prompt: "Which is a resource plants need to grow?", choices: arr, answer, hints: [{type:"gentle",text:"Plants need natural inputs."},{type:"clue",text:"Water, sunlight, CO2."},{type:"demonstration",text:`${answer} is needed.`,narrate:`${answer} is needed.`}] };
  }
  validate(q) { return !!q && Array.isArray(q.choices) && new Set(q.choices).size === q.choices.length && q.choices.includes(q.answer); }
}
export default BotanyGenerator;
