import { QuestionGenerator, seededRng } from "../questionGenerator.js";
import { SKILL_IDS } from "../skillRegistry.js";

export class FractionPartsGenerator extends QuestionGenerator {
  constructor() {
    super({ skillId: SKILL_IDS.MATH_FRACTIONS_PARTS, supportedTiers: ["Foundation","Developing","Core","Stretch"], objective: "Identify fraction parts", type: "mc" });
  }
  generate(seed, params = {}) {
    const rng = seededRng(seed);
    const tier = params.tier || "Core";
    const maxDen = tier === "Foundation" ? 4 : tier === "Developing" ? 6 : 8;
    const den = Math.floor(rng() * (maxDen - 2)) + 2;
    const num = Math.floor(rng() * (den - 1)) + 1;
    const answer = `${num}/${den}`;
    const choices = new Set([answer]);
    while (choices.size < 4) {
      const n = Math.floor(rng() * (den - 1)) + 1;
      choices.add(`${n}/${den}`);
    }
    const arr = [...choices];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return {
      prompt: `A shape is divided into ${den} equal parts and ${num} are shaded. What fraction is shaded?`,
      choices: arr,
      answer,
      hints: [
        { type: "gentle", text: "Count shaded parts over total parts." },
        { type: "clue", text: `Shaded = ${num}, total = ${den}` },
        { type: "demonstration", text: `The fraction is ${num}/${den}.`, narrate: `The fraction is ${num} over ${den}.` },
      ],
      visual: { type: "fraction", num, den },
    };
  }
  validate(q) { return !!q && Array.isArray(q.choices) && q.choices.length === 4 && new Set(q.choices).size === 4 && q.choices.includes(q.answer); }
}

export class EquivalentFractionGenerator extends QuestionGenerator {
  constructor() {
    super({ skillId: SKILL_IDS.MATH_FRACTIONS_EQUIV, supportedTiers: ["Foundation","Developing","Core","Stretch"], objective: "Equivalent fractions", type: "mc" });
  }
  generate(seed, params = {}) {
    const rng = seededRng(seed);
    const baseNum = Math.floor(rng() * 4) + 1;
    const baseDen = Math.floor(rng() * 4) + 2;
    const factor = Math.floor(rng() * 3) + 2;
    const answer = `${baseNum * factor}/${baseDen * factor}`;
    const choices = new Set([answer]);
    // distractors: same numerator different den, etc.
    while (choices.size < 4) {
      const n = baseNum * (Math.floor(rng() * 3) + 1);
      const d = baseDen * (Math.floor(rng() * 3) + 1);
      if (`${n}/${d}` !== answer) choices.add(`${n}/${d}`);
    }
    const arr = [...choices];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return {
      prompt: `Which fraction is equivalent to ${baseNum}/${baseDen}?`,
      choices: arr,
      answer,
      hints: [
        { type: "gentle", text: "Multiply numerator and denominator by the same number." },
        { type: "clue", text: `Try multiplying by ${factor}.` },
        { type: "demonstration", text: `${baseNum}/${baseDen} = ${answer}.`, narrate: `${baseNum} over ${baseDen} equals ${answer}.` },
      ],
    };
  }
  validate(q) { return !!q && Array.isArray(q.choices) && q.choices.length === 4 && new Set(q.choices).size === 4 && q.choices.includes(q.answer); }
}
export default { FractionPartsGenerator, EquivalentFractionGenerator };
