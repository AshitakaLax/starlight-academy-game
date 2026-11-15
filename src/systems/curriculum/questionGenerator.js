/**
 * Question generator contract. Implementations must be deterministic given
 * seed + params. Each generator declares metadata.
 */
export class QuestionGenerator {
  constructor(meta) {
    this.skillId = meta.skillId;
    this.supportedTiers = meta.supportedTiers || ["Foundation", "Developing", "Core", "Stretch"];
    this.objective = meta.objective || "";
    this.type = meta.type || "mc";
  }

  /**
   * Generate a question. Must be deterministic for same seed/params.
   * @param {number} seed
   * @param {object} params
   * @returns {object} question with { prompt, choices, answer, hints, ... }
   */
  generate(seed, params = {}) {
    throw new Error("generate() not implemented");
  }

  validate(question) {
    if (!question) return false;
    if (question.choices && new Set(question.choices).size !== question.choices.length) return false;
    return true;
  }
}

// Simple deterministic PRNG for generators
export function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
export default QuestionGenerator;
