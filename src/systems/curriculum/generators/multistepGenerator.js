import { QuestionGenerator, seededRng } from "../questionGenerator.js";
import { SKILL_IDS } from "../skillRegistry.js";

export class MultiStepGenerator extends QuestionGenerator {
  constructor() {
    super({ skillId: SKILL_IDS.MATH_MULTISTEP, supportedTiers: ["Foundation","Developing","Core","Stretch"], objective: "Multi-step reasoning", type: "mc" });
  }
  generate(seed, params = {}) {
    const rng = seededRng(seed);
    const kind = Math.floor(rng() * 2);
    if (kind === 0) {
      const a = Math.floor(rng() * 20) + 5;
      const b = Math.floor(rng() * 20) + 5;
      const c = Math.floor(rng() * 5) + 2;
      const answer = (a + b) * c;
      const choices = new Set([answer]);
      while (choices.size < 4) choices.add(answer + Math.floor(rng() * 21) - 10);
      const arr = [...choices];
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return { prompt: `A box has ${a} red and ${b} blue marbles. Each marble is worth ${c} points. Total points?`, choices: arr, answer, hints: [{type:"gentle",text:"Add first, then multiply."},{type:"clue",text:`(${a}+${b})×${c}`},{type:"demonstration",text:`Total = ${answer}.`,narrate:`The total is ${answer}.`}] };
    }
    const total = (Math.floor(rng() * 9) + 2) * (Math.floor(rng() * 9) + 2);
    const divisor = Math.floor(rng() * 4) + 2;
    const dividend = total * divisor;
    const answer = total;
    const choices = new Set([answer]);
    while (choices.size < 4) choices.add(answer + Math.floor(rng() * 9) - 4);
    const arr = [...choices];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return { prompt: `${dividend} ÷ ${divisor} = ?`, choices: arr, answer, hints: [{type:"gentle",text:"Division undoes multiplication."},{type:"clue",text:`${divisor} × ? = ${dividend}`},{type:"demonstration",text:`Answer = ${answer}.`,narrate:`The answer is ${answer}.`}] };
  }
  validate(q) { return !!q && Array.isArray(q.choices) && q.choices.includes(q.answer) && new Set(q.choices).size === q.choices.length; }
}
export default MultiStepGenerator;
