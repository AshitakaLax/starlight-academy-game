import { QuestionGenerator, seededRng } from "../questionGenerator.js";
import { SKILL_IDS } from "../skillRegistry.js";

export class MultiplicationGenerator extends QuestionGenerator {
  constructor() {
    super({
      skillId: SKILL_IDS.MATH_MULT_FACTS_1_5,
      supportedTiers: ["Foundation", "Developing", "Core", "Stretch"],
      objective: "Multiplication facts 1-5 and skip counting",
      type: "mc",
    });
  }

  generate(seed, params = {}) {
    const rng = seededRng(seed);
    const tier = params.tier || "Core";
    const maxFactor = tier === "Foundation" ? 3 : tier === "Developing" ? 4 : 5;
    const a = Math.floor(rng() * maxFactor) + 1;
    const b = Math.floor(rng() * maxFactor) + 1;
    const answer = a * b;
    const distractors = new Set();
    while (distractors.size < 3) {
      const d = answer + Math.floor(rng() * 7) - 3;
      if (d !== answer && d >= 0) distractors.add(d);
    }
    const choices = [answer, ...distractors];
    // shuffle
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return {
      prompt: `What is ${a} × ${b}?`,
      choices,
      answer,
      hints: [
        { type: "gentle", text: "Try skip counting by " + a },
        { type: "clue", text: `${a} groups of ${b}` },
        { type: "demonstration", text: "Count: " + Array.from({ length: b }, (_, i) => a * (i + 1)).join(", "), narrate: `Count by ${a}: ${Array.from({ length: b }, (_, i) => a * (i + 1)).join(", ")}` },
      ],
      visual: { type: "array", rows: a, cols: b },
    };
  }

  validate(q) {
    if (!q || !Array.isArray(q.choices) || q.choices.length !== 4) return false;
    if (new Set(q.choices).size !== q.choices.length) return false;
    if (!q.choices.includes(q.answer)) return false;
    return true;
  }
}
export default MultiplicationGenerator;
